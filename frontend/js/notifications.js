document.addEventListener("DOMContentLoaded", function () {
    // Récupérer l'utilisateur connecté
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    document.getElementById("user-name").textContent = user.prenom + " " + user.nom;

    // Initialiser le dropdown
    initNotifDropdown();

    // Charger les notifications si on est sur la page notifications.html
    if (window.location.pathname.includes("notifications.html")) {
        chargerNotificationsPage();
    }
});

// ===== MENU DÉROULANT =====

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

        const notifications = data.notifications;
        afficherDropdownNotifications(notifications);
        mettreAJourCompteurs(notifications);

    } catch (error) {
        console.error("Erreur de chargement:", error);
    }
}

function afficherDropdownNotifications(notifications) {
    const container = document.getElementById("notif-dropdown-list");
    if (!container) return;

    container.innerHTML = "";

    // Trier par date (plus récentes d'abord)
    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Limiter à 5 notifications
    const max = notifications.slice(0, 5);

    if (max.length === 0) {
        container.innerHTML = `
            <div style="padding:20px; text-align:center; color:#9ca3af;">
                <p>Aucune notification</p>
            </div>
        `;
        return;
    }

    max.forEach(notif => {
        const estLu = notif.lu == 1;
        const itemClass = estLu ? "notif-dropdown-item read" : "notif-dropdown-item unread";
        const iconClass = getIconClassDropdown(notif.type);

        const dateObj = new Date(notif.date);
        const dateStr = dateObj.toLocaleDateString("fr-FR", { day: 'numeric', month: 'numeric' });
        const heureStr = dateObj.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' });

        const html = `
            <div class="${itemClass}" onclick="ouvrirNotification(${notif.id})">
                <div class="notif-dropdown-icon ${iconClass}">
                    <i class="fas ${getIconFaDropdown(notif.type)}"></i>
                </div>
                <div class="notif-dropdown-content">
                    <div class="notif-dropdown-title">${notif.titre}</div>
                    <div class="notif-dropdown-message">${notif.message}</div>
                    <div class="notif-dropdown-date">${dateStr} à ${heureStr}</div>
                </div>
                ${!estLu ? '<div class="notif-dot"></div>' : ''}
            </div>
        `;
        container.innerHTML += html;
    });
}

function getIconClassDropdown(type) {
    switch(type) {
        case 'rappel': return 'rappel';
        case 'confirmation': return 'confirmation';
        case 'annulation': return 'annulation';
        case 'nouveaute': return 'nouveaute';
        default: return 'info';
    }
}

function getIconFaDropdown(type) {
    switch(type) {
        case 'rappel': return 'fa-bell';
        case 'confirmation': return 'fa-check-circle';
        case 'annulation': return 'fa-times-circle';
        case 'nouveaute': return 'fa-star';
        default: return 'fa-info-circle';
    }
}

function mettreAJourCompteurs(notifications) {
    const nonLues = notifications.filter(n => n.lu == 0).length;
    const counter = document.getElementById("topbar-notif-count");
    if (counter) {
        counter.textContent = nonLues;
        counter.style.display = nonLues > 0 ? 'block' : 'none';
    }
}

async function ouvrirNotification(id) {
    // Marquer comme lu dans le menu
    await marquerCommeLuDropdown(id);
    // Rediriger vers la page notifications
    window.location.href = "notifications.html";
}

async function marquerCommeLuDropdown(id) {
    // 1. Marquer comme lu dans le DOM (visuel immédiat)
    const item = document.querySelector(`.notif-dropdown-item[onclick="ouvrirNotification(${id})"]`);
    if (item) {
        item.classList.remove("unread");
        item.classList.add("read");
        const dot = item.querySelector(".notif-dot");
        if (dot) dot.style.display = "none";
    }
    
    // 2. Envoyer la demande au backend
    try {
        const res = await fetch("../backend/marquer_notification_lue.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id })
        });
        const data = await res.json();
        if (!data.success) {
            console.error("Erreur backend:", data.error);
        }
    } catch (error) {
        console.error("Erreur réseau:", error);
    }
    
    // 3. Mettre à jour le compteur
    const counter = document.getElementById("topbar-notif-count");
    if (counter) {
        let current = parseInt(counter.textContent) || 0;
        if (current > 0) {
            current--;
            counter.textContent = current;
            if (current === 0) counter.style.display = "none";
        }
    }
}

