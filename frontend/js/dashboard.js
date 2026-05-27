document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const prenom = user.prenom || "";
  const nom = user.nom || "";

  document.getElementById("studentName").textContent = `${prenom} ${nom}`;
  document.getElementById("welcomeName").textContent = prenom;

  document.getElementById("studentAvatar").textContent =
    `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
});

function toggleAccountMenu() {
  document.getElementById("accountMenu").classList.toggle("hidden");
}