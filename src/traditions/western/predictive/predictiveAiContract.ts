import type {
  PredictiveAiJudgmentContract,
  PredictiveAiPrompt,
  PredictiveAuthorFallback,
  PredictiveAuthorMode,
  PredictiveInput,
  PredictiveJudgmentTask,
} from "./predictiveTypes";

export const PREDICTIVE_ABSOLUTE_PROMPT_PTBR: PredictiveAiPrompt = {
  id: "MATHASTRO_PREDITIVA_ABSOLUTE_PTBR_V1",
  version: "1.0.0",
  language: "pt-BR",
  text: String.raw`# MATHASTRO — PROMPT ABSOLUTO DE JULGAMENTO PREDITIVO (PT-BR)

Você é a camada de JULGAMENTO de um sistema de astrologia tradicional ocidental. O motor MathAstro já calculou a astronomia e a mecânica. Sua função é julgar o dossiê, jamais recalculá-lo.

## 1. PRINCÍPIO INVIOLÁVEL
MOTOR CALCULA; IA JULGA.

Você NÃO pode recalcular, corrigir, estimar ou substituir: longitudes, casas, cúspides, aspectos, aplicação/separação, antíscios, dignidades, recepções, Partes, estrelas fixas, profecções, progressões, retornos, períodos Gugu, datas de perfeição, raízes de retorno ou trânsitos. Se um dado mecânico necessário não estiver presente, responda SOURCE_GAP ou INDETERMINADO conforme o contrato; nunca o reconstrua mentalmente.

## 2. EIXO DOUTRINÁRIO
Use Marcos Monteiro e John Frawley como eixo técnico principal. Use Luiz Gonzaga de Carvalho Neto (Gugu) somente nas camadas explicitamente source-locked no dossiê, sobretudo seus períodos planetários e sua contribuição filosófico-antropológica quando indicada. Não invente uma doutrina híbrida.

Cada conclusão deve distinguir:
- REGRA_MARCOS;
- REGRA_FRAWLEY;
- REGRA_GUGU;
- CONVERGÊNCIA_AUTORAL;
- DIVERGÊNCIA_AUTORAL;
- FALLBACK_MARCOS_PARA_GAP_FRAWLEY (quando explicitamente registrado no dossiê);
- MECÂNICA_TRADICIONAL_NEUTRA.

Fallback não significa que o autor ausente concorda com a regra.

## 3. O QUE É SUBJETIVO E PODE SER JULGADO PELA IA
A IA pode resolver apenas o que depende legitimamente do julgamento do astrólogo:
1. roteamento semântico da pergunta humana para temas/casas/significadores já disponíveis no formulário natal;
2. identificação de quais possibilidades/impossibilidades do radix são relevantes à pergunta;
3. ponderação qualitativa de testemunhos quando não existe score autoral legítimo;
4. escolha entre manifestações possíveis de um mesmo símbolo, usando contexto real fornecido pelo consulente;
5. distinção entre acontecimento externo, experiência subjetiva, desejo, medo ou pano de fundo;
6. síntese hierárquica entre progressões, Solar, Lunar, DLR, profecção, períodos Gugu e trânsito;
7. tratamento de contradições entre testemunhos e entre autores;
8. grau de confiança interpretativa, sempre separado de certeza astronômica.

## 4. O QUE A IA NUNCA PODE FAZER
- Não usar astrologia moderna por padrão.
- Não introduzir Urano, Netuno, Plutão ou técnicas não presentes no dossiê como significadores decisivos.
- Não somar pontos ou criar score totalizador.
- Não chamar aspecto isolado de evento.
- Não transformar trânsito em causa autônoma ou promessa.
- Não deixar Lunar/DLR sobrepor a Solar/progressões sem suporte de escala superior.
- Não permitir que profecção ou senhor do ano dominem automaticamente todo o julgamento.
- Não transformar um período Gugu maléfico em evento ruim automaticamente.
- Não inventar orbes, cutoffs, casas, partes, estrelas ou políticas autorais ausentes.
- Não converter SOURCE_GAP em "provavelmente".
- Não tratar ausência de testemunho como prova positiva do contrário, salvo quando o próprio método documentado autorizar essa negativa.
- Não usar conhecimento biográfico externo para forçar o mapa a coincidir com fatos conhecidos.

## 5. ORDEM ABSOLUTA DE JULGAMENTO
A. Compreenda a pergunta e o contexto sem alterar a mecânica.
B. Verifique o RADIX: nenhuma técnica temporal pode criar aquilo que não está prometido ou possível no nascimento.
C. Julgue PROGRESSÕES: linhas gerais, ativações, Partes, antíscios, estrelas e timeline de perfeições já calculada.
D. Julgue a REVOLUÇÃO SOLAR governante contra radix + progressões. Analise também sua gramática interna: casas, regentes, aspectos, recepções, mudanças de condição, nodos, cúspides, antíscios, eixos e Partes.
E. Use a REVOLUÇÃO LUNAR como refinamento da Solar e das progressões.
F. Use a LUNAR DERIVADA apenas para estreitar/refinar quando presente.
G. Use PROFECÇÃO como contexto anual secundário.
H. Se houver GUGU, leia grande período → subperíodo → níveis menores, dando mais peso ao receptor da autoridade, comparando a condição natal dos regentes e sem score.
I. Só então examine TRÂNSITOS como gatilho/contexto, nunca como criadores autônomos do evento.
J. Faça a SÍNTESE por repetição temática, continuidade entre escalas e coerência com o radix.

## 6. REGRA DE MANIFESTAÇÃO
Um testemunho forte é aquele que participa de uma cadeia rastreável. Procure, quando existirem no dossiê:
RADIX → PROGRESSÃO → SOLAR → LUNAR/DLR → TRÂNSITO.

Não é obrigatório que todas as camadas apareçam em todo caso, mas quanto menor a escala, menos ela pode contradizer ou criar o que as escalas maiores não sustentam.

## 7. SEMÂNTICA DA PERGUNTA
Quando a pergunta for aberta ou composta (ex.: "problema financeiro com vizinho"), não escolha uma casa por palavra-chave mecânica. Decomponha a situação em papéis e relações: pessoa, objeto/recursos, outra pessoa, relação entre casas e casas derivadas. Liste as rotas candidatas e escolha a principal apenas com justificativa contextual. Se duas rotas forem genuinamente possíveis, preserve ambas e marque a ambiguidade.

## 8. CONFLITO ENTRE AUTORES
Se Marcos e Frawley divergirem, não faça média. Produza:
- leitura segundo Marcos;
- leitura segundo Frawley;
- pontos de convergência;
- impacto prático da divergência;
- síntese integrada somente onde os dados forem compatíveis.

Gugu permanece separado. Sua camada não deve reescrever regras Marcos/Frawley.

## 9. SOURCE GAPS E INDETERMINAÇÃO
Use exatamente:
- SOURCE_GAP: falta uma regra/cutoff autoral ou dado mecânico necessário;
- CONTEXTO_INSUFICIENTE: o motor está completo, mas falta contexto humano para escolher entre manifestações;
- INDETERMINADO: há evidência legítima, porém ela não permite conclusão responsável.

Não esconda esses estados. Eles são parte da qualidade do sistema.

## 10. FORMATO DE SAÍDA
Responda como JSON válido conforme finalOutputSchema do contrato. Além do resumo em linguagem natural, mantenha evidenceTrace com caminhos de campos do dossiê usados em cada conclusão. Toda afirmação relevante deve poder ser rastreada ao dossiê e, quando aplicável, a sourceIds.

Em conclusão: interprete como um astrólogo tradicional rigoroso, mas comporte-se como uma camada determinística de julgamento auditável. Você pode ser flexível na semântica; nunca seja flexível na mecânica.`,
};

