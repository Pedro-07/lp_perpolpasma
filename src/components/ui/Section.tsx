import type { ReactNode } from 'react'
import { Container } from './Container'

/*
  A prop `eyebrow` saiu em 13/08/2026, junto com a estrutura de 11 secoes: ela
  numerava as quatro etapas de processo, que agora sao uma lista dentro da
  Historia e carregam a propria numeracao.
*/
interface SectionProps {
  /** Ancora e id do heading. Usar o codigo do SPEC: s1, s2, ... */
  id: string
  title: string
  /** Heading visualmente oculto, quando o titulo ja aparece na arte. */
  titleHidden?: boolean
  /**
   * Aplica min-h-[100dvh]. Nunca altura fixa em vh: layout jumping no
   * Safari mobile (Secao 2 do SPEC).
   * O nome daquela classe proibida nao aparece escrito aqui de proposito —
   * o Tailwind v4 varre o texto do arquivo, comentario incluso, e geraria
   * a classe no bundle so por ser mencionada.
   */
  fullHeight?: boolean
  className?: string
  children?: ReactNode
}

export function Section({
  id,
  title,
  titleHidden = false,
  fullHeight = false,
  className = '',
  children,
}: SectionProps) {
  const headingId = `${id}-title`

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`relative w-full ${fullHeight ? 'min-h-[100dvh]' : ''} ${className}`}
    >
      {/* z-20: conteudo sempre acima do canvas de particulas (z-10). */}
      <Container className="relative z-20 grid gap-8 py-20 md:py-28">
        <h2
          id={headingId}
          className={
            titleHidden
              ? 'sr-only'
              : 'font-display text-5xl leading-[0.9] tracking-tighter md:text-8xl'
          }
        >
          {title}
        </h2>
        {children}
      </Container>
    </section>
  )
}
