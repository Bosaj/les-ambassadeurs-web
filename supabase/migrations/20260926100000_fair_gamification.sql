-- Fair, automatic gamification + profile security fix (#131)
--
-- * Security: members could update any column of their own profile
--   (points, badges, role, permissions => self-promotion to admin) and their
--   own membership rows. Guard triggers now block that.
-- * Points are granted automatically, once, from admin-verified actions and
--   revoked if the verification is undone. Round values:
--     event participation confirmed +20, verified donation +10,
--     annual membership paid +50, admin recognition 10..100 (or -10..-100).
-- * Badges are earned from real milestones instead of being "claimed".
-- * Existing members are credited for everything they already qualify for.

------------------------------------------------------------------------------
-- 0. Helper
------------------------------------------------------------------------------
create or replace function private.is_trusted()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  -- System context (signup trigger, service role), an admin, or one of the
  -- gamification functions below that set app.trusted for their transaction.
  select (select auth.uid()) is null
      or coalesce(current_setting('app.trusted', true), '') = 'on'
      or private.is_admin();
$$;

------------------------------------------------------------------------------
-- 1. Security guards
------------------------------------------------------------------------------
create or replace function private.guard_profile_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if private.is_trusted() then
    return new;
  end if;

  -- Only admins / the system may change these
  new.role        := old.role;
  new.permissions := old.permissions;
  new.points      := old.points;
  new.badges      := old.badges;
  new.is_active   := old.is_active;

  -- Members may only *request* membership or admin access, never approve it
  if new.membership_status is distinct from old.membership_status and new.membership_status <> 'pending' then
    new.membership_status := old.membership_status;
  end if;
  if new.payment_status is distinct from old.payment_status and new.payment_status <> 'unpaid' then
    new.payment_status := old.payment_status;
  end if;
  if new.request_status is distinct from old.request_status and new.request_status <> 'pending' then
    new.request_status := old.request_status;
  end if;

  return new;
end;
$$;

drop trigger if exists guard_profile_update on public.profiles;
create trigger guard_profile_update
  before update on public.profiles
  for each row execute function private.guard_profile_update();

create or replace function private.guard_profile_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not private.is_trusted() then
    new.role := 'volunteer';
    new.permissions := null;
    new.points := 0;
    new.badges := '[]'::jsonb;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_profile_insert on public.profiles;
create trigger guard_profile_insert
  before insert on public.profiles
  for each row execute function private.guard_profile_insert();

-- Membership rows: only admins may edit them after creation
drop policy if exists "Admins and users can update memberships" on public.annual_memberships;
drop policy if exists "Admins can update memberships" on public.annual_memberships;
create policy "Admins can update memberships" on public.annual_memberships
  for update to authenticated
  using (private.is_admin()) with check (private.is_admin());

-- Public donations and event registrations always start as pending;
-- only an admin verifies/confirms them (which is what earns points).
create or replace function private.guard_pending_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not private.is_admin() then
    new.status := 'pending';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_donation_insert on public.donations;
create trigger guard_donation_insert
  before insert on public.donations
  for each row execute function private.guard_pending_insert();

drop trigger if exists guard_attendee_insert on public.event_attendees;
create trigger guard_attendee_insert
  before insert on public.event_attendees
  for each row execute function private.guard_pending_insert();

------------------------------------------------------------------------------
-- 2. Point ledger (idempotent, keyed by source)
------------------------------------------------------------------------------
alter table public.point_history add column if not exists source_type text;
alter table public.point_history add column if not exists source_id text;
create unique index if not exists point_history_source_uniq
  on public.point_history (user_id, source_type, source_id)
  where source_id is not null;

alter table public.profiles alter column points set default 0;
alter table public.profiles alter column badges set default '[]'::jsonb;

------------------------------------------------------------------------------
-- 3. Badges from real milestones
------------------------------------------------------------------------------
alter table public.badge_definitions add column if not exists criteria_type text;
alter table public.badge_definitions add column if not exists threshold int;
alter table public.badge_definitions add column if not exists name_i18n jsonb;
alter table public.badge_definitions add column if not exists description_i18n jsonb;
alter table public.badge_definitions add column if not exists sort_order int default 0;

delete from public.badge_definitions
where id in ('active_member', 'participant', 'donor', 'veteran');

insert into public.badge_definitions
  (id, name, description, points_required, icon, category, criteria_type, threshold, sort_order, name_i18n, description_i18n)
values
  ('first_event', 'First Step', 'Took part in your first event.', 0, 'FaCalendarCheck', 'event', 'events', 1, 10,
   '{"ar":"الخطوة الأولى","en":"First Step","fr":"Premier pas"}',
   '{"ar":"شارك في أول نشاط لك.","en":"Took part in your first event.","fr":"A participé à son premier événement."}'),
  ('regular_volunteer', 'Regular Volunteer', 'Took part in 5 events.', 0, 'FaUsers', 'event', 'events', 5, 20,
   '{"ar":"متطوع منتظم","en":"Regular Volunteer","fr":"Bénévole régulier"}',
   '{"ar":"شارك في 5 أنشطة.","en":"Took part in 5 events.","fr":"A participé à 5 événements."}'),
  ('community_pillar', 'Community Pillar', 'Took part in 20 events.', 0, 'FaShieldAlt', 'event', 'events', 20, 30,
   '{"ar":"ركيزة المجتمع","en":"Community Pillar","fr":"Pilier de la communauté"}',
   '{"ar":"شارك في 20 نشاطاً.","en":"Took part in 20 events.","fr":"A participé à 20 événements."}'),
  ('supporter', 'Supporter', 'Made a verified donation.', 0, 'FaHandHoldingHeart', 'donation', 'donations', 1, 40,
   '{"ar":"داعم","en":"Supporter","fr":"Soutien"}',
   '{"ar":"قدّم تبرعاً تم التحقق منه.","en":"Made a verified donation.","fr":"A fait un don vérifié."}'),
  ('official_member', 'Official Member', 'Paid an annual membership.', 0, 'FaCheckCircle', 'community', 'membership_years', 1, 50,
   '{"ar":"عضو رسمي","en":"Official Member","fr":"Membre officiel"}',
   '{"ar":"أدّى واجب الانخراط السنوي.","en":"Paid an annual membership.","fr":"A réglé une cotisation annuelle."}'),
  ('loyal_member', 'Loyal Member', 'Member for 3 years.', 0, 'FaMedal', 'community', 'membership_years', 3, 60,
   '{"ar":"عضو وفي","en":"Loyal Member","fr":"Membre fidèle"}',
   '{"ar":"عضو لمدة 3 سنوات.","en":"Member for 3 years.","fr":"Membre depuis 3 ans."}'),
  ('rising_star', 'Rising Star', 'Reached 200 points.', 200, 'FaRocket', 'points', 'points', 200, 70,
   '{"ar":"نجم صاعد","en":"Rising Star","fr":"Étoile montante"}',
   '{"ar":"بلغ 200 نقطة.","en":"Reached 200 points.","fr":"A atteint 200 points."}'),
  ('ambassador_of_good', 'Ambassador of Good', 'Reached 1000 points.', 1000, 'FaCrown', 'points', 'points', 1000, 80,
   '{"ar":"سفير الخير","en":"Ambassador of Good","fr":"Ambassadeur du Bien"}',
   '{"ar":"بلغ 1000 نقطة.","en":"Reached 1000 points.","fr":"A atteint 1000 points."}')
on conflict (id) do update set
  name = excluded.name, description = excluded.description, points_required = excluded.points_required,
  icon = excluded.icon, category = excluded.category, criteria_type = excluded.criteria_type,
  threshold = excluded.threshold, sort_order = excluded.sort_order,
  name_i18n = excluded.name_i18n, description_i18n = excluded.description_i18n;

create or replace function private.user_stats(p_user uuid)
returns table (events int, donations int, membership_years int, points int)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*)::int from public.point_history where user_id = p_user and source_type = 'event'),
    (select count(*)::int from public.point_history where user_id = p_user and source_type = 'donation'),
    (select count(*)::int from public.point_history where user_id = p_user and source_type = 'membership'),
    (select coalesce(points, 0) from public.profiles where id = p_user);
