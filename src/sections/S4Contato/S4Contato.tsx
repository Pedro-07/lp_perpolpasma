import { useState } from 'react'
import { Section } from '@/components/ui/Section'
import { ConfirmableText } from '@/components/ui/Pending'
import { CONTENT, whatsappLink } from '@/data/content'

/*
  S4 — Como pedir. Ultima secao do site, e onde o canvas de particulas para.

  LAYOUT EM FAIXAS, revisado em 17/08/2026. A versao anterior punha tudo numa
  lista de duas colunas, e o mapa era um item dela: com um iframe de 400px
  dentro de uma celula, a linha inteira do grid crescia para caber ele e a
  celula vizinha ficava com um vazio do mesmo tamanho. O buraco nao era
  espacamento errado, era o mapa dentro da grade.

  Agora cada coisa tem a faixa dela:

    1. dados       tres colunas de altura parecida, que se equilibram sozinhas
    2. mapa        fora da grade, largura inteira, sem vizinho para desalinhar
    3. CTA         faixa propria, para o botao deixar de ser item de lista
    4. registro    informacao legal, corpo menor

  Desde 17/08/2026 esta secao voltou a ter UMA pendencia: o telefone, que e
  critica. Endereco, horario, mapa e dados de registro seguem confirmados.
*/

/*
  Mensagem pre-preenchida. Texto de interface: diz de onde a pessoa veio, e
  nada sobre o produto. Afirmacao sobre composicao so entra depois que a
  redacao legal voltar (Secao 14).
*/
const CONTATO_MESSAGE = 'Olá! Vim pelo site da Perpolpas.'

/*
  A secao e de ACAO: quem chega aqui ja decidiu falar com a empresa. Alvo de
  44px (Secao 9).

  O primario usa --brand-green-dk, e nao --brand-green, desde 18/08/2026.

  O token estava sendo renderizado certo — o problema e o proprio token: o
  verde da marca medido nos oito rotulos tem azul MUITO mais baixo (#177012 de
  mediana) que o #167A33 do design system, que puxa para o azulado e por isso
  le como verde de aplicativo. Enquanto o vetor do logotipo nao chega para
  fechar a cor (Secao 5), o escuro da marca resolve: e mais fechado, ja existe
  no sistema e nao inventa valor nenhum.

  Nao entra icone: emoji e proibido (Secao 2) e o logotipo do WhatsApp e marca
  de terceiro, que reforcaria exatamente a leitura errada.
*/
const BUTTON_BASE =
  'inline-flex min-h-[44px] items-center justify-center rounded-md px-6 font-body text-sm'
const BUTTON_PRIMARY = `${BUTTON_BASE} bg-brand-green-dk text-surface`
const BUTTON_SECONDARY = `${BUTTON_BASE} border border-ink/25 text-ink`

