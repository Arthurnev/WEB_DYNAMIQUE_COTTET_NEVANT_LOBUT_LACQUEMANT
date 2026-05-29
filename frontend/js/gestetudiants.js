let etudiants = [];

async function loadEtudiants() {
    try {
        const response = await fetch("../backend/gestetudiants.php?action=list");
        const data = await response.json();
        if (data.success) {
            etudiants = data.data;
            renderTable();
        } else {
            console.error(data.error);
            alert("Erreur lors du chargement des étudiants");
        }
    } catch (error) {
        console.error(error);
        alert("Erreur de connexion au serveur");
    }
}

async function deleteEtudiant(id) {
    if (!confirm("Supprimer définitivement cet étudiant ? Toutes ses données (réservations, etc.) seront effacées.")) {
        return;
    }
    try {
        const response = await fetch("../backend/gestetudiants.php?action=delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        });
        const data = await response.json();
        if (data.success) {
            alert("Étudiant supprimé avec succès.");
            await loadEtudiants();
        } else {
            alert(data.error || "Erreur lors de la suppression");
        }
    } catch (error) {
        console.error(error);
        alert("Erreur de connexion au serveur");
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => (m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'));
}

function renderTable() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();

    const filtered = etudiants.filter(e => {
        const matchSearch = searchTerm === '' ||
            e.nom.toLowerCase().includes(searchTerm) ||
            e.prenom.toLowerCase().includes(searchTerm) ||
            e.email.toLowerCase().includes(searchTerm);
        return matchSearch;
    });

    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem;">Aucun étudiant trouvé</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    filtered.forEach(e => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(e.nom)}</td>
            <td>${escapeHtml(e.prenom)}</td>
            <td>${escapeHtml(e.email)}</td>
            <td><span class="status-badge status-actif">Actif</span></td>
            <td style="text-align: center;">
                <button class="btn-delete-action" data-id="${e.id}"><i class="far fa-trash-alt"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });

    document.querySelectorAll('.btn-delete-action').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            deleteEtudiant(id);
        });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadEtudiants();
    document.getElementById('searchInput').addEventListener('input', renderTable);

    // Interactions de la barre d'outils (aide, cloche, profil)
    const helpBtn = document.querySelector('.floating-help-btn');
    if (helpBtn) helpBtn.addEventListener('click', () => alert("Support : support@vitacare-campus.fr"));
    const bell = document.querySelector('.bell-icon');
    if (bell) bell.addEventListener('click', () => alert("3 notifications non lues"));
    const userMeta = document.querySelector('.user-meta');
    if (userMeta) userMeta.addEventListener('click', () => alert("Profil administrateur"));
});