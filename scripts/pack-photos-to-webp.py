"""
Prepara os packshots master para o WebP que vai ao ar.

    python scripts/pack-photos-to-webp.py

Entrada:  assets-src/pack-photos/*.png   (masters, fora do git e fora do build)
Saida:    public/pack/photos/*.webp      (o que o site carrega)

Faz duas coisas: recorta o fundo branco, se o master nao tiver alpha, e
converte para WebP.


RECORTE — por que por conectividade e nao por limiar

A leva de 11/08/2026 veio em RGB, com fundo branco de estudio. Limiar global
nao resolve: o plastico translucido mede 248-254 e o fundo mede 251-255, e as
duas faixas se sobrepoem. Qualquer corte por brilho come a aba de plastico do
topo, que e quase branca na ponta.

O que separa os dois nao e o brilho, e a conectividade. O fundo e a regiao
clara que alcanca a borda da imagem; o plastico claro esta cercado pelas
proprias dobras, que sao mais escuras, e por isso nao e alcancado. Entao o
recorte e um preenchimento a partir da borda: so vira transparente o pixel
claro que tem caminho ate fora.

O LIMIAR SAI DE CADA ARQUIVO, e nao do codigo — ver derive_threshold.

Ele comecou fixo em 250, medido na segunda leva: entre 248 e 252 a area
recortada nao mudava nos cinco arquivos, e em 253 comecava a vazar. A terceira
leva quebrou isso de duas formas ao mesmo tempo, em 17/08/2026:

  - o fundo do maracuja e #F8F8F8, abaixo do 250 que servia aos outros;
  - e ele traz um XADREZ DE TRANSPARENCIA desenhado nos pixels, alternando
    248 e 253, sobra de um export com o fundo quadriculado visivel.

Com limiar fixo, o corte removia os quadrados claros e mantinha os escuros: o
arquivo saia furado, com 104 mil pixels de alfa parcial contra os 3 mil dos
outros, e ninguem recebia erro. Medir o fundo em cada arquivo resolve os dois
casos de uma vez.

Conferido a 5x contra magenta e contra preto — o teste duro para franja branca
— e o contorno saiu limpo, com as abas de plastico inteiras.


DESCONTAMINACAO DE COR

O pixel de contorno e mistura de produto com o branco do fundo. Mantido
opaco, ele vira franja clara. Onde da para estimar a cor do produto na
vizinhanca com contraste suficiente, a mistura e resolvida e o pixel volta a
cor real; onde o plastico e claro demais para essa conta ser estavel, o pixel
fica como esta. Isso e deliberado: sobre o fundo claro da S6, franja clara
nao aparece, e chutar cor ali produziria borda suja.


WEBP — q82, method=6

O libwebp comprime alpha SEM PERDAS por padrao, entao o recorte nao degrada
com a compressao: medido na leva anterior, diferenca maxima de alpha igual a
zero em todos os pixels. A perda existe so no RGB.

Se um packshot novo chegar, jogue o master na pasta de entrada e rode. Master
que ja vier com alpha passa direto pelo recorte.
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

QUALITY = 82
METHOD = 6
BUDGET_KB = 1200

# Folga abaixo do branco medido em cada arquivo. Ver derive_threshold.
THRESHOLD_MARGIN = 7
# Suavizacao do contorno, em pixels. Acima de 1 o contorno comeca a borrar.
FEATHER = 0.7
# Fecha vazamento fino sem arredondar canto, em pixels.
CLOSE = 2
# Abaixo deste contraste contra o branco, a conta de mistura fica instavel.
UNMIX_MIN_CONTRAST = 12.0

# Canvas padrao. Veio da segunda leva e virou a regua do projeto.
TARGET_CANVAS = 1254
# Altura do pack dentro do canvas — mediana medida nos sete que ja batem.
TARGET_PACK_HEIGHT = 0.974

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-src" / "pack-photos"
DST = ROOT / "public" / "pack" / "photos"


def _propagate(marked, cand, axis):
    """Dentro de cada corrida contigua de `cand`, marcado contamina a corrida.

    E o que torna o preenchimento viavel em numpy: em vez de andar pixel a
    pixel, cada passada resolve corridas inteiras de uma vez.
    """
    if axis == 0:
        marked, cand = marked.T, cand.T
    h, _ = cand.shape
    seg = np.cumsum(~cand, axis=1)
    stride = int(seg.max()) + 1
    key = np.arange(h)[:, None] * stride + seg
    hit = np.bincount(key[cand], weights=marked[cand], minlength=h * stride) > 0
    out = np.where(cand, hit[key], marked)
    return out.T if axis == 0 else out


def flood_from_border(cand):
    """Fundo = candidato COM caminho ate a borda da imagem."""
    marked = np.zeros_like(cand)
    marked[0, :] = cand[0, :]
    marked[-1, :] = cand[-1, :]
    marked[:, 0] = cand[:, 0]
    marked[:, -1] = cand[:, -1]
    while True:
        before = marked.sum()
        marked = _propagate(marked, cand, 1)
        marked = _propagate(marked, cand, 0)
        if marked.sum() == before:
            return marked


def _box_sum(a, radius):
    """Soma em janela quadrada por imagem integral. PIL nao filtra modo F."""
    pad = np.pad(a.astype(np.float64), radius + 1, mode="edge")
    integral = pad.cumsum(0).cumsum(1)
    k = 2 * radius + 1
    h, w = a.shape
    return (
        integral[k : k + h, k : k + w]
        - integral[0:h, k : k + w]
        - integral[k : k + h, 0:w]
        + integral[0:h, 0:w]
    )


def derive_threshold(lum):
    """Limiar tirado do proprio arquivo.

    A moda dos quatro cantos e o branco daquele estudio. O corte desce uma
    folga a partir dela, o que cobre tanto fundo mais escuro quanto fundo
    quadriculado — desde que o xadrez inteiro caiba dentro da folga.

    Numero fixo no codigo falha CALADO quando a leva muda: nao ha erro, so um
    arquivo publicado errado.
    """
    corner = 30
    corners = np.concatenate(
        [
            lum[:corner, :corner].ravel(),
            lum[:corner, -corner:].ravel(),
            lum[-corner:, :corner].ravel(),
            lum[-corner:, -corner:].ravel(),
        ]
    )
    values, counts = np.unique(np.round(corners), return_counts=True)
    return float(values[counts.argmax()]) - THRESHOLD_MARGIN


def remove_white_background(image):
    rgb = np.asarray(image.convert("RGB")).astype(np.float32)
    lum = rgb.mean(axis=2)

    background = flood_from_border(lum >= derive_threshold(lum))
    foreground = ~background

    # Buraco interno branco (o branco do rotulo) nunca foi fundo: nao alcanca
    # a borda. O fechamento aqui e so contra vazamento fino de contorno.
    if CLOSE:
        m = Image.fromarray((foreground * 255).astype(np.uint8), "L")
        m = m.filter(ImageFilter.MaxFilter(CLOSE * 2 + 1))
        m = m.filter(ImageFilter.MinFilter(CLOSE * 2 + 1))
        foreground = np.asarray(m) > 127

    soft = Image.fromarray((foreground * 255).astype(np.uint8), "L")
    alpha = np.asarray(soft.filter(ImageFilter.GaussianBlur(FEATHER))) / 255.0

    # Cor do produto perto do contorno, para desfazer a mistura com o branco.
    weight = foreground.astype(np.float32)
    near = np.stack(
        [_box_sum(rgb[..., c] * weight, 3) for c in range(3)], axis=2
    )
    total = _box_sum(weight, 3)[..., None]
    near = np.divide(near, total, out=np.full_like(near, 255.0), where=total > 1e-3)

    contrast = 255.0 - near
    band = (alpha > 0.02) & (alpha < 0.98)
    band &= contrast.max(axis=2) >= UNMIX_MIN_CONTRAST

    estimated = np.divide(
        255.0 - rgb, contrast, out=np.zeros_like(rgb), where=contrast > 1e-3
    )
    strongest = np.argmax(contrast, axis=2)[..., None]
    alpha = np.where(
        band,
        np.clip(np.take_along_axis(estimated, strongest, axis=2)[..., 0], 0, 1),
        alpha,
    )

    a3 = alpha[..., None]
    unmixed = np.divide(
        rgb - 255.0 * (1.0 - a3), a3, out=rgb.copy(), where=a3 > 0.15
    )
    out = np.clip(np.where(a3 > 0.15, unmixed, rgb), 0, 255)

    return Image.fromarray(
        np.dstack([out, alpha * 255.0]).astype(np.uint8), "RGBA"
    )


def normalize_canvas(image):
    """Poe o pack na regua: canvas quadrado e altura padronizada.

    NAO gera pixel nenhum. Reescala o recorte e centraliza numa area
    transparente maior — o rotulo continua sendo o do arquivo original, byte
    por byte reamostrado, e nada e inventado. E por isso que isto e conta de
    canvas e nao trabalho de IA generativa: a Secao 2 do SPEC proibe gerar
    embalagem justamente porque modelo generativo destroi o texto do rotulo.

    Arquivo que ja esta na regua passa intocado.
    """
    alpha = np.asarray(image)[..., 3]
    rows = np.where(alpha.max(axis=1) > 10)[0]
    cols = np.where(alpha.max(axis=0) > 10)[0]
    if len(rows) == 0 or len(cols) == 0:
        return image

    pack_height = rows[-1] - rows[0] + 1
    target_height = TARGET_CANVAS * TARGET_PACK_HEIGHT
    scale = target_height / pack_height

    square = image.width == image.height == TARGET_CANVAS
    if square and abs(scale - 1) < 0.02:
        return image

    resized = image.resize(
        (max(1, round(image.width * scale)), max(1, round(image.height * scale))),
        Image.LANCZOS,
    )

    # Centraliza pelo PACK, nao pelo canvas: a margem do arquivo de origem nao
    # e simetrica, e centralizar pelo canvas herdaria o descentramento dela.
    canvas = Image.new("RGBA", (TARGET_CANVAS, TARGET_CANVAS), (0, 0, 0, 0))
    center_x = (cols[0] + cols[-1] + 1) / 2 * scale
    center_y = (rows[0] + rows[-1] + 1) / 2 * scale
    canvas.paste(
        resized,
        (round(TARGET_CANVAS / 2 - center_x), round(TARGET_CANVAS / 2 - center_y)),
    )
    return canvas


def has_alpha(image):
    if image.mode not in ("RGBA", "LA", "PA"):
        return False
    return np.asarray(image.convert("RGBA"))[..., 3].min() < 255


def main() -> int:
    if not SRC.is_dir():
        print(f"pasta de masters nao encontrada: {SRC}")
        return 1

    DST.mkdir(parents=True, exist_ok=True)
    masters = sorted(SRC.glob("*.png"))
    if not masters:
        print(f"nenhum master em {SRC}")
        return 1

    total = 0.0
    for master in masters:
        image = Image.open(master)
        source_alpha = has_alpha(image)
        prepared = (
            image.convert("RGBA") if source_alpha else remove_white_background(image)
        )
        before = f"{prepared.width}x{prepared.height}"
        prepared = normalize_canvas(prepared)
        resized = before != f"{prepared.width}x{prepared.height}"

        out = DST / (master.stem + ".webp")
        prepared.save(out, format="WEBP", quality=QUALITY, method=METHOD)

        kb = out.stat().st_size / 1024
        total += kb
        opaque = (np.asarray(prepared)[..., 3] > 250).mean() * 100
        print(
            f"{master.stem:10} {prepared.width}x{prepared.height}"
            f"{' (na regua)' if resized else '           '}  "
            f"{'alpha do master' if source_alpha else 'fundo recortado'}  "
            f"opaco {opaque:5.1f}%  "
            f"{master.stat().st_size / 1024:8.1f} KB PNG  ->  {kb:7.1f} KB WebP"
        )

    print(f"\ntotal: {total:.1f} KB", end="  ")
    print(
        "dentro do budget"
        if total < BUDGET_KB
        else f"ESTOURA o budget de {BUDGET_KB} KB"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
