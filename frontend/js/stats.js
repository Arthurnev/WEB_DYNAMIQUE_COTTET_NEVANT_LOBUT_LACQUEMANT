// Données conformes à l'image
const monthlyReservations = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai'],
    data: [45, 52, 48, 62, 58]
};

const serviceRepartition = {
    labels: ['Consultations médicales', 'Nutrition', 'Sport & Fitness', 'Bien-être mental'],
    data: [142, 85, 64, 47],
    total: 338
};

const topPraticiens = [
    { name: 'Dr. Marie Martin', count: 45 },
    { name: 'Dr. Pierre Durand', count: 38 },
    { name: 'Dr. Jean Petit', count: 32 },
    { name: 'Dr. Sophie Leroy', count: 28 },
    { name: 'Dr. Paul Lambert', count: 24 }
];

const newUsersByMonth = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai'],
    data: [28, 35, 31, 39, 42]
};

let monthlyChart, serviceChart, usersChart;

function renderMonthlyChart() {
    const ctx = document.createElement('canvas');
    const container = document.getElementById('monthlyChart');
    container.innerHTML = '';
    ctx.id = 'monthlyCanvas';
    container.appendChild(ctx);
    monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthlyReservations.labels,
            datasets: [{
                label: 'Réservations',
                data: monthlyReservations.data,
                backgroundColor: '#118a6b',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'top' },
                tooltip: { callbacks: { label: (ctx) => `${ctx.raw} réservations` } }
            }
        }
    });
}

function renderServiceChart() {
    const ctx = document.createElement('canvas');
    const container = document.getElementById('serviceChart');
    container.innerHTML = '';
    ctx.id = 'serviceCanvas';
    container.appendChild(ctx);
    serviceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: serviceRepartition.labels,
            datasets: [{
                data: serviceRepartition.data,
                backgroundColor: ['#118a6b', '#f59e0b', '#3b82f6', '#8b5cf6'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw} (${Math.round(ctx.raw / serviceRepartition.total * 100)}%)` } }
            }
        }
    });
}

function renderTopPraticiens() {
    const list = document.getElementById('topPraticiens');
    list.innerHTML = '';
    topPraticiens.forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `${p.name} <span class="count">${p.count}</span>`;
        list.appendChild(li);
    });
}

function renderUsersChart() {
    const ctx = document.createElement('canvas');
    const container = document.getElementById('usersChart');
    container.innerHTML = '';
    ctx.id = 'usersCanvas';
    container.appendChild(ctx);
    usersChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: newUsersByMonth.labels,
            datasets: [{
                label: 'Nouveaux utilisateurs',
                data: newUsersByMonth.data,
                borderColor: '#118a6b',
                backgroundColor: 'rgba(17, 138, 107, 0.1)',
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#118a6b',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: { callbacks: { label: (ctx) => `${ctx.raw} utilisateurs` } }
            }
        }
    });
}

function updateAllStats() {
    renderMonthlyChart();
    renderServiceChart();
    renderTopPraticiens();
    renderUsersChart();
}

// Gestion période (simulation)
document.getElementById('periodSelect')?.addEventListener('change', (e) => {
    alert(`Changement de période : ${e.target.value} (simulation)`);
    // Ici on pourrait recharger les données dynamiquement
});

document.addEventListener('DOMContentLoaded', () => {
    updateAllStats();

    const helpBtn = document.querySelector('.floating-help-btn');
    if (helpBtn) helpBtn.addEventListener('click', () => alert("Support : support@vitacare-campus.fr"));

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            if (!this.classList.contains('active')) alert(`Navigation vers "${this.innerText.trim()}" (simulation)`);
        });
    });
    document.querySelector('.bell-icon')?.addEventListener('click', () => alert("3 notifications non lues"));
    document.querySelector('.user-meta')?.addEventListener('click', () => alert("Profil administrateur"));
});