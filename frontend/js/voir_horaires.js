let service = null;
let creneaux = [];
let selectedDate = null;
let selectedCreneau = null;

document.addEventListener("DOMContentLoaded", () => {
  afficherUser();
  chargerHoraires();
});

function afficherUser() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const initials = `${user.prenom?.[0] || ""}${user.nom?.[0] || ""}`.toUpperCase();

  const avatar = document.getElementById("studentAvatar");
  const name = document.getElementById("studentName");

  if (avatar) avatar.textContent = initials;
  if (name) name.textContent = `${user.prenom || ""} ${user.nom || ""}`;
}

function toggleAccountMenu() {
  const menu = document.getElementById("accountMenu");
  if (menu) menu.classList.toggle("hidden");
}

function toggleContactBox() {
  const box = document.getElementById("contactBox");
  if (box) box.classList.toggle("hidden");
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "accueil.html";
}

async function chargerHoraires() {
  const params = new URLSearchParams(window.location.search);
  const idService = params.get("id");

  if (!idService) {
    document.getElementById("creneauxList").innerHTML =
      `<p class="empty-state">Service introuvable.</p>`;
    return;
  }

  try {
    const res = await fetch(`../backend/voir_horaires.php?id_service=${idService}`);
    const data = await res.json();

    if (!data.success) {
      document.getElementById("creneauxList").innerHTML =
        `<p class="empty-state">${data.error}</p>`;
      return;
    }

    service = data.service;
    creneaux = data.creneaux;

    document.getElementById("serviceTitle").textContent = service.nom;
    document.getElementById("resumeService").textContent = service.nom;
    document.getElementById("resumePraticien").textContent =
      `${service.praticien_prenom} ${service.praticien_nom}`;
    document.getElementById("resumePrix").textContent =
      `${Number(service.prix).toFixed(2)} €`;
    document.getElementById("resumeDuree").textContent =
      `${service.duree_min} min`;

    afficherDates();

  } catch (error) {
    document.getElementById("creneauxList").innerHTML =
      `<p class="empty-state">Erreur de connexion au serveur.</p>`;
  }
}

function afficherDates() {
  const datesList = document.getElementById("datesList");

  if (creneaux.length === 0) {
    datesList.innerHTML = `<p class="empty-state">Aucune date disponible.</p>`;
    document.getElementById("creneauxList").innerHTML = "";
    return;
  }

  const datesUniques = [...new Set(creneaux.map(c => c.date))];

  selectedDate = datesUniques[0];

  datesList.innerHTML = datesUniques.map(date => `
    <button
      class="date-btn ${date === selectedDate ? "selected" : ""}"
      onclick="selectionnerDate('${date}')"
    >
      <span>${jourCourt(date)}</span>
      <strong>${jourNumero(date)}</strong>
      <small>${moisCourt(date)}</small>
    </button>
  `).join("");

  afficherCreneaux();
}

function selectionnerDate(date) {
  selectedDate = date;
  selectedCreneau = null;

  document.querySelectorAll(".date-btn").forEach(btn => {
    btn.classList.remove("selected");
  });

  event.currentTarget.classList.add("selected");

  document.getElementById("resumeDate").textContent = "Aucune sélection";
  document.getElementById("resumeHeure").textContent = "Aucune sélection";

  afficherCreneaux();
}

function afficherCreneaux() {
  const container = document.getElementById("creneauxList");

  const creneauxDuJour = creneaux.filter(c => c.date === selectedDate);

  if (creneauxDuJour.length === 0) {
    container.innerHTML = `<p class="empty-state">Aucun horaire disponible pour cette date.</p>`;
    return;
  }

  container.innerHTML = creneauxDuJour.map(c => `
    <button
      class="creneau-btn"
      onclick='selectionnerCreneau(${JSON.stringify(c)})'
    >
      ${c.heure_debut} - ${c.heure_fin}
    </button>
  `).join("");
}

function selectionnerCreneau(c) {
  selectedCreneau = c;

  document.querySelectorAll(".creneau-btn").forEach(btn => {
    btn.classList.remove("selected");
  });

  event.currentTarget.classList.add("selected");

  document.getElementById("resumeDate").textContent = formatDate(c.date);
  document.getElementById("resumeHeure").textContent =
    `${c.heure_debut} - ${c.heure_fin}`;
}

async function ajouterAuPanier() {
  if (!selectedCreneau) {
    alert("Choisis d'abord une date et un horaire.");
    return;
  }

  const user = JSON.parse(localStorage.getItem("user"));

  try {
    const res = await fetch("../backend/ajouter_panier_reservation.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_etudiant: user.id,
        id_creneau: selectedCreneau.id_creneau,
        date: selectedCreneau.date,
        heure_debut: selectedCreneau.heure_debut,
        heure_fin: selectedCreneau.heure_fin,
        id_service: service.id
      })
    });

    const data = await res.json();

    if (data.success) {
      const allerPanier = confirm(
        "Créneau ajouté au panier !\n\nOK = aller au panier\nAnnuler = retour au catalogue"
      );

      if (allerPanier) {
        window.location.href = "panier.html";
      } else {
        window.location.href = "catalogue.html";
      }

    } else {
      alert(data.error);
    }

  } catch (error) {
    alert("Erreur de connexion au serveur.");
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function jourCourt(dateStr) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    weekday: "short"
  });
}

function jourNumero(dateStr) {
  return new Date(dateStr).getDate();
}

function moisCourt(dateStr) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    month: "short"
  });
}