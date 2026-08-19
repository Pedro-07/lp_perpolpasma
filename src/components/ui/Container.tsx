import type { ReactNode } from 'react'

/** Container unico do site: max-w-[1400px] mx-auto px-6 (Secao 5 do SPEC). */
export function Container({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`mx-auto w-full max-w-page px-6 ${className}`}>
      {children}
    </div>
  )
}
