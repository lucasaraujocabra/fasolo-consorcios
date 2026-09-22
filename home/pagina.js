/* =============================================================================
   FASOLO · HOME v3
   Movimento sóbrio: uma curva só, [.16,1,.3,1], que é a que saiu do bundle das
   referências. Nada entra girando, nada pisca. O que se mexe é a foto e as
   seis portas, porque são eles que contam a história.
   ========================================================================== */
(function () {
  "use strict";
  /* Se QUALQUER coisa aqui dentro estourar, o conteúdo tem que aparecer do
     mesmo jeito. Antes, um null no meio do arquivo deixava a página inteira
     em opacity 0 e sem erro visível para o usuário. */
  window.FASOLO_VIVO = true;
  var mostraTudo = window.FASOLO_SOLTA || function () {};
  try {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var temGSAP = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  if (temGSAP) gsap.registerPlugin(ScrollTrigger);

  /* ------------------------------------------------------------------ menu */
  var btn = $("#menuBtn"), telas = $("#telas");
  btn.addEventListener("click", function () {
    var aberto = telas.dataset.aberto === "1";
    telas.dataset.aberto = aberto ? "0" : "1";
    btn.setAttribute("aria-expanded", String(!aberto));
    document.body.style.overflow = aberto ? "" : "hidden";
  });
  var telasFoto = $("#telasFoto");
  $$("#telas a[data-foto]").forEach(function (a) {
    a.addEventListener("mouseenter", function () {
      if (telasFoto) telasFoto.src = "../assets/foto/" + a.dataset.foto + ".webp";
    });
  });
  $$("#telas a").forEach(function (a) {
    a.addEventListener("click", function () {
      telas.dataset.aberto = "0";
      btn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });

  /* o topo só ganha fundo depois que sai da primeira tela */
  var topo = $("#topo");
  var marcaFundo = function () { topo.classList.toggle("is-fundo", window.scrollY > window.innerHeight * .82); };
  marcaFundo();
  window.addEventListener("scroll", marcaFundo, { passive: true });

  /* A navbar vira junto com o ato que está por baixo dela. Sem isso, a barra
     escura atravessa a seção clara como uma laje cinza. Observador, não
     listener de scroll: só dispara quando a seção cruza a linha da navbar. */
  var marcaImg = topo.querySelector(".topo__marca img");
  var claras = $$(".tela--claro");
  if (claras.length && "IntersectionObserver" in window) {
    var altura = topo.getBoundingClientRect().height || 88;
    var io = new IntersectionObserver(function (entradas) {
      var sob = entradas.some(function (e) {
        var r = e.target.getBoundingClientRect();
        return r.top <= altura * 0.6 && r.bottom >= altura * 0.6;
      });
      topo.classList.toggle("is-claro", sob);
      if (marcaImg) {
        var nova = sob ? marcaImg.dataset.claro : marcaImg.dataset.escuro;
        if (nova && marcaImg.getAttribute("src") !== nova) marcaImg.src = nova;
      }
    }, { rootMargin: "-" + Math.round(altura * 0.6) + "px 0px -" + (window.innerHeight - Math.round(altura * 0.6) - 1) + "px 0px", threshold: 0 });
    claras.forEach(function (c) { io.observe(c); });
  }

  /* --------------------------------------------------------- depoimentos */
  /* ⛔ MODO DEMONSTRAÇÃO. Nomes e citações são FICTÍCIOS, existem só para a
     apresentação. Vire para false e a seção volta ao estado de espera, que é
     como ela tem que ir ao ar. Cidade e bem saem da copy aprovada.          */
  var DEPO_DEMO = true;

  var ESPERA = [
    { nome: "", cidade: "Bento Gonçalves, RS", bem: "Imóvel residencial", citacao: "" },
    { nome: "", cidade: "Porto Alegre, RS", bem: "Imóvel comercial", citacao: "" },
    { nome: "", cidade: "Santa Maria, RS", bem: "Veículo pesado", citacao: "" },
    { nome: "", cidade: "Capão da Canoa, RS", bem: "Terreno e construção", citacao: "" }
  ];
  var FICTICIOS = [
    { nome: "Marcelo Bertoldi", cidade: "Bento Gonçalves, RS", bem: "Imóvel residencial",
      citacao: "Eu ia entrar num grupo qualquer, olhando parcela. A Fasolo me mostrou que o meu perfil não combinava com aquele grupo e me realocou. Fui contemplado por lance no sétimo mês." },
    { nome: "Daniela Rocha", cidade: "Porto Alegre, RS", bem: "Imóvel comercial",
      citacao: "O que me convenceu foi ouvir um não. Perguntei se dava para garantir a contemplação e me explicaram, com o contrato na mão, que ninguém garante." },
    { nome: "Anderson Klein", cidade: "Santa Maria, RS", bem: "Veículo pesado",
      citacao: "A diferença apareceu depois da assinatura. Toda assembleia eu recebia o resultado explicado e a orientação do que fazer." },
    { nome: "Simone Vargas", cidade: "Capão da Canoa, RS", bem: "Terreno e construção",
      citacao: "Eles estudaram o grupo antes e me disseram em que mês fazia sentido ofertar lance. Eu só segui o plano." }
  ];
  var DEPO = DEPO_DEMO ? FICTICIOS : ESPERA;
  var tag = document.getElementById("demoTag");
  if (DEPO_DEMO && tag) tag.hidden = false;
  if (DEPO_DEMO) console.warn("[Fasolo] Depoimentos em MODO DEMONSTRAÇÃO: fictícios. Vire DEPO_DEMO para false antes de publicar.");

  /* Painel grande de volta. Sem play: são FOTOS de entrega, e um play que
     não toca vídeo é promessa que a interface não cumpre. */
  var FOTOS = ["porsche-estande","fachada-dia","operacao","porsche-detalhe"];
  var elQ = $("#depoQ"), elN = $("#depoN"), elC = $("#depoC"), elBem = $("#depoBem"),
      elImg = $("#depoImg"), elConta = $("#depoConta"), prog = $("#reelProg");
  var i = 0;
  function pinta(n, anima) {
    i = (n + DEPO.length) % DEPO.length;
    var d = DEPO[i];
    var aplica = function () {
      elQ.textContent = d.citacao || "O cliente conta o objetivo, a estratégia que usamos e o bem que recebeu.";
      elN.textContent = d.nome || "Cliente contemplado";
      elC.textContent = d.cidade;
      elBem.textContent = d.bem;
      elImg.src = "../assets/foto/" + FOTOS[i % FOTOS.length] + ".webp";
      elConta.textContent = (i + 1) + " de " + DEPO.length;
      prog.style.transform = "scaleX(" + ((i + 1) / DEPO.length) + ")";
      [].forEach.call(document.querySelectorAll(".tcard"), function (c, k) {
        c.setAttribute("aria-selected", String(k === i));
      });
    };
    if (anima && temGSAP && !reduz) {
      gsap.fromTo([elQ, elQ.nextElementSibling], { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: .46, stagger: .05, ease: "power2.out", onStart: aplica });
      gsap.fromTo(elImg, { opacity: .2, scale: 1.04 }, { opacity: 1, scale: 1, duration: .7, ease: "power3.out" });
    } else { aplica(); }
  }
  /* trilho de cidades: o índice visível do depoimento, como no primeiro
     componente que o Lucas aprovou. Cidade e bem saem da copy. */
  var trilho = $("#trilho");
  DEPO.forEach(function (d, k) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "tcard"; b.setAttribute("aria-selected", String(k === 0));
    b.innerHTML = '<b><svg class="ic"><use href="#i-globo"></use></svg>' + d.cidade + "</b><span>" + d.bem + "</span>";
    b.addEventListener("click", function () { pinta(k, true); });
    trilho.appendChild(b);
  });

  $("#depoPrev").addEventListener("click", function () { pinta(i - 1, true); });
  $("#depoNext").addEventListener("click", function () { pinta(i + 1, true); });
  pinta(0, false);

  /* Entregas reais. A foto É o card. Cidade e bem saem da copy aprovada;
     quando os nomes reais chegarem, entram aqui sem mexer no layout. */
  var ENTREGAS = [
    { foto: "porsche-estande", bem: "Veículo leve",        cidade: "Santa Maria, RS" },
    { foto: "entrega-2",       bem: "Veículo leve",        cidade: "Santa Maria, RS" },
    { foto: "entrega-4",       bem: "Veículo leve",        cidade: "Santa Maria, RS" },
    { foto: "estande",         bem: "Sede própria",        cidade: "Santa Maria, RS" },
    { foto: "entrega-1",       bem: "Veículo leve",        cidade: "Santa Maria, RS" },
    { foto: "entrega-3",       bem: "Veículo leve",        cidade: "Santa Maria, RS" },
    { foto: "fachada-dia",     bem: "Imóvel comercial",    cidade: "Santa Maria, RS" },
    { foto: "sede-1",          bem: "Imóvel comercial",    cidade: "Santa Maria, RS" }
  ];
  var pista = $("#entregas");
  if (pista) {
    ENTREGAS.forEach(function (e, k) {
      var c = document.createElement("article");
      c.className = "ent";
      c.innerHTML =
        '<img src="../assets/foto/' + e.foto + '.webp" alt="Entrega da Fasolo Consórcios em ' + e.cidade + '" loading="lazy">' +
        '<span class="ent__tag">' + String(k + 1).padStart(2, "0") + '</span>' +
        '<span class="ent__b"><span class="ent__bem">' + e.bem + '</span>' +
        '<span class="ent__cid"><svg class="ic"><use href="#i-globo"></use></svg>' + e.cidade + '</span></span>';
      pista.appendChild(c);
    });
    var passo = function () {
      var c = pista.querySelector(".ent");
      return c ? c.getBoundingClientRect().width + 14 : 300;
    };
    $("#entPrev").addEventListener("click", function () { pista.scrollBy({ left: -passo() * 2, behavior: "smooth" }); });
    $("#entNext").addEventListener("click", function () { pista.scrollBy({ left:  passo() * 2, behavior: "smooth" }); });
  }

  /* ------------------------------------------------------------ movimento */
  if (!temGSAP || reduz) {
    $$("[data-sobe]").forEach(function (n) { n.style.opacity = 1; n.style.transform = "none"; });
    $$(".gbento").forEach(function (g) { g.classList.add("is-aberto"); });
    return;
  }

  $$("section").forEach(function (sec) {
    var alvos = $$("[data-sobe]", sec);
    if (!alvos.length) return;
    gsap.to(alvos, {
      opacity: 1, y: 0, duration: .82, stagger: .07, ease: "power3.out",
      scrollTrigger: { trigger: sec, start: "top 74%", once: true }
    });
  });

  /* as seis portas abrem juntas, que é literalmente o argumento da seção */
  ScrollTrigger.create({
    trigger: "#portas", start: "top 62%", once: true,
    onEnter: function () {
      /* as cápsulas acendem em sequência: as seis juntas é o argumento */
      var gb = $(".gbento");
      if (gb) setTimeout(function () { gb.classList.add("is-aberto"); }, 140);
    }
  });

  /* o brilho do bento segue o ponteiro por variável CSS: nada de state,
     nada de re-render, só duas custom properties por movimento. */
  $$(".bc").forEach(function (c) {
    var luz = document.createElement("span");
    luz.className = "bc__luz"; c.appendChild(luz);
    c.addEventListener("pointermove", function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty("--mx", (e.clientX - r.left) + "px");
      c.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* o medidor da célula principal: doze traços, os quatro últimos na cor da
     marca. Desenhado aqui e não no HTML para a marcação não virar ruído. */
  var barras = document.querySelector(".bc__g-barras");
  if (barras) {
    var N = 12, larg = 220 / N;
    for (var k = 0; k < N; k++) {
      var alt = 14 + Math.round(Math.pow(k / (N - 1), 1.7) * 46);
      var r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      r.setAttribute("x", (k * larg + larg * 0.18).toFixed(1));
      r.setAttribute("y", (64 - alt).toFixed(1));
      r.setAttribute("width", (larg * 0.64).toFixed(1));
      r.setAttribute("height", alt);
      r.setAttribute("rx", "1.5");
      if (k >= N - 4) r.setAttribute("class", "on");
      barras.appendChild(r);
    }
  }

  /* a foto de fundo deriva devagar: dá profundidade sem descobrir a borda */
  $$(".midia img").forEach(function (img) {
    gsap.fromTo(img, { yPercent: -4 }, {
      yPercent: 4, ease: "none",
      scrollTrigger: { trigger: img.closest("section"), start: "top bottom", end: "bottom top", scrub: true }
    });
  });
  } catch (e) {
    /* o conteúdo vem antes da animação, sempre */
    mostraTudo();
    if (window.console) console.error("[Fasolo] movimento desligado:", e);
  }
})();
