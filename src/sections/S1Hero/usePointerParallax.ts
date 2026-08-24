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

  VARIAS CAMADAS, UMA MOLA SO — mudanca de 24/08/2026.

  Antes o hook movia o grupo inteiro do leque, e os tres packs andavam
  exatamente juntos: o leque lia como figurinha plana deslizando, nao como
  tres objetos a distancias diferentes.

  Agora cada pack e uma camada com o proprio fator. A integracao continua
  sendo UMA — mesmo alvo, mesma velocidade, mesmo estado — e o fator so
  multiplica o deslocamento na hora de escrever. Tres molas independentes
  dariam tres estados a integrar por frame para um resultado identico, ja que
  o alvo e o mesmo para todas.
*/

const STIFFNESS = 100
const DAMPING = 20
/** Deslocamento maximo, em pixels, com o cursor na quina da tela. */
const MAX_OFFSET = 10
/** Abaixo disto o movimento nao aparece: desliga o ticker e economiza frame. */
const SETTLED = 0.01

export function usePointerParallax(
  /*
    Ref para o ARRAY de elementos, e nao um array de refs: um array de refs
    seria recriado a cada render e a dependencia do efeito nunca estabilizaria,
    remontando o ticker sem parar.
  */
  refs: RefObject<(HTMLElement | null)[]>,
  /** Um fator por camada, na mesma ordem. 1 anda o maximo; 0 nao anda. */
  factors: readonly number[],
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return
    const elements = refs.current?.filter(Boolean) as HTMLElement[] | undefined
    if (!elements || elements.length === 0) return

    /*
      Ponteiro grosso nao tem posicao de repouso: o dedo toca e sai, e o pack
      ficaria deslocado sem nada explicando por que. So mouse e trackpad.
    */
    if (!window.matchMedia('(pointer: fine)').matches) return

    const setters = elements.map((element, i) => ({
      x: gsap.quickSetter(element, 'x', 'px'),
      y: gsap.quickSetter(element, 'y', 'px'),
      factor: factors[i] ?? 1,
    }))

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

      for (const setter of setters) {
        setter.x(x * setter.factor)
        setter.y(y * setter.factor)
      }

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
      gsap.set(elements, { x: 0, y: 0 })
    }
  }, [refs, factors, enabled])
}
