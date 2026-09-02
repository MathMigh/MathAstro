# MathAstro — Auditoria técnica natal — 26/08/2026

## Princípio de arquitetura

O motor calcula; a IA interpreta. A camada interpretativa não deve corrigir coordenadas, casas, relações, dignidades, recepções, antíscios, Partes, estrelas, cúspides ou empates técnicos inventando regras ausentes.

Hierarquia metodológica geral:
1. Marcos Monteiro;
2. John Frawley como complemento;
3. Luiz Gonzaga de Carvalho Neto (Gugu) para lacunas restantes.

Exceção expressa: **temperamento canônico = técnica de Marcos Monteiro**.

## Alterações implementadas nesta rodada

### Temperamento
- Mantidos os cinco testemunhos do método Marcos usado pelo projeto: Ascendente, regente do Ascendente, fase da Lua, estação do Sol e Senhor da Natividade.
- O resultado agora é explicitamente misto: os quatro temperamentos recebem escore derivado das qualidades acumuladas e são ordenados.
- Campos novos: `strongestTemperament`, `weakestTemperament`, `mixture[]` e `status`.
- `inferiorTemperament` passa a representar o segundo componente da mistura, preservando compatibilidade com o esquema anterior.
- Se o Senhor da Natividade continuar empatado depois dos critérios verificados de dignidade essencial e aspectos, o motor não usa mais força de casa como desempate inventado. Retorna `resolution: unresolved` e não acrescenta contribuição fictícia ao temperamento.

### Dignidades e debilidades
- Corrigido peregrino: ausência de dignidade não basta; planeta em exílio ou queda não é simultaneamente marcado como peregrino.

### Recepções
- Recepções agora incluem testemunhos positivos e negativos.
- Foram acrescentadas recepções por exílio e queda, com `polarity: positiva|negativa` e força assinada.
- A relação entre recepção e aspecto continua explicitamente registrada, sem confundir recepção com aspecto.

### Aspectos e Partes
- Conjunção não atravessa signo.
- As sete Partes fundamentais podem relacionar-se umas com as outras; foi removida a exclusão Parte↔Parte.
- Para Partes, o motor restringe o aspecto técnico primário a conjunção/oposição.
- Cada Parte recebe relações estruturadas com planetas tradicionais, as 12 cúspides e as demais Partes, com aspecto, orbe e dinâmica calculada.

### Partes árabes
- Removido o arredondamento prematuro para minuto inteiro. O cálculo mantém precisão decimal interna da efeméride e arredonda apenas na apresentação.
- Cada Parte recebe fórmula, longitude, casa geométrica, zona de cúspide, dispositor, estado do dispositor, antíscio e relações.

### Casas e regra de cúspide
- O formulário técnico preserva a casa geométrica.
- Calcula a próxima cúspide, distância angular, coincidência de signo e a condição `<5° antes da próxima cúspide e mesmo signo`.
- Em vez de deslocar o planeta silenciosamente, retorna `marcosEffectiveHouseCandidate`.

### Mentalidade
- Removido `dominantPartner` Lua/Mercúrio por soma de pontuações, por não ser um veredito técnico suficientemente fundado.
- Lua e Mercúrio agora recebem dossiês completos: longitude, signo, elemento, modalidade, almúten do grau, dispositor por domicílio, condição essencial e acidental.
- O formulário inclui fase lunar, relação Lua–Mercúrio, aspectos modificadores, regente do Ascendente e suas condições.
- Variantes são separadas por proveniência: Marcos (primário), Frawley (complementar) e Gugu (terceiro nível). O bloco Gugu inclui os almutens separados dos graus da Lua e de Mercúrio e candidatos à composição mental, sem substituir automaticamente a leitura de Marcos.

### Estrelas fixas
- Os alvos passaram de apenas ASC/MC/planetas para: sete planetas tradicionais + todas as 12 cúspides + sete Partes fundamentais.
- A distância bruta continua preservada separadamente de `isRelevant`.

### Formulário técnico natal
Novo bloco `technicalForm`, com princípio `motor-calcula-ia-interpreta`, contendo:
- hierarquia de fontes;
- fonte canônica do temperamento;
- dossiê dos sete planetas;
- 12 cúspides + almutens;
- sete Partes + dispositor + relações;
- recepções positivas/negativas;
- recepções mútuas;
- antíscios;
- contatos de estrelas;
- questões técnicas ainda não resolvidas.

### Entrada temporal
- Datas/horas ausentes ou inválidas não usam mais a data corrente como fallback.
- Fuso IANA informado na localização passa a ter precedência e é validado.
- Fora da cobertura interna brasileira, o motor passa a exigir fuso IANA, em vez de deduzir um fuso artificial pela longitude.

## Verificação

Foi executado um `tsc` isolado sobre o núcleo natal alterado (`natalAnalysis`, `traditionalTemperament`, `traditionalCalculations`, `aspectDynamics`, `arabicLots`, `fixedStars`, tabelas e interfaces), com shims somente para dependências de UI: **sem erros**.

A compilação Next.js completa não foi validada nesta rodada porque a instalação completa de `node_modules` não terminou no ambiente e os pacotes de tipos permanecem incompletos. Não considerar o `build` global como aprovado.

## O que ainda falta — prioridade alta

