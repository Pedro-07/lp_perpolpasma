import { Suspense, lazy, useRef } from 'react'
import { PulpCanvas } from '@/features/pulp-canvas/PulpCanvas'
import { S0Loader } from '@/sections/S0Loader/S0Loader'
import { S1Hero } from '@/sections/S1Hero/S1Hero'
import { S2Sabores } from '@/sections/S2Sabores/S2Sabores'
import { S3CatalogoSkeleton } from '@/sections/S3Catalogo/S3CatalogoSkeleton'
import { S4Contato } from '@/sections/S4Contato/S4Contato'
import { SmoothScrollProvider } from '@/app/providers/SmoothScrollProvider'
import { CONTENT } from '@/data/content'
import { collectPending } from '@/data/pending'

/*
  Catalogo carregado a parte.

  A Framer Motion so e usada na S3, e nao pode pesar no bundle inicial: quem
  chega pelo link da bio em 4G irregular precisa do scroll primeiro, e o
  catalogo esta abaixo da dobra. GSAP e Lenis ficam no bundle inicial de
  proposito — o scroll e a experiencia, nao pode chegar atrasado.

  lazy() dispara o download no primeiro render, nao na hora que a secao
  aparece: o chunk baixa em paralelo, sem entrar no caminho critico de parse.
*/
const S3Catalogo = lazy(() =>
  import('@/sections/S3Catalogo/S3Catalogo').then((m) => ({
    default: m.S3Catalogo,
  })),
)

/*
  Auditoria de pendencias em dev. Vale mais que um comentario perdido:
  o console lista, a cada reload, tudo que ainda falta perguntar ao cliente.
*/
if (import.meta.env.DEV) {
  const open = collectPending(CONTENT)
  if (open.length > 0) {
    console.warn(
      `[perpolpas] ${open.length} pendencias de conteudo (SPEC, Secao 14):\n` +
        open.map((item) => `  - ${item}`).join('\n'),
    )
  }
}

export default function App() {
  /*
    Delimita ate onde o rio de polpa corre — S1 a S3. O canvas fica preso
    dentro deste wrapper, entao a S4 interrompe o efeito por geometria: nao
    existe momento em que ele possa vazar por cima do conteudo informativo.
  */
  const sceneRangeRef = useRef<HTMLDivElement>(null)

  return (
    <SmoothScrollProvider>
      <a
        href="#s2"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:grid focus:min-h-[44px] focus:place-items-center focus:bg-ink focus:px-4 focus:text-surface"
      >
        Ir para os sabores
      </a>

      {/* Nao monta enquanto nao houver asset critico para esperar. */}
      <S0Loader />

      <main>
        <div ref={sceneRangeRef} className="relative">
          <PulpCanvas rangeRef={sceneRangeRef} />

          <S1Hero />
          <S2Sabores />
          <Suspense fallback={<S3CatalogoSkeleton />}>
            <S3Catalogo />
          </Suspense>
        </div>

        <S4Contato />
      </main>
    </SmoothScrollProvider>
  )
}
