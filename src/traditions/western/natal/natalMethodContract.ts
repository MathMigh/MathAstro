/**
 * Contrato operacional do Método Absoluto de Análise Natal com IA.
 *
 * Regra de arquitetura:
 *   - o motor calcula e materializa evidência técnica;
 *   - a IA não recalcula astrologia;
 *   - quando falta contexto humano (p.ex. "de qual parente é a herança?"),
 *     o dossiê deve declarar CONTEXT_REQUIRED, nunca adivinhar;
 *   - quando uma técnica temporal não pertence ao relatório natal estático,
 *     o dossiê deve declarar TIMING_CONTEXT_REQUIRED, nunca simular cálculo.
 */

export type NatalProtocolPhase = "radical" | "timing";
export type SpecialistPacket =
  | "temperament"
  | "lordOfNativity"
  | "manner"
  | "mentality"
  | "modes"
  | "lifeIndicatorsFrawley"
  | "generalFortune"
  | "profession"
  | "relationships"
  | "healthSymbolic"
  | "spiritualOrientation"
  | "children"
  | "wealth"
  | "prenatalSyzygy";

export type RelationRequest =
  | { kind: "house-rulers"; label: string; firstHouse: number; secondHouse: number }
  | { kind: "fixed-planets"; label: string; firstPlanet: string; secondPlanet: string }
  | { kind: "planet-house-ruler"; label: string; planet: string; house: number };

export interface DerivedHouseTemplate {
  label: string;
  /** Casa-base radical quando é fixa; ausente quando depende do ator/contexto. */
  baseHouse?: number;
  /** 1 = própria casa; 2 = segunda a partir dela; etc. */
  relativeHouse: number;
  contextKey?: string;
  note: string;
}

export interface NatalDomainContract {
  id: string;
  section: number;
  title: string;
  phase: NatalProtocolPhase;
  primaryHouses: number[];
  contextHouses: number[];
  rulerHouses: number[];
  fixedPlanets: string[];
  relations: RelationRequest[];
  derivedHouses: DerivedHouseTemplate[];
  lotNames: string[];
  specialistPackets: SpecialistPacket[];
  requiredOutputFields: string[];
  requiredEngineEvidence: string[];
  sourceTiers: {
    marcos: "primary" | "universal-only" | "none";
    frawley: "verified-complement" | "scope-only" | "none";
    gugu: "separate-supplement" | "none";
  };
  contextRequirements: string[];
  aiProhibitions: string[];
}

const H = (label: string, firstHouse: number, secondHouse: number): RelationRequest => ({
  kind: "house-rulers", label, firstHouse, secondHouse,
});
const P = (label: string, firstPlanet: string, secondPlanet: string): RelationRequest => ({
  kind: "fixed-planets", label, firstPlanet, secondPlanet,
});
const PH = (label: string, planet: string, house: number): RelationRequest => ({
  kind: "planet-house-ruler", label, planet, house,
});
const D = (
  label: string,
  relativeHouse: number,
  note: string,
  baseHouse?: number,
  contextKey?: string,
): DerivedHouseTemplate => ({ label, relativeHouse, note, ...(baseHouse ? { baseHouse } : {}), ...(contextKey ? { contextKey } : {}) });

const universalEvidence = [
  "houseDossiers",
  "planetPackets",
  "essentialConditions",
  "accidentalConditions",
  "dispositors",
  "receptions",
  "aspects",
  "fixedStars",
  "antiscia",
  "nodes",
  "lots",
  "derivedHouseTable",
  "effectiveHousePlacements",
  "fixedStarInterpretiveProvenance",
  "sourceTaggedAspectLayers",
  "productionValidation",
];

export const UNIVERSAL_NATAL_JUDGMENT_RULES = {
  engineInterprets: false,
  aiCalculates: false,
  capacity: "dignidade/condição do significador",
  intention: "recepção direcional",
  opportunity: "aspecto e sua dinâmica",
  fixedStars: "modificadores do agente/ponto, não agentes autônomos",
  nodes: "somente conjunção no núcleo Marcos; Nodo Norte amplifica, Nodo Sul restringe",
  lots: "pontos passivos; só promover quando tecnicamente ativados",
  cuspRule: "mesmo signo + proximidade; 5° é base, casos-limite exigem dados de dinâmica e não limiar inventado",
  unresolved: "quando a fonte ou o contexto não resolve, devolver status explícito em vez de inferência silenciosa",
} as const;

