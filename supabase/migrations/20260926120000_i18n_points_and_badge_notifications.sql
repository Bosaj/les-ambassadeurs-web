-- Structured data so the UI can translate point history and badge notifications (#133)
-- Applied to production as "i18n_points_and_badge_notifications".
alter table public.notifications add column if not exists meta jsonb;

create or replace function private.refresh_badges(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  s record; current_badges jsonb; earned jsonb := '[]'::jsonb; b record; prev jsonb;
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
        insert into public.notifications (user_id, type, title, message, link, meta)
        values (p_user, 'success', 'New badge: ' || coalesce(b.name_i18n->>'en', b.name),
                coalesce(b.description_i18n->>'en', b.description), '/gamification',
                jsonb_build_object('kind', 'badge', 'badge_id', b.id,
                                   'name', b.name_i18n, 'description', b.description_i18n));
      end if;
      earned := earned || jsonb_build_array(prev);
    end if;
  end loop;
  perform set_config('app.trusted', 'on', true);
  update public.profiles set badges = earned where id = p_user;
end; $$;

-- Backfill meta on badge notifications already sent
update public.notifications n
set meta = jsonb_build_object('kind', 'badge', 'badge_id', b.id, 'name', b.name_i18n, 'description', b.description_i18n)
from public.badge_definitions b
where n.meta is null and n.title = 'New badge: ' || coalesce(b.name_i18n->>'en', b.name);

create or replace function public.get_my_progress()
returns json language plpgsql stable security definer set search_path = public as $$
declare uid uuid := (select auth.uid()); s record; my_rank bigint;
begin
  if uid is null then raise exception 'Not signed in'; end if;
  select * into s from private.user_stats(uid);
  select r.rank into my_rank from (
    select id, rank() over (order by coalesce(points, 0) desc) as rank
    from public.profiles
    where coalesce(role, 'volunteer') <> 'admin' and coalesce(is_active, true) and coalesce(points, 0) > 0
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
