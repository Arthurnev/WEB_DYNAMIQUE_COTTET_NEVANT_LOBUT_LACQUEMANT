document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       UTILISATEUR CONNECTÉ
    ===================================================== */

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const fullName = `${user.prenom} ${user.nom}`;
    const initials =
        user.prenom.charAt(0).toUpperCase() +
        user.nom.charAt(0).toUpperCase();

    const studentName = document.getElementById("studentName");
    const studentAvatar = document.getElementById("studentAvatar");

    if (studentName) {
        studentName.textContent = fullName;
    }

    if (studentAvatar) {
        studentAvatar.textContent = initials;
    }

    /* =====================================================
       GESTION DES ONGLETS
    ===================================================== */

    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabPanels = document.querySelectorAll(".tab-panel");

    tabButtons.forEach((button) => {

        button.addEventListener("click", () => {

            tabButtons.forEach((btn) => {
                btn.classList.remove("active");
            });

            tabPanels.forEach((panel) => {
                panel.classList.remove("active");
            });

            button.classList.add("active");

            const tabName = button.dataset.tab;

            const targetPanel = document.getElementById(`tab-${tabName}`);

            if (targetPanel) {
                targetPanel.classList.add("active");
            }

        });

    });

    /* =====================================================
       CHARGEMENT DES DONNÉES
    ===================================================== */

    chargerDonnees();

});


/* =====================================================
   MENU COMPTE
===================================================== */

function toggleAccountMenu() {
    document
        .getElementById("accountMenu")
        .classList.toggle("hidden");
}


/* =====================================================
   DÉCONNEXION
===================================================== */

function logout() {
    localStorage.removeItem("utilisateur");
    window.location.href = "Accueil.html";
}


/* =====================================================
   CHARGEMENT BACKEND
===================================================== */

async function chargerDonnees() {

    try {

        const res = await fetch("../backend/suivi.php", {
            credentials: "include"
        });
        const data = await res.json();

        if (!data.success) {
            console.error("Erreur:", data.error);
            return;
        }

        document.getElementById("count-rdv").textContent =
            data.prochains.length;

        document.getElementById("count-activites").textContent =
            data.activites.length;

        document.getElementById("count-termines").textContent =
            data.passes.filter(r => r.statut === "terminee").length;

        renderProchains(data.prochains);
        renderRdvAVenir(data.prochains);
        renderRdvPasses(data.passes);
        renderActivites(data.activites);
        renderHistorique(data.historique);
        renderIntervenants(data.intervenants);

    }

    catch (error) {
        console.error("Erreur de chargement:", error);
    }

}


/* =====================================================
   PROCHAINS RDV
===================================================== */

function renderProchains(prochains) {

    const container = document.getElementById("prochains-list");

    container.innerHTML = "";

    if (prochains.length === 0) {
        container.innerHTML =
            '<p class="empty-state">Aucun rendez-vous à venir.</p>';
        return;
    }

    prochains.forEach(rdv => {

        const dateObj =
            new Date(rdv.date_creneau + "T" + rdv.heure_debut);

        const dateStr =
            dateObj.toLocaleDateString("fr-FR", {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
            });

        const heureStr =
            dateObj.toLocaleTimeString("fr-FR", {
                hour: '2-digit',
                minute: '2-digit'
            });

        const statutClass =
            rdv.statut === "confirmee"
                ? "badge-confirmed"
                : "badge-en-attente";

        const statutLabel =
            rdv.statut === "confirmee"
                ? "Confirmé"
                : "En attente";

        container.innerHTML += `
            <div class="rdv-card">

                <div class="rdv-card-header">

                    <div>
                        <div class="rdv-title">
                            ${rdv.service_nom}
                        </div>

                        <div class="rdv-subtitle">
                            ${rdv.praticien_prenom}
                            ${rdv.praticien_nom}
                        </div>
                    </div>

                    <span class="badge ${statutClass}">
                        ${statutLabel}
                    </span>

                </div>

                <div class="rdv-details">
                    <span>
                        <i class="far fa-calendar"></i>
                        ${dateStr}
                    </span>

                    <span>
                        <i class="far fa-clock"></i>
                        ${heureStr}
                    </span>
                </div>

                ${rdv.statut === "confirmee"
                    ? `
                    <div class="rdv-actions">
                        <button
                            class="btn-annuler"
                            onclick="annulerRdv(${rdv.id})"
                        >
                            <i class="fas fa-times"></i>
                            Annuler
                        </button>
                    </div>
                `
                    : ''
                }

            </div>
        `;
    });

}


