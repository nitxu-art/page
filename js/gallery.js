/* =========================================================
   NITXU.ART — GALERÍA DINÁMICA
   Lee la estructura de /secciones directamente desde GitHub
   (vía la API pública de contenidos) y arma la galería con las
   categorías y subcarpetas que realmente tengan imágenes.
   No hace falta tocar este archivo para agregar obras nuevas:
   alcanza con subir la imagen a la carpeta correspondiente.
   ========================================================= */
(function () {
  "use strict";

  /* =========================================================
     CONFIGURACIÓN — completar con los datos del repositorio
     ========================================================= */
  var GITHUB_USER = "TU-USUARIO";
  var GITHUB_REPO = "TU-REPOSITORIO";
  var GITHUB_BRANCH = "main";
  var SECTIONS_PATH = "secciones";

  var EXTENSIONES_IMAGEN = /\.(jpe?g|png|webp|gif|avif)$/i;

  // Etiquetas conocidas. Cualquier carpeta que no esté acá se
  // muestra igual, usando su propio nombre con mayúscula inicial.
  var ETIQUETAS_CATEGORIA = { anime: "Anime", realismo: "Realismo" };
  var ETIQUETAS_SUBCARPETA = { color: "Color", byn: "Blanco y negro" };

  function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }
  function etiquetaCategoria(nombre) {
    return ETIQUETAS_CATEGORIA[nombre.toLowerCase()] || capitalizar(nombre);
  }
  function etiquetaSubcarpeta(nombre) {
    return ETIQUETAS_SUBCARPETA[nombre.toLowerCase()] || capitalizar(nombre);
  }

  /* =========================================================
     LECTURA DE GITHUB
     ========================================================= */

  function urlContenido(path) {
    return (
      "https://api.github.com/repos/" +
      GITHUB_USER +
      "/" +
      GITHUB_REPO +
      "/contents/" +
      path +
      "?ref=" +
      GITHUB_BRANCH
    );
  }

  // Devuelve el listado de una carpeta, o [] si no existe / está vacía.
  function listarCarpeta(path) {
    return fetch(urlContenido(path), {
      headers: { Accept: "application/vnd.github+json" }
    })
      .then(function (res) {
        if (res.status === 404) return [];
        if (!res.ok) throw new Error("GitHub API respondió " + res.status);
        return res.json();
      })
      .then(function (data) {
        return Array.isArray(data) ? data : [];
      });
  }

  // Recorre secciones/ → cada categoría → sus subcarpetas → sus imágenes.
  // Descarta automáticamente cualquier carpeta vacía en cualquier nivel.
  function construirGaleria() {
    return listarCarpeta(SECTIONS_PATH).then(function (raiz) {
      var categorias = raiz.filter(function (item) {
        return item.type === "dir";
      });

      return Promise.all(
        categorias.map(function (categoria) {
          return listarCarpeta(categoria.path).then(function (contenido) {
            var subcarpetas = contenido.filter(function (item) {
              return item.type === "dir";
            });

            return Promise.all(
              subcarpetas.map(function (sub) {
                return listarCarpeta(sub.path).then(function (archivos) {
                  var imagenes = archivos
                    .filter(function (item) {
                      return (
                        item.type === "file" &&
                        EXTENSIONES_IMAGEN.test(item.name)
                      );
                    })
                    .map(function (item) {
                      return {
                        nombre: item.name,
                        url: item.download_url
                      };
                    });

                  return { nombre: sub.name, imagenes: imagenes };
                });
              })
            ).then(function (subcarpetasConImagenes) {
              var subcarpetasConContenido = subcarpetasConImagenes.filter(
                function (s) {
                  return s.imagenes.length > 0;
                }
              );
              return { nombre: categoria.name, subcarpetas: subcarpetasConContenido };
            });
          });
        })
      ).then(function (categoriasConSubcarpetas) {
        // Se descarta cualquier categoría que haya quedado sin
        // ninguna subcarpeta con imágenes.
        return categoriasConSubcarpetas.filter(function (cat) {
          return cat.subcarpetas.length > 0;
        });
      });
    });
  }

  /* =========================================================
     RENDERIZADO
     ========================================================= */

  var galeriaEl = document.getElementById("gallery");
  var statusEl = document.getElementById("gallery-status");

  function configuracionPendiente() {
    return GITHUB_USER === "TU-USUARIO" || GITHUB_REPO === "TU-REPOSITORIO";
  }

  function mostrarMensaje(html, clase) {
    galeriaEl.innerHTML =
      '<p class="' + clase + '">' + html + "</p>";
  }

  function renderGaleria(categorias) {
    galeriaEl.innerHTML = "";

    if (categorias.length === 0) {
      mostrarMensaje(
        "Todavía no hay obras cargadas en <code>/secciones</code>. " +
          "Subí una imagen a, por ejemplo, <code>secciones/anime/color/</code> y va a aparecer acá automáticamente.",
        "gallery__empty"
      );
      return;
    }

    categorias.forEach(function (categoria) {
      var bloque = document.createElement("div");
      bloque.className = "gallery__categoria";

      var encabezado = document.createElement("div");
      encabezado.className = "gallery__categoria-encabezado";

      var titulo = document.createElement("h3");
      titulo.className = "gallery__categoria-titulo";
      titulo.textContent = etiquetaCategoria(categoria.nombre);
      encabezado.appendChild(titulo);

      var grid = document.createElement("div");
      grid.className = "gallery__grid";

      // Todas las imágenes de la categoría, con referencia a su subcarpeta,
      // para poder filtrar sin volver a pedir nada a GitHub.
      var todasLasImagenes = [];
      categoria.subcarpetas.forEach(function (sub) {
        sub.imagenes.forEach(function (img) {
          todasLasImagenes.push({
            url: img.url,
            nombre: img.nombre,
            subcarpeta: sub.nombre,
            categoria: categoria.nombre
          });
        });
      });

      function pintarGrid(filtro) {
        grid.innerHTML = "";
        var visibles = filtro
          ? todasLasImagenes.filter(function (img) {
              return img.subcarpeta === filtro;
            })
          : todasLasImagenes;

        visibles.forEach(function (img) {
          var boton = document.createElement("button");
          boton.type = "button";
          boton.className = "gallery__item";
          boton.setAttribute(
            "aria-label",
            "Ver obra: " + etiquetaCategoria(categoria.nombre) + ", " + etiquetaSubcarpeta(img.subcarpeta)
          );

          var imagen = document.createElement("img");
          imagen.src = img.url;
          imagen.alt =
            "Obra de " +
            etiquetaCategoria(categoria.nombre) +
            " (" +
            etiquetaSubcarpeta(img.subcarpeta) +
            ")";
          imagen.loading = "lazy";

          boton.appendChild(imagen);
          boton.addEventListener("click", function () {
            abrirLightbox(visibles, visibles.indexOf(img));
          });

          grid.appendChild(boton);
        });
      }

      // Filtros (Color / Blanco y negro) — solo si hay más de una subcarpeta con contenido.
      if (categoria.subcarpetas.length > 1) {
        var filtros = document.createElement("div");
        filtros.className = "gallery__filtros";
        filtros.setAttribute("role", "group");
        filtros.setAttribute(
          "aria-label",
          "Filtrar obras de " + etiquetaCategoria(categoria.nombre)
        );

        var botonTodos = document.createElement("button");
        botonTodos.type = "button";
        botonTodos.className = "gallery__filtro";
        botonTodos.textContent = "Todas";
        botonTodos.setAttribute("aria-pressed", "true");
        filtros.appendChild(botonTodos);

        var botonesFiltro = [botonTodos];

        categoria.subcarpetas.forEach(function (sub) {
          var boton = document.createElement("button");
          boton.type = "button";
          boton.className = "gallery__filtro";
          boton.textContent = etiquetaSubcarpeta(sub.nombre);
          boton.setAttribute("aria-pressed", "false");
          botonesFiltro.push(boton);
          filtros.appendChild(boton);

          boton.addEventListener("click", function () {
            botonesFiltro.forEach(function (b) {
              b.setAttribute("aria-pressed", b === boton ? "true" : "false");
            });
            pintarGrid(sub.nombre);
          });
        });

        botonTodos.addEventListener("click", function () {
          botonesFiltro.forEach(function (b) {
            b.setAttribute("aria-pressed", b === botonTodos ? "true" : "false");
          });
          pintarGrid(null);
        });

        encabezado.appendChild(filtros);
      }

      bloque.appendChild(encabezado);
      bloque.appendChild(grid);
      galeriaEl.appendChild(bloque);

      pintarGrid(null);
    });
  }

  /* =========================================================
     LIGHTBOX
     ========================================================= */

  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  var lightboxCaption = document.getElementById("lightbox-caption");
  var lightboxClose = document.getElementById("lightbox-close");
  var lightboxPrev = document.getElementById("lightbox-prev");
  var lightboxNext = document.getElementById("lightbox-next");

  var imagenesActuales = [];
  var indiceActual = 0;
  var elementoConFoco = null;

  function abrirLightbox(imagenes, indice) {
    imagenesActuales = imagenes;
    indiceActual = indice;
    elementoConFoco = document.activeElement;
    actualizarLightbox();
    lightbox.hidden = false;
    lightboxClose.focus();
    document.addEventListener("keydown", manejarTeclado);
  }

  function cerrarLightbox() {
    lightbox.hidden = true;
    document.removeEventListener("keydown", manejarTeclado);
    if (elementoConFoco) elementoConFoco.focus();
  }

  function actualizarLightbox() {
    var img = imagenesActuales[indiceActual];
    if (!img) return;
    lightboxImg.src = img.url;
    lightboxImg.alt =
      "Obra de " +
      etiquetaCategoria(img.categoria) +
      " (" +
      etiquetaSubcarpeta(img.subcarpeta) +
      ")";
    lightboxCaption.textContent =
      etiquetaCategoria(img.categoria) + " · " + etiquetaSubcarpeta(img.subcarpeta);

    var haySoloUna = imagenesActuales.length <= 1;
    lightboxPrev.hidden = haySoloUna;
    lightboxNext.hidden = haySoloUna;
  }

  function irASiguiente() {
    indiceActual = (indiceActual + 1) % imagenesActuales.length;
    actualizarLightbox();
  }
  function irAAnterior() {
    indiceActual =
      (indiceActual - 1 + imagenesActuales.length) % imagenesActuales.length;
    actualizarLightbox();
  }

  function manejarTeclado(evento) {
    if (evento.key === "Escape") cerrarLightbox();
    if (evento.key === "ArrowRight") irASiguiente();
    if (evento.key === "ArrowLeft") irAAnterior();
  }

  lightboxClose.addEventListener("click", cerrarLightbox);
  lightboxNext.addEventListener("click", irASiguiente);
  lightboxPrev.addEventListener("click", irAAnterior);

  // Cerrar al hacer clic fuera de la imagen (pero no sobre ella)
  lightbox.addEventListener("click", function (evento) {
    if (evento.target === lightbox) cerrarLightbox();
  });

  // Gesto simple de swipe para celular
  var toqueInicioX = null;
  lightbox.addEventListener("touchstart", function (evento) {
    toqueInicioX = evento.changedTouches[0].clientX;
  });
  lightbox.addEventListener("touchend", function (evento) {
    if (toqueInicioX === null) return;
    var deltaX = evento.changedTouches[0].clientX - toqueInicioX;
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) irASiguiente();
      else irAAnterior();
    }
    toqueInicioX = null;
  });

  /* =========================================================
     INICIO
     ========================================================= */

  if (configuracionPendiente()) {
    mostrarMensaje(
      "Configurá <code>GITHUB_USER</code> y <code>GITHUB_REPO</code> en " +
        "<code>js/gallery.js</code> para activar la galería automática.",
      "gallery__empty"
    );
  } else {
    construirGaleria()
      .then(renderGaleria)
      .catch(function (error) {
        mostrarMensaje(
          "No se pudieron cargar las obras en este momento. " +
            "Si el repositorio es correcto, puede ser un límite temporal " +
            "de la API pública de GitHub — probá de nuevo en unos minutos.",
          "gallery__error"
        );
        console.error("Nitxu.Art — error al leer la galería:", error);
      });
  }
})();
