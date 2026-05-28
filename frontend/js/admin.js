document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "admin") {
    window.location.href = "login.html";
    return;
  }

  const buttons = document.querySelectorAll(".admin-nav button");
  const pages = document.querySelectorAll(".admin-page");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      buttons.forEach(btn => btn.classList.remove("active"));
      pages.forEach(page => page.classList.remove("active"));

      button.classList.add("active");

      const pageId = button.dataset.page;
      document.getElementById(pageId).classList.add("active");
    });
  });
});