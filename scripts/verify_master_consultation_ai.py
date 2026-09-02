from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
prompt = (ROOT / 'src/traditions/western/consultation/consultationMasterPrompt.ts').read_text()
adapter = (ROOT / 'src/traditions/western/consultation/consultationMasterAdapter.ts').read_text()
route = (ROOT / 'src/app/api/consultation/route.ts').read_text()
contract = (ROOT / 'src/traditions/western/natal/natalMethodContract.ts').read_text()
doc = (ROOT / 'docs/PROMPT_MESTRE_CONSULTA_ASTROLOGICA_PTBR_v2.0.md').read_text()

checks=[]
def check(name, cond):
    checks.append((name, bool(cond)))

check('master_prompt_ptbr', 'PROMPT MESTRE DE FORMAÇÃO E JULGAMENTO' in prompt and 'MOTOR CALCULA; IA JULGA' in prompt)
check('teaches_planet_house_relation_packets', all(x in prompt for x in ['PACOTE PLANETÁRIO', 'PACOTE DE CASA', 'PACOTE DE RELAÇÃO']))
check('teaches_temperament_three_tracks', 'TEMPERAMENTO — TRÊS TRILHOS' in prompt and 'MARCOS:' in prompt and 'FRAWLEY:' in prompt and 'GUGU:' in prompt)
check('teaches_manner', 'MANNER — FRAWLEY' in prompt)
check('teaches_mentality', 'MENTALIDADE — NÃO CONFUNDA COM QI' in prompt and 'Lua↔Mercúrio' in prompt)
check('teaches_primary_motivation', 'MOTIVAÇÃO PRIMÁRIA — GUGU' in prompt)
for planet, faculty in [
    ('Lua','sentido comum'), ('Mercúrio','estimativa'), ('Vênus','apetite concupiscível'),
    ('Sol','vontade'), ('Marte','apetite irascível'), ('Júpiter','intelecto paciente'), ('Saturno','intelecto agente')]:
    check(f'powers_of_soul_{planet.lower()}', planet in prompt and faculty in prompt)
check('teaches_profession_capacity_distinction', 'CAPACIDADE, INCLINAÇÃO, OPORTUNIDADE PÚBLICA e OCUPAÇÃO REAL' in prompt)
check('teaches_money_domains', 'DINHEIRO E RECURSOS' in prompt)
check('teaches_relationship_reception_vs_aspect', 'Recepção fala de inclinação/interesse; aspecto fala de oportunidade/contato' in prompt)
check('teaches_family_derived_houses', 'SOMENTE a rota derivada fornecida pelo motor' in prompt)
check('teaches_faith_dreams_travel', 'CONHECIMENTO, FÉ, SONHOS E VIAGENS' in prompt)
check('teaches_health_limits', 'não é diagnóstico médico' in prompt)
check('teaches_open_world', 'OPEN-WORLD' in prompt and 'atores → assunto → posse/relação' in prompt)
check('requires_contradiction_search', 'AUTOCORREÇÃO OBRIGATÓRIA' in prompt and 'considerei contraditórios?' in prompt)
check('teaches_radical_before_prediction', 'LEI DA PROMESSA RADICAL' in prompt and 'Nenhuma técnica temporal cria' in prompt)
check('teaches_predictive_hierarchy', 'RADIX → PROGRESSÕES → REVOLUÇÃO SOLAR → REVOLUÇÃO LUNAR → LUNAR DERIVADA' in prompt)
check('teaches_gugu_periods', 'PERÍODOS GUGU' in prompt and 'receptor pesa mais' in prompt)
check('teaches_transits_as_trigger', 'Trânsito é gatilho/contexto, não promessa autônoma' in prompt)
check('forbids_infallibility_claim', 'Não existe licença para prometer infalibilidade' in prompt)
check('adapter_exposes_all_domain_contracts', 'natalDomainContracts: NATAL_DOMAIN_CONTRACTS' in adapter)
check('adapter_exposes_powers_of_soul', 'powersOfSoul' in adapter and 'intelecto agente' in adapter)
check('adapter_requires_natal_before_prediction', 'requireNatalBeforePrediction: true' in adapter)
check('adapter_fail_closed', 'interpretationAllowed' in adapter and 'natalReleasedForAi' in adapter)
check('consultation_api_exists', 'buildMasterConsultationPayload' in route and 'calculatePredictiveEngine' in route)
check('consultation_api_allows_natal_only', 'if (body?.targetDate)' in route)
check('human_master_prompt_doc', len(doc) > 15000 and 'POTÊNCIAS/FACULDADES DA ALMA' in doc)
check('full_natal_v2_handbook_present', (ROOT / 'docs/METODO_ABSOLUTO_INTEGRAL_NATAL_v2.0.md').exists())
protocol_count = len(re.findall(r'id:\s*"[^"]+"[^\n]*section:\s*\d+', contract))
check('all_48_natal_protocols_present', protocol_count == 48)

passed=sum(ok for _,ok in checks)
for name,ok in checks:
    print(('PASS' if ok else 'FAIL'), name)
print(f'SUMMARY pass={passed} fail={len(checks)-passed}')
raise SystemExit(0 if passed==len(checks) else 1)
