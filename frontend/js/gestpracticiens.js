let praticiens = [];

// ========== CHARGEMENT DES PRATICIENS ==========
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

// ========== SUPPRESSION D'UN PRATICIEN ==========
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

// ========== ÉCHAPPEMENT HTML ==========
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => (m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'));
}

// ========== AFFICHAGE DU TABLEAU (AVEC RECHERCHE ET MESSAGE SI VIDE) ==========
function renderTable() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    // Si la liste est vide (pas de praticiens du tout)
    if (praticiens.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:2rem;"> Aucun intervenant pour le moment</td></tr>';
        return;
    }

    const filtered = praticiens.filter(p => {
        return searchTerm === '' ||
            p.nom.toLowerCase().includes(searchTerm) ||
            p.prenom.toLowerCase().includes(searchTerm) ||
            p.email.toLowerCase().includes(searchTerm) ||
            (p.specialite && p.specialite.toLowerCase().includes(searchTerm));
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:2rem;">🔍 Aucun intervenant ne correspond à votre recherche</td></tr>';
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

// ========== GESTION DE LA TOPBAR (MENU ADMIN) ==========
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

document.addEventListener('click', function(event) {
    const userMeta = document.querySelector('.user-meta');
    const adminMenu = document.getElementById('admin-menu');
    if (userMeta && !userMeta.contains(event.target)) {
        adminMenu.classList.remove('show');
    }
});

// ========== INITIALISATION AU CHARGEMENT ==========
document.addEventListener('DOMContentLoaded', async function() {
    await loadPraticiens();

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', renderTable);

    // Affichage des initiales et du nom depuis localStorage
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const avatarElement = document.getElementById('topbar-avatar');
    const fullnameElement = document.getElementById('admin-fullname');

    const prenom = user.prenom || 'Judicaël';
    const nom = user.nom || 'LACQUEMANT';
    const initiales = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();

    if (avatarElement) avatarElement.textContent = initiales;
    if (fullnameElement) fullnameElement.textContent = `Ad. ${nom}`;
});