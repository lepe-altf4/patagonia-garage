/* =============================================================
   Patagonia Garage — brand data (IIFE, no modules)
   Edit the values here to update the site. JS only enriches;
   all critical content is also hardcoded in index.html.
   ============================================================= */
(function () {
  "use strict";

  // WhatsApp del local (sin +, sin espacios). Formato AR móvil: 54 9 area numero.
  var WHATSAPP_NUMBER = "5492995725204"; // +54 9 2995 72-5204 (Neuquén)
  var RESERVA_MSG = "Hola! Quiero hacer una reserva en Patagonia Garage";

  window.__BRAND__ = {
    name: "Patagonia Garage",
    city: "Neuquén",
    address: "Antártida Argentina 540, Neuquén",
    instagram: "https://www.instagram.com/patagoniagarage/",
    instagramHandle: "@patagoniagarage",
    whatsapp:
      "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(RESERVA_MSG),
    mapsEmbed:
      "https://www.google.com/maps?q=" +
      encodeURIComponent("Antártida Argentina 540, Neuquén, Argentina") +
      "&output=embed",
    mapsLink:
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent("Antártida Argentina 540, Neuquén, Argentina"),

    // El Ahumador — platos de fuego lento
    smoker: [
      {
        id: "brisket",
        name: "Brisket",
        cut: "Pecho de novillo entero",
        hours: 12,
        wood: "Quebracho",
        photo: "assets/img/brisket.jpg",
        desc:
          "Doce horas sobre brasa de quebracho. Corteza negra de pimienta, anillo de humo rosado y un interior que se deshace sin cuchillo.",
      },
      {
        id: "ribs",
        name: "Ribs de cerdo",
        cut: "Costillar entero glaseado",
        hours: 5,
        wood: "Roble & humo dulce",
        photo: "assets/img/ribs.jpg",
        desc:
          "Cinco horas de humo dulce y glaseado lento. Carne que se desprende del hueso de un mordisco. Pegajoso, profundo, adictivo.",
      },
      {
        id: "vacio",
        name: "Vacío",
        cut: "Vacío entero a fuego manso",
        hours: 6,
        wood: "Brasa de quebracho",
        photo: "assets/img/vacio.jpg",
        desc:
          "Seis horas a fuego manso hasta que las fibras ceden. Borde crocante, centro jugoso y rosado. El clásico llevado al límite.",
      },
      {
        id: "asado",
        name: "Asado ventana del centro",
        cut: "Tira ancha, la del medio",
        hours: 6,
        wood: "Brasa viva",
        photo: "assets/img/asado.jpg",
        desc:
          "La ventana del centro: la tira más ancha y sabrosa. Seis horas de brasa viva, hueso que perfuma y grasa que canta.",
      },
    ],

    // Tragos con nombre de auto — fichas técnicas
    cocktails: [
      { id: "fangio",  name: "Fangio",     model: "El Quíntuple",      base: "Whisky ahumado",   grad: 32, rpm: 96, profile: "Ahumado · vermouth · piel de naranja" },
      { id: "f1",      name: "Fórmula 1",  model: "Pole position",     base: "Gin + espumante",  grad: 18, rpm: 100, profile: "Cítrico eléctrico · burbuja seca" },
      { id: "autodromo", name: "Autódromo", model: "Vuelta rápida",    base: "Fernet + cola",    grad: 22, rpm: 84, profile: "Amargo herbal · clásico de tribuna" },
      { id: "mustang", name: "Mustang",    model: "V8 sin filtro",     base: "Bourbon",          grad: 30, rpm: 92, profile: "Roble · vainilla · potencia" },
      { id: "derrape", name: "Derrape",    model: "Al límite",         base: "Mezcal",           grad: 28, rpm: 88, profile: "Ahumado picante · cítrico al borde" },
      { id: "fierreros", name: "Fierreros", model: "De taller",        base: "Ron añejo",        grad: 26, rpm: 76, profile: "Caramelo · especias · sobremesa" },
      { id: "tc2000",  name: "TC 2000",    model: "Categoría reina",   base: "Vodka cítrico",    grad: 20, rpm: 72, profile: "Fresco · pomelo · refrigerado" },
      { id: "piston",  name: "Pistón",     model: "Alta compresión",   base: "Espresso + vodka", grad: 24, rpm: 86, profile: "Café intenso · cacao · motor" },
      { id: "west",    name: "West",       model: "Rumbo al oeste",    base: "Gin patagónico",   grad: 21, rpm: 68, profile: "Calafate · enebro · frutos del bosque" },
    ],

    hours: [
      { d: "Martes a Jueves", h: "19:30 – 00:30" },
      { d: "Viernes y Sábado", h: "12:30 – 15:30 · 19:30 – 01:30" },
      { d: "Domingo", h: "12:30 – 16:00" },
      { d: "Lunes", h: "Cerrado" },
    ],
  };
})();
