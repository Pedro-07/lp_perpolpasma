/*
  Os 8 sabores confirmados (Secao 14 do SPEC).

  Cores: `colorsFromSpec` diz de onde a cor veio.

  false — medida a conta-gotas no packshot real, regiao central do pack,
          mediana de amostra. Tem pulpTop E pulpBase, os dois medidos, entao
          a queda de luz do topo para a base e a real.
  true  — ainda e o chute da tabela provisoria do SPEC. So tem pulpTop; a
          base sai derivada, escurecendo o topo.

  Medidos em 12/08/2026: bacuri, goiaba, manga, acerola, morango, uva.
  Faltam maracuja e abacaxi — os packshots deles chegaram em 17/08/2026, entao
  agora ha de onde medir. Ate la, cor de tabela.
*/

export type FlavorId =
  | 'bacuri'
  | 'goiaba'
  | 'manga'
  | 'maracuja'
  | 'morango'
  | 'uva'
  | 'acerola'
  | 'abacaxi'

export interface Flavor {
  id: FlavorId
  /** Nome como aparece na interface. */
  name: string
  /*
    Topo da camada 2, e a cor representativa do sabor: e ela que vai para a
    custom property --pulp, lida pela particula do canvas e pelo fundo da
    secao ativa, onde so cabe uma cor.
  */
  pulpTop: string
  /*
    Base da camada 2 — o fundo do gradiente vertical, onde a luz ja caiu.

    So existe onde foi MEDIDA. Ausente, o Pack deriva escurecendo o topo, o
    que e aproximacao: nos tres medidos a queda real ficou perto de 87% por
    canal, e a derivacao usa exatamente isso. Aproximacao nao vira dado —
    quando a medicao chegar, o campo aparece e a derivacao sai de cena.
  */
  pulpBase?: string
  /** Somente detalhe: linha, numero, selo. Nunca area grande. */
  accent: string
  /** true = cor ainda vem da tabela provisoria do SPEC, nao do packshot. */
  colorsFromSpec: boolean
  /*
    Packshot real recortado. OBRIGATORIO desde 18/08/2026, quando os oito
    sabores passaram a ter foto.

    Enquanto era opcional, existia um caminho alternativo — a composicao de 3
    camadas — que hoje esta em docs/arquivo/. Com foto em todos, o campo
    opcional so guardava um ramo que nunca mais executa.
  */
  photo: string
  /*
    Calibracao manual da foto dentro do palco da S6, no lugar de normalizar os
    arquivos — o alinhamento automatico foi tentado e nao convergiu (Secao 4).

    photoScale   — 1 e o tamanho que o object-contain deu, sem ajuste.
    photoOffsetY — percentual da altura do palco; negativo sobe.

    So valem no palco da S6, e so para quem esta no elenco do heroi. O card do
    catalogo ignora os dois: la a caixa e outra e cada pack aparece sozinho.

    Fechados pelo Pedro no painel de src/dev/ em 11/08/2026. Morango ficou em
    1 e 0 por ser a referencia contra a qual os outros dois foram ajustados —
    nao por falta de calibracao. Bacuri e uva estao em 1 e 0 porque nunca
    foram calibrados: nao estao no heroi, entao os numeros nao sao lidos.
  */
  photoScale?: number
  photoOffsetY?: number
}

