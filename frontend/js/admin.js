document.addEventListener('DOMContentLoaded', function() {
    // Sélecteur de période
    const periodSelect = document.getElementById('periodSelect');
    if (periodSelect) {
        periodSelect.addEventListener('change', function(e) {
            alert(`Période sélectionnée : ${e.target.value} (simulation)`);
        });
    }

    // Bouton d'exportation
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            alert("Export du rapport en cours (simulation)");
        });
    }

    // Navigation : changement d'onglet actif
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            alert(`Navigation vers : ${this.innerText.trim()} (simulation)`);
        });
    });

    // Liens "Voir tout"
    const voirToutLinks = document.querySelectorAll('.panel-top-link');
    voirToutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            alert(`Redirection vers la liste complète (simulation)`);
        });
    });

    // Clic sur la cloche de notification
    const bellIcon = document.querySelector('.bell-icon');
    if (bellIcon) {
        bellIcon.addEventListener('click', function() {
            alert("Vous avez 3 notifications non lues (simulation)");
        });
    }

    // Clic sur le profil utilisateur
    const userMeta = document.querySelector('.user-meta');
    if (userMeta) {
        userMeta.addEventListener('click', function() {
            alert("Profil administrateur (simulation)");
        });
    }
});