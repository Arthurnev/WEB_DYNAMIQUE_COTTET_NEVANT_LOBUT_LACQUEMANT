let programmes = [
    { id: 1, nom: "Yoga doux", intervenant: "Sophie Morin", date: "2026-05-28", capacite: 20, inscrits: 12, categorie: "sport", statut: "a_venir" },
    { id: 2, nom: "Atelier nutrition équilibrée", intervenant: "Dr. Marie Martin", date: "2026-05-25", capacite: 15, inscrits: 15, categorie: "nutrition", statut: "complet" },
    { id: 3, nom: "Méditation guidée", intervenant: "Claire Leblanc", date: "2026-05-30", capacite: 25, inscrits: 10, categorie: "bienetre", statut: "a_venir" },
    { id: 4, nom: "Renforcement musculaire", intervenant: "Pierre Dupont", date: "2026-05-20", capacite: 12, inscrits: 12, categorie: "sport", statut: "passe" },
    { id: 5, nom: "Gestion du stress", intervenant: "Élise Garnier", date: "2026-06-02", capacite: 18, inscrits: 9, categorie: "bienetre", statut: "a_venir" }
];

function getStatusBadge(statut) {
    switch(statut) {
        case 'a_venir': return '<span class="status-badge status-a-venir">À venir</span>';
        case 'complet': return '<span class="status-badge status-complet">Complet</span>';
        case 'passe': return '<span class="status-badge status-passe">Passé</span>';
        default: return '';
    }
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function renderTable() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const categorie = document.getElementById('categorieFilter').value;
    const statut = document.getElementById('statutFilter').value;

    const filtered = programmes.filter(p => {
        const matchSearch = searchTerm === '' ||
            p.nom.toLowerCase().includes(searchTerm) ||
            p.intervenant.toLowerCase().includes(searchTerm);
        const matchCategorie = (categorie === 'all') || (p.categorie === categorie);
        const matchStatut = (statut === 'all') || (p.statut === statut);
        return matchSearch && matchCategorie && matchStatut;
    });

    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:2rem;">Aucune activité trouvée</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    filtered.forEach(p => {
        const placesRestantes = p.capacite - p.inscrits;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${escapeHtml(p.nom)}</strong></td>
            <td>${escapeHtml(p.intervenant)}</td>
            <td>${formatDate(p.date)}</td>
            <td>${p.capacite}</td>
            <td>${p.inscrits}</td>
            <td>${placesRestantes}</td>
            <td>${getStatusBadge(p.statut)}</td>
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
            if (confirm("Supprimer définitivement cette activité ?")) {
                programmes = programmes.filter(p => p.id !== id);
                renderTable();
                alert("Activité supprimée.");
            }
        });
    });
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

document.addEventListener('DOMContentLoaded', () => {
    renderTable();

    document.getElementById('searchInput').addEventListener('input', renderTable);
    document.getElementById('categorieFilter').addEventListener('change', renderTable);
    document.getElementById('statutFilter').addEventListener('change', renderTable);

    const helpBtn = document.querySelector('.floating-help-btn');
    if (helpBtn) {
        helpBtn.addEventListener('click', () => alert("Support : support@vitacare-campus.fr"));
    }

    // Navigation simulation
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