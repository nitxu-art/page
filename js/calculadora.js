/* =========================================================
   CALCULADORA DE PINTURAS
   Lógica y configuración copiadas sin modificar desde el
   calculadora.html original. El único cambio estructural es
   la selección del elemento raíz (root): en el archivo original
   el script era inline y usaba document.currentScript para
   encontrar el widget; acá el script es externo, así que el
   widget se busca directamente en el documento. La fórmula de
   precio, los multiplicadores y los costos NO se modificaron.
   ========================================================= */
(function () {
  "use strict";

  /* =========================================================
     CONFIGURACION
     Todos los valores modificables del negocio viven acá.
     Cambiar precios, consumos o multiplicadores solo requiere
     editar este bloque; el resto del código no necesita tocarse.
     ========================================================= */
  var CONFIG = {

    // Costo interno de cada tamaño de lienzo (no se muestra al cliente)
    lienzos: {
      "18x24": { costo: 124, etiqueta: "18 × 24 cm" },
      "40x50": { costo: 305, etiqueta: "40 × 50 cm" }
    },

    // Costo de cada frasco de pintura de 60 ml
    precioPintura: 111,

    // Consumo estimado de pintura (en frascos equivalentes de 60 ml)
    // Estructura: consumoPintura[tamaño][estilo][color]
    // VALORES PROVISIONALES — solo para probar el funcionamiento.
    consumoPintura: {
      "18x24": {
        anime:    { byn: 0.5, color: 1 },
        realismo: { byn: 1,   color: 1.5 }
      },
      "40x50": {
        anime:    { byn: 2, color: 3 },
        realismo: { byn: 3, color: 5 }
      }
    },

    // Multiplicadores de trabajo según estilo — VALORES PROVISIONALES
    multiplicadorEstilo: {
      anime: 2.0,
      realismo: 3.0
    },

    // Multiplicadores de trabajo según color — VALORES PROVISIONALES
    multiplicadorColor: {
      byn: 1.0,
      color: 1.5
    },

    // Paso de redondeo comercial (redondea al múltiplo de este valor)
    pasoRedondeo: 5
  };

  /* =========================================================
     LÓGICA DE CÁLCULO
     ========================================================= */

  // Redondeo comercial. Función aislada para poder cambiar la
  // estrategia de redondeo más adelante sin tocar el resto del código.
  function redondearPrecio(valor) {
    var paso = CONFIG.pasoRedondeo;
    return Math.round(valor / paso) * paso;
  }

  // Calcula el precio final a partir de las tres selecciones.
  // precio final = (costo lienzo + costo pintura) × mult. estilo × mult. color
  function calcularPrecio(tamaño, estilo, color) {
    var costoLienzo = CONFIG.lienzos[tamaño].costo;

    var frascosEstimados = CONFIG.consumoPintura[tamaño][estilo][color];
    var costoPintura = frascosEstimados * CONFIG.precioPintura;

    var costoMateriales = costoLienzo + costoPintura;

    var multEstilo = CONFIG.multiplicadorEstilo[estilo];
    var multColor = CONFIG.multiplicadorColor[color];

    var precioFinal = costoMateriales * multEstilo * multColor;

    return redondearPrecio(precioFinal);
  }

  function formatearPrecio(valor) {
    return "$" + valor.toLocaleString("es-AR");
  }

  /* =========================================================
     ESTADO E INTERFAZ
     ========================================================= */

  var estado = {
    size: null,
    style: null,
    color: null
  };

  var root = document.querySelector(".paint-calculator");
  if (!root) return;

  var priceEl = root.querySelector("[data-pc-price]");
  var optionButtons = root.querySelectorAll("[data-pc-option]");

  function actualizarResultado() {
    if (estado.size && estado.style && estado.color) {
      var precio = calcularPrecio(estado.size, estado.style, estado.color);
      priceEl.textContent = formatearPrecio(precio);
    } else {
      priceEl.textContent = "Elegí las tres opciones";
    }
  }

  optionButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var grupo = btn.getAttribute("data-pc-option");
      var valor = btn.getAttribute("data-pc-value");

      // Actualiza el estado
      estado[grupo] = valor;

      // Actualiza el estado visual (aria-pressed) de todo el grupo
      var hermanos = root.querySelectorAll('[data-pc-option="' + grupo + '"]');
      hermanos.forEach(function (hermano) {
        hermano.setAttribute("aria-pressed", hermano === btn ? "true" : "false");
      });

      actualizarResultado();
    });
  });

  actualizarResultado();
})();
