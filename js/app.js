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

  // --- Imágenes institucionales automáticas -----------------------
  // Cada recuadro con data-placeholder-for="assets/algo.jpg" prueba
  // si esa imagen ya existe. Si existe, la muestra. Si no, deja el
  // aviso de qué archivo falta. Así, subir la foto a /assets alcanza:
  // no hace falta tocar el index.html nunca.
  document.querySelectorAll("[data-placeholder-for]").forEach(function (placeholder) {
    var ruta = placeholder.getAttribute("data-placeholder-for");
    var probeImg = new Image();
    probeImg.onload = function () {
      var img = document.createElement("img");
      img.src = ruta;
      img.alt = placeholder.getAttribute("data-alt") || "";
      // Conserva los modificadores de tamaño (--small, --tall) para
      // que la imagen ocupe el mismo espacio que tenía el placeholder.
      var modificadores = Array.prototype.slice
        .call(placeholder.classList)
        .filter(function (clase) { return clase !== "media-placeholder"; });
      img.className = ["media-placeholder__img"].concat(modificadores).join(" ");
      placeholder.replaceWith(img);
    };
    // Si falla (404, archivo no subido todavía), no se hace nada:
    // el recuadro con el aviso queda tal como está.
    probeImg.src = "/" + ruta;
  });

  // --- Logo del encabezado -----------------------------------------
  // Igual que arriba: si existe /assets/logo.png o /assets/logo.svg,
  // reemplaza el texto "Nitxu.Art" del encabezado por el logo real.
  var marcaHeader = document.querySelector(".site-header__mark");
  if (marcaHeader) {
    ["assets/logo.svg", "assets/logo.png"].forEach(function (ruta) {
      var probeLogo = new Image();
      probeLogo.onload = function () {
        if (marcaHeader.querySelector("img")) return; // ya se reemplazó
        marcaHeader.textContent = "";
        var img = document.createElement("img");
        img.src = "/" + ruta;
        img.alt = "Nitxu.Art";
        img.className = "site-header__logo-img";
        marcaHeader.appendChild(img);
      };
      probeLogo.src = "/" + ruta;
    });
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
