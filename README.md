# Fasolo Consórcios

Design source da landing page da Fasolo Consórcios (Santa Maria, RS).

Projeto **pessoal**, sem relação com a Novo Dash. O site final será construído
no **Framer**: este repositório é a fonte do design, escrita em HTML, CSS e JS
plano, de propósito, para ser lida e reconstruída lá.

Abrir: `open index.html`. Não tem build, não tem dependência.

```
index.html    estrutura e conteúdo (copy aprovada do cliente, verbatim)
styles.css    tokens e todos os componentes
app.js        simulador, abas, depoimentos, animações
assets/       fotos do Jair e dos eventos, em WebP
```

---

## Sistema de design

### Cor

| Token | Hex | Uso |
|---|---|---|
| `--ink` | `#0A0807` | fundo. Preto **quente**, não azulado |
| `--ink-2` / `--ink-3` | `#100D0C` / `#171312` | superfícies elevadas |
| `--line` / `--line-2` | `#241E1B` / `#352C28` | bordas e divisores |
| `--bone` | `#F5F2EF` | branco quente, texto no escuro e fundo do ato claro |
| `--ash` / `--ash-ink` | `#A0958E` / `#6B615B` | texto secundário no escuro / no claro |
| `--red` | `#E2050F` | **vermelho oficial da marca** |
| `--red-ink` | `#A8060E` | vermelho de texto pequeno em fundo claro (AA) |
| `--gold` | `#C79A4B` | só na seção de prêmios |
| `--green` | `#3FA46A` | semântico: a diferença a favor do consórcio |

**O preto é quente de propósito.** As fotos do Jair foram feitas em estúdio com
fundo marrom-café e luz quente lateral. Num preto azulado (`#0B0B0F`, o padrão)
elas brigam com o fundo e exigem recorte. No quente, a foto do hero dissolve na
página por máscara CSS, sem recorte nenhum.

**O vermelho foi amostrado pixel a pixel do logo** (o "F" monoline), porque
`fasoloconsorcios.com.br` está com o DNS quebrado e o briefing só diz "vermelho
oficial da marca". O vermelho da HS é outro (`#CD1719`) e não serve.
Vermelho nunca ocupa superfície grande: briefing veta.

### Tipografia

- **Schibsted Grotesk** (400/500/600/700) em tudo. Grotesco editorial de jornal,
  escolhido por soar analítico e não bancário. Títulos em peso 500 com
  `letter-spacing: -.042em`.
- **Geist Mono** (400/500) só onde o conteúdo é dado: o registro `(001)`, os
  números do simulador e os rótulos de custo da grade. Não espalhar pela página.

### Forma

Três raios, com regra: `4px` inputs pequenos, `8px` campos e linhas,
`16px`/`22px` cards e mídia, `999px` **só** em botão.

### Ícones

**Phosphor duotone**, 32 glifos, embutidos uma vez como sprite SVG no topo do
`index.html` e usados com `<use href="#i-nome">`. Duotone quer dizer que cada
glifo carrega uma camada fantasma a 20% sob a sólida, então o ícone lê como um
objeto pequeno e não como um pictograma de fio. A cor vem de `currentColor`,
o que faz a camada fantasma seguir o acento de graça.

Cor por contexto, e isso é hierarquia, não decoração:
`--red` nos destinos e no item aberto (conteúdo principal),
`--bone-2` nos blocos em repouso, `--gold` só nos prêmios.

⚠️⚠️ **Substituição de CSS por índice de string é perigosa neste arquivo.**
Trocar o bloco do botão procurando por `.btn{` casou com `.nav .btn{` dentro de
um media query, comeu as regras do logo e deixou **uma chave aberta**. Tudo
depois dela some sem erro: o ícone vira SVG de 150px, a caixa de soluções não
vira grid. Conferir sempre `abre == fecha` de chaves depois de editar o CSS.

⚠️ Ícone vive dentro de `.itile`, que é um `<span>`. Cuidado com regra de
elemento genérica tipo `.componente span{...}`: ela vence `.itile` na cascata e
apaga o ícone sem erro nenhum. Foi o que aconteceu com os prêmios uma vez.

### Botão

