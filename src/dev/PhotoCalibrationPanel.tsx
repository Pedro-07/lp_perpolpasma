import { useCallback, useEffect, useMemo, useState } from 'react'
import { HERO_FLAVORS, type FlavorId } from '@/data/flavors'
import {
  HERO_STAGE_HEIGHT_VAR,
  PHOTO_CALIBRATION_ATTR,
  PHOTO_LAYER_ATTR,
  PHOTO_OFFSET_VAR,
  PHOTO_SCALE_VAR,
  photoCalibration,
} from '@/features/pack/pack-photos'

/*
  ============================================================
  FERRAMENTA DE DEV. DESCARTAVEL. APAGAR src/dev/ QUANDO FECHAR.
  ============================================================

  Existe porque a normalizacao automatica dos packshots nao convergiu e a
  Secao 4 do SPEC trocou aquele passo por calibracao no dado: cada sabor do
  heroi carrega photoScale e photoOffsetY em flavors.ts. Este painel e o que
  produz esses dois numeros — ajusta a olho, mostra o valor, e voce copia.

  Ele nao escreve em arquivo de proposito. Calibracao e decisao visual: quem
  aprova o numero e voce olhando a tela, e o valor so vira verdade depois de
  passar por um diff.

  Ele tambem nao entra no bundle de producao: quem monta e o bloco
  import.meta.env.DEV do main.tsx, que o Vite elimina no build.

  Como escreve na cena: sobrescreve as custom properties na propria <img>,
  achada pelo atributo de dado. Sem contexto, sem estado compartilhado, sem
  uma linha de codigo de dev dentro do componente de cena.
*/

const STORAGE_KEY = 'perpolpas:photo-calibration'
const STAGE_KEY = 'perpolpas:pack-stage'

/*
  Breakpoint md do Tailwind, o mesmo que a media query de index.css usa.
  Duplicado aqui de propria conta: e ferramenta de dev, e o dia que ela sair
  o numero sai junto.
*/
const DESKTOP_QUERY = '(min-width: 48rem)'

/** Altura do palco em dvh, por breakpoint. Espelha o :root de index.css. */
interface Stage {
  mobile: number
  desktop: number
}

const STAGE_DEFAULT: Stage = { mobile: 58, desktop: 74 }

/** Modo de visualizacao das camadas da S6 enquanto se calibra. */
type ViewMode = 'cena' | 'sobrepor' | 'solo'

interface Values {
  scale: number
  offsetY: number
}

type ValuesById = Record<string, Values>

const INITIAL: ValuesById = Object.fromEntries(
  HERO_FLAVORS.map((flavor) => [flavor.id, photoCalibration(flavor)]),
)

function readStored(): ValuesById {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL
    const parsed = JSON.parse(raw) as ValuesById
    // Sabor que saiu do heroi nao volta pela porta do localStorage.
    return Object.fromEntries(
      HERO_FLAVORS.map((flavor) => [
        flavor.id,
        parsed[flavor.id] ?? photoCalibration(flavor),
      ]),
    )
  } catch {
    return INITIAL
  }
}

/** Corta zero a direita: 1.100 vira 1.1, para o valor colado ficar limpo. */
function fmt(value: number, digits: number) {
  return Number(value.toFixed(digits)).toString()
}

function readStoredStage(): Stage {
  try {
    const raw = window.localStorage.getItem(STAGE_KEY)
    if (!raw) return STAGE_DEFAULT
    return { ...STAGE_DEFAULT, ...(JSON.parse(raw) as Partial<Stage>) }
  } catch {
    return STAGE_DEFAULT
  }
}

