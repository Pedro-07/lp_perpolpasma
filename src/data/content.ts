import { pending, type Confirmable } from './pending'

/*
  Toda copy do site.

  Criterio para escrever texto aqui: o SPEC afirma o fato em algum lugar.
  Se o fato esta na lista da Secao 14, ou se e afirmacao legal/comercial que
  o SPEC nao faz, vira pending() — nao vira texto plausivel.

  Titulos de secao sao transcricao da tabela da Secao 6, nao copy inventada.
*/

export interface ProofItem {
  label: Confirmable<string>
  detail: Confirmable<string>
  /** Ocupa a linha inteira, em corpo maior. So um item por vez. */
  highlight?: boolean
}

/** Data de abertura, registro do CNPJ. Confirmada em 12/08/2026. */
const FOUNDING_DATE = '2001-08-23'

export const CONTENT = {
  brand: {
    /*
      Dados de registro confirmados em 12/08/2026.

      `name` e "Perpolpas", sem hifen, porque e assim que aparece no logotipo
      e no rotulo — a marca na tela segue o produto fisico, nao a Junta
      Comercial. O nome fantasia registrado, com hifen, fica em
      `registeredName` e so vai para o JSON-LD.

      Registro tambem confirmado e nao usado na tela: porte ME, CNAE
      C-1031-7/00 (fabricacao de conservas de frutas).
    */
    name: 'Perpolpas',
    city: 'Mata Roma',
    state: 'Maranhão',
    legalName: 'P. do N. Monteles Indústria e Comércio Ltda',
    registeredName: 'Per-Polpas Polpas de Frutas Naturais',
    cnpj: '04.623.570/0001-99',
    /*
      ISO, nao data formatada: alimenta o calculo de anos de operacao da S9 e
      o foundingDate do JSON-LD, que exige este formato.
    */
    foundingDate: FOUNDING_DATE,
    /*
      O logotipo em vetor nunca chegou (Secao 12). Enquanto nao chegar, o
      rodape mostra o nome em tipografia comum — e nao em display, que fingia
      ser logotipo sem ser. O marcador aparece ao lado para a falta ficar
      visivel: e o fecho da pagina que esta faltando, nao um detalhe.
    */
    logo: pending(
      'O logotipo em vetor (.ai, .eps, .svg ou .pdf) fecha o rodapé da ' +
        'página. A imagem em alta recebida em 19/08/2026 não serve: era ' +
        'versão reprocessada por IA, com folha, contorno e tipografia ' +
        'redesenhados. Precisa vir de quem fez a marca.',
    ),
  },

  hero: {
    /*
      HEADLINE DEFINIDA em 12/08/2026: o slogan impresso no rotulo.

      Origem verificavel — a frase esta em todos os cinco packshots, na faixa
      logo abaixo da marca. Nao e copy inventada nem afirmacao nova: e o que
      a embalagem ja diz, e por isso nao depende da pendencia de formulacao.
      Fala de sabor, nao de composicao.

      O nome da marca saiu daqui. Ele ja esta no logotipo, no proprio pack e
      no rodape, e quem chega vem do Instagram da marca sabendo o nome —
      gastar a maior tipografia da pagina repetindo isso e desperdicio.

      CONFIRMADA pelo Pedro em 17/08/2026, entao deixa de ser `provisional` e
      vira texto fechado. Nao dependia mesmo da pendencia de formulacao: fala
      de sabor, nao de composicao.

      "100% natural" segue BLOQUEADO. "100% de polpa" esta liberado desde
      12/08/2026 e pode entrar se um dia a frase for reescrita — mas isso
      seria decisao de copy nova, nao a pendencia que existia aqui.
    */
    headline: 'Sinta o verdadeiro sabor da fruta',
    kicker: 'Polpa de fruta. Mata Roma, Maranhão.',
  },

  sabores: { title: 'Sabores' },

  catalogo: {
    title: 'Catálogo',
    /*
      Faixa de chamada no fim do grid. O site mostra oito sabores e o catalogo
      real tem mais — o resto vai por conversa, e nao por pagina separada nem
      PDF: rota extra vira conteudo desatualizado, e download em 4G perde a
      pessoa no caminho (decisao do Pedro, 18/08/2026).

      O texto deixou de afirmar quantidade em 20/08/2026. Antes dizia "sao
      mais de 15 sabores" e carregava uma pendencia junto, para confirmar o
      numero exato. Convidar a pedir o catalogo resolve os dois: comunica que
      ha mais sem depender de uma contagem que ninguem fechou.
    */
    moreTitle: 'Ver todos os sabores',
    moreLead:
      'Para receber o catálogo de sabores disponíveis, fale no WhatsApp.',
    moreMessage: 'Olá! Queria receber o catálogo de sabores disponíveis.',
  },

  comoUsar: {
    title: 'Como usar',
    /*
      Proporcao afirmada na Secao 6 do SPEC, e desde 20/08/2026 ela vale para
      TODOS os sabores.

      Existia uma pendencia perguntando se cada sabor tinha sugestao propria
      de preparo. Ela saiu do card por decisao do Pedro, e sair do card e a
      resposta: o site passa a afirmar a mesma proporcao para os oito. Se
      algum sabor tiver preparo diferente, e aqui que muda.
    */
    ratio: 'Uma unidade de 100 g para 200 ml de água. Dá um copo.',
    // Confirmado em 20/08/2026.
    yieldPerPack: '200 ml por unidade.',
  },

  contato: {
    title: 'Contato',
    /*
      Confirmados em 12/08/2026, fonte: Google Business da empresa.
      O mesmo endereco e telefone estao no JSON-LD do index.html, que e
      estatico e nao consegue importar daqui. Mudou um, mude o outro.
    */
    /*
      CONFIRMADOS pelo Pedro em 17/08/2026, e os dois fecham divergencia:

      Telefone — PENDENCIA CRITICA, aberta em 17/08/2026. Nao deduzir.

      Tres numeros diferentes circulam, e nenhum foi confirmado com a cliente:

        (98) 98427-2003   em uso no site, repassado pelo Pedro
        (98) 98472-9000   banner de feira, no material de historia
        (98) 98745-1283   impresso no rotulo do maracuja

      Os dois primeiros tem digitos parecidos em ordem diferente, o que e a
      assinatura de erro de digitacao em algum ponto da cadeia — mas qual dos
      dois e o certo nao da para saber daqui, e chutar seria pior que marcar.

      Por que isto e critico e nao so mais uma pendencia: este campo monta o
      link do wa.me em TODOS os CTAs do site, inclusive o unico botao acima da
      dobra. Numero errado nao degrada a experiencia, ele manda a pessoa
      conversar com outra pessoa.

      Numero da rua — 50, apesar de MAPA, INPI e cartao CNPJ dizerem 10. Duas
      fontes oficiais perderam para a confirmacao de quem atende no lugar.
      Registro desatualizado e mais comum que fachada errada.

      O mesmo endereco e telefone estao no JSON-LD do index.html, que e
      estatico e nao consegue importar daqui. Mudou um, mude o outro.
    */
    /*
      CTA UNICO DO SITE, escrito em um lugar so desde 19/08/2026.

      Antes o heroi dizia "Falar no WhatsApp" e o fechamento dizia "Pedir no
      WhatsApp". Dois rotulos para a mesma porta fazem a segunda aparicao
      parecer uma opcao nova, e nao a mesma de novo — e o site tem uma
      conversao so.

      Criterio do rotulo: nomear a ACAO, nao o canal-verbo. "Falar" e vago e
      abre uma porta mais fraca ao lado da unica que interessa; o pedido
      acontece por conversa (Secao 8), entao "pedir" descreve o que a pessoa
      vai fazer. O card do catalogo ja usava essa forma.
    */
    cta: 'Pedir no WhatsApp',
    /** Mensagem que acompanha o CTA: a intencao que o rotulo promete. */
    ctaMessage: 'Olá! Quero fazer um pedido.',
    /*
      CONFIRMADO na tela em 20/08/2026 por decisao do Pedro. Deixa de ser
      `provisional`: e este o numero que o site publica.

      As outras duas variantes que circularam continuam registradas, porque a
      divergencia existiu e pode voltar a aparecer: (98) 98472-9000 no banner
      de feira, e (98) 98745-1283 impresso no rotulo do maracuja. Se o rotulo
      estiver desatualizado, quem tem o pack na mao liga para o numero errado
      — vale conferir antes da proxima tiragem.
    */
    whatsapp: '(98) 98427-2003',
    /*
      Numero da rua confirmado como 50 em 17/08/2026, apesar de MAPA, INPI e
      cartao CNPJ dizerem 10. Registro desatualizado e mais comum que fachada
      errada.

      O mesmo endereco e telefone estao no JSON-LD do index.html, que e
      estatico e nao consegue importar daqui. Mudou um, mude o outro.
    */
    address:
      'R. Maria Garreto de Sousa, 50 - Centro, Mata Roma - MA, 65510-000',
    hours: 'Segunda a sexta, das 7h às 17h30. Sábado, das 7h às 11h30.',
    /*
      Mapa confirmado em 17/08/2026: o Pedro mandou o embed do Google Maps do
      perfil da empresa. Dois valores saem dele, e nenhum e chute.

      `mapEmbed` e a URL do proprio iframe, usada como esta.

      `mapUrl` e o link canonico, derivado do identificador que vem dentro do
      embed: 0xaadf5aeabba469da em decimal e 12312659870471186906. Aponta para
      a mesma ficha, e serve para quem quer abrir no aplicativo em vez de ver
      o mapa embutido.

      A busca por texto que ficou descartada meses atras continua descartada
      pelo mesmo motivo — ela resolvia para o estabelecimento mais proximo e
      podia cair no vizinho. Isto aqui e a ficha certa, nao uma busca.
    */
    mapUrl: 'https://maps.google.com/?cid=12312659870471186906',
    mapEmbed:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4256.618378126313!2d-43.11445992502667!3d-3.6261456963479217!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7f2d6bc7559a88d%3A0xaadf5aeabba469da!2sPerpolpas!5e1!3m2!1spt-BR!2sbr!4v1786995800893!5m2!1spt-BR!2sbr',
    /*
      Canal de pedido. Confirmado em 17/08/2026 como Instagram e WhatsApp, e
      reduzido a WhatsApp no mesmo dia por decisao do Pedro: o Instagram
      continua existindo como perfil da marca, mas nao e por onde se pede.

      Nao ha venda online propria — o pedido acontece por conversa, e e isso
      que justifica o CTA de WhatsApp ser o unico do site (Secao 8).
    */
    orderChannel: 'WhatsApp',
  },

  /*
    Nao ha `footer` com politica de privacidade: o Pedro decidiu em 17/08/2026
    que ela nao sera publicada. O bloco saiu do dado e da tela em vez de virar
    string vazia — campo vazio no objeto vira secao fantasma na proxima vez
    que alguem mapear CONTENT.
  */
  social: {
    /*
      Confirmado pelo Pedro em 17/08/2026.

      ATENCAO — duas divergencias registradas, nenhuma inventada aqui:

      1. Ele escreveu "@perpoplpasma", com "pl" trocado de lugar no meio da
         marca. Publicado como @perpolpasma, que e o @ que aparece no reel e a
         grafia correta de "perpolpas". Se o handle for mesmo com o erro, e um
         caractere para corrigir.
      2. O rotulo do maracuja traz @perpolpasbr impresso. Embalagem costuma
         ser fonte mais forte que qualquer outra, entao ou existem duas
         contas, ou uma das duas esta desatualizada.
    */
    instagram: '@perpolpasma',
  },

} as const

/*
  Numero em E.164, sem simbolo nem espaco: e o formato que o wa.me exige.
  Derivado do numero confirmado acima — 55 do Brasil, 98 do Maranhao.
  Nao editar isolado: se o telefone mudar, os dois mudam juntos.
*/
const WHATSAPP_E164 = '5598984272003'

/** Link de WhatsApp com mensagem pre-preenchida. */
export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_E164}?text=${encodeURIComponent(message)}`
}

/*
  CTA do catalogo: WhatsApp com mensagem pre-preenchida por sabor (Secao 8).
  Destravado em 12/08/2026, quando o numero foi confirmado.

  A mensagem e texto de interface, nao afirmacao sobre o produto: diz de onde
  a pessoa veio e o que ela quer, e nada sobre composicao.
*/
export function whatsappLinkFor(flavorName: string): string {
  /*
    A mensagem do card NOMEIA O SABOR, e nao repete a generica do CTA global.
    Quem clica no card do morango ja escolheu; abrir a conversa com "quero
    fazer um pedido" joga essa escolha fora e obriga a pessoa a digitar de
    novo o que ela acabou de apontar.
  */
  return whatsappLink(`Olá! Quero fazer um pedido de polpa de ${flavorName}.`)
}
