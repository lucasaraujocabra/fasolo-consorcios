/* =============================================================================
   FASOLO · HOME v3
   Movimento sóbrio: uma curva só, [.16,1,.3,1], que é a que saiu do bundle das
   referências. Nada entra girando, nada pisca. O que se mexe é a foto e as
   seis portas, porque são eles que contam a história.
   ========================================================================== */
(function () {
  "use strict";
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

  var i = 0;
  var elQ = $("#depoQ"), elN = $("#depoN"), elC = $("#depoC"), elB = $("#depoB"), elConta = $("#depoConta");
  function pinta(n, anima) {
    i = (n + DEPO.length) % DEPO.length;
    var d = DEPO[i];
    var aplica = function () {
      elQ.textContent = d.citacao || "O cliente conta o objetivo, a estratégia que usamos e o bem que recebeu.";
      elN.textContent = d.nome || "Cliente contemplado";
      elC.textContent = d.cidade;
      elB.textContent = d.bem;
      /* sem mono: o contador é tipo normal, e é isso que tira a cara de IA */
      elConta.textContent = (i + 1) + " de " + DEPO.length;
    };
    if (anima && temGSAP && !reduz) {
      gsap.fromTo([elQ, elQ.nextElementSibling], { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: .46, stagger: .05, ease: "power2.out", onStart: aplica });
    } else { aplica(); }
  }
  $("#depoPrev").addEventListener("click", function () { pinta(i - 1, true); });
  $("#depoNext").addEventListener("click", function () { pinta(i + 1, true); });
  pinta(0, false);

  /* ------------------------------------------------------------ movimento */
  if (!temGSAP || reduz) {
    $$("[data-sobe]").forEach(function (n) { n.style.opacity = 1; n.style.transform = "none"; });
    $$(".porta").forEach(function (p) { p.classList.add("is-on"); });
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
      $$(".porta").forEach(function (p, k) {
        setTimeout(function () { p.classList.add("is-on"); }, k * 110);
      });
    }
  });

  /* a foto de fundo deriva devagar: dá profundidade sem descobrir a borda */
  $$(".midia img").forEach(function (img) {
    gsap.fromTo(img, { yPercent: -4 }, {
      yPercent: 4, ease: "none",
      scrollTrigger: { trigger: img.closest("section"), start: "top bottom", end: "bottom top", scrub: true }
    });
  });
})();
