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
      if (hasGSAP && !reduce) setTimeout(function () { ScrollTrigger.refresh(); }, 440);
    });
  });

  /* =========================================================================
     3. THE METHOD. A stepper you operate, with arrow-key support.
     ====================================================================== */
  var stps = $$(".stp");
  function selectStep(n) {
    stps.forEach(function (b) { b.setAttribute("aria-selected", String(b.dataset.sp === n)); });
    $$(".sp").forEach(function (p) {
      var on = p.dataset.sp === n;
      p.hidden = !on;
      if (on) { p.setAttribute("data-on", "1"); } else { p.removeAttribute("data-on"); }
    });
    var shown = $('.sp[data-sp="' + n + '"]');
    if (shown && hasGSAP && !reduce) {
      gsap.fromTo(shown.children, { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: .42, stagger: .05, ease: "power2.out" });
    }
  }
  stps.forEach(function (b, i) {
    b.addEventListener("click", function () { selectStep(b.dataset.sp); });
    b.addEventListener("keydown", function (e) {
      var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var next = stps[(i + d + stps.length) % stps.length];
      next.focus(); selectStep(next.dataset.sp);
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
    var fc = $("#credito"), fp = $("#parcela");
    if (fc && !fc.dataset.touched) fc.value = money(C);
    if (fp && !fp.dataset.touched) fp.value = money(parcelaC);
  }

  [sCred, sPrazo, sTx, sFr, sJur].forEach(function (el) {
    if (!el) return;
    el.addEventListener("input", compute);
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
  var dots = rows.map(function (r) { return r.querySelector(".grow__d"); });
  var metas = rows.map(function (r) { return r.querySelector(".grow__m"); });
  var counter = $("#doorCount");

  var mm = gsap.matchMedia();

  mm.add("(min-width: 900px)", function () {
    gsap.set(bars, { scaleX: 0 });
    gsap.set(dots, { backgroundColor: "#2A2320", boxShadow: "0 0 0 0px rgba(226,5,15,0)" });
    gsap.set(metas, { opacity: .4 });
    counter.textContent = "0 / 6";

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#grade", start: "top top", end: "+=120%",
        pin: true, scrub: .6, invalidateOnRefresh: true,
        onUpdate: function (self) {
          var open = Math.min(6, Math.floor(self.progress * 7.2));
          counter.textContent = open + " / 6";
        }
      }
    });
    rows.forEach(function (r, i) {
      var at = i * 0.9;
      tl.to(bars[i], { scaleX: 1, duration: 1, ease: "power2.out" }, at)
        .to(dots[i], { backgroundColor: "#E2050F", boxShadow: "0 0 0 4px rgba(226,5,15,0.13)", duration: .5 }, at)
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

  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
