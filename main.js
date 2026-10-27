/* OzzSom AI — site behaviour
   1. Footer year, sticky header state, mobile menu, current-section highlight
   2. Contact form (Formspree) with inline validation
   3. Hero wafer map: noise settles into a pattern once, then reacts to the pointer */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Page chrome ---------- */

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var header = document.getElementById("site-header");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");
  var toggleLabel = toggle ? toggle.querySelector(".nav-toggle-label") : null;
  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
    document.documentElement.classList.toggle("menu-open", open); // stops the page scrolling behind the menu
    if (toggleLabel) toggleLabel.textContent = open ? "Close" : "Menu";
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });
    // Close the phone menu if the window grows to the desktop layout
    var desktop = window.matchMedia("(min-width: 761px)");
    var onDesktop = function (e) { if (e.matches) setMenu(false); };
    if (desktop.addEventListener) desktop.addEventListener("change", onDesktop);
    else if (desktop.addListener) desktop.addListener(onDesktop);
  }

  // Highlight the nav link for the section in view
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-menu a[href^="#"]'));
  if ("IntersectionObserver" in window && navLinks.length) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = byId[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (a) { a.classList.remove("is-current"); });
          link.classList.add("is-current");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
  }

  // Buttons like "Invite me to speak" preselect the matching topic in the form
  document.querySelectorAll("[data-topic]").forEach(function (link) {
    link.addEventListener("click", function () {
      var radio = document.querySelector('input[name="topic"][value="' + link.getAttribute("data-topic") + '"]');
      if (radio) radio.checked = true;
    });
  });

  /* ---------- Phone layout helpers ----------
     The CSS only collapses or swipes these on phones; on larger screens everything is shown. */

  // Keep an element in the same place on screen while content above it opens or closes
  function keepInPlace(el, change) {
    var before = el.getBoundingClientRect().top;
    change();
    var after = el.getBoundingClientRect().top;
    if (Math.abs(after - before) > 1) window.scrollBy(0, after - before);
  }

  // "Read my full story" and "Show all appearances"
  document.querySelectorAll(".more-toggle").forEach(function (btn) {
    var target = document.getElementById(btn.getAttribute("aria-controls"));
    if (!target) return;
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") !== "true";
      var apply = function () {
        btn.setAttribute("aria-expanded", String(open));
        target.classList.toggle("is-open", open);
        btn.textContent = open ? btn.getAttribute("data-less") : btn.getAttribute("data-more");
      };
      // Opening: let the new text appear where the reader is looking.
      // Closing: keep the button under their finger instead of jumping the page.
      if (open) apply(); else keepInPlace(btn, apply);
    });
  });

  // Advisory services: one open at a time
  var offers = Array.prototype.slice.call(document.querySelectorAll(".offer"));
  offers.forEach(function (item) {
    var btn = item.querySelector(".offer-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var open = !item.classList.contains("is-open");
      keepInPlace(item, function () {
        offers.forEach(function (other) {
          other.classList.remove("is-open");
          var b = other.querySelector(".offer-toggle");
          if (b) b.setAttribute("aria-expanded", "false");
        });
        if (open) {
          item.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  });

  // Swipeable rows: position dots under the cards
  document.querySelectorAll(".snap-track").forEach(function (track) {
    var items = Array.prototype.slice.call(track.children);
    if (items.length < 2) return;
    var dots = document.createElement("div");
    dots.className = "snap-dots";
    dots.setAttribute("aria-hidden", "true");
    items.forEach(function () { dots.appendChild(document.createElement("span")); });
    track.parentNode.insertBefore(dots, track.nextSibling);

    var ticking = false;
    function update() {
      ticking = false;
      var step = items[0].getBoundingClientRect().width + 12;
      var index = Math.round(track.scrollLeft / step);
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 2) index = items.length - 1;
      index = Math.max(0, Math.min(items.length - 1, index));
      Array.prototype.forEach.call(dots.children, function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    track.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

  /* ---------- 2. Contact form ---------- */

  var form = document.getElementById("contact-form");
  if (form) {
    var statusEl = document.getElementById("form-status");
    var submitBtn = form.querySelector('button[type="submit"]');
    var fields = [
      { el: form.elements.name, empty: "Enter your name." },
      { el: form.elements.email, empty: "Enter your email address.", invalid: "Enter an email address like name@company.com." },
      { el: form.elements.message, empty: "Write a short message so I know how I can help." }
    ];

    function setStatus(text, kind) {
      statusEl.textContent = text;
      statusEl.className = "form-status" + (kind ? " is-" + kind : "");
    }

    function validateField(f) {
      var value = f.el.value.trim();
      var msg = "";
      if (!value) msg = f.empty;
      else if (f.invalid && !f.el.checkValidity()) msg = f.invalid;
      var errorEl = document.getElementById(f.el.id + "-error");
      f.el.closest(".field").classList.toggle("has-error", !!msg);
      f.el.setAttribute("aria-invalid", msg ? "true" : "false");
      if (errorEl) {
        errorEl.textContent = msg;
        if (msg) f.el.setAttribute("aria-describedby", errorEl.id);
        else f.el.removeAttribute("aria-describedby");
      }
      return !msg;
    }

    fields.forEach(function (f) {
      f.el.addEventListener("blur", function () {
        if (f.el.value.trim() || f.el.closest(".field").classList.contains("has-error")) validateField(f);
      });
      f.el.addEventListener("input", function () {
        if (f.el.closest(".field").classList.contains("has-error")) validateField(f);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      fields.forEach(function (f) {
        if (!validateField(f) && !firstBad) firstBad = f.el;
      });
      if (firstBad) {
        setStatus("Check the highlighted fields and try again.", "error");
        firstBad.focus();
        return;
      }

      if (form.action.indexOf("YOUR_FORM_ID") !== -1) {
        setStatus("This form isn't connected yet. Reach me on LinkedIn for now.", "error");
        if (window.console) console.warn("Contact form: replace YOUR_FORM_ID in index.html with your Formspree form ID.");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
      setStatus("", "");

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (!res.ok) throw new Error("status " + res.status);
          form.reset();
          setStatus("Message sent. I'll reply by email.", "success");
        })
        .catch(function () {
          setStatus("Your message didn't send. Check your connection and try again, or reach me on LinkedIn.", "error");
        })
        .then(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send message";
        });
    });
  }

  /* ---------- 3. Wafer map ---------- */

  var canvas = document.getElementById("wafer");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");

  var css = getComputedStyle(document.documentElement);
  function cssVar(name, fallback) {
    var v = css.getPropertyValue(name).trim();
    return v || fallback;
  }
  function hexToRgb(hex) {
    var h = hex.replace("#", "");
    if (h.length === 3) h = h.split("").map(function (c) { return c + c; }).join("");
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  var ACCENT = hexToRgb(cssVar("--accent", "#3B3FC4"));
  var BRASS = hexToRgb(cssVar("--brass", "#A87A1F"));
  var LINE = cssVar("--line-strong", "#C3CAD4");
  var SURFACE = cssVar("--surface", "#FFFFFF");

  // Seeded random so the "designed" pattern is the same on every visit
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var GRID = 25;            // dies across the wafer diameter
  var dies = [];
  var size = 0, dpr = 1, cx = 0, cy = 0, radius = 0, pitch = 0;
  var pointer = null;       // {x, y} in CSS pixels, or null
  var startTime = null;
  var settled = reduceMotion;

  // Timeline (ms)
  var T_APPEAR = 900;       // dies appear from the centre outward, noisy
  var T_SWEEP_START = 700;  // a sweep passes around the wafer, settling each die
  var T_SWEEP = 1900;
  var T_END = T_SWEEP_START + T_SWEEP + 500;

  function buildDies() {
    var rand = mulberry32(20180516);
    dies = [];
    var half = GRID / 2;
    for (var row = 0; row < GRID; row++) {
      for (var col = 0; col < GRID; col++) {
        // normalised die centre, -1..1
        var nx = (col + 0.5 - half) / half;
        var ny = (row + 0.5 - half) / half;
        // keep dies whose far corner sits inside the usable wafer area
        var corner = Math.hypot(Math.abs(nx) + 1 / half, Math.abs(ny) + 1 / half);
        if (corner > 0.95) continue;

        var rho = Math.hypot(nx, ny);
        var theta = Math.atan2(ny, nx); // -PI..PI, 0 = right, positive = down
        var deg = (theta * 180 / Math.PI + 360) % 360;

        // The pattern the "model" finds: an edge arc plus one tight cluster
        var flagged = false;
        if (rho > 0.74 && deg > 118 && deg < 214 && rand() < 0.86) flagged = true;
        if (Math.hypot(nx - 0.34, ny + 0.3) < 0.2 && rand() < 0.92) flagged = true;
        if (!flagged && rand() < 0.012) flagged = true; // a few isolated fails, like real data

        // Healthy dies: gentle radial yield gradient
        var calm = 0.13 + 0.12 * (1 - rho) + (rand() - 0.5) * 0.05;

        dies.push({
          col: col, row: row, nx: nx, ny: ny, rho: rho,
          sweepAngle: ((deg + 90) % 360) / 360, // sweep starts at 12 o'clock, clockwise
          flagged: flagged,
          calm: calm,
          noise: rand(),            // starting brightness
          noiseBrass: rand() < 0.08 // some noise reads as false alarms
        });
      }
    }
  }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    size = Math.max(160, Math.round(rect.width));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = size / 2;
    cy = size / 2;
    radius = size * 0.47;
    pitch = (radius * 2) / GRID;
    draw(settled ? T_END : now());
  }

  function now() {
    return startTime === null ? 0 : performance.now() - startTime;
  }

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function clamp01(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }
  function rgba(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a.toFixed(3) + ")"; }

  function drawWafer() {
    // wafer disc with a notch at 6 o'clock
    var notch = radius * 0.045;
    ctx.beginPath();
    var notchAngle = Math.asin(notch / radius);
    ctx.arc(cx, cy, radius, Math.PI / 2 + notchAngle, Math.PI / 2 - notchAngle + Math.PI * 2);
    ctx.arc(cx, cy + radius, notch, 0, Math.PI, true);
    ctx.closePath();
    ctx.fillStyle = SURFACE;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = LINE;
    ctx.stroke();
  }

  function draw(t) {
    ctx.clearRect(0, 0, size, size);
    drawWafer();

    var gap = Math.max(1, pitch * 0.16);
    var dieSize = pitch - gap;
    var sweepProgress = clamp01((t - T_SWEEP_START) / T_SWEEP);

    for (var i = 0; i < dies.length; i++) {
      var d = dies[i];
      var x = cx + d.nx * radius - pitch / 2 + gap / 2;
      var y = cy + d.ny * radius - pitch / 2 + gap / 2;

      // appear: centre outward
      var appear = settled ? 1 : easeOut(clamp01((t - d.rho * T_APPEAR * 0.75) / 260));
      if (appear <= 0) continue;

      // settle: once the sweep has passed this die's angle
      var settle = settled ? 1 : easeOut(clamp01((sweepProgress - d.sweepAngle) * 9));

      var color, alpha;
      if (d.flagged) {
        // noise → brass
        var noiseA = 0.08 + d.noise * 0.75;
        alpha = noiseA + (0.92 - noiseA) * settle;
        color = settle > 0.35 ? BRASS : (d.noiseBrass ? BRASS : ACCENT);
      } else {
        var startA = 0.08 + d.noise * 0.8;
        alpha = startA + (d.calm - startA) * settle;
        color = (d.noiseBrass && settle < 0.35) ? BRASS : ACCENT;
      }

      // pointer: dies near the cursor lift slightly
      var lift = 0;
      if (pointer) {
        var dx = (x + dieSize / 2) - pointer.x;
        var dy = (y + dieSize / 2) - pointer.y;
        var dist = Math.hypot(dx, dy) / pitch;
        if (dist < 3.2) lift = 1 - dist / 3.2;
      }
      if (lift > 0) alpha = Math.min(1, alpha + lift * (d.flagged ? 0.08 : 0.45));

      ctx.globalAlpha = appear;
      ctx.fillStyle = rgba(color, alpha);
      ctx.fillRect(x, y, dieSize, dieSize);

      if (lift > 0.55 && d.flagged) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = rgba(BRASS, 1);
        ctx.strokeRect(x - 1.5, y - 1.5, dieSize + 3, dieSize + 3);
      }
    }
    ctx.globalAlpha = 1;

    // the sweep line, only while it is moving
    if (!settled && sweepProgress > 0 && sweepProgress < 1) {
      var a = -Math.PI / 2 + sweepProgress * Math.PI * 2;
      var fade = Math.sin(sweepProgress * Math.PI);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
      ctx.strokeStyle = rgba(ACCENT, 0.55 * fade);
      ctx.lineWidth = 1.25;
      ctx.stroke();
    }
  }

  var rafId = null;
  function loop() {
    var t = now();
    if (t >= T_END) {
      settled = true;
      draw(T_END);
      rafId = null;
      return;
    }
    draw(t);
    rafId = requestAnimationFrame(loop);
  }

  function requestDraw() {
    if (rafId !== null) return; // the intro loop is already drawing
    requestAnimationFrame(function () { draw(settled ? T_END : now()); });
  }

  canvas.addEventListener("pointermove", function (e) {
    var rect = canvas.getBoundingClientRect();
    pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    requestDraw();
  });
  canvas.addEventListener("pointerleave", function () {
    pointer = null;
    requestDraw();
  });

  buildDies();
  if ("ResizeObserver" in window) {
    new ResizeObserver(function () { resize(); }).observe(canvas);
  } else {
    window.addEventListener("resize", resize);
  }
  resize();

  if (!settled) {
    // start the intro once the wafer is on screen (it usually is on load)
    var startIntro = function () {
      if (startTime !== null) return;
      startTime = performance.now();
      rafId = requestAnimationFrame(loop);
    };
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          startIntro();
          io.disconnect();
        }
      }, { threshold: 0.3 });
      io.observe(canvas);
    } else {
      startIntro();
    }
  }
})();
