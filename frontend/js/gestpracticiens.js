let praticiens = [
    { id: 1, nom: "Martin", prenom: "Marie", specialite: "medecine_generale", email: "marie.martin@vitacare.fr", statut: "actif" },
    { id: 2, nom: "Durand", prenom: "Pierre", specialite: "nutrition", email: "pierre.durand@vitacare.fr", statut: "actif" },
    { id: 3, nom: "Petit", prenom: "Jean", specialite: "psychologie", email: "jean.petit@vitacare.fr", statut: "inactif" },
    { id: 4, nom: "Lefevre", prenom: "Sophie", specialite: "massotherapie", email: "sophie.lefevre@vitacare.fr", statut: "actif" }
];

function getSpecialiteLabel(specialite) {
    const labels = {
        medecine_generale: "Médecine générale",
        psychologie: "Psychologie",
        nutrition: "Nutrition",
        massotherapie: "Massothérapie"
    };
    return labels[specialite] || specialite;
}

function getStatutBadge(statut) {
    if (statut === 'actif') return '<span class="status-badge status-actif">Actif</span>';
    if (statut === 'inactif') return '<span class="status-badge status-inactif">Inactif</span>';
    return '';
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function renderTable() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const specialiteFilter = document.getElementById('specialiteFilter').value;
    const statutFilter = document.getElementById('statutFilter').value;

    const filtered = praticiens.filter(p => {
        const matchSearch = searchTerm === '' ||
            p.nom.toLowerCase().includes(searchTerm) ||
            p.prenom.toLowerCase().includes(searchTerm) ||
            getSpecialiteLabel(p.specialite).toLowerCase().includes(searchTerm);
        const matchSpecialite = (specialiteFilter === 'all') || (p.specialite === specialiteFilter);
        const matchStatut = (statutFilter === 'all') || (p.statut === statutFilter);
        return matchSearch && matchSpecialite && matchStatut;
    });

    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem;">Aucun praticien trouvé</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    filtered.forEach(p => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(p.nom)}</td>
            <td>${escapeHtml(p.prenom)}</td>
            <td>${getSpecialiteLabel(p.specialite)}</td>
            <td>${escapeHtml(p.email)}</td>
            <td>${getStatutBadge(p.statut)}</td>
            <td style="text-align: center;">
                <button class="btn-delete-action" data-id="${p.id}">
                    <i class="far fa-trash-alt"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    document.querySelectorAll('.btn-delete-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.getAttribute('data-id'));
            if (confirm("Supprimer définitivement ce praticien ? Toutes ses données seront effacées.")) {
                praticiens = praticiens.filter(p => p.id !== id);
                renderTable();
                alert("Praticien supprimé.");
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderTable();

    document.getElementById('searchInput').addEventListener('input', renderTable);
    document.getElementById('specialiteFilter').addEventListener('change', renderTable);
    document.getElementById('statutFilter').addEventListener('change', renderTable);

    const helpBtn = document.querySelector('.floating-help-btn');
    if (helpBtn) {
        helpBtn.addEventListener('click', () => alert("Support : support@vitacare-campus.fr"));
    }

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            if (!this.classList.contains('active')) {
                alert(`Navigation vers "${this.innerText.trim()}" (simulation)`);
            }
        });
    });

    document.querySelector('.bell-icon')?.addEventListener('click', () => alert("3 notifications non lues"));
    document.querySelector('.user-meta')?.addEventListener('click', () => alert("Profil administrateur"));
});