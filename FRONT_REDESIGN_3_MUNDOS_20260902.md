# Math, o Mágico — redesign do front / 3 mundos — 2026-09-02

## Escopo desta rodada

Esta rodada modifica somente apresentação, navegação e identidade visual. Os motores astrológicos e as rotas de API foram preservados.

### Entrada principal

- Home redesenhada como três portais verticais: Chinesa (vermelho), Ocidental (azul), Védica (verde).
- Painel ocidental permanece ligeiramente dominante.
- Hover/foco expande a tradição ativa e recua as outras sem trocar os links reais.
- Diagramas simbólicos são SVG/CSS da própria interface, sem depender de imagem estática.
- Hierarquia mãe → filha explícita: abaixo dos três portais aparecem as seis disciplinas ocidentais como navegação secundária.
- Visual deliberadamente mais editorial/tecnológico e menos barroco: pouco dourado, grid sutil, tipografia ampla, linhas finas, atmosfera e movimento contido.

### Portal Ocidental

- Refeito na família azul da tradição-mãe.
- Seis disciplinas: Natal, Horária, Eletiva, Preditiva, Mundana e Sinastria.
- Os links continuam apontando exatamente às rotas anteriores.

### Chinesa e Védica

- Mantidas as aplicações/motores herdados.
- Adicionada navegação comum "Math, o Mágico" entre as três tradições.
- Home chinesa passa a viver numa família visual vermelha.
- Home védica passa a viver numa família visual verde.
- Alterações limitadas a classes, cabeçalhos, botões de seleção e identidade visual; a lógica de cálculo não foi alterada.

## Verificações

### Back-end / motores

Comparação direta com o ZIP anterior:

- `src/app/api`: IDENTICAL
- `src/app/lib`: IDENTICAL
- `src/traditions`: IDENTICAL

### Contratos front → API

Os `fetch()` do projeto antes e depois desta rodada são idênticos. Foram conferidas as rotas:

- `/api/birth-chart`
- `/api/horary/evaluate`
- `/api/electional/scan`
- `/api/predictive`
- `/api/mundane`
- `/api/vedic`
- `/api/nominatim`

Todas possuem `route.ts` correspondente no projeto.

### Sintaxe

Todos os 218 arquivos `.ts`/`.tsx` sob `src/` foram submetidos ao parser/transpilador TypeScript: 218/218 sem erro de sintaxe.

### Build completo

Foi tentada a instalação das dependências para executar `next build`, mas `npm install` excedeu a janela de execução do ambiente e não produziu `node_modules`. Por isso esta rodada NÃO afirma que o `next build` completo foi executado. A validação acima cobre sintaxe, isolamento do backend e contratos de API, mas o build final deve ser rodado no ambiente de deploy/Vercel com as dependências instaladas.