/* =====================================================
   RDV À VENIR
===================================================== */

function renderRdvAVenir(prochains) {

    const container = document.getElementById("rdv-a-venir");

    container.innerHTML = "";

    if (prochains.length === 0) {
        container.innerHTML =
            '<p class="empty-state">Aucun rendez-vous à venir.</p>';
        return;
    }

    prochains.forEach(rdv => {

        const dateObj =
            new Date(rdv.date_creneau + "T" + rdv.heure_debut);

        const dateStr =
            dateObj.toLocaleDateString("fr-FR", {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
            });

        const heureStr =
            dateObj.toLocaleTimeString("fr-FR", {
                hour: '2-digit',
                minute: '2-digit'
            });

        const statutClass =
            rdv.statut === "confirmee"
                ? "badge-confirmed"
                : "badge-en-attente";

        const statutLabel =
            rdv.statut === "confirmee"
                ? "Confirmé"
                : "En attente";

        container.innerHTML += `
            <div class="rdv-card">

                <div class="rdv-card-header">

                    <div>
                        <div class="rdv-title">
                            ${rdv.service_nom}
                        </div>

                        <div class="rdv-subtitle">
                            ${rdv.praticien_prenom}
                            ${rdv.praticien_nom}
                        </div>
                    </div>

                    <span class="badge ${statutClass}">
                        ${statutLabel}
                    </span>

                </div>

                <div class="rdv-details">
                    <span>
                        <i class="far fa-calendar"></i>
                        ${dateStr}
                    </span>

                    <span>
                        <i class="far fa-clock"></i>
                        ${heureStr}
                    </span>
                </div>

            </div>
        `;
    });

}


/* =====================================================
   RDV PASSÉS
===================================================== */

function renderRdvPasses(passes) {

    const container = document.getElementById("rdv-passés");

    container.innerHTML = "";

    if (passes.length === 0) {
        container.innerHTML =
            '<p class="empty-state">Aucun rendez-vous passé.</p>';
        return;
    }

    passes.forEach(rdv => {

        const dateObj =
            new Date(rdv.date_creneau + "T" + rdv.heure_debut);

        const dateStr =
            dateObj.toLocaleDateString("fr-FR");

        const heureStr =
            dateObj.toLocaleTimeString("fr-FR", {
                hour: '2-digit',
                minute: '2-digit'
            });

        const statutClass =
            rdv.statut === "terminee"
                ? "badge-termine"
                : "badge-annule";

        const statutLabel =
            rdv.statut === "terminee"
                ? "Terminé"
                : "Annulé";

        container.innerHTML += `
            <div class="rdv-card">

                <div class="rdv-card-header">

                    <div>
                        <div class="rdv-title">
                            ${rdv.service_nom}
                        </div>

                        <div class="rdv-subtitle">
                            ${rdv.praticien_prenom}
                            ${rdv.praticien_nom}
                        </div>
                    </div>

                    <span class="badge ${statutClass}">
                        ${statutLabel}
                    </span>

                </div>

                <div class="rdv-details">
                    <span>
                        <i class="far fa-calendar"></i>
                        ${dateStr} à ${heureStr}
                    </span>
                </div>

            </div>
        `;
    });

}


/* =====================================================
   ACTIVITÉS
===================================================== */

