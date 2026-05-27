const services = [
  {
    nom: "Consultation médicale générale",
    praticien: "Dr. Marie Martin",
    specialite: "Médecin généraliste",
    categorie: "medecine",
    modes: ["Présentiel", "Vidéo"],
    duree: "30 min",
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
    duree: "45 min",
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
    duree: "40 min",
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
    duree: "60 min",
    prix: "20 €",
    note: "4.9",
    avis: "102 avis",
    badge: "Populaire",
    lat: 48.8412,
    lng: 2.2875,
    adresse: "Paris 15e"
  }
];

const servicesList = document.getElementById("servicesList");
const searchInput = document.getElementById("searchInput");
const tabButtons = document.querySelectorAll(".catalogue-tabs button");

let currentCategory = "all";

function renderServices() {
  const search = searchInput.value.toLowerCase();

  const filtered = services.filter(service => {
    const matchCategory = currentCategory === "all" || service.categorie === currentCategory;
    const matchSearch =
      service.nom.toLowerCase().includes(search) ||
      service.praticien.toLowerCase().includes(search) ||
      service.specialite.toLowerCase().includes(search);

    return matchCategory && matchSearch;
  });

  servicesList.innerHTML = "";

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
          <span>🕒 ${service.duree}</span>
          <strong>${service.prix}</strong>
        </div>

        <p class="service-note">⭐ ${service.note} <span>(${service.avis})</span></p>
      </div>

      <a class="details-btn" href="details_service.html">Voir détails</a>
    `;

    servicesList.appendChild(card);
  });
}

tabButtons.forEach(button => {
  button.addEventListener("click", () => {
    tabButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    currentCategory = button.dataset.category;
    renderServices();
  });
});

searchInput.addEventListener("input", renderServices);

renderServices();

/* MAP */
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