/* =============================================================
   PATAGONIA GARAGE — main.js (IIFE, classic script, no modules)
   ============================================================= */
(function () {
  "use strict";

  var data = window.__BRAND__ || {};
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    safe(initScrollProgress, "initScrollProgress");
    safe(initReveals, "initReveals");
    safe(initAnchors, "initAnchors");
    safe(initCountUp, "initCountUp");
    safe(initRpm, "initRpm");

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
