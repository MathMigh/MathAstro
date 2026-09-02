#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const Module = require('node:module');
const ts = require('typescript');

const ROOT = path.resolve(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mathastro-natal-ai-'));

function transpile(sourcePath, outName) {
  const source = fs.readFileSync(path.join(ROOT, sourcePath), 'utf8');
  const result = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
    },
    fileName: path.basename(sourcePath),
  });
  fs.writeFileSync(path.join(tmp, outName), result.outputText);
}

transpile('src/app/lib/natalAiSanitizer.ts', 'natalAiSanitizer.js');
transpile('src/app/lib/natalJudgmentEngine.ts', 'natalJudgmentEngine.js');
transpile('src/app/lib/natalAiIntegration.ts', 'natalAiIntegration.js');
const engine = require(path.join(tmp, 'natalJudgmentEngine.js'));
const integration = require(path.join(tmp, 'natalAiIntegration.js'));
const sanitizer = require(path.join(tmp, 'natalAiSanitizer.js'));

const rulers = ['Marte','Vênus','Mercúrio','Lua','Sol','Mercúrio','Vênus','Marte','Júpiter','Saturno','Saturno','Júpiter'];
const derivedHouseTable = [];
for (let baseHouse = 1; baseHouse <= 12; baseHouse++) {
  for (let relativeHouse = 1; relativeHouse <= 12; relativeHouse++) {
    const resolvedHouse = ((baseHouse - 1 + relativeHouse - 1) % 12) + 1;
    derivedHouseTable.push({
      baseHouse,
      relativeHouse,
      resolvedHouse,
      resolvedRuler: rulers[resolvedHouse - 1],
      derivation: `H${relativeHouse} de H${baseHouse} = H${resolvedHouse}`,
    });
  }
}
const mockAnalysis = {
  technicalForm: {
    derivedHouseTable,
    houseDossiers: rulers.map((ruler, index) => ({ house: index + 1, domicileRuler: ruler })),
    interpretationContract: { protocols: [] },
  },
};

const checks = [];
function check(name, ok, detail='') { checks.push([name, Boolean(ok), detail]); }

const neighborMoney = engine.routeNatalQuestion('dinheiro do vizinho', mockAnalysis);
check('derived_neighbor_money_is_house4', neighborMoney.derivedRoutes.some(r => r.actorHouse === 3 && r.relativeHouse === 2 && r.resolvedHouse === 4), JSON.stringify(neighborMoney.derivedRoutes));
check('derived_router_protocol_selected', neighborMoney.protocolIds.includes('derived-house-router'), neighborMoney.protocolIds.join(','));


const spouseMoney = engine.routeNatalQuestion('dinheiro da esposa', mockAnalysis);
check('derived_spouse_money_is_house8', spouseMoney.derivedRoutes.some(r => r.actorHouse === 7 && r.relativeHouse === 2 && r.resolvedHouse === 8), JSON.stringify(spouseMoney.derivedRoutes));

const wifeChild = engine.routeNatalQuestion('filho da esposa', mockAnalysis);
check('derived_child_of_spouse_is_house11', wifeChild.derivedRoutes.some(r => r.actorHouse === 7 && r.relativeHouse === 5 && r.resolvedHouse === 11), JSON.stringify(wifeChild.derivedRoutes));

const brotherCar = engine.routeNatalQuestion('carro do irmão', mockAnalysis);
check('unknown_possession_requests_semantic_expansion', brotherCar.requiresSemanticExpansion === true && brotherCar.unresolvedSemanticChoices.some(x => x.includes('houseOntology')), JSON.stringify(brotherCar));

const financeWithNeighbor = engine.routeNatalQuestion('problema financeiro com vizinho', mockAnalysis);
check('mere_cooccurrence_does_not_invent_ownership', financeWithNeighbor.derivedRoutes.length === 0, JSON.stringify(financeWithNeighbor.derivedRoutes));
check('finance_with_neighbor_keeps_both_radical_fields', financeWithNeighbor.primaryHouses.includes(2) && financeWithNeighbor.primaryHouses.includes(3), JSON.stringify(financeWithNeighbor.primaryHouses));

const philosophy = engine.routeNatalQuestion('Tenho vocação para ensinar filosofia?', mockAnalysis);
check('philosophy_profession_routes_ix_x', philosophy.primaryHouses.includes(9) && philosophy.primaryHouses.includes(10), JSON.stringify(philosophy));
check('philosophy_profession_protocols', philosophy.protocolIds.includes('higher-learning') && philosophy.protocolIds.includes('profession-marcos') && philosophy.protocolIds.includes('profession-frawley'), philosophy.protocolIds.join(','));

const motivation = engine.routeNatalQuestion('Como funciona minha motivação primária?', mockAnalysis);
check('primary_motivation_routes_to_gugu_domain', motivation.matchedDomains.includes('motivacao-primaria') && motivation.selectedPlanets.includes('Saturno'), JSON.stringify(motivation));

const awaiting = engine.routeNatalQuestion('', mockAnalysis);
check('no_question_means_no_whole_chart_preinterpretation', awaiting.status === 'AWAITING_QUESTION' && awaiting.primaryHouses.length === 0, JSON.stringify(awaiting));

const sanitized = sanitizer.sanitizeNatalAiValue({ score: 3, nested: { frawleyScore: 4, evidence: 'x' }, array: [{ rank: 2, value: 7 }] });
check('absolute_ai_sanitizer_removes_audit_scores', !('score' in sanitized) && !('frawleyScore' in sanitized.nested) && !('rank' in sanitized.array[0]) && sanitized.nested.evidence === 'x', JSON.stringify(sanitized));