1. **Perfeição real de aspectos**: substituir a estimativa linear de aplicativo/separativo por busca efemérica de perfeição que detecte ingresso, estação, retrogradação/refranação e proibição antes da perfeição.
2. **Estrelas fixas astronômicas exatas**: substituir J2000 + precessão linear pela rotina Swiss Ephemeris `swe_fixstar2_ut` (ou catálogo astrométrico equivalente), com latitude e movimento próprio reais. Incluir `sefstars.txt`/catálogo e proveniência.
3. **Catálogo estelar tradicional**: completar objetos como Facies e outros aglomerados/nebulosas usados tradicionalmente, com aliases, natureza, magnitude, tipo e fonte. Separar relevância tradicional de simples magnitude.
4. **Nodos**: calcular e armazenar Nodo Médio e Nodo Verdadeiro; registrar qual variante cada técnica usa. Hoje o mapa canônico ainda usa Nodo Médio.
5. **Orientalidade/ocidentalidade**: validar astronomicamente a regra de nascer antes/depois do Sol; não depender apenas da diferença eclíptica. Guardar elongação, ascensão reta e relação de nascimento/ocaso quando necessário.
6. **Ingressos e mudança de dignidade**: distância/tempo para ingresso anterior e próximo, estado essencial antes/depois, e se uma estação ocorre antes do ingresso.
7. **Syzygia pré-natal e eclipses anteriores ao nascimento**: calcular Lua Nova/Cheia pré-natal e eclipse relevante anterior, com distância temporal e posições.
8. **Hyleg / alcochoden / anareta**: Frawley inclui esses tópicos no ensino natal. Implementar apenas depois de fixar uma regra verificável e versionada; não inventar algoritmo híbrido.
9. **Almuten Figuris**: continuar sem fabricar fórmula. Implementar somente com variante explicitamente documentada e proveniência.
10. **Propriedades dos signos**: estruturar fértil/estéril, mudo/voz, humano/bestial/feral e outras qualidades efetivamente usadas por Frawley/Gugu, cada uma com fonte e sem tabela sincrética anônima.
11. **Dossiê técnico das 12 casas**: gerar, para cada casa, cúspide, signo, regente(s) aceitos pela técnica, almúten, regente por exaltação quando pertinente, condição completa do(s) significador(es), ocupantes, aspectos, recepções, Partes e estrelas. Isso permitirá que a IA leia filhos, profissão, dinheiro, fé etc. sem selecionar significadores por conta própria.
12. **Promessas natais por tema**: criar módulos estruturados (pais, irmãos, filhos, casamento, profissão, riqueza, fé, doença etc.) que reúnam os significadores técnicos exigidos por cada autor, sem emitir o julgamento final.
13. **Maneira / modos / qualidade da alma**: o bloco atual de `manner` ainda é Frawley simplificado. Precisa ser refeito como dossiê de evidências e variantes, do mesmo modo que mentalidade.
14. **Força planetária**: pontuações devem permanecer auxiliares. Separar com maior rigor força essencial, capacidade acidental, recepção/inclinação, aspectos/ocasião e condições especiais; não converter isso num único “número verdadeiro”.
15. **Senhor da Natividade — casos especiais**: ainda é necessário recuperar/verificar a regra de Marcos para “quando ninguém tem dignidade” e para empates não desfeitos pelos aspectos. Até lá, o motor retorna a irresolução.
16. **Temperamento — auditoria fina**: confirmar diretamente, nas aulas/folhas do Marcos, todos os pesos/modulações numéricas (1 / 1,25 / 0,75 etc.) e casos excepcionais. O esquema misto forte/fraco pode permanecer como camada descritiva derivada, mas não deve alterar os cinco testemunhos canônicos.
17. **Latitude/declinação e condições especiais**: decidir quais testemunhos realmente entram na prática natal dos três autores e expor os dados astronômicos sem pontuar automaticamente onde a regra não estiver verificada.
18. **Calendário histórico**: o motor ainda força calendário gregoriano no cálculo juliano. Para mapas históricos antigos, adicionar política de calendário (gregoriano/juliano/proléptico) e registrar a escolha.
19. **Proveniência por campo**: ampliar a proveniência até cada dado derivado relevante (`ruleId`, autor, obra/aula, versão, status de evidência), não apenas por seção/testemunho.
20. **Testes de regressão**: criar fixtures conhecidas para aspectos em fronteira de signo, peregrinação vs queda/exílio, recepção negativa, Partes exatas, cúspide <5°, empates do Senhor da Natividade e estrelas em cúspides/Partes.

## Recursos natais de Frawley que ainda não estão completos

O próprio programa natal de Frawley inclui temperamento, Hyleg/alcochoden/anareta, wit/manner, fortuna geral, eclipses/lunações, casas e técnicas preditivas (progressões, retornos, profecções). Para o escopo do **mapa natal estático**, os maiores buracos atuais são Hyleg, fortuna geral tecnicamente esquematizada, wit/manner completo, eclipses/lunações e dossiês casa a casa. Técnicas preditivas devem ficar em módulos próprios, mas o natal precisa fornecer os dados de promessa que elas pressupõem.

## Recursos de Marcos ainda incompletos

- Senhor da Natividade em casos sem dignidade ou empates persistentes.
- Mentalidade completa conforme sua formulação final/aulas recentes.
- Modos/maneira como módulo separado.
- Uso integral das sete Partes no natal, especialmente combinações por cúspides, planetas e antíscios.
- Estrelas fixas com catálogo e astronomia de alta precisão.
- Mudanças iminentes de signo/dignidade.
- Lunações/eclipses anteriores ao nascimento.

## Recursos de Gugu ainda incompletos

- Mentalidade composta em sua forma completa, incluindo todas as condições acidentais e modificadores descritos nas notas/aulas.
- Qualidade da alma / maneira, sem confundir com temperamento.
- Propriedades dos signos e condições dos significadores necessárias para temas específicos.
- Casos em que luminares aparecem como dignitários dominantes e a técnica manda procurar o significador não-luminar pertinente.

