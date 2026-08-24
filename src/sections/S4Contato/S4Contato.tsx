import { Section } from '@/components/ui/Section'
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

  Sobraram DOIS botoes, e a diferenca entre eles e proposital. O secundario
  contornado sumiu em 20/08/2026, quando o mapa passou a abrir sozinho e o
  Instagram virou texto — nenhum dos dois disputa com o pedido.

  O primario usa --brand-green-dk, e nao --brand-green, desde 18/08/2026.

  O token estava sendo renderizado certo — o problema e o proprio token: o
  verde da marca medido nos oito rotulos tem azul MUITO mais baixo (#177012 de
  mediana) que o #167A33 do design system, que puxa para o azulado e por isso
  le como verde de aplicativo. Enquanto o vetor do logotipo nao chega para
  fechar a cor (Secao 5), o escuro da marca resolve: e mais fechado, ja existe
  no sistema e nao inventa valor nenhum.

  UM VERDE SO, o da paleta — decisao do Pedro em 20/08/2026, que reverte o
  verde do aplicativo introduzido no mesmo dia.

  O botao do numero chegou a usar #25D366 para identificar o canal. Voltou
  para --brand-green-dk com texto em surface, igual ao heroi: o site tem uma
  paleta, e cor de terceiro dentro dela chama atencao para o aplicativo em vez
  de para a marca.

  O ICONE FICA. Ele identifica o canal sozinho, que era o papel que a cor
  estava tentando cumprir — e faz isso sem gastar uma cor fora da paleta.

  Consequencia a saber: os dois botoes da secao ficaram visualmente iguais.
  Quem quiser devolver hierarquia ao pedido tem duas saidas sem sair da
  paleta — contornar o botao do numero em vez de preenche-lo, ou reduzir o
  corpo dele. Nao fiz nenhuma das duas porque nao foi pedido.
*/
const BUTTON_BASE =
  'inline-flex min-h-[44px] items-center justify-center rounded-md px-6 font-body text-sm'
const BUTTON_PRIMARY = `${BUTTON_BASE} bg-brand-green-dk text-surface`
/*
  Botao do numero: o mesmo verde e o mesmo texto do heroi, mais o icone.
  Surface sobre o escuro da marca da 10,05:1, AAA.

  "Branco" aqui e o off-white da paleta, #F7F5F0, e nao #FFF puro — e o mesmo
  tom que a S1 e o loader usam sobre o mesmo fundo.
*/
const BUTTON_WHATSAPP = `${BUTTON_PRIMARY} gap-2`

export function S4Contato() {
  const year = new Date().getFullYear()
  /*
    O logotipo esta em `provisional`, entao o valor vem embrulhado. Desempacota
    uma vez aqui em vez de repetir `.value` em cada atributo da <img>.
  */
  const logo = CONTENT.brand.logo.value

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
              className={BUTTON_WHATSAPP}
            >
              {/*
                Balao com fone, desenhado aqui — nao e o logotipo oficial da
                Meta. Identifica o canal sem embutir arquivo de marca de
                terceiro, mesma escolha do icone do Instagram no rodape.
              */}
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.5 11.6a8.4 8.4 0 0 1-12.3 7.4L3.5 20.5l1.6-4.6A8.4 8.4 0 1 1 20.5 11.6Z" />
                <path
                  d="M9.2 9c.2 1.9 1.6 3.9 3.6 4.9l1.2-1.1 2.1 1c-.3 1-1.3 1.6-2.4 1.4-2.9-.6-5.3-3-5.9-5.9-.2-1.1.4-2.1 1.4-2.4Z"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
              {CONTENT.contato.whatsapp}
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

      {/*
        Faixa 2 — o mapa, fora da grade e em largura inteira.

        MAPA ABERTO, sem clique — decisao do Pedro em 20/08/2026, que reverte
        o click-to-load de 17/08.

        O que se perde fica registrado: `loading="lazy"` adia o download mas
        NAO adia o cookie de terceiro para quem rola ate aqui, e esta e a
        ultima secao — quem chega e justamente quem rola ate o fim. O site
        continua sem aviso de cookies e sem politica de privacidade, esta por
        decisao de 17/08.

        Proporcao por aspect-ratio e nao por altura fixa: altura fixa deixaria
        faixa vazia no desktop e mapa achatado no celular.
      */}
      <div className="mt-16 border-t border-ink/15 pt-10">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border border-ink/15 md:aspect-[21/9]">
          <iframe
            src={CONTENT.contato.mapEmbed}
            title={`Mapa da fábrica em ${CONTENT.brand.city}`}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="block h-full w-full border-0"
          />
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
            O LOGOTIPO ENTROU em 22/08/2026 e substituiu o nome em corpo
            semibold que segurava este lugar desde 18/08. Aquele texto existia
            porque nao havia arte nenhuma — a Anton tinha sido descartada
            antes dele por fingir ser a tipografia da marca sem ser, e o
            aviso continua valendo: nenhuma fonte de display da pagina e a
            tipografia da Perpolpas, entao nenhuma pode substituir o
            logotipo se um dia esta imagem sair daqui.

            A arte ainda nao e o vetor original: e uma versao redesenhada, sem
            o ® do rotulo. O que muda em relacao ao dia 19, quando uma imagem
            parecida foi recusada, e so a decisao do Pedro de publicar assim.

            SEM MARCADOR NA TELA desde 24/08/2026, a pedido dele. O campo
            continua `provisional` em content.ts, entao a divergencia segue
            escrita e a auditoria do console continua contando — o que saiu
            foi so o aviso visivel, que ficava logo abaixo do logotipo.

            Consequencia: o rodape agora nao denuncia mais nada. Quem abrir a
            pagina sem conhecer o historico ve uma marca fechada. O unico
            lugar onde a ressalva ainda aparece e o console em dev e a Secao 5
            do SPEC.

            width e height vem do dado para o browser reservar a caixa antes
            do download. A largura de tela e menor que a intrinseca de
            proposito: 640 px de arquivo para ~208 px na tela cobrem tela
            retina sem depender de srcset para uma imagem so.
          */}
          <img
            src={logo.src}
            alt={logo.alt}
            width={logo.width}
            height={logo.height}
            /*
              O rodape e a ultima coisa da pagina. Nao ha motivo para este
              arquivo disputar banda com o packshot que decide o LCP.
            */
            loading="lazy"
            decoding="async"
            className="h-auto w-[13rem] max-w-full"
          />
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
              {CONTENT.contato.whatsapp}
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
          <div className="grid gap-1">
            <dt className="text-ink-soft">Instagram</dt>
            <dd>
              {/*
                Texto com icone, e nao botao. O botao dava a este item o mesmo
                peso do CTA de pedido, que e a unica acao que o site quer — e
                perfil de rede nao disputa com pedido.

                O icone e desenho proprio, nao o logotipo da Meta: retangulo
                arredondado com lente e ponto. Identifica a rede sem embutir
                marca de terceiro.

                RISCO CONHECIDO: o handle nao esta fechado. O Pedro confirmou
                @perpolpasma e o rotulo do maracuja traz @perpolpasbr.
              */}
              <a
                href={`https://instagram.com/${CONTENT.social.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 underline underline-offset-4"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
                </svg>
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
