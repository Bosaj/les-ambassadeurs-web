-- Applied to production (mimfwguttesvrmejlibq) on 2026-09-25 as "secure_admin_invite" (#129).
-- Lets the Admin Dashboard invite form promote an existing account, but only
-- when the caller is an admin holding the manage_admins permission.
create or replace function public.make_admin_by_email(target_email text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
  caller public.profiles%rowtype;
begin
  select * into caller from public.profiles where id = (select auth.uid());

  if caller.id is null
     or caller.role <> 'admin'
     or not (coalesce(caller.permissions, '[]'::jsonb) ? 'manage_admins'
             or caller.email = 'oussousselhadji@gmail.com') then
    raise exception 'Not authorized';
  end if;

  select id into target_id from auth.users where lower(email) = lower(trim(target_email));

  if target_id is null then
    return json_build_object('success', false, 'message', 'User not found');
  end if;

  update public.profiles
  set role = 'admin', request_status = 'approved'
  where id = target_id;

  return json_build_object('success', true, 'message', 'User promoted to admin', 'user_id', target_id);
end;
$$;

revoke all on function public.make_admin_by_email(text) from public, anon;
grant execute on function public.make_admin_by_email(text) to authenticated;
