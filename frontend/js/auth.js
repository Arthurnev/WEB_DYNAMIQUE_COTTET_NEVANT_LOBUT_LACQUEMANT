function showMessage(text, type) {
  const msg = document.getElementById("message");
  if (!msg) return;

  msg.textContent = text;
  msg.className = "message " + type;
  msg.style.display = "block";
}

function switchTab(role, el) {
  document.getElementById("form-etudiant").style.display =
    role === "etudiant" ? "block" : "none";

  document.getElementById("form-praticien").style.display =
    role === "praticien" ? "block" : "none";

  document.querySelectorAll(".tab").forEach(tab => {
    tab.classList.remove("active");
  });

  el.classList.add("active");
}

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showMessage("Remplis tous les champs", "error");
    return;
  }

  try {
    const res = await fetch("../backend/auth.php?action=login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        mot_de_passe: password
      })
    });

    const data = await res.json();
    console.log(data);

    if (data.success) {
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "admin") {
        window.location.href = "admin.html";
      } else if (data.user.role === "praticien") {
        window.location.href = "dashboard_praticien.html";
      } else {
        window.location.href = "index.html";
      }

    } else {
      showMessage(data.error, "error");
    }

  } catch (error) {
    showMessage("Erreur de connexion au serveur", "error");
  }
}

async function registerEtudiant() {
  const nom = document.getElementById("nom-e").value.trim();
  const prenom = document.getElementById("prenom-e").value.trim();
  const email = document.getElementById("email-e").value.trim();
  const password = document.getElementById("password-e").value;

  if (!nom || !prenom || !email || !password) {
    showMessage("Remplis tous les champs", "error");
    return;
  }

  try {
    const res = await fetch("../backend/auth.php?action=register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nom: nom,
        prenom: prenom,
        email: email,
        mot_de_passe: password
      })
    });

    const data = await res.json();

    if (data.success) {
      showMessage("Compte créé ! Redirection...", "success");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);

    } else {
      showMessage(data.error, "error");
    }

  } catch (error) {
    showMessage("Erreur de connexion au serveur", "error");
  }
}

async function registerPraticien() {
  const nom = document.getElementById("nom-p").value.trim();
  const prenom = document.getElementById("prenom-p").value.trim();
  const email = document.getElementById("email-p").value.trim();
  const password = document.getElementById("password-p").value;
  const telephone = document.getElementById("telephone-p").value.trim();
  const adresse = document.getElementById("adresse-p").value.trim();
  const specialite = document.getElementById("specialite-p").value;
  const diplome = document.getElementById("diplome-p").value.trim();
  const rpps = document.getElementById("rpps-p").value.trim();

  if (!nom || !prenom || !email || !password || !specialite) {
    showMessage("Remplis tous les champs obligatoires", "error");
    return;
  }

  try {
    const res = await fetch("../backend/auth.php?action=register_praticien", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nom: nom,
        prenom: prenom,
        email: email,
        mot_de_passe: password,
        telephone: telephone,
        adresse: adresse,
        specialite: specialite,
        diplome: diplome,
        rpps: rpps
      })
    });

    const data = await res.json();

    if (data.success) {
      showMessage("Compte praticien créé ! Redirection...", "success");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);

    } else {
      showMessage(data.error, "error");
    }

  } catch (error) {
    showMessage("Erreur de connexion au serveur", "error");
  }
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "Accueil.html";
}