import { useEffect, useRef, type RefObject } from 'react'
import { gsap } from '@/lib/gsap'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useLenisRef } from '@/app/providers/lenis-context'

/*
  O rio de polpa — Canvas 2D vanilla, o unico efeito autoral do projeto.

  Vive atras de S1 a S7 e e interrompido em S8 (Secao 6). A cor vem de --pulp,
  lida a cada frame: quem manda na cor e a timeline da cena heroi, o canvas so
  obedece. Isso e o que faz a tela inteira virar de cor junto com o sabor.

  Duas escolhas que divergem da letra do SPEC, ambas de proposito:

  1. sticky dentro de um wrapper absoluto, em vez de position: fixed.
     Com fixed, "parar em S8" vira corrida entre o observer e o scroll, e num
     Android lento a chance de o canvas piscar por cima da secao de contato e
     real. Com sticky preso a um wrapper que cobre exatamente S1 a S7, parar
     em S8 e geometria, nao temporizacao — nao tem como dar errado.

  2. Desenho no ticker do GSAP, nao num requestAnimationFrame proprio.
     Mesmo motivo do passo 5: um loop so para scroll, timeline e particulas.
     Um segundo rAF competiria pelo mesmo frame e o canvas leria a cor de
     antes da timeline ter atualizado.
*/

interface Particle {
  x: number
  y: number
  radius: number
  /** Quanto o fio estica no eixo do fluxo. 1 e redondo. */
  stretch: number
  speed: number
  /** Desvio angular proprio, somado a inclinacao geral do rio. */
  angle: number
  drift: number
  phase: number
  alpha: number
}

/*
  Faixa de densidade. O rio nao e chuva: ele corre em veios, com espaco vazio
  entre eles. Sem isto a distribuicao fica homogenea e o efeito le como
  confete, nao como polpa em suspensao.
*/
interface Band {
  center: number
  halfWidth: number
  weight: number
}

