import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './app/App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/*
  Painel de calibracao dos packshots (Secao 4 do SPEC). Ferramenta temporaria:
  quando os photoScale/photoOffsetY dos tres sabores estiverem fechados em
  flavors.ts, apagar este bloco e a pasta src/dev/.

  Import dinamico dentro do if: no build de producao o Vite substitui
  import.meta.env.DEV por false, o bloco morre e o chunk nem chega a existir.
*/
if (import.meta.env.DEV) {
  void import('./dev/mount').then((m) => m.mountDevPanels())
}
