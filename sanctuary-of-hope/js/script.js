// Shared behavior for every public page: the side drawer navigation
// (hamburger toggle, overlay, ESC to close) and the WhatsApp button that
// fades in once the visitor has scrolled past the hero.

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const drawer = document.querySelector(".nav-drawer");
  const overlay = document.querySelector(".nav-overlay");
  const closeBtn = document.querySelector(".nav-close");

  function openDrawer() {
    drawer.classList.add("is-open");
    overlay.classList.add("is-visible");
    toggle.classList.add("is-active");
    toggle.setAttribute("aria-expanded", "true");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("nav-open");
  }

  function closeDrawer() {
    drawer.classList.remove("is-open");
    overlay.classList.remove("is-visible");
    toggle.classList.remove("is-active");
    toggle.setAttribute("aria-expanded", "false");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("nav-open");
  }

  if (toggle && drawer && overlay) {
    toggle.addEventListener("click", () => {
      if (drawer.classList.contains("is-open")) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    closeBtn?.addEventListener("click", closeDrawer);
    overlay.addEventListener("click", closeDrawer);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) {
        closeDrawer();
      }
    });

    // Close the drawer automatically when a link inside it is used.
    drawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeDrawer);
    });
  }

  const waButton = document.querySelector(".whatsapp-float");
  if (waButton) {
    const showAfter = 320; // pixels scrolled before the button appears
    const toggleWaButton = () => {
      if (window.scrollY > showAfter) {
        waButton.classList.add("is-visible");
      } else {
        waButton.classList.remove("is-visible");
      }
    };
    toggleWaButton();
    window.addEventListener("scroll", toggleWaButton, { passive: true });
  }
});
