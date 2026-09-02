# Integração Chinesa + Védica + novo portal — 2026-09-02

## Base preservada
O projeto parte de `MathAstro_UNIFICADO_FRONT_CORRIGIDO_20260901`, mantendo os motores ocidentais avançados: Natal, Horária, Eletiva, Preditiva RC6, Mundana v3 e Sinastria v4.

## Astrologia Chinesa importada do LeMathAstro
- BaZi (`bazi.ts`)
- catálogo e relatórios chineses
- técnicas chinesas
- Zi Wei Dou Shu (`ziwei.ts` / iztro)
- Qi Men Dun Jia (`qimen.ts` / qimen-mingfa)
- Tong Shu e ciclos expostos pela suíte
- UI completa `ChineseAstrologyApp`
- rota `/chinesa` e compatibilidade `/bazi`

## Astrologia Védica importada do LeMathAstro
- UI `VedicApp` + visão técnica
- endpoint `/api/vedic`
- motor-base `vedic.ts`
- suíte Jyotish completa em `src/app/lib/jyotish/` (36 arquivos), incluindo Janma, vargas, dashas, yogas, bala, bhavas, Jaimini, Arudha, Argala, Panchanga, Gochara, Varshaphala, Muhurta, Prashna, Vivaha, KP e demais módulos presentes na origem.
- dependências adicionadas: `iztro`, `lunar-typescript`, `qimen-mingfa`, `@ziweijs/core`.

## Isolamento de fuso
O motor Natal ocidental mantém a exigência estrita de timezone IANA. A integração védica recebeu uma adaptação própria de timezone para não rebaixar essa regra do núcleo ocidental.

## Novo front
A raiz `/` virou um portal de três tradições, seguindo a arquitetura do desenho do usuário:
- Chinesa = vermelho profundo
- Ocidental = azul profundo e central/principal
- Védica = verde profundo
- três painéis verticais altos, visual sóbrio/editorial/tecnológico, menos ornamental
- cada painel abre o respectivo mundo
- `/ocidental` continua abrindo os seis módulos ocidentais
- `/chinesa` abre a suíte chinesa completa
- `/vedica` abre a suíte Jyotish completa

## Validação
Foi feita checagem estática de imports locais após a fusão. Permanecem apenas dois aliases legados já existentes no projeto-base (`@/utils/chartUtils`) em componentes antigos. Não foi afirmado `next build`: a instalação de dependências excedeu a janela de execução deste ambiente.
