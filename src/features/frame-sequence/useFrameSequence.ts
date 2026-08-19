import { useEffect, useState } from 'react'
import type { FrameSequenceManifest } from './frame-sequence-assets'

export type FrameSequenceStatus = 'idle' | 'loading' | 'ready' | 'degraded'

export interface FrameSequenceState {
  status: FrameSequenceStatus
  /** 0 a 1. Alimenta a barra do loader da S0. */
  progress: number
  /** Vazio ate status virar 'ready'. */
  frames: HTMLImageElement[]
}

function initialState(
  manifest: FrameSequenceManifest | null,
): FrameSequenceState {
  return {
    status: manifest ? 'loading' : 'idle',
    progress: 0,
    frames: [],
  }
}

/*
  Carrega uma sequencia de frames inteira antes de liberar a cena.

  A Secao 7 e explicita: preload completo antes de liberar o pin, e se o
  preload nao terminar, a cena degrada para frame unico estatico sem travar o
  scroll. Pinar uma cena cujos frames ainda nao chegaram prende a pessoa numa
  tela em branco — em 4G irregular no Maranhao isso nao e caso raro, e a
  pessoa que trava sai do site.

  Por isso 'degraded' nao e erro: e um estado de operacao normal. Quem consome
  desenha o que tiver e nao pina nada.

  decode() antes de considerar pronto: sem isso o primeiro drawImage
  decodifica no meio do scrub e derruba o frame justamente na hora em que a
  pessoa esta olhando.
*/
export function useFrameSequence(
  manifest: FrameSequenceManifest | null,
): FrameSequenceState {
  const [state, setState] = useState<FrameSequenceState>(() =>
    initialState(manifest),
  )
  const [trackedManifest, setTrackedManifest] = useState(manifest)

  /*
    Reset durante o render, nao dentro do efeito. Trocar de manifesto e
    mudanca de prop, e o React resolve isso no proprio render — dentro do
    efeito viraria uma cascata de renders a cada troca.
  */
  if (trackedManifest !== manifest) {
    setTrackedManifest(manifest)
    setState(initialState(manifest))
  }

  useEffect(() => {
    if (!manifest) return

    let cancelled = false
    const isDesktop = window.matchMedia('(min-width: 768px)').matches
    let loaded = 0

    const load = (index: number) => {
      const image = new Image()
      image.decoding = 'async'
      image.src = manifest.srcFor(index, isDesktop)

      return image.decode().then(() => {
        loaded += 1
        if (!cancelled) {
          setState((prev) =>
            prev.status === 'loading'
              ? { ...prev, progress: loaded / manifest.count }
              : prev,
          )
        }
        return image
      })
    }

    Promise.all(Array.from({ length: manifest.count }, (_, i) => load(i)))
      .then((frames) => {
        if (cancelled) return
        setState({ status: 'ready', progress: 1, frames })
      })
      .catch(() => {
        if (cancelled) return
        /*
          Um frame que falha derruba a sequencia inteira, de proposito: meia
          sequencia produz salto visivel no scrub, que e pior que a versao
          estatica. O conteudo nunca dependeu da animacao (Secao 11).
        */
        setState({ status: 'degraded', progress: 0, frames: [] })
      })

    return () => {
      cancelled = true
    }
  }, [manifest])

  return state
}
