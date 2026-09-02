from __future__ import annotations
from pathlib import Path
import re, hashlib, json

ROOT=Path(__file__).resolve().parents[1]
CONTRACT=ROOT/'src/traditions/western/natal/natalMethodContract.ts'
ANALYSIS=ROOT/'src/app/lib/natalAnalysis.ts'
REPORT=ROOT/'src/app/lib/natalTechnicalReport.ts'
ENGINE=ROOT/'src/app/lib/astrologyEngine.ts'
ROUTE=ROOT/'src/app/api/birth-chart/route.ts'
TEMPER=ROOT/'src/app/lib/traditionalTemperament.ts'
VALID=ROOT/'scripts/reference_validation.py'
OUT=ROOT/'docs/MATRIZ_COBERTURA_ESTRUTURAL_NATAL_IA.md'
LEGACY_OUT=ROOT/'docs/MATRIZ_VERDE_NATAL_IA.md'
JSON_OUT=ROOT/'fixtures/natal-protocol-structural-coverage.json'

contract=CONTRACT.read_text(encoding='utf-8')
analysis=ANALYSIS.read_text(encoding='utf-8')
report=REPORT.read_text(encoding='utf-8')
engine=ENGINE.read_text(encoding='utf-8')
route=ROUTE.read_text(encoding='utf-8')
temper=TEMPER.read_text(encoding='utf-8')
valid=VALID.read_text(encoding='utf-8')

pattern=re.compile(r'id:\s*"([^"]+)"\s*,\s*section:\s*(\d+)\s*,\s*title:\s*"([^"]+)"\s*,\s*phase:\s*"(radical|timing)"')
protocols=[{'id':m.group(1),'section':int(m.group(2)),'title':m.group(3),'phase':m.group(4)} for m in pattern.finditer(contract)]
expected=list(range(6,54))
sections=[p['section'] for p in protocols]

checks=[]
def check(name, condition, evidence):
    checks.append({'name':name,'ok':bool(condition),'evidence':evidence})

check('48 contratos 6–53', len(protocols)==48 and sorted(sections)==expected and len(set(sections))==48, f'count={len(protocols)} missing={sorted(set(expected)-set(sections))}')
check('Pacote planetário universal', 'function buildPlanetTechnicalPackets' in analysis and 'ruledHouses' in analysis and 'receptionsAsGuest' in analysis and 'antiscionContacts' in analysis, 'planet packets + regências + aspectos/recepções/estrelas/nodos/antíscios')
check('Pacote das 12 casas', 'canonicalTopics' in analysis and 'medicalBodyParts' in analysis and 'cuspPlanetContacts' in analysis, 'house dossiers completos')
check('Casas derivadas 12×12', 'function buildDerivedHouseTable' in analysis and 'derivedHouseTable' in analysis, 'aritmética derivada materializada pelo motor')
check('Contrato de não-recálculo da IA', 'forbiddenCalculations' in contract and 'derivedHouseArithmetic' in contract and 'MISSING_ENGINE_DATA' in contract, 'IA interpreta; motor calcula')
check('Relatório materializa os contratos', 'appendOperationalProtocolDossiers' in report and '[CONTRACT-COVERED]' in report and 'contract.protocols.forEach' in report, 'todos os contratos são emitidos; isto mede cobertura estrutural, não certificação de produção')
check('API devolve relatório + análise + precisão', 'traditionalReport' in route and 'natalAnalysis' in route and 'natalPrecision' in route, 'birth-chart POST')
check('Fuso IANA fail-closed', 'Fuso IANA obrigatório' in engine and 'internal-brazil-resolver' not in engine and 'America/Manaus' not in engine and 'America/Rio_Branco' not in engine, 'sem inferência geográfica silenciosa')
# Active arithmetic must not contain the old magic multipliers. Mentions in comments/prohibitions are allowed.
active_temper='\n'.join(line for line in temper.splitlines() if not line.lstrip().startswith('//'))
active_valid='\n'.join(line for line in valid.splitlines() if not line.lstrip().startswith('#'))
check('Sem pesos 1,25/0,75 na lógica ativa', not re.search(r'(?<![\w])1\.25(?![\w])|(?<![\w])0\.75(?![\w])', active_temper) and '1.25 if' not in active_valid and '.75)' not in active_valid, 'modulação do temperamento qualitativa')
check('Senhor da Natividade com desempate acidental source-locked', 'essential-tie-accidental-angularity' in temper and 'angularFinalists.length === 1' in temper and 'aspectos, estrelas e demais condições permanecem evidência qualitativa' in temper, 'hierarquia essencial primeiro; apenas angularidade exclusiva resolve empate automaticamente; sem score de aspectos')
check('Profissão Frawley source-locked', 'disabledUnverifiedCriteria' in analysis and 'nearMidheaven' not in report and 'mercuryVenusMarsStrengthOrder' not in report, 'X + regente X + planetas X + Mercúrio/Vênus/Marte')
check('Partes Marcos preservadas até 5°', 'if (orbDistance > 5) return;' in analysis and 'conjunction-or-opposition' in analysis, 'contato da Parte não truncado pelo orb genérico de 3°')
check('Validação de referência atualizada', 'Sem multiplicadores universais inventados' in valid and 'essential_vector' in valid, 'fixture coerente com técnica atual')

