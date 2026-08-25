import { useEffect, type RefObject } from 'react'
import { gsap } from '@/lib/gsap'

/*
  Parallax de mouse no pack do heroi.

  SPRING DE VERDADE, integrado no ticker, e nao um ease imitando spring. A
  Secao 9 fixa a fisica do projeto em stiffness 100 e damping 20, e esses dois
  numeros sao os mesmos aqui — o gesto do site tem uma resposta so, seja no
  card do catalogo ou no pack do heroi.

  Por que nao Framer Motion, que teria spring pronto: este elemento e da cena,
  e cena e territorio do GSAP (Secao 3). Duas bibliotecas no mesmo elemento e
  exatamente o que a regra proibe, e o custo de escrever a integracao a mao e
  vinte linhas.

  Com massa 1, o par 100/20 da amortecimento critico: o pack alcanca o cursor
  e para, sem oscilar em volta. Deslocamento de poucos pixels de proposito —
  passou disso, vira brinquedo e briga com a leitura da headline.
*/

const STIFFNESS = 100
const DAMPING = 20
/** Deslocamento maximo, em pixels, com o cursor na quina da tela. */
const MAX_OFFSET = 10
/** Abaixo disto o movimento nao aparece: desliga o ticker e economiza frame. */
const SETTLED = 0.01

export function usePointerParallax(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return
    const element = ref.current
    if (!element) return

    /*
      Ponteiro grosso nao tem posicao de repouso: o dedo toca e sai, e o pack
      ficaria deslocado sem nada explicando por que. So mouse e trackpad.
    */
    if (!window.matchMedia('(pointer: fine)').matches) return

    const setX = gsap.quickSetter(element, 'x', 'px')
    const setY = gsap.quickSetter(element, 'y', 'px')

    let targetX = 0
    let targetY = 0
    let x = 0
    let y = 0
    let vx = 0
    let vy = 0
    let running = false

    const step = (_time: number, deltaMs: number) => {
      // Passo limitado: uma travada nao pode explodir a integracao.
      const dt = Math.min(deltaMs, 50) / 1000

      vx += (STIFFNESS * (targetX - x) - DAMPING * vx) * dt
      vy += (STIFFNESS * (targetY - y) - DAMPING * vy) * dt
      x += vx * dt
      y += vy * dt

      setX(x)
      setY(y)

      const still =
        Math.abs(vx) < SETTLED &&
        Math.abs(vy) < SETTLED &&
        Math.abs(targetX - x) < SETTLED &&
        Math.abs(targetY - y) < SETTLED
      if (still) stop()
    }

    const start = () => {
      if (running) return
      running = true
      gsap.ticker.add(step)
    }

    function stop() {
      if (!running) return
      running = false
      gsap.ticker.remove(step)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      targetX = (event.clientX / window.innerWidth - 0.5) * 2 * MAX_OFFSET
      targetY = (event.clientY / window.innerHeight - 0.5) * 2 * MAX_OFFSET
      start()
    }

    // Cursor saiu da janela: o pack volta ao lugar em vez de ficar torto.
    const onPointerLeave = () => {
      targetX = 0
      targetY = 0
      start()
    }

    window.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerleave', onPointerLeave)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerleave', onPointerLeave)
      stop()
      gsap.set(element, { x: 0, y: 0 })
    }
  }, [ref, enabled])
}
