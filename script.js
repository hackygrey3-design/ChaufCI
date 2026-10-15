
"use strict";

/*
 * ChaufCI — Job search and listing engine
 *
 * Publishing rules:
 * 1. Never publish fictional or demonstration vacancies.
 * 2. Every listing must link to its original source.
 * 3. Verify listings within the last 7 days.
 * 4. Remove listings with expired application deadlines.
 * 5. Never invent salary, employer, requirements, or deadlines.
 *
 * Add verified listings to JOBS below.
 * Dates must use YYYY-MM-DD format.
 */

const JOBS = [
  /*
  Example structure — NOT a real vacancy.
  Do not uncomment this example or publish it.

  {
    id: "unique-listing-id",
    title: "Verified job title",
    employer: "Actual employer name",
    city: "Abidjan",
    category: "entreprise",
    salary: "Use the published salary, or Non communiqué",
    contract: "Use the published contract type",
    description: "Summary based on the original listing",
    requirements: "Requirements from the original listing",
    deadline: "2026-10-30",
    sourceUrl: "https://example.com/original-listing",
    applicationUrl: "https://example.com/apply",
    verified: true,
    lastChecked: "2026-10-15"
  }
  */
];

const CATEGORY_LABELS = {
  personnel: "Chauffeur personnel",
  entreprise: "Chauffeur d'entreprise",
  livraison: "Livraison / coursier",
  "poids-lourd": "Poids lourd",
  organisation: "Organisation / ONG"
};

const form = document.querySelector("#search-form");
const keywordInput = document.querySelector("#keyword");
const citySelect = document.querySelector("#city");
const categorySelect = document.querySelector("#category");
const jobList = document.querySelector("#job-list");
const resultCount = document.querySelector("#result-count");
const emptyState = document.querySelector("#empty-state");
const resetButton = document.querySelector("#reset");

const MAX_VERIFICATION_AGE_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .trim();
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}

