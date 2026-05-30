document.addEventListener('DOMContentLoaded', function() {
    // Rendre les cartes KPI cliquables (navigation vers la page correspondante)
    const kpiCards = document.querySelectorAll('.kpi-minimal-card');
    kpiCards.forEach(card => {
        card.addEventListener('click', function() {
            const link = this.getAttribute('data-link');
            if (link) {
                window.location.href = link;
            }
        });
    });

    // Icône cloche
    const bell = document.querySelector('.bell-icon');
    if (bell) {
        bell.addEventListener('click', () => alert("Vous avez 3 notifications non lues"));
    }

    // Profil utilisateur
    const userMeta = document.querySelector('.user-meta');
    if (userMeta) {
        userMeta.addEventListener('click', () => alert("Profil administrateur"));
    }

    // Bouton exporter le rapport
    const exportBtn = document.querySelector('.btn-green-action');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => alert("Export du rapport (simulation)"));
    }

    // Les liens "Voir tout" et "Voir toutes" sont déjà des <a> normaux
    // Ils redirigent vers les pages respectives sans script supplémentaire.
});