export function PulpCanvas({
  rangeRef,
}: {
  /** Elemento que cobre S1 a S7. Define ate onde o rio corre. */
  rangeRef: RefObject<HTMLElement | null>
}) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lenisRef = useLenisRef()

  useEffect(() => {
    if (prefersReducedMotion) return

    const canvas = canvasRef.current
    const range = rangeRef.current
    if (!canvas || !range) return

    // Sem canvas 2D o site simplesmente nao tem rio (Secao 11).
    const context = canvas.getContext('2d')
    if (!context) return

    const isDesktop = window.matchMedia('(min-width: 768px)').matches
    /*
      Orcamento da Secao 10: 120 no desktop, 28 no mobile.

      O corte que a borda macia exigiu vale so no mobile, e caiu de 40 para
      28. O fio novo e um sprite com degrade, esticado no eixo do fluxo, entao
      cobre varias vezes mais pixel que o disco pequeno de antes — e o gargalo
      no Android intermediario e taxa de preenchimento, nao contagem.

      No desktop esse gargalo nao existe, e cortar la so deixava o rio ralo
      sem comprar nada. Por isso os dois numeros nao andam juntos: 120 e 28
      nao sao a mesma decisao aplicada a duas telas, sao duas decisoes.
    */
    const count = isDesktop ? 120 : 28
    // Pelo mesmo motivo, o mobile desenha em menos pixel fisico por pixel CSS.
    const maxDpr = isDesktop ? 2 : 1.5

    /*
      Inclinacao geral do rio, em radianos. Pequena de proposito: o suficiente
      para existir uma direcao predominante, longe de virar vento lateral.
    */
    const FLOW_ANGLE = 0.14

    let width = 0
    let height = 0
    const particles: Particle[] = []
    let bands: Band[] = []

    /*
      Aproximacao de gaussiana pela soma de dois uniformes. Concentra no
      centro da faixa e rareia nas beiradas, que e o que faz o veio ter nucleo
      em vez de borda dura.
    */
    const bell = () => Math.random() + Math.random() - 1

    const buildBands = () => {
      const total = isDesktop ? 5 : 3
      bands = Array.from({ length: total }, (_, i) => ({
        // Espalha os veios pela largura, com folga irregular entre eles.
        center: ((i + 0.5) / total + (Math.random() - 0.5) * 0.12) * width,
        halfWidth: width * (0.05 + Math.random() * 0.09),
        weight: 0.35 + Math.random(),
      }))
    }

    const pickBand = () => {
      const total = bands.reduce((sum, b) => sum + b.weight, 0)
      let ticket = Math.random() * total
      for (const band of bands) {
        ticket -= band.weight
        if (ticket <= 0) return band
      }
      return bands[bands.length - 1]
    }

    const spawn = (particle: Particle, atBottom: boolean) => {
      const band = pickBand()
      particle.x = band.center + bell() * band.halfWidth
      particle.y = atBottom
        ? height + Math.random() * height * 0.3
        : Math.random() * height

      /*
        Tamanho com expoente alto: fio fino domina e pedaco grande e raro.
        Distribuicao uniforme dava tudo do mesmo tamanho medio, que e metade
        do motivo de a versao anterior parecer confete.
      */
      const min = isDesktop ? 2 : 1.8
      const max = isDesktop ? 26 : 16
      particle.radius = min + (max - min) * Math.random() ** 3.2

      // Fio esticado no eixo do fluxo; pedaco grande tende a ser mais redondo.
      particle.stretch = 1 + Math.random() ** 1.6 * 2.6

      particle.speed = 8 + Math.random() * 22
      particle.angle = FLOW_ANGLE + bell() * 0.10
      particle.drift = 6 + Math.random() * 18
      particle.phase = Math.random() * Math.PI * 2
      // Faixa mais baixa que a anterior: polpa em suspensao, nao papel picado.
      particle.alpha = 0.15 + Math.random() * 0.35
    }

    /*
      Sprite macio, desenhado uma vez em branco e tingido depois.

      Branco, e nao na cor do sabor, para nao ter que interpretar a string que
      o getComputedStyle devolve — que pode vir em rgb(), oklab() ou outro
      formato conforme o browser. O tingimento acontece no fim do frame, em
      uma passada so, com globalCompositeOperation.
    */
    const spriteSize = 64
    const sprite = document.createElement('canvas')
    sprite.width = spriteSize
    sprite.height = spriteSize
    const spriteCtx = sprite.getContext('2d')
    if (spriteCtx) {
      const r = spriteSize / 2
      const gradient = spriteCtx.createRadialGradient(r, r, 0, r, r, r)
      // Nucleo denso, queda longa. E a borda macia que o disco chapado nao tinha.
      gradient.addColorStop(0, 'rgba(255,255,255,0.95)')
      gradient.addColorStop(0.3, 'rgba(255,255,255,0.62)')
      gradient.addColorStop(0.65, 'rgba(255,255,255,0.20)')
      gradient.addColorStop(1, 'rgba(255,255,255,0)')
      spriteCtx.fillStyle = gradient
      spriteCtx.fillRect(0, 0, spriteSize, spriteSize)
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildBands()
    }

    resize()
    for (let i = 0; i < count; i += 1) {
      const particle = {} as Particle
      spawn(particle, false)
      particles.push(particle)
    }

    /*
      getComputedStyle e caro para rodar por frame, mas o valor so muda quando
      a timeline mexe em --pulp. Le a string todo frame, reaproveita a cor
      quando ela nao mudou.
    */
    const rootStyle = getComputedStyle(document.documentElement)
    let lastPulp = ''
    let fill = ''

    const draw = (_time: number, deltaMs: number) => {
      /*
        Le --pulp-particle, nao --pulp: a particula e a polpa na sombra.
        Tingida com a cor cheia ela quase sumia nos sabores claros, porque o
        fundo da secao e derivado da mesma cor — bacuri dava 1,05 de
        contraste. Ver PARTICLE_FALLOFF_STEPS em data/flavors.ts.
      */
      const pulp = rootStyle.getPropertyValue('--pulp-particle').trim()
      if (pulp !== lastPulp) {
        lastPulp = pulp
        fill = pulp
      }

      // Delta em segundos, limitado: uma travada nao pode teleportar o rio.
      const delta = Math.min(deltaMs, 50) / 1000

      /*
        A velocidade do scroll empurra o rio. E o que amarra o efeito a
        experiencia em vez de deixar ele rodando solto no fundo.
      */
      const scrollPush = (lenisRef?.current?.velocity ?? 0) * 0.35

      context.clearRect(0, 0, width, height)

      for (const particle of particles) {
        const push = particle.speed + scrollPush
        // Direcao predominante: sobe inclinado, cada fio com desvio proprio.
        particle.y -= Math.cos(particle.angle) * push * delta
        particle.x += Math.sin(particle.angle) * push * delta
        particle.phase += delta

        const x = particle.x + Math.sin(particle.phase) * particle.drift
        const half = particle.radius
        const halfTall = particle.radius * particle.stretch

        if (particle.y + halfTall < 0) spawn(particle, true)
        else if (particle.y - halfTall > height * 1.4) spawn(particle, false)

        context.globalAlpha = particle.alpha
        /*
          Sprite esticado no eixo do fluxo. E o que separa fio de polpa de
          disco: a mesma silhueta redonda, repetida, le como confete.
        */
        context.drawImage(
          sprite,
          x - half,
          particle.y - halfTall,
          half * 2,
          halfTall * 2,
        )
      }

      context.globalAlpha = 1

      /*
        Tingimento em uma passada so. Ate aqui o frame tem fios brancos; o
        source-in troca a cor de tudo de uma vez preservando o alfa de cada
        um. Evita reinterpretar a cor por particula e, principalmente, evita
        ter que decifrar o formato que o getComputedStyle devolveu.
      */
      context.globalCompositeOperation = 'source-in'
      context.fillStyle = fill
      context.fillRect(0, 0, width, height)
      context.globalCompositeOperation = 'source-over'
    }

    let running = false
    const start = () => {
      if (running) return
      running = true
      gsap.ticker.add(draw)
    }
    const stop = () => {
      if (!running) return
      running = false
      gsap.ticker.remove(draw)
      context.clearRect(0, 0, width, height)
    }

    /*
      Pausa fora da viewport (Secao 10). O sticky ja garante que o canvas nao
      apareca depois da S8; o observer garante que ele tambem nao gaste frame
      la embaixo, com a pessoa lendo o contato.
    */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start()
        else stop()
      },
      { threshold: 0 },
    )
    observer.observe(range)

    window.addEventListener('resize', resize)

    return () => {
      observer.disconnect()
      stop()
      window.removeEventListener('resize', resize)
    }
  }, [prefersReducedMotion, rangeRef, lenisRef])

  // Secao 11: sem movimento, sem canvas. O conteudo nunca dependeu dele.
  if (prefersReducedMotion) return null

  return (
    <div
      aria-hidden="true"
      /*
        z-10: acima do fundo das secoes, abaixo do conteudo (que vai em z-20).
        E o que faz o rio atravessar as secoes em vez de sumir atras do
        primeiro fundo opaco. Texto nunca fica sob particula.
      */
      className="pointer-events-none absolute inset-0 z-10 overflow-clip"
    >
      <canvas ref={canvasRef} className="sticky top-0 block h-[100dvh] w-full" />
    </div>
  )
}
