import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const read = (path) => readFileSync(new URL(path, import.meta.url).pathname.replace("/tests/", "/"), "utf8");
const home = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const jobs = readFileSync(new URL("../jobs.html", import.meta.url), "utf8");
const careers = readFileSync(new URL("../careers.html", import.meta.url), "utf8");
const leads = readFileSync(new URL("../external-leads.js", import.meta.url), "utf8");

assert.match(home, /Explorez les emplois de conduite|Find your category|FIND YOUR CATEGORY/i, "Homepage should show the driving category section");
assert.match(home, /home-categories\.js/, "Homepage must load its category counters");
assert.match(jobs, /external-leads\.js/, "Jobs page must load external job leads");
assert.match(jobs, /external-lead-list/, "Jobs page must include the external leads container");
assert.match(careers, /career-more-filters/, "Careers page should use the expandable filter menu");
assert.match(careers, /Caissier·ère d'hôtel/, "Careers page should include the hotel cashier lead");
assert.match(careers, /Agent de nettoyage d'hôtel/, "Careers page should include the hotel cleaning lead");


const employerPage = readFileSync(new URL("../employers.html", import.meta.url), "utf8");
const employerScript = readFileSync(new URL("../employers.js", import.meta.url), "utf8");
const supabaseConfig = readFileSync(new URL("../supabase.js", import.meta.url), "utf8");
assert.match(employerPage, /name="website"/, "Employer submission form should include a honeypot field");
assert.match(employerScript, /data\.get\("website"\)/, "Employer submission handler must reject filled honeypots");
assert.match(employerScript, /status:\s*"pending"/, "Employer submissions must remain pending moderation");
assert.doesNotMatch(employerScript + supabaseConfig, /service_role|SUPABASE_SERVICE_ROLE_KEY/i, "Browser files must not contain a Supabase service-role key");

const migration = readFileSync(new URL("../supabase/migrations/20261017010953_expand_job_categories.sql", import.meta.url), "utf8");
const categories = [...employerPage.matchAll(/<option value="([^"]+)">/g)]
  .map((match) => match[1])
  .filter((value) => value);
const categoryCheck = migration.match(/alter table public\.job_submissions[\s\S]*?check \(category in \(([\s\S]*?)\)\);/);
assert.ok(categoryCheck, "Category migration must define the job_submissions category allowlist");
const migrationCategories = [...categoryCheck[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
assert.deepEqual([...categories].sort(), [...migrationCategories].sort(), "Employer form categories must match the job_submissions migration allowlist");
const jobsCategoryCheck = migration.match(/alter table public\.jobs[\s\S]*?check \(category in \(([\s\S]*?)\)\);/);
assert.ok(jobsCategoryCheck, "Category migration must define the jobs category allowlist");
const jobsMigrationCategories = [...jobsCategoryCheck[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
assert.deepEqual([...categories].sort(), [...jobsMigrationCategories].sort(), "Employer form categories must match the jobs migration allowlist");
assert.match(migration, /begin;[\s\S]*commit;/i, "Category migration should be transactional");
assert.doesNotMatch(migration, /disable row level security|drop policy|truncate|delete from|drop table/i, "Category migration must not weaken RLS or delete production data");
assert.match(migration, /recorded version 20261017010953/i, "Category migration must identify the applied Supabase migration version");

const urls = [...leads.matchAll(/url:\s*"([^"]+)"/g)].map((match) => match[1]);
assert.ok(urls.length >= 20, `Expected at least 20 sourced leads, found ${urls.length}`);
assert.ok(urls.every((url) => url.startsWith("https://")), "Every external lead URL must use HTTPS");
assert.equal(new Set(urls).size, urls.length, "External lead URLs must not be duplicated");
assert.match(leads, /escapeHTML\(item\.salary\)/, "External lead card must escape displayed salary text");
assert.match(leads, /escapeHTML\(item\.requirements\)/, "External lead card must escape displayed requirements text");

console.log(`Static site checks passed: key page sections found; ${urls.length} unique HTTPS job-lead URLs.`);
