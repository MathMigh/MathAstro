# MÉTODO ABSOLUTO — MOTOR DE ASTROLOGIA ELETIVA

**Escopo isolado:** `western/electional`. Este módulo não interpreta natal, sinastria, horária ou mundana. Mapas natais entram somente como condicionantes/referências necessárias à eleição.

## 1. Hierarquia documental

1. **Marcos Monteiro atual e publicado** — eixo canônico principal.
2. **John Frawley atual e publicado** — eixo canônico principal, com versões históricas preservadas explicitamente.
3. **Luiz Gonzaga de Carvalho Neto** — suplemento somente quando houver regra eletiva identificável no corpus.
4. **MathAstro operacional** — transforma princípios em contrato computacional sem atribuir ao autor algoritmo que ele não publicou.

## 2. Divergência histórica que o motor é obrigado a preservar

O Frawley de *The Real Astrology* expõe técnica eletiva completa. O Frawley atual declara não ver valor prático em eletiva e não aceitar comissões, embora ainda a ensine por seu valor pedagógico. Marcos, em material recente do corpus, relata preferência por obter o melhor momento através de horária, aprendida com Frawley, e critica a fantasia do “minuto mágico”.

**Consequência:** o motor tem dois regimes de proveniência, não duas astrologias misturadas:
- `classical-full-election`: executa a técnica eletiva completa publicada;
- `current-marcos-frawley-aware`: calcula a técnica clássica, mas marca explicitamente a reserva atual de Marcos/Frawley e proíbe apresentar o resultado como se fosse a posição prática atual deles.

## 3. Princípio-mãe: arte do possível

A eleição não cria o que não existe. Ela combina:
- capacidades e limitações indicadas pelo(s) natal(is);
- realidade concreta do empreendimento;
- janela material de datas/horas/locais;
- qualidade do céu disponível.

Não há “mapa perfeito”. O algoritmo procura o **melhor disponível** e deve rejeitar promessas impossíveis ou incompatíveis com o contexto.

## 4. Entrada obrigatória

Uma eleição completa recebe:
- objetivo concreto e resultado desejado;
- janela temporal real;
- local real do ato inaugural;
- natureza do ato (o que, exatamente, começa naquele instante);
- um ou mais mapas natais das pessoas cuja capacidade/vida é organicamente envolvida;
- papéis de cada pessoa;
- restrições não astrológicas.

Sem natal pertinente, `classical-full-election` falha por gate metodológico. Não se substitui natal por signo solar, planeta natural ou regra genérica.

## 5. Identificação do instante inaugural

O usuário deve definir qual ato efetivamente inaugura a coisa: assinatura, abertura ao público, publicação, casamento formal, primeira transação etc. O motor não inventa esse ato.

## 6. Casas e significadores

A Casa I do mapa eletivo significa a pessoa que começa e também o próprio empreendimento (Marcos). A casa temática depende do ato e do objetivo. O motor parte de perfis, mas permite refinamento semântico.

Exemplos iniciais:
- negócio: X e II natais; I/X/II eletivas conforme a finalidade;
- parceria/casamento: I/VII;
- imóvel/construção: IV;
- festa: V;
- publicação: distinguir V (obra), IX (publicação/difusão) e X (projeção pública), conforme objetivo.

## 7. Ordem de julgamento

### Gate 0 — viabilidade
Antes da astrologia: a coisa pode funcionar? A eleição não salva empreendimento objetivamente inviável nem incompatibilidade fundamental.

### Gate 1 — natal
Identificar, no(s) natal(is), quais planetas regem as áreas relevantes. Estes planetas tornam-se prioritários na eleição. Nunca esconder um maléfico natalmente funcional só por ser maléfico.

### Gate 2 — propósito
O resultado desejado muda a eleição. “Abrir empresa” é insuficiente: maximizar lucro, estabilidade, crescimento rápido, satisfação, reputação etc. são finalidades diferentes.

### Gate 3 — luminares e pessoa
Frawley publicado exige atenção especial ao regente do Ascendente natal e aos dois luminares; ambos os luminares muito fracos deixam pouca força para realizar.

### Gate 4 — significadores temáticos
Fortalecer os regentes natais e eletivos pertinentes e os planetas naturalmente ligados à função, quando isso faz sentido para a tarefa.

### Gate 5 — maleficência funcional
Mars/Saturno não são simplesmente “banidos”. Primeiro perguntar se regem algo necessário. Se não são necessários, evitar capacidade acidental excessiva de ferir pontos centrais. Se são necessários, usá-los de modo funcional. Frawley dá explicitamente o exemplo de fortalecer Saturno/Marte para compensar deficiências temperamentais úteis a um negócio.

### Gate 6 — modo e elemento
- permanência: signos fixos favorecem duração;
- início rápido/empreendimento breve: cardinais podem ser preferíveis;
- natureza material: terra; comunicação/televisão: ar; etc.
Não converter correspondências em regras universais cegas.

### Gate 7 — dignidade essencial e acidental
Julgar domicílio, exaltação, triplicidade, termo, face, exílio, queda e peregrinação; angularidade/cadência; retrogradação; combustão/cazimi/sob raios. Não somar tudo numa nota absoluta.

### Gate 8 — recepções, aspectos e movimento
A próxima versão do motor deve expandir o grafo dinâmico completo (aplicação/separação, proibição, tradução/coleção quando tecnicamente pertinente) sem importar o veredito do módulo horário. O princípio permanece: aspecto é oportunidade de contato; recepção é relação/intenção/disposição, não são a mesma coisa.

### Gate 9 — compatibilidade eleição ↔ natal
Verificar como os significadores do céu eletivo se relacionam com os significadores natais relevantes. A eleição deve combinar com a pessoa, não apenas “parecer bonita” isoladamente.