export const NATAL_DOMAIN_CONTRACTS: NatalDomainContract[] = [
  {
    id: "temperament", section: 6, title: "Temperamento - núcleo Marcos", phase: "radical",
    primaryHouses: [1], contextHouses: [], rulerHouses: [1], fixedPlanets: ["Sol", "Lua"], relations: [], derivedHouses: [], lotNames: [],
    specialistPackets: ["temperament", "lordOfNativity"],
    requiredOutputFields: ["predominantHumor","secondaryHumor","witnesses[5]","hotColdBalanceQualitative","dryMoistBalanceQualitative","contradictions","uncertainty"],
    requiredEngineEvidence: [...universalEvidence, "fiveTemperamentWitnesses", "solarSeason", "lunarPhase"],
    sourceTiers: { marcos: "primary", frawley: "verified-complement", gugu: "none" }, contextRequirements: [],
    aiProhibitions: ["inventar pesos 1.25/0.75", "decidir por simples votação sem intensidade qualitativa"],
  },
  {
    id: "lord-of-nativity", section: 7, title: "Senhor da Natividade - Marcos", phase: "radical",
    primaryHouses: [], contextHouses: [], rulerHouses: [], fixedPlanets: ["Sol","Lua","Mercúrio","Vênus","Marte","Júpiter","Saturno"], relations: [], derivedHouses: [], lotNames: [],
    specialistPackets: ["lordOfNativity"],
    requiredOutputFields: ["planet","essentialDignityLedger","debilityLedger","tieCandidates","resolutionMode","temperamentContribution"],
    requiredEngineEvidence: [...universalEvidence, "essentialDignityHierarchy"],
    sourceTiers: { marcos: "primary", frawley: "none", gugu: "none" }, contextRequirements: [],
    aiProhibitions: ["fabricar vencedor por número de aspectos", "chamar de almuten por soma 5/4/3/2/1"],
  },
  {
    id: "manner", section: 8, title: "Manner - Frawley", phase: "radical",
    primaryHouses: [1], contextHouses: [], rulerHouses: [1], fixedPlanets: ["Lua","Mercúrio"], relations: [], derivedHouses: [], lotNames: [],
    specialistPackets: ["manner", "temperament"],
    requiredOutputFields: ["mannerPlanet","selectionStage","essentialCondition","accidentalProminence","modifiers","expressionThroughTemperament"],
    requiredEngineEvidence: [...universalEvidence, "mannerSelectionStages"],
    sourceTiers: { marcos: "universal-only", frawley: "verified-complement", gugu: "none" }, contextRequirements: [],
    aiProhibitions: ["usar Sol/Lua como Manner", "selecionar planeta mais forte por score"],
  },
  {
    id: "mentality-marcos", section: 9, title: "Mentalidade - método Marcos", phase: "radical",
    primaryHouses: [3,9], contextHouses: [1], rulerHouses: [1,3,9], fixedPlanets: ["Lua","Mercúrio","Saturno","Marte","Vênus","Júpiter","Sol"],
    relations: [P("Lua–Mercúrio","Lua","Mercúrio"), PH("Mercúrio–regente III","Mercúrio",3), PH("Mercúrio–regente IX","Mercúrio",9)],
    derivedHouses: [], lotNames: [], specialistPackets: ["mentality"],
    requiredOutputFields: ["mercuryAttentionMode","mercuryExpressionMode","moonSpontaneousMind","moonMercuryRelation","mentalModifiers","communicationIndicators","higherKnowledgeIndicators","intelligenceLevel=NOT_CALCULATED"],
    requiredEngineEvidence: [...universalEvidence, "moonPhase", "moonMercuryRelation", "mentalModifiers"],
    sourceTiers: { marcos: "primary", frawley: "none", gugu: "none" }, contextRequirements: [],
    aiProhibitions: ["Mercúrio dignificado = gênio", "Mercúrio debilitado = estupidez", "produzir score de inteligência"],
  },
  {
    id: "mentality-frawley", section: 10, title: "Mentalidade - complemento Frawley", phase: "radical",
    primaryHouses: [1,3,9], contextHouses: [], rulerHouses: [1,3,9], fixedPlanets: ["Lua","Mercúrio","Saturno","Marte"],
    relations: [P("Lua–Mercúrio","Lua","Mercúrio")], derivedHouses: [], lotNames: [], specialistPackets: ["mentality"],
    requiredOutputFields: ["moonMercuryAspectQuality","relativeEssentialStrength","angularity","speed","voiceQuality","saturnMarsModifiers","receptions","fixedStars","cuspContext"],
    requiredEngineEvidence: [...universalEvidence, "signVoice", "moonMercuryRelation"],
    sourceTiers: { marcos: "universal-only", frawley: "verified-complement", gugu: "none" }, contextRequirements: [],
    aiProhibitions: ["converter testemunhos em score de inteligência", "generalizar exemplos particulares de Frawley"],
  },
  {
    id: "mentality-gugu", section: 11, title: "Mentalidade - suplemento Gugu", phase: "radical",
    primaryHouses: [1,10,4], contextHouses: [], rulerHouses: [1], fixedPlanets: ["Lua","Mercúrio","Sol"],
    relations: [P("Lua–Mercúrio","Lua","Mercúrio")], derivedHouses: [], lotNames: [], specialistPackets: ["mentality","modes"],
    requiredOutputFields: ["moonAlmuten","mercuryAlmuten","modalityBalance","orientationMCIC","properPlaces","sunCondition","ascRulerCondition","ascExceptionalPlanets","moonNodeGeometry","sourceTier=G-TX"],
    requiredEngineEvidence: [...universalEvidence, "degreeAlmutens", "orientation", "angularProximity", "moonNodeRawDistance", "guguSourceGapRegistry"],
    sourceTiers: { marcos: "universal-only", frawley: "none", gugu: "separate-supplement" }, contextRequirements: [],
    aiProhibitions: ["rotular camada Gugu como Marcos", "inventar limiar Lua–Nodos"],
  },
  {
    id: "constitution", section: 12, title: "Constituição geral, corpo e presença", phase: "radical",
    primaryHouses: [1], contextHouses: [], rulerHouses: [1], fixedPlanets: [], relations: [], derivedHouses: [], lotNames: [], specialistPackets: ["temperament","healthSymbolic"],
    requiredOutputFields: ["constitution","bodilyStrengthWeakness","ascModifiers","temperamentContext","uncertainty"],
    requiredEngineEvidence: [...universalEvidence, "ascendantPacket", "temperament"], sourceTiers: { marcos: "primary", frawley: "none", gugu: "none" }, contextRequirements: [],
    aiProhibitions: ["diagnóstico médico", "confundir Casa I saúde geral com Casa VI doença"],
  },
  {
    id: "health-disease", section: 13, title: "Saúde geral e predisposição a doenças", phase: "radical",
    primaryHouses: [1,6], contextHouses: [10], rulerHouses: [1,6,10], fixedPlanets: [], relations: [H("I–VI",1,6), H("I–X tratamento",1,10)], derivedHouses: [], lotNames: [], specialistPackets: ["healthSymbolic","temperament"],
    requiredOutputFields: ["humoralPredisposition","generalHealthIndicators","diseaseIndicators","organLocalization","supportingAfflictions","fixedStarEvidence","temporalActivationNeeded"],
    requiredEngineEvidence: [...universalEvidence, "medicalBodyParts", "temperament"], sourceTiers: { marcos: "primary", frawley: "verified-complement", gugu: "none" }, contextRequirements: [],
    aiProhibitions: ["diagnóstico médico literal", "prometer doença específica sem convergência"],
  },
  {
    id: "body-localization", section: 14, title: "Localização corporal de uma vulnerabilidade", phase: "radical",
    primaryHouses: [1,6], contextHouses: [], rulerHouses: [1,6], fixedPlanets: [], relations: [H("I–VI",1,6)], derivedHouses: [], lotNames: [], specialistPackets: ["healthSymbolic"],
    requiredOutputFields: ["bodyPart","house","significator","linkToI","linkToVI","modifiers","confidence"],
    requiredEngineEvidence: [...universalEvidence, "medicalBodyParts"], sourceTiers: { marcos: "primary", frawley: "none", gugu: "none" }, contextRequirements: ["órgão/sintoma quando a pergunta o especificar"],
    aiProhibitions: ["diagnóstico", "forçar correspondência corporal única sem suporte"],
  },
  {
    id: "accidents", section: 15, title: "Acidentes e lesões", phase: "radical",
    primaryHouses: [1,6], contextHouses: [], rulerHouses: [1,6], fixedPlanets: ["Marte","Saturno"], relations: [H("I–VI",1,6)], derivedHouses: [], lotNames: [], specialistPackets: ["healthSymbolic"],
    requiredOutputFields: ["accidentPredisposition","agents","bodilyReceiver","contextHouse","radicalPromise","timingNeeded"],
    requiredEngineEvidence: [...universalEvidence, "maleficContacts"], sourceTiers: { marcos: "primary", frawley: "none", gugu: "none" }, contextRequirements: ["tipo/contexto do acidente quando houver"],
    aiProhibitions: ["prever acidente concreto sem técnica temporal", "usar Marte sozinho como sentença"],
  },
  {
    id: "self-undoing", section: 16, title: "Sofrimento psíquico, vícios e autossabotagem", phase: "radical",
    primaryHouses: [12], contextHouses: [1,3,6], rulerHouses: [12,1,3,6], fixedPlanets: ["Lua","Mercúrio","Saturno","Marte"], relations: [H("I–XII",1,12), PH("Lua–XII","Lua",12), PH("Mercúrio–XII","Mercúrio",12)], derivedHouses: [], lotNames: ["Cativeiro","Necessidade"], specialistPackets: ["mentality","healthSymbolic"],
    requiredOutputFields: ["selfUndoingIndicators","hiddenRestrictions","linksToMind","linksToBody","counterTestimonies"],
    requiredEngineEvidence: [...universalEvidence, "mentalModifiers"], sourceTiers: { marcos: "primary", frawley: "none", gugu: "none" }, contextRequirements: [],
    aiProhibitions: ["converter XII em diagnóstico psiquiátrico", "confundir sofrimento com culpa moral automática"],
  },
  {
    id: "longevity", section: 17, title: "Vitalidade, longevidade e morte - Frawley atual", phase: "radical",
    primaryHouses: [1,8], contextHouses: [], rulerHouses: [1,8], fixedPlanets: ["Sol","Lua"], relations: [], derivedHouses: [], lotNames: [], specialistPackets: ["lifeIndicatorsFrawley"],
    requiredOutputFields: ["hyleg","anareta","alcochoden","lightOfTime","otherLight","ascendant","ascRuler","twilightAmbiguity","predictionRequiresMultiTechnique"],
    requiredEngineEvidence: [...universalEvidence, "placidusHylegalHouses"], sourceTiers: { marcos: "universal-only", frawley: "verified-complement", gugu: "none" }, contextRequirements: [],
    aiProhibitions: ["converter anos do Alcochoden em idade de morte", "dar data de morte a partir do radical"],
  },
  {
    id: "money", section: 18, title: "Dinheiro e recursos próprios", phase: "radical",
    primaryHouses: [2], contextHouses: [1], rulerHouses: [1,2], fixedPlanets: ["Júpiter"], relations: [H("I–II",1,2), PH("Júpiter–II","Júpiter",2)], derivedHouses: [], lotNames: ["Fortuna"], specialistPackets: ["wealth"],
    requiredOutputFields: ["financialCapacity","incomeSources","resourceStability","drains","fortuneEvidence","derivedHouseLinks"],
    requiredEngineEvidence: [...universalEvidence, "fortuneActivation"], sourceTiers: { marcos: "primary", frawley: "verified-complement", gugu: "none" }, contextRequirements: [],
    aiProhibitions: ["confundir II com salário", "confundir II com dinheiro do cônjuge"],
  },
  {
    id: "salary", section: 19, title: "Salário, remuneração e benefícios do trabalho", phase: "radical",
    primaryHouses: [10,11,2], contextHouses: [1], rulerHouses: [1,2,10,11], fixedPlanets: [], relations: [H("X–XI",10,11), H("XI–II",11,2), H("I–XI",1,11)],
    derivedHouses: [D("salário = II da X",2,"A Casa XI é a segunda casa derivada a partir da X.",10)], lotNames: [], specialistPackets: ["profession","wealth"],
    requiredOutputFields: ["careerIncome","salaryHouse","salaryRuler","careerLink","netResourceLink"], requiredEngineEvidence: [...universalEvidence, "derivedHouseResolutions"],
    sourceTiers: { marcos: "primary", frawley: "none", gugu: "none" }, contextRequirements: [], aiProhibitions: ["chamar VI de casa do trabalho"],
  },
  {
    id: "inheritance", section: 20, title: "Heranças e dinheiro de mortos", phase: "radical",
    primaryHouses: [8,2], contextHouses: [1], rulerHouses: [1,2,8], fixedPlanets: [], relations: [H("I–VIII",1,8), H("I–II",1,2)],
    derivedHouses: [D("posses da pessoa falecida",2,"Tomar a II a partir da casa radical da pessoa falecida.",undefined,"deceasedActorHouse")], lotNames: [], specialistPackets: ["wealth"],
    requiredOutputFields: ["inheritanceSource","derivedMoneyHouse","derivedMoneyRuler","linkToNative","impactOnOwnResources"], requiredEngineEvidence: [...universalEvidence, "derivedHouseTable"],
    sourceTiers: { marcos: "primary", frawley: "verified-complement", gugu: "none" }, contextRequirements: ["de quem vem a herança, se pessoa determinada"], aiProhibitions: ["usar VIII automaticamente para toda herança específica"],
  },
  {
    id: "other-money", section: 21, title: "Dinheiro do cônjuge, parceiro, cliente ou outro", phase: "radical",
    primaryHouses: [7,8], contextHouses: [1], rulerHouses: [1,7,8], fixedPlanets: [], relations: [H("I–VII",1,7), H("I–VIII",1,8), H("VII–VIII",7,8)],
    derivedHouses: [D("recursos do outro VII",2,"VIII é a II derivada da VII.",7), D("recursos de ator contextual",2,"Tomar a II a partir da casa do ator quando ele não for VII.",undefined,"otherActorHouse")], lotNames: [], specialistPackets: ["relationships","wealth"],
    requiredOutputFields: ["otherPersonHouse","otherMoneyHouse","resourceRuler","linkToNative"], requiredEngineEvidence: [...universalEvidence, "derivedHouseResolutions"],
    sourceTiers: { marcos: "primary", frawley: "verified-complement", gugu: "none" }, contextRequirements: ["quem é o outro quando não for pessoa da VII"], aiProhibitions: ["chamar VIII vagamente de dinheiro compartilhado"],
  },
  {
    id: "property", section: 22, title: "Imóveis, terra, casa e patrimônio imóvel", phase: "radical",
    primaryHouses: [4], contextHouses: [1,2,10], rulerHouses: [1,2,4,10], fixedPlanets: [], relations: [H("I–IV",1,4), H("II–IV",2,4)], derivedHouses: [], lotNames: [], specialistPackets: ["wealth"],
    requiredOutputFields: ["propertyCondition","roots","acquisitionCapacity","linksToResources"], requiredEngineEvidence: [...universalEvidence],
    sourceTiers: { marcos: "primary", frawley: "none", gugu: "none" }, contextRequirements: ["distinguir lar como extensão do nativo vs propriedade-objeto"], aiProhibitions: ["fundir I e IV sem declarar função"],
  },
  {
    id: "windfall", section: 23, title: "Loteria, ganhos do alto e apoios inesperados", phase: "radical",
    primaryHouses: [11,2], contextHouses: [1], rulerHouses: [1,2,11], fixedPlanets: ["Júpiter"], relations: [H("XI–II",11,2), H("I–XI",1,11)], derivedHouses: [], lotNames: ["Fortuna","Vitória"], specialistPackets: ["wealth","generalFortune"],
    requiredOutputFields: ["windfallPotential","supportChannels","resourceIntegration","timingRequired"], requiredEngineEvidence: [...universalEvidence, "fortuneActivation"], sourceTiers: { marcos: "primary", frawley: "none", gugu: "none" }, contextRequirements: [], aiProhibitions: ["prometer loteria por Júpiter/Fortuna isolados"],
  },
  {
    id: "loans-banks", section: 24, title: "Empréstimos, bancos, contratos financeiros", phase: "radical",
    primaryHouses: [1,2,7,8], contextHouses: [], rulerHouses: [1,2,7,8], fixedPlanets: [], relations: [H("I–VII contrato",1,7), H("II–VIII recursos",2,8), H("I–VIII",1,8)],
    derivedHouses: [D("recursos do banco/outro",2,"VIII é a II da VII quando VII representa o banco.",7)], lotNames: [], specialistPackets: ["relationships","wealth"],
    requiredOutputFields: ["ownResources","bankActor","bankResources","contractOpportunity","receptionInterest"], requiredEngineEvidence: [...universalEvidence, "derivedHouseResolutions"],
    sourceTiers: { marcos: "primary", frawley: "verified-complement", gugu: "none" }, contextRequirements: [], aiProhibitions: ["confundir recepção com aprovação automática de crédito"],
  },
  {
    id: "romance-sexuality", section: 25, title: "Romance, prazer e sexualidade", phase: "radical",
    primaryHouses: [5], contextHouses: [1,7], rulerHouses: [1,5,7], fixedPlanets: ["Vênus"], relations: [H("I–V",1,5), H("V–VII",5,7)], derivedHouses: [], lotNames: ["Amor"], specialistPackets: ["relationships"],
    requiredOutputFields: ["pleasureStyle","eroticPattern","partnerLink","lovePartEvidence"], requiredEngineEvidence: [...universalEvidence, "lovePartActivation"],
    sourceTiers: { marcos: "primary", frawley: "verified-complement", gugu: "none" }, contextRequirements: [], aiProhibitions: ["usar V para parceiro como pessoa", "usar VIII como sexo"],
  },
  {
    id: "relationships", section: 26, title: "Casamento, parceria e padrão relacional - Marcos", phase: "radical",
    primaryHouses: [1,7], contextHouses: [5], rulerHouses: [1,5,7], fixedPlanets: [], relations: [H("I–VII",1,7)], derivedHouses: [], lotNames: ["Amor"], specialistPackets: ["relationships"],
    requiredOutputFields: ["nativeSignificator","partnerSignificator","receptionNativeToPartner","receptionPartnerToNative","aspectOpportunity","perfection","cuspEvidence","thirdPartyInterference","relationshipPattern"], requiredEngineEvidence: [...universalEvidence, "relationshipPerfection"],
    sourceTiers: { marcos: "primary", frawley: "verified-complement", gugu: "none" }, contextRequirements: [], aiProhibitions: ["fundir recepção e aspecto", "profetizar parceiro específico deterministamente"],
  },
  {
    id: "children", section: 27, title: "Filhos, fertilidade e gravidez", phase: "radical",
    primaryHouses: [5], contextHouses: [1,7], rulerHouses: [1,5,7], fixedPlanets: ["Lua","Júpiter"], relations: [H("I–V",1,5)], derivedHouses: [], lotNames: ["Parte dos Filhos"], specialistPackets: ["children"],
    requiredOutputFields: ["fertilityTestimoniesFor","fertilityTestimoniesAgainst","childrenSignificators","partOfChildren","parentChildRelation","uncertainty"], requiredEngineEvidence: [...universalEvidence, "signFertility"],
    sourceTiers: { marcos: "primary", frawley: "verified-complement", gugu: "none" }, contextRequirements: [], aiProhibitions: ["contagem mecânica de testemunhos", "garantir número de filhos"],
  },
  {
    id: "father-roots", section: 28, title: "Pai, raízes e ancestralidade", phase: "radical",
    primaryHouses: [4], contextHouses: [1], rulerHouses: [1,4], fixedPlanets: ["Sol"], relations: [H("I–IV",1,4)], derivedHouses: [], lotNames: [], specialistPackets: [],
    requiredOutputFields: ["fatherSignificator","fatherCondition","nativeFatherReception","nativeFatherAspect","rootsContext"], requiredEngineEvidence: [...universalEvidence],
    sourceTiers: { marcos: "primary", frawley: "none", gugu: "none" }, contextRequirements: [], aiProhibitions: ["trocar pai e mãe por convenção moderna"],
  },
  {
    id: "mother", section: 29, title: "Mãe", phase: "radical",
    primaryHouses: [10], contextHouses: [1], rulerHouses: [1,10], fixedPlanets: [], relations: [H("I–X",1,10)], derivedHouses: [], lotNames: [], specialistPackets: [],
    requiredOutputFields: ["motherSignificator","motherCondition","nativeMotherRelation","contextDisambiguation"], requiredEngineEvidence: [...universalEvidence], sourceTiers: { marcos: "primary", frawley: "none", gugu: "none" }, contextRequirements: [], aiProhibitions: ["mover mãe para IV sem fonte/contexto"],
  },
  {
    id: "siblings-peers", section: 30, title: "Irmãos, primos, vizinhos e pares cotidianos", phase: "radical",
    primaryHouses: [3], contextHouses: [1], rulerHouses: [1,3], fixedPlanets: [], relations: [H("I–III",1,3)], derivedHouses: [D("subtema de irmão/ator III",2,"Usar casas derivadas a partir da III quando a pergunta for sobre posses/filhos etc. do irmão.",3)], lotNames: [], specialistPackets: [],
    requiredOutputFields: ["siblingsPattern","peerRelations","derivedSubtopic","receptions","aspects"], requiredEngineEvidence: [...universalEvidence, "derivedHouseTable"], sourceTiers: { marcos: "primary", frawley: "none", gugu: "none" }, contextRequirements: ["qual parente/ator se a derivação for específica"], aiProhibitions: ["usar III para todo familiar indistintamente"],
  },
  {
    id: "friends-support", section: 31, title: "Amigos, benfeitores, esperanças e apoios", phase: "radical",
    primaryHouses: [11], contextHouses: [1], rulerHouses: [1,11], fixedPlanets: ["Júpiter"], relations: [H("I–XI",1,11)], derivedHouses: [], lotNames: ["Vitória"], specialistPackets: ["generalFortune"],
    requiredOutputFields: ["friendSupport","hopes","benefactors","contextSubtype"], requiredEngineEvidence: [...universalEvidence], sourceTiers: { marcos: "primary", frawley: "none", gugu: "none" }, contextRequirements: ["distinguir amigo verdadeiro de aliado/interesse quando necessário"], aiProhibitions: ["confundir XI com qualquer grupo social"],
  },
  {
    id: "open-enemies", section: 32, title: "Inimigos declarados, concorrentes e oposição", phase: "radical",
    primaryHouses: [7], contextHouses: [1,10], rulerHouses: [1,7,10], fixedPlanets: [], relations: [H("I–VII",1,7)], derivedHouses: [], lotNames: [], specialistPackets: ["relationships"],
    requiredOutputFields: ["conflictPattern","opponentCondition","nativeOpponentRelation","authorityContext"], requiredEngineEvidence: [...universalEvidence], sourceTiers: { marcos: "primary", frawley: "none", gugu: "none" }, contextRequirements: [], aiProhibitions: ["confundir VII com inimigo oculto"],
  },
  {
    id: "hidden-enemies", section: 33, title: "Inimigos ocultos, confinamentos e restrições", phase: "radical",
    primaryHouses: [12], contextHouses: [1], rulerHouses: [1,12], fixedPlanets: ["Saturno"], relations: [H("I–XII",1,12)], derivedHouses: [], lotNames: ["Cativeiro"], specialistPackets: [],
    requiredOutputFields: ["hiddenEnemyPattern","restrictionPattern","selfUndoingPattern","actorSource"], requiredEngineEvidence: [...universalEvidence], sourceTiers: { marcos: "primary", frawley: "none", gugu: "none" }, contextRequirements: [], aiProhibitions: ["usar XII como hospital automaticamente", "confundir XII com VII"],
  },
  {
    id: "communication-basic-learning", section: 34, title: "Comunicação, leitura, escrita e habilidades intelectuais básicas", phase: "radical",
    primaryHouses: [3], contextHouses: [1,9], rulerHouses: [1,3,9], fixedPlanets: ["Mercúrio","Lua"], relations: [PH("Mercúrio–III","Mercúrio",3), H("I–III",1,3)], derivedHouses: [], lotNames: [], specialistPackets: ["mentality"],
    requiredOutputFields: ["basicLearning","communicationStyle","speechWriting","mercuryIntegration"], requiredEngineEvidence: [...universalEvidence, "signVoice"], sourceTiers: { marcos: "primary", frawley: "verified-complement", gugu: "separate-supplement" }, contextRequirements: [], aiProhibitions: ["transformar Mercúrio em QI"],
  },
  {
    id: "routine", section: 35, title: "Rotina e atividades cotidianas", phase: "radical",
    primaryHouses: [3], contextHouses: [10], rulerHouses: [3,10], fixedPlanets: [], relations: [H("III–X",3,10)], derivedHouses: [], lotNames: [], specialistPackets: ["profession"],
    requiredOutputFields: ["dailyRoutine","workRoutineLink","habitContext"], requiredEngineEvidence: [...universalEvidence], sourceTiers: { marcos: "primary", frawley: "none", gugu: "none" }, contextRequirements: [], aiProhibitions: ["usar VI como rotina no esquema Marcos"],
  },
  {
    id: "higher-learning", section: 36, title: "Ensino superior, conhecimento, mestres e profissões eruditas como categoria", phase: "radical",
    primaryHouses: [9], contextHouses: [1,10], rulerHouses: [1,9,10], fixedPlanets: ["Júpiter","Mercúrio"], relations: [H("I–IX",1,9), H("IX–X",9,10)], derivedHouses: [], lotNames: [], specialistPackets: ["mentality","spiritualOrientation","profession"],
    requiredOutputFields: ["higherLearning","knowledgeOrientation","teacherScholarPattern","contextualRoleRouting"], requiredEngineEvidence: [...universalEvidence], sourceTiers: { marcos: "primary", frawley: "verified-complement", gugu: "separate-supplement" }, contextRequirements: ["distinguir profissão erudita como categoria de profissão concreta do nativo"], aiProhibitions: ["confundir IX com carreira do nativo sem X"],
  },
  {
    id: "faith", section: 37, title: "Fé, religião e orientação espiritual", phase: "radical",
    primaryHouses: [9], contextHouses: [1,3], rulerHouses: [1,3,9], fixedPlanets: ["Júpiter","Sol","Lua"], relations: [H("I–IX",1,9), H("III–IX",3,9)], derivedHouses: [], lotNames: ["Fortuna","Espírito","Necessidade","Amor","Valor","Vitória","Cativeiro"], specialistPackets: ["spiritualOrientation","generalFortune"],
    requiredOutputFields: ["faithImportance","faithEaseDifficulty","nativeFaithReception","spiritualModifiers","uncertainty"], requiredEngineEvidence: [...universalEvidence], sourceTiers: { marcos: "primary", frawley: "verified-complement", gugu: "none" }, contextRequirements: [], aiProhibitions: ["inferir religião nominal exata automaticamente"],
  },
  {
    id: "dreams", section: 38, title: "Sonhos durante o sono", phase: "radical",
    primaryHouses: [9], contextHouses: [3], rulerHouses: [9], fixedPlanets: ["Lua"], relations: [PH("Lua–IX","Lua",9)], derivedHouses: [], lotNames: [], specialistPackets: ["mentality","spiritualOrientation"],
    requiredOutputFields: ["dreamPattern","lunarLink","house9Condition"], requiredEngineEvidence: [...universalEvidence, "moonPhase"], sourceTiers: { marcos: "primary", frawley: "none", gugu: "none" }, contextRequirements: [], aiProhibitions: ["converter sonho em inconsciente moderno sem fonte"],
  },
  {
    id: "short-travel", section: 39, title: "Viagens curtas/rotineiras e deslocamentos", phase: "radical",
    primaryHouses: [3], contextHouses: [1], rulerHouses: [1,3], fixedPlanets: [], relations: [H("I–III",1,3)], derivedHouses: [], lotNames: [], specialistPackets: [],
    requiredOutputFields: ["travelType","travelHouse","travelRuler","nativeTravelRelation"], requiredEngineEvidence: [...universalEvidence], sourceTiers: { marcos: "primary", frawley: "none", gugu: "none" }, contextRequirements: ["finalidade da viagem quando ambígua"], aiProhibitions: ["classificar viagem só por quilômetros"],
  },
  {
    id: "long-travel", section: 40, title: "Viagens longas, estrangeiro e peregrinação", phase: "radical",
    primaryHouses: [9], contextHouses: [1,3], rulerHouses: [1,3,9], fixedPlanets: ["Júpiter"], relations: [H("I–IX",1,9)], derivedHouses: [], lotNames: [], specialistPackets: ["spiritualOrientation"],
    requiredOutputFields: ["longTravelPotential","foreignContext","pilgrimageStudyLink"], requiredEngineEvidence: [...universalEvidence], sourceTiers: { marcos: "primary", frawley: "none", gugu: "none" }, contextRequirements: ["finalidade/contexto"], aiProhibitions: ["classificar viagem só por distância física"],
  },
  {
    id: "profession-marcos", section: 41, title: "Profissão, habilidades e estilo de trabalho - Marcos", phase: "radical",
    primaryHouses: [10], contextHouses: [1,3,5,7,9,11], rulerHouses: [1,10], fixedPlanets: ["Mercúrio","Vênus","Marte"], relations: [H("I–X",1,10)], derivedHouses: [], lotNames: [], specialistPackets: ["profession","mentality","temperament"],
    requiredOutputFields: ["activityLevel","routineAffinity","artisticInclination","intellectualInclination","practicalInclination","solitaryVsSocial","leadership","autonomy","stabilityVsVariety","skillFamilies"], requiredEngineEvidence: [...universalEvidence, "careerCapabilityPacket"],
    sourceTiers: { marcos: "primary", frawley: "none", gugu: "none" }, contextRequirements: [], aiProhibitions: ["determinar profissão exata inevitável"],
  },
  {
    id: "profession-frawley", section: 42, title: "Profissão - complemento Frawley verificado", phase: "radical",
    primaryHouses: [10], contextHouses: [], rulerHouses: [10], fixedPlanets: ["Mercúrio","Vênus","Marte"], relations: [], derivedHouses: [], lotNames: [], specialistPackets: ["profession"],
    requiredOutputFields: ["house10","house10Ruler","planetsIn10","mercury","venus","mars","capacityComparison"], requiredEngineEvidence: [...universalEvidence, "careerCapabilityPacket"],
    sourceTiers: { marcos: "universal-only", frawley: "verified-complement", gugu: "none" }, contextRequirements: [], aiProhibitions: ["atribuir ao Frawley critério não verificado", "somar força em score vocacional total"],
  },
  {
    id: "authority-status", section: 43, title: "Honra, autoridade, chefes e posição pública", phase: "radical",
    primaryHouses: [10], contextHouses: [1], rulerHouses: [1,10], fixedPlanets: [], relations: [H("I–X",1,10)], derivedHouses: [], lotNames: ["Vitória"], specialistPackets: ["profession"],
    requiredOutputFields: ["publicStatus","authorityPattern","mcEvidence","fixedStarProminence"], requiredEngineEvidence: [...universalEvidence, "mcFixedStars"], sourceTiers: { marcos: "primary", frawley: "verified-complement", gugu: "none" }, contextRequirements: [], aiProhibitions: ["inferir cargo exato por estrela/ângulo isolado"],
  },
  {
    id: "fame", section: 44, title: "Fama e notabilidade - suplemento Frawley", phase: "radical",
    primaryHouses: [10,1], contextHouses: [], rulerHouses: [1,10], fixedPlanets: ["Sol","Lua"], relations: [H("I–X",1,10)], derivedHouses: [], lotNames: ["Vitória"], specialistPackets: ["profession","prenatalSyzygy"],
    requiredOutputFields: ["natalProminence","fixedStarProminence","prenatalLunationEclipseLinks","mundaneContextNeeded"], requiredEngineEvidence: [...universalEvidence, "prenatalSyzygy", "lunationGeometry", "prenatalLunationNatalLinks"], sourceTiers: { marcos: "primary", frawley: "verified-complement", gugu: "none" }, contextRequirements: ["contexto histórico/mundano se a pergunta for fama efetiva"], aiProhibitions: ["prometer fama só por estrela real/angularidade"],
  },
  {
    id: "subordinates-small-animals", section: 45, title: "Empregados, subordinados, prestadores e pequenos animais", phase: "radical",
    primaryHouses: [6], contextHouses: [1,10], rulerHouses: [1,6,10], fixedPlanets: ["Mercúrio","Marte"], relations: [H("I–VI",1,6)], derivedHouses: [], lotNames: [], specialistPackets: [],
    requiredOutputFields: ["subordinates","serviceProviders","smallAnimals","nativeRelation"], requiredEngineEvidence: [...universalEvidence], sourceTiers: { marcos: "primary", frawley: "none", gugu: "none" }, contextRequirements: ["distinguir empregado/prestador/animal"], aiProhibitions: ["usar VI como profissão do nativo"],
  },
  {
    id: "large-animals", section: 46, title: "Grandes animais", phase: "radical",
    primaryHouses: [12], contextHouses: [1,10,6], rulerHouses: [1,6,10,12], fixedPlanets: [], relations: [H("I–XII",1,12)], derivedHouses: [], lotNames: [], specialistPackets: [],
    requiredOutputFields: ["animalCategory","animalHouse","nativeRelation","careerLink"], requiredEngineEvidence: [...universalEvidence], sourceTiers: { marcos: "primary", frawley: "none", gugu: "none" }, contextRequirements: ["classificação pequeno/domesticável vs grande/indomável"], aiProhibitions: ["usar VI para todo animal indistintamente"],
  },
  {
    id: "derived-house-router", section: 47, title: "Circunstância natal não listada: roteador por casas derivadas", phase: "radical",
    primaryHouses: [1,2,3,4,5,6,7,8,9,10,11,12], contextHouses: [], rulerHouses: [1,2,3,4,5,6,7,8,9,10,11,12], fixedPlanets: [], relations: [],
    derivedHouses: [D("casa derivada contextual",2,"O motor oferece tabela completa 12×12; o contexto escolhe ator e assunto.",undefined,"actorHouse")], lotNames: [], specialistPackets: [],
    requiredOutputFields: ["actor","radicalHouse","derivedHouse","derivationPath","significator","evidence","unsupportedFlag"], requiredEngineEvidence: [...universalEvidence, "derivedHouseTable"],
    sourceTiers: { marcos: "primary", frawley: "verified-complement", gugu: "none" }, contextRequirements: ["ator e assunto concretos"], aiProhibitions: ["inventar associação casa-signo moderna", "escolher casa pela palavra isolada"],
  },
  {
    id: "radical-promise", section: 48, title: "Promessa radical antes de qualquer previsão", phase: "timing",
    primaryHouses: [], contextHouses: [], rulerHouses: [], fixedPlanets: [], relations: [], derivedHouses: [], lotNames: [], specialistPackets: [],
    requiredOutputFields: ["radicalPromise","radicalContradictions","timingEligible"], requiredEngineEvidence: ["selectedRadicalDomainDossier"],
    sourceTiers: { marcos: "primary", frawley: "verified-complement", gugu: "none" }, contextRequirements: ["tema natal selecionado", "janela temporal quando houver previsão"], aiProhibitions: ["usar trânsito isolado como substituto do radical"],
  },
  {
    id: "primary-directions", section: 49, title: "Direções primárias - Marcos", phase: "timing",
    primaryHouses: [], contextHouses: [], rulerHouses: [], fixedPlanets: [], relations: [], derivedHouses: [], lotNames: [], specialistPackets: [],
    requiredOutputFields: ["directionContact","aspect","dateWindow","activatedNatalDomain","returnConfirmation"], requiredEngineEvidence: ["timingContext", "sourceLockedPrimaryDirectionModule"],
    sourceTiers: { marcos: "primary", frawley: "none", gugu: "none" }, contextRequirements: ["data/janela alvo e significador natal"], aiProhibitions: ["misturar regra de progressão com direção", "IA calcular arco/direção"],
  },
  {
    id: "secondary-progressions-marcos", section: 50, title: "Progressões secundárias - Marcos", phase: "timing",
    primaryHouses: [], contextHouses: [], rulerHouses: [], fixedPlanets: [], relations: [], derivedHouses: [], lotNames: [], specialistPackets: [],
    requiredOutputFields: ["progressedPoint","natalTarget","contactType","timeWindow","activatedDomain","returnConfirmation"], requiredEngineEvidence: ["timingContext", "secondaryProgressionConjunctionOppositionModule"],
    sourceTiers: { marcos: "primary", frawley: "none", gugu: "none" }, contextRequirements: ["data/janela alvo"], aiProhibitions: ["usar sextil/quadratura/trígono no modo Marcos", "IA calcular progressão"],
  },
  {
    id: "solar-lunar-return-marcos", section: 51, title: "Revolução Solar e Lunar - Marcos", phase: "timing",
    primaryHouses: [], contextHouses: [], rulerHouses: [], fixedPlanets: [], relations: [], derivedHouses: [], lotNames: [], specialistPackets: [],
    requiredOutputFields: ["solarReturn","lunarReturn","natalCrossLinks","refinement","contradictions"], requiredEngineEvidence: ["timingContext", "exactSolarReturn", "exactLunarReturn"],
    sourceTiers: { marcos: "primary", frawley: "scope-only", gugu: "none" }, contextRequirements: ["ano/mês alvo"], aiProhibitions: ["retorno vencer radical", "IA calcular retorno"],
  },
  {
    id: "frawley-timing", section: 52, title: "Progressões, retornos e profecções - Frawley atual", phase: "timing",
    primaryHouses: [], contextHouses: [], rulerHouses: [], fixedPlanets: [], relations: [], derivedHouses: [], lotNames: [], specialistPackets: [],
    requiredOutputFields: ["module","sourceLockedAlgorithm","status","unresolvedTechnique"], requiredEngineEvidence: ["frawleyTimingCapabilityRegistry", "frawleySourceGapRegistry"],
    sourceTiers: { marcos: "universal-only", frawley: "scope-only", gugu: "none" }, contextRequirements: ["técnica e janela alvo"], aiProhibitions: ["inventar algoritmo a partir do título da aula"],
  },
  {
    id: "temporal-convergence", section: 53, title: "Regra de convergência temporal", phase: "timing",
    primaryHouses: [], contextHouses: [], rulerHouses: [], fixedPlanets: [], relations: [], derivedHouses: [], lotNames: [], specialistPackets: [],
    requiredOutputFields: ["convergence","corroborations","contradictions","confidence","eventSpecificity"], requiredEngineEvidence: ["radicalPromise", "timingTechniqueOutputs", "returnOutputs"],
    sourceTiers: { marcos: "primary", frawley: "verified-complement", gugu: "none" }, contextRequirements: ["saídas calculadas das técnicas temporais pertinentes"], aiProhibitions: ["contar técnicas mecanicamente", "promover técnica isolada contra o radical"],
  },
];

