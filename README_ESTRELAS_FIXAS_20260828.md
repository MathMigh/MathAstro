# MathAstro Natal — estrelas fixas / céu completo + tribunal interpretativo

O catálogo grande `public/vendor/sefstars.txt` continua sendo a fonte astronômica. A arquitetura separa explicitamente:

1. **céu natal completo** — posições de todos os objetos catalogais calculados;
2. **contatos auditáveis** — coincidências geométricas;
3. **contatos interpretativos** — apenas itens que passam orbe, classe e proveniência.

## Regras de julgamento

- Marcos, estrela comum: 1°;
- Marcos, principais: 2–3° no máximo; teto operacional 3°;
- principais source-locked de Marcos: Regulus, Aldebaran, Antares, Fomalhaut, Sirius, Procyon, Castor, Pollux, Spica e Algol;
- deep-sky é auditável mas não interpretativo por padrão;
- exceções explicitamente publicadas por Frawley (por exemplo Praesepe, Facies e Andrômeda/Vertex) permanecem com `Frawley-Applied-explicit`;
- alias tradicional canônico duplicado é falha;
- ausência de `interpretiveSources` em contato promovido é falha.

A UI mostra por padrão **Contatos interpretativos** e oferece um controle separado para coincidências de auditoria.

## Verificação

`python scripts/verify_fixed_star_sky.py`

O teste de referência continua materializando 1360 registros brutos, 1112 objetos únicos e contatos não nulos. Falha do motor nunca é convertida em “nenhum contato”.
