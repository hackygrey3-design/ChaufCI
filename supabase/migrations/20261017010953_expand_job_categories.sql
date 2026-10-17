-- ChaufCI: support driver roles and the separate Careers dashboard.
-- Applied to the connected Supabase project as migration expand_job_categories,
-- recorded version 20261017010953. Keep this file aligned with that recorded version;
-- do not manually re-run it. Verify the live schema and RLS policies before release.

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
