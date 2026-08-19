/*
  Manifestos das sequencias de frames das cenas S2 a S5 (Secao 7 do SPEC).

  ============================================================
  NENHUMA SEQUENCIA EXISTE AINDA.
  ============================================================

  Os frames dependem de captacao na fabrica, que e Fase 2 no SPEC (Secao 13).
  A Fase 1 aceita S2 a S5 estaticas ou com uma unica sequencia — entao o
  mecanismo esta pronto e desligado, esperando arquivo.

  Para ligar uma cena:
    1. Exportar 24 a 36 frames WebP, qualidade 75, em duas larguras:
       /public/frames/<id>/1280/0001.webp ... (desktop)
       /public/frames/<id>/720/0001.webp  ... (mobile)
    2. Trocar o null abaixo por frameSequence('<id>', <quantidade>).

  Mais de 36 frames nao melhora percepcao e estoura o orcamento de 1,2 MB
  no mobile (Secao 10).
*/

export interface FrameSequenceManifest {
  id: string
  count: number
  /** Largura escolhida por viewport, nao por densidade de tela. */
  widthFor: (isDesktop: boolean) => 1280 | 720
  srcFor: (index: number, isDesktop: boolean) => string
}

export function frameSequence(id: string, count: number): FrameSequenceManifest {
  const widthFor = (isDesktop: boolean) => (isDesktop ? 1280 : 720) as 1280 | 720

  return {
    id,
    count,
    widthFor,
    srcFor: (index, isDesktop) =>
      `/frames/${id}/${widthFor(isDesktop)}/${String(index + 1).padStart(4, '0')}.webp`,
  }
}

/**
 * S5 — Envase. A polpa entrando no tubo, a selagem, o pack se formando.
 * Escolhida como a unica cena com scrub da Fase 1: e a que mostra o produto
 * existindo, e nao depende de foto de equipe nem de fachada.
 */
export const ENVASE_SEQUENCE: FrameSequenceManifest | null = null
