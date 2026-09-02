# MathAstro — HORARY_ONLY v1.0

## Autoridade e fronteira

O módulo ativo é `MathAstro → Western → Horary`. Sua linha principal é **Marcos Monteiro + John Frawley**. Luiz Gonzaga de Carvalho Neto entra apenas como suplemento quando houver regra horária diretamente documentável. A infraestrutura astronômica é compartilhada; interpretação natal, sinastria e eletiva não entram no juízo horário.

O projeto usa Regiomontanus para a horária. A pergunta precisa ser concreta e suficientemente contextualizada; o motor resolve primeiro o **esqueleto da pergunta**, depois os significadores e só então os testemunhos.

## Pipeline

`pergunta concreta → auditoria/contexto → nascimento da pergunta → casas → significadores → dignidades separadas → recepções → perfeição/impedimentos → Lua → auxiliares → timing condicional → dossiê para IA`

### Regras de desenho

- Regente acidental da casa prevalece sobre significador natural.
- Sete planetas tradicionais regem casas. Exteriores nunca regem casas.
- Dignidade essencial não é somada à acidental em um score de “força”.
- Recepção descreve disposição, interesse, valoração ou aversão; não substitui perfeição quando o evento exige contato.
- Antíscio e contra-antíscio são materializados como contatos auxiliares e não fabricam recepção.
- Considerações antes do julgamento são avisos/contexto, não um bloqueador mecânico de “radicalidade”.
- Partes e estrelas fixas são auxiliares e entram apenas quando pertinentes.
- Timing só é calculado depois de haver testemunho suficiente de ocorrência.
- A IA recebe o dossiê causal, não apenas `YES/NO`.

## Casos tópicos explicitamente cobertos

Relacionamentos, casamento, separação, amantes; emprego, manutenção/qualidade do emprego, chefe/colega/subordinado e decisão de carreira; dinheiro, salário, dívida, empréstimo, investimento, imposto, herança, apostas; compra/venda, imóveis; objetos perdidos, animais desaparecidos e furto; processos, adversários, competições e “devo fazer X?”; viagens, cursos, estudo, exames e conhecimento; doença, médico, tratamento, cirurgia, gravidez e morte; prisão/libertação; autossabotamento/inimigo oculto e a classe histórica de alegação de ataque psíquico; desejo; sonho/predição verdadeira e interpretação de sonho; rumor/notícia; clima; acontecimentos públicos; adoção; rota customizada com casa explícita.

### Distinções que não podem ser achatadas

- **Trabalho = X; doença = VI** no ambiente horário.
- Médico que trata a doença concreta = VII; médico enquanto profissional/instruído = IX; tratamento = X; cirurgia tem Marte como significador natural auxiliar.
- Colega = VII; chefe/autoridade = X; subordinado = VI.
- Herança específica: bens da pessoa-fonte = 2ª casa derivada daquela pessoa; não usar VIII automaticamente.
- Desejo = XI como esperança, mas o objeto desejado continua com sua própria casa.
- Sonho dormido = IX; personagens do sonho mantêm as casas de suas relações ordinárias.
- Prisão: XII, com necessidade de distinguir pessoa ainda livre, já presa e pergunta de soltura; para terceiros, considerar a XII derivada quando aplicável.
- Alegação de feitiço/ataque psíquico: apenas gramática astrológica histórica; o software não confirma causalidade sobrenatural nem acusa pessoas.

## Limites documentais

A regra específica atual de Marcos para **anestesista** não é inventada: quando necessária, a identificação permanece manual até fonte primária acessível. Diagnóstico médico completo no nível remetido por Frawley a Saunders também não é fabricado pelo núcleo horário.

## Legado

`src/app/lib/horaryCalculations.ts`, `src/app/lib/horaryReport.ts` e `src/interfaces/HoraryInterfaces.ts` são legado não canônico. O novo módulo não os importa. O verificador `verify:horary` falha se o núcleo novo importar Natal, Sinastria, Eletiva ou esse legado.

---

## ADDENDUM 2026-08-31 — contrato restaurado

O motor não deve interpretar a presença nominal de um tópico no roteador como “cobertura concluída”. Um tópico só pode ser considerado fechado quando possuir: (1) casas corretas; (2) papéis significadores corretos; (3) sequência de contatos; (4) recepções pertinentes; (5) impedimentos/mediações pertinentes; (6) regra própria quando a classe de pergunta não se reduz a perfeição L1×Lquesitado; (7) fixture/regressão correspondente. O chat anterior é especificação obrigatória para esses pontos.

Particularmente, `job_keep`, `work_relationship`, `tax`, `inheritance`, `prison/release`, `self_undoing`, `dream_meaning` e saúde não podem cair silenciosamente no juiz binário genérico.
