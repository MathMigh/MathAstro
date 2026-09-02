/**
 * Source-locked contract for Western synastry — v4.0 Professor-Astrólogo.
 *
 * Authority order:
 * 1. Marcos Monteiro — primary operational line.
 * 2. John Frawley — primary complement and source of the wider framework.
 * 3. Luiz Gonzaga de Carvalho Neto (Gugu) — supplemental only where a
 *    recoverable source actually states a usable rule.
 *
 * The synastry domain consumes natal evidence read-only. It never mutates the
 * natal, horary, electional, predictive or mundane engines.
 */

export const SYNASTRY_AUTHORITY = {
  primary: ["Marcos Monteiro", "John Frawley"],
  secondary: ["Luiz Gonzaga de Carvalho Neto (Gugu)"],
  rule: "Marcos e Frawley governam o método; Gugu só entra quando há regra recuperada e compatível.",
} as const;

/**
 * Presets are a UI/API convenience. `sourceStatus` says whether the concrete
 * house pairing is directly evidenced in the recovered synastry material or
 * transparently derived from the traditional house significations already
 * used by the project. A custom pairing is available separately and is always
 * marked derived-from-source.
 */
export const SYNASTRY_INTERACTION_PRESETS = [
  { kind: "general", label: "Interação geral / outra pessoa", roleA: "outra pessoa B", roleB: "outra pessoa A", houseA: 7, houseB: 7, group: "Geral", sourceStatus: "source-locked" },
  { kind: "romantic", label: "Relação amorosa", roleA: "parceiro amoroso B", roleB: "parceiro amoroso A", houseA: 7, houseB: 7, group: "Relacionamentos", sourceStatus: "source-locked" },
  { kind: "marriage", label: "Casamento", roleA: "cônjuge B", roleB: "cônjuge A", houseA: 7, houseB: 7, group: "Relacionamentos", sourceStatus: "source-locked" },
  { kind: "business", label: "Sociedade / parceria de negócios", roleA: "sócio B", roleB: "sócio A", houseA: 7, houseB: 7, group: "Profissional", sourceStatus: "source-locked" },
  { kind: "teacher-student", label: "A professor/mestre · B aluno/discípulo", roleA: "aluno/discípulo B", roleB: "professor/mestre A", houseA: 3, houseB: 9, group: "Ensino", sourceStatus: "source-locked" },
  { kind: "student-teacher", label: "A aluno/discípulo · B professor/mestre", roleA: "professor/mestre B", roleB: "aluno/discípulo A", houseA: 9, houseB: 3, group: "Ensino", sourceStatus: "source-locked" },
  { kind: "employer-employee", label: "A empregador/chefe · B empregado/subordinado", roleA: "empregado/subordinado B", roleB: "empregador/chefe A", houseA: 6, houseB: 10, group: "Profissional", sourceStatus: "derived-from-source" },
  { kind: "employee-employer", label: "A empregado/subordinado · B empregador/chefe", roleA: "empregador/chefe B", roleB: "empregado/subordinado A", houseA: 10, houseB: 6, group: "Profissional", sourceStatus: "derived-from-source" },
  { kind: "siblings", label: "Irmãos", roleA: "irmão/irmã B", roleB: "irmão/irmã A", houseA: 3, houseB: 3, group: "Família", sourceStatus: "derived-from-source" },
  { kind: "friends", label: "Amizade", roleA: "amigo B", roleB: "amigo A", houseA: 11, houseB: 11, group: "Outros vínculos", sourceStatus: "derived-from-source" },
  { kind: "father-child", label: "A pai · B filho", roleA: "filho B", roleB: "pai A", houseA: 5, houseB: 4, group: "Família", sourceStatus: "derived-from-source" },
  { kind: "child-father", label: "A filho · B pai", roleA: "pai B", roleB: "filho A", houseA: 4, houseB: 5, group: "Família", sourceStatus: "derived-from-source" },
  { kind: "mother-child", label: "A mãe · B filho", roleA: "filho B", roleB: "mãe A", houseA: 5, houseB: 10, group: "Família", sourceStatus: "derived-from-source" },
  { kind: "child-mother", label: "A filho · B mãe", roleA: "mãe B", roleB: "filho A", houseA: 10, houseB: 5, group: "Família", sourceStatus: "derived-from-source" },
] as const;

