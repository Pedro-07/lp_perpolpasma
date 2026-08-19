import { useEffect, useRef, type ReactNode } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { LenisContext } from './lenis-context'

/*
  Integracao Lenis + ScrollTrigger.

  Sem isto o scrub visivelmente corre atras do dedo. Sao tres amarracoes:

  1. lenis.on('scroll', ScrollTrigger.update)
     O Lenis nao move o scroll nativo do jeito que o ScrollTrigger espera —
     ele interpola sua propria posicao. Sem o aviso explicito, o ScrollTrigger
     so recalcula no evento nativo, que chega mais raro e defasado.

  2. Lenis dirigido pelo ticker do GSAP, com autoRaf desligado.
     Se cada um roda seu proprio requestAnimationFrame, a ordem entre os dois
     nao e garantida dentro do frame. Metade das vezes a timeline le a posicao
     do frame anterior — um frame de atraso constante, que e o "lag" que se ve.
     Um loop so resolve por construcao.

  3. gsap.ticker.lagSmoothing(0), em lib/gsap.ts.

  Sob prefers-reduced-motion nada disso e montado: scroll nativo, sem Lenis.
*/
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (prefersReducedMotion) return

    const lenis = new Lenis({ autoRaf: false })
    lenisRef.current = lenis

    lenis.on('scroll', ScrollTrigger.update)

    // O ticker do GSAP entrega tempo em segundos; o Lenis espera milissegundos.
    const drive = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(drive)

    return () => {
      gsap.ticker.remove(drive)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [prefersReducedMotion])

  return <LenisContext value={lenisRef}>{children}</LenisContext>
}
