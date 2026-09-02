# MATRIZ DE COBERTURA ESTRUTURAL — NATAL → RELATÓRIO → IA

**Escopo:** esta matriz mede somente cobertura estrutural dos contratos. **NÃO certifica execução de produção.** A liberação para IA depende separadamente de `natalProductionValidation.status=PASS` e das regressões reais.

**Resultado estrutural:** COBERTO — 13/13 invariantes estruturais; 48/48 protocolos contratados.

## Auditoria estrutural

| Item | Estado | Evidência |
|---|---|---|
| 48 contratos 6–53 | 🟢 | count=48 missing=[] |
| Pacote planetário universal | 🟢 | planet packets + regências + aspectos/recepções/estrelas/nodos/antíscios |
| Pacote das 12 casas | 🟢 | house dossiers completos |
| Casas derivadas 12×12 | 🟢 | aritmética derivada materializada pelo motor |
| Contrato de não-recálculo da IA | 🟢 | IA interpreta; motor calcula |
| Relatório materializa os contratos | 🟢 | todos os contratos são emitidos; isto mede cobertura estrutural, não certificação de produção |
| API devolve relatório + análise + precisão | 🟢 | birth-chart POST |
| Fuso IANA fail-closed | 🟢 | sem inferência geográfica silenciosa |
| Sem pesos 1,25/0,75 na lógica ativa | 🟢 | modulação do temperamento qualitativa |
| Senhor da Natividade com desempate acidental source-locked | 🟢 | hierarquia essencial primeiro; apenas angularidade exclusiva resolve empate automaticamente; sem score de aspectos |
| Profissão Frawley source-locked | 🟢 | X + regente X + planetas X + Mercúrio/Vênus/Marte |
| Partes Marcos preservadas até 5° | 🟢 | contato da Parte não truncado pelo orb genérico de 3° |
| Validação de referência atualizada | 🟢 | fixture coerente com técnica atual |

## 48 protocolos

