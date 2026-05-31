// ========== GESTION DU PROFIL ET DU MOT DE PASSE ==========
function loadUser() {
    const raw = localStorage.getItem("user");
    if (!raw) {
        window.location.href = "login.html";
        return;
    }
    const user = JSON.parse(raw);

    const initiales = ((user.prenom?.[0] ?? "") + (user.nom?.[0] ?? "")).toUpperCase() || "A";
    document.getElementById("avatarBig").textContent = initiales;
    document.getElementById("topbar-avatar").textContent = initiales;
    document.getElementById("admin-fullname").textContent = `Ad. ${user.nom || "LACQUEMANT"}`;
    document.getElementById("displayName").textContent = `${user.prenom || ""} ${user.nom || ""}`;
    document.getElementById("displayRole").textContent =
        user.role === "admin" ? "Administrateur" :
        user.role === "praticien" ? "Praticien" : "Étudiant";

    document.getElementById("prenom").value = user.prenom ?? "";
    document.getElementById("nom").value = user.nom ?? "";
    document.getElementById("email").value = user.email ?? "";
    document.getElementById("telephone").value = user.telephone ?? "";
}

async function saveProfile() {
    const btn = document.getElementById("btnSave");
    btn.disabled = true;
    btn.textContent = "Enregistrement…";

    const raw = localStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : {};

    const updated = {
        id: user.id,
        prenom: document.getElementById("prenom").value.trim(),
        nom: document.getElementById("nom").value.trim(),
        email: document.getElementById("email").value.trim(),
        telephone: document.getElementById("telephone").value.trim()
    };

    try {
        const response = await fetch("../backend/user.php?action=update_profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated)
        });
        const data = await response.json();
        if (data.success) {
            const newUser = { ...user, ...updated };
            localStorage.setItem("user", JSON.stringify(newUser));
            loadUser();
            showMsg("message", "✅ Profil mis à jour avec succès !", "success");
        } else {
            showMsg("message", data.error || "Erreur lors de la mise à jour.", "error");
        }
    } catch {
        showMsg("message", "Erreur de connexion au serveur.", "error");
    }

    btn.disabled = false;
    btn.innerHTML = "💾 Enregistrer les modifications";
}

async function changePassword() {
    const actuel = document.getElementById("pwdActuel").value;
    const nouveau = document.getElementById("pwdNew").value;
    const confirm = document.getElementById("pwdConfirm").value;

    if (!actuel || !nouveau || !confirm) {
        showMsg("messagePwd", "Remplissez tous les champs.", "error");
        return;
    }
    if (nouveau !== confirm) {
        showMsg("messagePwd", "Les mots de passe ne correspondent pas.", "error");
        return;
    }
    if (nouveau.length < 6) {
        showMsg("messagePwd", "Mot de passe trop court (6 caractères min).", "error");
        return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.id) return;

    try {
        const response = await fetch("../backend/user.php?action=change_password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: user.id,
                mot_de_passe_actuel: actuel,
                nouveau_mot_de_passe: nouveau
            })
        });
        const data = await response.json();
        if (data.success) {
            showMsg("messagePwd", "✅ Mot de passe modifié !", "success");
            document.getElementById("pwdActuel").value = "";
            document.getElementById("pwdNew").value = "";
            document.getElementById("pwdConfirm").value = "";
        } else {
            showMsg("messagePwd", data.error || "Erreur.", "error");
        }
    } catch {
        showMsg("messagePwd", "Erreur de connexion au serveur.", "error");
    }
}

function checkStrength(val) {
    const fill = document.getElementById("pwdBarFill");
    const label = document.getElementById("pwdLabel");
    if (!val) {
        fill.style.width = "0";
        label.textContent = "";
        return;
    }
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    const levels = [
        { pct: "20%", color: "#e05c5c", text: "Très faible" },
        { pct: "40%", color: "#f4a261", text: "Faible" },
        { pct: "65%", color: "#f4d35e", text: "Moyen" },
        { pct: "85%", color: "#52b788", text: "Fort" },
        { pct: "100%", color: "#2d6a4f", text: "Très fort" }
    ];
    const lvl = levels[Math.min(score, 4)];
    fill.style.width = lvl.pct;
    fill.style.background = lvl.color;
    label.textContent = lvl.text;
    label.style.color = lvl.color;
}

function showMsg(divId, text, type) {
    const el = document.getElementById(divId);
    if (!el) return;
    el.textContent = text;
    el.className = type === "success" ? "msg-success" : "msg-error";
    setTimeout(() => {
        el.textContent = "";
        el.className = "";
    }, 4000);
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

// ========== INITIALISATION ==========
document.addEventListener('DOMContentLoaded', function() {
    loadUser();
    document.getElementById("btnSave").addEventListener("click", saveProfile);
    document.getElementById("btnChangePwd").addEventListener("click", changePassword);
});