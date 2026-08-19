import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useLenisRef } from '@/app/providers/lenis-context'
import { criticalAssets } from '@/features/loader/preload-manifest'
import { releaseLoaderGate } from '@/features/loader/loader-gate'
import { CONTENT } from '@/data/content'

/*
  S0 — Loader. Poster estatico e barra de progresso do preload (Secao 6).

  Tres regras que valem mais que a aparencia dele:

  1. Se nao ha o que carregar, ele nao existe. A lista de assets criticos volta
     vazia enquanto os packshots nao chegarem, e nesse caso o componente nao
     monta. Loader sem carga e uma tela a mais entre a pessoa e o site.

  2. Ele nunca prende ninguem. O timeout dispensa o loader mesmo com asset
     faltando ou rede morta. Em 4G irregular no Maranhao, esperar para sempre
     nao e hipotese remota — e o caso que decide se a pessoa fica.

  3. Barra por scaleX, nunca por width. Animar largura recalcula layout a cada
     frame, justamente enquanto o navegador esta ocupado decodificando imagem
     (Secao 10).
*/

/** Teto de espera. Passou disso, o site abre com o que tiver. */
const TIMEOUT_MS = 6000

export function S0Loader() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const lenisRef = useLenisRef()
  // A lista e estavel durante a sessao: depende so de constante de build.
  const [assets] = useState(criticalAssets)
  const [progress, setProgress] = useState(0)
  const [dismissed, setDismissed] = useState(assets.length === 0)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (assets.length === 0) return

    let settled = false
    let loaded = 0

    const finish = () => {
      if (settled) return
      settled = true
      setDismissed(true)
    }

    const timeout = window.setTimeout(finish, TIMEOUT_MS)

    for (const src of assets) {
      const image = new Image()
      image.decoding = 'async'
      image.src = src
      // Falha de asset nao segura o site: conta como resolvido e segue.
      const count = () => {
        loaded += 1
        setProgress(loaded / assets.length)
        if (loaded === assets.length) finish()
      }
      image.decode().then(count, count)
    }

    return () => {
      settled = true
      window.clearTimeout(timeout)
    }
  }, [assets])

  /*
    Trava o scroll enquanto o loader estiver na frente. Sem isso, a pessoa
    rola por tras da cortina e chega na S6 com a timeline ja passada.
    Fallback para overflow no body porque sob prefers-reduced-motion nao
    existe instancia de Lenis.
  */
  useEffect(() => {
    if (dismissed) return

    const lenis = lenisRef?.current
    if (lenis) lenis.stop()
    else document.body.style.overflow = 'hidden'

    return () => {
      if (lenis) lenis.start()
      else document.body.style.overflow = ''
    }
  }, [dismissed, lenisRef])

  useEffect(() => {
    const bar = barRef.current
    if (bar) bar.style.transform = `scaleX(${progress})`
  }, [progress])

  /*
    Abre o portao da cena assim que a cortina sai — e "sair" inclui nunca ter
    entrado, que e o caso enquanto a lista de assets criticos volta vazia.
    A entrada da S1 pendura aqui; ver features/loader/loader-gate.ts.
  */
  useEffect(() => {
    if (dismissed) releaseLoaderGate()
  }, [dismissed])

  if (dismissed) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Carregando"
      className="fixed inset-0 z-50 grid place-items-center bg-brand-green-dk text-surface"
      style={{
        transition: prefersReducedMotion ? undefined : 'opacity 400ms ease',
      }}
    >
      <div className="grid w-full max-w-[320px] gap-6 px-6">
        <p className="text-center font-display text-4xl tracking-tighter">
          {CONTENT.brand.name}
        </p>

        <div className="h-[2px] w-full bg-surface/25">
          <div
            ref={barRef}
            className="h-full w-full origin-left bg-surface"
            style={{
              transform: 'scaleX(0)',
              transition: prefersReducedMotion
                ? undefined
                : 'transform 200ms linear',
            }}
          />
        </div>
      </div>
    </div>
  )
}
