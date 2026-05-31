let programmes = [];

// Chargement des programmes
async function loadProgrammes() {
    try {
        const response = await fetch("../backend/programmes.php?action=list");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (data.success) {
            programmes = data.data;
            renderTable();
        } else {
            alert("Erreur : " + (data.error || "Chargement impossible"));
        }
    } catch (error) {
        console.error(error);
        alert("Erreur de connexion au serveur : " + error.message);
    }
}

// Suppression d'un programme
async function deleteProgramme(id) {
    if (!confirm("Supprimer définitivement ce programme ?")) return;
    try {
        const response = await fetch("../backend/programmes.php?action=delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        });
        const data = await response.json();
        if (data.success) {
            alert("Programme supprimé.");
            await loadProgrammes();
        } else {
            alert(data.error || "Erreur lors de la suppression");
        }
    } catch (error) {
        console.error(error);
        alert("Erreur de connexion");
    }
}

// Formatage de la date
function formatDateTime(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

// Échappement HTML
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => (m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'));
}

// Affichage du tableau avec recherche
function renderTable() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const filtered = programmes.filter(p => {
        return searchTerm === '' ||
            (p.nom && p.nom.toLowerCase().includes(searchTerm)) ||
            (p.description && p.description.toLowerCase().includes(searchTerm)) ||
            (p.intervenant && p.intervenant.toLowerCase().includes(searchTerm));
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem;">Aucun programme trouvé</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    filtered.forEach(p => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${escapeHtml(p.nom || '-')}</strong></td>
            <td>${escapeHtml(p.description) || '-'}</td>
            <td>${formatDateTime(p.date_heure)}</td>
            <td>${p.capacite_max ?? '-'}</td>
            <td>${escapeHtml(p.lieu) || '-'}</td>
            <td>${escapeHtml(p.intervenant) || '-'}</td>
            <td style="text-align: center;">
                <button class="btn-delete" data-id="${p.id}"><i class="far fa-trash-alt"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Événements suppression
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            deleteProgramme(id);
        });
    });
}

// ========== FONCTIONS POUR LA TOPBAR (identiques à admin.html) ==========
function toggleAdminMenu(event) {
    event.stopPropagation();
    const adminMenu = document.getElementById('admin-menu');
    adminMenu.classList.toggle('show');
}

function logout(event) {
    event.preventDefault();
    event.stopPropagation();
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Fermer le menu si on clique ailleurs
document.addEventListener('click', function(event) {
    const userMeta = document.querySelector('.user-meta');
    const adminMenu = document.getElementById('admin-menu');
    if (userMeta && !userMeta.contains(event.target)) {
        adminMenu.classList.remove('show');
    }
});

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', function() {
    loadProgrammes();

    // Récupération des infos utilisateur depuis localStorage
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const avatarElement = document.getElementById('topbar-avatar');
    const fullnameElement = document.getElementById('admin-fullname');

    const prenom = user.prenom || 'Judicael';
    const nom = user.nom || 'Lacquemant';
    const initiales = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();

    if (avatarElement) avatarElement.textContent = initiales;
    if (fullnameElement) fullnameElement.textContent = `Ad. ${nom}`;

    // Écouteur pour la barre de recherche
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', renderTable);
    }
});