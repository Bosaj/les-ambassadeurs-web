-- Owner request (2026-09-27): both of Marouane Loucif's Google accounts are admins
-- with the same title and permissions. Applied as "grant_admin_marwan_second_account".
update public.profiles as p
set role = 'admin',
    request_status = 'approved',
    admin_title = src.admin_title,
    permissions = src.permissions,
    is_active = true
from (select admin_title, permissions from public.profiles where lower(email) = 'loussifmarwan73@gmail.com') as src
where lower(p.email) = 'marwanloussif39@gmail.com';
