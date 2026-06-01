/* Renders assets/credits.json into the credits page. Classic script. */
(function () {
  "use strict";
  var list = document.querySelector("[data-credits]");
  if (!list || !window.fetch) return;
  fetch("assets/credits.json")
    .then(function (r) { return r.json(); })
    .then(function (credits) {
      var html = Object.keys(credits).map(function (id) {
        var c = credits[id];
        var creator = c.creator_url
          ? '<a href="' + c.creator_url + '" target="_blank" rel="noopener">' + c.creator + "</a>"
          : c.creator;
        var lic = (c.license || "").toUpperCase() + (c.license_version ? " " + c.license_version : "");
        return '<li><strong>' + c.title + "</strong> — " + creator +
          (c.source ? " (" + c.source + ")" : "") + " · " +
          (c.license_url ? '<a href="' + c.license_url + '" target="_blank" rel="noopener">' + lic + "</a>" : lic) +
          (c.foreign_landing_url ? ' · <a href="' + c.foreign_landing_url + '" target="_blank" rel="noopener">Ver original ↗</a>' : "") +
          "</li>";
      }).join("");
      list.innerHTML = html;
    })
    .catch(function () {
      list.innerHTML = "<li>No se pudieron cargar los créditos. Imágenes vía Openverse (Creative Commons).</li>";
    });
})();
