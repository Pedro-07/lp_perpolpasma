import { useEffect, useRef } from 'react'
import { Container } from '@/components/ui/Container'
import { PackPhoto } from '@/features/pack/PackPhoto'
import {
  HERO_STAGE_RATIO,
  HERO_STAGE_WIDTH,
  PACK_PHOTO_STAGE_LABEL,
  packPhotoLabel,
} from '@/features/pack/pack-photos'
import { gsap } from '@/lib/gsap'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useLenisRef } from '@/app/providers/lenis-context'
import { CONTENT } from '@/data/content'
import {
  HERO_FLAVORS,
  NEUTRAL_ACCENT,
  NEUTRAL_PULP,
  NEUTRAL_PULP_BASE,
  NEUTRAL_PULP_INK,
  NEUTRAL_PULP_PARTICLE,
  pulpBaseOf,
  pulpInkOf,
  pulpParticleOf,
} from '@/data/flavors'

/*
  S2 — Cena heroi (Secao 7 do SPEC).

  Territorio exclusivo do GSAP. Nenhum elemento daqui e tocado pela Framer
  Motion, inclusive o gesto de arraste: a Secao 9 manda o drag alimentar a
  mesma timeline do scroll, e duas bibliotecas disputando o mesmo elemento e
  exatamente o que a Secao 3 proibe.

  O pack aqui e foto real, nao a composicao de 3 camadas — revisao da Secao 4:
  no tamanho em que ele aparece nesta cena, foto ganha de composicao. A
  composicao continua no catalogo, onde o que precisa escalar e o numero de
  sabores.

  Logo, a troca de sabor e crossfade entre tres fotos empilhadas no mesmo
  palco. O pack continua sem pulo, mas por outro motivo: nada se move — as
  tres ocupam a mesma caixa e so a opacidade muda.

  Cada foto e dois elementos, e a divisao e regra: o wrapper e do GSAP e so
  recebe opacity; a <img> carrega o transform de calibracao e o GSAP nunca
  encosta nela. Fosse tudo no mesmo elemento, o primeiro tween de opacidade
  apagaria a calibracao.
*/

/*
  Quantos pixels de scroll cada pixel de arraste vale.
  Em 2.5, arrastar cerca de um terco da largura da tela avanca um sabor —
  perto do custo de virar uma pagina, que e a metafora certa aqui.
*/
const DRAG_TO_SCROLL = 2.5

