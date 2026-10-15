
"use strict";

/*
 * ChaufCI — Job directory
 *
 * IMPORTANT:
 * The listings below are demonstrations, not real vacancies.
 * Replace them only with opportunities that have been verified.
 */

const DEMO_JOBS = [
  {
    id: "demo-001",
    title: "Chauffeur personnel",
    employer: "Employeur de démonstration",
    city: "Abidjan",
    category: "personnel",
    salary: "Non communiqué",
    contract: "À confirmer",
    description:
      "Exemple de fiche pour un poste de chauffeur personnel. " +
      "Les missions, exigences et conditions doivent être confirmées " +
      "auprès d'un employeur réel avant publication.",
    requirements: "À confirmer auprès de l'employeur.",
    deadline: "Non communiqué",
    applicationUrl: "",
    verified: false,
    lastChecked: ""
  },
  {
    id: "demo-002",
    title: "Chauffeur-livreur",
    employer: "Entreprise de démonstration",
    city: "Grand-Bassam",
    category: "livraison",
    salary: "Non communiqué",
    contract: "À confirmer",
    description:
      "Exemple de fiche pour un poste de livraison. " +
      "Aucune offre réelle n'est associée à cette fiche.",
    requirements: "Permis et expérience à confirmer.",
    deadline: "Non communiqué",
    applicationUrl: "",
    verified: false,
    lastChecked: ""
  },
  {
    id: "demo-003",
    title: "Chauffeur poids lourd",
    employer: "Société de démonstration",
    city: "Koumassi",
    category: "poids-lourd",
    salary: "Non communiqué",
    contract: "À confirmer",
    description:
      "Exemple de fiche pour le transport de marchandises. " +
      "Le permis requis, le salaire et les conditions restent à confirmer.",
    requirements: "Catégorie de permis à confirmer.",
    deadline: "Non communiqué",
    applicationUrl: "",
    verified: false,
    lastChecked: ""
  },
  {
    id: "demo-004",
    title: "Chauffeur d'entreprise",
    employer: "Entreprise de démonstration",
    city: "Marcory",
    category: "entreprise",
    salary: "Non communiqué",
    contract: "À confirmer",
    description:
      "Exemple de fiche pour un poste de chauffeur d'entreprise. " +
      "Cette annonce est fictive et ne correspond pas à un recrutement réel.",
    requirements: "Expérience et horaires à confirmer.",
    deadline: "Non communiqué",
    applicationUrl: "",
    verified: false,
    lastChecked: ""
  },
  {
    id: "demo-005",
    title: "Chauffeur taxi / VTC",
    employer: "Opérateur de démonstration",
    city: "Yopougon",
    category: "taxi-vtc",
    salary: "Non communiqué",
    contract: "À confirmer",
    description:
      "Exemple de fiche pour une activité de taxi ou VTC. " +
      "Aucun recrutement ni partenariat n'est annoncé.",
    requirements: "Permis, véhicule et conditions à confirmer.",
    deadline: "Non communiqué",
    applicationUrl: "",
    verified: false,
    lastChecked: ""
  }
];

const CATEGORY_LABELS = {
  personnel: "Chauffeur personnel",
  livraison: "Livraison",
  "poids-lourd": "Camion poids lourd",
  entreprise: "Chauffeur d'entreprise",
  "taxi-vtc": "Taxi / VTC"
};

const CITY_LABELS = {
  "Abidjan": "Abidjan",
  "Grand-Bassam": "Grand-Bassam",
  "Koumassi": "Koumassi",
  "Marcory": "Marcory",
  "Port-Bouët": "Port-Bouët",
  "Yopougon": "Yopougon"
};

const form = document.querySelector("#search-form");
const keywordInput = document.querySelector("#keyword");
const citySelect = document.querySelector("#city");
const categorySelect = document.querySelector("#category");
const jobList = document.querySelector("#job-list");
const resultCount = document.querySelector("#result-count");
const emptyState = document.querySelector("#empty-state");
const resetButton = document.querySelector("#reset");

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

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr");
}

function getSearchText(job) {
  return [
    job.title,
    job.employer,
    job.city,
    job.category,
    job.description,
    job.requirements
  ].join(" ");
}

function formatDate(value) {
  if (!value) return "Non vérifiée";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Non vérifiée";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function renderJob(job) {
  const category = CATEGORY_LABELS[job.category] || job.category;
  const isDemo = !job.verified;

  const statusBadge = isDemo
    ? '<span class="job-badge">Démonstration</span>'
    : '<span class="job-badge">Vérifiée</span>';

  const applicationAction = job.verified && job.applicationUrl
    ? `<a href="${escapeHTML(job.applicationUrl)}"
          target="_blank"
          rel="noopener noreferrer">
         Voir l'offre
       </a>`
    : `<span class="job-updated">Aucun lien de candidature vérifié</span>`;

  return `
    <article class="job-card">
      <div class="job-card-top">
        <div>
          <h3>${escapeHTML(job.title)}</h3>
          <div class="job-company">
            ${escapeHTML(job.employer)} · ${escapeHTML(job.city)}
          </div>
        </div>
        ${statusBadge}
      </div>

      <div class="job-details">
        <span>📍 ${escapeHTML(job.city)}</span>
        <span>💼 ${escapeHTML(category)}</span>
        <span>📄 ${escapeHTML(job.contract)}</span>
      </div>

      <div class="job-salary">
        ${escapeHTML(job.salary)}
      </div>

      <p class="job-description">
        ${escapeHTML(job.description)}
      </p>

      <p class="job-description">
        <strong>Conditions :</strong>
        ${escapeHTML(job.requirements)}
      </p>

      <p class="job-updated">
        Date limite : ${escapeHTML(job.deadline)}
      </p>

      <p class="job-updated">
        Dernière vérification : ${escapeHTML(formatDate(job.lastChecked))}
      </p>

      <div class="job-actions">
        ${applicationAction}
      </div>
    </article>
  `;
}

function getFilteredJobs() {
  const keyword = normalize(keywordInput?.value.trim() || "");
  const city = citySelect?.value || "";
  const category = categorySelect?.value || "";

  return DEMO_JOBS.filter((job) => {
    const matchesKeyword =
      !keyword || normalize(getSearchText(job)).includes(keyword);

    const matchesCity = !city || job.city === city;
    const matchesCategory = !category || job.category === category;

    return matchesKeyword && matchesCity && matchesCategory;
  });
}

function renderJobs() {
  if (!jobList || !resultCount || !emptyState) {
    console.error(
      "ChaufCI : un élément HTML nécessaire est introuvable. " +
      "Vérifiez les identifiants dans index.html."
    );
    return;
  }

  const jobs = getFilteredJobs();

  jobList.innerHTML = jobs.map(renderJob).join("");
  resultCount.textContent =
    `${jobs.length} résultat${jobs.length !== 1 ? "s" : ""}`;

  emptyState.hidden = jobs.length !== 0;
  jobList.hidden = jobs.length === 0;
}

function resetSearch() {
  if (form) form.reset();
  renderJobs();
}

function setupCategoryCards() {
  const cards = document.querySelectorAll(".category-card");

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const category = card.dataset.category;

      if (!categorySelect || !category) return;

      categorySelect.value = category;
      renderJobs();

      document.querySelector("#jobs")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });
}

function setupSearch() {
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      renderJobs();

      document.querySelector("#jobs")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  }

  keywordInput?.addEventListener("input", renderJobs);
  citySelect?.addEventListener("change", renderJobs);
  categorySelect?.addEventListener("change", renderJobs);
  resetButton?.addEventListener("click", resetSearch);

  setupCategoryCards();
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
