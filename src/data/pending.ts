/*
  Mecanismo para conteudo marcado [CONFIRMAR] no SPEC.

  Regra 1 da Secao 0: nada marcado [CONFIRMAR] pode ser preenchido com texto
  plausivel. Um comentario // TODO nao basta — some no build e o site vai ao ar
  com lacuna invisivel. Entao a pendencia e um valor: atravessa o type system,
  e renderizada como marcador visivel e aparece no console em dev.

  Quando o cliente responder, troque `pending('...')` pelo texto real.
  A tipagem obriga a tratar os dois casos ate la.
*/

export interface Pending {
  readonly __pending: true
  /** A pergunta exata que precisa ser feita ao cliente. */
  readonly question: string
}

/*
  Terceiro estado, criado em 12/08/2026: o dado que ESTA EM USO e mesmo assim
  nao esta confirmado.

  Apareceu com o numero da rua. O Google Business da empresa diz 50 e o
  registro do CNPJ diz 10. O site precisa publicar um endereco — endereco
  ausente e pior que endereco provavelmente certo — mas publicar sem
  registrar a divergencia faz o problema desaparecer de vista.

  Diferente de Pending: aqui existe valor e ele e renderizado. O marcador
  aparece ao lado, discreto, e a auditoria do console conta junto.
*/
export interface Provisional<T> {
  readonly __provisional: true
  readonly value: T
  /** O que precisa ser confirmado, e por que este valor foi escolhido. */
  readonly question: string
}

/** Um valor que ainda depende de confirmacao do cliente. */
export type Confirmable<T> = T | Pending | Provisional<T>

export function pending(question: string): Pending {
  return { __pending: true, question }
}

export function provisional<T>(value: T, question: string): Provisional<T> {
  return { __provisional: true, value, question }
}

export function isPending<T>(value: Confirmable<T>): value is Pending {
  return typeof value === 'object' && value !== null && '__pending' in value
}

export function isProvisional<T>(
  value: Confirmable<T>,
): value is Provisional<T> {
  return typeof value === 'object' && value !== null && '__provisional' in value
}

/*
  O texto utilizavel, ou null quando nao existe valor nenhum.

  Serve para quem precisa do texto solto em vez do componente — titulo dentro
  de uma tipografia gigante, por exemplo, onde o marcador de pendencia nao
  pode ir junto no meio da frase.
*/
export function textOf(value: Confirmable<string>): string | null {
  if (isPending(value)) return null
  if (isProvisional(value)) return value.value
  return value
}

/** Coleta toda pendencia de uma arvore de conteudo, para auditoria. */
export function collectPending(node: unknown, path = ''): string[] {
  if (isPending(node as Confirmable<unknown>)) {
    return [`${path}: ${(node as Pending).question}`]
  }
  /*
    Antes do ramo de objeto: Provisional E um objeto, e a recursao generica
    desceria para value e question e nao acharia pendencia nenhuma — o item
    sumiria da auditoria, que e exatamente o que este tipo existe para evitar.
  */
  if (isProvisional(node as Confirmable<unknown>)) {
    const item = node as Provisional<unknown>
    return [`${path}: [EM USO, A CONFIRMAR] ${item.question}`]
  }
  if (Array.isArray(node)) {
    return node.flatMap((item, i) => collectPending(item, `${path}[${i}]`))
  }
  if (typeof node === 'object' && node !== null) {
    return Object.entries(node).flatMap(([key, value]) =>
      collectPending(value, path ? `${path}.${key}` : key),
    )
  }
  return []
}
