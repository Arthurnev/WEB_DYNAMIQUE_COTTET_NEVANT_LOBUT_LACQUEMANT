// Plage horaires de travail complète (08:00 à 20:00)
const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", 
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
];

// Banque d'événements calés sur mai/juin 2026
let databaseEvents = [
    { date: "2026-05-27", time: "14:00", title: "Paul Lefebvre", desc: "Consultation" },
    { date: "2026-05-27", time: "14:30", title: "Paul Lefebvre", desc: "Consultation" },
    { date: "2026-05-26", time: "10:30", title: "Sophie Martin", desc: "Suivi nutritionnel" },
    { date: "2026-05-12", time: "09:00", title: "Jean Dupont", desc: "Bilan Pro" }
];

// Configuration temporelle par défaut (Fixée au 27 mai 2026)
let navigationDate = new Date(2026, 4, 27); 
let activeViewSetting = "week";

// Calcule le lundi de la semaine d'une date donnée
function getStartOfWeek(d) {
    let date = new Date(d);
    let day = date.getDay();
    let diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
}

// Convertit une date en clé ISO (AAAA-MM-JJ)
function createDateISOKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Rafraîchit le titre de la période affichée
function refreshDateHeading() {
    const label = document.getElementById("periodTitle");
    if (activeViewSetting === "month") {
        label.innerText = navigationDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    } else if (activeViewSetting === "day") {
        label.innerText = navigationDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    } else {
        let start = getStartOfWeek(navigationDate);
        label.innerText = start.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }
}

// Construction complète de la vue
function buildCalendarView() {
    const targetContainer = document.getElementById("calendarCard");
    refreshDateHeading();
    let markup = "";

    if (activeViewSetting === "day" || activeViewSetting === "week") {
        const columnsCount = activeViewSetting === "week" ? 7 : 1;
        targetContainer.style.setProperty('--column-count', columnsCount);

        // En-tête
        markup += `<div class="calendar-header-wrapper"><div class="head-cell"></div>`;
        
        let daysRange = [];
        if (activeViewSetting === "week") {
            let currentIterationDate = getStartOfWeek(navigationDate);
            for (let i = 0; i < 7; i++) {
                daysRange.push(new Date(currentIterationDate));
                currentIterationDate.setDate(currentIterationDate.getDate() + 1);
            }
        } else {
            daysRange.push(new Date(navigationDate));
        }

        daysRange.forEach(day => {
            let dayLabel = day.toLocaleDateString('fr-FR', { weekday: 'short' });
            let numLabel = day.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
            markup += `<div class="head-cell"><strong>${dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)}</strong>${numLabel}</div>`;
        });
        markup += `</div>`;

        // Grille des créneaux
        markup += `<div class="calendar-scroll-body"><div class="grid-timetable">`;
        
        timeSlots.forEach(slot => {
            markup += `<div class="hour-label-cell"><span>${slot}</span></div>`;
            for (let colIndex = 0; colIndex < columnsCount; colIndex++) {
                let key = createDateISOKey(daysRange[colIndex]);
                let match = databaseEvents.find(e => e.date === key && e.time === slot);
                
                markup += `<div class="grid-data-slot">`;
                if (match) {
                    markup += `<div class="appointment-card"><strong>${match.title}</strong>${match.desc}</div>`;
                }
                markup += `</div>`;
            }
        });
        
        markup += `</div></div>`;
    } 
    else if (activeViewSetting === "month") {
        targetContainer.style.setProperty('--column-count', 7);
        
        // En-tête des jours
        markup += `<div class="calendar-header-wrapper is-month">`;
        const weekDaysAlpha = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
        weekDaysAlpha.forEach(d => markup += `<div class="head-cell"><strong>${d}</strong></div>`);
        markup += `</div>`;

        // Grille 5 semaines (35 jours)
        markup += `<div class="calendar-scroll-body"><div class="month-layout-grid">`;

        let baseMonthStart = new Date(navigationDate.getFullYear(), navigationDate.getMonth(), 1);
        let dayPosition = baseMonthStart.getDay();
        let padOffset = dayPosition === 0 ? 6 : dayPosition - 1;

        let calendarCursor = new Date(baseMonthStart);
        calendarCursor.setDate(calendarCursor.getDate() - padOffset);

        for (let tile = 0; tile < 35; tile++) {
            let outOfBounds = calendarCursor.getMonth() !== navigationDate.getMonth();
            let key = createDateISOKey(calendarCursor);
            let dayMatches = databaseEvents.filter(e => e.date === key);

            markup += `<div class="month-cell-day ${outOfBounds ? 'inactive-month' : ''}">
                        <div class="month-day-num">${calendarCursor.getDate()}</div>`;
            
            dayMatches.forEach(ev => {
                markup += `<div class="month-pill-task">${ev.title}</div>`;
            });
            
            markup += `</div>`;
            calendarCursor.setDate(calendarCursor.getDate() + 1);
        }
        markup += `</div></div>`;
    }

    targetContainer.innerHTML = markup;
}

// Gestionnaires d'événements
document.getElementById("prevPeriod").addEventListener("click", () => {
    if (activeViewSetting === "day") navigationDate.setDate(navigationDate.getDate() - 1);
    else if (activeViewSetting === "week") navigationDate.setDate(navigationDate.getDate() - 7);
    else navigationDate.setMonth(navigationDate.getMonth() - 1);
    buildCalendarView();
});

document.getElementById("nextPeriod").addEventListener("click", () => {
    if (activeViewSetting === "day") navigationDate.setDate(navigationDate.getDate() + 1);
    else if (activeViewSetting === "week") navigationDate.setDate(navigationDate.getDate() + 7);
    else navigationDate.setMonth(navigationDate.getMonth() + 1);
    buildCalendarView();
});

document.getElementById("jumpToday").addEventListener("click", () => {
    navigationDate = new Date(2026, 4, 27); // Fixé au 27 mai 2026
    buildCalendarView();
});

// Changement de vue (Jour / Semaine / Mois)
document.querySelectorAll(".pill-btn").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".pill-btn").forEach(b => b.classList.remove("active"));
        button.classList.add("active");
        activeViewSetting = button.getAttribute("data-view");
        buildCalendarView();
    });
});

window.onload = buildCalendarView;