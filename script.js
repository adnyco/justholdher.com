document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".topnav-links");

  let overlay = document.querySelector(".topnav-overlay");
  if (!hamburger || !navLinks) return;

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "topnav-overlay";
    document.body.appendChild(overlay);
  }

  const toggleMenu = () => {
    const isActive = hamburger.classList.toggle("active");
    navLinks.classList.toggle("active");
    overlay.classList.toggle("active");
    hamburger.setAttribute("aria-expanded", isActive);
    document.body.style.overflow = isActive ? "hidden" : "";
  };

  hamburger.addEventListener("click", toggleMenu);
  overlay.addEventListener("click", toggleMenu);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navLinks.classList.contains("active")) {
      toggleMenu();
    }
  });
});
