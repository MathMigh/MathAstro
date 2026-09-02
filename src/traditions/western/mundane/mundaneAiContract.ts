import type { MundaneAiContract, MundaneFocus, MundaneGap } from "./mundaneTypes";

export function buildMundaneAiContract(args:{focus:MundaneFocus;interpretationOrder:string[];gaps:MundaneGap[];warnings:string[];hasEclipses:boolean;hasRadices:boolean;hasWeather:boolean;hasAgriculturePart:boolean;hasComets:boolean;hasProgressions:boolean;hasReturns:boolean;hasStars:boolean}):MundaneAiContract{
  const blockingCodes=[
    ...args.gaps.filter(g=>g.blocking && g.status!=="qa").map(g=>g.code),
    ...args.warnings.filter(w=>w.startsWith("REQUIRED_")||w.startsWith("ECLIPSE_RUNTIME_UNAVAILABLE"))
  ];
  const coverage:MundaneAiContract["coverage"]={
    astronomy:"calculated",
    ingress:"calculated",
    grandConjunction:"calculated",
    eclipses:args.hasEclipses?"calculated-baseline":"blocked",
    historicalRadices:args.hasRadices?"calculated":"not-requested",
    fixedStars:args.hasStars?"calculated":"blocked",
    progressions:args.hasProgressions?"calculated-baseline":"not-requested",
    returns:args.hasReturns?"calculated-baseline":"not-requested",
    weather:args.focus==="weather"?(args.hasWeather?"calculated-baseline":"blocked"):"not-requested",
    agriculture:args.focus==="agriculture"?(args.hasAgriculturePart?"calculated":"blocked"):"not-requested",
    comets:args.hasComets?"calculated-baseline":"not-requested",
    superCycle960:"source-locked",
    exactMundaneDirections:"source-locked",
    genericLunarEclipseLord:"source-locked"
  };
  return {
    schema:"mathastro.mundane.ai-contract/2.0",
    principle:"motor-calcula-ia-julga",
    promptVersion:"3.0-consulta-pro",
    judgmentStates:{
      CALCULATED:"fato determinístico materializado pelo motor",
      CALCULATED_BASELINE:"cálculo executável com limite autoral explicitamente declarado",
      SOURCE_LOCKED:"corpus insuficiente para fechar uma regra sem invenção",
      DATA_REQUIRED:"contexto terrestre/documental necessário para decidir a interpretação",
      AUTHOR_DIVERGENCE:"trilhos autorais distintos ou incompatíveis devem permanecer separados",
      ASTROLOGER_JUDGMENT_REQUIRED:"fatores técnicos existem, mas a decisão restante exige prudência qualitativa",
      MISSING_ENGINE_DATA:"fato técnico esperado não foi materializado e não pode ser recalculado pela IA",
      ENGINEERING_GATE:"filtro operacional do software que não deve ser atribuído a um autor"
    },
    readyForInterpretation:blockingCodes.length===0,
    blockingCodes,
    warningCodes:args.warnings,
    interpretationOrder:args.interpretationOrder,
    coverage,
    prohibitions:[
      "não criar score totalizador",
      "não tratar trânsito/gatilho isolado como promessa autônoma",
      "não contar contatos estruturais de eclipse/ingresso como testemunhos independentes",
      "não transformar runs elementares calculados em mutações históricas canônicas",
      "não afirmar direção mundana exata quando exactMundaneDirectionClaimed=false",
      "não inferir regra genérica do Senhor de eclipse lunar a partir da regra solar",
      "não tratar estrelas como agentes planetários",
      "não usar oposição a estrela como se fosse conjunção corporal no branch Marcos",
      "não aplicar orbes de Marcos como doutrina Frawley",
      "não usar estrela-Parte direta no profile Marcos quando o motor a exclui",
      "não importar interpretação natal, horária, eletiva ou sinástrica",
      "não atribuir ao autor um gate de engenharia",
      "não fabricar método mundano operacional de Gugu sem fonte direta",
      "não preencher source-lock com conhecimento astrológico geral",
      "não usar caso histórico conhecido para forçar retroativamente uma leitura"
    ]
  };
}