const llmMessages = engine.buildNatalAbsoluteLlmMessages({
  absolutePrompt: 'SYS',
  natalFacts: { layer: 'NATAL_FACTS' },
  natalAuthorialDossier: { layer: 'NATAL_AUTHORIAL_DOSSIER' },
  natalJudgmentContext: { layer: 'NATAL_JUDGMENT_CONTEXT' },
  release: { releasedForAi: true, productionValidationStatus: 'PASS', errorCodes: [], warningCodes: [] },
});
check('llm_messages_are_vendor_neutral_and_three_layered', llmMessages.system === 'SYS' && llmMessages.user.includes('NATAL_FACTS') && llmMessages.user.includes('NATAL_AUTHORIAL_DOSSIER') && llmMessages.user.includes('NATAL_JUDGMENT_CONTEXT'), llmMessages.user.slice(0, 180));

const prompt = engine.ABSOLUTE_NATAL_PROMPT;
check('absolute_prompt_has_three_layers', ['NATAL_FACTS','NATAL_AUTHORIAL_DOSSIER','NATAL_JUDGMENT_CONTEXT'].every(x => prompt.includes(x)), 'three-layer architecture');
check('absolute_prompt_is_ptbr_v2', prompt.includes('PROTOCOLO ABSOLUTO DE JULGAMENTO NATAL v2.0') && prompt.includes('Responda em português brasileiro'), 'prompt is Portuguese-first');
check('absolute_prompt_forbids_recalculation', prompt.includes('Nunca recalcule longitude') && prompt.includes('Nunca calcule astrologia dentro do modelo de linguagem'), 'calculation gate');
check('absolute_prompt_author_separation', prompt.includes('AUTHORIAL_DIVERGENCE') && prompt.includes('Não harmonize à força'), 'authorial divergence preserved');
check('absolute_prompt_open_world', prompt.includes('ROTEAMENTO CONTEXTUAL DE MUNDO ABERTO') && prompt.includes('situações semânticas são efetivamente ilimitadas'), 'open-world composition');
check('absolute_prompt_disciplined_subjectivity', prompt.includes('SUBJETIVIDADE ASTROLÓGICA DISCIPLINADA') && prompt.includes('agir como astrólogo julgador') && prompt.includes('score oculto'), 'qualitative human-like judgment is bounded rather than erased');
check('absolute_prompt_self_investigation', prompt.includes('LOOP DE AUTO-INVESTIGAÇÃO') && prompt.includes('O que contradiz a primeira impressão?'), 'self-audit loop');
check('absolute_prompt_no_single_symbol', prompt.includes('Nenhum símbolo isolado pode decidir sozinho uma afirmação concreta sobre a vida'), 'anti-keyword guardrail');

const readyPackage = {
  absolutePrompt: prompt,
  natalFacts: { layer: 'NATAL_FACTS' },
  natalAuthorialDossier: { layer: 'NATAL_AUTHORIAL_DOSSIER' },
  natalJudgmentContext: { layer: 'NATAL_JUDGMENT_CONTEXT', questionRoute: { status: 'ROUTED' } },
  release: { releasedForAi: true, productionValidationStatus: 'PASS', errorCodes: [], warningCodes: [] },
};
const providerEnvelope = integration.buildNatalAiIntegrationEnvelope(readyPackage);
check('provider_envelope_ready_after_route_and_validation', providerEnvelope.status === 'READY_FOR_PROVIDER' && providerEnvelope.readyForProvider === true, JSON.stringify(providerEnvelope.status));
check('provider_envelope_ptbr_prompt_versioned', providerEnvelope.invocation.prompt.language === 'pt-BR' && providerEnvelope.invocation.prompt.version === '2.0.0', JSON.stringify(providerEnvelope.invocation.prompt));
check('provider_contract_server_side_secrets', providerEnvelope.providerContract.secrets === 'SERVER_SIDE_ONLY' && providerEnvelope.invocation.executionPolicy.serverSideOnlyForSecrets === true, JSON.stringify(providerEnvelope.providerContract));
check('provider_invocation_contains_absolute_messages', providerEnvelope.invocation.messages.system === prompt && providerEnvelope.invocation.messages.user.includes('NATAL_JUDGMENT_CONTEXT'), providerEnvelope.invocation.messages.user.slice(0, 160));

const awaitingEnvelope = integration.buildNatalAiIntegrationEnvelope({
  ...readyPackage,
  natalJudgmentContext: { layer: 'NATAL_JUDGMENT_CONTEXT', questionRoute: { status: 'AWAITING_QUESTION' } },
});
check('provider_blocks_without_question', awaitingEnvelope.status === 'AWAITING_QUESTION' && awaitingEnvelope.readyForProvider === false, awaitingEnvelope.reason);

const failedEnvelope = integration.buildNatalAiIntegrationEnvelope({
  ...readyPackage,
  release: { releasedForAi: false, productionValidationStatus: 'FAIL', errorCodes: ['X'], warningCodes: [] },
});
check('provider_blocks_failed_engine_validation', failedEnvelope.status === 'BLOCKED_BY_ENGINE_VALIDATION' && failedEnvelope.readyForProvider === false, failedEnvelope.reason);

const docPrompt = fs.readFileSync(path.join(ROOT, 'docs/ABSOLUTE_NATAL_PROMPT_v2_PTBR.txt'), 'utf8').trim();
check('runtime_prompt_matches_exported_ptbr_document', docPrompt === prompt, `doc=${docPrompt.length} runtime=${prompt.length}`);

const failed = checks.filter(([,ok]) => !ok);
for (const [name, ok, detail] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} | ${name} | ${detail}`);
console.log(`ABSOLUTE_NATAL_AI=${failed.length ? 'FAIL' : 'PASS'} | checks=${checks.length} | failures=${failed.length}`);
fs.rmSync(tmp, { recursive: true, force: true });
process.exit(failed.length ? 1 : 0);
