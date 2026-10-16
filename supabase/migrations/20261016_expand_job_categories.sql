-- ChaufCI: support driver roles and the separate Careers dashboard.
-- Review and apply this migration to the connected Supabase project before deploying
-- employers.html. This file is proposed only; it has not been applied to any database.

begin;

-- Replace the category checks by explicit, aligned allowlists. The existing schema's
-- default names are used; IF EXISTS keeps this migration safe if they were renamed.
alter table public.jobs
  drop constraint if exists jobs_category_check;

alter table public.job_submissions
  drop constraint if exists job_submissions_category_check;

alter table public.jobs
  add constraint jobs_category_check
  check (category in (
    'personnel', 'entreprise', 'livraison', 'poids-lourd', 'organisation',
    'cashier', 'customer-service', 'hospitality', 'sales', 'administration', 'other'
  ));

alter table public.job_submissions
  add constraint job_submissions_category_check
  check (category in (
    'personnel', 'entreprise', 'livraison', 'poids-lourd', 'organisation',
    'cashier', 'customer-service', 'hospitality', 'sales', 'administration', 'other'
  ));

commit;
