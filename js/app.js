/* =========================================================
   NITXU.ART — COMPORTAMIENTO GENERAL DEL SITIO
   Menú móvil, año del footer y animaciones sutiles al hacer
   scroll. No tiene relación con la calculadora ni la galería.
   ========================================================= */
(function () {
  "use strict";

  // --- Menú móvil -------------------------------------------------
  var toggle = document.getElementById("nav-toggle");
  var toggleLabel = document.getElementById("nav-toggle-label");
  var nav = document.querySelector(".site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var abierto = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", abierto ? "true" : "false");
      toggleLabel.textContent = abierto ? "Cerrar" : "Menú";
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggleLabel.textContent = "Menú";
      });
    });
  }

  // --- Año del footer ----------------------------------------------
  var yearEl = document.getElementById("footer-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // --- Aparición suave al hacer scroll -------------------------------
  var elementosAnimados = document.querySelectorAll(
    ".section, .hero__text, .hero__media"
  );

  elementosAnimados.forEach(function (el) {
    el.classList.add("reveal");
  });

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    elementosAnimados.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Sin soporte para IntersectionObserver: mostrar todo directamente
    elementosAnimados.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }
})();
