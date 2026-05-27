document.addEventListener("DOMContentLoaded", () => {
  afficherUtilisateur();
  initCatalogue();
  initFiltres();
  initMap();
});

/* ================= UTILISATEUR ================= */

function afficherUtilisateur() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const prenom = user.prenom || "";
  const nom = user.nom || "";

  const initials = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();

  document.getElementById("studentAvatar").textContent = initials || "?";
  document.getElementById("studentName").textContent = `${prenom} ${nom}`.trim();
}

function toggleAccountMenu() {
  document.getElementById("accountMenu").classList.toggle("hidden");
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "accueil.html";
}

/* ================= DONNÉES TEMPORAIRES ================= */

const services = [
  {
    nom: "Consultation médicale générale",
    praticien: "Dr. Marie Martin",
    specialite: "Médecin généraliste",
    categorie: "medecine",
    modes: ["Présentiel", "Vidéo"],
    duree: 30,
    prix: "25 €",
    note: "4.8",
    avis: "124 avis",
    badge: "Populaire",
    lat: 48.8529,
    lng: 2.3499,
    adresse: "Paris 5e"
  },
  {
    nom: "Soutien psychologique",
    praticien: "Sophie Dubois",
    specialite: "Psychologue",
    categorie: "bien_etre",
    modes: ["Vidéo", "Téléphone"],
    duree: 45,
    prix: "15 €",
    note: "4.9",
    avis: "87 avis",
    badge: "",
    lat: 48.8566,
    lng: 2.3522,
    adresse: "Paris Centre"
  },
  {
    nom: "Consultation nutritionnelle",
    praticien: "Paul Lefebvre",
    specialite: "Nutritionniste",
    categorie: "nutrition",
    modes: ["Présentiel", "Vidéo"],
    duree: 40,
    prix: "30 €",
    note: "4.7",
    avis: "56 avis",
    badge: "Nouveau",
    lat: 48.8666,
    lng: 2.3333,
    adresse: "Paris 2e"
  },
  {
    nom: "Séance de yoga",
    praticien: "Camille Bernard",
    specialite: "Coach bien-être",
    categorie: "sport",
    modes: ["Présentiel"],
    duree: 60,
    prix: "20 €",
    note: "4.9",
    avis: "102 avis",
    badge: "Populaire",
    lat: 48.8412,
    lng: 2.2875,
    adresse: "Paris 15e"
  }
];

let currentCategory = "all";
let selectedModes = [];
let selectedDuration = "all";

/* ================= CATALOGUE ================= */

function initCatalogue() {
  const searchInput = document.getElementById("searchInput");
  const tabButtons = document.querySelectorAll(".catalogue-tabs button");

  searchInput.addEventListener("input", renderServices);

  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      tabButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      currentCategory = button.dataset.category;
      renderServices();
    });
  });

  renderServices();
}

function renderServices() {
  const servicesList = document.getElementById("servicesList");
  const searchInput = document.getElementById("searchInput");
  const search = searchInput.value.toLowerCase();

  const filtered = services.filter(service => {
    const matchCategory =
      currentCategory === "all" || service.categorie === currentCategory;

    const matchSearch =
      service.nom.toLowerCase().includes(search) ||
      service.praticien.toLowerCase().includes(search) ||
      service.specialite.toLowerCase().includes(search);

    const matchModes =
      selectedModes.length === 0 ||
      selectedModes.some(mode => service.modes.includes(mode));

    let matchDuration = true;

    if (selectedDuration !== "all") {
      if (selectedDuration === "15") matchDuration = service.duree <= 15;
      if (selectedDuration === "30") matchDuration = service.duree <= 30;
      if (selectedDuration === "45") matchDuration = service.duree <= 45;
      if (selectedDuration === "60") matchDuration = service.duree >= 60;
    }

    return matchCategory && matchSearch && matchModes && matchDuration;
  });

  servicesList.innerHTML = "";

  if (filtered.length === 0) {
    servicesList.innerHTML = `<p class="empty-state">Aucun service trouvé.</p>`;
    return;
  }

  filtered.forEach(service => {
    const card = document.createElement("div");
    card.className = "catalogue-card";

    card.innerHTML = `
      <div class="catalogue-card-image">
        ${service.badge ? `<span class="service-badge">${service.badge}</span>` : ""}
        <div class="service-icon-main">♡</div>
      </div>

      <div class="catalogue-card-content">
        <h2>${service.nom}</h2>
        <p class="praticien">${service.praticien}</p>
        <p class="specialite">${service.specialite}</p>

        <div class="service-modes">
          ${service.modes.map(mode => `<span>${mode}</span>`).join("")}
        </div>

        <div class="service-info">
          <span>🕒 ${service.duree} min</span>
          <strong>${service.prix}</strong>
        </div>

        <p class="service-note">⭐ ${service.note} <span>(${service.avis})</span></p>
      </div>

      <a class="details-btn" href="details_service.html">Voir détails</a>
    `;

    servicesList.appendChild(card);
  });
}

/* ================= FILTRES ================= */

function initFiltres() {
  const modeCheckboxes = document.querySelectorAll(".filter-mode");
  const durationButtons = document.querySelectorAll(".duration-filter");

  modeCheckboxes.forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      selectedModes = Array.from(modeCheckboxes)
        .filter(input => input.checked)
        .map(input => input.value);

      renderServices();
    });
  });

  durationButtons.forEach(button => {
    button.addEventListener("click", () => {
      durationButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      selectedDuration = button.dataset.duration;
      renderServices();
    });
  });
}

/* ================= MAP ================= */

function initMap() {
  if (typeof L === "undefined") {
    console.error("Leaflet n'est pas chargé.");
    return;
  }

  const smallMap = L.map("doctorMap").setView([48.8566, 2.3522], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(smallMap);

  services.forEach(service => {
    L.marker([service.lat, service.lng])
      .addTo(smallMap)
      .bindPopup(`
        <strong>${service.praticien}</strong><br>
        ${service.specialite}<br>
        ${service.adresse}<br>
        ${service.nom}
      `);
  });

  const mapModal = document.getElementById("mapModal");
  const expandMapBtn = document.getElementById("expandMapBtn");
  const closeMapBtn = document.getElementById("closeMapBtn");

  let largeMapLoaded = false;
  let largeMap;

  expandMapBtn.addEventListener("click", () => {
    mapModal.classList.remove("hidden");

    setTimeout(() => {
      if (!largeMapLoaded) {
        largeMap = L.map("doctorMapLarge").setView([48.8566, 2.3522], 12);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap"
        }).addTo(largeMap);

        services.forEach(service => {
          L.marker([service.lat, service.lng])
            .addTo(largeMap)
            .bindPopup(`
              <strong>${service.praticien}</strong><br>
              ${service.specialite}<br>
              ${service.adresse}<br>
              ${service.nom}
            `);
        });

        largeMapLoaded = true;
      } else {
        largeMap.invalidateSize();
      }
    }, 200);
  });

  closeMapBtn.addEventListener("click", () => {
    mapModal.classList.add("hidden");
  });
}