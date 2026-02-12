-- Create problem_reports table
create table if not exists public.problem_reports (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete set null,
    subject text not null,
    description text not null,
    email text, -- For guest users or manual entry
    status text default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.problem_reports enable row level security;

-- Policies
-- Users can insert their own reports
create policy "Users can insert their own reports"
on public.problem_reports for insert
to authenticated
with check (true);

-- Guests can insert reports (if we allow it, e.g. for login issues)
create policy "Guests can insert reports"
on public.problem_reports for insert
to anon
with check (true);

-- Users can view their own reports
create policy "Users can view their own reports"
on public.problem_reports for select
to authenticated
using (auth.uid() = user_id);

-- Admins can view all reports
create policy "Admins can view all reports"
on public.problem_reports for select
to authenticated
using (
    exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
);

-- Admins can update reports
create policy "Admins can update reports"
on public.problem_reports for update
to authenticated
using (
    exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
);
