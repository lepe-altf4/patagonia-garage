/* =============================================================
   Patagonia Garage — cinematic 3D scene (Three.js r128, UMD global)
   Fire embers + drifting smoke + flickering fire light + warm fog
   + a slowly rotating metallic ring (motorsport nod) veiled in haze.
   IIFE. Exposes window.__PG_SCENE__ = { init }.
   ============================================================= */
(function () {
  "use strict";

  function rand(a, b) { return a + Math.random() * (b - a); }

  // Soft radial sprite texture (white core -> transparent)
  function softTexture(inner) {
    var c = document.createElement("canvas");
    c.width = c.height = 64;
    var ctx = c.getContext("2d");
    var g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255," + inner + ")");
    g.addColorStop(0.4, "rgba(255,255,255," + inner * 0.5 + ")");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  function init() {
    if (typeof THREE === "undefined") return false;
    if (/[?&]no3d/.test(location.search)) return false; // dev/preview escape hatch
    var host = document.querySelector("[data-canvas]");
    if (!host) return false;

    var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    var isMobile = window.innerWidth < 820;

    // ---- Device tier ----------------------------------------------------
    // Mobile keeps its current (good) quality. Desktop is split into high-end
    // (full quality) and mid/low (half the particles + lower pixelRatio), and
    // on desktop the renderer adapts further at runtime if FPS drops < 30.
    var cores = navigator.hardwareConcurrency || 4;
    var mem = navigator.deviceMemory || 4; // GB; undefined on some browsers -> assume modest
    var desktopHigh = !isMobile && cores >= 12 && mem >= 8;
    var tier = isMobile ? "mobile" : (desktopHigh ? "high" : "mid");

    var dpr = window.devicePixelRatio || 1;
    // pixelRatio caps per quality step. Step 0 is the tier's best; the FPS
    // monitor can only increase the step (lower the cap), never the reverse.
    var prCaps = tier === "mobile" ? [1.5]
               : tier === "high"   ? [1.75, 1.5, 1.25]
               :                     [1.5, 1.25, 1.0];
    var qStep = 0;
    function pixelCap() { return Math.min(dpr, prCaps[Math.min(qStep, prCaps.length - 1)]); }

    var renderer = new THREE.WebGLRenderer({ antialias: tier === "high", alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(pixelCap());
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;
    if ("outputColorSpace" in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
    else renderer.outputEncoding = THREE.sRGBEncoding;
    host.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0603, 0.05);

    var camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 2.4, 12.5);

    // ---- Lighting (warm fire key + cool steel rim) ----
    scene.add(new THREE.AmbientLight(0x2a160a, 0.7));
    var fireLight = new THREE.PointLight(0xff6a26, 3.2, 42, 2);
    fireLight.position.set(0, 1.2, 4.5);
    scene.add(fireLight);
    var fireLight2 = new THREE.PointLight(0xff3c12, 1.6, 30, 2);
    fireLight2.position.set(-2.5, 0.4, 3);
    scene.add(fireLight2);
    var rim = new THREE.DirectionalLight(0x6f8bdd, 0.55);
    rim.position.set(-8, 7, -9);
    scene.add(rim);
    var rim2 = new THREE.DirectionalLight(0xffb070, 0.35);
    rim2.position.set(9, 5, 6);
    scene.add(rim2);

    // ---- Ground plane catching the ember glow ----
    var ground = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120),
      new THREE.MeshStandardMaterial({ color: 0x0c0805, roughness: 0.78, metalness: 0.35 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3.1;
    scene.add(ground);

    // ---- Metallic ring (wheel / brake rotor) deep in the haze ----
    var ringGroup = new THREE.Group();
    var ringMat = new THREE.MeshStandardMaterial({ color: 0x7a6a52, roughness: 0.32, metalness: 1 });
    var ringOuter = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.42, 18, 90), ringMat);
    var ringInner = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.22, 14, 70), ringMat);
    ringGroup.add(ringOuter, ringInner);
    // spokes
    for (var s = 0; s < 5; s++) {
      var spoke = new THREE.Mesh(new THREE.BoxGeometry(0.22, 7.4, 0.22), ringMat);
      spoke.rotation.z = (s / 5) * Math.PI * 2;
      ringGroup.add(spoke);
    }
    ringGroup.position.set(0.5, 3.2, -17);
    ringGroup.rotation.x = 0.32;
    scene.add(ringGroup);

    // ---- Embers (additive points) ----
    // EMB is the allocated buffer size; embActive is how many we actually draw
    // (the FPS monitor can shrink embActive via setDrawRange). Mid desktop gets
    // half of the high-end count; mobile is unchanged.
    var EMB = reduced ? 240 : (tier === "mobile" ? 360 : tier === "high" ? 680 : 340);
    var embActive = EMB;
    var eGeo = new THREE.BufferGeometry();
    var ePos = new Float32Array(EMB * 3);
    var eCol = new Float32Array(EMB * 3);
    var eVel = new Float32Array(EMB * 3);
    var ePhase = new Float32Array(EMB);
    var hot = new THREE.Color(0xff3a08), warm = new THREE.Color(0xffc24a);
    function spawnEmber(i, fresh) {
      var k = i * 3;
      ePos[k] = rand(-9, 9);
      ePos[k + 1] = fresh ? rand(-3, 13) : rand(-3, -1.5);
      ePos[k + 2] = rand(-7, 5);
      eVel[k] = rand(-0.012, 0.012);
      eVel[k + 1] = rand(0.02, 0.075);
      eVel[k + 2] = rand(-0.01, 0.01);
      var heat = Math.random();
      var c = hot.clone().lerp(warm, Math.pow(heat, 0.6));
      var b = rand(0.45, 1);
      eCol[k] = c.r * b; eCol[k + 1] = c.g * b; eCol[k + 2] = c.b * b;
      ePhase[i] = rand(0, Math.PI * 2);
    }
    for (var i = 0; i < EMB; i++) spawnEmber(i, true);
    eGeo.setAttribute("position", new THREE.BufferAttribute(ePos, 3));
    eGeo.setAttribute("color", new THREE.BufferAttribute(eCol, 3));
    eGeo.setDrawRange(0, embActive);
    var embers = new THREE.Points(eGeo, new THREE.PointsMaterial({
      size: isMobile ? 0.2 : 0.17, map: softTexture(1), vertexColors: true,
      transparent: true, opacity: 0.95, depthWrite: false,
      blending: THREE.AdditiveBlending, sizeAttenuation: true,
    }));
    scene.add(embers);

    // ---- Smoke (soft dark points) ----
    var SMK = reduced ? 36 : (tier === "mobile" ? 54 : tier === "high" ? 96 : 48);
    var smkActive = SMK;
    var sGeo = new THREE.BufferGeometry();
    var sPos = new Float32Array(SMK * 3);
    var sVel = new Float32Array(SMK * 3);
    function spawnSmoke(i, fresh) {
      var k = i * 3;
      sPos[k] = rand(-10, 10);
      sPos[k + 1] = fresh ? rand(-2, 16) : rand(-2, 0);
      sPos[k + 2] = rand(-9, 3);
      sVel[k] = rand(-0.01, 0.01);
      sVel[k + 1] = rand(0.012, 0.04);
      sVel[k + 2] = rand(-0.006, 0.006);
    }
    for (var j = 0; j < SMK; j++) spawnSmoke(j, true);
    sGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
    sGeo.setDrawRange(0, smkActive);
    var smoke = new THREE.Points(sGeo, new THREE.PointsMaterial({
      size: isMobile ? 7 : 9, map: softTexture(0.5),
      color: 0x2a1d14, transparent: true, opacity: 0.10,
      depthWrite: false, blending: THREE.NormalBlending, sizeAttenuation: true,
    }));
    scene.add(smoke);

    // ---- Interaction state ----
    var scrollTarget = 0, scrollCur = 0, mx = 0, my = 0, tmx = 0, tmy = 0;
    function onScroll() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      scrollTarget = max > 0 ? window.scrollY / max : 0;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      window.addEventListener("mousemove", function (e) {
        tmx = (e.clientX / window.innerWidth - 0.5);
        tmy = (e.clientY / window.innerHeight - 0.5);
      }, { passive: true });
    }

    var t = 0, running = true, last = 0;
    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
      if (running) { last = 0; requestAnimationFrame(loop); }
    });

    // ---- Adaptive quality (desktop only) -------------------------------
    // If the average FPS over a ~1.5s window drops below 30, step the
    // renderer down: lower the pixelRatio cap and thin out the particles.
    // Two steps max; we never step back up (avoids oscillation/flicker).
    var adapt = !reduced && !isMobile;
    var fpsFrames = 0, fpsClock = 0, downgrades = 0, MAX_DOWN = 2;
    function downgrade() {
      downgrades++; qStep++;
      renderer.setPixelRatio(pixelCap());
      renderer.setSize(window.innerWidth, window.innerHeight);
      var factor = downgrades === 1 ? 0.6 : 0.42;
      embActive = Math.max(120, Math.round(EMB * factor));
      smkActive = Math.max(18, Math.round(SMK * factor));
      embers.geometry.setDrawRange(0, embActive);
      smoke.geometry.setDrawRange(0, smkActive);
    }

    function loop(now) {
      if (!running) return;
      requestAnimationFrame(loop);
      now = now || 0;
      var dt = last ? now - last : 16; last = now;
      if (dt > 100) dt = 16; // tab was backgrounded / hitch — don't count it
      t += 0.016;

      if (adapt && downgrades < MAX_DOWN) {
        fpsFrames++; fpsClock += dt;
        if (fpsClock >= 1500) {
          if (fpsFrames * 1000 / fpsClock < 30) downgrade();
          fpsFrames = 0; fpsClock = 0;
        }
      }

      // Fire flicker
      var fl = 2.7 + Math.sin(t * 13) * 0.5 + Math.sin(t * 27) * 0.35 + (Math.random() - 0.5) * 0.5;
      fireLight.intensity = reduced ? 2.7 : fl;
      fireLight2.intensity = (reduced ? 1.6 : 1.4 + Math.sin(t * 9 + 1) * 0.5);

      // Embers
      var p = embers.geometry.attributes.position.array;
      for (var i = 0; i < embActive; i++) {
        var k = i * 3;
        p[k] += eVel[k] + Math.sin(t * 0.8 + ePhase[i]) * 0.004;
        p[k + 1] += eVel[k + 1];
        p[k + 2] += eVel[k + 2];
        if (p[k + 1] > 13) spawnEmber(i, false);
      }
      embers.geometry.attributes.position.needsUpdate = true;
      embers.material.opacity = reduced ? 0.9 : 0.78 + Math.sin(t * 11) * 0.12;

      // Smoke
      var q = smoke.geometry.attributes.position.array;
      for (var m = 0; m < smkActive; m++) {
        var n = m * 3;
        q[n] += sVel[n] + Math.sin(t * 0.5 + m) * 0.004;
        q[n + 1] += sVel[n + 1];
        q[n + 2] += sVel[n + 2];
        if (q[n + 1] > 17) spawnSmoke(m, false);
      }
      smoke.geometry.attributes.position.needsUpdate = true;

      // Metallic ring slow rotation
      ringGroup.rotation.z += reduced ? 0.0008 : 0.0022;

      // Camera: scroll dolly + gentle mouse parallax
      scrollCur += (scrollTarget - scrollCur) * 0.05;
      mx += (tmx - mx) * 0.05;
      my += (tmy - my) * 0.05;
      camera.position.x = mx * 1.6;
      camera.position.y = 2.4 + scrollCur * 4.5 - my * 1.1;
      camera.position.z = 12.5 + scrollCur * 6;
      camera.lookAt(0, 2.6 + scrollCur * 2.2, 0);
      ringGroup.position.y = 3.2 + scrollCur * 3;

      renderer.render(scene, camera);
    }
    requestAnimationFrame(loop);

    window.addEventListener("resize", function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(pixelCap());
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    document.documentElement.classList.add("webgl-on");

    // Manual pause/resume (used for tooling / future controls)
    window.__PG_SCENE__.pause = function () { running = false; };
    window.__PG_SCENE__.resume = function () { if (!running) { running = true; requestAnimationFrame(loop); } };
    return true;
  }

  window.__PG_SCENE__ = { init: init };
})();