source_gate_ids={'mentality-gugu','frawley-timing'}
# Extrai o gate de contexto do próprio bloco de contrato, em vez de manter lista manual.
for index,p in enumerate(protocols):
    start=pattern.search(contract, 0 if index==0 else 0)
# blocos delimitados pelas posições reais dos matches
matches=list(pattern.finditer(contract))
rows=[]
for index,p in enumerate(protocols):
    chunk_start=matches[index].start()
    chunk_end=matches[index+1].start() if index+1 < len(matches) else contract.index('];', chunk_start)
    chunk=contract[chunk_start:chunk_end]
    has_context_gate=not bool(re.search(r'contextRequirements:\s*\[\s*\]', chunk))
    if p['id'] in source_gate_ids:
        execution='SOURCE_GATE' if p['phase']=='radical' else 'TIMING+SOURCE_GATE'
    elif p['phase']=='timing': execution='TIMING_CONTEXT_REQUIRED'
    elif has_context_gate: execution='READY_WITH_CONTEXT_GATE'
    else: execution='READY_FOR_AI'
    rows.append({**p,'coverage':'COVERED','execution':execution})

all_ok=all(c['ok'] for c in checks)
for r in rows:
    r['structuralCovered']=all_ok

JSON_OUT.write_text(json.dumps({'allStructuralCovered':all_ok,'certifiesProduction':False,'checks':checks,'protocols':rows},ensure_ascii=False,indent=2),encoding='utf-8')

L=[]
L += ['# MATRIZ DE COBERTURA ESTRUTURAL — NATAL → RELATÓRIO → IA','',
      '**Escopo:** esta matriz mede somente cobertura estrutural dos contratos. **NÃO certifica execução de produção.** A liberação para IA depende separadamente de `natalProductionValidation.status=PASS` e das regressões reais.','',
      f'**Resultado estrutural:** {"COBERTO" if all_ok else "FALHA"} — {sum(c["ok"] for c in checks)}/{len(checks)} invariantes estruturais; {len(rows)}/48 protocolos contratados.','',
      '## Auditoria estrutural','', '| Item | Estado | Evidência |','|---|---|---|']
for c in checks:
    L.append(f'| {c["name"]} | {"🟢" if c["ok"] else "🔴"} | {c["evidence"]} |')
L += ['', '## 48 protocolos','', '| § | Protocolo | Cobertura | Execução segura |','|---:|---|---|---|']
for r in rows:
    L.append(f'| {r["section"]} | {r["title"]} | COVERED | `{r["execution"]}` |')
L += ['', '## Legenda de execução','',
      '- `READY_FOR_AI`: relatório radical já fornece os dados técnicos para julgamento.','- `READY_WITH_CONTEXT_GATE`: o motor pré-calcula as alternativas técnicas, mas a IA precisa do contexto concreto para escolher o ator/subtema; ela não faz aritmética astrológica.','- `SOURCE_GATE`: o relatório entrega o que está source-locked e marca explicitamente a parte cuja regra exata não pode ser inventada.','- `TIMING_CONTEXT_REQUIRED`: o natal radical está pronto, mas executar previsão exige data/janela e módulo temporal calculado.','- `TIMING+SOURCE_GATE`: além da data, a técnica detalhada permanece limitada ao algoritmo efetivamente source-locked.','',
      '## Regra final','',
      'A matriz não transforma lacuna documental ou ausência de data em cálculo fictício. Ela responde apenas: **o contrato existe e a evidência exigida tem uma rota de materialização/gate?** O selo de produção pertence exclusivamente ao validador runtime e às regressões.']
OUT.write_text('\n'.join(L)+'\n',encoding='utf-8')
LEGACY_OUT.write_text('# ARQUIVO LEGADO — NÃO É CERTIFICAÇÃO DE PRODUÇÃO\n\nConsulte `MATRIZ_COBERTURA_ESTRUTURAL_NATAL_IA.md` e o validador de produção.\n', encoding='utf-8')
print(OUT)
print(JSON_OUT)
print('STRUCTURAL_ALL_COVERED=',all_ok)
if not all_ok:
    for c in checks:
        if not c['ok']: print('FAIL:',c['name'],c['evidence'])
    raise SystemExit(1)
