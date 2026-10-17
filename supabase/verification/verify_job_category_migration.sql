-- ChaufCI release verification (read-only).
-- Run after the category migration to confirm the new category allowlists and
-- the existing public access policies remain in place. This script changes nothing.

select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  co.conname as constraint_name,
  pg_get_constraintdef(co.oid) as constraint_definition
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_constraint co on co.conrelid = c.oid and co.contype = 'c'
where n.nspname = 'public'
  and c.relname in ('jobs', 'job_submissions')
  and co.conname in ('jobs_category_check', 'job_submissions_category_check')
order by c.relname;

select
  tablename,
  policyname,
  cmd,
  roles,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('jobs', 'job_submissions')
order by tablename, policyname;

select
  'jobs' as table_name,
  relrowsecurity as rls_enabled
from pg_class
where oid = 'public.jobs'::regclass
union all
select
  'job_submissions' as table_name,
  relrowsecurity as rls_enabled
from pg_class
where oid = 'public.job_submissions'::regclass;
