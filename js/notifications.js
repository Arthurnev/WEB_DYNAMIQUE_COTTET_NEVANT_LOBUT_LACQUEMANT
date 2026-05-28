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

    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));
    const max = notifications.slice(0, 5);

    if (max.length === 0) {
        container.innerHTML = `<div style="padding:20px; text-align:center; color:#9ca3af;"><p>Aucune notification</p></div>`;
        return;
    }

    max.forEach(notif => {
        const estLu = notif.lu == 1;
        const itemClass = estLu ? "notif-dropdown-item read" : "notif-dropdown-item unread";
        let iconClass = "info";
        let iconFa = "fa-info-circle";
        
        switch(notif.type) {
            case 'rappel':
                iconClass = "rappel";
                iconFa = "fa-bell";
                break;
            case 'confirmation':
                iconClass = "confirmation";
                iconFa = "fa-check-circle";
                break;
            case 'annulation':
                iconClass = "annulation";
                iconFa = "fa-times-circle";
                break;
            default:
                iconClass = "info";
                iconFa = "fa-info-circle";
        }

        const dateObj = new Date(notif.date);
        const dateStr = dateObj.toLocaleDateString("fr-FR", { day: 'numeric', month: 'numeric' });
        const heureStr = dateObj.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' });
        
        // Utiliser message comme titre (pas titre)
        const titre = notif.message.length > 50 ? notif.message.substring(0, 50) + '...' : notif.message;

        const html = `
            <div class="${itemClass}" onclick="marquerCommeLu(${notif.id})">
                <div class="notif-dropdown-icon ${iconClass}">
                    <i class="fas ${iconFa}"></i>
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

function mettreAJourCompteurs(notifications) {
    const nonLues = notifications.filter(n => n.lu == 0).length;
    const counter = document.getElementById("topbar-notif-count");
    if (counter) {
        counter.textContent = nonLues;
        counter.style.display = nonLues > 0 ? 'inline-block' : 'none';
    }
}

async function marquerCommeLu(id) {
    try {
        const res = await fetch("../backend/marquer_notification_lu.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
            body: JSON.stringify({ id: id })
        });
        const data = await res.json();
        if (data.success) {
            // Recharger les notifications
            chargerNotificationsDropdown();
            if (window.location.pathname.includes("notifications.html")) {
                chargerNotificationsPage();
            }
        } else {
            console.error("Erreur:", data.error);
        }
    } catch (error) {
        console.error("Erreur réseau:", error);
    }
}

async function marquerToutLu() {
    if (!confirm("Marquer toutes les notifications comme lues ?")) return;
    
    try {
        const res = await fetch("../backend/marquer_tout_lu.php", {
            method: "POST",
            credentials: 'include'
        });
        const data = await res.json();
        if (data.success) {
            chargerNotificationsDropdown();
            if (window.location.pathname.includes("notifications.html")) {
                chargerNotificationsPage();
            }
        } else {
            console.error("Erreur:", data.error);
        }
    } catch (error) {
        console.error("Erreur réseau:", error);
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
        afficherNotificationsPage(data.notifications);
        mettreAJourCompteurs(data.notifications);
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
        container.innerHTML = `<div class="empty-state"><i class="fas fa-bell-slash"></i><p>Aucune notification</p></div>`;
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
        let iconClass = "info";
        let iconFa = "fa-info-circle";
        
        switch(notif.type) {
            case 'rappel':
                iconClass = "rappel";
                iconFa = "fa-bell";
                break;
            case 'confirmation':
                iconClass = "confirmation";
                iconFa = "fa-check-circle";
                break;
            case 'annulation':
                iconClass = "annulation";
                iconFa = "fa-times-circle";
                break;
            default:
                iconClass = "info";
                iconFa = "fa-info-circle";
        }

        const dateObj = new Date(notif.date);
        const dateStr = dateObj.toLocaleDateString("fr-FR");
        const heureStr = dateObj.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' });
        
        // Utiliser message comme titre (pas titre)
        const titre = notif.message.length > 60 ? notif.message.substring(0, 60) + '...' : notif.message;

        const html = `
            <div class="${cardClass}" data-id="${notif.id}">
                <div class="notif-icon ${iconClass}">
                    <i class="fas ${iconFa}"></i>
                </div>
                <div class="notif-content">
                    <div class="notif-title">${escapeHtml(titre)}</div>
                    <div class="notif-message">${escapeHtml(notif.message)}</div>
                    <div class="notif-date">
                        <i class="far fa-calendar"></i> ${dateStr} à ${heureStr}
                    </div>
                    ${!estLu ? `
                        <div class="notif-actions">
                            <button class="notif-action-btn" onclick="marquerCommeLu(${notif.id})">
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

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}