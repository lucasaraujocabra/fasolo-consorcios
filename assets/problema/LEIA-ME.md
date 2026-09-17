# Imagens do painel (001) O problema

Quatro artes, uma por dor. Elas entram como banda no topo do box da direita,
acima do diagrama. Enquanto o arquivo não existir, o JS remove a figura e o
painel volta a ser só o diagrama, inteiro, sem buraco e sem ícone quebrado.

## Os arquivos

| Arquivo | Dor | O que a imagem tem que dizer |
|---|---|---|
| `01-grupo-errado.webp` | (01) Você entra no grupo errado | perfis incompatíveis disputando a mesma vaga |
| `02-porta-unica.webp` | (02) Só existe sorteio ou lance alto | uma porta aberta, cinco fechadas |
| `03-sem-atendimento.webp` | (03) Depois da assinatura, ninguém atende | o posto de atendimento abandonado |
| `04-promessa-contrato.webp` | (04) Te prometem o que não está no contrato | a letra miúda que ninguém leu |

**Formato:** gere em **16:9, 1600 × 900**. O navegador recorta para a banda
(`object-fit:cover`, foco em 50% 45%), então deixe o assunto no meio vertical e
o **canto superior esquerdo vazio**, que é onde fica a plaquinha `(01)`.

**Depois de gerar**, converta e coloque nesta pasta com o nome exato da tabela:

```
cwebp -q 82 01-grupo-errado.png -o 01-grupo-errado.webp
```

## Estilo (cole no fim de todos os quatro)

> cinematic editorial photograph, 50mm lens, shallow depth of field, single warm
> tungsten key light coming from the left, deep warm black background, muted
> desaturated palette of coffee brown, charcoal and bone white, natural skin
> tones, subtle film grain, documentary realism, Brazilian setting, empty
> negative space in the upper left corner, no text, no readable words, no logos,
> no watermark, no neon, no blue tones, no lens flare, no glow, no HDR,
> no stock-photo smiling, 16:9

## Os quatro prompts

### 01 · `01-grupo-errado.webp`

> Four very different Brazilian people sitting side by side on the same row of
> chairs in a dim waiting room, all facing the same closed door out of frame: a
> man in a well tailored dark suit checking his watch, a young couple in
> everyday clothes holding a paper folder, an older woman with a worn handbag on
> her lap, a man in a work uniform with dusty boots. Same room, same queue,
> clearly different lives. Camera low and level, looking down the row, the
> farthest person falling into shadow.

### 02 · `02-porta-unica.webp`

> A long dim corridor lined with six identical heavy doors, five of them firmly
> shut, only the farthest one standing open with warm light spilling across the
> floor. One small solitary figure stands at the near end of the corridor,
> backlit, facing the distance. Strong perspective, the closed doors receding
> into darkness.

### 03 · `03-sem-atendimento.webp`

> An empty customer service desk in a dim office after hours: the chair pushed
> back and turned away, a desk phone lying off the hook with the coiled cord
> hanging over the edge, a cold half finished cup of coffee, a stack of papers
> abandoned mid sort, dark monitors. Nobody in frame. A single warm lamp still
> on at the side of the desk.

### 04 · `04-promessa-contrato.webp`

> A printed contract lying open on a dark wooden desk under one warm desk lamp,
> photographed at a low raking angle. The dense fine print fills the foreground
> in sharp focus but the words are illegible and blurred, and the signature line
> falls away into deep shadow. A pen rests across the page, reading glasses
> folded at the edge of the frame.

## O que NÃO pode aparecer

O briefing veta, e a página inteira segue isso:
foto genérica de banco de imagens, gente sorrindo para a câmera, azul
corporativo, brilho/degradê/neon, cara de render 3D, qualquer texto ou logo
legível, e nada que sugira contemplação garantida.

As quatro têm que parecer **o mesmo ensaio**: mesma luz quente lateral, mesmo
preto quente de fundo, mesma ausência de cor saturada. O vermelho da marca
(`#E2050F`) já entra por cima, no degradê do próprio componente. Não peça
vermelho na geração.
