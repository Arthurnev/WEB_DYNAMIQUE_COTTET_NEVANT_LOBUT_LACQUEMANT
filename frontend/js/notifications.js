let allNotifications = [];
let currentFilter = "all";

document.addEventListener("DOMContentLoaded", function () {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  afficherUtilisateur(user);
  initAccountMenu();
  initNotifDropdown();
  initFiltres();

  chargerNotificationsPage();
});

function afficherUtilisateur(user) {
  const prenom = user.prenom || "";
  const nom = user.nom || "";

  const fullName = `${prenom} ${nom}`.trim();
  const initials = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();

  const studentName = document.getElementById("studentName");
  const studentAvatar = document.getElementById("studentAvatar");

  if (studentName) studentName.textContent = fullName;
  if (studentAvatar) studentAvatar.textContent = initials || "?";
}

function toggleAccountMenu() {
  const menu = document.getElementById("accountMenu");
  if (menu) menu.classList.toggle("hidden");
}

function initAccountMenu() {
  document.addEventListener("click", function (e) {
    const wrapper = document.querySelector(".account-wrapper");
    const menu = document.getElementById("accountMenu");

    if (!wrapper || !menu) return;

    if (!wrapper.contains(e.target)) {
      menu.classList.add("hidden");
    }
  });
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "accueil.html";
}

function initFiltres() {
  const buttons = document.querySelectorAll(".filter-btn");

  buttons.forEach(button => {
    button.addEventListener("click", function () {
      buttons.forEach(btn => btn.classList.remove("active"));
      this.classList.add("active");

      currentFilter = this.dataset.filter;
      afficherNotificationsPage();
    });
  });
}

/* ===================== DROPDOWN ===================== */

function initNotifDropdown() {
  const bell = document.getElementById("notif-bell");
  const dropdown = document.getElementById("notif-dropdown");

  if (!bell || !dropdown) return;

  bell.addEventListener("click", function (e) {
    e.stopPropagation();
    dropdown.classList.toggle("open");

    if (dropdown.classList.contains("open")) {
      chargerNotificationsDropdown();
    }
  });

  document.addEventListener("click", function (e) {
    if (!bell.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove("open");
    }
  });
}

async function chargerNotificationsDropdown() {
  try {
    const res = await fetch("../backend/notifications.php");
    const data = await res.json();

    if (!data.success) {
      console.error("Erreur:", data.error);
      return;
    }

    afficherDropdownNotifications(data.notifications);
    mettreAJourCompteurs(data.notifications);

  } catch (error) {
    console.error("Erreur de chargement:", error);
  }
}

function afficherDropdownNotifications(notifications) {
  const container = document.getElementById("notif-dropdown-list");
  if (!container) return;

  container.innerHTML = "";

  const sorted = [...notifications].sort((a, b) => new Date(b.date) - new Date(a.date));
  const max = sorted.slice(0, 5);

  if (max.length === 0) {
    container.innerHTML = `<div class="notif-empty">Aucune notification</div>`;
    return;
  }

  max.forEach(notif => {
    const estLu = notif.lu == 1;
    const itemClass = estLu ? "notif-dropdown-item read" : "notif-dropdown-item unread";

    const dateObj = new Date(notif.date);
    const dateStr = dateObj.toLocaleDateString("fr-FR", { day: "numeric", month: "numeric" });
    const heureStr = dateObj.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

    container.innerHTML += `
      <div class="${itemClass}" onclick="ouvrirNotification(${notif.id})">
        <div class="notif-dropdown-icon ${notif.type}">
          <i class="fas ${getIconFa(notif.type)}"></i>
        </div>

        <div class="notif-dropdown-content">
          <div class="notif-dropdown-title">${notif.titre}</div>
          <div class="notif-dropdown-message">${notif.message}</div>
          <div class="notif-dropdown-date">${dateStr} à ${heureStr}</div>
        </div>

        ${!estLu ? '<div class="notif-dot"></div>' : ""}
      </div>
    `;
  });
}

async function ouvrirNotification(id) {
  await marquerCommeLuDropdown(id);
  window.location.href = "notifications.html";
}

