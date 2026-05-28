document.addEventListener("DOMContentLoaded", () => {
  chargerActivitesEtudiant();
});

async function chargerActivitesEtudiant() {

  const container = document.getElementById("activitesEtudiantList");

  try {

    const res = await fetch("../backend/lister_activites_etudiant.php");
    const data = await res.json();

    if (!data.success) {

      container.innerHTML = `
        <p class="empty-state">
          Erreur : ${data.error}
        </p>
      `;

      return;
    }

    if (data.activites.length === 0) {

      container.innerHTML = `
        <p class="empty-state">
          Aucune activité disponible pour le moment.
        </p>
      `;

      return;
    }

    container.innerHTML = data.activites.map(act => {

      const date = new Date(act.date_heure);

      const dateStr = date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      });

      const heureStr = date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
      });

      return `
        <div class="catalogue-card">

          <div class="catalogue-card-image">
            <div class="service-icon-main">〽</div>
          </div>

          <div class="catalogue-card-content">

            <h2>${act.nom}</h2>

            <p class="praticien">
              ${act.praticien_prenom} ${act.praticien_nom}
            </p>

            <p class="specialite">
              ${act.description || "Activité bien-être"}
            </p>

            <div class="service-modes">
              <span>Présentiel</span>
              <span>${act.capacite_max} places</span>
            </div>

            <div class="service-info">
              <span>📍 ${act.lieu}</span>
            </div>

            <p class="service-note">
              📅 ${dateStr} à ${heureStr}
            </p>

            <button
              class="details-btn"
              onclick="ajouterAuPanierActivite(${act.id})"
            >
              S'inscrire
            </button>

          </div>

        </div>
      `;

    }).join("");

  } catch (error) {

    container.innerHTML = `
      <p class="empty-state">
        Erreur de connexion au serveur.
      </p>
    `;

  }

}

async function inscriptionActivite(idActivite) {

  try {

    const res = await fetch("../backend/inscription_activite.php", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      credentials: "include",

      body: JSON.stringify({
        id_activite: idActivite
      })

    });

    const data = await res.json();

    if (data.success) {

      alert("Inscription réussie !");
      chargerActivitesEtudiant();

    } else {

      alert(data.error);

    }

  } catch {

    alert("Erreur de connexion");

  }

}
async function ajouterAuPanierActivite(idActivite) {
  const res = await fetch("../backend/ajouter_panier_activite.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ id_activite: idActivite })
  });

  const data = await res.json();

  if (data.success) {
    alert("Activité ajoutée au panier !");
  } else {
    alert(data.error);
  }
}