# Imagens do painel (001) O problema

Quatro artes, uma por dor. Elas entram como banda no topo do box da direita,
acima do diagrama. Enquanto o arquivo não existir, o JS remove a figura e o
painel volta a ser só o diagrama, inteiro, sem buraco e sem ícone quebrado.

## Os arquivos

| Arquivo | Dor | O que a imagem mostra |
|---|---|---|
| `01-grupo-errado.webp` | (01) Você entra no grupo errado | perfis muito diferentes na mesma sala |
| `02-porta-unica.webp` | (02) Só existe sorteio ou lance alto | fila de portas, uma só aberta |
| `03-sem-atendimento.webp` | (03) Depois da assinatura, ninguém atende | a posição de atendimento vazia |
| `04-promessa-contrato.webp` | (04) Te prometem o que não está no contrato | o contrato e a caneta sobre a mesa |

**Formato:** gere em **16:9, 1600 × 900**. O navegador recorta para a banda
(`object-fit:cover`, foco em 50% 45%), então deixe o assunto no meio vertical e
o **canto superior esquerdo vazio**, que é onde fica a plaquinha `(01)`.

**Depois de gerar**, converta e coloque nesta pasta com o nome exato da tabela:

```
cwebp -q 82 01-grupo-errado.png -o 01-grupo-errado.webp
```

## A direção

Institucional, de banco de imagens: escritório moderno, luz de janela, gente em
traje profissional, enquadramento limpo e muito espaço sobrando. Decisão do
Lucas em 17/09, por cima do veto de stock no briefing.

⚠️ Foto institucional é **clara** e a banda vive num painel preto. Quem concilia
é o componente, não a foto: `.pvfig img` já dessatura, puxa para o quente da
página e afunda a base até o preto. Ou seja, **pode gerar claro à vontade**, não
force foto escura para tentar casar com o fundo.

## Os quatro prompts

### 01 · `01-grupo-errado.webp`

> A group of diverse business people of clearly different ages and profiles
> seated apart in a modern office waiting area: a senior executive in a tailored
> suit, a young couple in smart casual clothes holding a folder, a woman in her
> sixties, a man in a company polo shirt. All of them waiting in the same room,
> looking toward the same closed meeting room door. Candid, nobody posing for the
> camera. Professional corporate stock photography, institutional business
> imagery, photorealistic, modern Brazilian office interior, clean minimal
> architecture, large windows with soft natural daylight, warm neutral color
> grade, muted palette of warm grey, oak and bone white, crisp and polished, high
> production value, shallow depth of field, full frame camera with a 35mm lens,
> calm professional mood, generous negative space, empty space in the upper left
> corner, uncluttered, no text, no logos, no watermark, no signage, no blue color
> cast, no neon, no lens flare, no HDR, no heavy grain, 16:9

### 02 · `02-porta-unica.webp`

> A modern corporate office corridor lined with a row of identical glass and oak
> meeting room doors, all of them closed except the farthest one, which stands
> open with daylight coming through. Nobody in frame. Clean one point
> perspective, polished floor, minimal architecture. Professional corporate stock
> photography, institutional business imagery, photorealistic, modern Brazilian
> office interior, large windows with soft natural daylight, warm neutral color
> grade, muted palette of warm grey, oak and bone white, crisp and polished, high
> production value, full frame camera with a 35mm lens, calm professional mood,
> generous negative space, empty space in the upper left corner, uncluttered, no
> text, no logos, no watermark, no signage, no blue color cast, no neon, no lens
> flare, no HDR, no heavy grain, 16:9

### 03 · `03-sem-atendimento.webp`

> An empty customer service workstation in a modern open plan office at the end
> of the day: the chair pushed back and unoccupied, a headset resting on the
> clean desk, the monitor dark, everything tidy. Nobody in frame, the rest of the
> floor out of focus behind. Professional corporate stock photography,
> institutional business imagery, photorealistic, modern Brazilian office
> interior, clean minimal architecture, soft natural daylight from a large window
> on one side, warm neutral color grade, muted palette of warm grey, oak and bone
> white, crisp and polished, high production value, shallow depth of field, full
> frame camera with a 35mm lens, calm professional mood, generous negative space,
> empty space in the upper left corner, uncluttered, no text, no logos, no
> watermark, no signage, no blue color cast, no neon, no lens flare, no HDR, no
> heavy grain, 16:9

### 04 · `04-promessa-contrato.webp`

> A printed business contract lying on a clean desk in a modern office with a
> slim pen resting beside it, photographed close and slightly from above. The
> fine print is visible as texture but completely illegible, and the signature
> line sits in the lower part of the frame. Nothing else on the desk, no hands in
> frame. Professional corporate stock photography, institutional business
> imagery, photorealistic, modern Brazilian office interior, soft natural
> daylight from one side, warm neutral color grade, muted palette of warm grey,
> oak and bone white, crisp and polished, high production value, shallow depth of
> field, full frame camera with a 50mm lens, calm professional mood, generous
> negative space, empty space in the upper left corner, uncluttered, no readable
> words, no logos, no watermark, no blue color cast, no neon, no lens flare, no
> HDR, no heavy grain, 16:9

## O que NÃO pode aparecer

Mesmo em linguagem de banco de imagens, quatro vetos do briefing continuam de pé
e reprovam a arte na hora: gente **sorrindo para a câmera**, azul corporativo,
brilho/degradê/neon ou cara de render 3D, e qualquer texto ou logo legível.
Também não entra nada que sugira contemplação garantida.

As quatro têm que parecer **o mesmo ensaio**: mesma luz de janela, mesma paleta
quente e sem cor saturada, mesmo grau de espaço vazio. O vermelho da marca
(`#E2050F`) já entra por cima, no degradê do próprio componente. Não peça
vermelho na geração.