async function marquerCommeLuDropdown(id) {
  try {
    const res = await fetch("../backend/marquer_notification_lue.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });

    const data = await res.json();

    if (!data.success) {
      console.error("Erreur backend:", data.error);
    }

    await chargerNotificationsDropdown();
    await chargerNotificationsPage();

  } catch (error) {
    console.error("Erreur réseau:", error);
  }
}

async function marquerToutLuDropdown() {
  if (!confirm("Marquer toutes les notifications comme lues ?")) return;

  try {
    const res = await fetch("../backend/marquer_tout_lu.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();

    if (data.success) {
      await chargerNotificationsDropdown();
      await chargerNotificationsPage();
    } else {
      console.error("Erreur backend:", data.error);
    }

  } catch (error) {
    console.error("Erreur réseau:", error);
  }
}

/* ===================== PAGE ===================== */

async function chargerNotificationsPage() {
  try {
    const res = await fetch("../backend/notifications.php");
    const data = await res.json();

    if (!data.success) {
      console.error("Erreur:", data.error);
      return;
    }

    allNotifications = data.notifications;
    afficherNotificationsPage();
    mettreAJourCompteurs(allNotifications);

  } catch (error) {
    console.error("Erreur de chargement:", error);
  }
}

function afficherNotificationsPage() {
  const container = document.getElementById("notifications-list");
  if (!container) return;

  container.innerHTML = "";

  let notifications = [...allNotifications];

  if (currentFilter !== "all") {
    notifications = notifications.filter(notif => notif.type === currentFilter);
  }

  notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (notifications.length === 0) {
    container.innerHTML = `
      <div class="notif-empty-page">
        <i class="fas fa-bell-slash"></i>
        <p>Aucune notification</p>
        <span>Vous n'avez aucune notification pour cette catégorie.</span>
      </div>
    `;
    return;
  }

  notifications.forEach(notif => {
    const estLu = notif.lu == 1;
    const cardClass = estLu ? "notif-card read" : "notif-card unread";

    const dateObj = new Date(notif.date);
    const dateStr = dateObj.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "numeric",
      year: "numeric"
    });
    const heureStr = dateObj.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit"
    });

    container.innerHTML += `
      <div class="${cardClass}" data-id="${notif.id}">
        <div class="notif-icon ${notif.type}">
          <i class="fas ${getIconFa(notif.type)}"></i>
        </div>

        <div class="notif-content">
          <div class="notif-title">${notif.titre}</div>
          <div class="notif-message">${notif.message}</div>

          <div class="notif-date">
            <i class="far fa-calendar"></i>
            ${dateStr} à ${heureStr}
          </div>

          ${!estLu ? `
            <div class="notif-actions">
              <button class="notif-action-btn" onclick="marquerCommeLuPage(${notif.id})">
                <i class="fas fa-check"></i>
                Marquer comme lu
              </button>
            </div>
          ` : ""}
        </div>

        ${!estLu ? '<div class="notif-dot"></div>' : ""}
      </div>
    `;
  });
}

function initFiltres() {
  const buttons = document.querySelectorAll(".filter-btn");

  buttons.forEach(button => {
    button.addEventListener("click", function () {
      buttons.forEach(btn => btn.classList.remove("active"));
      this.classList.add("active");

      currentFilter = this.dataset.filter;
      afficherNotificationsPage();
    });
  });
}

async function marquerCommeLuPage(id) {
  try {
    const res = await fetch("../backend/marquer_notification_lue.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });

    const data = await res.json();

    if (data.success) {
      await chargerNotificationsPage();
    } else {
      alert("Erreur : " + data.error);
    }

  } catch (error) {
    console.error("Erreur:", error);
  }
}

async function marquerToutLuPage() {
  if (!confirm("Marquer toutes les notifications comme lues ?")) return;

  try {
    const res = await fetch("../backend/marquer_tout_lu.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();

    if (data.success) {
      await chargerNotificationsPage();
    } else {
      alert("Erreur : " + data.error);
    }

  } catch (error) {
    console.error("Erreur:", error);
  }
}

/* ===================== UTILS ===================== */

function mettreAJourCompteurs(notifications) {
  const nonLues = notifications.filter(n => n.lu == 0).length;

  const topbarCounter = document.getElementById("topbar-notif-count");
  const sidebarCounter = document.getElementById("sidebar-notif-count");
  const unreadCount = document.getElementById("unread-count");

  if (topbarCounter) {
    topbarCounter.textContent = nonLues;
    topbarCounter.style.display = nonLues > 0 ? "flex" : "none";
  }

  if (sidebarCounter) {
    sidebarCounter.textContent = nonLues;
    sidebarCounter.style.display = nonLues > 0 ? "inline-block" : "none";
  }

  if (unreadCount) {
    unreadCount.textContent =
      `${nonLues} notification${nonLues > 1 ? "s" : ""} non lue${nonLues > 1 ? "s" : ""}`;
  }
}

function getIconFa(type) {
  switch (type) {
    case "rappel":
      return "fa-bell";
    case "confirmation":
      return "fa-check-circle";
    case "annulation":
      return "fa-times-circle";
    case "nouveaute":
      return "fa-star";
    default:
      return "fa-info-circle";
  }
}