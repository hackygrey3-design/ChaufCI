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

const urls = [...leads.matchAll(/url:\s*"([^"]+)"/g)].map((match) => match[1]);
assert.ok(urls.length >= 20, `Expected at least 20 sourced leads, found ${urls.length}`);
assert.ok(urls.every((url) => url.startsWith("https://")), "Every external lead URL must use HTTPS");
assert.equal(new Set(urls).size, urls.length, "External lead URLs must not be duplicated");
assert.match(leads, /escapeHTML\(item\.salary\)/, "External lead card must escape displayed salary text");
assert.match(leads, /escapeHTML\(item\.requirements\)/, "External lead card must escape displayed requirements text");

console.log(`Static site checks passed: key page sections found; ${urls.length} unique HTTPS job-lead URLs.`);
