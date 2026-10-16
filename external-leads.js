"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const host = document.querySelector("#external-lead-list");
  const count = document.querySelector("#external-count");
  const filters = Array.from(document.querySelectorAll("[data-external-filter]"));
  if (!host || !count) return;

  // Third-party vacancies are leads, not ChaufCI-verified jobs.
  // Re-check each source before applying; deadlines can change.
  const leads = [
    {
      category: "poids-lourd",
      title: "Chauffeur poids lourd (H/F)",
      employer: "Élite Intérim — client industriel",
      location: "Autoroute de Bassam, en quittant Port-Bouët",
      deadline: "31 octobre 2026",
      status: "Date limite affichée par la source — à reconfirmer",
      url: "https://www.educarriere.ci/offre-155682-chauffeur-poids-lourd-h-f.html",
      source: "Educarriere"
    },
    {
      category: "poids-lourd",
      title: "30 conducteurs routiers gros gabarit (H/F)",
      employer: "SITM — annonce relayée par Nouavou",
      location: "Côte d’Ivoire — axes nationaux et sous-régionaux",
      deadline: "31 octobre 2026",
      status: "Annonce récente relayée — vérifier l’employeur et les modalités",
      url: "https://nouavou.net/emplois/30-conducteurs-routiers-gros-gabarit-h-f-1791889467-51/",
      source: "Nouavou.net"
    },
    {
      category: "livraison",
      title: "Chauffeur coursier",
      employer: "Garage Kagnan",
      location: "Yopougon, Abidjan",
      deadline: "31 octobre 2026 (indiquée sur la source)",
      status: "À confirmer auprès du recruteur",
      url: "https://jobivoire.ci/job/DSbyg6yrq",
      source: "Jobivoire"
    },
    {
      category: "livraison",
      title: "Livreur moto (H/F)",
      employer: "ML Ship Africa",
      location: "Cocody Faya, Abidjan",
      deadline: "31 octobre 2026 (indiquée sur la source)",
      status: "À confirmer — rémunération annoncée à la commission",
      url: "https://projobivoire.com/jobs/livreur-moto-h-f-ml-ship-africa-cocody-faya/?display=grid",
      source: "Projobivoire"
    },
    {
      category: "personnel",
      title: "Chauffeur personnel — piste externe",
      employer: "Société Générale Côte d’Ivoire (nom mentionné par le site tiers)",
      location: "Grand-Bassam (selon le site tiers)",
      deadline: "Non confirmée",
      status: "Piste non confirmée par le canal officiel de l’employeur",
      url: "https://fr.couriersers.org/jobs/chauffeur-personnel-3/",
      source: "Couriersers.org"
    },
    {
      category: "organisation",
      title: "Chauffeur / sécurité",
      employer: "Groupe La Lavandière (annonce relayée)",
      location: "Côte d’Ivoire — poste indiqué à Abidjan",
      deadline: "31 octobre 2026 (indiquée sur la source)",
      status: "À confirmer auprès du recruteur",
      url: "https://www.educarriere.ci/offre-155890-chauffeur-securite.html",
      source: "Educarriere"
    }
    ,{
      category: "personnel",
      title: "Chauffeur personnel",
      employer: "Un particulier — annonce publiée sur Educarriere",
      location: "Abidjan",
      deadline: "14 novembre 2026",
      status: "Annonce publiée le 16 octobre — disponibilité et coordonnées à vérifier avant d’envoyer des documents",
      url: "https://www.educarriere.ci/offre-157044-chauffeur-personnel.html",
      source: "Educarriere"
    },
    {
      category: "entreprise",
      title: "Chauffeurs de car et de course d’entreprise",
      employer: "HR Business Center",
      location: "Riviera, Abidjan",
      deadline: "29 octobre 2026",
      status: "Salaire annoncé sur la source : 130 000 FCFA pour chauffeur de car, 110 000 FCFA pour chauffeur de course entreprise — vérifier directement",
      url: "https://jobivoire.ci/job/Lgupl3iza",
      source: "Jobivoire (annonce relayée d’Educarriere)"
    },
    {
      category: "entreprise",
      title: "Chauffeur — transport de responsable et matériel",
      employer: "AELITE CONSTRUCTION",
      location: "Abidjan — bureaux et chantiers",
      deadline: "20 octobre 2026",
      status: "Annonce récente — confirmer que le recrutement est toujours ouvert",
      url: "https://www.jobivoire.ci/job/iwn27Q7xm",
      source: "Jobivoire"
    },
    {
      category: "entreprise",
      title: "Chauffeur polyvalent",
      employer: "Kema Service",
      location: "Cocody, Abidjan",
      deadline: "30 octobre 2026",
      status: "Salaire de 150 000 FCFA affiché par la source — demander les conditions écrites et confirmer l’ouverture",
      url: "https://jobivoire.ci/job/hJ0FCurm6",
      source: "Jobivoire"
    },
    {
      category: "livraison",
      title: "Coursier motorisé d’entreprise",
      employer: "AFREX",
      location: "Cocody, Abidjan",
      deadline: "31 octobre 2026",
      status: "Annonce récente — rémunération non communiquée; vérifier permis, véhicule et conditions",
      url: "https://jobivoire.ci/job/MQKGrsFTq",
      source: "Jobivoire"
    },
    {
      category: "livraison",
      title: "Livreur à moto (H/F)",
      employer: "PSI GROUPE",
      location: "Cocody Angré, terminus 81/82",
      deadline: "31 octobre 2026",
      status: "Salaire de base annoncé : 120 000 FCFA/mois — vérifier les conditions de contrat et les pièces exigées",
      url: "https://www.jobivoire.ci/job/L29rUEMfV",
      source: "Jobivoire"
    },
    {
      category: "livraison",
      title: "Chauffeur-coursier d’hôtel (H/F)",
      employer: "Cabinet Helios International",
      location: "Abidjan",
      deadline: "Non indiquée dans l’extrait consulté",
      status: "Annonce publiée le 15 octobre — CDD, BEPC et permis B indiqués; vérifier que l’offre est encore ouverte",
      url: "https://projobivoire.com/jobs/chauffeur-coursier-dhotel-h-f-cabinet-helios-international-abidjan/",
      source: "Projobivoire"
    },
    {
      category: "poids-lourd",
      title: "Chauffeur gros camion",
      employer: "Entreprise de missions médicales (nom non affiché dans l’extrait)",
      location: "Marcory, Abidjan",
      deadline: "1 novembre 2026",
      status: "Annonce publiée le 14 octobre — nom et coordonnées du recruteur à vérifier avant candidature",
      url: "https://educarriere.ci/offre-156929-chauffeur-gros-camion.html",
      source: "Educarriere"
    },
    {
      category: "organisation",
      title: "Driver, G-2 — nomination temporaire 364 jours",
      employer: "UNICEF",
      location: "Soubré / antenne Man, Côte d’Ivoire",
      deadline: "19 octobre 2026",
      status: "Annonce officielle UNICEF — clôture imminente; vérifier les exigences et postuler uniquement sur le portail officiel",
      url: "https://jobs.unicef.org/mob/cw/fr/job/596246/driver-g2-ta-364-days-138830-man-outpost-soubre-cote-divoire-wcar",
      source: "UNICEF Careers"
    }
  ];

  const sources = [
    { category: "personnel", title: "Rechercher chauffeurs personnels", detail: "Recherche d'annonces récentes — ce lien n'est pas une offre précise.", url: "https://www.google.com/search?q=site%3Ajobivoire.ci%2Fjob+chauffeur+personnel+C%C3%B4te+d%27Ivoire" },
    { category: "entreprise", title: "Rechercher chauffeurs d'entreprise", detail: "Recherche d'annonces récentes — vérifier chaque résultat.", url: "https://www.google.com/search?q=site%3Ajobivoire.ci%2Fjob+chauffeur+entreprise+Abidjan" },
    { category: "livraison", title: "Voir les offres de livraison et coursier", detail: "Recherche d'annonces récentes — disponibilité à confirmer.", url: "https://www.google.com/search?q=site%3Ajobivoire.ci%2Fjob+coursier+livreur+C%C3%B4te+d%27Ivoire" },
    { category: "poids-lourd", title: "Rechercher chauffeurs poids lourd", detail: "Recherche d'annonces récentes — vérifier permis et date limite.", url: "https://www.google.com/search?q=site%3Ajobivoire.ci%2Fjob+chauffeur+poids+lourd+C%C3%B4te+d%27Ivoire" },
    { category: "organisation", title: "Rechercher chauffeurs ONG / organisations", detail: "Recherche d'annonces récentes — consulter les canaux officiels des ONG.", url: "https://www.google.com/search?q=chauffeur+ONG+C%C3%B4te+d%27Ivoire+recrutement" },
    { category: "personnel", title: "Offres chauffeur sur Educarriere", detail: "Portail d'offres d'emploi à parcourir; résultats individuels à vérifier.", url: "https://emploi.educarriere.ci/page/all?button=1&mots_cles=CHAUFFEUR" },
    { category: "entreprise", title: "Offres chauffeur sur Jobivoire", detail: "Portail d'offres d'emploi à parcourir; résultats individuels à vérifier.", url: "https://www.jobivoire.ci/" },
    { category: "livraison", title: "Offres livreur sur Projobivoire", detail: "Portail d'offres d'emploi à parcourir; vérifier les conditions.", url: "https://projobivoire.com/" },
    { category: "poids-lourd", title: "Offres conducteurs sur Educarriere", detail: "Recherche par mot-clé; tous les résultats ne sont pas nécessairement des emplois de chauffeur.", url: "https://emploi.educarriere.ci/page/all?button=1&mots_cles=CONDUCTEUR" },
    { category: "organisation", title: "Offres ONG sur Educarriere", detail: "Rechercher les annonces de chauffeurs et lire les conditions originales.", url: "https://emploi.educarriere.ci/page/all?button=1&mots_cles=ONG+CHAUFFEUR" }
  ];

  const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);

  function render(filter = "all") {
    const selectedLeads = leads.filter((item) => filter === "all" || item.category === filter);
    const selectedSources = sources.filter((item) => filter === "all" || item.category === filter);
    const leadCards = selectedLeads.map((item) => `
      <article class="job-card external-lead-card">
        <div class="job-card-top"><div>
          <span class="job-badge">Piste externe · à confirmer</span>
          <h3>${escapeHTML(item.title)}</h3>
          <p class="job-company">${escapeHTML(item.employer)} · ${escapeHTML(item.location)}</p>
        </div></div>
        <p class="job-description"><strong>Statut :</strong> ${escapeHTML(item.status)}</p>
        <p class="job-updated"><strong>Date limite affichée :</strong> ${escapeHTML(item.deadline)}</p>
        <p class="job-updated"><strong>Source :</strong> ${escapeHTML(item.source)}</p>
        <div class="job-actions"><a class="apply-link" href="${escapeHTML(item.url)}" target="_blank" rel="noopener noreferrer">Consulter l’annonce originale ↗</a></div>
      </article>
    `).join("");
    const sourceCards = selectedSources.map((item) => `
      <article class="job-card external-source-card">
        <div class="job-card-top"><div>
          <span class="job-badge">Source de recherche · pas une offre</span>
          <h3>${escapeHTML(item.title)}</h3>
        </div></div>
        <p class="job-description">${escapeHTML(item.detail)}</p>
        <div class="job-actions"><a class="apply-link" href="${escapeHTML(item.url)}" target="_blank" rel="noopener noreferrer">Ouvrir la source ↗</a></div>
      </article>
    `).join("");
    host.innerHTML = (leadCards || "") + (sourceCards || "");
    count.textContent = `${selectedLeads.length} pistes d’offres · ${selectedSources.length} sources de recherche`;
    filters.forEach((button) => {
      const active = button.dataset.externalFilter === filter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  filters.forEach((button) => button.addEventListener("click", () => render(button.dataset.externalFilter)));
  render("all");
});
