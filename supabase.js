
"use strict";

/*
 * ChaufCI public database connection.
 * This file uses only the public publishable key.
 * Never place a service-role key in frontend code.
 */

window.ChaufCI = window.ChaufCI || {};

window.ChaufCI.loadJobs = async function () {
  const SUPABASE_URL = "https://jxsnuxjmunucrnehbfex.supabase.co";
  const SUPABASE_KEY = "sb_publishable_zxJyny1-D-r_OqWBDg_5jg_Xs5KlwSv";

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const cutoff = new Date(
    now.getTime() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const query = new URLSearchParams({
    select: [
      "id",
      "title",
      "employer_name",
      "city",
      "category",
      "contract_type",
      "salary_text",
      "description",
      "requirements",
      "application_url",
      "source_url",
      "source_name",
      "deadline",
      "last_checked_at",
      "verified",
      "status",
      "featured"
    ].join(","),
    status: "eq.published",
    verified: "eq.true",
    last_checked_at: `gte.${cutoff}`,
    order: "featured.desc,last_checked_at.desc",
    or: `(deadline.is.null,deadline.gte.${today})`
  });

  const endpoint =
    `${SUPABASE_URL}/rest/v1/jobs?${query.toString()}`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("ChaufCI database request failed:", details);
    throw new Error(
      `Impossible de charger les offres (${response.status}).`
    );
  }

  const rows = await response.json();

  return rows
    .filter((job) => {
      if (!job.last_checked_at) return false;

      const checked = new Date(job.last_checked_at);
      return (
        !Number.isNaN(checked.getTime()) &&
        checked <= now &&
        checked >= new Date(now.getTime() - 7 * 86400000)
      );
    })
    .filter((job) => {
      try {
        return (
          job.source_url &&
          new URL(job.source_url).protocol === "https:"
        );
      } catch {
        return false;
      }
    })
    .map((job) => ({
      id: job.id,
      title: job.title,
      employer: job.employer_name,
      city: job.city,
      category: job.category,
      contract: job.contract_type,
      salary: job.salary_text,
      description: job.description,
      requirements: job.requirements,
      applicationUrl: job.application_url,
      sourceUrl: job.source_url,
      sourceName: job.source_name,
      deadline: job.deadline,
      verified: job.verified,
      lastChecked: job.last_checked_at.slice(0, 10),
      featured: job.featured
    }));
};
