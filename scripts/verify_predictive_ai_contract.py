#!/usr/bin/env python3
from pathlib import Path
import sys
ROOT=Path(__file__).resolve().parents[1]
pdir=ROOT/'src/traditions/western/predictive'
files={
 'types':(pdir/'predictiveTypes.ts').read_text(encoding='utf-8'),
 'ai':(pdir/'predictiveAiContract.ts').read_text(encoding='utf-8'),
 'bot':(pdir/'predictiveBotAdapter.ts').read_text(encoding='utf-8'),
 'engine':(pdir/'predictiveEngine.ts').read_text(encoding='utf-8'),
 'report':(pdir/'predictiveReport.ts').read_text(encoding='utf-8'),
 'route':(ROOT/'src/app/api/predictive/route.ts').read_text(encoding='utf-8'),
 'ui':(ROOT/'src/app/ocidental/preditiva/PredictiveWorkspace.tsx').read_text(encoding='utf-8'),
 'readme':(pdir/'README.md').read_text(encoding='utf-8'),
 'sources':(pdir/'predictiveSources.ts').read_text(encoding='utf-8'),
}
checks=[]
def check(name,ok): checks.append((name,bool(ok)))

t=files['types']; a=files['ai']; b=files['bot']; e=files['engine']; r=files['report']; route=files['route']; ui=files['ui']
check('schema_1_5', 'mathastro.predictive.ai-report/1.5' in e and 'schemaVersion: "1.5.0"' in e and 'schemaVersion: "1.5.0"' in t)
check('judgment_contract_schema', 'mathastro.predictive.ai-judgment-contract/1.0' in t and 'mathastro.predictive.ai-judgment-contract/1.0' in a)
check('absolute_prompt_ptbr', 'MATHASTRO_PREDITIVA_ABSOLUTE_PTBR_V1' in a and 'MOTOR CALCULA; IA JULGA' in a and 'PROMPT ABSOLUTO' in a)
check('prompt_forbids_recalculation', 'NÃO pode recalcular' in a and 'longitudes, casas, cúspides, aspectos' in a)
check('prompt_has_three_indeterminate_states', all(x in a for x in ['SOURCE_GAP','CONTEXTO_INSUFICIENTE','INDETERMINADO']))
check('prompt_author_separation', all(x in a for x in ['REGRA_MARCOS','REGRA_FRAWLEY','REGRA_GUGU','DIVERGÊNCIA_AUTORAL']))
check('subjectivity_boundary_typed', 'subjectivityBoundary' in t and 'aiMayJudge' in t and 'engineExclusive' in t)
check('semantic_task_typed', 'SEMANTIC_TOPIC_ROUTING' in t and 'JT-SEMANTIC-001' in a)
check('radix_promise_task_typed', 'RADIX_PROMISE_JUDGMENT' in t and 'JT-RADIX-001' in a)
check('progression_tasks_typed', all(x in a for x in ['JT-PROG-001','JT-PROG-TIME-001']))
check('return_tasks_typed', all(x in a for x in ['JT-SOLAR-001','JT-LUNAR-001','JT-DLR-001']))
check('gugu_task_typed', 'JT-GUGU-001' in a and 'receptor' in a.lower())
check('transit_task_typed', 'JT-TRANSIT-001' in a and 'gatilho' in a.lower())
check('author_conflict_task_typed', 'AUTHOR_CONFLICT_RESOLUTION' in t and 'JT-AUTHOR-001' in a)
check('event_vs_subjective_task', 'EVENT_VS_SUBJECTIVE_EXPERIENCE' in t and 'JT-EVENT-001' in a)
check('final_synthesis_task', 'FINAL_PREDICTIVE_SYNTHESIS' in t and 'JT-FINAL-001' in a)
check('tasks_whitelist_evidence_paths', 'allowedEvidencePaths' in t and 'allowedEvidencePaths' in a)
check('tasks_have_forbidden_actions', 'forbiddenActions' in t and 'BASE_FORBIDDEN' in a)
check('final_output_requires_evidence_trace', 'evidenceTrace' in a and 'finalOutputSchema' in t)
check('consultation_is_optional_engine_input', 'consultation?: PredictiveConsultationContext' in t and 'question?: string' in t and 'context?: string' in t)
check('semantic_task_needs_context_when_question_absent', 'NEEDS_USER_CONTEXT' in a and 'hasQuestion ? "READY" : "NEEDS_USER_CONTEXT"' in a)
check('engine_embeds_prompt_and_contract', 'aiPrompt: PREDICTIVE_ABSOLUTE_PROMPT_PTBR' in e and 'aiJudgmentContract,' in e)
check('report_embeds_contract', '## CONTRATO DE JULGAMENTO SUBJETIVO DA IA' in r and '## PROMPT ABSOLUTO PARA A IA — PT-BR' in r)
check('bot_adapter_provider_neutral', 'mathastro.predictive.bot-payload/1.0' in b and 'systemPrompt' in b and 'mechanicalDossier' in b and 'judgmentContract' in b)
check('bot_adapter_forbids_recalculation', 'forbidAstrologicalRecalculation: true' in b)
check('bot_adapter_fail_closed_on_validation', 'interpretationAllowed: result.validation.status === "PASS"' in b and 'requireValidationPass: true' in b)
check('api_ai_package_format', 'format === "ai-package"' in route and 'buildPredictiveBotPayload' in route)
check('report_json_exposes_ai_contract', 'aiJudgmentContract: result.aiJudgmentContract' in route and 'aiPrompt: result.aiPrompt' in route)
check('ui_collects_question_context', all(x in ui for x in ['question: string','context: string','Pergunta / situação','Contexto factual','consultation:']))
check('ui_exposes_prompt_contract', 'Contrato + prompt da IA' in ui and 'json.aiPrompt?.text' in ui)

import re
registry_ids=set(re.findall(r'id:\s*"([A-Z0-9_]+)"', files['sources']))
ai_source_ids=set()
for block in re.findall(r'sourceIds:\s*\[([^\]]*)\]', a, re.S):
    ai_source_ids.update(re.findall(r'"([A-Z0-9_]+)"', block))
check('all_judgment_source_ids_exist_in_registry', not (ai_source_ids-registry_ids))

check('human_prompt_doc_exists', (ROOT/'docs/PROMPT_ABSOLUTO_IA_PREDITIVA_PTBR_v1.0.md').exists())
check('architecture_doc_exists', (ROOT/'docs/ARQUITETURA_IA_PREDITIVA_RC5.md').exists())
check('source_gap_not_ai_mechanical_fallback', 'fonte faltando' not in a.lower() or 'não' in a.lower())

fails=[n for n,ok in checks if not ok]
print('PREDICTIVE AI JUDGMENT CONTRACT VERIFICATION')
for n,ok in checks: print(('PASS' if ok else 'FAIL'), n)
print(f'SUMMARY pass={len(checks)-len(fails)} fail={len(fails)}')
sys.exit(1 if fails else 0)