async function marquerToutLuDropdown() {
    if (!confirm("Marquer toutes les notifications comme lues ?")) return;
    
    // Marquer toutes les notifications comme lues dans le DOM
    document.querySelectorAll(".notif-dropdown-item.unread").forEach(item => {
        item.classList.remove("unread");
        item.classList.add("read");
        const dot = item.querySelector(".notif-dot");
        if (dot) dot.style.display = "none";
    });
    
    // Envoyer la demande au backend
    try {
        const res = await fetch("../backend/marquer_tout_lu.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        if (!data.success) {
            console.error("Erreur backend:", data.error);
        }
    } catch (error) {
        console.error("Erreur réseau:", error);
    }
    
    // Mettre à jour le compteur
    const counter = document.getElementById("topbar-notif-count");
    if (counter) {
        counter.textContent = "0";
        counter.style.display = "none";
    }
}

// ===== PAGE NOTIFICATIONS (pleine page) =====

async function chargerNotificationsPage() {
    try {
        const res = await fetch("../backend/notifications.php");
        const data = await res.json();

        if (!data.success) {
            console.error("Erreur:", data.error);
            return;
        }

        const notifications = data.notifications;
        afficherNotificationsPage(notifications);
        mettreAJourCompteurs(notifications);

    } catch (error) {
        console.error("Erreur de chargement:", error);
    }
}

function afficherNotificationsPage(notifications) {
    const container = document.getElementById("notifications-list");
    if (!container) return;

    container.innerHTML = "";

    // Trier par date (plus récentes d'abord)
    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (notifications.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:60px 20px; color:#9ca3af;">
                <i class="fas fa-bell-slash" style="font-size:48px; margin-bottom:16px; color:#d1d5db;"></i>
                <p style="font-size:18px; font-weight:600; color:#6b7280;">Aucune notification</p>
                <p style="font-size:14px; margin-top:4px;">Vous n'avez aucune notification pour le moment.</p>
            </div>
        `;
        return;
    }

    // Mettre à jour le compteur de la page
    const nonLues = notifications.filter(n => n.lu == 0).length;
    document.getElementById("unread-count").textContent = nonLues + " notification" + (nonLues > 1 ? "s" : "") + " non lue" + (nonLues > 1 ? "s" : "");

    notifications.forEach(notif => {
        const estLu = notif.lu == 1;
        const cardClass = estLu ? "notif-card read" : "notif-card unread";
        const iconClass = getIconClassPage(notif.type);

        const dateObj = new Date(notif.date);
        const dateStr = dateObj.toLocaleDateString("fr-FR", { day: 'numeric', month: 'numeric', year: 'numeric' });
        const heureStr = dateObj.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' });

        const html = `
            <div class="${cardClass}" data-id="${notif.id}">
                <div class="notif-icon ${iconClass}">
                    <i class="fas ${getIconFaPage(notif.type)}"></i>
                </div>
                <div class="notif-content">
                    <div class="notif-title">${notif.titre}</div>
                    <div class="notif-message">${notif.message}</div>
                    <div class="notif-date">
                        <i class="far fa-calendar"></i> ${dateStr} à ${heureStr}
                    </div>
                    ${!estLu ? `
                        <div class="notif-actions">
                            <button class="notif-action-btn" onclick="marquerCommeLuPage(${notif.id})">
                                <i class="fas fa-check"></i> Marquer comme lu
                            </button>
                        </div>
                    ` : ''}
                </div>
                ${!estLu ? '<div class="notif-dot"></div>' : ''}
            </div>
        `;
        container.innerHTML += html;
    });
}

function getIconClassPage(type) {
    switch(type) {
        case 'rappel': return 'rappel';
        case 'confirmation': return 'confirmation';
        case 'annulation': return 'annulation';
        case 'nouveaute': return 'nouveaute';
        default: return 'info';
    }
}

function getIconFaPage(type) {
    switch(type) {
        case 'rappel': return 'fa-bell';
        case 'confirmation': return 'fa-check-circle';
        case 'annulation': return 'fa-times-circle';
        case 'nouveaute': return 'fa-star';
        default: return 'fa-info-circle';
    }
}

async function marquerCommeLuPage(id) {
    try {
        const res = await fetch("../backend/marquer_notification_lue.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id })
        });
        const data = await res.json();
        if (data.success) {
            // Recharger les notifications
            chargerNotificationsPage();
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
            chargerNotificationsPage();
        } else {
            alert("Erreur : " + data.error);
        }
    } catch (error) {
        console.error("Erreur:", error);
    }
}