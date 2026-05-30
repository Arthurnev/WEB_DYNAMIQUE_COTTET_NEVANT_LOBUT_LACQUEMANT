let reservations = [];

// 1. Chargement des données depuis le serveur PHP
async function loadReservations() {
    try {
        const response = await fetch("../backend/reservations.php?action=list");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (data.success) {
            reservations = data.data;
            renderTable();
        } else {
            console.error("Erreur backend : " + (data.error || "Chargement impossible"));
        }
    } catch (error) {
        console.error("Erreur réseau :", error);
    }
}

// 2. Suppression d'une réservation
async function deleteReservation(id) {
    if (!confirm("Supprimer définitivement cette réservation ?")) return;
    try {
        const response = await fetch("../backend/reservations.php?action=delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        });
        const data = await response.json();
        if (data.success) {
            alert("Réservation supprimée.");
            await loadReservations();
        } else {
            alert(data.error || "Erreur lors de la suppression");
        }
    } catch (error) {
        console.error(error);
        alert("Erreur de connexion");
    }
}

// Génération visuelle des badges de statut
function getStatutBadge(statut) {
    const statuts = {
        'en_attente': '<span class="status-badge status-pending">En attente</span>',
        'confirmee': '<span class="status-badge status-confirm">Confirmée</span>',
        'annulee': '<span class="status-badge status-cancelled">Annulée</span>',
        'terminee': '<span class="status-badge status-past">Terminée</span>'
    };
    return statuts[statut] || statut;
}

// Protection contre les failles d'injection XSS
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => (m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'));
}

// 3. Remplissage et filtrage dynamique du tableau
function renderTable() {
    const searchInput = document.getElementById('searchInput');
    let searchTerm = '';
    
    // SÉCURITÉ CRUCIALE : On vérifie si l'élément existe bien avant de lire sa valeur (.value)
    if (searchInput) {
        searchTerm = searchInput.value.toLowerCase().trim();
    }

    let filtered = reservations;
    if (searchTerm !== '') {
        filtered = reservations.filter(r =>
            (r.etudiant && r.etudiant.toLowerCase().includes(searchTerm)) ||
            (r.praticien && r.praticien.toLowerCase().includes(searchTerm)) ||
            (r.service && r.service.toLowerCase().includes(searchTerm))
        );
    }

    const tbody = document.getElementById('tableBody');
    if (!tbody) return; // Sécurité additionnelle si la table n'est pas sur la page actuelle

    if (filtered.length === 0) {
        let message = '';
        if (reservations.length === 0 && searchTerm === '') {
            message = 'Aucune réservation pour le moment – la table est vide.';
        } else if (reservations.length > 0 && searchTerm !== '') {
            message = 'Aucune réservation ne correspond à votre recherche.';
        } else {
            message = 'Aucune réservation trouvée.';
        }
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:#64748b;">${message}</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    filtered.forEach(r => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${escapeHtml(r.etudiant)}</strong></td>
            <td>${escapeHtml(r.praticien)}</td>
            <td>${escapeHtml(r.service)}</td>
            <td><code>${escapeHtml(r.date)}</code></td>
            <td><code>${escapeHtml(r.horaire)}</code></td>
            <td>${getStatutBadge(r.statut)}</td>
            <td style="text-align: center;">
                <button class="btn-delete" data-id="${r.id}"><i class="far fa-trash-alt"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Écouteurs d'événements pour les boutons de suppression
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.replaceWith(btn.cloneNode(true)); // Évite les doublons d'écouteurs d'événements lors du rechargement
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteReservation(parseInt(btn.dataset.id)));
    });
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    loadReservations();
    
    // 🔄 SYNCHRONISATION TEMPS RÉEL : Rafraîchissement en arrière-plan toutes les 5 secondes
    setInterval(loadReservations, 5000);
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', renderTable);
    }
});