# MathAstro — Checkpoint material do fechamento natal

Data do checkpoint: 2026-08-27
Status: INTERMEDIÁRIO / EM DESENVOLVIMENTO

Este arquivo existe para congelar materialmente o estado do projeto durante o fechamento do motor natal ocidental. Ele NÃO representa a versão final pronta para implantação.

## Hierarquia metodológica obrigatória

1. **Marcos Monteiro — fonte central e canônica.**
2. **John Frawley — complemento prioritário** quando Marcos não especifica suficientemente uma regra necessária ao cálculo ou ao dossiê técnico.
3. **Luiz Gonzaga de Carvalho Neto (Gugu) — complemento subsidiário** quando a lacuna não estiver suficientemente resolvida por Marcos/Frawley.

Regras de autores diferentes não devem ser fundidas silenciosamente. Sempre que houver divergência, o motor deve preservar variante, fonte e proveniência. O temperamento canônico permanece especificamente o método de Marcos Monteiro.

## Princípio de arquitetura natal

O motor calcula; a IA interpreta. A IA não deve precisar:

- recalcular efemérides;
- escolher sistema de casas sem indicação;
- descobrir significadores técnicos;
- reconstruir dignidades, recepções, dispositores ou almutens;
- decidir sozinha aplicação/separação/perfeição;
- completar lacunas técnicas por palpite.

O formulário natal deve entregar os dados e dossiês técnicos já resolvidos, com fonte e estado (`calculado`, `não aplicável`, `não resolvido`, `variante`).

## Blocos já materializados neste checkpoint

- Swiss Ephemeris / WASM e cálculo radix;
- Regiomontanus + Placidus em paralelo;
- posições tradicionais + exteriores como qualificadores secundários;
- nodo verdadeiro em desenvolvimento como padrão Marcos, nodo médio auxiliar;
- dignidades essenciais e condições acidentais em ledger;
- secto;
- temperamento Marcos;
- Senhor da Natividade em evolução;
- recepções positivas/negativas e mútuas;
- dispositores e ciclos;
- 7 Partes fundamentais e dossiês técnicos;
- antíscio / contra-antíscio;
- catálogo de estrelas fixas Swiss (`sefstars.txt`) em integração;
- aspectos tradicionais e motor de dinâmica/perfeição em evolução;
- syzygia pré-natal;
- dossiês de casas;
- indicadores vitais Frawley em integração;
- General Fortune, Modos, Profissão, Relacionamentos e Saúde simbólica em integração;
- relatório técnico natal e fixture de Barra Mansa (21/04/2001 06:45).

## Pesquisa nova já incorporada ao trabalho de fechamento

### John Frawley

- procedimento publicado de Manner em *The Real Astrology Applied* preservado como variante publicada/legada;
- mente: Lua + Mercúrio, dignidade, força acidental, velocidade, contatos, Saturno/Marte, estrelas e contexto de cúspide;
- profissão: casa X + regente da X + planetas na X + Mercúrio + Vênus + Marte;
- julgamento por casas após temperamento/manner/mente;
- filhos: casa V, regente, fertilidade, Lua/Júpiter e Parte dos Filhos;
- riqueza: casa II, regente, Júpiter e Parte da Fortuna/dispositor;
- Parte do Casamento publicada em exemplo;
- sete Partes como princípios passivos, com forte ênfase no dispositor;
- retornos/progressões só manifestam o que é prometido no radix;
- Frawley atual: Hyleg/Anareta/Alcochoden devem permanecer variante atual separada; não usar almúten para escolher Alcochoden.

### Marcos Monteiro

As regras de Marcos já auditadas permanecem superiores em qualquer conflito, especialmente:

- cinco testemunhos do temperamento;
- Senhor da Natividade;
- aspecto como relação zodiacal + dinâmica, conjunção não cruza signo;
- influência próxima ~3°, até ~5° como relevância marginal, sem tabelas rígidas de orbes como regra canônica;
- perfeição para evento e impedimentos;
- casas: regente da cúspide como significador primário; ocupantes não equivalem automaticamente ao assunto da casa;
- regra de cúspide com mesmo signo, distância/tamanho da casa/aplicação;
- nodos principalmente por conjunção; usar nodo verdadeiro;
- estrelas com filtro de relevância e sem conjunção trans-signo;
- Partes fundamentais ativadas por contatos relevantes;
- retrogradação não deve virar penalidade natal universal isolada;
- combustão deve respeitar contexto e mitigação em domicílio/exaltação;
- temperamento não é a pessoa inteira;
- mapa/planeta não deve ser achatado em um único score global.

### Gugu

Permanece complemento com proveniência, sobretudo para mentalidade composta/almutens de Lua e Mercúrio e, se necessário, Modos/Profissão quando a regra Marcos/Frawley não estiver suficientemente documentada.

## Estado de compilação deste checkpoint

A checagem focal do núcleo natal foi executada com:

`npx tsc -p tsconfig.natal-close.json --pretty false`

Resultado neste checkpoint: **FALHA CONHECIDA DE INTEGRAÇÃO**, não erro ocultado.

As interfaces `NatalTechnicalForm` / `NatalAnalysis` já declaram os novos campos:

- `spiritualOrientation`
- `children`
- `wealth`
- `sourceRegistry`

mas os builders/retornos ainda estão sendo conectados. Este checkpoint foi solicitado antes da conclusão e preserva exatamente esse estado intermediário.

## Regra para continuação

Não remover uma regra Marcos para fazer Frawley/Gugu “caber”. Em conflito:

- Marcos canônico;
- Frawley variante complementar;
- Gugu variante complementar;
- provenance/source registry explícito.

O próximo checkpoint/final deve passar a checagem focal, regressão de Barra Mansa e auditoria de relatório antes de ser chamado de pronto.
