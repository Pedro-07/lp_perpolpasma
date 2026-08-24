import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { Section } from '@/components/ui/Section'
import { PackPhoto } from '@/features/pack/PackPhoto'
import {
  HERO_STAGE_RATIO,
  packPhotoLabel,
} from '@/features/pack/pack-photos'
import { CONTENT, whatsappLink, whatsappLinkFor } from '@/data/content'
import {
  FLAVORS,
  PACK,
  pulpGradientOf,
  pulpInkOf,
  type Flavor,
  type FlavorId,
} from '@/data/flavors'

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

  /*
    Anda pela lista a partir do sabor aberto, dando a volta nas pontas. O
    modulo com soma de FLAVORS.length antes do resto trata o passo negativo:
    em JavaScript, -1 % 8 e -1, e nao 7.
  */
  const navegar = useCallback((passo: number) => {
    setOpenId((atual) => {
      if (!atual) return atual
      const i = FLAVORS.findIndex((f) => f.id === atual)
      const proximo = (i + passo + FLAVORS.length) % FLAVORS.length
      return FLAVORS[proximo].id
    })
  }, [])

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
        <div className="mt-10 grid justify-items-center gap-4 rounded-lg bg-brand-green-dk px-6 py-12 text-center text-surface md:px-10">
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
          <a
            href={whatsappLink(CONTENT.catalogo.moreMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex min-h-[44px] items-center justify-center rounded-md bg-surface px-6 font-body text-sm text-ink"
          >
            Perguntar no WhatsApp
          </a>
        </div>

        <AnimatePresence>
          {openFlavor && (
            <FlavorDetail
              flavor={openFlavor}
              onClose={() => setOpenId(null)}
              onNavigate={navegar}
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
      className="relative w-full overflow-hidden rounded-md"
      style={{
        aspectRatio: HERO_STAGE_RATIO,
        /*
          O POCO DE POLPA, desde 24/08/2026.

          Ate aqui os oito cards eram do mesmo cinza, e o sistema de cor
          medida — topo, base, particula, tinta, oito sabores em oklab — vivia
          em UM lugar so, a cena da S2. O catalogo, que e onde os oito
          aparecem juntos e onde a compra se decide, nao usava nada dele.

          A cor NAO vai atras do texto, e essa e a decisao que importa. Medido
          contra o gradiente de cada sabor, o pior caso do nome sobre a polpa
          dava 3,56:1 na goiaba e 3,42:1 no morango — passa como texto grande
          e reprova como texto normal. Em vez de torcer a cor da tipografia
          ate caber, a polpa fica sendo o fundo do pack e o texto sai de cima
          dela. Contraste deixa de ser problema porque deixa de existir.

          Ganha o conceito junto: o pack passa a flutuar dentro da propria
          polpa que ele contem, e o grid de oito vira a paleta das frutas.
        */
        backgroundImage: pulpGradientOf(flavor),
      }}
    >
      {/*
        SOMBRA, e nao poco mais escuro.

        A borda do pack e plastico transparente, quase branco — medido entre
        #D5D5D4 e #E5E4E4 nos oito. Contra a polpa clara ela sumia: 1,44:1 no
        bacuri, 1,46:1 no abacaxi, contra os 3:1 que a WCAG 1.4.11 pede para
        objeto grafico essencial. O produto perdia a silhueta dentro da
        propria cor.

        Duas coisas resolvem juntas, e nenhuma resolve sozinha.

        O poco desceu um degrau — pulpGradientOf agora vai de base a
        particula, ver o comentario la. Isso dobra a separacao no meio do
        gradiente sem inventar cor.

        E esta sombra fecha o resto. drop-shadow segue o canal alfa, entao ela
        nasce do contorno real do saco e nao de uma caixa: cria contraste na
        FRONTEIRA, que e onde a silhueta se perde, em vez de no campo. E o que
        segura os sabores claros, onde nenhuma escolha de gradiente chega a
        3:1 contra plastico quase branco.

        As quatro combinacoes foram renderizadas lado a lado antes de escolher
        — poco raso e fundo, com e sem sombra.

        Estatica: nao anima, nao entra no orcamento da Secao 10.
      */}
      <PackPhoto
        flavor={flavor}
        priority={priority}
        calibrate={false}
        className="[filter:drop-shadow(0_8px_14px_rgba(0,0,0,0.34))]"
      />
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
          {/*
            O nome herda o escuro do proprio sabor em vez do preto do tema.

            pulpInkOf ja existia para a cena da S2 e a regra dele resolve aqui
            tambem: matiz do sabor, L fixo em 0,30, croma a 55%. O L fixo e o
            que faz os oito nomes terem o mesmo peso otico — e, de brinde, o
            mesmo contraste. Piso medido de 11,31:1 sobre o fundo do card,
            AAA nos oito, com apenas 0,52 de folga entre o melhor e o pior.
          */}
          <motion.h3
            layoutId={`nome-${flavor.id}`}
            className="font-display text-xl tracking-tighter"
            style={{ color: pulpInkOf(flavor) }}
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
  onNavigate,
}: {
  flavor: Flavor
  onClose: () => void
  onNavigate: (passo: number) => void
}) {
  /*
    Teclado: Escape fecha e as setas navegam.

    Sem Escape o shared element vira armadilha de teclado. As setas existem
    pelo mesmo motivo que os botoes: quem abriu um sabor quer comparar com o
    vizinho, e fechar-abrir-fechar para isso e trabalho que a interface pode
    poupar.
  */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      else if (event.key === 'ArrowLeft') onNavigate(-1)
      else if (event.key === 'ArrowRight') onNavigate(1)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose, onNavigate])

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
      {/*
        A CORTINA HERDA O ESCURO DO SABOR, e nao o preto do tema.

        Abrir a uva escurece o mundo num roxo quase preto; a acerola, num
        vermelho profundo. E o mesmo pulpInkOf do nome, entao nao ha cor nova
        no sistema — e o sabor tapando a pagina com a propria sombra.

        Nao anima: a cor troca de uma vez quando a seta muda de sabor. Uma
        transicao de cor numa camada que cobre a tela inteira e repaint de
        viewport cheio a cada frame, e a Secao 10 nao paga isso por um detalhe
        que so aparece por meio segundo. Troca seca aqui le como resposta, nao
        como corte.

        A legibilidade do painel nao depende disto: ele e opaco por cima.
      */}
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0"
        style={{ backgroundColor: pulpInkOf(flavor), opacity: 0.7 }}
      />

      <motion.div
        layout
        className="relative grid max-h-full w-full max-w-[560px] gap-5 overflow-y-auto rounded-lg bg-surface p-6"
      >
        {/*
          Setas de navegacao. Ficam no topo do painel, fora do fluxo do
          conteudo, para nao empurrar a informacao para baixo — e a mesma
          altura em todos os sabores, entao o alvo nao se move quando a pessoa
          avanca. Alvo de 44px (Secao 9).

          A volta e circular: do ultimo sabor a seta avanca para o primeiro.
          Beco sem saida no fim da lista obrigaria a fechar e reabrir.
        */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            aria-label="Sabor anterior"
            onClick={() => onNavigate(-1)}
            className="grid min-h-[44px] min-w-[44px] place-items-center rounded-md border border-ink/20 font-body text-lg text-ink"
          >
            &#8592;
          </button>
          <button
            type="button"
            aria-label="Próximo sabor"
            onClick={() => onNavigate(1)}
            className="grid min-h-[44px] min-w-[44px] place-items-center rounded-md border border-ink/20 font-body text-lg text-ink"
          >
            &#8594;
          </button>
        </div>

        <div className="grid grid-cols-[7rem_1fr] items-start gap-5">
          <motion.div layoutId={`pack-${flavor.id}`}>
            <CardPack flavor={flavor} priority />
          </motion.div>

          <div className="grid gap-1">
            <motion.h3
              id={`detalhe-${flavor.id}`}
              layoutId={`nome-${flavor.id}`}
              className="font-display text-4xl tracking-tighter"
              style={{ color: pulpInkOf(flavor) }}
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
              {CONTENT.comoUsar.yieldPerPack}
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
