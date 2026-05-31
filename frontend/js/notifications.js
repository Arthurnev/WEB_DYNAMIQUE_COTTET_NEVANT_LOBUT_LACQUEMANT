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

  chargerNotificationsDropdown();
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
  window.location.href = "Accueil.html";
}

/* ===================== DROPDOWN ===================== */

function initNotifDropdown() {
  const bell = document.getElementById("notifBell");
  const dropdown = document.getElementById("notifDropdown");

  if (!bell || !dropdown) return;

  bell.addEventListener("click", function (e) {
    e.stopPropagation();

    if (dropdown.style.display === "none" || dropdown.style.display === "") {
      dropdown.style.display = "block";
      chargerNotificationsDropdown();
    } else {
      dropdown.style.display = "none";
    }
  });

  document.addEventListener("click", function (e) {
    if (!bell.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });
}

async function chargerNotificationsDropdown() {
  try {
    const res = await fetch("../backend/notifications.php", {
      credentials: "include"
    });

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
  const container = document.getElementById("notifDropdownList");
  if (!container) return;

  container.innerHTML = "";

  const sorted = [...notifications].sort((a, b) => new Date(b.date) - new Date(a.date));
  const max = sorted.slice(0, 5);

  if (max.length === 0) {
    container.innerHTML = `
      <div style="padding:14px;color:#64748b;">
        Aucune notification
      </div>
    `;
    return;
  }

  max.forEach(notif => {
    const estLu = Number(notif.lu) === 1;

    const dateObj = new Date(notif.date);
    const dateStr = dateObj.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit"
    });

    const heureStr = dateObj.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit"
    });

    container.innerHTML += `
      <div
        onclick="ouvrirNotification(${notif.id})"
        style="
          padding:12px;
          border-bottom:1px solid #eee;
          cursor:pointer;
          background:${estLu ? "white" : "#f0fdf4"};
          display:flex;
          gap:10px;
          align-items:flex-start;
        "
      >
        <div style="
          width:34px;
          height:34px;
          border-radius:10px;
          background:#eaf7ef;
          color:#2e8b57;
          display:flex;
          align-items:center;
          justify-content:center;
          flex-shrink:0;
        ">
          <i class="fas ${getIconFa(notif.type)}"></i>
        </div>

        <div style="flex:1;">
          <div style="font-weight:800;color:#163b63;font-size:14px;">
            ${notif.titre || typeLabel(notif.type)}
          </div>

          <div style="font-size:13px;color:#475569;margin-top:4px;">
            ${notif.message}
          </div>

          <div style="font-size:12px;color:#94a3b8;margin-top:6px;">
            ${dateStr} à ${heureStr}
          </div>
        </div>

        ${!estLu ? `
          <div style="
            width:9px;
            height:9px;
            border-radius:50%;
            background:#2e8b57;
            margin-top:8px;
          "></div>
        ` : ""}
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
    const res = await fetch("../backend/marquer_notification_lu.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
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
      headers: { "Content-Type": "application/json" },
      credentials: "include"
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

/* ===================== PAGE NOTIFICATIONS ===================== */

async function chargerNotificationsPage() {
  const pageContainer = document.getElementById("notifications-list");

  if (!pageContainer) return;

  try {
    const res = await fetch("../backend/notifications.php", {
      credentials: "include"
    });

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
    const estLu = Number(notif.lu) === 1;
    const cardClass = estLu ? "notif-card read" : "notif-card unread";

    const dateObj = new Date(notif.date);

    const dateStr = dateObj.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
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
          <div class="notif-title">
            ${notif.titre || typeLabel(notif.type)}
          </div>

          <div class="notif-message">
            ${notif.message}
          </div>

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
    const res = await fetch("../backend/marquer_notification_lu.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id })
    });

    const data = await res.json();

    if (data.success) {
      await chargerNotificationsPage();
      await chargerNotificationsDropdown();
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
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });

    const data = await res.json();

    if (data.success) {
      await chargerNotificationsPage();
      await chargerNotificationsDropdown();
    } else {
      alert("Erreur : " + data.error);
    }

  } catch (error) {
    console.error("Erreur:", error);
  }
}

/* ===================== COMPTEURS ===================== */

function mettreAJourCompteurs(notifications) {
  const nonLues = notifications.filter(n => Number(n.lu) === 0).length;

  const topbarCounter = document.getElementById("topbarNotifCount");
  const sidebarCounter = document.getElementById("sidebarNotifCount");
  const unreadCount = document.getElementById("unread-count");

  if (topbarCounter) {
    topbarCounter.textContent = nonLues;
    topbarCounter.style.display = nonLues > 0 ? "inline-block" : "none";
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

/* ===================== UTILS ===================== */

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
    case "info":
      return "fa-info-circle";
    default:
      return "fa-info-circle";
  }
}

function typeLabel(type) {
  switch (type) {
    case "rappel":
      return "Rappel";
    case "confirmation":
      return "Confirmation";
    case "annulation":
      return "Annulation";
    case "nouveaute":
      return "Nouveauté";
    case "info":
      return "Information";
    default:
      return "Notification";
  }
}

function toggleContactBox() {
  const box = document.getElementById("contactBox");
  if (box) {
    box.classList.toggle("hidden");
  }
}