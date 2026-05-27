// Données initiales (simulation)
let reservations = [
    { id: 1, etudiant: "Jean Dupont", praticien: "Dr. Marie Martin", service: "Consultation médicale", date: "28/05/2026", horaire: "09:00", statut: "confirm" },
    { id: 2, etudiant: "Sophie Martin", praticien: "Dr. Pierre Durand", service: "Suivi nutritionnel", date: "28/05/2026", horaire: "14:00", statut: "pending" },
    { id: 3, etudiant: "Paul Lefebvre", praticien: "Dr. Marie Martin", service: "Consultation", date: "29/05/2026", horaire: "10:30", statut: "confirm" },
    { id: 4, etudiant: "Marie Rousseau", praticien: "Dr. Jean Petit", service: "Massage thérapeutique", date: "30/05/2026", horaire: "15:00", statut: "past" },
    { id: 5, etudiant: "Thomas Bernard", praticien: "Dr. Pierre Durand", service: "Consultation nutrition", date: "27/05/2026", horaire: "11:00", statut: "cancelled" }
];

// Fonction pour générer le badge de statut
function getStatusBadge(statut) {
    switch(statut) {
        case 'confirm': return '<span class="status-badge status-confirm">Confirmée</span>';
        case 'pending': return '<span class="status-badge status-pending">En attente</span>';
        case 'past': return '<span class="status-badge status-past">Passée</span>';
        case 'cancelled': return '<span class="status-badge status-cancelled">Annulée</span>';
        default: return '';
    }
}

// Échappement basique pour éviter les injections HTML
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Fonction principale de filtrage et d'affichage
function renderTable() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const statusFilter = document.getElementById('statusFilter').value;
    const praticienFilter = document.getElementById('praticienFilter').value;

    const filtered = reservations.filter(res => {
        const matchSearch = searchTerm === '' ||
            res.etudiant.toLowerCase().includes(searchTerm) ||
            res.praticien.toLowerCase().includes(searchTerm) ||
            res.service.toLowerCase().includes(searchTerm);
        const matchStatus = (statusFilter === 'all') || (res.statut === statusFilter);
        const matchPraticien = (praticienFilter === 'all') || (res.praticien === praticienFilter);
        return matchSearch && matchStatus && matchPraticien;
    });

    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem;">Aucune réservation trouvée</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    filtered.forEach(res => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${escapeHtml(res.etudiant)}</strong></td>
            <td>${escapeHtml(res.praticien)}</td>
            <td>${escapeHtml(res.service)}</td>
            <td>${escapeHtml(res.date)}</td>
            <td>${escapeHtml(res.horaire)}</td>
            <td>${getStatusBadge(res.statut)}</td>
            <td style="text-align: center;">
                <button class="btn-delete-action" data-id="${res.id}">
                    <i class="far fa-trash-alt"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Réattacher les événements de suppression
    document.querySelectorAll('.btn-delete-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.getAttribute('data-id'));
            if (confirm("Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action est irréversible.")) {
                reservations = reservations.filter(r => r.id !== id);
                renderTable();
                alert("Réservation supprimée avec succès.");
            }
        });
    });
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    renderTable();

    // Écouteurs des filtres
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const praticienFilter = document.getElementById('praticienFilter');

    if (searchInput) searchInput.addEventListener('input', renderTable);
    if (statusFilter) statusFilter.addEventListener('change', renderTable);
    if (praticienFilter) praticienFilter.addEventListener('change', renderTable);

    // Bouton d'aide flottant
    const helpBtn = document.querySelector('.floating-help-btn');
    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            alert("Contactez le support : support@vitacare-campus.fr");
        });
    }

    // Simulation de navigation dans la sidebar
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            if (!this.classList.contains('active')) {
                alert(`Navigation vers "${this.innerText.trim()}" (simulation)`);
            }
        });
    });

    // Clic sur la cloche de notification
    const bell = document.querySelector('.bell-icon');
    if (bell) {
        bell.addEventListener('click', () => {
            alert("Vous avez 3 notifications non lues");
        });
    }

    // Clic sur le profil utilisateur
    const userMeta = document.querySelector('.user-meta');
    if (userMeta) {
        userMeta.addEventListener('click', () => {
            alert("Profil administrateur");
        });
    }
});