export const AI_NATAL_OUTPUT_RULES = {
  promptLanguage: "pt-BR",
  promptVersion: "2.0.0",
  requiredBlocks: ["DADOS_CALCULADOS", "TESTEMUNHOS", "SINTESE", "INCERTEZAS_E_CONFLITOS", "CONTEXTO_NECESSARIO"],
  judgmentLayers: ["NATAL_FACTS", "NATAL_AUTHORIAL_DOSSIER", "NATAL_JUDGMENT_CONTEXT"],
  authorialSeparation: "STRICT_MARCOS_FRAWLEY_GUGU_PROVENANCE",
  openWorldRouting: "SEMANTIC_COMPOSITION_FROM_HOUSE_ONTOLOGY_AND_ENGINE_RESOLVED_DERIVED_HOUSES",
  forbiddenCalculations: [
    "longitude", "ASC_MC", "timezone", "houseGeometry", "aspect", "applicationSeparation", "reception", "antiscion",
    "essentialDignity", "solarCondition", "fixedStarContact", "arabicLot", "hyleg", "anareta", "alcochoden", "derivedHouseArithmetic",
  ],
  prohibitedShortcuts: [
    "singleSymbolConcreteConclusion", "sunSignPersonality", "planetInSignBiography", "receptionEqualsEvent",
    "naturalSignificatorReplacesHouseRuler", "unpublishedOrbOrFormula", "silentAuthorBlending", "staticRadixPredictionWithoutTimingExecution",
  ],
  selfInvestigationRequired: true,
  qualitativeJudgment: "SUBJETIVIDADE_DISCIPLINADA_SOMENTE_EM_ZONAS_DELEGADAS",
  providerIntegration: "SERVER_SIDE_VENDOR_NEUTRAL_ADAPTER",
  conclusionRule: "A IA interpreta somente evidência materializada; campo ausente deve virar MISSING_ENGINE_DATA, nunca cálculo improvisado.",
} as const;

export const EXPECTED_PROTOCOL_SECTIONS = Array.from({ length: 48 }, (_, index) => index + 6);
