// Données simulées
let reservations = [
    { id: 1, etudiant: "Jean Dupont", praticien: "Dr. Marie Martin", service: "Consultation médicale", date: "28/05/2026", horaire: "09:00", statut: "confirm" },
    { id: 2, etudiant: "Sophie Martin", praticien: "Dr. Pierre Durand", service: "Suivi nutritionnel", date: "28/05/2026", horaire: "14:00", statut: "pending" },
    { id: 3, etudiant: "Paul Lefebvre", praticien: "Dr. Marie Martin", service: "Consultation", date: "29/05/2026", horaire: "10:30", statut: "confirm" },
    { id: 4, etudiant: "Marie Rousseau", praticien: "Dr. Jean Petit", service: "Massage thérapeutique", date: "30/05/2026", horaire: "15:00", statut: "past" },
    { id: 5, etudiant: "Thomas Bernard", praticien: "Dr. Pierre Durand", service: "Consultation nutrition", date: "27/05/2026", horaire: "11:00", statut: "cancelled" }
];

function getStatusBadge(statut) {
    switch(statut) {
        case 'confirm': return '<span class="status-badge status-confirm">Confirmée</span>';
        case 'pending': return '<span class="status-badge status-pending">En attente</span>';
        case 'past': return '<span class="status-badge status-past">Passée</span>';
        case 'cancelled': return '<span class="status-badge status-cancelled">Annulée</span>';
        default: return '';
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => (m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'));
}

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
                <button class="btn-delete-action" data-id="${res.id}"><i class="far fa-trash-alt"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });

    document.querySelectorAll('.btn-delete-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            if (confirm("Supprimer définitivement cette réservation ?")) {
                reservations = reservations.filter(r => r.id !== id);
                renderTable();
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderTable();
    document.getElementById('searchInput').addEventListener('input', renderTable);
    document.getElementById('statusFilter').addEventListener('change', renderTable);
    document.getElementById('praticienFilter').addEventListener('change', renderTable);

    // Interactions (cloche, aide, etc.)
    document.querySelector('.floating-help-btn')?.addEventListener('click', () => alert("Support : support@vitacare-campus.fr"));
    document.querySelector('.bell-icon')?.addEventListener('click', () => alert("3 notifications non lues"));
    document.querySelector('.user-meta')?.addEventListener('click', () => alert("Profil administrateur"));
});