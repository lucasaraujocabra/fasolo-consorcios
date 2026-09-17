/* ============================================================================
   FASOLO CONSÓRCIOS
   Everything the page does. No framework, no build: this is a design source
   meant to be read and then rebuilt in Framer, so it stays flat and literal.
   ========================================================================== */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  var money = function (n) { return brl.format(Math.round(n)); };

  /* ScrollTrigger.refresh() is expensive and, with a pinned section on the page,
     not free of side effects. Only call it when the document actually changed
     height, and only once the layout has settled. */
  var lastDocH = 0, refreshTimer;
  function refreshIfResized() {
    if (typeof ScrollTrigger === "undefined") return;
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(function () {
      var h = document.documentElement.scrollHeight;
      if (Math.abs(h - lastDocH) < 2) return;
      lastDocH = h;
      ScrollTrigger.refresh();
    }, 520);
  }

  /* Smooth anchor scrolling lives here rather than in CSS: see the note at the
     top of styles.css for why `scroll-behavior: smooth` cannot be used. */
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute("href");
    if (!id || id.length < 2) return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    var top = target.getBoundingClientRect().top + window.scrollY - 78;
    window.scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" });
    history.replaceState(null, "", id);
  });

  /* =========================================================================
     1. OBJECTIVE
     One answer, chosen in the hero, carried through the simulator, the
     solution tabs and the form. The visitor never types it twice.
     ====================================================================== */
  var objective = null;

  function setObjective(value, opts) {
    opts = opts || {};
    objective = value;

    $$(".obj").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.obj === value));
    });
    $$("#simSeg button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.obj === value));
    });
    if (!opts.keepTabs) selectSolution(value);

    var sel = $("#obj");
    if (sel) sel.value = value;

    // an objective changes the realistic term, so the simulator follows it
    if (!opts.keepRange) {
      var prazo = $("#sPrazo");
      if (prazo) {
        if (value === "Veículo") prazo.value = 80;
        else if (value === "Investimento") prazo.value = 160;
        else prazo.value = 200;
      }
      compute();
    }
  }

  $$(".obj").forEach(function (b) {
    b.addEventListener("click", function () {
      setObjective(b.dataset.obj);
      var t = document.getElementById("solucoes");
      if (t) t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  });

  $$("#simSeg button").forEach(function (b) {
    b.addEventListener("click", function () { setObjective(b.dataset.obj); });
  });

  /* =========================================================================
     2. THE PROBLEM. List on the left drives the diagram on the right.
     ====================================================================== */
  var pBtns = $$(".pitem__b");
  pBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      if (open) return;                       // one is always open: the panel needs a subject
      pBtns.forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
      btn.setAttribute("aria-expanded", "true");

      $$(".pv").forEach(function (v) { v.removeAttribute("data-on"); });
      var panel = $('.pv[data-pv="' + btn.dataset.pv + '"]');
      if (panel) {
        panel.setAttribute("data-on", "1");
        if (hasGSAP && !reduce) {
          gsap.fromTo(panel, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .4, ease: "power2.out" });
        }
      }
      if (hasGSAP && !reduce) refreshIfResized();
    });
  });

  /* =========================================================================
     3. THE METHOD. Four blocks down the page; one open at a time.
     ====================================================================== */
  var msBtns = $$(".vs__b");
  msBtns.forEach(function (btn, i) {
    btn.addEventListener("click", function () {
      var wasOpen = btn.getAttribute("aria-expanded") === "true";
      msBtns.forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
      btn.setAttribute("aria-expanded", wasOpen ? "false" : "true");
      if (!wasOpen && hasGSAP && !reduce) {
        var inner = btn.nextElementSibling.querySelector(".vs__in");
        gsap.fromTo(inner.children, { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: .4, stagger: .06, ease: "power2.out", delay: .12 });
      }
      if (hasGSAP && !reduce) refreshIfResized();
    });
    btn.addEventListener("keydown", function (ev) {
      var d = ev.key === "ArrowDown" ? 1 : ev.key === "ArrowUp" ? -1 : 0;
      if (!d) return;
      ev.preventDefault();
      msBtns[(i + d + msBtns.length) % msBtns.length].focus();
    });
  });

  /* =========================================================================
     4. THE SIMULATOR
     ---------------------------------------------------------------------
     Consórcio:     parcela = credito * (1 + taxa + fundo) / prazo
     Financiamento: Price, parcela = C * i / (1 - (1+i)^-n)
     Every rate is a visible, editable input. The brief bans rates that cannot
     be checked or updated, so none of them are hidden in the code.
     ====================================================================== */
  var sCred = $("#sCred"), sPrazo = $("#sPrazo"),
      sTx = $("#sTx"), sFr = $("#sFr"), sJur = $("#sJur");

  function paintRange(el) {
    if (!el) return;
    var p = (el.value - el.min) / (el.max - el.min) * 100;
    el.style.setProperty("--p", p + "%");
  }

  function compute() {
    if (!sCred) return;
    var C = +sCred.value, n = +sPrazo.value;
    var tx = (+sTx.value || 0) / 100, fr = (+sFr.value || 0) / 100;
    var i = (+sJur.value || 0) / 100;

    var totalC = C * (1 + tx + fr);
    var parcelaC = totalC / n;

    var parcelaF = i > 0 ? C * i / (1 - Math.pow(1 + i, -n)) : C / n;
    var totalF = parcelaF * n;

    var maxT = Math.max(totalC, totalF) || 1;

    $("#vCred").textContent = money(C);
    $("#vPrazo").textContent = n + " meses";
    $("#oParcela").innerHTML = money(parcelaC) + "<small> / mês</small>";
    $("#oResumo").textContent = money(C) + " em " + n + " meses, sem juros e sem entrada.";
    $("#oTotC").textContent = money(totalC);
    $("#oTotF").textContent = money(totalF);
    $("#barC").style.width = (totalC / maxT * 100).toFixed(1) + "%";
    $("#barF").style.width = (totalF / maxT * 100).toFixed(1) + "%";
    $("#oNotaF").textContent = "Tabela Price a " + (+sJur.value).toFixed(2).replace(".", ",") +
                               "% ao mês, no mesmo prazo.";
    $("#oSave").textContent = money(Math.max(0, totalF - totalC));

    paintRange(sCred); paintRange(sPrazo);

    // carry the result into the form recap and prefill the two money fields
    var recap = $("#recap");
    if (recap) {
      recap.hidden = false;
      $("#rCred").textContent = money(C);
      $("#rPrazo").textContent = n + " meses";
      $("#rParc").textContent = money(parcelaC);
    }
    var dl = $("#dockLive"), dp = $("#dockParcela");
    if (dl && dp && sCred.dataset.touched) { dl.hidden = false; dp.textContent = money(parcelaC); }

    var fc = $("#credito"), fp = $("#parcela");
    if (fc && !fc.dataset.touched) fc.value = money(C);
    if (fp && !fp.dataset.touched) fp.value = money(parcelaC);
  }

  [sCred, sPrazo, sTx, sFr, sJur].forEach(function (el) {
    if (!el) return;
    el.addEventListener("input", function () { sCred.dataset.touched = "1"; compute(); });
  });
  ["credito", "parcela"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("input", function () { el.dataset.touched = "1"; });
  });
  compute();

  /* =========================================================================
     5. SOLUTIONS. Tabs, tied to the objective.
     ====================================================================== */
  var solTabs = $$(".sol__tab");
  function selectSolution(value) {
    var found = solTabs.some(function (t) { return t.dataset.sol === value; });
    if (!found) return;
    solTabs.forEach(function (t) { t.setAttribute("aria-selected", String(t.dataset.sol === value)); });
    $$(".solp").forEach(function (p) {
      var on = p.dataset.sol === value;
      p.hidden = !on;
      if (on) { p.setAttribute("data-on", "1"); } else { p.removeAttribute("data-on"); }
    });
    var shown = $('.solp[data-sol="' + value + '"]');
    if (shown && hasGSAP && !reduce) {
      gsap.fromTo(shown.children, { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: .45, stagger: .07, ease: "power2.out" });
    }
  }
  solTabs.forEach(function (t) {
    t.addEventListener("click", function () { setObjective(t.dataset.sol, { keepTabs: true }); selectSolution(t.dataset.sol); });
  });

  /* =========================================================================
     6. TESTIMONIALS
     ---------------------------------------------------------------------
     Cities and asset types are real, from the approved copy. Name, quote and
     video are empty on purpose: the brief rules out any testimonial without
     identification and proof. Fill these three fields per entry and the
     module is live, no other change needed.
     ====================================================================== */
  var DEPOIMENTOS = [
    { nome: "", cidade: "Bento Gonçalves, RS", bem: "Imóvel residencial",   citacao: "", video: "" },
    { nome: "", cidade: "Porto Alegre, RS",    bem: "Imóvel comercial",     citacao: "", video: "" },
    { nome: "", cidade: "Santa Maria, RS",     bem: "Veículo pesado",       citacao: "", video: "" },
    { nome: "", cidade: "Capão da Canoa, RS",  bem: "Terreno e construção", citacao: "", video: "" }
  ];

  var reel = $("#reel"), player = $("#player"), pTag = $("#pTag"),
      elQ = $("#quote"), elN = $("#whoN"), elC = $("#whoC"), elB = $("#whoB"),
      dProg = $("#dProg"), dCount = $("#dCount");
  var active = 0;
  var pad = function (n) { return String(n).padStart(2, "0"); };

  function paintDepo(i, animate) {
    active = (i + DEPOIMENTOS.length) % DEPOIMENTOS.length;
    var d = DEPOIMENTOS[active];

    Array.prototype.forEach.call(reel.children, function (c, k) {
      c.setAttribute("aria-selected", String(k === active));
    });
    dProg.style.transform = "scaleX(" + ((active + 1) / DEPOIMENTOS.length) + ")";
    dCount.textContent = pad(active + 1) + " / " + pad(DEPOIMENTOS.length);

    var apply = function () {
      elQ.textContent = d.citacao || "O cliente conta o objetivo, a estratégia que usamos e o bem que recebeu.";
      elQ.classList.toggle("is-pending", !d.citacao);
      elN.textContent = d.nome || "Cliente contemplado";
      elC.textContent = d.cidade;
      elB.textContent = d.bem;
      pTag.innerHTML = "<b>Vídeo do depoimento</b>" +
        (d.video ? d.cidade : "Entra um dos vídeos de prova social do canal da Fasolo.");
    };

    if (animate && hasGSAP && !reduce) {
      gsap.fromTo(player, { clipPath: "inset(0% 0% 100% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: .58, ease: "power3.out" });
      gsap.fromTo([elQ, elN.parentNode],
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: .4, stagger: .06, ease: "power2.out", onStart: apply });
    } else {
      apply();
    }
  }

  DEPOIMENTOS.forEach(function (d, i) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "tcard"; b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", String(i === 0));
    b.innerHTML = "<b>" + d.cidade + "</b><span>" + d.bem + "</span>";
    b.addEventListener("click", function () { paintDepo(i, true); });
    reel.appendChild(b);
  });
  $("#dPrev").addEventListener("click", function () { paintDepo(active - 1, true); });
  $("#dNext").addEventListener("click", function () { paintDepo(active + 1, true); });
  paintDepo(0, false);

  /* =========================================================================
     7. FORM
     ====================================================================== */
  var form = $("#simForm"), okBox = $("#formOk");

  function setErr(name, msg) {
    var input = form.elements[name];
    input.closest(".f").classList.toggle("is-bad", !!msg);
    var out = form.querySelector('[data-err="' + name + '"]');
    if (out) out.textContent = msg || "";
    return !msg;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    ok = setErr("nome", form.elements.nome.value.trim().length < 2
      ? "Digite seu nome para o consultor saber com quem falar." : "") && ok;
    var digits = form.elements.fone.value.replace(/\D/g, "");
    ok = setErr("fone", digits.length < 10
      ? "Informe um WhatsApp com DDD. É por onde a simulação chega." : "") && ok;
    ok = setErr("obj", form.elements.obj.value
      ? "" : "Escolha o objetivo para montarmos a simulação certa.") && ok;
    if (!ok) { form.querySelector(".is-bad input, .is-bad select").focus(); return; }

    form.hidden = true;
    okBox.hidden = false;
    okBox.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  });

  ["nome", "fone", "obj"].forEach(function (n) {
    form.elements[n].addEventListener("input", function () { setErr(n, ""); });
  });
  $("#obj").addEventListener("change", function (e) {
    if (e.target.value) setObjective(e.target.value, { keepRange: true });
  });

  /* =========================================================================
     8. NAV: reading progress + which section you are in
     ====================================================================== */
  var prog = $("#prog");
  var navLinks = $$(".nav__links a");
  var targets = navLinks.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.width = (h > 0 ? Math.min(1, window.scrollY / h) * 100 : 0) + "%";

      var mid = window.innerHeight * 0.35;
      var cur = -1;
      targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top <= mid) cur = i; });
      navLinks.forEach(function (a, i) {
        if (i === cur) { a.setAttribute("aria-current", "true"); }
        else { a.removeAttribute("aria-current"); }
      });
      var here = cur >= 0 ? navLinks[cur].getAttribute("href") : null;
      $$(".dock__i").forEach(function (a) {
        if (a.getAttribute("href") === here) { a.setAttribute("aria-current", "true"); }
        else { a.removeAttribute("aria-current"); }
      });

      // the dock appears once the hero is behind you and hides over the form
      var dock = $("#dock"), formTop = $("#simulacao").getBoundingClientRect().top;
      var show = window.scrollY > window.innerHeight * 0.9 && formTop > 400;
      dock.classList.toggle("on", show);

      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();


  /* =========================================================================
     10. THEME
     The dock's round button. Only tokens move; see the LIGHT THEME block in
     styles.css. The choice is a per-viewer convenience, so localStorage is
     wrapped and the page renders correctly when it comes back empty.
     ====================================================================== */
  var themeBtn = $("#themeBtn");
  function applyTheme(t) {
    if (t === "light") { document.documentElement.setAttribute("data-theme", "light"); }
    else { document.documentElement.removeAttribute("data-theme"); }
    if (themeBtn) themeBtn.setAttribute("aria-pressed", String(t === "light"));
    try { localStorage.setItem("fasolo-theme", t); } catch (e) {}
  }
  try {
    var saved = localStorage.getItem("fasolo-theme");
    if (saved === "light") applyTheme("light");
  } catch (e) {}
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      applyTheme(document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light");
      if (hasGSAP && !reduce) ScrollTrigger.refresh();
    });
  }

  /* =========================================================================
     11. DOCK
     Magnification: the pointer's distance to each item drives its scale, so
     the one under the cursor grows most and its neighbours taper off. This is
     pointer feedback, not decoration, which is why it runs on hover only.
     ====================================================================== */
  var dockItems = $$(".dock__i");
  var dockWrap = $("#dockItems");
  if (dockWrap && !reduce) {
    dockWrap.addEventListener("pointermove", function (e) {
      dockItems.forEach(function (it) {
        var r = it.getBoundingClientRect();
        var d = Math.abs(e.clientX - (r.left + r.width / 2));
        var k = Math.max(0, 1 - d / 190);            // falls off over ~190px
        it.style.transform = "scale(" + (1 + k * 0.17) + ") translateY(" + (-k * 4) + "px)";
      });
    });
    dockWrap.addEventListener("pointerleave", function () {
      dockItems.forEach(function (it) { it.style.transform = ""; });
    });
  }

  /* =========================================================================
     12. CAROUSEL  (008)
     One seamless track. It always drifts; scroll velocity and a hand throw add
     to the same velocity, and that velocity also skews the cards. No library:
     the whole thing is one position, one velocity and a wrap.
     ====================================================================== */
  (function () {
    var track = $("#cTrack");
    if (!track) return;
    var bar = $("#cBar");
    var slides = $$(".cslide", track);
    if (!slides.length) return;

    // duplicate the set so the wrap has something to show on both sides
    slides.forEach(function (s) { track.appendChild(s.cloneNode(true)); });

    var setW = 0, x = 0, vel = 0, drift = -0.55, dragging = false, lastX = 0, raf;

    function measure() {
      setW = 0;
      var gap = parseFloat(getComputedStyle(track).gap) || 0;
      slides.forEach(function (s) { setW += s.getBoundingClientRect().width + gap; });
    }
    measure();
    window.addEventListener("resize", measure, { passive: true });

    function wrap(v) {
      if (!setW) return v;
      while (v <= -setW) v += setW;
      while (v > 0) v -= setW;
      return v;
    }

    function frame() {
      if (track.dataset.frozen) { raf = requestAnimationFrame(frame); return; }
      if (!dragging) vel *= 0.93;
      if (Math.abs(vel) < 0.01) vel = 0;
      x = wrap(x + drift + vel);
      var skew = Math.max(-7, Math.min(7, (drift + vel) * 0.8));
      track.style.transform = "translate3d(" + x.toFixed(2) + "px,0,0) skewX(" + skew.toFixed(2) + "deg)";
      if (bar && setW) bar.style.transform = "translateX(" + (-x / setW * 460).toFixed(1) + "%)";
      raf = requestAnimationFrame(frame);
    }

    // only run while the section is on screen
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { if (!raf) raf = requestAnimationFrame(frame); }
        else if (raf) { cancelAnimationFrame(raf); raf = null; }
      });
    }, { rootMargin: "200px" });
    io.observe(track.parentNode);

    // hand throw
    track.addEventListener("pointerdown", function (e) {
      dragging = true; lastX = e.clientX; vel = 0;
      track.classList.add("is-grab");
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX; lastX = e.clientX;
      x = wrap(x + dx);
      vel = dx * 0.55;
    });
    ["pointerup", "pointercancel"].forEach(function (ev) {
      track.addEventListener(ev, function () { dragging = false; track.classList.remove("is-grab"); });
    });
    track.addEventListener("click", function (e) {
      if (Math.abs(vel) > 2) e.preventDefault();
    }, true);

    // the page's own scroll speed feeds the same velocity
    if (hasGSAP && !reduce) {
      ScrollTrigger.create({
        trigger: track.parentNode, start: "top bottom", end: "bottom top",
        onUpdate: function (self) {
          var v = self.getVelocity() / 260;
          vel += Math.max(-26, Math.min(26, v));
        }
      });
    }
    if (reduce) { drift = 0; track.style.transform = "translate3d(0,0,0)"; }
  })();

  /* =========================================================================
     9. MOTION
     Three orchestrated moments, each with a job:
       a) the page-load sequence, once
       b) the six doors opening as you scroll  <- the one cinematic moment
       c) a quiet reveal everywhere else
     ====================================================================== */
  if (!hasGSAP || reduce) return;
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add("js-anim");

  gsap.timeline({ defaults: { ease: "power3.out" } })
    .to(".hero [data-rev]", { opacity: 1, y: 0, duration: .8, stagger: .08 })
    .from("#heroPhoto", { scale: 1.06, opacity: 0, duration: 1.2, ease: "power2.out" }, .05)
    .from(".obj", { opacity: 0, y: 20, duration: .55, stagger: .07 }, "-=.55")
    .to(".strip [data-rev]", { opacity: 1, y: 0, duration: .5, stagger: .06 }, "-=.35");

  gsap.utils.toArray("[data-rev]").forEach(function (el) {
    if (el.closest(".hero") || el.closest(".strip")) return;
    gsap.to(el, {
      opacity: 1, y: 0, duration: .6, ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true }
    });
  });

  var rows = gsap.utils.toArray("#grows .grow");
  var bars = rows.map(function (r) { return r.querySelector(".grow__bar"); });
  var glyphs = rows.map(function (r) { return r.querySelector(".grow__i"); });
  var metas = rows.map(function (r) { return r.querySelector(".grow__m"); });
  var counter = $("#doorCount");

  var mm = gsap.matchMedia();

  mm.add("(min-width: 900px)", function () {
    gsap.set(bars, { scaleX: 0 });
    gsap.set(glyphs, { color: "#3A322E" });
    gsap.set(metas, { opacity: .4 });
    counter.innerHTML = '0<em>/6</em>';

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#grade", start: "top top", end: "+=120%",
        pin: true, scrub: .6, invalidateOnRefresh: true,
        onUpdate: function (self) {
          var open = Math.min(6, Math.floor(self.progress * 7.2));
          counter.innerHTML = open + '<em>/6</em>';
        }
      }
    });
    rows.forEach(function (r, i) {
      var at = i * 0.9;
      tl.to(bars[i], { scaleX: 1, duration: 1, ease: "power2.out" }, at)
        .to(glyphs[i], { color: "#E2050F", duration: .5 }, at)
        .to(metas[i], { opacity: 1, duration: .5 }, at);
    });
    tl.to({}, { duration: 1.2 });
  });

  // below 900px there is no room to pin: the doors simply light on entry
  mm.add("(max-width: 899px)", function () {
    gsap.set(bars, { scaleX: 0 });
    gsap.to(bars, {
      scaleX: 1, duration: .55, stagger: .12, ease: "power2.out",
      scrollTrigger: { trigger: "#grows", start: "top 82%", once: true }
    });
  });

  // decorative layer only, never the type
  gsap.to("#heroPhoto", {
    yPercent: 7, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });

  window.addEventListener("load", function () {
    ScrollTrigger.refresh();
    lastDocH = document.documentElement.scrollHeight;
  });
  lastDocH = document.documentElement.scrollHeight;
})();
