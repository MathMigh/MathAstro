// ============================================================
// horaryTables.ts — Tabelas de Referência para Astrologia Horária
// Baseado em: Frawley (The Real Astrology), Lilly (CA), Monteiro
// ============================================================

// --- Ordem Caldaica dos Planetas ---
export const CALDAIC_ORDER = [
  "Sol", "Vênus", "Mercúrio", "Lua", "Saturno", "Júpiter", "Marte",
];

// --- Regente do dia da semana (0=Dom, 1=Seg, ...) ---
export const DAY_RULERS = [
  "Sol",    // Domingo
  "Lua",    // Segunda
  "Marte",  // Terça
  "Mercúrio",// Quarta
  "Júpiter",// Quinta
  "Vênus",  // Sexta
  "Saturno",// Sábado
];

/**
 * Retorna o Senhor da Hora para um dado dia e hora.
 * dayOfWeek: 0=Domingo, 1=Segunda, ..., 6=Sábado
 * hour: 0-23
 */
export function getHourLord(dayOfWeek: number, hour: number): string {
  const safeHour = ((hour % 24) + 24) % 24;
  const dayRulerIdx = CALDAIC_ORDER.indexOf(DAY_RULERS[((dayOfWeek % 7) + 7) % 7]);
  return CALDAIC_ORDER[(dayRulerIdx + safeHour) % CALDAIC_ORDER.length];
}

// --- Tópicos Horários → Casa Derivada ---
export const HORARY_TOPICS: Record<string, { label: string; house: number }> = {
  // Amor e Relacionamentos
  amor:           { label: "Amor (casamento/relacionamento)", house: 7 },
  casamento:      { label: "Casamento", house: 7 },
  relacionamento: { label: "Relacionamento", house: 7 },
  noivo:          { label: "Noivo(a)", house: 7 },
  namoro:         { label: "Namoro", house: 7 },
  divororcio:     { label: "Divórcio", house: 7 },

  // Trabalho
  emprego:  { label: "Emprego", house: 10 },
  trabalho: { label: "Trabalho", house: 10 },
  carreira: { label: "Carreira", house: 10 },
  patrao:   { label: "Patrão", house: 10 },
  demissao: { label: "Demissão", house: 10 },
  promocao: { label: "Promoção", house: 10 },

  // Dinheiro
  dinheiro:   { label: "Dinheiro/Finanças", house: 2 },
  financas:   { label: "Finanças", house: 2 },
  divida:     { label: "Dívida", house: 8 },
  emprestimo: { label: "Empréstimo", house: 8 },
  investimento:{ label: "Investimento", house: 2 },
  heranca:    { label: "Herança", house: 8 },

  // Saúde
  saude:    { label: "Saúde", house: 6 },
  doenca:   { label: "Doença", house: 6 },
  cirurgia: { label: "Cirurgia", house: 8 },
  remedio:  { label: "Remédio", house: 6 },

  // Família
  mae:     { label: "Mãe", house: 10 },
  pai:     { label: "Pai", house: 4 },
  filhos:  { label: "Filhos", house: 5 },
  irmaos:  { label: "Irmãos", house: 3 },
  familia: { label: "Família", house: 4 },

  // Viagens
  viagem:       { label: "Viagem curta", house: 3 },
  viagem_longa: { label: "Viagem longa / mudança", house: 9 },
  mudanca:      { label: "Mudança", house: 9 },

  // Estudos
  estudos:      { label: "Estudos / Ensino", house: 9 },
  exame:        { label: "Exame / Prova", house: 9 },
  universidade: { label: "Universidade", house: 9 },

  // Perdidos
  perdido:              { label: "Objeto perdido", house: 2 },
  objeto_perdido:       { label: "Objeto perdido", house: 2 },
  animal_perdido:       { label: "Animal perdido", house: 6 },
  pessoa_desaparecida:  { label: "Pessoa desaparecida", house: 7 },

  // Compras / Vendas
  compra:  { label: "Compra", house: 7 },
  venda:   { label: "Venda", house: 7 },
  imovel:  { label: "Imóvel", house: 4 },
  veiculo: { label: "Veículo", house: 3 },

  // Jurídico
  processo: { label: "Processo judicial", house: 7 },
  advogado: { label: "Advogado", house: 9 },

  // Gravidez
  gravidez: { label: "Gravidez", house: 5 },

  // Amigos
  amigo:    { label: "Amigos", house: 11 },
  amizade:  { label: "Amizade", house: 11 },

  // Inimigos
  inimigo: { label: "Inimigos", house: 12 },
  rival:   { label: "Rival", house: 7 },
};

// --- Graus Críticos de Lilly ---
export const LILLY_CRITICAL_DEGREES = [
  5, 6, 15, 16, 17, 18, 19, 22, 23, 25, 26, 27, 28, 29,
];

// --- Orbes tradicionais para Horária (Frawley/Lilly) ---
export const HORARY_ORBES: Record<string, number> = {
  "Sol":     15,
  "Lua":     12,
  "Mercúrio": 7,
  "Vênus":    8,
  "Marte":    7,
  "Júpiter":  9,
  "Saturno":  9,
};

// --- Mapa nome PT-BR → PlanetType ---
export const PLANET_NAME_TO_TYPE: Record<string, string> = {
  "Sol":     "sun",
  "Lua":     "moon",
  "Mercúrio":"mercury",
  "Vênus":   "venus",
  "Marte":   "mars",
  "Júpiter": "jupiter",
  "Saturno": "saturno",
};

// --- Mapa PlanetType → nome PT-BR ---
export const PLANET_TYPE_TO_NAME: Record<string, string> = {
  "sun":     "Sol",
  "moon":    "Lua",
  "mercury": "Mercúrio",
  "venus":   "Vênus",
  "mars":    "Marte",
  "jupiter": "Júpiter",
  "saturno": "Saturno",
};

// --- Força da Recepção por tipo de dignidade ---
export const RECEPTION_STRENGTH: Record<string, "forte" | "moderada" | "fraca"> = {
  domicilio:    "forte",
  exaltacao:    "forte",
  triplicidade: "moderada",
  termo:        "moderada",
  face:         "fraca",
};

// --- Distâncias especiais do Sol (graus) ---
export const COMBUST_DISTANCE = 8.5;
export const CAZIMI_DISTANCE  = 0.283; // ~17 minutos
export const SUNBEAMS_DISTANCE = 17.0;

// --- Planetas benéficos e maléficos ---
export const BENEFICS = ["Júpiter", "Vênus"];
export const MALEFICS = ["Marte", "Saturno"];