export const FLAVORS: readonly Flavor[] = [
  {
    id: 'bacuri',
    name: 'Bacuri',
    pulpTop: '#FAD163',
    pulpBase: '#E4B84F',
    accent: '#C9A227',
    colorsFromSpec: false,
    photo: '/pack/photos/bacuri.webp',
    photoScale: 1,
    photoOffsetY: 0,
  },
  {
    id: 'goiaba',
    name: 'Goiaba',
    pulpTop: '#F16D49',
    pulpBase: '#D05C3F',
    accent: '#E8506F',
    colorsFromSpec: false,
    photo: '/pack/photos/goiaba.webp',
    photoScale: 1,
    photoOffsetY: 0,
  },
  {
    id: 'manga',
    name: 'Manga',
    pulpTop: '#FBBB02',
    pulpBase: '#E2A002',
    accent: '#E07B00',
    colorsFromSpec: false,
    photo: '/pack/photos/manga.webp',
    photoScale: 1.03,
    photoOffsetY: 0.5,
  },
  {
    /*
      PENDENCIA — o rotulo deste packshot e de outra geracao de arte.

      Os outros sete trazem o bloco "100% DE POLPA" e a mesma diagramacao. O
      do maracuja tem fundo amarelo, nome em manuscrito, tabela nutricional e
      modo de preparo impressos na frente, e nao traz aquele bloco. Nao e
      defeito de arquivo.

      Confirmar com a cliente se e a embalagem ATUAL — se for, os outros sete
      e que estao desatualizados no site; se nao for, este packshot precisa
      ser refeito. Lado a lado no catalogo, ele e o que destoa.
    */
    id: 'maracuja',
    name: 'Maracujá',
    pulpTop: '#F0B429',
    accent: '#D98A00',
    colorsFromSpec: true,
    photo: '/pack/photos/maracuja.webp',
    photoScale: 1,
    photoOffsetY: 0,
  },
  {
    id: 'morango',
    name: 'Morango',
    pulpTop: '#E45254',
    pulpBase: '#D44B4C',
    accent: '#C22B4E',
    colorsFromSpec: false,
    photo: '/pack/photos/morango.webp',
    photoScale: 1,
    photoOffsetY: 0,
  },
  {
    /*
      O roxo da uva e cor de produto, nao decisao de interface.
      A regra "THE LILA BAN" continua valendo para toda a UI (Secao 3).
    */
    id: 'uva',
    name: 'Uva',
    pulpTop: '#3C1834',
    pulpBase: '#2F1129',
    accent: '#4A1D38',
    colorsFromSpec: false,
    photo: '/pack/photos/uva.webp',
    photoScale: 1,
    photoOffsetY: 0,
  },
  {
    id: 'acerola',
    name: 'Acerola',
    pulpTop: '#AF151B',
    pulpBase: '#A6141A',
    accent: '#A81E1E',
    colorsFromSpec: false,
    photo: '/pack/photos/acerola.webp',
    photoScale: 1.015,
    photoOffsetY: 0,
  },
  {
    id: 'abacaxi',
    name: 'Abacaxi',
    pulpTop: '#F2C230',
    accent: '#D4A017',
    colorsFromSpec: true,
    photo: '/pack/photos/abacaxi.webp',
    photoScale: 1,
    photoOffsetY: 0,
  },
]

/*
  Sabores da cena heroi na Fase 1, nesta ordem (Secao 7).

  Elenco e ordem definidos pelo Pedro: o elenco em 11/08/2026, quando a leva
  nova de packshots chegou sem goiaba, e a ordem em 12/08/2026.

  Criterio dele: saturacao crescente, terminando no mais intenso.

  Reconferido em 12/08/2026 contra as cores MEDIDAS, que e o que vale — o
  primeiro calculo tinha usado as provisorias de morango e acerola. Croma
  OKLCh 0,170 / 0,182 / 0,185 e luminosidade 0,83 / 0,64 / 0,48: crescente e
  decrescente na ordem certa, entao o criterio se manteve.

  Mas a margem final encolheu de 0,024 para 0,0036 entre morango e acerola.
  Em croma os dois praticamente empataram; quem separa a dupla agora e a
  luminosidade, nao a saturacao. Trocar a ordem dos dois seria quase
  imperceptivel pelo criterio declarado.

  Em saturacao HSV a ordem NAO seria crescente (0,99, 0,64, 0,81). A metrica
  que vale aqui e a perceptual, que e a mesma familia do oklab que o fundo da
  S6 usa no color-mix.
*/
export const HERO_FLAVOR_IDS: readonly FlavorId[] = [
  'manga',
  'morango',
  'acerola',
]

/*
  Sabor do pack da S1, fixo e independente do elenco do heroi.

  Ate 11/08/2026 a S1 desenhava HERO_FLAVORS[0], o que amarrava a primeira
  tela do site a uma decisao de outra secao: mudar o elenco da S6 mudava a
  cor da abertura sem ninguem ter pedido. Bacuri esta aqui porque e o que
  ninguem fora do Maranhao tem (Secao 6) — razao que continua valendo mesmo
  com ele fora do heroi.
*/
export const OPENING_FLAVOR_ID: FlavorId = 'bacuri'

/*
  Leque da S1: tres packs, o do meio na frente. Pedido em 17/08/2026.

  Bacuri no centro porque continua sendo o sabor de abertura, pela razao de
  sempre — e o que ninguem fora do Maranhao tem.

  Uva e acerola nas laterais, decisao do Pedro em 17/08/2026: a manga saiu e a
  acerola entrou. Vale saber o que isso muda no trio, para nao parecer
  regressao mais tarde — a manga era dourada e dava o contraste quente contra
  o roxo; a acerola e vermelho escuro, entao as duas laterais agora sao
  escuras e o creme do bacuri no meio ficou sendo o unico ponto claro. E
  composicao mais fechada e mais simetrica, nao mais fraca.

  A acerola tambem e o sabor fundador: foi o que se plantou em 1994 e o que
  virou a primeira polpa em 1996.

  A ordem do array e a ordem visual, da esquerda para a direita.

  So sabor com packshot QUADRADO entra: o abacaxi veio em 0,757 e apareceria
  num tamanho diferente dos vizinhos dentro do mesmo leque.
*/
export const OPENING_FAN_IDS: readonly FlavorId[] = ['uva', 'bacuri', 'acerola']

