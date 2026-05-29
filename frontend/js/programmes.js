let programmes = [];

async function loadProgrammes() {
    try {
        // Correction du chemin : backend/programmes.php
        const response = await fetch("../backend/programmes.php?action=list");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (data.success) {
            programmes = data.data;
            renderTable();
        } else {
            alert("Erreur : " + (data.error || "Chargement impossible"));
        }
    } catch (error) {
        console.error(error);
        alert("Erreur de connexion au serveur : " + error.message);
    }
}

async function deleteProgramme(id) {
    if (!confirm("Supprimer définitivement ce programme ?")) return;
    try {
        const response = await fetch("../backend/programmes.php?action=delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        });
        const data = await response.json();
        if (data.success) {
            alert("Programme supprimé.");
            await loadProgrammes();
        } else {
            alert(data.error || "Erreur lors de la suppression");
        }
    } catch (error) {
        console.error(error);
        alert("Erreur de connexion");
    }
}

function formatDateTime(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => (m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'));
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    if (programmes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem;">Aucun programme trouvé</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    programmes.forEach(p => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${escapeHtml(p.nom || '-')}</strong></td>
            <td>${escapeHtml(p.description) || '-'}</td>
            <td>${formatDateTime(p.date_heure)}</td>
            <td>${p.capacite_max ?? '-'}</td>
            <td>${escapeHtml(p.lieu) || '-'}</td>
            <td>${escapeHtml(p.intervenant) || '-'}</td>
            <td style="text-align: center;">
                <button class="btn-delete" data-id="${p.id}"><i class="far fa-trash-alt"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            deleteProgramme(id);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadProgrammes();
});