# MathAstro — Eletiva — Changelog 2026-08-28

## Escopo
Módulo novo e isolado. Prioridade: Marcos Monteiro → John Frawley → Luiz Gonzaga de Carvalho Neto, sem atribuir a Gugu técnica eletiva autônoma não localizada no corpus.

## Arquivos novos
- `src/traditions/western/electional/types.ts`
- `src/traditions/western/electional/tables.ts`
- `src/traditions/western/electional/calculations.ts`
- `src/traditions/western/electional/engine.ts`
- `src/traditions/western/electional/scanner.ts`
- `src/traditions/western/electional/index.ts`
- `src/app/api/electional/evaluate/route.ts`
- `src/app/api/electional/scan/route.ts`
- `src/app/ocidental/eletiva/page.tsx`
- `scripts/verify-electional-isolation.mjs`
- `scripts/verify-electional-syntax.mjs`
- `docs/ELECTIONAL_PROTECTED_HASHES.sha256`
- documentação metodológica.

## Implementação doutrinária
- eleição como arte do possível;
- objetivo concreto antes do refinamento celeste;
- eleição completa depende das natividades pertinentes;
- eleição simples sem natal é permitida apenas como triagem degradada;
- Casa I = iniciador + empreendimento, conforme Marcos;
- luminares, regentes natais temáticos e regentes eletivos recebem prioridade;
- maléficos são julgados funcionalmente, não apagados mecanicamente;
- modalidade/elemento são contextuais;
- recepção não é aspecto;
- próximo movimento lunar é testemunho separado;
- estrelas não ganham poder de salvar mapa ruim no modo Marcos-prioritário;
- ranking lexicográfico, não nota totalizadora;
- resultado em faixas contínuas, não minuto mágico.

## Auditoria
`npm run verify:electional` passou: arquivos protegidos de Natal/Sinastria/núcleo astrológico permanecem com os hashes registrados e não há imports dos interpretadores Natal/Sinastria/Horária no módulo Eletiva.

`npm run verify:electional:syntax` passou para os arquivos TypeScript/TSX adicionados.

O `next build` completo não é certificado nesta sessão: a instalação integral de dependências excedeu o tempo disponível no ambiente. Isso não é tratado como build aprovado.