Pílula com gradiente vertical, brilho interno no topo, sombra de contato e um
**chip circular** com seta diagonal. No hover a seta sai pela diagonal e o
preenchimento clareia. O chip é o que faz o botão ler como controle e não como
uma pílula de texto. Serve `.btn`, `.btn--lg` e `.btn--ghost`.

### Equilíbrio das seções

`.shead` põe a manchete à esquerda e o texto de apoio **alinhado à direita**,
na borda oposta. Sem isso a página inteira encosta na esquerda e sobra branco na
direita, que foi a crítica principal da revisão de 17/09.

### Carrossel (008)

Fluido, não um slider. Uma trilha só, duplicada para o wrap ser contínuo. Ela
sempre deriva; a **velocidade de scroll da página** e um arremesso com a mão
somam na mesma velocidade, e essa velocidade também **inclina os cards**. É a
inclinação que faz a coisa ler como movimento com peso, e não como uma lista
passando. Sem biblioteca: uma posição, uma velocidade e um wrap. Só roda quando
a seção está na tela (IntersectionObserver).

### Dock

Faixa flutuante, não banner. Botão redondo de tema, atalhos que **magnificam na
direção do ponteiro** como o dock do macOS (a distância do cursor a cada item
define a escala), a **parcela ao vivo** do simulador assim que o visitante mexe
nos controles, e o CTA com a foto do Jair e duas linhas. Referência:
jords.co.uk. A magnificação é feedback de ponteiro, então não roda em
`prefers-reduced-motion` nem em toque.

### Tema claro

O botão redondo do dock troca os tokens do ato escuro para um quase-branco
quente e desloca o ato claro junto, para os dois atos continuarem se
distinguindo. **Só tokens mudam**, nenhum componente redefine cor própria. A
escolha fica no `localStorage`, dentro de try/catch.

