import { useLayoutEffect, useRef } from 'react'
import { Container } from '@/components/ui/Container'
import { ProvisionalMark } from '@/components/ui/Pending'
import { FAN_ITEM_SELECTOR, PackFan } from './PackFan'
import { gsap } from '@/lib/gsap'
import { onLoaderGate } from '@/features/loader/loader-gate'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { PackFloat } from './PackFloat'
import { CONTENT, whatsappLink } from '@/data/content'
import { isProvisional, textOf } from '@/data/pending'


/*
  Quebra a headline em linhas para o mask reveal.

  Cada linha precisa da propria janela recortada, entao a quebra tem que ser
  conhecida pelo JS — deixar o navegador quebrar sozinho daria uma janela so,
  e o stagger por linha nao existiria.

  Quebra por orcamento de caracteres, e nao lista fixa de linhas: a headline e
  `provisional` e pode mudar quando a redacao legal voltar. Frase nova entra
  sem ninguem lembrar de reescrever as linhas na mao.
*/
const LINE_BUDGET = 14

function splitIntoLines(text: string): string[] {
  const lines: string[] = []
  let current = ''
  for (const word of text.split(' ')) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length > LINE_BUDGET && current) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  return lines
}

/*
  Teto de espera da entrada. O portao do loader ja tem o proprio timeout, mas
  a headline comeca escondida — se por qualquer motivo o aviso nao chegar, a
  primeira tela do site ficaria em branco para sempre. Este e o seguro.
*/
const ENTRANCE_FALLBACK_MS = 2500

/*
  Overshoot da abertura do leque. 1,3 e o MAXIMO que cabe, e o numero saiu de
  conta, nao de gosto.

  O PackFan documenta a envoltoria do pack lateral: meia largura escalada
  (22,1%) + avanco do giro (6,9%) + deslocamento (18,7%) = 47,7% do centro,
  contra os 50% onde o overflow-clip da secao apara. Sobram 2,27 pontos, e
  quem passar deles corta o pack NO PICO do movimento, que e exatamente onde
  o olho esta.

  Envoltoria maxima por mola, varrendo a curva inteira:

    back.out(s)   pico    envoltoria   folga
        0,6      1,0125       47,99     2,01
        0,9      1,0299       48,35     1,65
        1,3      1,0615       48,99     1,01   <-- escolhido
        1,5      1,0800       49,36     0,64
        1,70158  1,1000       49,77     0,23   <-- padrao do GSAP
        2,0      1,1317       50,41    -0,41   ESTOURA

  O padrao do GSAP passaria com 0,23 de folga — dentro da conta, mas sem
  margem nenhuma para o dia em que alguem mexer na largura ou no angulo. 1,3
  e o mais agressivo que mantem um ponto inteiro de sobra.

  Mexeu em PACK_WIDTH_PERCENT, SIDE_SHIFT_PERCENT, SIDE_ANGLE_DEG ou
  SIDE_SCALE? Esta tabela precisa ser refeita.
*/
const FAN_BACK = 1.3

