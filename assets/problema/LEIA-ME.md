# Imagens do painel (001) O problema

Quatro artes, uma por dor. Elas entram como banda no topo do box da direita,
acima do diagrama. Enquanto o arquivo não existir, o JS remove a figura e o
painel volta a ser só o diagrama, inteiro, sem buraco e sem ícone quebrado.

## Os arquivos

| Arquivo | Dor | O que a imagem tem que dizer |
|---|---|---|
| `01-grupo-errado.webp` | (01) Você entra no grupo errado | perfis incompatíveis na mesma fila |
| `02-porta-unica.webp` | (02) Só existe sorteio ou lance alto | uma porta aberta, cinco fechadas |
| `03-sem-atendimento.webp` | (03) Depois da assinatura, ninguém atende | o posto de atendimento vazio |
| `04-promessa-contrato.webp` | (04) Te prometem o que não está no contrato | a letra miúda que ninguém leu |

**Formato:** gere em **16:9, 1600 × 900**. O navegador recorta para a banda
(`object-fit:cover`, foco em 50% 45%), então deixe o assunto no meio vertical e
o **canto superior esquerdo vazio**, que é onde fica a plaquinha `(01)`.

**Depois de gerar**, converta e coloque nesta pasta com o nome exato da tabela:

```
cwebp -q 82 01-grupo-errado.png -o 01-grupo-errado.webp
```

## A direção

Cinematográfico, realista e **institucional**, não documental sujo. Arquitetura
contemporânea limpa, materiais caros (preto fosco, carvalho claro, concreto
polido, vidro), luz grande e suave vindo de um lado, enquadramento simétrico com
espaço sobrando. O que comunica a dor é a **composição e o vazio**, não bagunça,
poeira, papel espalhado ou café frio.

Os prompts abaixo já saem completos, cada um com o bloco de estilo no fim. É só
colar inteiro.

## Os quatro prompts

### 01 · `01-grupo-errado.webp`

> A row of six identical contemporary lounge chairs along a clean minimal wall in
> a modern corporate waiting area. Four well dressed people of clearly different
> ages and walks of life are seated apart along the row, composed and quiet, each
> one looking toward the same closed door at the far end of the room. Wide
> symmetric framing with generous empty space, polished concrete floor, warm oak
> wall. Modern cinematic architectural photography, photorealistic, editorial and
> institutional, clean and uncluttered composition, premium materials of matte
> black, warm oak and polished concrete, one large soft directional light with
> gentle falloff, warm neutral color grade over a deep warm black background,
> muted palette of charcoal, warm grey and bone white, shallow depth of field,
> full frame camera with a 35mm lens, calm and confident mood, empty negative
> space in the upper left corner, no clutter, no mess, no text, no logos, no
> watermark, no blue tones, no neon, no lens flare, no heavy grain, no HDR,
> nobody smiling at the camera, 16:9

### 02 · `02-porta-unica.webp`

> A modern minimalist corridor with six identical flush doors in warm oak set
> into a matte black wall, five of them closed and only the farthest one open,
> warm light spilling in a clean rectangle across the polished floor. Strong one
> point perspective, perfectly symmetric, nobody in frame. Modern cinematic
> architectural photography, photorealistic, editorial and institutional, clean
> and uncluttered composition, premium materials of matte black, warm oak and
> polished concrete, one large soft directional light with gentle falloff, warm
> neutral color grade over a deep warm black background, muted palette of
> charcoal, warm grey and bone white, full frame camera with a 35mm lens, calm
> and confident mood, empty negative space in the upper left corner, no clutter,
> no mess, no text, no logos, no watermark, no blue tones, no neon, no lens
> flare, no heavy grain, no HDR, 16:9

### 03 · `03-sem-atendimento.webp`

> A clean contemporary reception counter in a modern office, completely empty.
> One designer chair turned away from the desk, a slim headset resting on the
> polished surface, the monitor dark. Everything tidy and put away, nothing out
> of place, nobody in frame. Low warm light from one side, the rest of the room
> falling into soft shadow. Modern cinematic architectural photography,
> photorealistic, editorial and institutional, clean and uncluttered composition,
> premium materials of matte black, warm oak and polished concrete, one large
> soft directional light with gentle falloff, warm neutral color grade over a
> deep warm black background, muted palette of charcoal, warm grey and bone
> white, shallow depth of field, full frame camera with a 35mm lens, calm and
> confident mood, empty negative space in the upper left corner, no clutter, no
> mess, no text, no logos, no watermark, no blue tones, no neon, no lens flare,
> no heavy grain, no HDR, 16:9

### 04 · `04-promessa-contrato.webp`

> A single printed contract lying on a clean matte desk in a modern office, lit
> by one large soft warm light from the left. The dense fine print in the
> foreground is razor sharp but completely illegible, and the signature line at
> the bottom falls away into shadow. One slim black pen placed neatly beside it.
> Nothing else on the desk. Modern cinematic architectural photography,
> photorealistic, editorial and institutional, clean and uncluttered composition,
> premium materials of matte black, warm oak and polished concrete, gentle
> falloff, warm neutral color grade over a deep warm black background, muted
> palette of charcoal, warm grey and bone white, shallow depth of field, full
> frame camera with a 50mm lens, calm and confident mood, empty negative space in
> the upper left corner, no clutter, no mess, no readable words, no logos, no
> watermark, no blue tones, no neon, no lens flare, no heavy grain, no HDR, 16:9

## O que NÃO pode aparecer

O briefing veta, e a página inteira segue isso: foto de banco de imagens, gente
sorrindo para a câmera, azul corporativo, brilho/degradê/neon, cara de render
3D, qualquer texto ou logo legível, e nada que sugira contemplação garantida.
Some com isso também: bagunça, papel espalhado, poeira, cadeira velha, café pela
metade. A dor se conta pelo vazio e pela simetria, não por sujeira.

As quatro têm que parecer **o mesmo ensaio**: mesma luz suave lateral, mesmo
preto quente de fundo, mesma paleta sem cor saturada. O vermelho da marca
(`#E2050F`) já entra por cima, no degradê do próprio componente. Não peça
vermelho na geração.
