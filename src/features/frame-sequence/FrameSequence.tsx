import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useFrameSequence } from './useFrameSequence'
import type { FrameSequenceManifest } from './frame-sequence-assets'

/*
  Cena com scrub de sequencia de frames (Secao 7).

  Render em <canvas> via drawImage, nunca trocando o src de um <img>: trocar
  src reentra no pipeline de decodificacao a cada frame e engasga no mobile.
  Scrub de <video> tambem esta fora — e instavel no Safari iOS, que e o que
  motivou a sequencia WebP em primeiro lugar.

  O pin so nasce quando os frames estao carregados. Enquanto carrega, ou se
  degradar, a secao e uma secao comum e o scroll passa reto.
*/
export function FrameSequence({
  manifest,
  className = '',
}: {
  manifest: FrameSequenceManifest | null
  className?: string
}) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const { status, frames } = useFrameSequence(manifest)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status !== 'ready' || frames.length === 0) return
    const canvas = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return

    const context = canvas.getContext('2d')
    if (!context) return

    let current = -1

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = wrapper.getBoundingClientRect()
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      current = -1
    }

    // Cobre a area do wrapper sem deformar, como object-fit: cover.
    const drawFrame = (index: number) => {
      if (index === current) return
      current = index
      const image = frames[index] as HTMLImageElement
      const rect = wrapper.getBoundingClientRect()
      const scale = Math.max(
        rect.width / image.naturalWidth,
        rect.height / image.naturalHeight,
      )
      const w = image.naturalWidth * scale
      const h = image.naturalHeight * scale
      context.clearRect(0, 0, rect.width, rect.height)
      context.drawImage(image, (rect.width - w) / 2, (rect.height - h) / 2, w, h)
    }

    resize()
    drawFrame(0)
    window.addEventListener('resize', resize)

    // Sem movimento, a cena e o primeiro frame e mais nada (Secao 11).
    if (prefersReducedMotion) {
      return () => window.removeEventListener('resize', resize)
    }

    const ctx = gsap.context(() => {
      const state = { frame: 0 }
      gsap.to(state, {
        frame: frames.length - 1,
        ease: 'none',
        snap: 'frame',
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: () => `+=${window.innerHeight * 1.5}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
        onUpdate: () => drawFrame(Math.round(state.frame)),
      })
    }, wrapper)

    return () => {
      ctx.revert()
      window.removeEventListener('resize', resize)
    }
  }, [status, frames, prefersReducedMotion])

  // Sem manifesto nao ha cena. A secao segue estatica, sem buraco no layout.
  if (!manifest || status === 'degraded') return null

  return (
    <div
      ref={wrapperRef}
      className={`relative min-h-[100dvh] w-full ${className}`}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
