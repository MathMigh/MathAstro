# HARDENING DE PRODUÇÃO — MOTOR NATAL → FORMULÁRIO → IA

Data: 28/08/2026

## Mudança de critério

A antiga marcação `48/48 GREEN` media **cobertura estrutural**: existência dos contratos e rotas de evidência. Ela não é mais usada como sinônimo de correção de produção.

A partir desta revisão há três camadas independentes:

1. **cobertura estrutural** — 48 contratos das seções 6–53 existem e têm evidência/gates;
2. **validação runtime** — `natalProductionValidation.status` precisa ser `PASS` no mapa efetivamente gerado;
3. **regressões independentes** — mapas reais e defeitos históricos são confrontados com PySwissEph e invariantes de código.

Somente a combinação dessas camadas permite `releasedForAi=true`.

## Correções de cálculo e semântica

### 1. Casas efetivas em cúspides

Planetas até aproximadamente 5° antes da cúspide seguinte e no mesmo signo mantêm a posição geométrica para auditoria, mas recebem `effectiveHouseMarcos` e `effectiveHouseFrawley`. A casa efetiva é propagada para condição acidental e dossiês temáticos.

Regressão crítica: no mapa de Manaus de 18/06/1999, Saturno está geometricamente na V, a ~1°51′ da cúspide VI, no mesmo signo. O teste independente exige `H5 geométrica → H6 efetiva`.

### 2. Orbe de influência planetária de Marcos

ATUALIZAÇÃO 2026-09-01: o corpus posterior refinou esta regra. O motor usa **até 3° como núcleo forte** e **>3° até 5° como faixa contextual**, sem confundir esse gate com a regra de cúspide de ~5°. O antigo teto binário de 4° fica superseded por esta evidência posterior.

Todos os pacotes planetários, relações, mentalidade e aspectos dos regentes carregam `marcosNatalEligible`. Um aspecto mais amplo pode permanecer como geometria/Frawley-context, mas não pode ser promovido à camada Marcos.

### 3. Relacionamentos

`directAspect` I–VII passou a significar apenas aspecto elegível na camada Marcos. Se há aspecto tradicional mais amplo, ele fica separado em `broaderTraditionalAspect` com proveniência `Frawley-context`.

### 4. Ingressos de signo

A busca de ingresso passou a refinar a **mudança discreta de signo**, inclusive em movimento retrógrado. A regressão de Manaus exige que o ingresso anterior de Marte seja `Escorpião → Libra`, nunca `Libra → Libra`.

### 5. Formatação sexagesimal

A conversão usa total de segundos/minutos antes da decomposição. Saídas como `1°12′60″` são bloqueadas; o resultado correto é `1°13′00″`.

### 6. Temperamento

O ledger aritmético histórico permanece apenas em auditoria. A saída canônica entrega os cinco testemunhos qualitativos e marca a conclusão como julgamento qualitativo, sem votação automática nem multiplicadores inventados.

### 7. Manner

Múltiplos candidatos no mesmo estágio não recebem vencedor por score. O relatório usa estado explícito de seleção qualitativa pendente.

### 8. Gugu

Angularidade passou a significar ASC/IC/DSC/MC e casas angulares, não proximidade a uma cúspide qualquer. `properPlaces` foi recuperado e implementado; a regra Lua–Nodos teve sua semântica recuperada, restando apenas o orbe autoral não publicado, com geometria integral preservada.

## Estrelas fixas

O céu completo continua materializado a partir de `sefstars.txt`; o catálogo astronômico e o tribunal interpretativo são camadas diferentes.

- estrelas comuns: até 1° no filtro Marcos;
- estrelas principais/source-locked: até 3° como teto, preservando a formulação de 2–3° no máximo;
- lista principal Marcos source-locked: Regulus, Aldebaran, Antares, Fomalhaut, Sirius, Procyon, Castor, Pollux, Spica, Algol;
- objetos deep-sky não são automaticamente promovidos;
- exceções explicitamente usadas em fonte publicada de Frawley, como Praesepe, Facies e a nebulosa/galáxia de Andrômeda, podem permanecer interpretativas com proveniência explícita;
- aliases tradicionais canônicos duplicados são erro de produção;
- contato interpretativo sem `interpretiveSources` é erro de produção.

A aba `Contatos` mostra por padrão apenas contatos interpretativos; coincidências astronômicas ficam atrás de um controle de auditoria.

## Extração em formulário

A API passa a fornecer quatro produtos distintos:

- `reportBundle.aiTechnicalReport` — relatório textual limpo para IA;
- `reportBundle.auditTechnicalReport` — relatório textual integral de auditoria;
- `reportBundle.aiStructuredForm` — JSON saneado, sem scores/rankings/ledgers numéricos de compatibilidade;
- `reportBundle.auditStructuredForm` — `technicalForm` integral para auditoria humana.

`reportBundle.releasedForAi` só é verdadeiro se a validação de produção passa. Na interface, downloads destinados à IA ficam bloqueados quando o status é `FAIL`.

## Validações fail-closed

O runtime falha se detectar, entre outros:

- casa efetiva de cúspide não propagada;
- ocupante em dossiê incompatível com sua casa efetiva;
- ingresso X→X;
- aspecto planetário marcado Marcos acima de 5° como testemunho genérico;
- gate Marcos inconsistente em pacote planetário/regente de casa;
- relação I–VII ampla vazando para Marcos;
- estrela interpretativa sem proveniência;
- estrela secundária >1°;
- principal/source-locked >3°;
- deep-sky não source-locked promovido;
- nome tradicional canônico duplicado;
- falsa angularidade Gugu;
- desempate automático de Manner;
- fuso IANA ausente;
- `60″` no relatório;
- scores/ledgers no relatório limpo;
- scores/rankings sobrevivendo no JSON limpo;
- horário civil fora de HH:MM:SS.

## Regressões independentes

`python scripts/verify_natal_production_regressions.py`

O teste usa PySwissEph como oráculo independente e cobre:

- Saturno Manaus 1999: H5 geométrica → H6 efetiva;
- Marte Manaus 1999: ingresso anterior Escorpião→Libra e seguinte Libra→Escorpião;
- longitudes dos sete planetas em Barra Mansa 2001;
- ASC e MC Regiomontanus em Barra Mansa;
- carry sexagesimal;
- tiers Marcos: núcleo <=3°; contextual >3°–5° para influência planetária;
- distinção da regra de cúspide de 5°;
- gates de relações/aspectos;
- separação JSON IA × auditoria;
- release fail-closed;
- regras de estrelas fixas.

## Limitação do ambiente

O build integral do Next.js só pode ser certificado com as dependências reais instaladas. Se o checkpoint vier sem `node_modules/.bin/next`, `npm run build` falha por ausência do executável e isso não deve ser reportado como PASS. O audit TypeScript focal e os verificadores independentes continuam obrigatórios, mas não substituem um build completo em ambiente instalado.
