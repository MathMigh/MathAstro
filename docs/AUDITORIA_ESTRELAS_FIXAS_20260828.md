# AUDITORIA E CORREÇÃO — ESTRELAS FIXAS — 2026-08-28

## Veredito

O catálogo grande de estrelas fixas **não havia sido removido**. O projeto continuava contendo `public/vendor/sefstars.txt`, catálogo do Swiss Ephemeris. A falha estava na execução: a rotina de precisão chamava `swe_fixstar_ut` estrela por estrela e, quando a chamada WASM falhava, capturava a exceção e seguia para a próxima estrela. Se todas falhassem, o resultado final era um array vazio, indistinguível de um céu corretamente calculado sem contatos. Isso produzia no relatório a frase enganosa “Nenhum contato preservado pelo catálogo carregado”.

## Correção arquitetural

A camada de estrelas foi separada em quatro níveis:

1. **Catálogo celeste completo** — todas as estrelas válidas do `sefstars.txt` são posicionadas para a época do nascimento.
2. **Céu local** — para cada estrela são calculados altitude, azimute e `aboveHorizon`, distinguindo posição zodiacal de presença literal acima do horizonte naquele local e instante.
3. **Contatos interpretativos** — somente depois do céu calculado são aplicadas as regras/orbes do método natal para contatos com planetas, cúspides e Partes.
4. **Prioridade interpretativa** — as estrelas mais importantes podem ser destacadas sem apagar o catálogo completo.

A ausência de contato interpretativo nunca mais pode significar ausência de estrelas calculadas. Se o motor não conseguir calcular o catálogo, o estado é `FIXED_STAR_ENGINE_FAILURE` e o relatório deve dizer explicitamente que houve falha.

## Catálogo

- Fonte de cálculo: Swiss Ephemeris `sefstars.txt`.
- Registros não comentados encontrados: aproximadamente 1360.
- Estrelas válidas únicas após normalização e exclusão de pseudo-objetos/sentinelas: **1112**.
- O conjunto é maior que o modo “All Stars (286)” usado como referência de interface no Astro-Seek.
- Foi preservado também um marcador para o conjunto de 15 estrelas principais usado como vista rápida no estilo Astro-Seek.

## Cálculo por época

Caminho preferencial: Swiss Ephemeris `swe_fixstar_ut`.

Fallback determinístico: coordenadas J2000 do próprio `sefstars.txt` + movimento próprio + precessão J2000→época + transformação equatorial→eclíptica. Esse fallback existe para impedir que uma indisponibilidade do binding WASM transforme uma falha em catálogo vazio.

O fallback foi validado independentemente contra posições anuais de referência de estrelas conhecidas e ficou dentro da tolerância de auditoria estabelecida.

## Informação entregue por estrela

- nome;
- nomenclatura/identificador;
- constelação;
- magnitude;
- longitude eclíptica tropical na época natal;
- latitude eclíptica;
- ascensão reta;
- declinação;
- casa Regiomontanus;
- casa Placidus;
- altitude;
- azimute;
- acima/abaixo do horizonte;
- marcador de estrela principal;
- modo de cálculo (`swiss-exact` ou `catalog-precession`).

## Relatório e UI

O relatório técnico agora diferencia:

- metadados do catálogo e estado do motor;
- posições das estrelas principais;
- contatos interpretativos realmente preservados;
- disponibilidade do catálogo completo em `fixedStarCatalog`.

A interface possui duas vistas:

- **Céu natal completo** — catálogo integral, pesquisável e paginado;
- **Contatos** — apenas estrelas que efetivamente entram no julgamento natal.

Filtros do céu: todas, 15 principais, acima do horizonte e busca textual.

## Sanity check — Barra Mansa, 21/04/2001 06:45

O validador independente encontrou contatos não nulos no mapa de referência; portanto o resultado anterior de zero contatos era uma falha de execução, não uma característica do mapa. Entre os controles de sanidade aparecem contatos extremamente próximos, inclusive Saturno–Alcyone, além de outros contatos do catálogo completo.

## Regra para IA

A IA não calcula estrelas fixas. Ela recebe:

- céu já calculado;
- contatos já resolvidos;
- orbes;
- alvo tocado;
- proveniência;
- status do motor.

Se a posição estelar não estiver materializada, a IA deve registrar `MISSING_ENGINE_DATA` / `FIXED_STAR_ENGINE_FAILURE`, nunca improvisar precessão ou consulta própria.