export function PhotoCalibrationPanel() {
  const [values, setValues] = useState<ValuesById>(readStored)
  const [stage, setStage] = useState(readStoredStage)
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia(DESKTOP_QUERY).matches,
  )
  const [focus, setFocus] = useState<FlavorId>(HERO_FLAVORS[0].id)
  const [mode, setMode] = useState<ViewMode>('cena')
  const [open, setOpen] = useState(true)
  const [copied, setCopied] = useState(false)

  // Qual dos dois valores esta em edicao depende da largura da janela.
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY)
    const onChange = () => setIsDesktop(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  /*
    Inline no :root vence a media query do index.css, entao so faz sentido
    escrever o valor do breakpoint ativo. Ao arrastar a janela para o outro
    lado, o efeito roda de novo e troca o valor.
  */
  useEffect(() => {
    const dvh = isDesktop ? stage.desktop : stage.mobile
    document.documentElement.style.setProperty(
      HERO_STAGE_HEIGHT_VAR,
      `${dvh}dvh`,
    )
    window.localStorage.setItem(STAGE_KEY, JSON.stringify(stage))
  }, [stage, isDesktop])

  // Escreve na cena. Roda a cada mexida de slider.
  useEffect(() => {
    for (const flavor of HERO_FLAVORS) {
      const value = values[flavor.id]
      if (!value) continue
      const nodes = document.querySelectorAll<HTMLElement>(
        `[${PHOTO_CALIBRATION_ATTR}="${flavor.id}"]`,
      )
      for (const node of nodes) {
        node.style.setProperty(PHOTO_SCALE_VAR, String(value.scale))
        node.style.setProperty(PHOTO_OFFSET_VAR, `${value.offsetY}%`)
      }
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values))
  }, [values])

  /*
    Modos de visualizacao por folha de estilo com !important, e nao por style
    inline nos elementos: a opacidade das camadas e do GSAP, e escrever inline
    seria apagado no proximo tick de scrub. Regra de CSS com !important vence
    o inline do GSAP e sobrevive ao scroll.
  */
  useEffect(() => {
    if (mode === 'cena') return

    const style = document.createElement('style')
    style.dataset.devCalibration = 'true'
    style.textContent =
      mode === 'sobrepor'
        ? `[${PHOTO_LAYER_ATTR}] { opacity: 0.45 !important; }`
        : `[${PHOTO_LAYER_ATTR}] { opacity: 0 !important; }
           [${PHOTO_LAYER_ATTR}="${focus}"] { opacity: 1 !important; }`
    document.head.append(style)

    return () => {
      style.remove()
    }
  }, [mode, focus])

  const set = useCallback((id: FlavorId, patch: Partial<Values>) => {
    setValues((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }, [])

  const snippet = useMemo(() => {
    const flavors = HERO_FLAVORS.map((flavor) => {
      const value = values[flavor.id]
      return [
        `// ${flavor.name}`,
        `photoScale: ${fmt(value.scale, 3)},`,
        `photoOffsetY: ${fmt(value.offsetY, 2)},`,
      ].join('\n')
    }).join('\n\n')

    return [
      '/* src/data/flavors.ts */',
      flavors,
      '',
      '/* src/styles/index.css */',
      `:root { ${HERO_STAGE_HEIGHT_VAR}: ${fmt(stage.mobile, 1)}dvh; }`,
      `@media (min-width: 48rem) {`,
      `  :root { ${HERO_STAGE_HEIGHT_VAR}: ${fmt(stage.desktop, 1)}dvh; }`,
      `}`,
    ].join('\n')
  }, [values, stage])

  const dirty =
    HERO_FLAVORS.some((flavor) => {
      const base = photoCalibration(flavor)
      const value = values[flavor.id]
      return value.scale !== base.scale || value.offsetY !== base.offsetY
    }) ||
    stage.mobile !== STAGE_DEFAULT.mobile ||
    stage.desktop !== STAGE_DEFAULT.desktop

  if (!open) {
    return (
      <button type="button" style={S.fab} onClick={() => setOpen(true)}>
        calibrar fotos{dirty ? ' *' : ''}
      </button>
    )
  }

  const current = values[focus]

  return (
    <aside style={S.panel}>
      <header style={S.header}>
        <strong style={S.title}>calibracao de packshot</strong>
        <button type="button" style={S.iconButton} onClick={() => setOpen(false)}>
          fechar
        </button>
      </header>

      <div style={S.row}>
        {HERO_FLAVORS.map((flavor) => (
          <button
            key={flavor.id}
            type="button"
            style={focus === flavor.id ? S.tabOn : S.tab}
            onClick={() => setFocus(flavor.id)}
          >
            {flavor.name}
          </button>
        ))}
      </div>

      <label style={S.label}>
        <span>
          photoScale <b style={S.value}>{fmt(current.scale, 3)}</b>
        </span>
        <input
          type="range"
          min={0.5}
          max={1.6}
          step={0.005}
          value={current.scale}
          style={S.range}
          onChange={(e) => set(focus, { scale: Number(e.target.value) })}
        />
      </label>

      <label style={S.label}>
        <span>
          photoOffsetY <b style={S.value}>{fmt(current.offsetY, 2)}%</b>
        </span>
        <input
          type="range"
          min={-30}
          max={30}
          step={0.25}
          value={current.offsetY}
          style={S.range}
          onChange={(e) => set(focus, { offsetY: Number(e.target.value) })}
        />
      </label>

      {/*
        Tamanho do pack na tela. Fica separado dos sliders de sabor porque e
        outra decisao: os de cima alinham as tres fotos entre si e valem em
        qualquer largura; este diz o quanto o conjunto ocupa, e muda por
        breakpoint. Escalar o palco escala tudo junto e nao desalinha nada.
      */}
      <label style={{ ...S.label, ...S.stageBlock }}>
        <span>
          altura do palco{' '}
          <b style={S.value}>
            {fmt(isDesktop ? stage.desktop : stage.mobile, 1)}dvh
          </b>
          <br />
          <span style={S.hint}>
            editando {isDesktop ? 'desktop' : 'mobile'}. estreite a janela
            abaixo de 48rem para ajustar o outro. o par vai junto no bloco
            copiado.
          </span>
        </span>
        <input
          type="range"
          min={30}
          max={95}
          step={0.5}
          value={isDesktop ? stage.desktop : stage.mobile}
          style={S.range}
          onChange={(e) =>
            setStage((prev) => ({
              ...prev,
              [isDesktop ? 'desktop' : 'mobile']: Number(e.target.value),
            }))
          }
        />
      </label>

      <div style={S.row}>
        {(['cena', 'sobrepor', 'solo'] as const).map((option) => (
          <button
            key={option}
            type="button"
            style={mode === option ? S.tabOn : S.tab}
            onClick={() => setMode(option)}
          >
            {option}
          </button>
        ))}
      </div>

      <p style={S.hint}>
        sobrepor mostra as tres a 45% para comparar alinhamento. solo isola o
        sabor em foco. cena devolve o controle ao scrub.
      </p>

      <pre style={S.snippet}>{snippet}</pre>

      <div style={S.row}>
        <button
          type="button"
          style={S.tab}
          onClick={() => {
            void navigator.clipboard.writeText(snippet).then(() => {
              setCopied(true)
              window.setTimeout(() => setCopied(false), 1200)
            })
          }}
        >
          {copied ? 'copiado' : 'copiar'}
        </button>
        <button
          type="button"
          style={S.tab}
          onClick={() => {
            window.localStorage.removeItem(STORAGE_KEY)
            window.localStorage.removeItem(STAGE_KEY)
            setValues(INITIAL)
            setStage(STAGE_DEFAULT)
          }}
        >
          voltar ao arquivo
        </button>
      </div>

      <p style={S.hint}>
        os valores vivem no localStorage ate serem colados em
        src/data/flavors.ts. enquanto o arquivo nao mudar, so esta maquina ve a
        calibracao.
      </p>
    </aside>
  )
}

const mono = 'ui-monospace, SFMono-Regular, Menlo, monospace'

const S = {
  fab: {
    position: 'fixed',
    bottom: 16,
    left: 16,
    zIndex: 9999,
    padding: '8px 12px',
    font: `12px ${mono}`,
    color: '#f7f5f0',
    background: '#14150f',
    border: '1px solid #4a4c42',
    borderRadius: 6,
    cursor: 'pointer',
  },
  panel: {
    position: 'fixed',
    bottom: 16,
    left: 16,
    zIndex: 9999,
    display: 'grid',
    gap: 10,
    width: 320,
    maxHeight: '80vh',
    overflowY: 'auto',
    padding: 12,
    font: `12px ${mono}`,
    color: '#f7f5f0',
    background: 'rgba(20, 21, 15, 0.95)',
    border: '1px solid #4a4c42',
    borderRadius: 8,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: { fontSize: 12, letterSpacing: 0.4, textTransform: 'uppercase' },
  iconButton: {
    padding: '2px 6px',
    font: `11px ${mono}`,
    color: '#b9bbb0',
    background: 'transparent',
    border: '1px solid #4a4c42',
    borderRadius: 4,
    cursor: 'pointer',
  },
  row: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  tab: {
    flex: '1 1 auto',
    padding: '6px 8px',
    font: `11px ${mono}`,
    color: '#b9bbb0',
    background: 'transparent',
    border: '1px solid #4a4c42',
    borderRadius: 4,
    cursor: 'pointer',
  },
  tabOn: {
    flex: '1 1 auto',
    padding: '6px 8px',
    font: `11px ${mono}`,
    color: '#14150f',
    background: '#e9d07a',
    border: '1px solid #e9d07a',
    borderRadius: 4,
    cursor: 'pointer',
  },
  label: { display: 'grid', gap: 4 },
  stageBlock: {
    paddingTop: 10,
    borderTop: '1px solid #33352c',
  },
  value: { color: '#e9d07a' },
  range: { width: '100%' },
  hint: { margin: 0, color: '#8b8d82', lineHeight: 1.45 },
  snippet: {
    margin: 0,
    padding: 8,
    background: '#0b0c08',
    border: '1px solid #33352c',
    borderRadius: 4,
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
  },
} satisfies Record<string, React.CSSProperties>
