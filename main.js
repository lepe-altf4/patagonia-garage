/* =============================================================
   PATAGONIA GARAGE — main.js (IIFE, classic script, no modules)
   ============================================================= */
(function () {
  "use strict";

  var data = window.__BRAND__ || {};
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }

  /* --- Wire dynamic links from manifest (single source of truth) --- */
  function wireLinks() {
    if (data.whatsapp) $$("[data-whatsapp]").forEach(function (a) { a.href = data.whatsapp; });
    if (data.instagram) $$("[data-ig]").forEach(function (a) { a.href = data.instagram; });
    if (data.mapsLink) $$("[data-maps]").forEach(function (a) { a.href = data.mapsLink; });
    var mapFrame = $(".llegar-map iframe");
    if (mapFrame && data.mapsEmbed) mapFrame.src = data.mapsEmbed;
    var y = $("[data-year]"); if (y) y.textContent = new Date().getFullYear();
  }

  /* --- Splash (double safety: CSS animation + JS) --- */
  function initSplash() {
    var splash = $("[data-splash]"); if (!splash) return;
    var hide = function () { splash.classList.add("is-out"); };
    if (document.readyState === "complete") setTimeout(hide, 650);
    else window.addEventListener("load", function () { setTimeout(hide, 450); });
    setTimeout(hide, 3800);
  }

  /* --- Nav solidify on scroll --- */
  function initNav() {
    var nav = $("[data-nav]"); if (!nav) return;
    var on = function () { nav.classList.toggle("is-scrolled", window.scrollY > 70); };
    on(); window.addEventListener("scroll", on, { passive: true });
  }

  /* --- Mobile menu --- */
  function initBurger() {
    var burger = $("[data-burger]"), menu = $("[data-mobile-menu]");
    if (!burger || !menu) return;
    var setOpen = function (open) {
      burger.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-hidden", String(!open));
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", function () {
      setOpen(burger.getAttribute("aria-expanded") !== "true");
    });
    $$(".nav-mobile-link, .nav-mobile-cta", menu).forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
  }

  /* --- Custom cursor --- */
  function initCursor() {
    var root = $("[data-cursor-root]");
    if (!root || !fineHover) return;
    document.documentElement.classList.add("has-cursor");
    var ring = $(".cursor-ring", root), dot = $(".cursor-dot", root);
    var tx = 0, ty = 0, rx = 0, ry = 0, first = false;
    window.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (dot) dot.style.transform = "translate3d(" + tx + "px," + ty + "px,0)";
      if (!first) { first = true; rx = tx; ry = ty; root.classList.add("is-ready"); }
    }, { passive: true });
    (function tick() {
      rx += (tx - rx) * 0.2; ry += (ty - ry) * 0.2;
      if (ring) ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
      requestAnimationFrame(tick);
    })();
    var HOV = "a[href], button, .spec, .dish-frame, [data-tilt]";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest(HOV)) root.classList.add("is-interactive");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest(HOV) && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(HOV)))
        root.classList.remove("is-interactive");
    });
  }

  /* --- Scroll progress bar --- */
  function initScrollProgress() {
    var bar = $("[data-scroll-progress]"); if (!bar) return;
    var raf = null;
    var update = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
      raf = null;
    };
    window.addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    update();
  }

  /* --- Reveal on scroll (+ 6s safety net) --- */
  function initReveals() {
    var els = $$("[data-reveal]");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-revealed"); io.unobserve(e.target); }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -3% 0px" });
    els.forEach(function (el) { io.observe(el); });
    setTimeout(function () {
      $$("[data-reveal]:not(.is-revealed)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-revealed");
      });
    }, 6000);
  }

  /* --- Smooth anchor scroll (native) --- */
  function initAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]'); if (!a) return;
      var id = a.getAttribute("href"); if (!id || id === "#") return;
      var el = document.querySelector(id); if (!el) return;
      e.preventDefault();
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 72,
        behavior: reduced ? "auto" : "smooth",
      });
    });
  }

  /* --- Count up (cooking-time gauges) --- */
  function initCountUp() {
    $$("[data-count-to]").forEach(function (el) {
      var target = parseFloat(el.dataset.countTo);
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          io.unobserve(el);
          if (window.gsap) {
            var o = { v: 0 };
            gsap.to(o, { v: target, duration: 1.3, ease: "power2.out",
              onUpdate: function () { el.textContent = Math.round(o.v); } });
          } else { el.textContent = target; }
        });
      }, { threshold: 0.6 });
      io.observe(el);
    });
  }

  /* --- RPM bars (cocktail power) --- */
  function initRpm() {
    var bars = $$("[data-rpm]");
    bars.forEach(function (el) {
      var v = Math.max(0, Math.min(100, parseFloat(el.dataset.rpm) || 0));
      var set = function () { el.style.setProperty("--rpm", v + "%"); };
      // Observe a sized ancestor — the <i> itself starts at width:0 (zero area).
      var watch = el.closest(".spec") || el.closest(".rpm-bar") || el;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          io.unobserve(watch);
          requestAnimationFrame(set);
        });
      }, { threshold: 0.15 });
      io.observe(watch);
      // Fill immediately if already in view at init.
      var r = watch.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) requestAnimationFrame(set);
    });
    // Safety net: fill anything still empty after 6s.
    setTimeout(function () {
      bars.forEach(function (el) {
        if (!el.style.getPropertyValue("--rpm")) {
          var v = Math.max(0, Math.min(100, parseFloat(el.dataset.rpm) || 0));
          el.style.setProperty("--rpm", v + "%");
        }
      });
    }, 6000);
  }

  /* --- Carta digital (reads assets/data/menu.json, renders tabs) --- */
  function initMenu() {
    var root = $("[data-menu-root]");
    if (!root) return;
    var tabsEl = $("[data-menu-tabs]", root);
    var panelsEl = $("[data-menu-panels]", root);
    var noteEl = $("[data-menu-note]", root);
    if (!tabsEl || !panelsEl) return;

    fetch("assets/data/menu.json", { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (menu) { renderMenu(menu, tabsEl, panelsEl, noteEl); })
      .catch(function (err) {
        console.warn("[menu]", err);
        panelsEl.innerHTML =
          '<p class="carta-fallback">No pudimos cargar la carta en este momento. ' +
          'Probá <a href="">recargar la página</a>.</p>';
      });
  }

  function renderMenu(menu, tabsEl, panelsEl, noteEl) {
    var cats = (menu && menu.categories) || [];
    if (!cats.length) return;

    var tabsHTML = "", panelsHTML = "";
    cats.forEach(function (cat, i) {
      var tabId = "carta-tab-" + cat.id, panelId = "carta-panel-" + cat.id;
      var active = i === 0;
      tabsHTML +=
        '<button class="carta-tab" id="' + tabId + '" role="tab" type="button"' +
        ' aria-controls="' + panelId + '" aria-selected="' + active + '"' +
        ' tabindex="' + (active ? "0" : "-1") + '">' + escHTML(cat.name) + "</button>";

      var rows = (cat.items || []).map(function (it) {
        var desc = it.desc ? '<span class="carta-item-desc">' + escHTML(it.desc) + "</span>" : "";
        return (
          '<li class="carta-item">' +
            '<span class="carta-item-main">' +
              '<span class="carta-item-name">' + escHTML(it.name) + "</span>" + desc +
            "</span>" +
            '<span class="carta-item-price">' + escHTML(it.price) + "</span>" +
          "</li>"
        );
      }).join("");

      var head = cat.note ? '<p class="carta-panel-head">' + escHTML(cat.note) + "</p>" : "";
      panelsHTML +=
        '<div class="carta-panel' + (active ? " is-active" : "") + '" id="' + panelId + '"' +
        ' role="tabpanel" aria-labelledby="' + tabId + '"' + (active ? "" : " hidden") + ">" +
        head + '<ul class="carta-list">' + rows + "</ul></div>";
    });

    tabsEl.innerHTML = tabsHTML;
    panelsEl.innerHTML = panelsHTML;
    if (noteEl && menu.note) noteEl.textContent = menu.note;

    var tabs = $$(".carta-tab", tabsEl);
    var panels = $$(".carta-panel", panelsEl);

    function activate(idx, focus) {
      tabs.forEach(function (t, i) {
        var on = i === idx;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
        if (on) t.scrollIntoView({ block: "nearest", inline: "center", behavior: reduced ? "auto" : "smooth" });
      });
      panels.forEach(function (p, i) {
        var on = i === idx;
        p.classList.toggle("is-active", on);
        if (on) p.removeAttribute("hidden"); else p.setAttribute("hidden", "");
      });
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { activate(i, false); });
      tab.addEventListener("keydown", function (e) {
        var n = tabs.length, idx = -1;
        if (e.key === "ArrowRight") idx = (i + 1) % n;
        else if (e.key === "ArrowLeft") idx = (i - 1 + n) % n;
        else if (e.key === "Home") idx = 0;
        else if (e.key === "End") idx = n - 1;
        if (idx >= 0) { e.preventDefault(); activate(idx, true); }
      });
    });
  }

  /* --- Split text (chars / words), preserves <br> and child classes --- */
  function escHTML(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); }
  function wrapChars(t) { return Array.prototype.map.call(t, function (ch) {
    return ch === " " ? " " : '<span class="split-char" aria-hidden="true">' + escHTML(ch) + "</span>"; }).join(""); }
  function wrapWords(t) { return t.split(/(\s+)/).map(function (w) {
    return /^\s+$/.test(w) ? w : '<span class="split-word" aria-hidden="true">' + escHTML(w) + "</span>"; }).join(""); }
  function buildSplit(el, fn) {
    el.setAttribute("aria-label", el.textContent.trim().replace(/\s+/g, " "));
    var html = Array.prototype.map.call(el.childNodes, function (node) {
      if (node.nodeType === 3) return fn(node.textContent);
      if (node.nodeName === "BR") return "<br>";
      if (node.nodeType === 1) {
        var tag = node.tagName.toLowerCase();
        var cls = node.getAttribute("class");
        return "<" + tag + (cls ? ' class="' + cls + '"' : "") + ">" + fn(node.textContent) + "</" + tag + ">";
      }
      return "";
    }).join("");
    el.innerHTML = html;
    return el.querySelectorAll(".split-char, .split-word");
  }
  function initSplitText() {
    if (!window.gsap || !window.ScrollTrigger) return;
    $$("[data-split]").forEach(function (el) {
      var mode = el.dataset.split;
      var parts = buildSplit(el, mode === "chars" ? wrapChars : wrapWords);
      gsap.set(parts, { yPercent: 110, opacity: 0 });
      gsap.to(parts, {
        yPercent: 0, opacity: 1,
        duration: mode === "chars" ? 0.85 : 0.9,
        stagger: mode === "chars" ? 0.022 : 0.05,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    });
  }

  /* --- Parallax (dish images + menu bg) --- */
  function initParallax() {
    if (!window.gsap || !window.ScrollTrigger) return;
    $$("[data-parallax]").forEach(function (img) {
      gsap.fromTo(img, { yPercent: -8 }, {
        yPercent: 8, ease: "none",
        scrollTrigger: { trigger: img.closest(".dish-media") || img, start: "top bottom", end: "bottom top", scrub: true },
      });
    });
    var bg = $("[data-parallax-bg]");
    if (bg) gsap.fromTo(bg, { yPercent: -8 }, {
      yPercent: 8, ease: "none",
      scrollTrigger: { trigger: bg.closest(".menu-cta") || bg, start: "top bottom", end: "bottom top", scrub: true },
    });
    var rbg = $("[data-parallax-res]");
    if (rbg) gsap.fromTo(rbg, { yPercent: -10 }, {
      yPercent: 10, ease: "none",
      scrollTrigger: { trigger: rbg.closest(".reservas") || rbg, start: "top bottom", end: "bottom top", scrub: true },
    });
  }

  /* --- Tilt 3D + cursor halo on spec cards --- */
  function initTilt() {
    if (matchMedia("(hover: none)").matches) return;
    $$("[data-tilt]").forEach(function (card) {
      var MAX = 6, tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      card.style.transition = "transform .5s var(--ease-soft)";
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        tx = -py * MAX; ty = px * MAX;
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
        if (!raf) raf = requestAnimationFrame(loop);
      });
      card.addEventListener("mouseleave", function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
      function loop() {
        cx += (tx - cx) * 0.15; cy += (ty - cy) * 0.15;
        card.style.transform = "perspective(900px) rotateX(" + cx.toFixed(2) + "deg) rotateY(" + cy.toFixed(2) + "deg)";
        raf = (Math.abs(tx - cx) > 0.04 || Math.abs(ty - cy) > 0.04) ? requestAnimationFrame(loop) : null;
      }
    });
  }

  /* --- Boot --- */
  function boot() {
    safe(wireLinks, "wireLinks");
    safe(initSplash, "initSplash");
    safe(initNav, "initNav");
    safe(initBurger, "initBurger");
    safe(initCursor, "initCursor");
    safe(initScrollProgress, "initScrollProgress");
    safe(initReveals, "initReveals");
    safe(initAnchors, "initAnchors");
    safe(initCountUp, "initCountUp");
    safe(initRpm, "initRpm");
    safe(initMenu, "initMenu");

    // 3D scene (independent of GSAP)
    if (window.__PG_SCENE__) safe(window.__PG_SCENE__.init, "scene");

    if (window.gsap && window.ScrollTrigger) {
      try { gsap.registerPlugin(ScrollTrigger); } catch (e) {}
      safe(initSplitText, "initSplitText");
      safe(initParallax, "initParallax");
    }
    safe(initTilt, "initTilt");

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
