document.addEventListener("DOMContentLoaded", function () {
    // Récupérer l'utilisateur connecté
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    document.getElementById("user-name").textContent = user.prenom + " " + user.nom;

    // Charger les données depuis le backend
    chargerDonnees();

    // Gestion des onglets
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            this.classList.add("active");

            const tabName = this.dataset.tab;
            document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
            document.getElementById("tab-" + tabName).classList.add("active");
        });
    });
});

async function chargerDonnees() {
    try {
        const res = await fetch("../backend/suivi.php");
        const data = await res.json();

        if (!data.success) {
            console.error("Erreur:", data.error);
            return;
        }

        // Mise à jour des stats
        document.getElementById("count-rdv").textContent = data.prochains.length;
        document.getElementById("count-activites").textContent = data.activites.length;
        document.getElementById("count-termines").textContent = data.passes.filter(r => r.statut === "terminee").length;

        // Afficher les prochains rendez-vous (vue d'ensemble)
        renderProchains(data.prochains);

        // Afficher les rendez-vous à venir (onglet Rendez-vous)
        renderRdvAVenir(data.prochains);

        // Afficher les rendez-vous passés (onglet Rendez-vous)
        renderRdvPasses(data.passes);

        // Afficher les activités
        renderActivites(data.activites);

        // Afficher l'historique
        renderHistorique(data.historique);

        // Afficher les intervenants
        renderIntervenants(data.intervenants);

    } catch (error) {
        console.error("Erreur de chargement:", error);
    }
}

function renderProchains(prochains) {
    const container = document.getElementById("prochains-list");
    container.innerHTML = "";
    if (prochains.length === 0) {
        container.innerHTML = '<p class="empty-state">Aucun rendez-vous à venir.</p>';
        return;
    }
    prochains.forEach(rdv => {
        const dateObj = new Date(rdv.date_creneau + "T" + rdv.heure_debut);
        const dateStr = dateObj.toLocaleDateString("fr-FR", { weekday: 'long', day: 'numeric', month: 'long' });
        const heureStr = dateObj.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' });

        const statutClass = rdv.statut === "confirmee" ? "badge-confirmed" : "badge-en-attente";
        const statutLabel = rdv.statut === "confirmee" ? "Confirmé" : "En attente";

        const html = `
            <div class="rdv-card">
                <div class="rdv-card-header">
                    <div>
                        <div class="rdv-title">${rdv.service_nom}</div>
                        <div class="rdv-subtitle">${rdv.praticien_prenom} ${rdv.praticien_nom}</div>
                    </div>
                    <span class="badge ${statutClass}">${statutLabel}</span>
                </div>
                <div class="rdv-details">
                    <span><i class="far fa-calendar"></i> ${dateStr}</span>
                    <span><i class="far fa-clock"></i> ${heureStr}</span>
                </div>
                ${rdv.statut === "confirmee" ? `
                    <div class="rdv-actions">
                        <button class="btn-annuler" onclick="annulerRdv(${rdv.id})">
                            <i class="fas fa-times"></i> Annuler
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        container.innerHTML += html;
    });
}

function renderRdvAVenir(prochains) {
    const container = document.getElementById("rdv-a-venir");
    container.innerHTML = "";
    if (prochains.length === 0) {
        container.innerHTML = '<p class="empty-state">Aucun rendez-vous à venir.</p>';
        return;
    }
    prochains.forEach(rdv => {
        const dateObj = new Date(rdv.date_creneau + "T" + rdv.heure_debut);
        const dateStr = dateObj.toLocaleDateString("fr-FR", { weekday: 'long', day: 'numeric', month: 'long' });
        const heureStr = dateObj.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' });

        const statutClass = rdv.statut === "confirmee" ? "badge-confirmed" : "badge-en-attente";
        const statutLabel = rdv.statut === "confirmee" ? "Confirmé" : "En attente";

        const html = `
            <div class="rdv-card">
                <div class="rdv-card-header">
                    <div>
                        <div class="rdv-title">${rdv.service_nom}</div>
                        <div class="rdv-subtitle">${rdv.praticien_prenom} ${rdv.praticien_nom}</div>
                    </div>
                    <span class="badge ${statutClass}">${statutLabel}</span>
                </div>
                <div class="rdv-details">
                    <span><i class="far fa-calendar"></i> ${dateStr}</span>
                    <span><i class="far fa-clock"></i> ${heureStr}</span>
                </div>
                ${rdv.statut === "confirmee" ? `
                    <div class="rdv-actions">
                        <button class="btn-annuler" onclick="annulerRdv(${rdv.id})">
                            <i class="fas fa-times"></i> Annuler
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        container.innerHTML += html;
    });
}