const BASE_FORBIDDEN = [
  "Recalcular astronomia ou mecânica astrológica.",
  "Inventar score agregado ou pesos numéricos autorais não publicados.",
  "Criar regra a partir de source gap.",
  "Misturar autores sem rotular proveniência.",
];

const out = (key: string, description: string, required = true) => ({ key, type: "string" as const, required, description });

function task(args: Omit<PredictiveJudgmentTask, "forbiddenActions"> & { forbiddenActions?: string[] }): PredictiveJudgmentTask {
  return { ...args, forbiddenActions: [...BASE_FORBIDDEN, ...(args.forbiddenActions ?? [])] };
}

export function buildPredictiveAiJudgmentContract(args: {
  input: PredictiveInput;
  authorMode: PredictiveAuthorMode;
  hasProgressions: boolean;
  hasSolar: boolean;
  hasLunar: boolean;
  hasDlr: boolean;
  hasProfection: boolean;
  hasGugu: boolean;
  sourceGaps: Array<{ id: string; blocking: boolean; note: string }>;
  authorFallbacks: PredictiveAuthorFallback[];
  interpretationOrder: string[];
}): PredictiveAiJudgmentContract {
  const consultation = args.input.consultation ?? {};
  const hasQuestion = Boolean(consultation.question?.trim());
  const authors: PredictiveJudgmentTask["authors"] = args.authorMode === "marcos" ? ["Marcos Monteiro"]
    : args.authorMode === "frawley" ? ["John Frawley"]
      : args.authorMode === "gugu" ? ["Luiz Gonzaga de Carvalho Neto"]
        : args.authorMode === "combined" ? ["Marcos Monteiro", "John Frawley"]
          : ["Marcos Monteiro", "John Frawley", "Luiz Gonzaga de Carvalho Neto"];

  const tasks: PredictiveJudgmentTask[] = [
    task({
      id: "JT-SEMANTIC-001",
      type: "SEMANTIC_TOPIC_ROUTING",
      status: hasQuestion ? "READY" : "NEEDS_USER_CONTEXT",
      authors,
      purpose: "Converter a pergunta humana em temas, casas e relações sem alterar nenhum cálculo.",
      allowedEvidencePaths: ["input.consultation", "radix.natalTechnicalForm"],
      sourceIds: ["MARCOS_BOOK_CH22_SECONDARY", "FRAWLEY_CURRENT_NATAL_PREDICTION"],
      resolutionRules: ["Decompor papéis e relações.", "Preservar rotas alternativas quando houver ambiguidade real.", "Nunca escolher casa apenas por palavra-chave."],
      outputFields: [out("temaPrincipal", "Tema astrológico principal."), out("rotasAlternativas", "Rotas semânticas alternativas.", false), out("justificativa", "Justificativa contextual.")],
    }),
    task({
      id: "JT-RADIX-001",
      type: "RADIX_PROMISE_JUDGMENT",
      status: "READY",
      authors,
      purpose: "Delimitar possibilidades e impossibilidades natais relevantes antes de qualquer previsão.",
      allowedEvidencePaths: ["radix.natalTechnicalForm", "radix.natalPrecisionEvidence", "input.consultation"],
      sourceIds: ["MARCOS_2024_PREDICTIVE_HIERARCHY", "FRAWLEY_CURRENT_NATAL_PREDICTION"],
      resolutionRules: ["Técnica temporal não cria promessa ausente.", "Separar possibilidade natal de manifestação temporal."],
      outputFields: [out("promessasRelevantes", "Possibilidades natais relevantes."), out("limites", "Impossibilidades/limites natais."), out("evidencia", "Caminhos de evidência usados.")],
    }),
  ];

  if (args.hasProgressions) {
    tasks.push(task({
      id: "JT-PROG-001", type: "PROGRESSION_THEME_JUDGMENT", status: "READY", authors: authors.filter(a => a !== "Luiz Gonzaga de Carvalho Neto"),
      purpose: "Julgar quais possibilidades natais são ativadas pelas progressões já calculadas.",
      allowedEvidencePaths: ["progressions.contactsToRadix", "progressions.antiscionContactsToRadix", "progressions.progressedLots", "progressions.termChanges", "progressions.temporalFixedStarContacts"],
      sourceIds: ["MARCOS_2026_PROGRESSIONS_CONJ_OPP", "FRAWLEY_FIVE_PRIMARY_DIRECTORS", "MARCOS_PROGRESSIONS_PARTS_ANTISCIA_EXAMPLES"],
      resolutionRules: ["Priorizar contatos source-locked do perfil.", "Não tratar o snapshot progredido como um segundo radix autônomo."],
      outputFields: [out("ativacoes", "Ativações principais."), out("tema", "Tema temporal dominante sem score."), out("divergenciasAutorais", "Diferenças Marcos/Frawley.", false)],
    }));
    tasks.push(task({
      id: "JT-PROG-TIME-001", type: "PROGRESSION_TIMING_SYNTHESIS", status: "READY", authors: authors.filter(a => a !== "Luiz Gonzaga de Carvalho Neto"),
      purpose: "Usar a timeline de perfeições para ordenar janelas temporais sem extrapolar velocidades.",
      allowedEvidencePaths: ["progressions.progressionWindow", "progressions.authorVariants.*.progressionWindow"],
      sourceIds: ["MARCOS_PROGRESSIONS_ANGLE_USAGE_EXAMPLES", "FRAWLEY_NAIBOD_RA_SECONDARY_ATTESTATION"],
      resolutionRules: ["Usar datas de perfeição fornecidas.", "Não calcular datas intermediárias mentalmente."],
      outputFields: [out("janelas", "Janelas e perfeições relevantes."), out("ordemTemporal", "Sequência cronológica."), out("incerteza", "Limitações de timing.", false)],
    }));
  }

  if (args.hasSolar) tasks.push(task({
    id: "JT-SOLAR-001", type: "SOLAR_RETURN_HIERARCHY_SYNTHESIS", status: "READY", authors: authors.filter(a => a !== "Luiz Gonzaga de Carvalho Neto"),
    purpose: "Julgar a Solar como especificação anual do radix e progressões usando sua gramática interna calculada.",
    allowedEvidencePaths: ["solarReturn", "progressions", "radix.natalTechnicalForm"],
    sourceIds: ["MARCOS_2024_PREDICTIVE_HIERARCHY", "FRAWLEY_RETURN_JUDGMENT_GRAMMAR"],
    resolutionRules: ["Ler casas, regentes, aspectos, recepções, mudanças, nodos, eixos, Partes e estrelas.", "Não permitir que a Solar contradiga promessa natal sem marcar conflito."],
    outputFields: [out("temaAnual", "Temas anualizados."), out("confirmacoes", "Confirmações do radix/progressões."), out("negativas", "Ausências/negações informativas.", false)],
  }));
  if (args.hasLunar) tasks.push(task({
    id: "JT-LUNAR-001", type: "LUNAR_RETURN_REFINEMENT", status: "READY", authors: authors.filter(a => a !== "Luiz Gonzaga de Carvalho Neto"),
    purpose: "Refinar a Solar/progressões na escala lunar.",
    allowedEvidencePaths: ["lunarReturn", "solarReturn", "progressions"],
    sourceIds: ["MARCOS_2024_PREDICTIVE_HIERARCHY", "FRAWLEY_CURRENT_NATAL_PREDICTION"],
    resolutionRules: ["Nunca ler a Lunar como técnica autônoma.", "Usar sua gramática interna do mesmo modo que a Solar quando aplicável."],
    outputFields: [out("refinamento", "Refinamento mensal."), out("confirmacoes", "Repetições relevantes."), out("contradicoes", "Contradições com escala maior.", false)],
  }));
  if (args.hasDlr) tasks.push(task({
    id: "JT-DLR-001", type: "DERIVED_LUNAR_REFINEMENT", status: "READY", authors: authors.filter(a => a !== "Luiz Gonzaga de Carvalho Neto"),
    purpose: "Estreitar a janela quando a DLR estiver habilitada.",
    allowedEvidencePaths: ["derivedLunarReturn", "lunarReturn", "solarReturn", "progressions"],
    sourceIds: ["MARCOS_2024_PREDICTIVE_HIERARCHY", "FRAWLEY_CURRENT_NATAL_PREDICTION"],
    resolutionRules: ["Julgar como refinamento, não como nova promessa."],
    outputFields: [out("refinamento", "Refinamento da janela."), out("janelaProvavel", "Janela temporal mais específica.")],
  }));
  if (args.hasProfection) tasks.push(task({
    id: "JT-PROF-001", type: "PROFECTION_CONTEXT_JUDGMENT", status: "READY", authors: authors.filter(a => a !== "Luiz Gonzaga de Carvalho Neto"),
    purpose: "Usar profecção e senhor do ano como contexto secundário.",
    allowedEvidencePaths: ["profection", "radix.natalTechnicalForm"],
    sourceIds: ["MARCOS_RECENT_PROFECTION_CAUTION", "TRADITIONAL_ANNUAL_PROFECTION_STANDARD"],
    resolutionRules: ["Senhor do ano não domina automaticamente o julgamento."],
    outputFields: [out("contextoAnual", "Contexto profectivo."), out("pesoQualitativo", "Peso qualitativo sem score.")],
  }));
  if (args.hasGugu) tasks.push(task({
    id: "JT-GUGU-001", type: "GUGU_PERIOD_QUALITY_JUDGMENT", status: "READY", authors: ["Luiz Gonzaga de Carvalho Neto"],
    purpose: "Julgar a qualidade da transferência de autoridade nos períodos Gugu.",
    allowedEvidencePaths: ["guguPeriods.activePath", "guguPeriods.lordConditions", "guguPeriods.boundaryEvidence", "radix.natalTechnicalForm"],
    sourceIds: ["GUGU_COSMOLOGY04_PERIOD_VALUES", "GUGU_COSMOLOGY04_TRANSIT_SUBORDINATION"],
    resolutionRules: ["Receptor pesa mais que doador.", "Maléfico não significa automaticamente período ruim.", "Comparar condição natal e relação natural dos regentes."],
    outputFields: [out("qualidade", "Qualidade do período ativo."), out("doadorReceptor", "Relação de autoridade."), out("fronteiras", "Importância de proximidade a fronteiras sem inventar orb.", false)],
  }));

  tasks.push(task({
    id: "JT-TRANSIT-001", type: "TRANSIT_TRIGGER_JUDGMENT", status: "READY", authors,
    purpose: "Julgar trânsitos apenas como gatilho/contexto subordinado.",
    allowedEvidencePaths: ["transits", "progressions", "solarReturn", "lunarReturn", "derivedLunarReturn", "guguPeriods"],
    sourceIds: ["MARCOS_2026_TRANSIT_TRIGGER", "FRAWLEY_CURRENT_NATAL_PREDICTION", "GUGU_COSMOLOGY04_TRANSIT_SUBORDINATION"],
    resolutionRules: ["Sem apoio de escala superior, trânsito permanece background/contexto.", "No Gugu, trânsito entra pela estrutura dos períodos."],
    outputFields: [out("gatilhos", "Gatilhos elegíveis."), out("apoios", "Camadas que sustentam cada gatilho."), out("background", "Trânsitos sem promoção.", false)],
  }));

  if (authors.length > 1) tasks.push(task({
    id: "JT-AUTHOR-001", type: "AUTHOR_CONFLICT_RESOLUTION", status: "READY", authors,
    purpose: "Preservar divergências e fallbacks autorais sem construir doutrina híbrida.",
    allowedEvidencePaths: ["authorFallbacks", "sourceGaps", "sourceRegistry", "progressions.authorVariants", "solarReturn.authorHouseSystemVariants"],
    sourceIds: args.authorFallbacks.flatMap(x => x.sourceIds),
    resolutionRules: ["Apresentar leituras separadas antes da síntese.", "Fallback Marcos não implica acordo Frawley.", "Gugu permanece camada separada."],
    outputFields: [out("marcos", "Leitura Marcos.", false), out("frawley", "Leitura Frawley.", false), out("gugu", "Leitura Gugu.", false), out("convergencias", "Convergências."), out("divergencias", "Divergências.")],
  }));

  tasks.push(task({
    id: "JT-EVENT-001", type: "EVENT_VS_SUBJECTIVE_EXPERIENCE", status: hasQuestion ? "READY" : "NEEDS_USER_CONTEXT", authors,
    purpose: "Distinguir acontecimento externo de desejo, medo, estado psicológico ou pano de fundo.",
    allowedEvidencePaths: ["radix.natalTechnicalForm", "convergence", "transits", "guguPeriods", "input.consultation"],
    sourceIds: ["FRAWLEY_CURRENT_NATAL_PREDICTION", "GUGU_COSMOLOGY04_TRANSIT_SUBORDINATION"],
    resolutionRules: ["Exigir cadeia temporal para evento externo.", "Contexto humano é necessário para escolher manifestação concreta."],
    outputFields: [out("classificacao", "evento_externo | experiencia_subjetiva | ambos | INDETERMINADO"), out("justificativa", "Justificativa baseada na cadeia temporal.")],
  }));

  tasks.push(task({
    id: "JT-FINAL-001", type: "FINAL_PREDICTIVE_SYNTHESIS", status: "READY", authors,
    purpose: "Produzir síntese final auditável sem score e sem recalcular.",
    allowedEvidencePaths: ["radix", "progressions", "solarReturn", "lunarReturn", "derivedLunarReturn", "profection", "guguPeriods", "transits", "convergence", "sourceGaps", "authorFallbacks"],
    sourceIds: [],
    resolutionRules: ["Ordenar por escala.", "Separar fato mecânico de julgamento.", "Usar INDETERMINADO quando a evidência não fecha."],
    outputFields: [out("sintese", "Síntese final."), out("timing", "Timing quando sustentado.", false), out("confiancaInterpretativa", "alta | média | baixa, nunca confundida com precisão astronômica"), out("evidenceTrace", "Caminhos de evidência." )],
  }));

  return {
    schema: "mathastro.predictive.ai-judgment-contract/1.0",
    contractVersion: "1.0.0",
    language: "pt-BR",
    promptId: PREDICTIVE_ABSOLUTE_PROMPT_PTBR.id,
    promptVersion: PREDICTIVE_ABSOLUTE_PROMPT_PTBR.version,
    botReady: true,
    consultation,
    subjectivityBoundary: {
      aiMayJudge: [
        "roteamento semântico de situações humanas para temas/casas candidatas",
        "ponderação qualitativa de testemunhos sem score",
        "manifestação concreta entre possibilidades natais compatíveis",
        "evento externo versus experiência subjetiva",
        "conflitos e convergências autorais",
      ],
      engineExclusive: [
        "astronomia e coordenadas",
        "casas/cúspides e regências mecânicas",
        "aspectos/aplicação/separação",
        "dignidades/recepções calculáveis",
        "Partes/antíscios/estrelas",
        "progressões/retornos/profecções/períodos/trânsitos/timing",
      ],
      neverInferFromAbsence: [
        "orbe/cutoff autoral não publicado",
        "técnica marcada SOURCE_GAP ou DEFERRED",
        "dado mecânico ausente do dossiê",
      ],
    },
    authorPolicy: {
      keepAuthorsSeparate: true,
      allowIntegratedSynthesis: true,
      integratedSynthesisMustLabelProvenance: true,
      neverConvertFallbackIntoMissingAuthorAgreement: true,
    },
    uncertaintyPolicy: {
      indeterminateToken: "INDETERMINADO",
      sourceGapToken: "SOURCE_GAP",
      insufficientContextToken: "CONTEXTO_INSUFICIENTE",
      rules: [
        "Ausência de regra autoral não autoriza reconstrução por analogia.",
        "Ambiguidade semântica deve ser preservada quando contexto não resolve.",
        "Confiança interpretativa é qualitativa e separada da precisão mecânica.",
      ],
    },
    hardProhibitions: [
      ...BASE_FORBIDDEN,
      "Transformar trânsito isolado em previsão autônoma.",
      "Tratar Lunar ou DLR como promessa independente das escalas maiores.",
      "Inventar política Frawley a partir de fallback Marcos.",
      "Importar técnica moderna ou externa não source-locked.",
    ],
    requiredJudgmentOrder: args.interpretationOrder,
    tasks,
    finalOutputSchema: {
      format: "json-object",
      fields: [
        out("resumoExecutivo", "Resumo em português claro."),
        { key: "roteamentoSemantico", type: "object", required: false, description: "Roteamento da pergunta para temas/casas." },
        { key: "promessaNatal", type: "object", required: true, description: "Possibilidades e limites do radix." },
        { key: "camadasTemporais", type: "object", required: true, description: "Progressões, retornos, profecção, Gugu e trânsitos." },
        { key: "convergencias", type: "string[]", required: true, description: "Convergências por camadas e autores." },
        { key: "divergenciasAutorais", type: "string[]", required: true, description: "Divergências não fundidas." },
        { key: "sourceGaps", type: "string[]", required: true, description: "Gaps preservados." },
        { key: "incertezas", type: "string[]", required: true, description: "Indeterminações/contexto insuficiente." },
        { key: "conclusao", type: "string", required: true, description: "Conclusão final condicionada ao radix." },
        { key: "evidenceTrace", type: "object", required: true, description: "Mapa conclusão → caminhos do dossiê/sourceIds." },
      ],
    },
  };
}
