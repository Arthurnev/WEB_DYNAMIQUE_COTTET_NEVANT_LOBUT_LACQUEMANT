document.addEventListener("DOMContentLoaded", function () {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    document.getElementById("user-name").textContent = user.prenom + " " + user.nom;

    initNotifDropdown();

    if (window.location.pathname.includes("notifications.html")) {
        chargerNotificationsPage();
    }
});

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
        const res = await fetch("../backend/notifications.php", { credentials: 'include' });
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

    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));
    const max = notifications.slice(0, 5);

    if (max.length === 0) {
        container.innerHTML = `<div style="padding:20px; text-align:center; color:#9ca3af;"><p>Aucune notification</p></div>`;
        return;
    }

    max.forEach(notif => {
        const estLu = notif.lu == 1;
        const itemClass = estLu ? "notif-dropdown-item read" : "notif-dropdown-item unread";
        const iconClass = getIconClassDropdown(notif.type);

        const dateObj = new Date(notif.date);
        const dateStr = dateObj.toLocaleDateString("fr-FR", { day: 'numeric', month: 'numeric' });
        const heureStr = dateObj.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' });
        
        // Utiliser message comme titre
        const titre = notif.message.length > 50 ? notif.message.substring(0, 50) + '...' : notif.message;

        const html = `
            <div class="${itemClass}" onclick="ouvrirNotification(${notif.id})">
                <div class="notif-dropdown-icon ${iconClass}">
                    <i class="fas ${getIconFaDropdown(notif.type)}"></i>
                </div>
                <div class="notif-dropdown-content">
                    <div class="notif-dropdown-title">${escapeHtml(titre)}</div>
                    <div class="notif-dropdown-message">${escapeHtml(notif.message)}</div>
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
    await marquerCommeLuDropdown(id);
    window.location.href = "notifications.html";
}

async function marquerCommeLuDropdown(id) {
    const item = document.querySelector(`.notif-dropdown-item[onclick="ouvrirNotification(${id})"]`);
    if (item) {
        item.classList.remove("unread");
        item.classList.add("read");
        const dot = item.querySelector(".notif-dot");
        if (dot) dot.style.display = "none";
    }
    
    try {
        const res = await fetch("../backend/marquer_notification_lu.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
            body: JSON.stringify({ id: id })
        });
        const data = await res.json();
        if (!data.success) {
            console.error("Erreur backend:", data.error);
        }
    } catch (error) {
        console.error("Erreur réseau:", error);
    }
    
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
    
    document.querySelectorAll(".notif-dropdown-item.unread").forEach(item => {
        item.classList.remove("unread");
        item.classList.add("read");
        const dot = item.querySelector(".notif-dot");
        if (dot) dot.style.display = "none";
    });
    
    try {
        const res = await fetch("../backend/marquer_tout_lu.php", {
            method: "POST",
            credentials: 'include'
        });
        const data = await res.json();
        if (!data.success) {
            console.error("Erreur backend:", data.error);
        }
    } catch (error) {
        console.error("Erreur réseau:", error);
    }
    
    const counter = document.getElementById("topbar-notif-count");
    if (counter) {
        counter.textContent = "0";
        counter.style.display = "none";
    }
}

async function chargerNotificationsPage() {
    try {
        const res = await fetch("../backend/notifications.php", { credentials: 'include' });
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

    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (notifications.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:60px 20px; color:#9ca3af;">
            <i class="fas fa-bell-slash" style="font-size:48px; margin-bottom:16px; color:#d1d5db;"></i>
            <p style="font-size:18px; font-weight:600; color:#6b7280;">Aucune notification</p>
        </div>`;
        return;
    }

    const nonLues = notifications.filter(n => n.lu == 0).length;
    const unreadEl = document.getElementById("unread-count");
    if (unreadEl) {
        unreadEl.textContent = nonLues + " notification" + (nonLues > 1 ? "s" : "") + (nonLues === 0 ? " non lue" : " non lues");
    }

    notifications.forEach(notif => {
        const estLu = notif.lu == 1;
        const cardClass = estLu ? "notif-card read" : "notif-card unread";
        const iconClass = getIconClassPage(notif.type);

        const dateObj = new Date(notif.date);
        const dateStr = dateObj.toLocaleDateString("fr-FR");
        const heureStr = dateObj.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' });
        
        const titre = notif.message.length > 60 ? notif.message.substring(0, 60) + '...' : notif.message;

        const html = `
            <div class="${cardClass}" data-id="${notif.id}">
                <div class="notif-icon ${iconClass}">
                    <i class="fas ${getIconFaPage(notif.type)}"></i>
                </div>
                <div class="notif-content">
                    <div class="notif-title">${escapeHtml(titre)}</div>
                    <div class="notif-message">${escapeHtml(notif.message)}</div>
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
        const res = await fetch("../backend/marquer_notification_lu.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
            body: JSON.stringify({ id: id })
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

async function marquerToutLuPage() {
    if (!confirm("Marquer toutes les notifications comme lues ?")) return;
    try {
        const res = await fetch("../backend/marquer_tout_lu.php", {
            method: "POST",
            credentials: 'include'
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

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}