export const SYNASTRY_SCOPE = {
  input: "Dois mapas natais técnicos completos + o papel concreto que cada pessoa ocupa para a outra; contexto textual é opcional e não altera o cálculo.",
  output: "Dossiê técnico completo de sinastria orientado por padrões natais de papel, temperamento, contatos cruzados, recepções, cúspides, antíscios e síntese hierárquica, acompanhado de envelope determinístico para IA.",
  excludes: [
    "alterar ou recalibrar qualquer regra do motor natal",
    "usar I–VII como eixo universal de toda e qualquer relação",
    "começar por lista de aspectos entre os dois mapas",
    "mapa composto ou Davison",
    "horária de relacionamento",
    "eleição",
    "trânsitos, progressões, direções, retornos ou profecções",
    "previsão de duração sem fator temporal explícito",
    "compatibilidade por signo solar",
    "aspectos menores modernos",
    "Urano, Netuno, Plutão, Quíron, Lilith ou asteroides como significadores primários",
    "percentual de compatibilidade ou nota global mecânica",
  ],
} as const;

export const SYNASTRY_JUDGMENT_ORDER = [
  {
    id: "declare-role",
    title: "Definir a espécie real da relação",
    rule: "Antes de comparar mapas, definir qual papel A ocupa para B e qual papel B ocupa para A. O papel determina as casas natais pertinentes. Se não houver preset, o modo avançado exige casas e rótulos explícitos e registra a derivação.",
    sourceTier: "Marcos explícito pelo exemplo professor–discípulo + significações tradicionais das casas",
  },
  {
    id: "natal-foundations",
    title: "Ler as duas natividades como natividades",
    rule: "A sinastria não substitui a leitura natal. Preservar temperamento, regente I/Lua, dignidades, recepções, mentalidade/modos e demais dossiês já calculados, sem recalcular o natal dentro da sinastria.",
    sourceTier: "Frawley explícito: os dois mapas devem ser avaliados individualmente antes dos contatos; Marcos trabalha sobre os padrões natais já existentes",
  },
  {
    id: "temperament",
    title: "Temperamento como fundamento geral do porquê",
    rule: "Comparar temperamentos antes dos contatos. A configuração preferencial explicitada por Frawley combina uma qualidade comum e uma diferente; duas qualidades iguais podem duplicar o mesmo excesso, e duas opostas podem gerar incompreensão. Intensidade e terreno comum modulam o juízo. O temperamento contextualiza, mas não substitui o padrão concreto do papel.",
    sourceTier: "Frawley explícito; Marcos usa temperamento como primeira comparação geral; Gugu corrobora diretamente que temperamento deve preceder contatos planetários",
  },
  {
    id: "individual-role-pattern-a",
    title: "Julgar o padrão natal de A para o papel de B",
    rule: "No mapa de A: regente do Ascendente como significador principal, Lua como significador secundário, e regente da casa correspondente ao papel de B. Materializar aspectos do regente I e da Lua com o significador do papel, recepções nos dois sentidos, estado essencial/acidental e testemunhos da casa.",
    sourceTier: "Marcos explícito no exemplo Guénon–Schuon",
  },
  {
    id: "individual-role-pattern-b",
    title: "Julgar o padrão natal de B para o papel de A",
    rule: "Repetir o mesmo procedimento no mapa de B, sem projetar o padrão de A sobre B.",
    sourceTier: "Marcos explícito no exemplo Guénon–Schuon",
  },
  {
    id: "compare-role-patterns",
    title: "Comparar os dois padrões antes dos contatos",
    rule: "A sinastria nasce do encontro entre duas possibilidades natais. O encaixe dos padrões de papel vem antes dos contatos; os contatos dão corpo, área e importância ao que os padrões já permitem.",
    sourceTier: "Marcos explícito; ele chama a omissão desta etapa de passo crucial que costuma ser pulado",
  },
  {
    id: "shared-ground",
    title: "Terreno comum",
    rule: "Preservar Ascendente compartilhado e distribuição por horizonte/hemisfério como indicadores derivados do exemplo Newman/Woodward; não convertê-los em lei universal.",
    sourceTier: "Frawley, exemplo Newman/Woodward",
  },
  {
    id: "cross-contacts",
    title: "Contatos cruzados: como e onde a relação ganha corpo",
    rule: "Somente depois dos fundamentos e padrões natais, examinar aspectos ptolomaicos planeta–planeta e planeta–cúspide. Cúspide–cúspide é proibido. Frawley demonstra planeta→Ascendente ainda operativo a 5°, embora fraco; o uso uniforme de 5° como teto para qualquer planeta→cúspide é uma derivação operacional MathAstro e deve ser rotulado como tal. Aplicação/separação entre dois nascimentos não existe neste motor.",
    sourceTier: "Frawley explícito para contatos planetários/ângulos; Marcos explícito no exemplo para planeta–MC e antíscio–cúspide; demais cúspides marcadas como derivação",
  },
  {
    id: "cross-receptions",
    title: "Recepção cruzada separada do contato",
    rule: "Recepção indica inclinação/interesse; aspecto indica contato/ocasião. Registrar assimetria, recepção mútua e eventual aspecto concomitante sem fundir os conceitos.",
    sourceTier: "Frawley explícito; Marcos explícito",
  },
  {
    id: "role-resonance",
    title: "Ressonância entre pessoa real e papel natal",
    rule: "Testar regente I e Lua de cada pessoa contra significador e cúspide do papel que ela ocupa no outro mapa. A Lua não pode desaparecer desta etapa, pois Marcos a usa como significador secundário do nativo no exemplo direto.",
    sourceTier: "Operacionalização direta do princípio demonstrado por Marcos; derivação transparente fora do exemplo literal",
  },
  {
    id: "romantic-supplement",
    title: "Suplemento I–VII somente quando o contexto o exige",
    rule: "Em romance/casamento, reativar o dossiê natal I–VII de Marcos: condições dos regentes, recepções, aspecto, estrelas, testemunhos das cúspides e Partes já materializadas. Não universalizar esse eixo.",
    sourceTier: "Marcos explícito para padrão relacional natal",
  },
  {
    id: "antiscia",
    title: "Antíscios como testemunhos subordinados",
    rule: "Materializar planeta–planeta e planeta–cúspide por antíscio, preservando longitude fonte, longitude do antíscio, alvo e orbe. Frawley fornece a regra técnica: contato muito estreito, nada muito além de 1°, com conjunção/oposição principais e sextil/quadratura/trígono apenas secundários. Marcos fornece base direta para usar antíscio planetário em cúspide no exemplo Guénon–Schuon. Não deixar antíscio substituir estrutura natal ou aspecto corporal.",
    sourceTier: "Frawley explícito para orbe/hierarquia; Marcos explícito para antíscio em cúspide",
  },
  {
    id: "synthesis",
    title: "Síntese hierárquica",
    rule: "Responder: fundamentos natais, temperamento, padrões de papel, encaixe, contatos, recepções, áreas tocadas, forças, tensões, assimetrias, potencial formativo e limites. Classificadores operacionais nunca viram escore de compatibilidade.",
    sourceTier: "Marcos + Frawley",
  },
  {
    id: "ai-contract",
    title: "Materializar tudo antes da IA",
    rule: "A IA recebe dados calculados, testemunhos, síntese mecânica, auditoria de completude, incertezas e contexto. Campo ausente vira MISSING_ENGINE_DATA; a IA não recalcula astrologia.",
    sourceTier: "Contrato de software MathAstro para preservar a técnica",
  },
  {
    id: "time-caveat",
    title: "Limite temporal",
    rule: "Dois mapas natais não bastam para afirmar encontro, início, duração ou término. Tempo e circunstância pertencem a camada separada.",
    sourceTier: "Frawley explícito",
  },
] as const;

