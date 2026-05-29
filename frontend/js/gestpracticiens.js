let praticiens = [];

async function loadPraticiens() {
    try {
        const response = await fetch("../backend/gestpracticiens.php?action=list");
        const data = await response.json();
        if (data.success) {
            praticiens = data.data;
            renderTable();
        } else {
            console.error(data.error);
            alert("Erreur lors du chargement des praticiens");
        }
    } catch (error) {
        console.error(error);
        alert("Erreur de connexion au serveur");
    }
}

async function deletePraticien(id) {
    if (!confirm("Supprimer définitivement ce praticien ? Toutes ses données seront effacées.")) {
        return;
    }
    try {
        const response = await fetch("../backend/gestpracticiens.php?action=delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        });
        const data = await response.json();
        if (data.success) {
            alert("Praticien supprimé avec succès.");
            await loadPraticiens();
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

    const filtered = praticiens.filter(p => {
        const matchSearch = searchTerm === '' ||
            p.nom.toLowerCase().includes(searchTerm) ||
            p.prenom.toLowerCase().includes(searchTerm) ||
            p.email.toLowerCase().includes(searchTerm) ||
            (p.specialite && p.specialite.toLowerCase().includes(searchTerm));
        return matchSearch;
    });

    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:2rem;">Aucun praticien trouvé</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    filtered.forEach(p => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(p.nom)}</td>
            <td>${escapeHtml(p.prenom)}</td>
            <td>${escapeHtml(p.email)}</td>
            <td>${escapeHtml(p.telephone || '-')}</td>
            <td>${escapeHtml(p.adresse_pro || '-')}</td>
            <td>${escapeHtml(p.specialite || '-')}</td>
            <td>${escapeHtml(p.diplome || '-')}</td>
            <td>${escapeHtml(p.numero_rpps || '-')}</td>
            <td style="text-align: center;">
                <button class="btn-delete-action" data-id="${p.id}"><i class="far fa-trash-alt"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });

    document.querySelectorAll('.btn-delete-action').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            deletePraticien(id);
        });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadPraticiens();
    document.getElementById('searchInput').addEventListener('input', renderTable);

    const helpBtn = document.querySelector('.floating-help-btn');
    if (helpBtn) helpBtn.addEventListener('click', () => alert("Support : support@vitacare-campus.fr"));
    const bell = document.querySelector('.bell-icon');
    if (bell) bell.addEventListener('click', () => alert("3 notifications non lues"));
    const userMeta = document.querySelector('.user-meta');
    if (userMeta) userMeta.addEventListener('click', () => alert("Profil administrateur"));
});