/*
  A cena heroi e crossfade de foto real, entao sabor sem packshot nao entra:
  cair para o pack composto em um so faria ele destoar no meio da sequencia.

  Sabor sem foto e IGNORADO, com aviso em dev, em vez de derrubar a pagina.
  Isso deixou de ser hipotese em 11/08/2026, quando a leva nova de packshots
  chegou sem goiaba e com quatro sabores que antes nao tinham foto. Enquanto
  o elenco do heroi nao for redecidido (Secao 7), a cena roda com os que
  sobraram — visivelmente incompleta, que e melhor que tela branca.
*/
export const HERO_FLAVORS: readonly Flavor[] = HERO_FLAVOR_IDS.map((id) => {
  const flavor = FLAVORS.find((f) => f.id === id)
  if (!flavor) throw new Error(`Sabor heroi desconhecido: ${id}`)
  return flavor
})

if (import.meta.env.DEV && HERO_FLAVORS.length !== HERO_FLAVOR_IDS.length) {
  const semFoto = HERO_FLAVOR_IDS.filter(
    (id) => !HERO_FLAVORS.some((f) => f.id === id),
  )
  console.warn(
    `[perpolpas] cena heroi rodando incompleta: ${semFoto.join(', ')} ` +
      'sem packshot. Decidir o elenco em HERO_FLAVOR_IDS (SPEC, Secao 7).',
  )
}

export function getFlavor(id: FlavorId): Flavor {
  const flavor = FLAVORS.find((f) => f.id === id)
  if (!flavor) throw new Error(`Sabor desconhecido: ${id}`)
  return flavor
}

export const OPENING_FLAVOR: Flavor = getFlavor(OPENING_FLAVOR_ID)

export const OPENING_FAN: readonly Flavor[] = OPENING_FAN_IDS.map(getFlavor)

/*
  ============================================================
  Conversao de cor em oklab. So o necessario, e so por um motivo:
  a queda de luz do pack precisa ser aplicada em espaco perceptual.
  ============================================================

  Escalar L, a e b por um fator em oklab e a mesma operacao que
  `color-mix(in oklab, cor X%, black)`. A conta fica aqui, e nao no CSS,
  porque o fator e diferente para cada sabor: ele sai da medicao do proprio
  packshot, nao de um numero digitado.
*/

function srgbToLinear(c: number) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function linearToSrgb(c: number) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
}

