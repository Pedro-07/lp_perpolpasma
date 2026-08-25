import { PackPhoto } from '@/features/pack/PackPhoto'
import { PackShine } from './PackShine'
import {
  HERO_STAGE_RATIO,
  packPhotoLabel,
} from '@/features/pack/pack-photos'
import { OPENING_FAN } from '@/data/flavors'

/*
  Leque de packs da S1. Pedido em 17/08/2026, e revoga a decisao anterior de
  manter um pack so — que estava registrada no SPEC como "mais de um pack vira
  vitrine e antecipa a cena heroi".

  Tres posicoes: um no meio, dois nas laterais. O do meio na frente, os das
  laterais girados para fora e menores, saindo por tras dele.

  A origem do transform e a base, e nao o centro: girar pelo centro abre as
  cartas como um lance de baralho no ar; girar pela base as apoia na mesma
  linha, que e como um leque de verdade se abre.

  So transform, entao o custo e de composicao e nada disso repinta.
*/

/*
  GEOMETRIA COM CONTA, e nao a olho — revisada em 17/08/2026 porque o leque
  estava sendo cortado, principalmente no mobile.

  O que cortava: o pack lateral e deslocado E girado, e a soma das duas coisas
  passava da metade da caixa. Com 58% de largura e 62% de deslocamento, a
  borda externa caia em 65% do centro — 15 pontos fora da caixa, que o
  overflow-clip da secao aparava.

  A conta, em fracao da largura da caixa, para o pack lateral:

    meia largura ja escalada   = LARGURA/2 x ESCALA          = 22,1%
    avanco do giro pela base   = LARGURA x ESCALA x sen(9)   =  6,9%
    deslocamento lateral       = LARGURA x DESLOCAMENTO      = 18,7%
    ----------------------------------------------------------------
    borda externa                                              47,7%

  47,7% < 50%, entao o leque inteiro cabe com folga de 2,3 pontos. Mexer em
  qualquer um dos quatro numeros exige refazer esta soma.

  O deslocamento diminuiu e a largura aumentou: os packs se sobrepoem mais e
  cada um fica maior, que e mais leque e menos tres packs enfileirados.
*/
const PACK_WIDTH_PERCENT = 52
const SIDE_SHIFT_PERCENT = 36
const SIDE_ANGLE_DEG = 9
const SIDE_SCALE = 0.85

/*
  Uma entrada por posicao, da esquerda para a direita. `depth` e o z-index:
  o do meio na frente, sempre.
*/
const POSITIONS = [
  { shiftPercent: -SIDE_SHIFT_PERCENT, angle: -SIDE_ANGLE_DEG, scale: SIDE_SCALE, depth: 10 },
  { shiftPercent: 0, angle: 0, scale: 1, depth: 20 },
  { shiftPercent: SIDE_SHIFT_PERCENT, angle: SIDE_ANGLE_DEG, scale: SIDE_SCALE, depth: 10 },
]

export function PackFan() {
  const middle = Math.floor(OPENING_FAN.length / 2)

  return (
    <div
      /*
        A caixa abraca o conteudo: a altura e a do pack do meio, que e o mais
        alto. Sobra vertical aqui vira espaco morto entre o leque e o texto,
        e no mobile isso empurrava o resto da hero para fora da tela.
      */
      className="relative w-full"
      style={{ aspectRatio: 100 / PACK_WIDTH_PERCENT / HERO_STAGE_RATIO }}
    >
      {OPENING_FAN.map((flavor, i) => {
        const position = POSITIONS[i] ?? POSITIONS[middle]
        const isMiddle = i === middle

        return (
          <div
            key={flavor.id}
            role="img"
            aria-label={packPhotoLabel(flavor.name)}
            className="absolute bottom-0 left-1/2"
            style={{
              width: `${PACK_WIDTH_PERCENT}%`,
              aspectRatio: HERO_STAGE_RATIO,
              zIndex: position.depth,
              transformOrigin: 'bottom center',
              transform: `translateX(-50%) translateX(${position.shiftPercent}%) rotate(${position.angle}deg) scale(${position.scale})`,
            }}
          >
            {/*
              So o do meio e candidato a LCP e so ele leva brilho. Os das
              laterais carregam adiantados mas rebaixados, e um brilho em cada
              um seriam tres animacoes perpetuas para um efeito que o olho le
              como um.
            */}
            <PackPhoto
              flavor={flavor}
              lcp={isMiddle}
              priority={!isMiddle}
            />
            {isMiddle && <PackShine photo={flavor.photo} />}
          </div>
        )
      })}
    </div>
  )
}
