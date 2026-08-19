import { memo, useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/*
  Brilho lento atravessando o pack — a sugestao de material vivo.

  MASCARA SOBRE A FOTO, NAO FILTRO NO CONTAINER. A faixa de luz e um elemento
  proprio, recortado pelo alpha do proprio packshot: ela so existe onde o pack
  existe, e nao vaza pelo retangulo. Filtro no container custaria repintura de
  toda a area a cada frame e ainda acenderia o fundo em volta.

  O unico atributo animado e o transform da faixa. A mascara e estatica.

  Memoizado, como toda animacao perpetua do projeto (Secao 10): sem isso, um
  render da S1 por qualquer motivo reiniciaria a travessia no meio.
*/

const CROSS_SECONDS = 4.5
/** Descanso entre passagens. Sem ele o brilho vira estrobo, nao respiracao. */
const REST_SECONDS = 3.5

export const PackShine = memo(function PackShine({ photo }: { photo: string }) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (prefersReducedMotion) return
    const element = ref.current
    if (!element) return

    const tween = gsap.fromTo(
      element,
      { xPercent: -140 },
      {
        xPercent: 420,
        duration: CROSS_SECONDS,
        repeat: -1,
        repeatDelay: REST_SECONDS,
        ease: 'power1.inOut',
      },
    )

    return () => {
      tween.kill()
    }
  }, [prefersReducedMotion])

  // Sem movimento, sem brilho: seria uma faixa clara parada sobre o pack.
  if (prefersReducedMotion) return null

  const mask = {
    maskImage: `url(${photo})`,
    maskSize: 'contain',
    maskPosition: 'center',
    maskRepeat: 'no-repeat',
    WebkitMaskImage: `url(${photo})`,
    WebkitMaskSize: 'contain',
    WebkitMaskPosition: 'center',
    WebkitMaskRepeat: 'no-repeat',
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={mask}
    >
      <span
        ref={ref}
        className="absolute inset-y-[-25%] left-0 block w-[45%] will-change-transform"
        style={{
          /*
            Inclinado, para a luz cruzar em diagonal como reflexo em superficie
            curva, e nao como cortina reta. `screen` acende sem lavar a cor da
            polpa por baixo.
          */
          background:
            'linear-gradient(104deg, transparent 0%, rgba(255,255,255,0.42) 45%, rgba(255,255,255,0.06) 70%, transparent 100%)',
          mixBlendMode: 'screen',
        }}
      />
    </div>
  )
})