### Gate 10 — estrelas fixas
Conflito explícito:
- Frawley publicado atribui uso importante às estrelas, especialmente em matérias longas;
- Marcos afirma que, em horária/eletiva, o risco de usá-las é maior que o de ignorá-las.
Política MathAstro: estrelas são **testemunho opcional**, não gate nem substituto automático de planeta, no modo canônico Marcos-prioritário. O modo histórico Frawley pode mostrá-las separadamente.

## 8. Janelas, não minuto mágico

Uma eleição deve produzir **faixas temporais** e gradientes de qualidade. Se uma recomendação só funciona por uma fronteira arbitrária de minutos sem mudança astrológica correspondente, o algoritmo está errado. O instante ótimo pode ser mostrado, mas acompanhado de janela robusta e de quais fatores realmente mudam nas bordas.

## 9. Ranking sem score totalizador

Não usar “84/100 = excelente”. Comparar candidatos lexicograficamente:
1. menos vetos;
2. menos riscos críticos;
3. menos riscos maiores;
4. mais testemunhos de suporte;
5. desempates por prioridades específicas do objetivo.

Isso mantém a diferença entre defeito fatal e coleção de pequenas vantagens.

## 10. Saída obrigatória

Cada candidato retorna:
- faixa/veredito qualitativo;
- vetos;
- riscos críticos;
- apoios;
- regente do ASC eletivo e regente temático;
- condição integral dos planetas relevantes;
- vínculos com cada natal;
- avisos de limite;
- proveniência de cada regra;
- vetor de ranking, não nota astrológica.

## 11. O que o motor não pode fazer

- tocar na interpretação natal, sinastria, horária ou mundana;
- tratar eleição como criação mágica de destino;
- inventar potencial ausente;
- oferecer minuto mágico;
- considerar um mapa “bom em si” sem natal na eleição completa;
- esconder divergência entre Frawley antigo e atual;
- preencher silêncio de Gugu com astrologia genérica;
- promover estrela fixa acima da política Marcos-prioritário;
- fundir recepção e aspecto;
- somar dignidades numa nota final totalizadora.

## 12. Estado v1.0

Implementado:
- isolamento de módulo;
- perfis de objetivo;
- regências de casas;
- condição essencial/acidental básica;
- gates natal/objetivo;
- maleficência funcional;
- modalidade/elemento;
- compatibilidade básica eleição↔natal;
- proveniência;
- ranking lexicográfico;
- endpoint `/api/electional/evaluate`.

Próximos gates técnicos para uma versão “fechada” de busca automática:
- gerador eficiente de milhares de candidatos sem recalcular o catálogo inteiro de estrelas;
- grafo dinâmico completo de aspectos/recepções;
- detecção de janelas robustas e pontos de quebra;
- catálogo de atos inaugurais por domínio;
- fixtures históricas eletivas e testes de regressão.

---

## 13. Atualização operacional v1.1 — varredura real

O módulo agora possui também `/api/electional/scan`, que recebe uma janela local real, fuso IANA, coordenadas, passo em minutos, dias/horários executáveis, bloqueios e limite de candidatos. Cada instante permitido é calculado pelo núcleo astronômico comum e julgado **dentro da Eletiva**, sem chamar interpretador natal, sinastria ou veredito horário.

A busca respeita a ordem:
1. elimina restrições práticas antes da astrologia;
2. calcula o mapa do instante;
3. julga gates e testemunhos;
4. ordena lexicograficamente;
5. reconstrói **faixas contínuas** de candidatos semelhantes;
6. apresenta um pico apenas como referência interna da faixa.

Sem natividade, a busca pode funcionar como **eleição simples / triagem**, mas o motor a marca como metodologicamente incompleta. Casamento e parceria exigem, por padrão, duas natividades pertinentes para a etiqueta de eleição plena.

## 14. Aspecto, recepção e Lua

Foram materializadas três camadas independentes:
- **aspecto L1 ↔ regente temático:** oportunidade/ligação e estado aplicativo ou separativo;
- **recepção:** dignidades pelas quais um significador recebe o outro, sem confundir disposição com contato;
- **sequência lunar:** próxima aplicação maior detectável antes da mudança de signo, tratada como testemunho dinâmico, não como substituto do juízo inteiro.

A ausência de aplicação lunar não é veto universal. A força estática de um planeta e a dinâmica do que ele fará a seguir permanecem separadas.

## 15. Estado técnico fechado desta rodada

Implementado nesta entrega:
- domínio `src/traditions/western/electional/`;
- avaliação de candidato;
- varredura temporal real;
- restrições práticas;
- janelas contínuas;
- perfis de finalidade;
- dignidade essencial e acidental básica;
- maleficência funcional;
- regentes natais relevantes;
- contatos eleição ↔ natal;
- aspecto e recepção separados;
- sequência lunar básica;
- proveniência autoral;
- API de avaliação e API de busca;
- página `/ocidental/eletiva`;
- auditoria automática de isolamento por hashes;
- transpile/syntax-check isolado dos arquivos novos.

Limites deliberados desta versão:
- a varredura usa o calculador de mapa comum, que também calcula estrelas; em janelas enormes isso é mais lento que uma futura efeméride leve dedicada;
- estrelas fixas permanecem testemunho secundário e não gate no modo Marcos-prioritário;
- hora planetária desigual ainda não participa do ranking automático;
- tradução/coleção/proibição e outras figuras dinâmicas complexas não são inferidas automaticamente nesta versão;
- o modo atual de Marcos/Frawley **não importa nem altera o motor horário**: ele registra a preferência metodológica contemporânea por horária, mas mantém a Eletiva isolada.
