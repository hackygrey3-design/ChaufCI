
"use strict";

/*
 * ChaufCI — Recherche d'offres depuis Supabase.
 * Aucune annonce de démonstration n'est affichée.
 */

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

let jobs = [];
let loadFailed = false;
let isLoading = false;

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

  if (!date) return "Non communiquée";

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
  if (!job || job.verified !== true) return false;
  if (!isSafeExternalURL(job.sourceUrl)) return false;

  const checkedDate = parseISODate(job.lastChecked);

  if (!checkedDate) return false;

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

  return jobs.filter((job) => {
    const matchesKeyword =
      !keyword || normalize(getSearchText(job)).includes(keyword);

    let matchesCity = true;

    if (selectedCity === "Côte d'Ivoire") {
      matchesCity = !["abidjan", "soubre"].includes(
        normalize(job.city)
      );
    } else if (selectedCity) {
      matchesCity =
        normalize(job.city) === normalize(selectedCity);
    }

    return (
      matchesKeyword &&
      matchesCity &&
      (!selectedCategory || job.category === selectedCategory)
    );
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
        <span>📄 ${escapeHTML(job.contract || "Non communiqué")}</span>
      </div>

      <p class="job-salary">
        ${escapeHTML(job.salary || "Non communiqué")}
      </p>

      <p class="job-description">
        ${escapeHTML(job.description)}
      </p>

      <p class="job-description">
        <strong>Conditions :</strong>
        ${escapeHTML(job.requirements || "Consultez l'annonce originale.")}
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

function showEmptyState(title, message) {
  if (jobList) jobList.hidden = true;
  if (emptyState) emptyState.hidden = false;

  const heading = emptyState?.querySelector("h3");
  const paragraph = emptyState?.querySelector("p");

  if (heading) heading.textContent = title;
  if (paragraph) paragraph.textContent = message;
}

function renderJobs() {
  if (!jobList || !resultCount || !emptyState) {
    console.error(
      "ChaufCI : élément HTML introuvable. Vérifiez les identifiants."
    );
    return;
  }

  if (isLoading) {
    resultCount.textContent = "Chargement des offres…";
    jobList.setAttribute("aria-busy", "true");

    showEmptyState(
      "Chargement des offres",
      "ChaufCI recherche les annonces publiées et vérifiées."
    );

    if (resetButton) {
      resetButton.disabled = true;
      resetButton.textContent = "Chargement…";
    }

    return;
  }

  if (resetButton) {
    resetButton.disabled = false;
    resetButton.textContent = loadFailed
      ? "Réessayer"
      : "Effacer les filtres";
  }

  if (loadFailed) {
    resultCount.textContent = "Offres indisponibles";

    showEmptyState(
      "Impossible de charger les offres",
      "Vérifiez votre connexion puis réessayez. Aucune annonce non vérifiée ne sera affichée."
    );

    jobList.setAttribute("aria-busy", "false");
    return;
  }

  const filteredJobs = getFilteredJobs();

  jobList.innerHTML = filteredJobs.map(renderJob).join("");

  resultCount.textContent =
    `${filteredJobs.length} offre${filteredJobs.length !== 1 ? "s" : ""}`;

  if (filteredJobs.length > 0) {
    emptyState.hidden = true;
    jobList.hidden = false;
  } else {
    showEmptyState(
      jobs.length > 0
        ? "Aucune offre ne correspond"
        : "Aucune offre vérifiée pour le moment",
      jobs.length > 0
        ? "Essayez un autre mot-clé ou élargissez votre recherche."
        : "De nouvelles annonces seront affichées après vérification de leur source et de leur disponibilité. Revenez consulter ChaufCI."
    );
  }

  jobList.setAttribute("aria-busy", "false");
}

function updateQuickFilters() {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    const active = categorySelect?.value === button.dataset.filter;

    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function resetSearch() {
  if (loadFailed) {
    loadJobsFromDatabase();
    return;
  }

  form?.reset();
  updateQuickFilters();
  renderJobs();
}

async function loadJobsFromDatabase() {
  if (isLoading) return;

  if (typeof window.ChaufCI?.loadJobs !== "function") {
    loadFailed = true;

    console.error(
      "ChaufCI : supabase.js n'a pas chargé la fonction loadJobs."
    );

    renderJobs();
    return;
  }

  isLoading = true;
  loadFailed = false;
  renderJobs();

  try {
    const result = await window.ChaufCI.loadJobs();

    jobs = Array.isArray(result)
      ? result.filter(isVerifiedAndCurrent)
      : [];
  } catch (error) {
    jobs = [];
    loadFailed = true;

    console.error(
      "ChaufCI : échec du chargement des offres.",
      error
    );
  } finally {
    isLoading = false;
    renderJobs();
  }
}

function setupSearch() {
  /*
   * Read a category passed from the homepage, for example:
   * jobs.html?category=livraison
   */
  const requestedCategory = new URLSearchParams(
    window.location.search
  ).get("category");

  if (
    categorySelect &&
    requestedCategory &&
    Object.prototype.hasOwnProperty.call(
      CATEGORY_LABELS,
      requestedCategory
    )
  ) {
    categorySelect.value = requestedCategory;
  }

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    updateQuickFilters();
    renderJobs();

    document.querySelector("#jobs")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

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
  loadJobsFromDatabase();
});