export function S2Sabores() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const lenisRef = useLenisRef()
  const rootRef = useRef<HTMLElement>(null)
  const photoRefs = useRef<(HTMLDivElement | null)[]>([])
  const nameRefs = useRef<(HTMLSpanElement | null)[]>([])

  // Timeline de scroll.
  useEffect(() => {
    if (prefersReducedMotion) return
    const root = rootRef.current
    if (!root) return

    const photos = photoRefs.current
    const names = nameRefs.current
    if (photos.some((el) => !el) || names.some((el) => !el)) return

    const docStyle = document.documentElement.style
    const first = HERO_FLAVORS[0]

    const ctx = gsap.context(() => {
      /*
        Estado de chegada: o primeiro do elenco assentado, os demais fora de
        cena. A ordem vem de HERO_FLAVOR_IDS e e decisao do Pedro (Secao 7).
      */
      docStyle.setProperty('--pulp', first.pulpTop)
      docStyle.setProperty('--pulp-base', pulpBaseOf(first))
      docStyle.setProperty('--pulp-particle', pulpParticleOf(first))
      docStyle.setProperty('--pulp-ink', pulpInkOf(first))
      docStyle.setProperty('--accent', first.accent)
      gsap.set(photos[0], { opacity: 1 })
      gsap.set(names[0], { yPercent: 0 })
      gsap.set(photos.slice(1), { opacity: 0 })
      gsap.set(names.slice(1), { yPercent: 110 })

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          // Altura de scroll: 100vh por sabor heroi (Secao 7).
          end: () => `+=${window.innerHeight * HERO_FLAVORS.length}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })

      HERO_FLAVORS.forEach((flavor, i) => {
        if (i === 0) return

        // Meia unidade de folga antes da primeira troca: o sabor de entrada
        // fica parado enquanto o dedo comeca a andar.
        const at = i - 0.5

        timeline
          /*
            Crossfade com curvas complementares, nao linear dos dois lados.

            As fotos tem alpha e o fundo da secao aparece por tras. Em linear,
            no meio da troca as duas ficam a 50% e o pack lava para o fundo —
            some meio pack no meio da transicao. Com power2.in saindo e
            power2.out entrando, no ponto medio as duas estao em 0,75: a
            cobertura passa de 0,94 em vez de cair para 0,75. Sobra um
            fantasma de sobreposicao, que e o lado certo do erro.
          */
          .to(
            photos[i - 1],
            { opacity: 0, duration: 0.5, ease: 'power2.in' },
            at,
          )
          .to(names[i - 1], { yPercent: -110, duration: 0.5 }, at)
          /*
            A cor vai no :root, nao na secao. O canvas do passo 9 e o fundo
            desta secao leem a mesma variavel; um unico dono evita dois
            valores de verdade para a mesma cor.
          */
          .to(
            document.documentElement,
            {
              '--pulp': flavor.pulpTop,
              '--pulp-base': pulpBaseOf(flavor),
              '--pulp-particle': pulpParticleOf(flavor),
              '--pulp-ink': pulpInkOf(flavor),
              '--accent': flavor.accent,
              duration: 0.5,
            },
            at,
          )
          .to(photos[i], { opacity: 1, duration: 0.5, ease: 'power2.out' }, at)
          .to(names[i], { yPercent: 0, duration: 0.5 }, at)
      })

      /*
        Saida da cena: o ultimo sabor fica assentado um tempo e depois a cor
        volta ao neutro, antes do pin soltar.

        Sem isto, --pulp fica congelado no ultimo sabor heroi e a S7 herda a
        manga — os oito cards do catalogo apareceriam sobre fundo de um sabor
        so. Fora da cena heroi nao existe sabor ativo, e o :root precisa
        dizer isso.

        Tween e nao um set no onLeave de proposito: com scrub, um corte seco
        na cor apareceria como piscada na saida, e reverteria mal quando a
        pessoa subisse o scroll de volta.
      */
      timeline.to({}, { duration: 0.35 })
      timeline.to(document.documentElement, {
        '--pulp': NEUTRAL_PULP,
        '--pulp-base': NEUTRAL_PULP_BASE,
        '--pulp-particle': NEUTRAL_PULP_PARTICLE,
        '--pulp-ink': NEUTRAL_PULP_INK,
        '--accent': NEUTRAL_ACCENT,
        duration: 0.4,
      })
    }, root)

    return () => {
      ctx.revert()
      docStyle.removeProperty('--pulp')
      docStyle.removeProperty('--pulp-base')
      docStyle.removeProperty('--pulp-particle')
      docStyle.removeProperty('--pulp-ink')
      docStyle.removeProperty('--accent')
    }
  }, [prefersReducedMotion])

  // Arraste horizontal, alimentando a mesma timeline por meio do scroll.
  useEffect(() => {
    if (prefersReducedMotion) return
    const root = rootRef.current
    if (!root) return

    let activePointer: number | null = null
    let startX = 0
    let startScroll = 0

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      activePointer = event.pointerId
      startX = event.clientX
      startScroll = lenisRef?.current?.scroll ?? window.scrollY
    }

    const onPointerMove = (event: PointerEvent) => {
      if (activePointer !== event.pointerId) return
      // Arrastar para a esquerda avanca, como virar pagina.
      const target = startScroll - (event.clientX - startX) * DRAG_TO_SCROLL
      const lenis = lenisRef?.current
      if (lenis) lenis.scrollTo(target, { immediate: true })
      else window.scrollTo(0, target)
    }

    const onPointerEnd = (event: PointerEvent) => {
      if (activePointer === event.pointerId) activePointer = null
    }

    root.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerEnd)
    window.addEventListener('pointercancel', onPointerEnd)

    return () => {
      root.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerEnd)
      window.removeEventListener('pointercancel', onPointerEnd)
    }
  }, [prefersReducedMotion, lenisRef])

  if (prefersReducedMotion) return <SaboresGaleria />

  return (
    <section
      ref={rootRef}
      id="s2"
      aria-labelledby="s2-title"
      className="relative min-h-[100dvh] overflow-hidden"
      style={{
        // Recalcula sozinho enquanto --pulp interpola: o fundo segue a cor
        // sem precisar de um segundo tween (Secao 7).
        background:
          'color-mix(in oklab, var(--pulp) 20%, var(--color-surface))',
        // Vertical continua nativo; so o horizontal e nosso.
        touchAction: 'pan-y',
      }}
    >
      <Container className="relative z-20 grid min-h-[100dvh] grid-cols-12 items-center gap-8 py-20">
        <h2 id="s2-title" className="sr-only">
          {CONTENT.sabores.title}
        </h2>

        {/* Mask reveal: o nome sobe por dentro de uma janela recortada. */}
        <div className="col-span-12 md:col-span-6">
          {/*
            Nome no escuro do proprio sabor, nao em preto puro. O fundo
            pertence ao sabor e a tipografia em preto ficava colada por cima
            dele; derivada da mesma cor, ela passa a pertencer a cena.
          */}
          <div
            className="relative h-[1.15em] overflow-hidden font-display text-5xl leading-[0.9] tracking-tighter md:text-8xl"
            style={{ color: 'var(--pulp-ink)' }}
          >
            {HERO_FLAVORS.map((flavor, i) => (
              <span
                key={flavor.id}
                ref={(el) => {
                  nameRefs.current[i] = el
                }}
                className="absolute inset-0 block will-change-transform"
              >
                {flavor.name}
              </span>
            ))}
          </div>
        </div>

        {/*
          Palco do crossfade. A proporcao e da caixa, nao de nenhum pack: os
          arquivos nao sao normalizados entre si e nenhuma proporcao unica de
          pack existe mais (Secao 4).

          O tamanho vem da altura da viewport, nao da largura da coluna. Preso
          a largura, o pack ficava enorme no celular (coluna inteira) e o
          ajuste so existia dentro do photoScale, que e de alinhamento entre
          sabores — o tamanho bom no desktop virava gigante no mobile e vice
          versa. Agora sao duas decisoes separadas.
        */}
        <div
          role="img"
          aria-label={PACK_PHOTO_STAGE_LABEL}
          className="relative col-span-12 justify-self-center md:col-span-5 md:col-start-8"
          style={{
            aspectRatio: HERO_STAGE_RATIO,
            width: HERO_STAGE_WIDTH,
          }}
        >
          {HERO_FLAVORS.map((flavor, i) => (
            <div
              key={flavor.id}
              ref={(el) => {
                photoRefs.current[i] = el
              }}
              className="absolute inset-0 will-change-[opacity]"
            >
              {/* Ativo e proximo adiantados; o resto lazy (Secao 7). */}
              <PackPhoto flavor={flavor} priority={i < 2} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

/*
  Fallback de prefers-reduced-motion (Secao 11): a cena vira galeria estatica,
  um frame por sabor. Sem pin, sem scrub, sem arraste, scroll nativo.
  O conteudo nunca depende da animacao.
*/
function SaboresGaleria() {
  return (
    <section
      id="s2"
      aria-labelledby="s2-title"
      className="relative w-full bg-surface"
    >
      <Container className="grid gap-8 py-20 md:py-28">
        <h2
          id="s2-title"
          className="font-display text-5xl leading-[0.9] tracking-tighter md:text-8xl"
        >
          {CONTENT.sabores.title}
        </h2>

        <ul className="grid gap-6 md:grid-cols-3">
          {HERO_FLAVORS.map((flavor) => (
            <li key={flavor.id} className="grid gap-3">
              {/*
                Mesmo palco e mesma calibracao da cena animada. Se a galeria
                usasse outro enquadramento, calibrar para o crossfade
                desalinharia o fallback sem ninguem perceber.
              */}
              <div
                role="img"
                aria-label={packPhotoLabel(flavor.name)}
                className="relative w-full"
                style={{ aspectRatio: HERO_STAGE_RATIO }}
              >
                <PackPhoto flavor={flavor} />
              </div>
              <h3 className="font-display text-2xl tracking-tighter">
                {flavor.name}
              </h3>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