⚠️ Vermelho pequeno precisa de valor diferente por fundo: `--red-ink` (#A8060E)
em fundo claro, `--red-lift` (#FF3B45) em fundo escuro. O `--red` da marca em
texto pequeno sobre preto dá **4.06:1** e reprova.

### Grão

`body::after` aplica um ruído SVG fixo em `mix-blend-mode: overlay`. É ele que
impede o vermelho de parecer neon: a cor assenta sobre textura, não sobre chapado.
Some em `prefers-reduced-motion`.

---

## As 11 seções

O hero mais dez seções numeradas. O número `(001)` não é enfeite: é o mesmo
índice que aparece no menu, e é como o visitante se localiza numa página longa.

| # | Seção | O dispositivo |
|---|---|---|
| — | Hero | manchete + componente de mídia + trilho de 3 objetivos |
| 001 | O problema | lista numerada que troca o diagrama ao lado |
| 002 | A grade de contemplação | **peça de assinatura**: cabeçalho por coluna e 6 portas acendendo no scroll |
| 003 | O método | quatro blocos verticais, um aberto por vez, seta navega |
| 004 | Simulador | cálculo ao vivo, comparação com financiamento |
| 005 | As soluções | abas ligadas ao objetivo, copy à esquerda e uma caixa de destinos à direita |
| 006 | Os resultados | uma caixa única: player, citação, navegação e deck |
| 007 | O fundador | Jair como autoridade, dentro da estrutura |
| 008 | A casa | carrossel fluido da sede, operação, time e estande |
| 009 | Reconhecimento | três caixas agrupadas: mercado, rede HS, verificação |
| 010 | Dúvidas | FAQ em duas colunas |
| 011 | Sua simulação | formulário, com o resultado do simulador junto |

### O objetivo atravessa a página

O visitante escolhe "imóvel", "veículo" ou "investimento" **uma vez**, no trilho
do hero. Essa resposta acende a aba certa em Soluções, seleciona o segmento no
simulador, ajusta o prazo padrão e preenche o campo do formulário. Ele nunca
responde duas vezes. É o que está em `setObjective()` no `app.js`.

### O simulador

```
consórcio:     parcela = crédito × (1 + taxa_adm + fundo_reserva) ÷ prazo
financiamento: parcela = C × i ÷ (1 − (1+i)^−n)      (Tabela Price)
```

Taxa de administração, fundo de reserva e juros do financiamento são **inputs
visíveis e editáveis** na própria página, não constantes escondidas no código.
O briefing veta "informações de taxas, parcelas, prazos ou campanhas sem data de
validade e sem possibilidade de atualização", e esta é a forma de respeitar isso
sem abrir mão da ferramenta. Defaults de referência: 18%, 2% e 1,09% ao mês.

O bloco termina com a ressalva de que é estimativa para comparação, não proposta.

---

## O que falta, e de quem depende

1. ~~Logo oficial~~ ✅ **resolvido em 17/09**: a marca oficial entrou em
   `assets/logo-fasolo.webp` (tipo claro, para o ato escuro) e
   `assets/logo-fasolo-dark.webp` (tipo escuro, para o tema claro). São PNGs
   recortados do pacote oficial e convertidos para WebP com alfa. Se aparecer
   um SVG da marca, troca direto.
2. **Depoimentos.** O módulo está pronto e é a prioridade do projeto, mas roda em
   estado de espera. As cidades e os tipos de bem são reais, da copy aprovada.
   Falta `nome`, `citacao` e `video` no array `DEPOIMENTOS` no topo do `app.js`.
   Preencher os três campos por entrada e o módulo vai ao ar sem mais nenhuma
   alteração. O briefing é explícito: depoimento sem identificação e prova não entra.
3. **Artes dos selos de premiação.** Hoje são blocos com ícone Phosphor.
4. **Vídeos dos depoimentos.**
5. **Fotos de entregas reais** (Bento Gonçalves, Porto Alegre, Santa Maria,
   Capão da Canoa), se a galeria de entregas da copy for construída.

Nada de banco de imagens genérico: o briefing veta explicitamente, e é por isso
que as seções sem foto real usam diagrama em CSS, não stock.

---

## Regras do briefing que a página respeita

O briefing tem uma lista longa de vetos. As que mais condicionaram o desenho:

- nada de cara de banco tradicional, nada de excesso de azul corporativo
- nada de imagem genérica de banco de imagens
- nada de excesso de efeito, brilho, degradê ou neon
- nada de contador regressivo falso ou escassez artificial
- nada de promessa: contemplação garantida, lance certo, aprovação garantida
- nada de botão de WhatsApp cobrindo conteúdo no celular
- a marca é protagonista; o Jair é fundador e autoridade, não dono de página pessoal
- **zero travessão** em texto que renderiza

## Armadilha registrada: scroll suave nativo x pin do ScrollTrigger

⛔ **Não colocar `scroll-behavior: smooth` no `html`.** A seção `(002)` usa
`ScrollTrigger` com `pin: true`. Durante o `refresh()`, o ScrollTrigger
reposiciona o scroll programaticamente para remedir a página. Com scroll suave
nativo ligado, o browser **anima** esse reposicionamento, o ScrollTrigger mede um
alvo em movimento e ativa o pin na posição errada: a grade vira `position: fixed`
e cai em cima da seção que você está lendo, que parece ficar em branco.

Sintoma: clicar num item de "O problema" fazia a seção sumir e aparecer um vazio
enorme. Não dá erro no console, e só aparece quando existe um `refresh()` e um
pin na mesma página.

Correção, nas duas pontas:
1. o scroll suave das âncoras é feito no `app.js`, com
   `window.scrollTo({behavior:"smooth"})`, com deslocamento de 78px para limpar
   o menu fixo. O CSS fica em `auto`.
2. `refreshIfResized()` só chama `ScrollTrigger.refresh()` quando a altura do
   documento mudou de verdade, e com meio segundo de folga. A lista do problema
   não muda a altura da seção (quem manda nela é o painel sticky), então não
   refrescava nada e ainda assim quebrava a página.

## Acessibilidade e performance

Contraste AA em todos os pares de texto. Foco visível. Abas e steppers com
`aria-selected` e navegação por seta. `prefers-reduced-motion` desliga toda
animação, o grão e o scroll suave, e a grade aparece acesa. Sem JavaScript a
página continua legível: os reveals só entram no estado inicial depois que o
script confirma que vai animar. Fotos em WebP, 312 KB no total.
