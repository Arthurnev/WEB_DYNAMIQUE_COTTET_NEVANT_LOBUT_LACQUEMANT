let etudiants = [];

// ========== CHARGEMENT DES ÉTUDIANTS ==========
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

// ========== SUPPRESSION D'UN ÉTUDIANT ==========
async function deleteEtudiant(id) {
    if (!confirm("Supprimer définitivement cet étudiant ? Toutes ses données seront effacées.")) {
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

    // Si la liste est vide (pas d'étudiants du tout)
    if (etudiants.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:2rem;">📭 Aucun étudiant pour le moment</td></tr>';
        return;
    }

    const filtered = etudiants.filter(e => {
        return searchTerm === '' ||
            e.nom.toLowerCase().includes(searchTerm) ||
            e.prenom.toLowerCase().includes(searchTerm) ||
            e.email.toLowerCase().includes(searchTerm);
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:2rem;">🔍 Aucun étudiant ne correspond à votre recherche</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    filtered.forEach(e => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(e.nom)}</td>
            <td>${escapeHtml(e.prenom)}</td>
            <td>${escapeHtml(e.email)}</td>
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
    await loadEtudiants();

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