function renderActivites(activites) {

    const container = document.getElementById("activites-list");

    container.innerHTML = "";

    if (activites.length === 0) {
        container.innerHTML =
            '<p class="empty-state">Aucune activité inscrite.</p>';
        return;
    }

    activites.forEach(act => {

        const dateObj = new Date(act.date_heure);

        const dateStr =
            dateObj.toLocaleDateString("fr-FR");

        const heureStr =
            dateObj.toLocaleTimeString("fr-FR", {
                hour: '2-digit',
                minute: '2-digit'
            });

        container.innerHTML += `
            <div class="rdv-card">

                <div class="rdv-card-header">

                    <div>
                        <div class="rdv-title">
                            ${act.activite_nom}
                        </div>

                        <div class="rdv-subtitle">
                            ${act.lieu}
                        </div>
                    </div>

                    <span class="badge badge-inscrit">
                        Inscrit
                    </span>

                </div>

                <div class="rdv-details">
                    <span>
                        <i class="far fa-calendar"></i>
                        ${dateStr} à ${heureStr}
                    </span>
                </div>

                <div class="rdv-actions">
                    <button
                        class="btn-annuler"
                        onclick="annulerInscriptionActivite(${act.activite_id})"
                    >
                        Annuler le rdv
                    </button>
                    </div>

            </div>
        `;
    });

}


/* =====================================================
   HISTORIQUE
===================================================== */

function renderHistorique(historique) {

    const container =
        document.getElementById("historique-list");

    container.innerHTML = "";

    if (historique.length === 0) {
        container.innerHTML =
            '<p class="empty-state">Aucun historique disponible.</p>';
        return;
    }

    historique.forEach(item => {

        container.innerHTML += `
            <div class="timeline-item">

                <div class="timeline-title">
                    ${item.titre}
                </div>

                <div class="timeline-desc">
                    ${item.detail}
                </div>

                <div class="timeline-date">
                    ${item.date}
                </div>

            </div>
        `;
    });

}


/* =====================================================
   INTERVENANTS
===================================================== */

function renderIntervenants(intervenants) {

    const container =
        document.getElementById("intervenants-list");

    container.innerHTML = "";

    if (intervenants.length === 0) {
        container.innerHTML =
            '<p class="empty-state">Aucun intervenant consulté.</p>';
        return;
    }

    intervenants.forEach(inter => {

        const initials =
            inter.prenom[0] + inter.nom[0];

        container.innerHTML += `
            <div class="intervenant-item">

                <div class="intervenant-left">

                    <div class="intervenant-avatar">
                        ${initials}
                    </div>

                    <div>
                        <div class="intervenant-name">
                            ${inter.prenom} ${inter.nom}
                        </div>

                        <div class="intervenant-specialite">
                            ${inter.specialite}
                        </div>
                    </div>

                </div>

                <div class="intervenant-count">
                    ${inter.nb_visites}
                    visite${inter.nb_visites > 1 ? 's' : ''}
                </div>

            </div>
        `;
    });

}


/* =====================================================
   ANNULATION RDV
===================================================== */

function annulerRdv(id) {

    if (!confirm("Voulez-vous vraiment annuler ce rendez-vous ?")) {
        return;
    }

    fetch("../backend/annuler_rdv.php", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({ id })

    })

    .then(res => res.json())

    .then(data => {

        if (data.success) {

            alert("Rendez-vous annulé avec succès");

            chargerDonnees();

        } else {

            alert("Erreur : " + data.error);

        }

    })

    .catch(() => {
        alert("Erreur de connexion");
    });

}
function toggleContactBox() {
  const box = document.getElementById("contactBox");
  if (box) {
    box.classList.toggle("hidden");
  }
}

function annulerInscriptionActivite(idActivite) {
  if (!confirm("Annuler cette inscription ?")) return;

  fetch("../backend/annuler_inscription_activite.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      id_activite: idActivite
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert("Inscription annulée.");
      chargerDonnees();
    } else {
      alert(data.error);
    }
  })
  .catch(() => {
    alert("Erreur de connexion");
  });
}