export const SYNASTRY_PROHIBITIONS = [
  "contacts-before-role-patterns",
  "universal-house-1-7-for-all-relations",
  "aspect-counting-as-compatibility-score",
  "sun-sign-compatibility",
  "reception-equals-aspect",
  "aspect-equals-affection",
  "good-aspect-bad-aspect-autopilot",
  "outer-planets-primary-rulers",
  "minor-modern-aspects",
  "cusp-to-cusp-aspect-mechanics",
  "cross-chart-applying-separating",
  "soulmate-determinism",
  "relationship-duration-from-static-synastry",
  "silent-fallback-to-modern-synastry",
  "mutating-natal-analysis",
  "ai-recalculates-missing-data",
] as const;

export const SYNASTRY_SOURCE_REGISTRY = [
  {
    id: "marcos-synastry-role-patterns",
    author: "Marcos Monteiro",
    work: "corpus de vídeos/transcrições — exemplo de sinastria Guénon–Schuon",
    status: "primary-direct-corpus",
    rules: [
      "o passo crucial é julgar cada mapa separadamente antes dos contatos",
      "encontrar em cada natal o padrão pertinente à espécie de relação",
      "comparar os dois padrões e só depois voltar aos contatos cruzados",
      "no exemplo professor–discípulo: nativo por regente I e secundariamente Lua; aluno/discípulo por III; professor/mestre por IX",
      "a Lua participa como significador secundário e deve ser conservada no padrão e na ressonância cruzada",
      "contatos cruzados dão corpo e importância ao que os padrões natais permitem",
      "planeta de um mapa em MC/cúspide do outro pode ser relevante",
      "antíscio planetário em cúspide do outro mapa pode ser relevante",
    ],
  },
  {
    id: "marcos-relationship-natal",
    author: "Marcos Monteiro",
    work: "corpus de aulas/respostas + Introdução à Astrologia Ocidental",
    status: "primary-corpus",
    rules: [
      "em padrão amoroso/relacional natal, examinar regentes I e VII",
      "estado, recepções, aspecto, estrelas e testemunhos nas cúspides I/VII",
      "recepção e aspecto não são a mesma coisa",
      "o natal mostra padrões gerais, não um parceiro específico predeterminado",
    ],
  },
  {
    id: "frawley-applied-synastry",
    author: "John Frawley",
    work: "The Real Astrology Applied",
    status: "primary-published",
    rules: [
      "avaliar cada mapa natal antes dos contatos",
      "sinastria também serve a negócio, professor–aluno e empregador–empregado",
      "temperamento como raiz do porquê",
      "aspectos como o como",
      "mistura de complementaridade e semelhança",
      "terreno comum e tomada das fraquezas do outro",
      "tempo/circunstância do encontro como limite",
      "sinastria corretamente usada é extensão da leitura natal com dignidade, recepção e aspecto",
    ],
  },
  {
    id: "frawley-reception-aspects",
    author: "John Frawley",
    work: "The Real Astrology Applied — dignidade, recepção e aspectos",
    status: "primary-published",
    rules: [
      "recepção indica interesse/inclinação",
      "aspecto indica ocasião/contato",
      "domicílio, exaltação, triplicidade, termo e face têm qualidades diferentes",
      "detrimento e queda geram recepção negativa",
      "usar aspectos ptolomaicos e respeitar fronteiras de signo/orbes tradicionais",
      "antíscios exigem contato muito estreito (~1°); conjunção/oposição são prioritárias e outros aspectos ptolomaicos são apenas secundários",
    ],
  },
  {
    id: "gugu-synastry-temperament-first",
    author: "Luiz Gonzaga de Carvalho Neto (Gugu)",
    work: "transcrição recuperada de curso atribuída a Luiz Gonzaga de Carvalho Neto; material não revisado pelo professor",
    status: "corroborative-direct",
    rules: [
      "em sinastria, relações planetárias entre os dois mapas não bastam se os temperamentos forem profundamente incompatíveis",
      "a primeira coisa a analisar deve ser o temperamento",
      "esta regra corrobora o eixo Frawley; não autoriza inventar um algoritmo autônomo completo de Gugu",
    ],
  },
] as const;