/*
  S1 — Hero. Primeira impressao (Secao 6).

  Composicao assimetrica, heroi centralizado e proibido (Secao 5): a
  tipografia sangra para fora do container a esquerda e o pack fica deslocado
  para a direita, cortado pela borda de baixo. O eixo de simetria nunca se
  forma, entao o olho tem para onde andar.

  O pack fixa a cor do sabor de abertura com tint="own", nao herda do :root.
  Herdando, ele viraria neutro depois que a pessoa passasse pela cena heroi e
  voltasse o scroll para cima — o pack do topo mudaria de cor sem ninguem ter
  pedido.

  O sabor vem de OPENING_FLAVOR, nao do elenco do heroi: a abertura do site
  nao pode mudar de cor porque a S6 trocou de elenco.
*/
export function S1Hero() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const rootRef = useRef<HTMLElement>(null)
  const typeRef = useRef<HTMLDivElement>(null)
  const packRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const hintDashRef = useRef<HTMLSpanElement>(null)
  const entranceRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([])

  // Texto solto, sem o marcador junto: ele entra separado, logo abaixo.
  const headline = textOf(CONTENT.hero.headline)
  const lines = headline ? splitIntoLines(headline) : []

  /*
    useLayoutEffect, e NAO useEffect: ele roda antes da pintura.

    Com useEffect, o estado escondido era aplicado depois do primeiro frame —
    a frase aparecia inteira e sumia para entrar. Pior que o piscar: quando a
    entrada falhava por qualquer motivo, o texto ficava escondido para sempre
    dentro do overflow-hidden, sem erro no console.
  */
  useLayoutEffect(() => {
    if (prefersReducedMotion) return
    const root = rootRef.current
    if (!root) return

    let introCleanup: (() => void) | undefined

    const ctx = gsap.context(() => {
      /*
        ENTRADA, disparada quando a cortina do loader sai.

        Ordem: a headline sobe linha a linha, e o pack entra depois, quando a
        frase ja esta legivel. Invertido, o objeto rouba a leitura da primeira
        tela — que e a unica coisa que a Secao 1 pede desta secao.

        O blur do pack e a excecao consciente a regra "so transform e opacity"
        da Secao 10: filtro custa repintura, e por isso ele existe SO na
        entrada, uma vez, com will-change removido no fim. Perpetuo seria
        proibido; um pulso de um segundo, com o resto da tela parada, nao e.
      */
      const heading = lineRefs.current.filter(Boolean)
      const entrance = entranceRef.current
      const fanItems = gsap.utils.toArray<HTMLElement>(FAN_ITEM_SELECTOR)

      /*
        Repouso do leque, reescrito pelo GSAP nos mesmos termos que ele anima.

        Nao da para animar a partir do transform do CSS: o navegador devolve
        uma matriz, com o -50% ja virado pixel, e o GSAP interpolaria em cima
        dela — a centralizacao quebraria no primeiro resize. Entao os valores
        crus vem do dado que o PackFan escreveu em cada item, e a partir daqui
        quem desenha o leque e o GSAP, nao a folha de estilo.
      */
      const fanRest = fanItems.map((item) => ({
        xPercent: -50 + Number(item.dataset.fanShift),
        rotation: Number(item.dataset.fanAngle),
        scale: Number(item.dataset.fanScale),
      }))

      /*
        130 e nao 110: a janela agora tem padding, e a 110% sobrava uma faixa
        do topo do glifo visivel antes da entrada comecar.
      */
      gsap.set(heading, { yPercent: 130 })
      gsap.set(entrance, {
        yPercent: 14,
        scale: 0.94,
        opacity: 0,
        filter: 'blur(14px)',
        willChange: 'transform, opacity, filter',
      })

      /*
        LEQUE FECHADO: os tres empilhados no centro, um atras do outro, no
        tamanho do pack da frente. E o baralho antes do lance.

        O comentario do PackFan sempre prometeu isso — "girar pela base as
        apoia na mesma linha, que e como um leque de verdade se abre" — mas a
        animacao nunca abria nada: as tres posicoes eram estaticas entre si e
        so o grupo entrava. Os packs ja nasciam abertos.
      */
      gsap.set(fanItems, {
        xPercent: -50,
        rotation: 0,
        scale: 1,
        transformOrigin: 'bottom center',
      })

      const intro = gsap.timeline({
        paused: true,
        defaults: { ease: 'power3.out' },
        /*
          SEGURO DE ESTADO FINAL. Sem isto, a headline ficou presa com um
          transform residual de 85,95px depois de a entrada terminar — o pack
          completava e o texto nao, e na tela sobravam dois tracinhos.

          clearProps apaga o que a timeline escreveu e devolve o elemento ao
          estado natural do CSS. Qualquer resto, venha de onde vier, morre
          aqui. Conteudo nao pode depender de a animacao terminar limpa.
        */
        onComplete: () => {
          gsap.set(heading, { clearProps: 'transform' })
          gsap.set(entrance, {
            clearProps: 'transform,opacity,filter,willChange',
          })
        },
      })

      intro
        .to(heading, { yPercent: 0, duration: 0.9, stagger: 0.09 })
        .to(
          entrance,
          {
            yPercent: 0,
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 1.1,
          },
          '-=0.45',
        )
        /*
          O leque abre DEPOIS de o grupo ja estar chegando, nao junto: as duas
          coisas ao mesmo tempo viram uma papa de movimento e nenhuma das duas
          se le. Meio segundo de atraso deixa o bloco assentar primeiro.

          Stagger a partir do centro. O pack da frente e o que a pessoa esta
          olhando, entao ele para primeiro e os dois de tras abrem por baixo
          dele — na ordem inversa, o olho persegue o movimento para fora e
          volta, o que e o oposto do que a composicao quer.
        */
        .to(
          fanItems,
          {
            xPercent: (i) => fanRest[i].xPercent,
            rotation: (i) => fanRest[i].rotation,
            scale: (i) => fanRest[i].scale,
            duration: 0.85,
            ease: `back.out(${FAN_BACK})`,
            stagger: { from: 'center', each: 0.07 },
          },
          '-=0.55',
        )

      let fired = false
      const play = () => {
        if (fired) return
        fired = true
        intro.play()
      }

      const unsubscribe = onLoaderGate(play)
      const fallback = window.setTimeout(play, ENTRANCE_FALLBACK_MS)
      introCleanup = () => {
        unsubscribe()
        window.clearTimeout(fallback)
      }

      /*
        Parallax de saida. A tipografia sobe mais rapido que o pack, entao os
        dois planos se separam conforme a pagina sai — profundidade sem
        precisar de 3D, que e a premissa do projeto inteiro.
        So transform, nunca top/height (Secao 10).
      */
      const scrollTrigger = {
        trigger: root,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }

      gsap.to(typeRef.current, { yPercent: -22, ease: 'none', scrollTrigger })
      gsap.to(packRef.current, { yPercent: 6, ease: 'none', scrollTrigger })

      /*
        Indicador de scroll. Parte do publico chega pelo link da bio e nao
        descobre que ha pagina abaixo: a S1 ocupa a tela inteira e nao tem
        borda cortada visivel no celular.

        Dois elementos, dois donos, pela regra da Secao 3: o traco vive dentro
        do trilho e o sumico vive no wrapper. No mesmo elemento, os dois tweens
        disputariam a mesma opacidade e um apagaria o outro.

        UM TRACO QUE DESCE, e nao um pulso de opacidade — trocado em
        24/08/2026. O pulso ia de 0,7 a 0,25 numa linha de 1px sobre verde
        escuro: no piso ele sumia, e mesmo no topo dizia apenas "existe algo
        aqui", nunca "role para baixo". Direcao e o que a dica precisa
        comunicar, e opacidade nao tem direcao.

        So transform e opacity, dentro da Secao 10. O trilho e o gradiente
        estatico do CSS; quem se move e o traco, clipado pelo overflow.
      */
      const hint = gsap.timeline({ repeat: -1, repeatDelay: 0.4 })
      hint
        .set(hintDashRef.current, { yPercent: -110, opacity: 0 })
        .to(hintDashRef.current, { opacity: 1, duration: 0.3 })
        .to(hintDashRef.current, { yPercent: 300, duration: 1.5, ease: 'none' }, 0)
        .to(hintDashRef.current, { opacity: 0, duration: 0.35 }, 1.25)

      /*
        Some com o scroll, nao com temporizador: quem ja rolou nao precisa
        mais da dica, e quem parou para ler continua com ela. Preso ao scrub,
        ele tambem volta se a pessoa subir de novo.
      */
      gsap.to(hintRef.current, {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=15%',
          scrub: true,
        },
      })
    }, root)

    return () => {
      introCleanup?.()
      ctx.revert()
    }
  }, [prefersReducedMotion])

  return (
    <section
      ref={rootRef}
      id="s1"
      /*
        aria-label com o nome da marca, e nao aria-labelledby apontando para o
        h1. Desde que a headline virou o slogan, "Perpolpas" nao existia mais
        como texto no topo — so impresso no packshot, que e aria-hidden.

        Os dois atributos nao convivem: aria-labelledby vence aria-label, e o
        nome da marca seria ignorado em silencio. O h1 continua sendo lido
        como conteudo da secao; o que muda e o nome do marco de navegacao.
      */
      aria-label={CONTENT.brand.name}
      className="relative min-h-[100dvh] overflow-clip bg-brand-green-dk text-surface"
    >
      <Container /*
          content-center, e nao content-end: com o conteudo empurrado para a
          base sobrava cerca de um terco de tela vazio acima do kicker. O
          leque ja estava no lugar; o que precisava subir era o texto.
        */
        className="relative z-20 grid min-h-[100dvh] grid-cols-12 content-center gap-y-10 py-20 md:py-28">
        <div
          ref={typeRef}
          className="col-span-12 will-change-transform md:col-span-6 md:row-start-1"
        >
          <p className="font-body text-base leading-relaxed text-surface/70 md:text-lg">
            {CONTENT.hero.kicker}
          </p>

          {/*
            A tipografia sangra para fora do container no desktop. No mobile
            fica alinhada: com 6px de padding lateral, sangrar so produziria
            palavra cortada pela metade.
          */}
          {/*
            A headline e o slogan do rotulo, nao o nome da marca: o nome ja
            esta no logotipo, no pack e no rodape. Ver a nota em content.ts.
          */}
          {/*
            Uma janela recortada por linha, cada uma com o proprio span. E o
            que permite o stagger: as linhas sobem uma atras da outra por
            dentro do proprio recorte, em vez de o bloco inteiro aparecer.

            Sob reduced-motion o span nasce no lugar e nada se move (Secao 11).
          */}
          <h1
            id="s1-title"
            /*
              O corpo caiu de 12vw/8,5vw para 11vw/7,5vw. A linha mais longa
              tem 14 caracteres e o bloco de texto passou de 8 para 6 colunas
              quando o leque entrou; no tamanho anterior ela transbordava a
              coluna em viewport de desktop estreito.

              O RECUO E LIMITADO PELO PADDING DO CONTAINER, e essa e a correcao
              de 24/08/2026. Era `-ml-[3vw]` puro, e o Container tem `px-6` —
              24px fixos. A partir de 800px de viewport o recuo passa de 24px e
              a headline sai da tela:

                viewport   recuo   borda da h1
                     768    23,0          +1,0   ok
                     900    27,0          -3,0   corta
                    1024    30,7          -6,7   corta
                    1280    38,4         -14,4   corta
                    1440    43,2          +0,8   ok
                    1920    57,6           +226  ok

              A faixa quebrada ia de 801px a 1438px — 1024, 1280 e 1366, que
              sao as tres resolucoes de notebook mais comuns. A primeira letra
              de CADA linha ficava fora da tela. Acima de 1440 o container para
              de crescer em max-w-page e a margem de centralizacao salvava;
              abaixo de 800 o recuo ainda cabia. Some justamente nos extremos
              onde alguem testaria.

              min() resolve sem discutir a intencao: o recuo cresce com a tela
              ate encostar no limite do container e para ali. A headline fica
              rente a borda, nunca alem dela.

              Cuidado ao mexer: 24px aqui e o `px-6` do Container. Se o padding
              do container mudar, este numero muda junto ou o corte volta.
            */
            className="mt-4 font-display text-[11vw] leading-[0.88] tracking-tighter md:-ml-[min(3vw,24px)] md:text-[7.5vw]"
          >
            {lines.map((line, i) => (
              /*
                A JANELA DA MASCARA PRECISA CABER O GLIFO.

                leading-[0.88] deixa a caixa de linha MENOR que a altura real
                da Anton, que e condensada e alta. Com overflow-hidden por
                cima, o que sobra do glifo para fora da caixa some — o topo
                das letras aparecia aparado.

                O padding abre a janela e a margem negativa devolve o espaco
                ao layout, entao o ritmo entre as linhas nao muda: cresce a
                area pintada, nao a area ocupada.
              */
              <span
                key={i}
                className="-mt-[0.16em] -mb-[0.08em] block overflow-hidden pt-[0.16em] pb-[0.08em]"
              >
                <span
                  ref={(el) => {
                    lineRefs.current[i] = el
                  }}
                  className="block will-change-transform"
                  /*
                    Estado inicial no markup, e nao so no efeito: o gsap.set
                    roda depois da primeira pintura, entao a frase apareceria
                    inteira por um frame antes de se esconder para entrar.
                    Sob reduced-motion nasce no lugar.
                  */
                  style={
                    prefersReducedMotion
                      ? undefined
                      : { transform: 'translateY(110%)' }
                  }
                >
                  {line}
                </span>
              </span>
            ))}
          </h1>

          {/*
            O marcador de pendencia vem separado, e nao dentro do h1: no corpo
            da tipografia de display ele ocuparia meia tela.
          */}
          {isProvisional(CONTENT.hero.headline) && (
            <p className="mt-6">
              <ProvisionalMark question={CONTENT.hero.headline.question} />
            </p>
          )}

          {/*
            CTA de WhatsApp acima da dobra, pedido em 12/08/2026.

            Nao estava no SPEC — o unico CTA previsto era o do catalogo
            (Secao 8), la embaixo. Aqui ele existe porque o site substitui o
            Linktree: quem chega pelo link da bio precisa de um caminho para
            falar com a empresa antes de rolar a pagina inteira.

            Fica dentro do bloco de tipografia, entao sobe no parallax junto
            com ele — e o comportamento certo: o CTA pertence ao bloco de
            texto e sairia da composicao se ficasse parado enquanto o resto
            anda. O GSAP move o container; o <a> nao e tocado por ninguem.
          */}
          <a
            href={whatsappLink(CONTENT.contato.ctaMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex min-h-[44px] items-center rounded-md bg-surface px-6 font-body text-sm text-ink"
          >
            {CONTENT.contato.cta}
          </a>
        </div>

        {/*
          Pack deslocado e cortado pela borda inferior da secao. O corte e
          intencional: objeto inteiro e centralizado no meio da tela e
          exatamente a composicao que a Secao 5 proibe.
        */}
        {/*
          Packshot real, nao mais a composicao de 3 camadas: o arquivo do
          bacuri existe e esta publicado, e a S6 ja usa foto desde a revisao
          da Secao 4. Mesmo palco e mesma calibracao da cena heroi.

          lcp, e nao priority: este pack e o maior elemento acima da dobra,
          entao ele e o candidato a LCP da pagina. As fotos da S6 continuam
          rebaixadas para nao disputarem banda com ele.
        */}
        <div
          ref={packRef}
          /*
            Sangra pela borda de baixo, cortado pelo overflow-clip da secao
            (Secao 5: objeto inteiro e centralizado e proibido). A margem
            negativa anula o padding do Container — py-20 no mobile, py-28 a
            partir de md — e avanca 7vh alem dele.

            Em porcentagem nao funcionava: margem percentual resolve contra a
            largura da coluna, que no mobile e pequena demais para vencer os
            5rem de padding, e o pack ficava flutuando com folga embaixo.
          */
          /*
            PRIMEIRO ELEMENTO NO MOBILE, ultimo no desktop. `order-first`
            reordena so o visual; a ordem do DOM continua texto e depois
            imagem, que e a ordem certa para leitor de tela e para o
            navegador decidir o que carregar antes.

            A SANGRIA PELA BORDA DE BAIXO SAIU em 17/08/2026, nos dois
            breakpoints. Ela nasceu quando o heroi tinha UM pack, que podia
            vazar para fora da secao de proposito — a Secao 5 proibe objeto
            inteiro e centralizado, e o corte era a resposta a isso.

            Com tres packs em leque ela deixou de funcionar: apara a borda de
            baixo dos tres e le como defeito, nao como intencao. A assimetria
            que a Secao 5 pede continua existindo pela horizontal, que e o
            eixo onde ela sempre esteve — texto a esquerda, leque a direita,
            eixo de simetria nunca se formando.

            No lugar do corte, o leque fica centralizado na propria coluna.
          */
          className="order-first col-span-12 will-change-transform md:order-none md:col-span-6 md:col-start-7 md:row-start-1 md:self-center"
        >
          {/*
            Camadas aninhadas, uma por animacao, porque todas mexem em
            transform e varias no mesmo eixo. Empilhadas no mesmo elemento, a
            ultima a rodar apagaria as outras.

              packRef      parallax de saida, no scroll   (yPercent)
              entranceRef  entrada          (yPercent, scale, opacity, blur)
              PackFloat    flutuacao perpetua             (y)
              --- daqui para dentro, quem manda e o PackFan ---
              camada       parallax de mouse, por pack    (x, y)
              item         abertura do leque              (xPercent, rot, scale)

            O PARALLAX DE MOUSE DESCEU PARA DENTRO DO LEQUE em 24/08/2026.
            Ele vivia aqui, num wrapper unico, e movia os tres packs juntos —
            o que fazia o leque ler como figurinha plana. Agora cada pack e
            uma camada com fator proprio e o grupo nao tem mais wrapper de
            ponteiro: quem conhece a profundidade de cada pack e o PackFan,
            nao a secao.

            O grupo ainda respira e flutua como bloco. O que deixou de ser
            bloco e a resposta ao cursor e a chegada.
          */}
          <div
            ref={entranceRef}
          >
            <PackFloat>
              <PackFan />
            </PackFloat>
          </div>
        </div>

        {/*
          Indicador de scroll. Fora do bloco de tipografia de proposito: ele
          nao pode subir no parallax junto com o texto, senao sai da tela
          antes de cumprir a funcao.
        */}
        <div
          ref={hintRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-6 col-span-12 grid justify-items-center"
        >
          {/*
            O trilho ganha presenca para baixo por gradiente, e nao por
            opacidade uniforme. Isso da a ele um estado parado que ja aponta na
            direcao certa — e o que sobra sob reduced-motion, onde o efeito
            inteiro nao roda (o guard esta la em cima) e o traco nunca aparece,
            porque nasce com opacity-0 no CSS.
          */}
          <span className="relative block h-12 w-px overflow-hidden bg-linear-to-b from-surface/10 to-surface/80">
            <span
              ref={hintDashRef}
              className="absolute inset-x-0 top-0 block h-4 bg-surface opacity-0"
            />
          </span>
        </div>
      </Container>
    </section>
  )
}
