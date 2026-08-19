import { Section } from '@/components/ui/Section'
import { HERO_STAGE_RATIO } from '@/features/pack/pack-photos'
import { CONTENT } from '@/data/content'
import { FLAVORS, PACK } from '@/data/flavors'

/*
  Fallback do Suspense enquanto o chunk do catalogo carrega.

  Deliberadamente igual ao catalogo real, menos a interatividade: mesma grid,
  mesma caixa de pack, mesmos textos. Um fallback generico ("carregando")
  mudaria a altura da secao quando o chunk chegasse, e layout shift em cima de
  um site de scroll dirigido e pior que o peso que a divisao economiza.

  A caixa do pack e um retangulo neutro desde 18/08/2026. Ela desenhava o pack
  composto, que saiu da arvore — e esqueleto nao precisa desenhar produto: o
  que ele precisa e ocupar a MESMA altura, para nada saltar na troca.

  Nada aqui depende da Framer Motion — e esse o ponto.
*/
export function S3CatalogoSkeleton() {
  return (
    <Section id="s3" title={CONTENT.catalogo.title}>
      <ul aria-busy="true" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {FLAVORS.map((flavor) => (
          <li key={flavor.id} className="grid gap-3 rounded-lg bg-ink/5 p-4">
            <div
              aria-hidden="true"
              className="w-full rounded-md bg-ink/10"
              style={{ aspectRatio: HERO_STAGE_RATIO }}
            />
            <div>
              <h3 className="font-display text-xl tracking-tighter">
                {flavor.name}
              </h3>
              <p className="font-body text-sm text-ink-soft">
                {PACK.units} x {PACK.unitGrams} g
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  )
}
