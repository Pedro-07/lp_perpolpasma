import { PACK, type Flavor } from '@/data/flavors'

/*
  Packshots reais da cena heroi (Secao 4 do SPEC).

  Separado de pack-assets.ts de proposito: aquele arquivo configura a
  composicao de 3 camadas, que agora e assunto do catalogo. Herói e foto,
  catalogo e composicao, e os dois nao compartilham mais numero nenhum.
*/

/*
  Proporcao da caixa de palco da S6 — largura / altura.

  1,0 porque a leva de packshots de 11/08/2026 e quadrada: 1254x1254 nos
  cinco arquivos, com o pack centralizado e uma margem de folga em volta.
  Palco quadrado para foto quadrada, entao o object-contain nao sobra de
  lado nem de cima.

  A leva anterior era recortada no bbox do alpha, com tres proporcoes
  diferentes (0,775 / 0,692 / 0,834), e este numero era a mais estreita
  delas para nenhuma cortar. Se algum dia chegar packshot fora do quadrado,
  e essa a regra que volta a valer: a mais estreita do conjunto.

  Cuidado ao mexer: o pack ocupa cerca de 88% do quadrado, entao o tamanho
  aparente do produto e ~0,88 do palco, nao 1,0.
*/
export const HERO_STAGE_RATIO = 1

/*
  Altura do palco. O valor mora no CSS, com media query, porque e decisao de
  layout por breakpoint e nao cabe em style inline — ver :root em
  styles/index.css, que tambem explica a divisao de responsabilidade.

  A constante aqui e so o nome, para o painel de dev saber onde escrever.
*/
export const HERO_STAGE_HEIGHT_VAR = '--pack-stage-h'

/*
  Largura do palco: o menor entre a coluna disponivel e o que a altura
  permite. Com aspect-ratio junto, a altura nunca passa de --pack-stage-h e o
  pack nunca estoura a coluna no celular.
*/
export const HERO_STAGE_WIDTH = `min(100%, calc(var(${HERO_STAGE_HEIGHT_VAR}) * ${HERO_STAGE_RATIO}))`

/** Valores de partida. Iguais a "nao calibrado" — ver painel em src/dev/. */
const UNCALIBRATED = { scale: 1, offsetY: 0 } as const

/*
  Ponto unico onde o default da calibracao existe. Componente de cena e painel
  de dev leem daqui: dois defaults divergentes fariam o painel mostrar um
  numero e a tela desenhar outro, que e o unico jeito de esta calibracao
  produzir valor errado.
*/
export function photoCalibration(flavor: Flavor) {
  return {
    scale: flavor.photoScale ?? UNCALIBRATED.scale,
    offsetY: flavor.photoOffsetY ?? UNCALIBRATED.offsetY,
  }
}

/** Nomes das custom properties que o painel de dev sobrescreve no elemento. */
export const PHOTO_SCALE_VAR = '--photo-scale'
export const PHOTO_OFFSET_VAR = '--photo-offset-y'

/*
  Os dois rastros que o painel de dev deixa no codigo de producao. Sao dois
  atributos de dado e nada mais: apagar src/dev/ nao quebra nada aqui.

  CALIBRATION — na <img>, onde o painel escreve as custom properties acima.
  LAYER       — no wrapper de opacidade, alvo dos modos sobrepor e solo.
*/
export const PHOTO_CALIBRATION_ATTR = 'data-photo-calibration'
export const PHOTO_LAYER_ATTR = 'data-photo-layer'

/*
  Rotulos acessiveis do pack fotografado. As <img> sao aria-hidden porque tres
  fotos empilhadas em crossfade dariam ao leitor de tela tres descricoes de
  produto simultaneas, duas delas invisiveis na tela. Quem descreve e o palco,
  uma vez so.
*/

/** Galeria de reduced-motion: uma foto por sabor, cada uma se descreve. */
export function packPhotoLabel(flavorName: string) {
  return `Pack de polpa de ${flavorName}, ${PACK.units} unidades de ${PACK.unitGrams} gramas`
}

/*
  Palco do crossfade: a descricao nao cita sabor de proposito. Ela ficaria
  estatica enquanto a imagem troca — mentira para quem depende dela. Os nomes
  dos tres sabores ja estao no texto ao lado, que e onde essa informacao vive.
*/
export const PACK_PHOTO_STAGE_LABEL = `Pack de polpa Perpolpas, ${PACK.units} unidades de ${PACK.unitGrams} gramas`
