import { useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { Section } from '@/components/ui/Section'
import { ConfirmableText } from '@/components/ui/Pending'
import { PackPhoto } from '@/features/pack/PackPhoto'
import {
  HERO_STAGE_RATIO,
  packPhotoLabel,
} from '@/features/pack/pack-photos'
import { CONTENT, whatsappLink, whatsappLinkFor } from '@/data/content'
import { FLAVORS, PACK, type Flavor, type FlavorId } from '@/data/flavors'

/*
  S3 — Catalogo. Os 8 sabores em cards (Secao 8).

  Esta secao e territorio da Framer Motion, nao do GSAP: entrada dos cards,
  layoutId entre card e detalhe, estados de toque. A regra da Secao 3 e que um
  elemento tem um dono — nada aqui e tocado por ScrollTrigger.

  Sem hover-only: o publico chega de celular. Toda informacao do verso
  aparece por toque, e o card inteiro e um botao.
*/

// Secao 9: fisica com spring, nunca easing linear.
const SPRING = { type: 'spring', stiffness: 100, damping: 20 } as const

const LIST_VARIANTS = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const CARD_VARIANTS = {
  // Apenas transform e opacity (Secao 10).
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

export function S3Catalogo() {
  const [openId, setOpenId] = useState<FlavorId | null>(null)
  const openFlavor = FLAVORS.find((f) => f.id === openId) ?? null

  return (
    <MotionConfig reducedMotion="user" transition={SPRING}>
      <Section id="s3" title={CONTENT.catalogo.title}>
        <motion.ul
          variants={LIST_VARIANTS}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-2 gap-4 md:grid-cols-4"
        >
          {FLAVORS.map((flavor) => (
            <FlavorCard
              key={flavor.id}
              flavor={flavor}
              onOpen={() => setOpenId(flavor.id)}
            />
          ))}
        </motion.ul>

        {/*
          FAIXA, e nao a nona celula do grid. Tres razoes, na ordem em que
          pesam:

          Ordem — oito cards fecham exatamente duas fileiras no mobile e duas
          no desktop. Um nono item deixaria uma fileira orfa, com uma celula
          preenchida e uma vazia.

          Escala — a mensagem e "existe muito mais que isso". Uma faixa larga
          diz isso pela forma; uma celula do tamanho de um sabor diz o oposto.

          Natureza — fundo solido e escuro, sem foto e sem borda de card. O
          contraste com os cards claros resolve sozinho o "nao competir": o
          olho nao le isto como o nono sabor.
        */}
        <div className="mt-10 grid gap-4 rounded-lg bg-brand-green-dk px-6 py-10 text-surface md:px-10">
          <h3 className="max-w-[20ch] font-display text-3xl leading-tight tracking-tighter md:text-5xl">
            {CONTENT.catalogo.moreTitle}
          </h3>
          {/*
            Surface cheia, nao a 80%. A 80% media 7,02:1 — passava AAA e ainda
            assim lia fraca: num campo escuro grande, opacidade reduzida tira
            peso otico mesmo com a razao aprovada. Cheia da 10,05:1.
          */}
          <p className="max-w-[46ch] font-body text-base leading-relaxed text-surface">
            {CONTENT.catalogo.moreLead}
          </p>
          <p>
            <ConfirmableText value={CONTENT.catalogo.flavorCount} />
          </p>
          <a
            href={whatsappLink(CONTENT.catalogo.moreMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex min-h-[44px] w-fit items-center justify-center rounded-md bg-surface px-6 font-body text-sm text-ink"
          >
            Perguntar no WhatsApp
          </a>
        </div>

        <AnimatePresence>
          {openFlavor && (
            <FlavorDetail
              flavor={openFlavor}
              onClose={() => setOpenId(null)}
            />
          )}
        </AnimatePresence>
      </Section>
    </MotionConfig>
  )
}

/*
  O pack do card. So foto — a bifurcacao com a composicao de 3 camadas saiu em
  18/08/2026, quando os oito sabores passaram a ter packshot e o ramo composto
  virou codigo inalcancavel. O que era o outro caminho esta em docs/arquivo/.

  CAIXA QUADRADA. Ela era 0,75, uma proporcao que nunca foi medida e vinha da
  composicao; os oito packshots sao 1254x1254, entao 0,75 so deixava faixa
  vazia em cima e embaixo de cada card.

  A foto entra sem calibracao: photoScale e photoOffsetY sao do palco da cena
  heroi, onde alinham as fotos umas contra as outras. Aqui cada pack aparece
  sozinho, numa caixa diferente.
*/
function CardPack({
  flavor,
  priority = false,
}: {
  flavor: Flavor
  priority?: boolean
}) {
  return (
    <div
      role="img"
      aria-label={packPhotoLabel(flavor.name)}
      className="relative w-full"
      style={{ aspectRatio: HERO_STAGE_RATIO }}
    >
      <PackPhoto flavor={flavor} priority={priority} calibrate={false} />
    </div>
  )
}

function FlavorCard({
  flavor,
  onOpen,
}: {
  flavor: Flavor
  onOpen: () => void
}) {
  return (
    <motion.li variants={CARD_VARIANTS} layout>
      <button
        type="button"
        onClick={onOpen}
        // min-h-[44px] no alvo de toque (Secao 9). O card inteiro clica.
        className="grid min-h-[44px] w-full gap-3 rounded-lg bg-ink/5 p-4 text-left"
      >
        <motion.div layoutId={`pack-${flavor.id}`}>
          <CardPack flavor={flavor} />
        </motion.div>

        <div>
          <motion.h3
            layoutId={`nome-${flavor.id}`}
            className="font-display text-xl tracking-tighter"
          >
            {flavor.name}
          </motion.h3>
          <p className="font-body text-sm text-ink-soft">
            {PACK.units} x {PACK.unitGrams} g
          </p>
        </div>
      </button>
    </motion.li>
  )
}

function FlavorDetail({
  flavor,
  onClose,
}: {
  flavor: Flavor
  onClose: () => void
}) {
  // Escape fecha. Sem isso o shared element vira armadilha de teclado.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`detalhe-${flavor.id}`}
      className="fixed inset-0 z-40 grid place-items-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-ink/70"
      />

      <motion.div
        layout
        className="relative grid max-h-full w-full max-w-[560px] gap-5 overflow-y-auto rounded-lg bg-surface p-6"
      >
        <div className="grid grid-cols-[7rem_1fr] items-start gap-5">
          <motion.div layoutId={`pack-${flavor.id}`}>
            <CardPack flavor={flavor} priority />
          </motion.div>

          <div className="grid gap-1">
            <motion.h3
              id={`detalhe-${flavor.id}`}
              layoutId={`nome-${flavor.id}`}
              className="font-display text-4xl tracking-tighter"
            >
              {flavor.name}
            </motion.h3>
            <p className="font-body text-sm text-ink-soft">
              {PACK.units} x {PACK.unitGrams} g · {PACK.totalGrams} g
            </p>
          </div>
        </div>

        <dl className="grid gap-4 border-t border-ink/15 pt-5 font-body text-sm">
          <div className="grid gap-1">
            <dt className="text-ink-soft">Rendimento</dt>
            <dd>
              <ConfirmableText value={CONTENT.comoUsar.yieldPerPack} />
            </dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-ink-soft">Safra</dt>
            <dd>
              <ConfirmableText value={CONTENT.catalogo.harvest} />
            </dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-ink-soft">Preparo</dt>
            <dd>
              {/*
                A proporcao vem da antiga secao "Como usar", absorvida aqui na
                estrutura enxuta de 13/08/2026. E fato que o SPEC afirma, entao
                aparece sempre; a sugestao por sabor continua pendencia.
              */}
              <p>{CONTENT.comoUsar.ratio}</p>
              <p className="mt-1">
                <ConfirmableText value={CONTENT.catalogo.preparation} />
              </p>
            </dd>
          </div>
        </dl>

        {/*
          CTA do catalogo: WhatsApp com mensagem pre-preenchida por sabor.
          Sem carrinho (Secao 8). Destravado em 12/08/2026, quando o numero
          foi confirmado.
        */}
        <div className="grid gap-2 border-t border-ink/15 pt-5">
          <a
            href={whatsappLinkFor(flavor.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="grid min-h-[44px] place-items-center rounded-md bg-brand-green px-5 font-body text-sm text-surface"
          >
            Pedir {flavor.name} no WhatsApp
          </a>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="grid min-h-[44px] place-items-center rounded-md bg-ink px-5 font-body text-sm text-surface"
        >
          Fechar
        </button>
      </motion.div>
    </motion.div>
  )
}
