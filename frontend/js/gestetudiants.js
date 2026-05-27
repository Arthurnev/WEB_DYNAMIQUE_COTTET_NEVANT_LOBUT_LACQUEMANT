let etudiants = [
    { id: 1, nom: "Dupont", prenom: "Jean", email: "jean.dupont@etudiant.fr", campus: "campus_a", filiere: "Informatique", annee: "L3", statut: "actif" },
    { id: 2, nom: "Martin", prenom: "Sophie", email: "sophie.martin@etudiant.fr", campus: "campus_b", filiere: "Psychologie", annee: "M1", statut: "actif" },
    { id: 3, nom: "Lefebvre", prenom: "Paul", email: "paul.lefebvre@etudiant.fr", campus: "campus_a", filiere: "STAPS", annee: "L2", statut: "inactif" },
    { id: 4, nom: "Rousseau", prenom: "Marie", email: "marie.rousseau@etudiant.fr", campus: "campus_c", filiere: "Nutrition", annee: "L3", statut: "actif" },
    { id: 5, nom: "Bernard", prenom: "Thomas", email: "thomas.bernard@etudiant.fr", campus: "campus_b", filiere: "Médecine", annee: "D1", statut: "actif" }
];

function getCampusLabel(campus) {
    const labels = {
        campus_a: "Campus A",
        campus_b: "Campus B",
        campus_c: "Campus C"
    };
    return labels[campus] || campus;
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
    const campusFilter = document.getElementById('campusFilter').value;
    const statutFilter = document.getElementById('statutFilter').value;

    const filtered = etudiants.filter(e => {
        const matchSearch = searchTerm === '' ||
            e.nom.toLowerCase().includes(searchTerm) ||
            e.prenom.toLowerCase().includes(searchTerm) ||
            e.email.toLowerCase().includes(searchTerm);
        const matchCampus = (campusFilter === 'all') || (e.campus === campusFilter);
        const matchStatut = (statutFilter === 'all') || (e.statut === statutFilter);
        return matchSearch && matchCampus && matchStatut;
    });

    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:2rem;">Aucun étudiant trouvé</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    filtered.forEach(e => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(e.nom)}</td>
            <td>${escapeHtml(e.prenom)}</td>
            <td>${escapeHtml(e.email)}</td>
            <td>${getCampusLabel(e.campus)}</td>
            <td>${escapeHtml(e.filiere)}</td>
            <td>${escapeHtml(e.annee)}</td>
            <td>${getStatutBadge(e.statut)}</td>
            <td style="text-align: center;">
                <button class="btn-delete-action" data-id="${e.id}">
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
            if (confirm("Supprimer définitivement cet étudiant ? Toutes ses données seront effacées.")) {
                etudiants = etudiants.filter(e => e.id !== id);
                renderTable();
                alert("Étudiant supprimé.");
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderTable();

    document.getElementById('searchInput').addEventListener('input', renderTable);
    document.getElementById('campusFilter').addEventListener('change', renderTable);
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