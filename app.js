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
  /* -------------------------------------------------------------------------
     ⛔ MODO DEMONSTRAÇÃO
     Os nomes e as citações abaixo são FICTÍCIOS. Existem só para a
     apresentação ao cliente mostrar como o módulo se comporta cheio.

     Vire DEPO_DEMO para false e a seção volta ao estado de espera, que é
     como ela tem que ir ao ar. O briefing é explícito: depoimento sem nome,
     cidade e prova não entra na página.

     DEPO_AVISO liga uma etiqueta discreta de "exemplo ilustrativo" ao lado do
     registro da seção, para ninguém confundir na reunião. Desligue só ela se
     quiser a tela limpa.

     As cidades e os tipos de bem NÃO são fictícios: saem da copy aprovada.
     ---------------------------------------------------------------------- */
  var DEPO_DEMO = true;
  var DEPO_AVISO = true;

  var DEPO_ESPERA = [
    { nome: "", cidade: "Bento Gonçalves, RS", bem: "Imóvel residencial",   citacao: "", video: "" },
    { nome: "", cidade: "Porto Alegre, RS",    bem: "Imóvel comercial",     citacao: "", video: "" },
    { nome: "", cidade: "Santa Maria, RS",     bem: "Veículo pesado",       citacao: "", video: "" },
    { nome: "", cidade: "Capão da Canoa, RS",  bem: "Terreno e construção", citacao: "", video: "" }
  ];

  var DEPO_FICTICIOS = [
    {
      nome: "Marcelo Bertoldi", cidade: "Bento Gonçalves, RS", bem: "Imóvel residencial",
      citacao: "Eu ia entrar num grupo qualquer, olhando parcela. A Fasolo me mostrou que o " +
               "meu perfil não combinava com aquele grupo e me realocou. Fui contemplado por " +
               "lance no sétimo mês, com a estratégia montada antes de eu assinar.",
      video: ""
    },
    {
      nome: "Daniela Rocha", cidade: "Porto Alegre, RS", bem: "Imóvel comercial",
      citacao: "O que me convenceu foi ouvir um não. Perguntei se dava para garantir a " +
               "contemplação e me explicaram, com o contrato na mão, que ninguém garante. " +
               "Foi a primeira vez que alguém do setor falou comigo desse jeito.",
      video: ""
    },
    {
      nome: "Anderson Klein", cidade: "Santa Maria, RS", bem: "Veículo pesado",
      citacao: "A diferença apareceu depois da assinatura. Toda assembleia eu recebia o " +
               "resultado explicado e a orientação do que fazer. Não precisei correr atrás " +
               "de ninguém para entender o que estava acontecendo com a minha cota.",
      video: ""
    },
    {
      nome: "Simone Vargas", cidade: "Capão da Canoa, RS", bem: "Terreno e construção",
      citacao: "Eles estudaram o grupo antes e me disseram em que mês fazia sentido ofertar " +
               "lance. Eu só segui o plano. O terreno saiu, e a construção começou dentro do " +
               "prazo que a gente tinha desenhado lá no começo.",
      video: ""
    }
  ];

  var DEPOIMENTOS = DEPO_DEMO ? DEPO_FICTICIOS : DEPO_ESPERA;

  if (DEPO_DEMO) {
    console.warn("[Fasolo] Depoimentos em MODO DEMONSTRAÇÃO: nomes e citações são " +
                 "fictícios. Vire DEPO_DEMO para false em app.js antes de publicar.");
    if (DEPO_AVISO) {
      var regRes = document.querySelector("#resultados .reg");
      if (regRes) {
        var av = document.createElement("span");
        av.className = "reg__demo";
        av.textContent = "exemplo ilustrativo";
        regRes.appendChild(av);
      }
    }
  }

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
    b.innerHTML = '<b><svg class="ic" aria-hidden="true"><use href="#i-map-pin"></use></svg>'
      + d.cidade + "</b><span>" + d.bem + "</span>";
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
      if (tiles.length) {
        var atual = null;
        SECOES.forEach(function (s) { if (s.el.getBoundingClientRect().top <= mid) atual = s; });
        tiles.forEach(function (t) {
          if (atual && t.dataset.id === atual.id) { t.setAttribute("aria-current", "true"); }
          else { t.removeAttribute("aria-current"); }
        });
      }

      var dock = $("#dock"), formTop = $("#simulacao").getBoundingClientRect().top;
      var show = window.scrollY > window.innerHeight * 0.9 && formTop > 400;
      dock.classList.toggle("on", show);

      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();


  var toTop = $("#toTop");
  if (toTop) toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });

  /* =========================================================================
     10. TEMA
     O botão saiu do dock em 17/09. Os tokens do tema claro continuam no CSS,
     então religar é devolver um botão que chame applyTheme("light"). A leitura
     do localStorage saiu junto: sem botão, quem tivesse "light" salvo ficaria
     preso no tema claro sem como voltar.
     ====================================================================== */
  function applyTheme(t) {
    if (t === "light") { document.documentElement.setAttribute("data-theme", "light"); }
    else { document.documentElement.removeAttribute("data-theme"); }
  }

  /* =========================================================================
     11. DOCK, estilo macOS
     Um tile por seção, como ícone de app. O que está sob o ponteiro cresce e
     os vizinhos crescem menos, com a escala caindo pela distância. Clicar leva
     até a seção; a atual ganha o ponto embaixo.
     ====================================================================== */
  /* Três, não doze: o diferencial, a ferramenta e a prova. A lista completa
     já está no menu e no rodapé; o dock é atalho, não índice. */
  var ICONES = {
    grade:"lock-key-open", simulador:"chart-line-up", resultados:"quotes"
  };
  var dockApps = $("#dockApps");
  var SECOES = $$("section[id]").map(function (s) {
    var reg = s.querySelector(".reg__n"), tit = s.querySelector(".reg__t");
    return { el:s, id:s.id, n: reg ? reg.textContent.replace(/[()]/g,"") : "",
             t: tit ? tit.textContent.trim() : "" };
  }).filter(function (x) { return x.n && ICONES[x.id]; });

  var tiles = [];
  if (dockApps) {
    SECOES.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "dtile"; b.dataset.id = s.id;
      b.setAttribute("aria-label", s.t);
      b.innerHTML = '<span class="dtile__g"><svg class="ic" aria-hidden="true">' +
        '<use href="#i-' + ICONES[s.id] + '"></use></svg></span>' +
        '<span class="dtile__t">' + s.t + "</span>";
      b.addEventListener("click", function () {
        var top = s.el.getBoundingClientRect().top + window.scrollY - 78;
        window.scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" });
      });
      dockApps.appendChild(b);
      tiles.push(b);
    });

    if (!reduce) {
      dockApps.addEventListener("pointermove", function (e) {
        tiles.forEach(function (t) {
          var r = t.getBoundingClientRect();
          var d = Math.abs(e.clientX - (r.left + r.width / 2));
          var k = Math.max(0, 1 - d / 120);
          t.style.setProperty("--k", k.toFixed(3));
        });
      });
      dockApps.addEventListener("pointerleave", function () {
        tiles.forEach(function (t) { t.style.removeProperty("--k"); });
      });
    }
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
  var metas = rows.reduce(function (acc, r) {
    return acc.concat($$(".grow__c, .grow__w", r));
  }, []);
  var counter = $("#doorCount");

  var mm = gsap.matchMedia();

  mm.add("(min-width: 900px)", function () {
    gsap.set(bars, { scaleX: 0 });
    gsap.set(glyphs, { color: "#3A322E" });
    gsap.set(metas, { opacity: .4 });
    counter.innerHTML = "<b>0</b>de 6";

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#grade", start: "top top", end: "+=120%",
        pin: true, scrub: .6, invalidateOnRefresh: true,
        onUpdate: function (self) {
          var open = Math.min(6, Math.floor(self.progress * 7.2));
          counter.innerHTML = "<b>" + open + "</b>de 6";
        }
      }
    });
    rows.forEach(function (r, i) {
      var at = i * 0.9;
      tl.to(bars[i], { scaleX: 1, duration: 1, ease: "power2.out" }, at)
        .to(glyphs[i], { color: "#E2050F", duration: .5 }, at)
        .to($$(".grow__c, .grow__w", r), { opacity: 1, duration: .5 }, at);
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

/* ---------------------------------------------------------------------------
   Imagem do painel do problema.
   As quatro artes ainda vão ser geradas. Enquanto o arquivo não existir a
   figura sai do DOM, e o painel volta a ser só o diagrama, inteiro. Assim a
   página nunca mostra ícone de imagem quebrada nem um buraco no layout.
   ------------------------------------------------------------------------- */
(function () {
  var sec = document.getElementById("problema");
  var figs = [].slice.call(document.querySelectorAll(".pvfig"));
  if (!sec || !figs.length) return;

  figs.forEach(function (fig) {
    var img = fig.querySelector("img");
    if (!img) return;
    function some() { if (fig.parentNode) fig.parentNode.removeChild(fig); }
    if (img.complete && img.naturalWidth === 0) return some();
    img.addEventListener("error", some);
  });

  // Três dos quatro painéis nascem em display:none, e imagem escondida com
  // loading="lazy" NUNCA começa a carregar: o erro não dispara, a figura não
  // sai, e quem clicar vê uma caixa escura esperando. Quando a seção chega
  // perto da tela, todas passam para eager e resolvem de uma vez.
  function acorda() {
    figs.forEach(function (fig) {
      var img = fig.querySelector("img");
      if (img) img.loading = "eager";
    });
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { acorda(); io.disconnect(); }
    }, { rootMargin: "600px 0px" });
    io.observe(sec);
  } else { acorda(); }
})();
