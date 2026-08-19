import type { CSSProperties } from 'react'
import type { Flavor } from '@/data/flavors'
import {
  PHOTO_CALIBRATION_ATTR,
  PHOTO_OFFSET_VAR,
  PHOTO_SCALE_VAR,
  photoCalibration,
} from './pack-photos'

/*
  Packshot real de um sabor do heroi (Secao 4 do SPEC).

  O que este componente resolve e o desalinhamento entre arquivos: os tres
  packshots tem proporcoes diferentes de proposito, e a normalizacao
  automatica nao convergiu. Cada foto entra com object-contain no palco e
  recebe um transform de calibracao vindo do dado.

  A ordem do transform nao e arbitraria. translateY antes de scale deixa o
  deslocamento em percentual da altura do palco, independente da escala; na
  ordem inversa, mexer na escala desajustaria o offset ja calibrado e a
  calibracao nunca convergiria.

  Os dois numeros passam por custom property em vez de irem direto no
  transform: e o que permite ao painel de src/dev/ sobrescrever um valor sem
  reescrever a string inteira, e sem que exista codigo de dev no caminho de
  producao.
*/
export function PackPhoto({
  flavor,
  priority = false,
  lcp = false,
  calibrate = true,
  className = '',
}: {
  flavor: Flavor
  /** Sabor ativo e proximo carregam adiantado; o resto e lazy (Secao 7). */
  priority?: boolean
  /*
    Este pack e o maior elemento acima da dobra, entao ele decide o LCP —
    hoje, so o da S1. Carrega adiantado E com prioridade alta, ao contrario
    do `priority`, que carrega adiantado mas rebaixado justamente para nao
    disputar banda com este.
  */
  lcp?: boolean
  /*
    A calibracao pertence ao palco da S6 e so faz sentido la: ela e o ajuste
    de tres fotos umas contra as outras dentro daquela caixa. No card do
    catalogo, onde cada pack aparece sozinho e a caixa e outra, aplicar os
    mesmos numeros deslocaria a foto sem ninguem ter pedido.
  */
  calibrate?: boolean
  className?: string
}) {
  const { scale, offsetY } = calibrate
    ? photoCalibration(flavor)
    : { scale: 1, offsetY: 0 }

  const style = {
    [PHOTO_SCALE_VAR]: scale,
    [PHOTO_OFFSET_VAR]: `${offsetY}%`,
    transform: `translateY(var(${PHOTO_OFFSET_VAR})) scale(var(${PHOTO_SCALE_VAR}))`,
  } as CSSProperties

  /*
    O atributo so existe onde a calibracao vale. Sem esse cuidado, o painel de
    dev acharia tambem as fotos do catalogo e arrastaria os cards junto com o
    palco da S6.
  */
  const calibrationAttr = calibrate ? { [PHOTO_CALIBRATION_ATTR]: flavor.id } : {}

  return (
    <img
      {...calibrationAttr}
      src={flavor.photo}
      alt=""
      aria-hidden="true"
      decoding="async"
      loading={priority || lcp ? 'eager' : 'lazy'}
      /*
        Eager, mas nunca na frente da S1. Cada packshot passa de 170 KB
        (Secao 10) e a S6 esta longe da dobra: sem rebaixar a prioridade, o
        primeiro packshot disputa banda com o que decide o LCP em 4G.
      */
      fetchPriority={lcp ? 'high' : priority ? 'low' : 'auto'}
      className={`absolute inset-0 h-full w-full object-contain ${className}`}
      style={style}
    />
  )
}
