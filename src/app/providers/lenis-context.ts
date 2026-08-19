import { createContext, useContext, type RefObject } from 'react'
import type Lenis from 'lenis'

/*
  Acesso a instancia do Lenis.

  Exposto como ref, nao como state: a instancia troca no monte e no desmonte,
  e nao ha razao para re-renderizar a arvore quando isso acontece. Quem usa
  le no momento do gesto.

  Fica null sob prefers-reduced-motion, quando o Lenis nao e montado. Todo
  consumidor precisa tratar esse caso — nao e excecao, e o caminho normal
  para quem pediu menos movimento.
*/
export const LenisContext = createContext<RefObject<Lenis | null> | null>(null)

export function useLenisRef(): RefObject<Lenis | null> | null {
  return useContext(LenisContext)
}