function parseISODate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value ?? ""))) {
    return null;
  }

  const date = new Date(`${value}T00:00:00Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    return null;
  }

  return date;
}

function formatDate(value) {
  const date = parseISODate(value);

  if (!date) {
    return "Non communiquée";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function isSafeExternalURL(value) {
  try {
    const url = new URL(String(value ?? ""));

    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function isVerifiedAndCurrent(job) {
  if (job.verified !== true) {
    return false;
  }

  if (!job.sourceUrl || !isSafeExternalURL(job.sourceUrl)) {
    return false;
  }

  const checkedDate = parseISODate(job.lastChecked);

  if (!checkedDate) {
    return false;
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const ageInDays = Math.floor(
    (today.getTime() - checkedDate.getTime()) / DAY_MS
  );

  if (ageInDays < 0 || ageInDays > MAX_VERIFICATION_AGE_DAYS) {
    return false;
  }

  if (job.deadline) {
    const deadline = parseISODate(job.deadline);

    if (!deadline || deadline.getTime() < today.getTime()) {
      return false;
    }
  }

  return Boolean(
    job.id &&
    job.title &&
    job.employer &&
    job.city &&
    CATEGORY_LABELS[job.category] &&
    job.description
  );
}

function getPublishedJobs() {
  return JOBS.filter(isVerifiedAndCurrent);
}

function getSearchText(job) {
  return [
    job.title,
    job.employer,
    job.city,
    CATEGORY_LABELS[job.category],
    job.description,
    job.requirements,
    job.contract,
    job.salary
  ].join(" ");
}

function getFilteredJobs() {
  const keyword = normalize(keywordInput?.value);
  const selectedCity = citySelect?.value ?? "";
  const selectedCategory = categorySelect?.value ?? "";

  return getPublishedJobs().filter((job) => {
    const matchesKeyword =
      !keyword || normalize(getSearchText(job)).includes(keyword);

    let matchesCity = true;

    if (selectedCity === "Côte d'Ivoire") {
      matchesCity = !["abidjan", "soubre"].includes(normalize(job.city));
    } else if (selectedCity) {
      matchesCity = normalize(job.city) === normalize(selectedCity);
    }

    const matchesCategory =
      !selectedCategory || job.category === selectedCategory;

    return matchesKeyword && matchesCity && matchesCategory;
  });
}

function renderJob(job) {
  const category = CATEGORY_LABELS[job.category];
  const applicationURL = isSafeExternalURL(job.applicationUrl)
    ? job.applicationUrl
    : job.sourceUrl;

  const deadline = job.deadline
    ? formatDate(job.deadline)
    : "Non communiquée";

  const salary = job.salary || "Non communiqué";
  const contract = job.contract || "Non communiqué";
  const requirements = job.requirements || "Consultez l'annonce originale.";

  return `
    <article class="job-card">
      <div class="job-card-top">
        <div>
          <span class="job-badge">Source vérifiée</span>
          <h3>${escapeHTML(job.title)}</h3>
          <p class="job-company">
            ${escapeHTML(job.employer)} · ${escapeHTML(job.city)}
          </p>
        </div>
      </div>

      <div class="job-details">
        <span>📍 ${escapeHTML(job.city)}</span>
        <span>💼 ${escapeHTML(category)}</span>
        <span>📄 ${escapeHTML(contract)}</span>
      </div>

      <p class="job-salary">${escapeHTML(salary)}</p>

      <p class="job-description">
        ${escapeHTML(job.description)}
      </p>

      <p class="job-description">
        <strong>Conditions :</strong>
        ${escapeHTML(requirements)}
      </p>

      <p class="job-updated">
        Date limite : ${escapeHTML(deadline)}
      </p>

      <p class="job-updated">
        Source vérifiée le ${escapeHTML(formatDate(job.lastChecked))}
      </p>

      <div class="job-actions">
        <a
          class="apply-link"
          href="${escapeHTML(applicationURL)}"
          target="_blank"
          rel="noopener noreferrer"
        >Consulter l'annonce originale ↗</a>
      </div>
    </article>
  `;
}

function renderJobs() {
  if (!jobList || !resultCount || !emptyState) {
    console.error(
      "ChaufCI : élément HTML introuvable. Vérifiez les identifiants."
    );
    return;
  }

  const publishedJobs = getPublishedJobs();
  const filteredJobs = getFilteredJobs();

  jobList.innerHTML = filteredJobs.map(renderJob).join("");

  const count = filteredJobs.length;
  resultCount.textContent =
    `${count} offre${count !== 1 ? "s" : ""}`;

  if (count > 0) {
    emptyState.hidden = true;
    jobList.hidden = false;
  } else {
    jobList.hidden = true;
    emptyState.hidden = false;

    const heading = emptyState.querySelector("h3");
    const message = emptyState.querySelector("p");

    if (publishedJobs.length === 0) {
      if (heading) {
        heading.textContent = "Aucune offre vérifiée pour le moment";
      }

      if (message) {
        message.textContent =
          "De nouvelles annonces seront affichées après vérification de leur source et de leur disponibilité. Revenez consulter ChaufCI.";
      }
    } else {
      if (heading) {
        heading.textContent = "Aucune offre ne correspond";
      }

      if (message) {
        message.textContent =
          "Essayez un autre mot-clé ou élargissez votre recherche.";
      }
    }
  }

  jobList.setAttribute("aria-busy", "false");
}

function resetSearch() {
  form?.reset();
  updateQuickFilters();
  renderJobs();
}

function updateQuickFilters() {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    const active =
      categorySelect?.value === button.dataset.filter;

    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function setupSearch() {
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      updateQuickFilters();
      renderJobs();

      document.querySelector("#jobs")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  }

  keywordInput?.addEventListener("input", renderJobs);

  citySelect?.addEventListener("change", renderJobs);

  categorySelect?.addEventListener("change", () => {
    updateQuickFilters();
    renderJobs();
  });

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!categorySelect) return;

      const selected = button.dataset.filter;

      categorySelect.value =
        categorySelect.value === selected ? "" : selected;

      updateQuickFilters();
      renderJobs();

      document.querySelector("#jobs")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });

  resetButton?.addEventListener("click", resetSearch);

  updateQuickFilters();
  renderJobs();
}

function updateFooterYear() {
  const yearElement = document.querySelector("#year");

  if (yearElement) {
    yearElement.textContent = String(new Date().getFullYear());
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupSearch();
  updateFooterYear();
});
