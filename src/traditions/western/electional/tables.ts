import type { ElectionalGoalProfile, ElectionalSourceRef } from "./types";

export const ELECTIONAL_SOURCES: ElectionalSourceRef[] = [
  {
    id: "M-BK-ELECT",
    author: "Marcos Monteiro",
    tier: "primary-published",
    work: "Introdução à Astrologia Ocidental — Edição Revista e Aumentada",
    locator: "Astrologia eletiva; Casa I; estrelas fixas",
    note: "Eletiva escolhe o melhor céu disponível dentro das restrições e deve sempre referir-se ao mapa da pessoa; Casa I significa também o empreendimento; em horária/eletiva, o risco de usar estrelas fixas é maior que o de ignorá-las.",
  },
  {
    id: "M-TX-ELECT-CURRENT",
    author: "Marcos Monteiro",
    tier: "primary-current",
    work: "Transcrição recente fornecida no corpus MathAstro",
    locator: "Vídeo: por que não faço eletiva e o que faço em vez disso",
    note: "Critica eleições tratadas como câmaras temporais estanques/minuto mágico e relata preferência por escolher o momento por horária, aprendida com Frawley.",
  },
  {
    id: "F-REAL-ELECT",
    author: "John Frawley",
    tier: "primary-published",
    work: "The Real Astrology",
    locator: "cap. 10 — Electional Astrology",
    note: "Eletiva como arte do possível: julgar potencial natal, objetivo concreto, restrições reais, luminares, regentes natais relevantes, regentes do mapa eletivo, natureza da tarefa e o melhor disponível, não um mapa perfeito. Eleições simples por Lua/hora planetária existem, mas não equivalem à eleição completa.",
  },
  {
    id: "F-CURRENT-ELECT",
    author: "John Frawley",
    tier: "primary-current",
    work: "Natal and Electional Astrology — FAQ atual",
    locator: "johnfrawley.com/natal-and-electional-astrology",
    note: "Frawley afirma atualmente não ver valor prático na eletiva e não aceitar comissões, mas a ensina como ferramenta pedagógica para recepções e movimento.",
  },
  {
    id: "G-ELECT",
    author: "Luiz Gonzaga de Carvalho Neto",
    tier: "secondary",
    work: "Corpus MathAstro atribuído a Gugu",
    note: "Somente aplicar regras eletivas específicas quando houver fala identificável no corpus; ausência não deve ser preenchida por astrologia genérica.",
  },
  {
    id: "MA-OP-ELECT",
    author: "MathAstro",
    tier: "operational",
    work: "Contrato operacional do motor eletivo",
    note: "Converte princípios qualitativos dos autores em gates, testemunhos e vetor lexicográfico sem criar um score astrológico totalizador.",
  },
];

export const ELECTIONAL_GOALS: Record<string, ElectionalGoalProfile> = {
  business: {
    id: "business", label: "Iniciar empresa/negócio", radicalHouse: 10, natalHouses: [10, 2], naturalPlanets: ["sun", "mercury", "jupiter"], preferredModes: ["fixed"], preferredElements: ["Terra"],
    notes: ["Frawley: fortalecer regentes natais de X e II conforme o objetivo; o objetivo deve ser explicitado.", "Marcos: Casa I da eletiva significa também o próprio empreendimento."],
  },
  partnership: {
    id: "partnership", label: "Iniciar parceria", radicalHouse: 7, natalHouses: [1, 7, 10, 2], naturalPlanets: ["mercury", "venus", "jupiter"],
    notes: ["Frawley: em parceria, fortalecer VII, mas sem fazê-lo dominar indevidamente o significador do consulente."],
  },
  marriage: {
    id: "marriage", label: "Casamento", radicalHouse: 7, natalHouses: [1, 7], naturalPlanets: ["venus", "moon"], preferredModes: ["fixed"],
    notes: ["Frawley: fortalecer regente natal de VII e Vênus; nenhuma eleição corrige incompatibilidade fundamental."],
  },
  publication: {
    id: "publication", label: "Publicar/lancar obra", radicalHouse: 9, natalHouses: [9, 10, 5], naturalPlanets: ["mercury", "jupiter"], preferredElements: ["Ar"],
    notes: ["Perfil operacional: distinguir obra (V), publicação/difusão (IX) e projeção pública (X) conforme o objetivo concreto."],
  },
  website: {
    id: "website", label: "Lancar website/produto de comunicacao", radicalHouse: 10, natalHouses: [10, 3, 2], naturalPlanets: ["mercury"], preferredElements: ["Ar"],
    notes: ["Marcos cita fundação de website como exemplo eletivo; a casa relevante depende do propósito efetivo."],
  },
  house: {
    id: "house", label: "Construir casa/imovel", radicalHouse: 4, natalHouses: [4, 1, 2], naturalPlanets: ["saturn", "moon"], preferredModes: ["fixed"], preferredElements: ["Terra"],
    notes: ["Frawley: fortalecer regente da IV; duração favorece signos fixos."],
  },
  party: {
    id: "party", label: "Festa/celebracao", radicalHouse: 5, natalHouses: [5], naturalPlanets: ["venus", "jupiter"],
    notes: ["Frawley: fortalecer regente da V; uma eleição para festa não deve ser construída como uma para cirurgia."],
  },
  general: {
    id: "general", label: "Empreendimento geral", radicalHouse: 1, natalHouses: [1], naturalPlanets: ["sun", "moon"],
    notes: ["Obrigatório refinar o objetivo antes de uma eleição final; 'quero iniciar algo' é insuficiente para priorização fina."],
  },
};
