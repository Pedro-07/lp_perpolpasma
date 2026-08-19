import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches
}

/*
  Kill switch em JS do que o CSS nao alcanca: ScrollTrigger, Lenis e canvas.

  useSyncExternalStore em vez de useState + useEffect porque a preferencia pode
  mudar com o site aberto, e porque assim nao existe o frame inicial em que o
  componente acha que o movimento esta liberado.
*/
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
