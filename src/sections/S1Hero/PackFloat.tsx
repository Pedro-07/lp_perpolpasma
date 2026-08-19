import { memo, useEffect, useRef, type ReactNode } from 'react'
import { gsap } from '@/lib/gsap'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/*
  Flutuacao perpetua do pack (Secao 5).

  Componente proprio e memoizado por exigencia da Secao 10: animacao que nunca
  termina nao pode viver dentro de um componente que re-renderiza por outro
  motivo, senao cada render reinicia o tween ou empilha um novo.

  Ele tambem e o dono exclusivo do `y` deste elemento. A entrada, o parallax
  de scroll e o parallax de mouse moram cada um em uma camada de fora — quatro
  wrappers aninhados, um por responsabilidade. Dois tweens no mesmo eixo do
  mesmo elemento se sobrescrevem, e o resultado seria o pack parado ou
  tremendo, dependendo de qual rodou por ultimo.
*/

/** Amplitude em pixels. Deslocamento pequeno e ciclo longo: respiro, nao balanco. */
const FLOAT_PX = 8
const FLOAT_SECONDS = 3.6

export const PackFloat = memo(function PackFloat({
  children,
}: {
  children: ReactNode
}) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Secao 11: sob reduced-motion o pack fica parado no estado final.
    if (prefersReducedMotion) return
    const element = ref.current
    if (!element) return

    const tween = gsap.to(element, {
      y: -FLOAT_PX,
      duration: FLOAT_SECONDS,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })

    return () => {
      tween.kill()
      gsap.set(element, { clearProps: 'transform' })
    }
  }, [prefersReducedMotion])

  return (
    <div ref={ref} className="will-change-transform">
      {children}
    </div>
  )
})
