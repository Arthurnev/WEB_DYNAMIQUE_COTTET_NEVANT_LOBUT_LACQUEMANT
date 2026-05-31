// Gestion du menu déroulant
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

// Fonction pour charger les données depuis backend/
async function fetchData(url, containerId, emptyMessage, renderFunction) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const container = document.getElementById(containerId);

        if (data.success && (!data.data || data.data.length === 0)) {
            container.innerHTML = `<p>${emptyMessage}</p>`;
        }
        else if (!data.success) {
            container.innerHTML = `<p>Erreur de connexion à la base de données</p>`;
        }
        else {
            container.innerHTML = data.data.map(renderFunction).join('');
        }
    } catch (error) {
        console.error(`Erreur lors du chargement de ${url}:`, error);
        document.getElementById(containerId).innerHTML = `<p>Erreur de chargement des données</p>`;
    }
}

// Chargement des données au démarrage
document.addEventListener('DOMContentLoaded', function() {
    // Initiales et nom de l'admin
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const avatarElement = document.getElementById('topbar-avatar');
    const fullnameElement = document.getElementById('admin-fullname');
    const prenom = user.prenom || 'Judicael';
    const nom = user.nom || 'Lacquemant';
    const initiales = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
    if (avatarElement) avatarElement.textContent = initiales;
    if (fullnameElement) fullnameElement.textContent = `Ad. ${nom}`;

    // Charger les KPI
    Promise.all([
        fetch('../backend/reservations.php?action=list').then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetch('../backend/programmes.php?action=list').then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetch('../backend/gestpracticiens.php?action=list').then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetch('../backend/gestetudiants.php?action=list').then(r => r.json()).catch(() => ({ success: false, data: [] }))
    ]).then(([reservationsRes, activitesRes, intervenantsRes, etudiantsRes]) => {
        document.getElementById('total-reservations').textContent = reservationsRes.data ? reservationsRes.data.length : 0;
        document.getElementById('total-activites').textContent = activitesRes.data ? activitesRes.data.length : 0;
        document.getElementById('total-intervenants').textContent = intervenantsRes.data ? intervenantsRes.data.length : 0;
        document.getElementById('total-etudiants').textContent = etudiantsRes.data ? etudiantsRes.data.length : 0;
    });

    // Charger les données pour les panneaux
    fetchData(
        '../backend/reservations.php?action=list',
        'reservations-list',
        'Pas de réservation pour le moment',
        reservation => `
            <div class="row-data-entry">
                <div class="entry-info">
                    <strong>${reservation.etudiant || 'Inconnu'}</strong>
                    <span>${reservation.service || 'Non spécifié'}</span>
                    <small>${reservation.date || ''} à ${reservation.horaire || ''}</small>
                </div>
                <span class="badge-tag tag-${reservation.statut === 'Confirmée' ? 'yellow' : 'orange'}">${reservation.statut || 'Inconnu'}</span>
            </div>
        `
    );

    fetchData(
        '../backend/programmes.php?action=list',
        'activites-list',
        'Pas d\'activité pour le moment',
        activite => {
            const dateHeure = new Date(activite.date_heure);
            const dateStr = dateHeure.toLocaleDateString('fr-FR');
            const heureStr = dateHeure.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            return `
                <div class="row-data-entry">
                    <div class="entry-info">
                        <strong>${activite.nom || 'Non spécifiée'}</strong>
                        <small>${dateStr} – ${heureStr}</small>
                    </div>
                    <span class="text-counter-muted">${activite.capacite_max || 0} places</span>
                </div>
            `;
        }
    );

    fetchData(
        '../backend/gestpracticiens.php?action=list',
        'intervenants-list',
        'Pas d\'intervenant pour le moment',
        intervenant => `
            <div class="row-data-entry">
                <div class="entry-info">
                    <strong>${intervenant.nom} ${intervenant.prenom || ''}</strong>
                    <span>${intervenant.specialite || 'Non spécifiée'}</span>
                </div>
            </div>
        `
    );

    fetchData(
        '../backend/gestetudiants.php?action=list',
        'etudiants-list',
        'Pas d\'étudiant pour le moment',
        etudiant => `
            <div class="row-data-entry">
                <div class="entry-info">
                    <strong>${etudiant.nom} ${etudiant.prenom || ''}</strong>
                    <span>${etudiant.email || 'Non spécifié'}</span>
                </div>
            </div>
        `
    );
});