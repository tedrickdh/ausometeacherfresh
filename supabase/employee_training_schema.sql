-- Employee-only training tracker. Review before applying to the intended Supabase project.
create table if not exists public.training_staff (
 user_id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null,
 role text not null default 'employee' check (role in ('employee','admin')),
 active boolean not null default true,
 created_at timestamptz not null default now()
);
create table if not exists public.training_courses (
 id text primary key,
 title text not null,
 pass_score integer not null default 80 check (pass_score between 0 and 100),
 max_attempts integer not null default 3 check (max_attempts > 0)
);
insert into public.training_courses(id,title) values
 ('beyond-the-behavior-plan','Beyond the Behavior Plan: Ethical Decisions, Clinical Judgment & Culturally Responsive ABA')
on conflict (id) do nothing;
create table if not exists public.training_assignments (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.training_staff(user_id) on delete cascade,
 course_id text not null references public.training_courses(id),
 assigned_by uuid references public.training_staff(user_id),
 assigned_at timestamptz not null default now(),
 due_at timestamptz,
 completed_at timestamptz,
 unique(user_id,course_id)
);
create table if not exists public.training_progress (
 assignment_id uuid not null references public.training_assignments(id) on delete cascade,
 module_number integer not null check (module_number between 1 and 6),
 screen_number integer not null check (screen_number between 1 and 100),
 updated_at timestamptz not null default now(),
 primary key(assignment_id,module_number)
);
create table if not exists public.training_attempts (
 id uuid primary key default gen_random_uuid(),
 assignment_id uuid not null references public.training_assignments(id) on delete cascade,
 score integer not null check(score between 0 and 100),
 passed boolean not null,
 submitted_at timestamptz not null default now()
);
create table if not exists public.training_certificates (
 id uuid primary key default gen_random_uuid(),
 assignment_id uuid not null unique references public.training_assignments(id) on delete cascade,
 attempt_id uuid not null unique references public.training_attempts(id),
 issued_at timestamptz not null default now()
);
create index if not exists training_assignments_user_idx on public.training_assignments(user_id);
create index if not exists training_attempts_assignment_idx on public.training_attempts(assignment_id);
alter table public.training_staff enable row level security;
alter table public.training_courses enable row level security;
alter table public.training_assignments enable row level security;
alter table public.training_progress enable row level security;
alter table public.training_attempts enable row level security;
alter table public.training_certificates enable row level security;
-- Admin role comes from immutable server-managed auth.app_metadata, never editable user_metadata.
create policy "staff own record or admin" on public.training_staff for select to authenticated
 using (user_id=(select auth.uid()) or ((select auth.jwt())->'app_metadata'->>'training_admin')='true');
create policy "staff courses" on public.training_courses for select to authenticated using
 (exists(select 1 from public.training_staff s where s.user_id=(select auth.uid()) and s.active));
create policy "assignments read" on public.training_assignments for select to authenticated using
 (user_id=(select auth.uid()) or ((select auth.jwt())->'app_metadata'->>'training_admin')='true');
create policy "assignments admin insert" on public.training_assignments for insert to authenticated with check
 (((select auth.jwt())->'app_metadata'->>'training_admin')='true');
create policy "assignments admin update" on public.training_assignments for update to authenticated
 using (((select auth.jwt())->'app_metadata'->>'training_admin')='true')
 with check (((select auth.jwt())->'app_metadata'->>'training_admin')='true');
create policy "progress read" on public.training_progress for select to authenticated using
 (exists(select 1 from public.training_assignments a where a.id=assignment_id and
 (a.user_id=(select auth.uid()) or ((select auth.jwt())->'app_metadata'->>'training_admin')='true')));
create policy "progress own insert" on public.training_progress for insert to authenticated with check
 (exists(select 1 from public.training_assignments a where a.id=assignment_id and a.user_id=(select auth.uid())));
create policy "progress own update" on public.training_progress for update to authenticated using
 (exists(select 1 from public.training_assignments a where a.id=assignment_id and a.user_id=(select auth.uid())))
 with check (exists(select 1 from public.training_assignments a where a.id=assignment_id and a.user_id=(select auth.uid())));
create policy "attempts read" on public.training_attempts for select to authenticated using
 (exists(select 1 from public.training_assignments a where a.id=assignment_id and
 (a.user_id=(select auth.uid()) or ((select auth.jwt())->'app_metadata'->>'training_admin')='true')));
create policy "certificates read" on public.training_certificates for select to authenticated using
 (exists(select 1 from public.training_assignments a where a.id=assignment_id and
 (a.user_id=(select auth.uid()) or ((select auth.jwt())->'app_metadata'->>'training_admin')='true')));
-- IMPORTANT: No client INSERT policy on attempts or certificates.
-- A trusted server-side scorer must validate answers, enforce attempt limits,
-- record the score, mark completion, and issue certificates atomically.
-- Never let the browser submit its own score or mint certificates.
