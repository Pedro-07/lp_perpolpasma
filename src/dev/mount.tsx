import { createRoot } from 'react-dom/client'
import { PhotoCalibrationPanel } from './PhotoCalibrationPanel'

/*
  FERRAMENTA DE DEV. DESCARTAVEL.

  Monta o painel em uma raiz React propria, fora de #root. E o que mantem o
  App.tsx limpo: nenhuma condicional de dev na arvore da pagina, e apagar o
  painel e apagar esta pasta mais o bloco de tres linhas no main.tsx.

  Fora de #root tambem por um motivo de comportamento: dentro da S6, um
  pointerdown no slider entraria no handler de arraste da cena e o scroll
  saltaria a cada ajuste.
*/
export function mountDevPanels() {
  const host = document.createElement('div')
  host.id = 'dev-panels'
  document.body.append(host)
  createRoot(host).render(<PhotoCalibrationPanel />)
}
