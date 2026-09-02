# MathAstro Unificado — 2026-09-01

Este diretório é a integração controlada dos seis ramos trabalhados separadamente: **Natal, Horária, Eletiva, Preditiva, Mundana e Sinastria**.

## Regra de autoridade

- **Natal:** ramo Natal dedicado (base do projeto e autoridade sobre núcleo natal compartilhado).
- **Horária:** ramo Horária dedicado.
- **Eletiva:** método/prompt Eletiva dedicado + implementação `western/electional` presente no ramo Horária.
- **Preditiva:** ramo Preditiva RC6 dedicado.
- **Mundana:** ramo Mundana v3 dedicado. A cópia Preditiva herdada dentro dele **não** substitui a RC6.
- **Sinastria:** ramo Sinastria v4 dedicado; foram portadas também as costuras de UI estritamente necessárias ao funcionamento da sinastria.

## Fronteiras

Os motores permanecem separados sob `src/traditions/western/<modulo>`. O núcleo natal e os utilitários comuns não foram substituídos por versões antigas herdadas dos outros ramos.

Os métodos e prompts absolutos finais enviados no pacote agregador estão em `docs/metodos_absolutos_20260901/`.

## Rotas ocidentais

- `/ocidental/natal`
- `/ocidental/horaria`
- `/ocidental/eletiva`
- `/ocidental/preditiva`
- `/ocidental/mundana`
- `/ocidental/sinastria`

## Verificação

O `package.json` agrega os gates de teste dos módulos e inclui `verify:western:modules` / `verify:western:release`. Alguns gates históricos dependem de fixtures e do ambiente original, por isso a integração também inclui scripts e configurações de auditoria específicos dos módulos quando disponíveis.

## Estado desta integração

Os gates de Natal, Horária, Eletiva, Preditiva/Consulta, Mundana e Sinastria foram executados e passaram no baseline unificado. Consulte `audit-results/UNIFIED_INTEGRATION_STATUS_20260901.md` para o inventário exato.

O `next build` não foi afirmado como validado: o pacote-base não inclui `package-lock.json` nem `node_modules`. O script `verify:western:release` fica disponível para o build final em um ambiente com as dependências instaladas.
