-- Data standards, admin access fixes, admin overview, admins on the leaderboard (#135)

------------------------------------------------------------------------------
-- 1. Clean existing data so it fits the standards
------------------------------------------------------------------------------
-- Registrations made by email: link them to the member account with that email
update public.event_attendees a
set user_id = p.id
from public.profiles p
where a.user_id is null and a.email is not null and lower(a.email) = lower(p.email);

-- Membership payments recorded by an admin without a method
update public.annual_memberships set payment_method = 'manual' where payment_method is null;

update public.profiles set membership_status = 'none' where membership_status is null;
update public.profiles set payment_status = 'unpaid' where payment_status is null;
update public.profiles set request_status = 'none' where request_status is null;
update public.profiles set role = 'volunteer' where role is null;
update public.profiles set points = 0 where points is null;
update public.profiles set badges = '[]'::jsonb where badges is null or jsonb_typeof(badges) <> 'array';
update public.profiles set is_active = true where is_active is null;
update public.event_attendees set status = 'pending' where status is null;
update public.donations set status = 'pending' where status is null;
update public.annual_memberships set status = 'pending' where status is null;
update public.event_suggestions set status = 'pending' where status is null;
update public.problem_reports set status = 'open' where status is null;
update public.testimonials set is_approved = false where is_approved is null;

------------------------------------------------------------------------------
-- 2. Defaults and allowed values
------------------------------------------------------------------------------
alter table public.profiles
  alter column role set default 'volunteer',
  alter column membership_status set default 'none',
  alter column payment_status set default 'unpaid',
  alter column request_status set default 'none',
  alter column is_active set default true,
  alter column role set not null,
  alter column points set not null,
  alter column badges set not null;
alter table public.event_attendees alter column status set default 'pending', alter column status set not null;
alter table public.donations alter column status set default 'pending', alter column status set not null;
alter table public.annual_memberships alter column status set default 'pending', alter column status set not null;
alter table public.event_suggestions alter column status set default 'pending', alter column status set not null;
alter table public.problem_reports alter column status set default 'open', alter column status set not null;
alter table public.testimonials alter column is_approved set default false;

do $$
declare c record;
begin
  for c in select * from (values
    ('profiles', 'profiles_role_chk', 'role in (''volunteer'', ''member'', ''admin'')'),
    ('profiles', 'profiles_membership_status_chk', 'membership_status in (''none'', ''pending'', ''active'', ''rejected'', ''expired'')'),
    ('profiles', 'profiles_payment_status_chk', 'payment_status in (''unpaid'', ''paid'')'),
    ('profiles', 'profiles_request_status_chk', 'request_status in (''none'', ''pending'', ''approved'', ''denied'')'),
    ('profiles', 'profiles_points_chk', 'points >= 0'),
    ('event_attendees', 'event_attendees_status_chk', 'status in (''pending'', ''confirmed'', ''attended'', ''rejected'')'),
    ('donations', 'donations_status_chk', 'status in (''pending'', ''verified'', ''rejected'')'),
    ('donations', 'donations_amount_chk', 'amount > 0'),
    ('annual_memberships', 'annual_memberships_status_chk', 'status in (''pending'', ''paid'', ''rejected'')'),
    ('annual_memberships', 'annual_memberships_amount_chk', 'amount is null or amount > 0'),
    ('annual_memberships', 'annual_memberships_method_chk', 'payment_method is null or payment_method in (''stripe'', ''online'', ''paypal'', ''bank'', ''cash'', ''manual'')'),
    ('event_suggestions', 'event_suggestions_status_chk', 'status in (''pending'', ''approved'', ''rejected'')'),
    ('problem_reports', 'problem_reports_status_chk', 'status in (''open'', ''in_progress'', ''resolved'', ''closed'')'),
    ('events', 'events_category_chk', 'category is null or category in (''event'', ''project'', ''program'')'),
    ('testimonials', 'testimonials_rating_chk', 'rating is null or rating between 1 and 5')
  ) as t(tbl, name, expr) loop
    if not exists (select 1 from pg_constraint where conname = c.name) then
      execute format('alter table public.%I add constraint %I check (%s)', c.tbl, c.name, c.expr);
    end if;
  end loop;
end $$;

------------------------------------------------------------------------------
-- 3. Admin access that was missing
------------------------------------------------------------------------------
-- Testimonials: admins must see and remove pending ones; members cannot self-approve
drop policy if exists "Admins can view all testimonials" on public.testimonials;
create policy "Admins can view all testimonials" on public.testimonials
  for select to authenticated using (private.is_admin());
drop policy if exists "Admins can delete testimonials" on public.testimonials;
create policy "Admins can delete testimonials" on public.testimonials
  for delete to authenticated using (private.is_admin());

create or replace function private.guard_testimonial_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not private.is_admin() then new.is_approved := false; end if;
  return new;
end; $$;
drop trigger if exists guard_testimonial_insert on public.testimonials;
create trigger guard_testimonial_insert before insert on public.testimonials
  for each row execute function private.guard_testimonial_insert();

-- Event suggestions: admins review them
drop policy if exists "Admins can view suggestions" on public.event_suggestions;
create policy "Admins can view suggestions" on public.event_suggestions
  for select to authenticated using (private.is_admin());
drop policy if exists "Admins can update suggestions" on public.event_suggestions;
create policy "Admins can update suggestions" on public.event_suggestions
  for update to authenticated using (private.is_admin()) with check (private.is_admin());
drop policy if exists "Admins can delete suggestions" on public.event_suggestions;
create policy "Admins can delete suggestions" on public.event_suggestions
  for delete to authenticated using (private.is_admin());

-- Problem reports: admins can clean up
drop policy if exists "Admins can delete reports" on public.problem_reports;
create policy "Admins can delete reports" on public.problem_reports
  for delete to authenticated using (private.is_admin());

------------------------------------------------------------------------------
-- 4. Admin overview (single round trip, admin only)
------------------------------------------------------------------------------
create or replace function public.get_admin_overview()
returns json language plpgsql stable security definer set search_path = public as $$
declare y int := extract(year from now())::int;
begin
  if not private.is_admin() then raise exception 'Only admins can view the overview'; end if;
  return json_build_object(
    'members', json_build_object(
      'total', (select count(*) from profiles),
      'new_30d', (select count(*) from profiles where created_at >= now() - interval '30 days'),
      'volunteers', (select count(*) from profiles where role = 'volunteer'),
      'members', (select count(*) from profiles where role = 'member'),
      'admins', (select count(*) from profiles where role = 'admin'),
      'paid_this_year', (select count(distinct user_id) from annual_memberships where year = y and status = 'paid')
    ),
    'money', json_build_object(
      'memberships_this_year', (select coalesce(sum(amount), 0) from annual_memberships where year = y and status = 'paid'),
      'donations_verified', (select coalesce(sum(amount), 0) from donations where status = 'verified'),
      'donations_verified_this_year', (select coalesce(sum(amount), 0) from donations where status = 'verified' and created_at >= date_trunc('year', now()))
    ),
    'events', json_build_object(
      'upcoming', (select count(*) from events where date >= now()),
      'past', (select count(*) from events where date < now()),
      'registrations', (select count(*) from event_attendees),
      'confirmed', (select count(*) from event_attendees where status in ('confirmed', 'attended'))
    ),
    'todo', json_build_object(
      'attendance_to_confirm', (select count(*) from event_attendees a join events e on e.id = a.event_id
                                where a.status = 'pending' and e.date < now()),
      'registrations_pending', (select count(*) from event_attendees where status = 'pending'),
      'membership_requests', (select count(*) from profiles where membership_status = 'pending'),
      'membership_payments', (select count(*) from annual_memberships where status = 'pending'),
      'admin_requests', (select count(*) from profiles where request_status = 'pending'),
      'donations', (select count(*) from donations where status = 'pending'),
      'testimonials', (select count(*) from testimonials where not is_approved),
      'suggestions', (select count(*) from event_suggestions where status = 'pending'),
      'reports', (select count(*) from problem_reports where status in ('open', 'in_progress'))
    ),
    'gamification', json_build_object(
      'points_awarded', (select coalesce(sum(amount), 0) from point_history),
      'badges_earned', (select coalesce(sum(jsonb_array_length(badges)), 0) from profiles)
    )
  );
end; $$;
revoke all on function public.get_admin_overview() from public, anon;
grant execute on function public.get_admin_overview() to authenticated;

------------------------------------------------------------------------------
-- 5. Leaderboard: admins take part too (tagged), everyone inactive is hidden
------------------------------------------------------------------------------
drop function if exists public.get_leaderboard(text, int);
create function public.get_leaderboard(p_period text default 'all', p_limit int default 10)
returns table (rank bigint, user_id uuid, display_name text, display_name_ar text, avatar_url text,
               points bigint, badge_count int, is_me boolean, role text)
language sql stable security definer set search_path = public as $$
  with scores as (
    select p.id, p.full_name, p.full_name_ar, p.username, p.avatar_url, p.badges, p.role,
           case when p_period = 'month'
                then (select coalesce(sum(h.amount), 0) from public.point_history h
                      where h.user_id = p.id and h.created_at >= date_trunc('month', now()))
                else coalesce(p.points, 0)::bigint end as score
    from public.profiles p
    where coalesce(p.is_active, true)
  )
  select rank() over (order by score desc) as rank, id,
         case when id = (select auth.uid()) then coalesce(nullif(trim(full_name), ''), username, 'Me')
              else coalesce(
                     nullif(split_part(trim(coalesce(full_name, '')), ' ', 1) ||
                       case when position(' ' in trim(coalesce(full_name, ''))) > 0
                            then ' ' || left(split_part(trim(full_name), ' ', 2), 1) || '.' else '' end, ''),
                     username, 'Volunteer') end,
         case when coalesce(full_name_ar, '') = '' then null
              when id = (select auth.uid()) then full_name_ar
              else split_part(trim(full_name_ar), ' ', 1) end,
         avatar_url, score,
         coalesce(jsonb_array_length(case when jsonb_typeof(badges) = 'array' then badges end), 0),
         id = (select auth.uid()),
         role
  from scores where score > 0
  order by score desc, id
  limit least(greatest(p_limit, 1), 50);
$$;
revoke all on function public.get_leaderboard(text, int) from public, anon;
grant execute on function public.get_leaderboard(text, int) to authenticated;

create or replace function public.get_my_progress()
returns json language plpgsql stable security definer set search_path = public as $$
declare uid uuid := (select auth.uid()); s record; my_rank bigint;
begin
  if uid is null then raise exception 'Not signed in'; end if;
  select * into s from private.user_stats(uid);
  select r.rank into my_rank from (
    select id, rank() over (order by coalesce(points, 0) desc) as rank
    from public.profiles
    where coalesce(is_active, true) and coalesce(points, 0) > 0
  ) r where r.id = uid;
  return json_build_object(
    'points', s.points, 'events', s.events, 'donations', s.donations,
    'membership_years', s.membership_years, 'rank', my_rank,
    'badges', (select coalesce(badges, '[]'::jsonb) from public.profiles where id = uid),
    'history', (select coalesce(json_agg(h order by h.created_at desc), '[]'::json) from (
                  select ph.amount, ph.action_type, ph.description, ph.created_at,
                         ph.source_type, ph.source_id,
                         case when ph.source_type = 'event' then e.title end as event_title
                  from public.point_history ph
                  left join public.events e
                    on ph.source_type = 'event' and e.id::text = ph.source_id
                  where ph.user_id = uid
                  order by ph.created_at desc limit 20) h));
end; $$;
