/*
  Portao de entrada da pagina: quando a cortina saiu e a cena pode comecar.

  Existe porque a entrada da S1 depende da saida do loader, e o loader tem
  tres finais diferentes — preload concluido, timeout de 6s, ou nem montar,
  que e o caso de hoje, com a lista de assets criticos vazia. Sem um ponto
  unico, a S1 teria que adivinhar em qual dos tres esta.

  Modulo e nao contexto de proposito: quem espera nao re-renderiza quando o
  portao abre, ele so recebe o aviso. Contexto obrigaria a S1 a re-renderizar
  no meio da montagem para descobrir algo que ela so precisa saber uma vez.

  Guarda o estado resolvido: quem assinar DEPOIS da abertura e chamado na
  hora. Sem isso a ordem de montagem viraria corrida — hoje o loader dispensa
  a si mesmo no primeiro efeito, antes da S1 assinar.
*/

let released = false
const waiting = new Set<() => void>()

/** Chamado pelo loader quando ele sai de cena, por qualquer um dos finais. */
export function releaseLoaderGate() {
  if (released) return
  released = true
  for (const listener of waiting) listener()
  waiting.clear()
}

/** Avisa quando a cena pode comecar. Devolve a funcao de cancelamento. */
export function onLoaderGate(listener: () => void): () => void {
  if (released) {
    listener()
    return () => {}
  }
  waiting.add(listener)
  return () => {
    waiting.delete(listener)
  }
}