$$;

create or replace function private.refresh_badges(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  s record;
  current_badges jsonb;
  earned jsonb := '[]'::jsonb;
  b record;
  prev jsonb;
begin
  if p_user is null then return; end if;
  select * into s from private.user_stats(p_user);
  select coalesce(badges, '[]'::jsonb) into current_badges from public.profiles where id = p_user;
  if current_badges is null or jsonb_typeof(current_badges) <> 'array' then current_badges := '[]'::jsonb; end if;

  for b in select * from public.badge_definitions where criteria_type is not null order by sort_order loop
    if (b.criteria_type = 'events' and s.events >= b.threshold)
       or (b.criteria_type = 'donations' and s.donations >= b.threshold)
       or (b.criteria_type = 'membership_years' and s.membership_years >= b.threshold)
       or (b.criteria_type = 'points' and s.points >= b.threshold) then

      prev := null;
      select x into prev from jsonb_array_elements(current_badges) x where x->>'id' = b.id limit 1;
      if prev is null then
        prev := jsonb_build_object('id', b.id, 'claimed_at', now());
        insert into public.notifications (user_id, type, title, message, link)
        values (p_user, 'success',
                'New badge: ' || coalesce(b.name_i18n->>'en', b.name),
                coalesce(b.description_i18n->>'en', b.description),
                '/gamification');
      end if;
      earned := earned || jsonb_build_array(prev);
    end if;
  end loop;

  perform set_config('app.trusted', 'on', true);
  update public.profiles set badges = earned where id = p_user;
end;
$$;

create or replace function private.grant_points(
  p_user uuid, p_amount int, p_action text, p_description text,
  p_source_type text, p_source_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted int;
begin
  if p_user is null or p_amount = 0 then
    return false;
  end if;

  insert into public.point_history (user_id, amount, action_type, description, source_type, source_id)
  values (p_user, p_amount, p_action, p_description, p_source_type, p_source_id)
  on conflict (user_id, source_type, source_id) where source_id is not null do nothing;
  get diagnostics inserted = row_count;

  if inserted > 0 then
    perform set_config('app.trusted', 'on', true);
    update public.profiles set points = greatest(coalesce(points, 0) + p_amount, 0) where id = p_user;
    perform private.refresh_badges(p_user);
  end if;
  return inserted > 0;
end;
$$;

create or replace function private.revoke_points(p_user uuid, p_source_type text, p_source_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  removed int;
begin
  if p_user is null then return; end if;

  delete from public.point_history
  where user_id = p_user and source_type = p_source_type and source_id = p_source_id
  returning amount into removed;

  if removed is not null then
    perform set_config('app.trusted', 'on', true);
    update public.profiles set points = greatest(coalesce(points, 0) - removed, 0) where id = p_user;
    perform private.refresh_badges(p_user);
  end if;
end;
$$;

-- Badges are awarded automatically now
drop function if exists public.claim_badge(text);

------------------------------------------------------------------------------
-- 4. Automatic point rules
------------------------------------------------------------------------------
-- Event participation confirmed by an admin: +20 (registering alone earns nothing)
create or replace function private.points_event_attendance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
  ev_title text;
begin
  if tg_op = 'DELETE' then
    uid := coalesce(old.user_id, (select id from public.profiles where lower(email) = lower(old.email) limit 1));
    perform private.revoke_points(uid, 'event', old.event_id::text);
    return old;
  end if;

  uid := coalesce(new.user_id, (select id from public.profiles where lower(email) = lower(new.email) limit 1));
  if new.status in ('confirmed', 'attended') then
    select coalesce(title->>'en', title->>'fr', title->>'ar') into ev_title
    from public.events where id = new.event_id;
    perform private.grant_points(uid, 20, 'event', 'Event participation: ' || coalesce(ev_title, 'event'),
                                 'event', new.event_id::text);
  elsif tg_op = 'UPDATE' and old.status in ('confirmed', 'attended') then
    perform private.revoke_points(uid, 'event', new.event_id::text);
  end if;
  return new;
end;
$$;

drop trigger if exists points_event_attendance on public.event_attendees;
create trigger points_event_attendance
  after insert or update of status or delete on public.event_attendees
  for each row execute function private.points_event_attendance();

-- Donation verified by an admin: flat +10 (the amount does not buy rank)
create or replace function private.points_donation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
begin
  if tg_op = 'DELETE' then
    uid := coalesce(old.user_id, (select id from public.profiles where lower(email) = lower(old.email) limit 1));
    perform private.revoke_points(uid, 'donation', old.id::text);
    return old;
  end if;

  uid := coalesce(new.user_id, (select id from public.profiles where lower(email) = lower(new.email) limit 1));
  if new.status = 'verified' then
    perform private.grant_points(uid, 10, 'donation', 'Verified donation', 'donation', new.id::text);
  elsif tg_op = 'UPDATE' and old.status = 'verified' then
    perform private.revoke_points(uid, 'donation', new.id::text);
  end if;
  return new;
end;
$$;

drop trigger if exists points_donation on public.donations;
create trigger points_donation
  after insert or update of status or delete on public.donations
  for each row execute function private.points_donation();

-- Annual membership paid: +50 once per year
create or replace function private.points_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform private.revoke_points(old.user_id, 'membership', old.year::text);
    return old;
  end if;

  if new.status = 'paid' then
    perform private.grant_points(new.user_id, 50, 'membership', 'Annual membership ' || new.year,
                                 'membership', new.year::text);
  elsif tg_op = 'UPDATE' and old.status = 'paid' then
    perform private.revoke_points(new.user_id, 'membership', new.year::text);
  end if;
  return new;
end;
$$;

drop trigger if exists points_membership on public.annual_memberships;
create trigger points_membership
  after insert or update of status or delete on public.annual_memberships
  for each row execute function private.points_membership();

-- Manual recognition by an admin: round amount 10..100, justified, never to oneself
create or replace function public.award_points(p_user_id uuid, p_amount integer, p_description text, p_action_type text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not private.is_admin() then
    raise exception 'Only admins can award points';
  end if;
  if p_user_id = (select auth.uid()) then
    raise exception 'Admins cannot award points to themselves';
  end if;
  if p_amount is null or abs(p_amount) < 10 or abs(p_amount) > 100 or p_amount % 10 <> 0 then
    raise exception 'Amount must be a multiple of 10 between 10 and 100 (or -10 and -100)';
  end if;
  if coalesce(length(trim(p_description)), 0) < 3 then
    raise exception 'A reason is required';
  end if;

  perform private.grant_points(p_user_id, p_amount, coalesce(nullif(p_action_type, ''), 'recognition'),
                               trim(p_description), 'manual', gen_random_uuid()::text);
end;
$$;

revoke all on function public.award_points(uuid, integer, text, text) from public, anon;
grant execute on function public.award_points(uuid, integer, text, text) to authenticated;

------------------------------------------------------------------------------
-- 5. Read APIs for the hub (no emails/phones exposed)
------------------------------------------------------------------------------
create or replace function public.get_leaderboard(p_period text default 'all', p_limit int default 10)
returns table (rank bigint, user_id uuid, display_name text, display_name_ar text, avatar_url text,
               points bigint, badge_count int, is_me boolean)
language sql
stable
security definer
set search_path = public
as $$
  with scores as (
    select p.id, p.full_name, p.full_name_ar, p.username, p.avatar_url, p.badges,
           case when p_period = 'month'
                then (select coalesce(sum(h.amount), 0) from public.point_history h
                      where h.user_id = p.id and h.created_at >= date_trunc('month', now()))
                else coalesce(p.points, 0)::bigint end as score
    from public.profiles p
    where coalesce(p.role, 'volunteer') <> 'admin' and coalesce(p.is_active, true)
  )
  select rank() over (order by score desc) as rank,
         id,
         -- "Firstname L." for everyone except yourself
         case when id = (select auth.uid()) then coalesce(nullif(trim(full_name), ''), username, 'Me')
              else coalesce(
                     nullif(split_part(trim(coalesce(full_name, '')), ' ', 1) ||
                       case when position(' ' in trim(coalesce(full_name, ''))) > 0
                            then ' ' || left(split_part(trim(full_name), ' ', 2), 1) || '.' else '' end, ''),
                     username, 'Volunteer') end,
         case when coalesce(full_name_ar, '') = '' then null
              when id = (select auth.uid()) then full_name_ar
              else split_part(trim(full_name_ar), ' ', 1) end,
         avatar_url,
         score,
         coalesce(jsonb_array_length(case when jsonb_typeof(badges) = 'array' then badges end), 0),
         id = (select auth.uid())
  from scores
  where score > 0
  order by score desc, id
  limit least(greatest(p_limit, 1), 50);
$$;

create or replace function public.get_my_progress()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := (select auth.uid());
  s record;
  my_rank bigint;
begin
  if uid is null then
    raise exception 'Not signed in';
  end if;
  select * into s from private.user_stats(uid);

  select r.rank into my_rank from (
    select id, rank() over (order by coalesce(points, 0) desc) as rank
    from public.profiles
    where coalesce(role, 'volunteer') <> 'admin' and coalesce(is_active, true) and coalesce(points, 0) > 0
  ) r where r.id = uid;

  return json_build_object(
    'points', s.points,
    'events', s.events,
    'donations', s.donations,
    'membership_years', s.membership_years,
    'rank', my_rank,
    'badges', (select coalesce(badges, '[]'::jsonb) from public.profiles where id = uid),
    'history', (select coalesce(json_agg(h order by h.created_at desc), '[]'::json) from (
                  select amount, action_type, description, created_at
                  from public.point_history where user_id = uid
                  order by created_at desc limit 20) h)
  );
end;
$$;

revoke all on function public.get_leaderboard(text, int) from public, anon;
revoke all on function public.get_my_progress() from public, anon;
grant execute on function public.get_leaderboard(text, int) to authenticated;
grant execute on function public.get_my_progress() to authenticated;

------------------------------------------------------------------------------
-- 6. Credit existing members for what they already qualify for
------------------------------------------------------------------------------
select private.grant_points(
         coalesce(a.user_id, (select id from public.profiles p where lower(p.email) = lower(a.email) limit 1)),
         20, 'event', 'Event participation', 'event', a.event_id::text)
from public.event_attendees a
where a.status in ('confirmed', 'attended');

select private.grant_points(
         coalesce(d.user_id, (select id from public.profiles p where lower(p.email) = lower(d.email) limit 1)),
         10, 'donation', 'Verified donation', 'donation', d.id::text)
from public.donations d
where d.status = 'verified';

select private.grant_points(m.user_id, 50, 'membership', 'Annual membership ' || m.year, 'membership', m.year::text)
from public.annual_memberships m
where m.status = 'paid';

select private.refresh_badges(id) from public.profiles;
