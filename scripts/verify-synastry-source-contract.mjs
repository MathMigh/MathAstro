import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const engine = read("src/traditions/western/synastry/synastryEngine.ts");
const contract = read("src/traditions/western/synastry/synastryMethodContract.ts");
const report = read("src/traditions/western/synastry/synastryReport.ts");
const ai = read("src/traditions/western/synastry/synastryAIPacket.ts");
const setup = read("src/app/components/synastry/SynastrySetupPanel.tsx");

const failures = [];
const requireText = (text, needle, message) => { if (!text.includes(needle)) failures.push(message); };
const forbid = (text, regex, message) => { if (regex.test(text)) failures.push(message); };

// Marcos — passo crucial: cada natal/papel antes dos contatos; regente I + Lua.
requireText(contract, "Comparar os dois padrões antes dos contatos", "Contrato não preserva o passo crucial de Marcos.");
requireText(contract, "Lua como significador secundário", "Contrato não preserva a Lua como significador secundário no exemplo de Marcos.");
requireText(engine, "moonDirectAspect", "Motor não materializa aspecto natal Lua↔regente do papel.");
requireText(engine, '"a-moon-to-b-role"', "Motor não testa Lua de A contra o papel em B.");
requireText(engine, '"a-role-to-b-moon"', "Motor não testa Lua de B contra o papel em A.");

// Frawley/Gugu — why/how, temperamento antes dos contatos, leitura natal extendida.
requireText(contract, "Temperamento como fundamento geral do porquê", "Contrato não registra temperamento como fundamento do porquê.");
requireText(contract, "uma qualidade comum e uma diferente", "Contrato não registra a formulação temperamental preferencial de Frawley.");
requireText(contract, "corroborative-direct", "Contrato não registra a corroboração direta de Gugu: temperamento primeiro.");
requireText(contract, "Contatos cruzados: como e onde", "Contrato não registra contatos como camada do como.");
requireText(contract, "dignidade, recepção e aspecto", "Registro de fonte não preserva a tríade dignidade/recepção/aspecto.");

// Proveniência — só o que foi diretamente exemplificado pode ser source-locked.
requireText(engine, "crossContactProvenance", "Motor não diferencia proveniência dos contatos.");
requireText(engine, 'cusp.house === 1', "Contato com ASC não está separado por proveniência.");
requireText(engine, 'cusp.house === 10', "Contato com MC não está separado por proveniência.");
requireText(engine, 'status: "derived-from-source"', "Derivações não estão marcadas no motor.");
requireText(contract, "uso uniforme de 5°", "Contrato não marca o teto uniforme de 5° planeta→cúspide como derivação operacional.");
requireText(contract, "Frawley explícito para orbe/hierarquia; Marcos explícito para antíscio em cúspide", "Proveniência de antíscio não separa Frawley (orbe/hierarquia) de Marcos (cúspide).");

// Regras negativas essenciais.
forbid(engine, /compatibilityScore|compatibilityPercent|overallCompatibilityScore/i, "Motor contém score/percentual de compatibilidade.");
forbid(engine, /quincunx|semisextile|semisquare|sesquiquadrate/i, "Motor contém aspecto menor moderno.");
requireText(contract, "cross-chart-applying-separating", "Contrato não proíbe aplicação/separação entre nascimentos.");
requireText(contract, "cusp-to-cusp-aspect-mechanics", "Contrato não proíbe cúspide↔cúspide.");
requireText(contract, "relationship-duration-from-static-synastry", "Contrato não bloqueia duração por sinastria estática.");
requireText(contract, "ai-recalculates-missing-data", "Contrato não proíbe recálculo pela IA.");

// Zero ocorrências é resultado, não missing.
forbid(engine, /fixedStarMatches\?\.length\) warnings\.push/, "Motor confunde zero contatos estelares com dados ausentes.");
requireText(engine, "Zero contatos com estrelas é um resultado válido", "Regra de zero ocorrências válidas não está documentada no código.");

// Relatório/IA/front devem carregar tudo sem esconder limitações.
requireText(report, "ANEXO JSON INTEGRAL", "Relatório não materializa JSON integral.");
requireText(ai, "MISSING_ENGINE_DATA", "Envelope IA não contém regra MISSING_ENGINE_DATA.");
requireText(ai, "forbiddenRecalculations", "Envelope IA não explicita cálculos proibidos.");
requireText(setup, "Papéis personalizados", "Front não permite declarar relação não coberta por preset.");
requireText(setup, "Limite do método", "Front não informa limite temporal.");

if (failures.length) {
  console.error("VERIFICAÇÃO DO CONTRATO DE FONTES DA SINASTRIA: FALHOU");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("VERIFICAÇÃO DO CONTRATO DE FONTES DA SINASTRIA: OK — método Marcos/Frawley, proveniência, proibições e IA preservados.");
