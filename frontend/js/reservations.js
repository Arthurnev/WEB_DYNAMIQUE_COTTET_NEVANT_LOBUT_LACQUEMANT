let reservations = [];

// ========== CHARGEMENT DES RÉSERVATIONS ==========
async function loadReservations() {
    try {
        const response = await fetch("../backend/reservations.php?action=list");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (data.success) {
            reservations = data.data;
            renderTable();
        } else {
            alert("Erreur : " + (data.error || "Chargement impossible"));
        }
    } catch (error) {
        console.error(error);
        alert("Erreur de connexion au serveur : " + error.message);
    }
}

// ========== SUPPRESSION D'UNE RÉSERVATION ==========
async function deleteReservation(id) {
    if (!confirm("Supprimer définitivement cette réservation ?")) return;
    try {
        const response = await fetch("../backend/reservations.php?action=delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        });
        const data = await response.json();
        if (data.success) {
            alert("Réservation supprimée.");
            await loadReservations();
        } else {
            alert(data.error || "Erreur lors de la suppression");
        }
    } catch (error) {
        console.error(error);
        alert("Erreur de connexion");
    }
}

// ========== FONCTION D'ÉCHAPPEMENT HTML ==========
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => (m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'));
}

// ========== AFFICHAGE DU STATUT AVEC BADGE ==========
function getStatusBadge(statut) {
    const classes = {
        'en_attente': 'status-pending',
        'confirmée': 'status-confirm',
        'confirmee': 'status-confirm',
        'annulée': 'status-cancelled',
        'annulee': 'status-cancelled',
        'terminée': 'status-past',
        'terminee': 'status-past'
    };
    const defaultClass = 'status-pending';
    const statutLower = (statut || '').toLowerCase();
    const badgeClass = classes[statutLower] || defaultClass;
    let label = statut || 'en_attente';
    if (label === 'en_attente') label = 'En attente';
    else if (label === 'confirmée' || label === 'confirmee') label = 'Confirmée';
    else if (label === 'annulée' || label === 'annulee') label = 'Annulée';
    else if (label === 'terminée' || label === 'terminee') label = 'Terminée';
    return `<span class="status-badge ${badgeClass}">${escapeHtml(label)}</span>`;
}

// ========== AFFICHAGE DU TABLEAU AVEC RECHERCHE ==========
function renderTable() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    // Si aucune réservation dans la base
    if (reservations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem;"> Aucune réservation pour le moment</td></tr>';
        return;
    }

    // Filtrer selon la recherche
    const filtered = reservations.filter(r => {
        return searchTerm === '' ||
            (r.etudiant && r.etudiant.toLowerCase().includes(searchTerm)) ||
            (r.praticien && r.praticien.toLowerCase().includes(searchTerm)) ||
            (r.service && r.service.toLowerCase().includes(searchTerm));
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem;">🔍 Aucune réservation ne correspond à votre recherche</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    filtered.forEach(r => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(r.etudiant || '-')}</td>
            <td>${escapeHtml(r.praticien || '-')}</td>
            <td>${escapeHtml(r.service || '-')}</td>
            <td>${escapeHtml(r.date || '-')}</td>
            <td>${escapeHtml(r.horaire || '-')}</td>
            <td>${getStatusBadge(r.statut)}</td>
            <td style="text-align: center;">
                <button class="btn-delete" data-id="${r.id}"><i class="far fa-trash-alt"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Attacher les événements de suppression
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            deleteReservation(id);
        });
    });
}

// ========== FONCTIONS POUR LA TOPBAR ==========
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
    if (userMeta && !userMeta.contains(event.target) && !event.target.closest('.dropdown-item')) {
        adminMenu.classList.remove('show');
    }
});

// ========== INITIALISATION AU CHARGEMENT ==========
document.addEventListener('DOMContentLoaded', function() {
    // Informations utilisateur
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const avatarElement = document.getElementById('topbar-avatar');
    const fullnameElement = document.getElementById('admin-fullname');

    const prenom = user.prenom || 'Judicael';
    const nom = user.nom || 'Lacquemant';
    const initiales = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();

    if (avatarElement) avatarElement.textContent = initiales;
    if (fullnameElement) fullnameElement.textContent = `Ad. ${nom}`;

    // Charger les réservations
    loadReservations();

    // Écouteur de recherche
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', renderTable);
});