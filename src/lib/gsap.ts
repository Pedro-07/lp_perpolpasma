import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/*
  Ponto unico de configuracao do GSAP.

  Importar dagui, nunca de 'gsap' direto: registrar o plugin em varios lugares
  funciona por acidente (o modulo e cacheado pelo ESM), mas basta um arquivo
  esquecer o registro para o ScrollTrigger sumir em produccao depois do
  tree-shaking.
*/
gsap.registerPlugin(ScrollTrigger)

/*
  Lag smoothing desligado.

  Por padrao o GSAP assume que qualquer frame acima de 500ms foi uma travada do
  navegador e finge que passaram 33ms, para nao dar salto na animacao. Isso e
  bom para animacao dirigida por tempo e pessimo para scrub: aqui o tempo nao
  manda em nada, quem manda e a posicao do scroll. Com o lag smoothing ligado,
  o primeiro frame pesado no Android faz a timeline mentir sobre onde o dedo
  esta — que e exatamente o defeito que o scrub existe para nao ter.
*/
gsap.ticker.lagSmoothing(0)

export { gsap, ScrollTrigger }
