from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
prompt=(root/'src/traditions/western/mundane/mundaneAiPrompt.ts').read_text(encoding='utf-8')
contract=(root/'src/traditions/western/mundane/mundaneAiContract.ts').read_text(encoding='utf-8')
types=(root/'src/traditions/western/mundane/mundaneTypes.ts').read_text(encoding='utf-8')
engine=(root/'src/traditions/western/mundane/mundaneEngine.ts').read_text(encoding='utf-8')
ui=(root/'src/app/ocidental/mundana/MundaneWorkspace.tsx').read_text(encoding='utf-8')
parts=(root/'src/traditions/western/mundane/mundaneParts.ts').read_text(encoding='utf-8')
stars=(root/'src/traditions/western/mundane/mundaneFixedStars.ts').read_text(encoding='utf-8')
method_path=root/'docs/mundana/MathAstro_METODO_ABSOLUTO_INTEGRAL_MUNDANA_v3_CONSULTA_PRO.md'
prompt_path=root/'docs/mundana/MathAstro_PROMPT_ABSOLUTO_MUNDANA_PTBR_v3_CONSULTA_PRO.txt'
method=method_path.read_text(encoding='utf-8') if method_path.exists() else ''
prompt_doc=prompt_path.read_text(encoding='utf-8') if prompt_path.exists() else ''
checks=[]
def ck(name,ok):
    checks.append((name,bool(ok))); print(('PASS' if ok else 'FAIL'),name)

ck('prompt doc exists',prompt_path.exists() and len(prompt_doc)>30000)
ck('method doc exists',method_path.exists() and len(method)>60000)
ck('handoff schema 3.0','mathastro.mundane.ai-handoff/3.0' in prompt)
ck('contract schema 2.0','mathastro.mundane.ai-contract/2.0' in contract and 'mathastro.mundane.ai-contract/2.0' in types)
ck('prompt version consulta pro','3.0-consulta-pro' in prompt and '3.0-consulta-pro' in contract)
ck('consultation mode typed','MundaneConsultationMode = "focused" | "integral"' in types)
ck('consultation question typed','consultationQuestion?: string' in types)
ck('engine schema 0.5','mathastro.mundane/0.5' in types and 'mathastro.mundane/0.5' in engine)
ck('engine passes question to AI','consultationQuestion:input.consultationQuestion' in engine)
ck('engine passes consultation mode','consultationMode:input.consultationMode' in engine)
for label,needle in [
 ('interpretive grammar','GRAMÁTICA INTERPRETATIVA UNIVERSAL'),
 ('process routing','ROTEAMENTO DE MUNDO ABERTO'),
 ('body scale','IDENTIFICAR O CORPO E A ESCALA'),
 ('wheel hierarchy','HIERARQUIA DE RODAS'),
 ('grand conjunction','GRANDES CONJUNÇÕES JÚPITER–SATURNO'),
 ('aries ingress','INGRESSO DE ÁRIES'),
 ('eclipses','ECLIPSES — COMO INTERPRETAR'),
 ('lunations','LUNAÇÕES E QUARTOS'),
 ('historical radices','RADICES HISTÓRICOS/POLÍTICOS'),
 ('ingress lord','SENHOR DO INGRESSO'),
 ('eclipse lord','SENHOR DO ECLIPSE'),
 ('cross-chart','RELAÇÕES ENTRE RODAS'),
 ('fixed stars','ESTRELAS FIXAS — COMO INTERPRETAR'),
 ('arabic parts','PARTES ÁRABES — COMO INTERPRETAR'),
 ('timing','PROGRESSÕES, DIREÇÕES, RETORNOS E GATILHOS'),
 ('comets','COMETAS — COMO INTERPRETAR'),
 ('war','GUERRA — COMO JULGAR'),
 ('government','GOVERNO, PODER E CRISE INSTITUCIONAL'),
 ('economy','ECONOMIA — COMO JULGAR'),
 ('disaster','DESASTRES, EPIDEMIAS E SAÚDE PÚBLICA'),
 ('weather','ASTROMETEOROLOGIA — COMO JULGAR'),
 ('agriculture','AGRICULTURA/HORTICULTURA — COMO JULGAR'),
 ('open world','QUALQUER CIRCUNSTÂNCIA MUNDANA NÃO LISTADA'),
 ('integral consultation','MODO CONSULTA MUNDANA INTEGRAL'),
 ('anti error','PROTOCOLO DE CALIBRAÇÃO E ANTI-ERRO'),
 ('knowledge states','ESTADOS E FRONTEIRAS DO CONHECIMENTO'),
 ('rag','RECUPERAÇÃO DOUTRINÁRIA / RAG'),
 ('final output','BLOCOS OBRIGATÓRIOS DA RESPOSTA'),
 ('consultation style','ESTILO DE CONSULTA'),
]: ck('prompt teaches '+label,needle in prompt_doc and needle in prompt)
for state in ['CALCULATED','CALCULATED_BASELINE','SOURCE_LOCKED','DATA_REQUIRED','AUTHOR_DIVERGENCE','ASTROLOGER_JUDGMENT_REQUIRED','MISSING_ENGINE_DATA','ENGINEERING_GATE']:
    ck('contract state '+state,state in contract and state in prompt)
ck('prompt anti recalculation','Nunca recalcule longitude' in prompt_doc)
ck('prompt forbids trigger autonomy','gatilho isolado como promessa' in prompt or 'gatilho isolado como promessa' in contract)
ck('prompt separates Marcos Frawley','julgue primeiro a cadeia Marcos' in prompt_doc and 'cadeia Frawley' in prompt_doc)
ck('prompt does not invent Gugu mundane method','Não fabrique um “método mundano do Gugu”' in prompt_doc)
ck('UI collects question','Pergunta mundana' in ui and 'consultationQuestion' in ui)
ck('UI selects integral mode','Integral/Consulta Pro' in ui and 'consultationMode' in ui)
ck('UI exposes advanced JSON','JSON avançado opcional' in ui)
ck('UI downloads prompt','Baixar Prompt IA' in ui)
ck('rich report has evidence sections',all(x in engine for x in ['## Relações tipadas entre rodas','## Contatos entre rodas','## Estrelas fixas','## Progressões/direções baseline','## Contrato da IA / cobertura']))
ck('Frawley Faith corrected to Venus','lot(asc,venus,moon)' in parts and 'ASC + Vênus − Lua' in parts)
ck('Frawley Death II corrected','lot(c8,saturn,moon)' in parts and 'Cúspide VIII + Saturno − Lua' in parts)
ck('Marcos star-Part blocked','t.kind!=="part"' in stars)
ck('fixed-star physical occultation not claimed','physicalOccultationClaimed:false' in stars)
ck('method has consultation pro layer','PARTE XXIII — CAMADA INTERPRETATIVA CONSULTA PRO' in method)
ck('method has universal case matrix','APÊNDICE E — MATRIZ DE COBERTURA CONSULTA PRO' in method)
failed=[n for n,o in checks if not o]
print(f'SUMMARY pass={len(checks)-len(failed)} fail={len(failed)}')
raise SystemExit(1 if failed else 0)