export function S4Contato() {
  /*
    CLICK-TO-LOAD do mapa. O iframe do Google so entra na pagina depois de
    alguem pedir.

    `loading="lazy"` sozinho nao resolvia: ele adia o download, mas nao adia o
    cookie de terceiro — quem rola ate o fim carrega o Google do mesmo jeito,
    e esta e a ultima secao, entao quem chega aqui e justamente quem vai rolar
    ate o fim. Imagem estatica tambem nao servia: a legitima exige chave da
    Static Maps API com faturamento, e captura de tela tem restricao de
    licenca — trocaria peso por problema de licenciamento.

    Assim o custo de terceiro e ZERO ate o clique, sem chave de API e sem
    questao de licenca. Ver Secao 10.
  */
  const [mapaCarregado, setMapaCarregado] = useState(false)
  const year = new Date().getFullYear()

  return (
    <Section id="s4" title={CONTENT.contato.title}>
      {/* Faixa 1 — os tres dados, em colunas de altura parecida. */}
      <dl className="grid gap-8 md:grid-cols-3">
        <div className="grid content-start gap-3">
          <dt className="font-body text-sm tracking-wide text-ink-soft uppercase">
            WhatsApp
          </dt>
          <dd className="grid justify-items-start gap-2">
            <a
              href={whatsappLink(CONTATO_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className={BUTTON_SECONDARY}
            >
              <ConfirmableText value={CONTENT.contato.whatsapp} />
            </a>
          </dd>
        </div>

        <div className="grid content-start gap-3">
          <dt className="font-body text-sm tracking-wide text-ink-soft uppercase">
            Horário
          </dt>
          <dd className="font-body text-base leading-relaxed">
            {CONTENT.contato.hours}
          </dd>
        </div>

        <div className="grid content-start gap-3">
          <dt className="font-body text-sm tracking-wide text-ink-soft uppercase">
            Endereço
          </dt>
          <dd className="font-body text-base leading-relaxed">
            {/*
              Endereco como texto. O link do mapa saiu daqui: ele aparecia
              duas vezes, no botao externo e dentro do proprio iframe.
            */}
            <address className="not-italic">{CONTENT.contato.address}</address>
          </dd>
        </div>
      </dl>

      {/* Faixa 2 — o mapa, fora da grade e em largura inteira. */}
      <div className="mt-16 border-t border-ink/15 pt-10">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border border-ink/15 md:aspect-[21/9]">
          {mapaCarregado ? (
            <iframe
              src={CONTENT.contato.mapEmbed}
              title={`Mapa da fábrica em ${CONTENT.brand.city}`}
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="block h-full w-full border-0"
            />
          ) : (
            /*
              A moldura vazia tem a MESMA proporcao do iframe, entao trocar um
              pelo outro nao desloca nada abaixo — sem salto de layout.
            */
            <div className="grid h-full place-items-center bg-ink/5 px-6">
              <div className="grid justify-items-center gap-4 text-center">
                <p className="max-w-[44ch] font-body text-sm leading-relaxed text-ink-soft">
                  O mapa é carregado do Google e só entra na página quando você
                  pede. Assim ele não pesa nem deixa cookie de terceiro para
                  quem não vai usá-lo.
                </p>
                <button
                  type="button"
                  onClick={() => setMapaCarregado(true)}
                  className={BUTTON_SECONDARY}
                >
                  Ver o mapa
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/*
        Faixa 3 — fechamento. O respiro em volta do CTA foi de 4rem para
        2,5rem em 18/08/2026: a correcao do CTA orfao tinha ido longe demais e
        abriu um vao entre ele e o rodape.
      */}
      <div className="mt-10 grid justify-items-start gap-4 border-t border-ink/15 pt-8">
        <p className="max-w-[32ch] font-display text-3xl leading-tight tracking-tighter md:text-4xl">
          Faça seu pedido pelo WhatsApp.
        </p>
        <a
          href={whatsappLink(CONTENT.contato.ctaMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className={BUTTON_PRIMARY}
        >
          {CONTENT.contato.cta}
        </a>
      </div>

      {/* Faixa 4 — rodape. */}
      <div className="mt-10 grid gap-8 border-t border-ink/15 pt-8 md:grid-cols-12">
        <div className="grid content-start gap-3 md:col-span-5">
          {/*
            O NOME NAO ESTA EM DISPLAY, e isso e deliberado desde 18/08/2026.

            Anton nao e a tipografia do logotipo da Perpolpas — ela so estava
            fingindo ser. Fechar uma pagina com um nome em fonte de display
            errada e pior que fecha-la sem logotipo: parece decisao, e nao
            falta. Em corpo comum, com o marcador ao lado, a falta fica
            visivel e some no dia em que o vetor chegar.
          */}
          {/*
            Peso sem fonte de display. O nome estava menor que o rotulo
            "Razao social" ao lado — a empresa nao pode ser o menor elemento
            do proprio rodape. Corpo maior, peso semibold e entrelinha
            apertada dao presenca sem a Anton, que nao e a tipografia do
            logotipo e so estava fingindo ser.
          */}
          <p className="font-body text-2xl leading-tight font-semibold tracking-tight">
            {CONTENT.brand.name}
          </p>
          <p className="text-xs">
            <ConfirmableText value={CONTENT.brand.logo} />
          </p>
          <p className="font-body text-sm text-ink-soft">
            {CONTENT.brand.city}, {CONTENT.brand.state}
          </p>

          {/*
            Contato repetido no rodape. Quem rolou ate o fim e decidiu falar
            nao pode ter que voltar para achar o numero — e o fim da pagina e
            justamente onde essa decisao acontece.
          */}
          <div className="mt-2 grid justify-items-start gap-2 font-body text-sm">
            <a
              href={whatsappLink(CONTATO_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              <ConfirmableText value={CONTENT.contato.whatsapp} />
            </a>
            <address className="not-italic text-ink-soft">
              {CONTENT.contato.address}
            </address>
          </div>
        </div>

        <dl className="grid content-start gap-4 text-sm md:col-span-7">
          <div className="grid gap-1">
            <dt className="text-ink-soft">Razão social</dt>
            <dd>{CONTENT.brand.legalName}</dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-ink-soft">CNPJ</dt>
            <dd>{CONTENT.brand.cnpj}</dd>
          </div>
          <div className="grid justify-items-start gap-2">
            <dt className="text-ink-soft">Instagram</dt>
            <dd>
              {/*
                RISCO CONHECIDO: o handle nao esta fechado. O Pedro confirmou
                @perpolpasma e o rotulo do maracuja traz @perpolpasbr. Como
                botao, um @ errado e um clique que nao chega a lugar nenhum.
              */}
              <a
                href={`https://instagram.com/${CONTENT.social.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className={BUTTON_SECONDARY}
              >
                {CONTENT.social.instagram}
              </a>
            </dd>
          </div>
        </dl>

        {/* Sem o simbolo, "2026 Perpolpas" parecia erro de digitacao. */}
        <p className="font-body text-xs text-ink-soft md:col-span-12">
          &copy; {year} {CONTENT.brand.name}
        </p>
      </div>
    </Section>
  )
}