| § | Protocolo | Cobertura | Execução segura |
|---:|---|---|---|
| 6 | Temperamento - núcleo Marcos | COVERED | `READY_FOR_AI` |
| 7 | Senhor da Natividade - Marcos | COVERED | `READY_FOR_AI` |
| 8 | Manner - Frawley | COVERED | `READY_FOR_AI` |
| 9 | Mentalidade - método Marcos | COVERED | `READY_FOR_AI` |
| 10 | Mentalidade - complemento Frawley | COVERED | `READY_FOR_AI` |
| 11 | Mentalidade - suplemento Gugu | COVERED | `SOURCE_GATE` |
| 12 | Constituição geral, corpo e presença | COVERED | `READY_FOR_AI` |
| 13 | Saúde geral e predisposição a doenças | COVERED | `READY_FOR_AI` |
| 14 | Localização corporal de uma vulnerabilidade | COVERED | `READY_WITH_CONTEXT_GATE` |
| 15 | Acidentes e lesões | COVERED | `READY_WITH_CONTEXT_GATE` |
| 16 | Sofrimento psíquico, vícios e autossabotagem | COVERED | `READY_FOR_AI` |
| 17 | Vitalidade, longevidade e morte - Frawley atual | COVERED | `READY_FOR_AI` |
| 18 | Dinheiro e recursos próprios | COVERED | `READY_FOR_AI` |
| 19 | Salário, remuneração e benefícios do trabalho | COVERED | `READY_FOR_AI` |
| 20 | Heranças e dinheiro de mortos | COVERED | `READY_WITH_CONTEXT_GATE` |
| 21 | Dinheiro do cônjuge, parceiro, cliente ou outro | COVERED | `READY_WITH_CONTEXT_GATE` |
| 22 | Imóveis, terra, casa e patrimônio imóvel | COVERED | `READY_WITH_CONTEXT_GATE` |
| 23 | Loteria, ganhos do alto e apoios inesperados | COVERED | `READY_FOR_AI` |
| 24 | Empréstimos, bancos, contratos financeiros | COVERED | `READY_FOR_AI` |
| 25 | Romance, prazer e sexualidade | COVERED | `READY_FOR_AI` |
| 26 | Casamento, parceria e padrão relacional - Marcos | COVERED | `READY_FOR_AI` |
| 27 | Filhos, fertilidade e gravidez | COVERED | `READY_FOR_AI` |
| 28 | Pai, raízes e ancestralidade | COVERED | `READY_FOR_AI` |
| 29 | Mãe | COVERED | `READY_FOR_AI` |
| 30 | Irmãos, primos, vizinhos e pares cotidianos | COVERED | `READY_WITH_CONTEXT_GATE` |
| 31 | Amigos, benfeitores, esperanças e apoios | COVERED | `READY_WITH_CONTEXT_GATE` |
| 32 | Inimigos declarados, concorrentes e oposição | COVERED | `READY_FOR_AI` |
| 33 | Inimigos ocultos, confinamentos e restrições | COVERED | `READY_FOR_AI` |
| 34 | Comunicação, leitura, escrita e habilidades intelectuais básicas | COVERED | `READY_FOR_AI` |
| 35 | Rotina e atividades cotidianas | COVERED | `READY_FOR_AI` |
| 36 | Ensino superior, conhecimento, mestres e profissões eruditas como categoria | COVERED | `READY_WITH_CONTEXT_GATE` |
| 37 | Fé, religião e orientação espiritual | COVERED | `READY_FOR_AI` |
| 38 | Sonhos durante o sono | COVERED | `READY_FOR_AI` |
| 39 | Viagens curtas/rotineiras e deslocamentos | COVERED | `READY_WITH_CONTEXT_GATE` |
| 40 | Viagens longas, estrangeiro e peregrinação | COVERED | `READY_WITH_CONTEXT_GATE` |
| 41 | Profissão, habilidades e estilo de trabalho - Marcos | COVERED | `READY_FOR_AI` |
| 42 | Profissão - complemento Frawley verificado | COVERED | `READY_FOR_AI` |
| 43 | Honra, autoridade, chefes e posição pública | COVERED | `READY_FOR_AI` |
| 44 | Fama e notabilidade - suplemento Frawley | COVERED | `READY_WITH_CONTEXT_GATE` |
| 45 | Empregados, subordinados, prestadores e pequenos animais | COVERED | `READY_WITH_CONTEXT_GATE` |
| 46 | Grandes animais | COVERED | `READY_WITH_CONTEXT_GATE` |
| 47 | Circunstância natal não listada: roteador por casas derivadas | COVERED | `READY_WITH_CONTEXT_GATE` |
| 48 | Promessa radical antes de qualquer previsão | COVERED | `TIMING_CONTEXT_REQUIRED` |
| 49 | Direções primárias - Marcos | COVERED | `TIMING_CONTEXT_REQUIRED` |
| 50 | Progressões secundárias - Marcos | COVERED | `TIMING_CONTEXT_REQUIRED` |
| 51 | Revolução Solar e Lunar - Marcos | COVERED | `TIMING_CONTEXT_REQUIRED` |
| 52 | Progressões, retornos e profecções - Frawley atual | COVERED | `TIMING+SOURCE_GATE` |
| 53 | Regra de convergência temporal | COVERED | `TIMING_CONTEXT_REQUIRED` |

## Legenda de execução

- `READY_FOR_AI`: relatório radical já fornece os dados técnicos para julgamento.
- `READY_WITH_CONTEXT_GATE`: o motor pré-calcula as alternativas técnicas, mas a IA precisa do contexto concreto para escolher o ator/subtema; ela não faz aritmética astrológica.
- `SOURCE_GATE`: o relatório entrega o que está source-locked e marca explicitamente a parte cuja regra exata não pode ser inventada.
- `TIMING_CONTEXT_REQUIRED`: o natal radical está pronto, mas executar previsão exige data/janela e módulo temporal calculado.
- `TIMING+SOURCE_GATE`: além da data, a técnica detalhada permanece limitada ao algoritmo efetivamente source-locked.

## Regra final

A matriz não transforma lacuna documental ou ausência de data em cálculo fictício. Ela responde apenas: **o contrato existe e a evidência exigida tem uma rota de materialização/gate?** O selo de produção pertence exclusivamente ao validador runtime e às regressões.