function hexToOklab(hex: string): [number, number, number] {
  const [r, g, b] = [1, 3, 5].map((i) =>
    srgbToLinear(parseInt(hex.slice(i, i + 2), 16) / 255),
  )
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

function oklabToHex([L, A, B]: [number, number, number]): string {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
  return `#${rgb
    .map((c) => {
      const v = Math.round(linearToSrgb(Math.min(1, Math.max(0, c))) * 255)
      return Math.min(255, Math.max(0, v)).toString(16).padStart(2, '0')
    })
    .join('')
    .toUpperCase()}`
}

/** Um passo da queda de luz: escurece mantendo o matiz e a relacao de croma. */
function stepDown(hex: string, factor: number): string {
  const [L, A, B] = hexToOklab(hex)
  return oklabToHex([L * factor, A * factor, B * factor])
}

/*
  Queda de luz do topo para a base de cada sabor, em L do oklab. Sai da
  medicao — nao e numero digitado. Os seis medidos ficam entre 0,856 (uva) e
  0,963 (acerola).
*/
const FALLOFFS = FLAVORS.filter((f) => f.pulpBase).map(
  (f) => hexToOklab(f.pulpBase as string)[0] / hexToOklab(f.pulpTop)[0],
)

/** Media dos medidos, para os sabores que ainda nao tem packshot. */
const MEAN_FALLOFF = FALLOFFS.reduce((a, b) => a + b, 0) / FALLOFFS.length

function falloffOf(flavor: Flavor): number {
  if (!flavor.pulpBase) return MEAN_FALLOFF
  return hexToOklab(flavor.pulpBase)[0] / hexToOklab(flavor.pulpTop)[0]
}

/** Base do gradiente da camada 2: medida quando existe, derivada quando nao. */
export function pulpBaseOf(flavor: Flavor): string {
  return flavor.pulpBase ?? stepDown(flavor.pulpTop, MEAN_FALLOFF)
}

/*
  Quantos passos da propria queda de luz a particula do canvas desce a partir
  da base. TRES, e o numero nao foi escolhido a olho — ele maximiza o pior
  caso do site inteiro.

  O problema: a particula le a cor do sabor ativo e flutua sobre um fundo
  derivado da mesma cor. Nos sabores claros ela quase sumia — bacuri a 1,05
  de contraste, manga a 1,07. Usar a base ja ajuda, mas nao resolve.

  O contrapeso: escurecer ajuda na S6, cujo fundo e claro, e ATRAPALHA na S1,
  cujo fundo e o verde profundo da marca. Cada passo sobe um lado e desce o
  outro, entao existe um otimo, e ele e calculavel.

  Piso de contraste no alfa medio, por numero de passos:

    passos   S6 (pior sabor)   S1 (verde)   neutro   PIOR
      0           1,201          1,955      1,208    1,201
      1           1,289          1,738      1,304    1,289
      2           1,383          1,583      1,408    1,383
      3           1,476          1,440      1,511    1,440  <-- otimo
      4           1,572          1,316      1,607    1,316
      5           1,660          1,202      1,694    1,202

  No quarto passo a S1 vira o pior caso e o piso volta a cair. 1,44 e o teto
  do que este mecanismo alcanca sem introduzir fator estranho ao sistema —
  por isso e o minimo do projeto, e nao um numero de gosto.
*/
export const PARTICLE_FALLOFF_STEPS = 3

/** Contraste minimo da particula sobre o fundo, no alfa medio. Ver acima. */
export const PARTICLE_MIN_CONTRAST = 1.44

/*
  Cor da particula: a polpa na sombra, tres passos abaixo da base.

  Mantem o sistema inteiro — polpa escura sobre polpa clara — em vez de somar
  um preto arbitrario por cima. Cada sabor desce pela propria queda medida,
  entao a uva e o bacuri nao escurecem na mesma proporcao.
*/
export function pulpParticleOf(flavor: Flavor): string {
  const factor = falloffOf(flavor) ** PARTICLE_FALLOFF_STEPS
  return stepDown(pulpBaseOf(flavor), factor)
}

/*
  Escuro do sabor, para o nome dele na cena heroi.

  Preto puro sobre o fundo tingido fica duro: o fundo pertence ao sabor e a
  tipografia nao, entao a letra parece colada por cima. Este escuro nasce da
  propria cor — mesmo matiz, luminosidade baixa fixa e croma reduzido.

  L fixo e nao proporcional de proposito: assim o nome tem o mesmo peso otico
  em todos os sabores, mesmo com a uva partindo de um topo quase preto e a
  manga de um amarelo. Croma a 55% para nao virar letra neon.

  Piso de contraste medido contra o fundo de cada sabor: 8,20:1, acima de AAA.
  Preto puro dava 10,82:1 — a folga que se perde compra a integracao, e o nome
  e tipografia de display gigante, onde a norma pediria 3:1.
*/
const INK_LIGHTNESS = 0.3
const INK_CHROMA = 0.55

export function pulpInkOf(flavor: Flavor): string {
  const [, A, B] = hexToOklab(flavor.pulpTop)
  return oklabToHex([INK_LIGHTNESS, A * INK_CHROMA, B * INK_CHROMA])
}

/*
  Estado "nenhum sabor ativo".

  Fora da cena heroi nao existe sabor, e a cor nao pode ficar congelada no
  ultimo que passou — a S7 herdaria a manga e os oito cards apareceriam sobre
  fundo de manga, que e exatamente a inconsistencia de marca que o site existe
  para corrigir (Secao 5).

  NEUTRAL_PULP e o verde da marca a 30% sobre o off-white, misturado em sRGB
  linear. Derivado, nao escolhido: se o verde mudar, este numero se recalcula
  pela mesma conta.
*/
export const NEUTRAL_PULP = '#D3D8CD'

/*
  Neutro derivado pela mesma queda media dos packs medidos, nao digitado —
  se a media mudar quando maracuja e abacaxi forem fotografados, estes dois
  se recalculam sozinhos.
*/
export const NEUTRAL_PULP_BASE = stepDown(NEUTRAL_PULP, MEAN_FALLOFF)
export const NEUTRAL_PULP_PARTICLE = stepDown(
  NEUTRAL_PULP_BASE,
  MEAN_FALLOFF ** PARTICLE_FALLOFF_STEPS,
)

/** Sem sabor ativo, o nome volta ao tom de texto padrao do projeto. */
export const NEUTRAL_PULP_INK = '#14150F'

/** Detalhe sem sabor ativo volta a ser o verde da marca, sem mistura. */
export const NEUTRAL_ACCENT = '#167012'

/** Formato fisico do pack. Unico dado de produto que o SPEC afirma. */
export const PACK = {
  units: 5,
  unitGrams: 100,
  totalGrams: 500,
} as const
