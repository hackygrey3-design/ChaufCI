"use strict";

(() => {
  const form = document.querySelector("#employer-form");
  const statusBox = document.querySelector("#form-status");
  const submitButton = form?.querySelector('button[type="submit"]');
  const SUPABASE_URL = "https://jxsnuxjmunucrnehbfex.supabase.co";
  // Public publishable key only. Never place a service-role key in browser code.
  const SUPABASE_KEY = "sb_publishable_zxJyny1-D-r_OqWBDg_5jg_Xs5KlwSv";

  const setStatus = (message, kind) => {
    if (!statusBox) return;
    statusBox.hidden = false;
    statusBox.textContent = message;
    statusBox.dataset.kind = kind;
  };

  const safeOptionalUrl = (value, label) => {
    if (!value) return null;
    let url;
    try {
      url = new URL(value);
    } catch {
      throw new Error(label + " doit être une adresse web valide.");
    }
    if (url.protocol !== "https:") {
      throw new Error(label + " doit commencer par https://.");
    }
    return url.href;
  };

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    if (!SUPABASE_KEY || SUPABASE_KEY.includes("REMPLACER")) {
      setStatus("Le formulaire n’est pas encore configuré. Contactez ChaufCI directement.", "error");
      return;
    }

    const data = new FormData(form);
    let payload;
    try {
      payload = {
        employer_name: String(data.get("employer_name") || "").trim(),
        contact_name: String(data.get("contact_name") || "").trim(),
        contact_email: String(data.get("contact_email") || "").trim(),
        contact_phone: String(data.get("contact_phone") || "").trim(),
        job_title: String(data.get("job_title") || "").trim(),
        city: String(data.get("city") || "").trim(),
        category: String(data.get("category") || ""),
        description: String(data.get("description") || "").trim(),
        application_url: safeOptionalUrl(String(data.get("application_url") || "").trim(), "Le lien de candidature"),
        source_url: safeOptionalUrl(String(data.get("source_url") || "").trim(), "Le lien officiel"),
        status: "pending"
      };
    } catch (error) {
      setStatus(error.message, "error");
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Envoi en cours…";
    setStatus("Envoi de votre offre pour examen…", "info");

    try {
      const response = await fetch(SUPABASE_URL + "/rest/v1/job_submissions", {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: "Bearer " + SUPABASE_KEY,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const details = await response.text();
        console.error("ChaufCI submission failed:", response.status, details);
        if (response.status === 400 || response.status === 409) {
          throw new Error("La base de données n’accepte pas encore cette catégorie ou ces informations. L’offre n’a pas été envoyée. Réessayez plus tard.");
        }
        if (response.status === 401 || response.status === 403) {
          throw new Error("L’envoi est momentanément indisponible. Aucune offre n’a été enregistrée.");
        }
        throw new Error("Impossible d’envoyer l’offre pour le moment. Vérifiez votre connexion et réessayez.");
      }

      form.reset();
      setStatus("Votre offre a été reçue et reste en attente de vérification. Elle n’est pas encore publiée.", "success");
    } catch (error) {
      setStatus(error.message || "Une erreur est survenue. Veuillez réessayer.", "error");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Envoyer pour vérification";
    }
  });

  const year = document.querySelector("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();