// Données simulées – à remplacer par des appels API (fetch) plus tard
const monthlyData = [
    { month: "Jan", value: 45 },
    { month: "Fév", value: 52 },
    { month: "Mar", value: 48 },
    { month: "Avr", value: 62 },
    { month: "Mai", value: 58 }
];

const serviceData = [
    { name: "Consultations médicales", value: 142, percent: 42 },
    { name: "Nutrition", value: 85, percent: 25 },
    { name: "Sport & Fitness", value: 64, percent: 19 },
    { name: "Bien-être mental", value: 47, percent: 14 }
];

const topPraticiensData = [
    { name: "Dr. Marie Martin", count: 45 },
    { name: "Dr. Pierre Durand", count: 38 },
    { name: "Dr. Jean Petit", count: 32 },
    { name: "Dr. Sophie Leroy", count: 28 },
    { name: "Dr. Paul Lambert", count: 24 }
];

const newUsersData = [
    { month: "Janvier", total: 28, praticiens: 6, maxTotal: 42 },
    { month: "Février", total: 35, praticiens: 6, maxTotal: 42 },
    { month: "Mars", total: 31, praticiens: 7, maxTotal: 42 },
    { month: "Avril", total: 39, praticiens: 7, maxTotal: 42 },
    { month: "Mai", total: 42, praticiens: 7, maxTotal: 42 }
];

// Évolution par mois avec jauge
function renderMonthlyEvolution() {
    const container = document.getElementById('monthlyEvolution');
    if (!container) return;
    const maxValue = Math.max(...monthlyData.map(d => d.value));
    container.innerHTML = '';
    monthlyData.forEach(d => {
        const percent = (d.value / maxValue) * 100;
        const div = document.createElement('div');
        div.className = 'month-item';
        div.innerHTML = `
            <div class="month-header">
                <span>${d.month}</span>
                <span class="month-value">${d.value} réservations</span>
            </div>
            <div class="month-bar-container">
                <div class="month-bar" style="width: ${percent}%;"></div>
            </div>
        `;
        container.appendChild(div);
    });
}

// Répartition par service avec jauge (en pourcentage)
function renderServiceRepartition() {
    const container = document.getElementById('serviceRepartition');
    if (!container) return;
    container.innerHTML = '';
    serviceData.forEach(s => {
        const div = document.createElement('div');
        div.className = 'service-item';
        div.innerHTML = `
            <div class="service-header">
                <span>${s.name}</span>
                <span class="service-value">${s.value} (${s.percent}%)</span>
            </div>
            <div class="service-bar-container">
                <div class="service-bar" style="width: ${s.percent}%;"></div>
            </div>
        `;
        container.appendChild(div);
    });
}

// Top 5 praticiens
function renderTopPracticiens() {
    const container = document.getElementById('topPracticiens');
    if (!container) return;
    const maxCount = Math.max(...topPraticiensData.map(p => p.count));
    container.innerHTML = '';
    topPraticiensData.forEach(p => {
        const percent = (p.count / maxCount) * 100;
        const div = document.createElement('div');
        div.className = 'praticien-item';
        div.innerHTML = `
            <div class="praticien-header">
                <span>${p.name}</span>
                <span class="praticien-value">${p.count}</span>
            </div>
            <div class="praticien-bar-container">
                <div class="praticien-bar" style="width: ${percent}%;"></div>
            </div>
        `;
        container.appendChild(div);
    });
}

// Nouveaux utilisateurs par mois
function renderNewUsers() {
    const container = document.getElementById('newUsers');
    if (!container) return;
    const maxTotal = Math.max(...newUsersData.map(u => u.total));
    container.innerHTML = '';
    newUsersData.forEach(u => {
        const percent = (u.total / maxTotal) * 100;
        const div = document.createElement('div');
        div.className = 'user-month';
        div.innerHTML = `
            <div class="user-month-header">
                <strong>${u.month}</strong>
                <span>${u.total} utilisateurs</span>
            </div>
            <div class="user-month-detail">
                <span>Praticiens: ${u.praticiens}</span>
                <span>Élèves: ${u.total - u.praticiens}</span>
            </div>
            <div class="user-month-bar">
                <div class="user-month-fill" style="width: ${percent}%;"></div>
            </div>
        `;
        container.appendChild(div);
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    renderMonthlyEvolution();
    renderServiceRepartition();
    renderTopPracticiens();
    renderNewUsers();

    // Interactions communes (aide, cloche, profil)
    const helpBtn = document.querySelector('.floating-help-btn');
    if (helpBtn) helpBtn.addEventListener('click', () => alert("Support : support@vitacare-campus.fr"));
    const bell = document.querySelector('.bell-icon');
    if (bell) bell.addEventListener('click', () => alert("Vous avez 3 notifications non lues"));
    const userMeta = document.querySelector('.user-meta');
    if (userMeta) userMeta.addEventListener('click', () => alert("Profil administrateur"));
});