function renderRdvPasses(passes) {
    const container = document.getElementById("rdv-passés");
    container.innerHTML = "";
    if (passes.length === 0) {
        container.innerHTML = '<p class="empty-state">Aucun rendez-vous passé.</p>';
        return;
    }
    passes.forEach(rdv => {
        const dateObj = new Date(rdv.date_creneau + "T" + rdv.heure_debut);
        const dateStr = dateObj.toLocaleDateString("fr-FR", { day: 'numeric', month: 'numeric', year: 'numeric' });
        const heureStr = dateObj.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' });

        const statutClass = rdv.statut === "terminee" ? "badge-termine" : "badge-annule";
        const statutLabel = rdv.statut === "terminee" ? "Terminé" : "Annulé";

        const html = `
            <div class="rdv-card">
                <div class="rdv-card-header">
                    <div>
                        <div class="rdv-title">${rdv.service_nom}</div>
                        <div class="rdv-subtitle">${rdv.praticien_prenom} ${rdv.praticien_nom}</div>
                    </div>
                    <span class="badge ${statutClass}">${statutLabel}</span>
                </div>
                <div class="rdv-details">
                    <span><i class="far fa-calendar"></i> ${dateStr} à ${heureStr}</span>
                </div>
            </div>
        `;
        container.innerHTML += html;
    });
}

function renderActivites(activites) {
    const container = document.getElementById("activites-list");
    container.innerHTML = "";
    if (activites.length === 0) {
        container.innerHTML = '<p class="empty-state">Aucune activité inscrite.</p>';
        return;
    }
    activites.forEach(act => {
        const dateObj = new Date(act.date_heure);
        const dateStr = dateObj.toLocaleDateString("fr-FR", { day: 'numeric', month: 'numeric', year: 'numeric' });
        const heureStr = dateObj.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' });

        const html = `
            <div class="rdv-card">
                <div class="rdv-card-header">
                    <div>
                        <div class="rdv-title">${act.activite_nom}</div>
                        <div class="rdv-subtitle">${act.lieu}</div>
                    </div>
                    <span class="badge badge-inscrit">Inscrit</span>
                </div>
                <div class="rdv-details">
                    <span><i class="far fa-calendar"></i> ${dateStr} à ${heureStr}</span>
                </div>
            </div>
        `;
        container.innerHTML += html;
    });
}

function renderHistorique(historique) {
    const container = document.getElementById("historique-list");
    container.innerHTML = "";
    if (historique.length === 0) {
        container.innerHTML = '<p class="empty-state">Aucun historique disponible.</p>';
        return;
    }
    historique.forEach(item => {
        const html = `
            <div class="timeline-item">
                <div class="timeline-title">${item.titre}</div>
                <div class="timeline-desc">${item.detail}</div>
                <div class="timeline-date">${item.date}</div>
            </div>
        `;
        container.innerHTML += html;
    });
}

function renderIntervenants(intervenants) {
    const container = document.getElementById("intervenants-list");
    container.innerHTML = "";
    if (intervenants.length === 0) {
        container.innerHTML = '<p class="empty-state">Aucun intervenant consulté.</p>';
        return;
    }
    intervenants.forEach(inter => {
        const initials = inter.prenom[0] + inter.nom[0];
        const html = `
            <div class="intervenant-item">
                <div class="intervenant-left">
                    <div class="intervenant-avatar">${initials}</div>
                    <div>
                        <div class="intervenant-name">${inter.prenom} ${inter.nom}</div>
                        <div class="intervenant-specialite">${inter.specialite}</div>
                    </div>
                </div>
                <div class="intervenant-count">${inter.nb_visites} visite${inter.nb_visites > 1 ? 's' : ''}</div>
            </div>
        `;
        container.innerHTML += html;
    });
}

function annulerRdv(id) {
    if (confirm("Voulez-vous vraiment annuler ce rendez-vous ?")) {
        fetch("../backend/annuler_rdv.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Rendez-vous annulé avec succès");
                chargerDonnees(); // Recharger les données
            } else {
                alert("Erreur : " + data.error);
            }
        })
        .catch(err => {
            alert("Erreur de connexion");
        });
    }
}