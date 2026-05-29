let services = [];
let currentCategory = "all";
let selectedModes = [];
let selectedDuration = "all";
let smallMap = null;

document.addEventListener("DOMContentLoaded", async () => {
  afficherUtilisateurCatalogue();
  initFiltres();
  await chargerServicesCatalogue();
});

function afficherUtilisateurCatalogue() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const prenom = user.prenom || "";
  const nom = user.nom || "";

  const avatar = document.getElementById("studentAvatar");
  const name = document.getElementById("studentName");

  if (avatar) avatar.textContent = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  if (name) name.textContent = `${prenom} ${nom}`.trim();
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

async function chargerServicesCatalogue() {
  try {
    const res = await fetch("../backend/lister_services_catalogue.php");
    const data = await res.json();
  

    if (!data.success) {
      document.getElementById("servicesList").innerHTML =
        `<p class="empty-state">Erreur : ${data.error}</p>`;
      return;
    }

    services = data.services.map(service => ({
      id: service.id,
      nom: service.nom,
      description: service.description,
      image:
  service.specialite === "nutrition"
    ? "images/nutrition.jpg"
    : service.specialite === "psychologie"
    ? "images/psychologie.jpg"
    : service.specialite === "sport"
    ? "images/yoga.jpg"
    : "images/consultation.jpg",

      praticien: `${service.praticien_prenom} ${service.praticien_nom}`,
      specialite: service.specialite || "Praticien",
      categorie: convertirCategorie(service.categorie),
      modes: ["Présentiel"],
      duree: Number(service.duree_min),
      prix: `${Number(service.prix).toFixed(2)} €`,
      lat: service.latitude ? Number(service.latitude) : 48.8566,
      lng: service.longitude ? Number(service.longitude) : 2.3522,
      adresse: service.adresse_pro || "Adresse non renseignée"
    }));

    initCatalogue();
    renderServices();
    initMap();

  } catch (error) {
    document.getElementById("servicesList").innerHTML =
      `<p class="empty-state">Erreur de connexion au serveur.</p>`;
  }
}

function convertirCategorie(categorie) {
  if (categorie === "consultation" || categorie === "therapie") return "medecine";
  if (categorie === "nutrition") return "nutrition";
  if (categorie === "sport") return "sport";
  if (categorie === "bien_etre") return "bien_etre";
  return "all";
}

function initCatalogue() {
  const searchInput = document.getElementById("searchInput");
  const tabButtons = document.querySelectorAll(".catalogue-tabs button");

  if (searchInput) {
    searchInput.addEventListener("input", renderServices);
  }

  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      tabButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      currentCategory = button.dataset.category;
      renderServices();
    });
  });
}

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

function renderServices() {
  const servicesList = document.getElementById("servicesList");
  const searchInput = document.getElementById("searchInput");

  if (!servicesList) return;

  const search = searchInput ? searchInput.value.toLowerCase() : "";

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
    servicesList.innerHTML = `<p class="empty-state">Aucun service disponible pour le moment.</p>`;
    return;
  }

  filtered.forEach(service => {
    servicesList.innerHTML += `
      <div class="catalogue-card">
        <div class="catalogue-card-image">
          <img src="${service.image}" alt="${service.nom}">
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

          <p class="service-note">📍 ${service.adresse}</p>
        </div>

        <a class="details-btn" href="voir_horaires.html?id=${service.id}">
          Voir horaires
        </a>
      </div>
    `;
  });
}

function initMap() {
  if (typeof L === "undefined") return;

  const mapElement = document.getElementById("doctorMap");
  if (!mapElement) return;

  let smallMap = L.map("doctorMap").setView([48.8566, 2.3522], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(smallMap);

  services.forEach(service => {
    L.marker([service.lat, service.lng])
      .addTo(smallMap)
      .bindPopup(`
        <strong>${service.praticien}</strong><br>
        ${service.specialite}<br>
        ${service.nom}<br>
        ${service.adresse}
      `);
  });

  const modal = document.getElementById("mapModal");
  const expandBtn = document.getElementById("expandMapBtn");
  const closeBtn = document.getElementById("closeMapBtn");

  let largeMap = null;

  expandBtn.onclick = () => {
    modal.classList.remove("hidden");

    setTimeout(() => {
      if (!largeMap) {
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
              ${service.nom}<br>
              ${service.adresse}
            `);
        });
      }

      largeMap.invalidateSize();
    }, 300);
  };

  closeBtn.onclick = () => {
    modal.classList.add("hidden");
  };

  setTimeout(() => {
    smallMap.invalidateSize();
  }, 300);
}