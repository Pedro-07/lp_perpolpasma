import { isPending, isProvisional, type Confirmable } from '@/data/pending'

/*
  Marcador visivel de conteudo nao confirmado.

  Deliberadamente feio e deliberadamente presente no build de producao.
  Se isto chegar ao ar, e porque alguem publicou sem fechar a Secao 14 —
  e a falha precisa ser obvia na tela, nao silenciosa.
*/
export function PendingMark({ question }: { question: string }) {
  return (
    <span
      role="note"
      data-pending="true"
      className="inline-block border border-dashed border-current px-2 py-1 align-baseline font-mono text-xs leading-snug text-ink-soft opacity-80"
    >
      CONFIRMAR: {question}
    </span>
  )
}

/*
  Marcador de dado em uso mas nao confirmado.

  Discreto de proposito, ao contrario do PendingMark: o conteudo aqui esta
  publicado e legivel, e o aviso nao pode competir com ele. Mas precisa
  aparecer, senao a divergencia vira invisivel no dia em que alguem conferir.
*/
export function ProvisionalMark({ question }: { question: string }) {
  return (
    <span
      role="note"
      data-provisional="true"
      title={question}
      className="ml-2 inline-block border border-dashed border-current px-1 align-middle font-mono text-[0.65em] leading-normal text-ink-soft opacity-70"
    >
      a confirmar
    </span>
  )
}

/** Renderiza o texto confirmado, ou o marcador de pendencia no lugar dele. */
export function ConfirmableText({ value }: { value: Confirmable<string> }) {
  if (isPending(value)) return <PendingMark question={value.question} />
  if (isProvisional(value)) {
    return (
      <>
        {value.value}
        <ProvisionalMark question={value.question} />
      </>
    )
  }
  return <>{value}</>
}
