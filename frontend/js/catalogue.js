document.addEventListener("DOMContentLoaded", () => {
  afficherUtilisateurCatalogue();
  initCatalogue();
  initFiltres();
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

  if (avatar) {
    avatar.textContent =
      `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  }

  if (name) {
    name.textContent = `${prenom} ${nom}`.trim();
  }
}

function toggleAccountMenu() {
  const menu = document.getElementById("accountMenu");

  if (menu) {
    menu.classList.toggle("hidden");
  }
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "accueil.html";
}

function toggleContactBox() {
  const box = document.getElementById("contactBox");

  if (box) {
    box.classList.toggle("hidden");
  }
}

const services = [
  {
    nom: "Consultation médicale générale",
    image: "images/consultation.jpg",
    praticien: "Dr. Marie Martin",
    specialite: "Médecin généraliste",
    categorie: "medecine",
    modes: ["Présentiel", "Vidéo"],
    duree: 30,
    prix: "25 €",
    note: "4.8",
    avis: "124 avis",
    badge: "Populaire"
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
    badge: ""
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
    badge: "Nouveau"
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
    badge: ""
  }
];

let currentCategory = "all";
let selectedModes = [];
let selectedDuration = "all";

function initCatalogue() {

  const searchInput = document.getElementById("searchInput");

  const tabButtons = document.querySelectorAll(
    ".catalogue-tabs button"
  );

  if (searchInput) {
    searchInput.addEventListener("input", renderServices);
  }

  tabButtons.forEach(button => {

    button.addEventListener("click", () => {

      tabButtons.forEach(btn =>
        btn.classList.remove("active")
      );

      button.classList.add("active");

      currentCategory = button.dataset.category;

      renderServices();
    });

  });

  renderServices();
}

function initFiltres() {

  const modeCheckboxes =
    document.querySelectorAll(".filter-mode");

  const durationButtons =
    document.querySelectorAll(".duration-filter");

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

      durationButtons.forEach(btn =>
        btn.classList.remove("active")
      );

      button.classList.add("active");

      selectedDuration = button.dataset.duration;

      renderServices();
    });

  });
}

function renderServices() {

  const servicesList =
    document.getElementById("servicesList");

  const searchInput =
    document.getElementById("searchInput");

  if (!servicesList) return;

  const search =
    searchInput ?
    searchInput.value.toLowerCase() :
    "";

  const filtered = services.filter(service => {

    const matchCategory =
      currentCategory === "all" ||
      service.categorie === currentCategory;

    const matchSearch =
      service.nom.toLowerCase().includes(search) ||
      service.praticien.toLowerCase().includes(search) ||
      service.specialite.toLowerCase().includes(search);

    const matchModes =
      selectedModes.length === 0 ||
      selectedModes.some(mode =>
        service.modes.includes(mode)
      );

    let matchDuration = true;

    if (selectedDuration !== "all") {

      if (selectedDuration === "15") {
        matchDuration = service.duree <= 15;
      }

      if (selectedDuration === "30") {
        matchDuration = service.duree <= 30;
      }

      if (selectedDuration === "45") {
        matchDuration = service.duree <= 45;
      }

      if (selectedDuration === "60") {
        matchDuration = service.duree >= 60;
      }
    }

    return (
      matchCategory &&
      matchSearch &&
      matchModes &&
      matchDuration
    );
  });

  servicesList.innerHTML = "";

  if (filtered.length === 0) {

    servicesList.innerHTML = `
      <p class="empty-state">
        Aucun service trouvé.
      </p>
    `;

    return;
  }

  filtered.forEach(service => {

    servicesList.innerHTML += `

      <div class="catalogue-card">

        <div class="catalogue-card-image">

          ${
            service.badge
            ?
            `<span class="service-badge">${service.badge}</span>`
            :
            ""
          }

          <div class="service-icon-main">
            ♡
          </div>

        </div>

        <div class="catalogue-card-content">

          <h2>${service.nom}</h2>

          <p class="praticien">
            ${service.praticien}
          </p>

          <p class="specialite">
            ${service.specialite}
          </p>

          <div class="service-modes">

            ${service.modes.map(mode => `
              <span>${mode}</span>
            `).join("")}

          </div>

          <div class="service-info">

            <span>
              🕒 ${service.duree} min
            </span>

            <strong>
              ${service.prix}
            </strong>

          </div>

          <p class="service-note">
            ⭐ ${service.note}
            <span>(${service.avis})</span>
          </p>

        </div>

        <a class="details-btn" href="#">
          Voir détails
        </a>

      </div>
    `;
  });
}
