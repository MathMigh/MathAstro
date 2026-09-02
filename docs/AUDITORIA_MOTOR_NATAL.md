# Auditoria técnica do motor natal do MathAstro

Data da revisão: 26 de agosto de 2026.

## Resultado

O motor natal passou a separar cálculo astronômico, testemunhos astrológicos e síntese conversacional. A API agora devolve `natalAnalysis`, um objeto estruturado que pode ser consultado pela futura IA sem obrigá-la a inventar uma leitura nem a depender do texto do relatório.

O método padrão adotado é:

- temperamento: cinco testemunhos de Marcos Monteiro;
- partes árabes: as sete fórmulas da planilha pública de Marcos Monteiro, sem inversão noturna não indicada na planilha;
- triplicidades: sistema de dois regentes preferido por Marcos, com Marte regendo a triplicidade da Água tanto de dia quanto de noite;
- termos: tabela de William Lilly reproduzida por Marcos;
- casas: Regiomontanus (`R`), zodíaco tropical;
- aspectos: aspectos ptolomaicos por signo e orbes por moiedades; nodos e qualificadores exteriores limitados a conjunção/oposição;
- planetas tradicionais: somente Sol, Lua, Mercúrio, Vênus, Marte, Júpiter e Saturno recebem regências e dignidades.

## Autoridades e limites

As fontes normativas principais foram o exemplar fornecido de *Introdução à Astrologia Ocidental*, de Marcos Monteiro, e o exemplar fornecido de *The Real Astrology Applied*, de John Frawley.

Fontes públicas complementares:

- [Guia para Cálculo do Temperamento](https://pt.scribd.com/document/677795407/Guia-Para-Calculo-Do-Temperamento)
- [Planilha para cálculo das partes árabes fundamentais](https://www.patreon.com/marcosmonteiro/posts/planilha-para-99870705)
- [Fluxo circular de análise natal e explicação pública dos antíscios](https://marcosmonteiro.substack.com/p/resolucoes-de-ano-novo)
- [Descrição oficial de *The Real Astrology Applied*](https://www.johnfrawley.com/the-real-astrology-applied)
- [Documentação da Swiss Ephemeris](https://www.astro.com/swisseph/swisseph.htm)
- [Definição astronômica das casas Regiomontanus](https://www.astro.com/swisseph/sweph_ht_s.htm)

Publicações fechadas no Patreon sobre mentalidade, Senhor da Natividade e partes árabes foram identificadas, mas seu conteúdo bloqueado não foi inferido. A planilha pública é normativa para as fórmulas; o restante do motor usa apenas regras verificáveis nas fontes abertas ou nos livros fornecidos.

## Distinções que o código agora preserva

1. **Senhor da Natividade (Marcos):** planeta com melhor condição essencial para o quinto testemunho do temperamento; empates seguem aspectos próximos e, por último, casa.
2. **Senhor da Genitura (Frawley):** planeta mais forte pela combinação das condições essencial e acidental.
3. **Almúten essencial do mapa:** planeta com maior força essencial entre os sete tradicionais.
4. **Almúten de um grau:** planeta que soma mais dignidades no grau de uma cúspide ou ponto.
5. **Almuten Figuris:** não é sinônimo dos quatro resultados acima. Não foi calculado porque nenhuma fórmula específica dele foi atribuída a Marcos ou Frawley nas fontes auditadas. O motor registra essa ausência em vez de fabricar um resultado.

## Dignidades essenciais

Foram corrigidos:

- regente diurno da Água: de Vênus para Marte no sistema de dois regentes;
- termos egípcios: substituídos pelos termos de Lilly usados por Marcos;
- peregrinação na referência numérica de Frawley: `−3`, sem o antigo texto incorreto que dizia simultaneamente “0 pontos” e “−5”;
- exílio e queda continuam distintos de peregrinação;
- planetas exteriores não entram em domicílio, exaltação, triplicidade, termo ou face.

Cada planeta agora expõe os regentes do grau, dignidades próprias, debilidades, pontuação do método de Marcos e pontuação de referência de Frawley.

## Dignidades acidentais

O motor calcula e registra, separadamente:

- casa e distância da cúspide, inclusive a barreira de signo destacada por Marcos;
- júbilo e casa oposta ao júbilo;
- movimento direto, retrógrado ou estacionário;
- velocidade relativa à média do próprio planeta;
- movimento em latitude quando disponível;
- cazimi, combustão, sob os raios, oposição próxima ao Sol e liberdade dos raios;
- orientação oriental/ocidental com as diferenças de Frawley para superiores e interiores;
- aumento ou diminuição da luz da Lua e Via Combusta;
- halb e hayz, sem fingir que o gênero contextual de Mercúrio é sempre fixo;
- aspectos partís com benéficos, maléficos e nodos;
- conjunções relevantes com estrelas fixas.

A pontuação serve para ordenar testemunhos e escolher o Senhor da Genitura. Ela não substitui recepção, aspecto, contexto nem juízo.

## Mentalidade e modos

`natalAnalysis.mentality` contém:

- fase e qualidades da Lua;
- elemento e modalidade dos signos da Lua e de Mercúrio;
- condição essencial e acidental de ambos;
- aspecto Lua–Mercúrio, quando existe dentro da orbe;
- parceiro dominante por força essencial e, em segundo lugar, acidental;
- aspectos modificadores próximos aos dois significadores;
- condição solar e velocidade de Mercúrio.

O motor preserva evidências; a IA deve compor a resposta levando em conta contexto, recepções e a pergunta concreta. Os modos são armazenados separadamente, seguindo a ordem de Frawley: planeta no signo ascendente, planeta conectado à Lua ou a Mercúrio e, só então, regente do Ascendente.

## Recepções e dispositores

As recepções por domicílio, exaltação, triplicidade, termo e face são calculadas como relações direcionais: o dono da dignidade recebe o planeta que está nela. Recepções mútuas indicam também se há aspecto, porque recepção mostra inclinação e aspecto mostra ocasião.

As cadeias de dispositores detectam tanto um dispositor final quanto circuitos. O código não chama mais de “final” um planeta que participa de um ciclo.

## Antíscios

A fórmula canônica é `antíscio = (540° − longitude) mod 360°`. O ponto oposto é guardado como oposição por antíscio, sem tratá-lo como uma segunda espécie física de ponto.

O motor calcula as posições dos sete planetas, doze cúspides e sete partes fundamentais, mas só eleva ao juízo principal contatos de conjunção ou oposição dentro de `3°`. Essa escolha segue a prioridade pública de Marcos; outros aspectos por antíscio não são proibidos em princípio, mas permanecem fora do juízo automático por serem mais fracos.

## Estrelas fixas

O catálogo continua preservado, mas o relatório não despeja toda estrela fraca que cai numa orbe uniforme. Ele separa:

- correspondências relevantes: estrelas principais, reais, muito brilhantes ou excepcionalmente próximas;
- correspondências secundárias: preservadas no JSON, omitidas do juízo principal.

As estrelas são tratadas como conjunções próximas com planetas e ângulos, não como planetas, dispositores ou regentes. As longitudes J2000 recebem precessão para a data do mapa.

## Base astronômica e reprodutibilidade

O mapa é calculado pela Swiss Ephemeris, com velocidade e latitude, e devolve metadados de auditoria: instante UTC, fuso, dia juliano, sistema de casas, zodíaco e tipo de nodo. O WASM foi incluído localmente no projeto para remover a dependência operacional do CDN `unpkg`.

Antes de publicar um serviço comercial, é necessário escolher e cumprir uma das licenças da Swiss Ephemeris: AGPL ou licença profissional. A documentação oficial descreve esse regime duplo; esta observação não substitui aconselhamento jurídico.

## Fluxo recomendado para a IA

Marcos descreve publicamente um trabalho circular. A ordem foi registrada em `methodology.analysisOrder`:

1. temperamento;
2. modos e mentalidade;
3. áreas concretas perguntadas pelo consulente;
4. sete partes árabes fundamentais;
5. revisão das áreas à luz das partes;
6. estrelas fixas;
7. revisão final.

A IA não deve responder “qual é a natureza dele?” lendo uma lista plana. Ela deve percorrer essa ordem, citar os testemunhos usados e distinguir condição, possibilidade, inclinação e ocasião.

## Verificação

- `npm run build` compila o projeto inteiro;
- `npm run verify:natal` valida o caso de Barra Mansa contra uma instância local do site;
- o caso de teste está em `fixtures/barra-mansa-santa-casa-2001.json`.
