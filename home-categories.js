"use strict";

document.addEventListener("DOMContentLoaded", async () => {
  const counters = Array.from(document.querySelectorAll("[data-category-count]"));
  const categories = ["personnel", "entreprise", "livraison", "poids-lourd", "organisation"];
  const labels = {
    personnel: "Chauffeur personnel",
    entreprise: "Chauffeur d'entreprise",
    livraison: "Livraison / coursier",
    "poids-lourd": "Camion robuste",
    organisation: "ONG et organisations"
  };

  const setCount = (category, count) => {
    const element = document.querySelector(`[data-category-count="${category}"]`);
    if (!element) return;
    element.textContent = count === 1
      ? "1 offre vérifiée disponible"
      : `${count} offre vérifiée disponible${count > 1 ? "s" : ""}`;
  };

  if (typeof window.ChaufCI?.loadJobs !== "function") {
    counters.forEach((element) => { element.textContent = "Consulter les offres"; });
    return;
  }

  try {
    const jobs = await window.ChaufCI.loadJobs();
    const now = new Date();
    const cutoff = new Date(now.getTime() - 7 * 86400000);
    const validJobs = (Array.isArray(jobs) ? jobs : []).filter((job) => {
      if (job.verified !== true || job.status && job.status !== "published") return false;
      if (!job.id || !job.title || !job.employer || !job.city || !job.description) return false;
      try {
        if (new URL(job.sourceUrl).protocol !== "https:") return false;
      } catch { return false; }
      const checked = new Date(job.lastChecked);
      if (Number.isNaN(checked.getTime()) || checked > now || checked < cutoff) return false;
      if (job.deadline) {
        const deadline = new Date(`${job.deadline}T23:59:59Z`);
        if (Number.isNaN(deadline.getTime()) || deadline < now) return false;
      }
      return categories.includes(job.category);
    });

    categories.forEach((category) => {
      setCount(category, validJobs.filter((job) => job.category === category).length);
    });

    const total = validJobs.length;
    const totalLink = document.querySelector('a[href="jobs.html"].button');
    if (totalLink) {
      totalLink.textContent = total === 0
        ? "Explorez toutes les offres de conduite →"
        : `Explorez les ${total} offre${total > 1 ? "s" : ""} de conduite vérifiée${total > 1 ? "s" : ""} →`;
    }
  } catch (error) {
    console.error("Impossible de charger les nombres d'offres ChaufCI.", error);
    counters.forEach((element) => { element.textContent = "Consulter les offres"; });
  }
});
