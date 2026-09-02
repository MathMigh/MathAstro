# MathAstro Natal — Absolute AI PT-BR / Provider Ready — Closeout 2026-09-01

## Objetivo desta rodada

Transformar a camada de julgamento natal em um componente pronto para receber uma IA real sem alterar o motor astrológico.

## Estado atual

- `PROMPT_ABSOLUTO_PTBR = IMPLEMENTADO`
- `SUBJETIVIDADE_ASTROLOGICA_DISCIPLINADA = IMPLEMENTADA`
- `NATAL_FACTS = IMPLEMENTADO`
- `NATAL_AUTHORIAL_DOSSIER = IMPLEMENTADO`
- `NATAL_JUDGMENT_CONTEXT = IMPLEMENTADO`
- `AUTHORIAL_EVIDENCE_GRAPH = IMPLEMENTADO`
- `AUTHORIAL_JUDGMENT_ZONES = IMPLEMENTADO`
- `OPEN_WORLD_ROUTING = IMPLEMENTADO_FAIL_CLOSED`
- `AI_PROVIDER_ADAPTER_CONTRACT = IMPLEMENTADO`
- `SERVER_SIDE_SECRET_POLICY = IMPLEMENTADA`
- `PROVIDER_INVOCATION_ENVELOPE = IMPLEMENTADO`

## Prompt Absoluto em português

Arquivo vigente:

`docs/ABSOLUTE_NATAL_PROMPT_v2_PTBR.txt`

O runtime usa exatamente o mesmo texto. O teste `runtime_prompt_matches_exported_ptbr_document` impede divergência silenciosa entre o prompt exportado e o prompt compilado no motor.

O protocolo mantém os tokens de máquina (`NATAL_FACTS`, `AUTHORIAL_DIVERGENCE`, `MISSING_ENGINE_DATA` etc.) por estabilidade de contrato, mas todo o comando, metodologia, julgamento e estilo estão em português brasileiro.

## Subjetividade do astrólogo

A subjetividade não é tratada como falha. Ela é uma etapa legítima e delimitada. Quando o motor emite `QUALITATIVE_SELECTION`, `CONTEXT_REQUIRED`, `AUTHORIAL_JUDGMENT_REQUIRED` ou uma zona equivalente, a IA pode pesar convergência, centralidade, papel do significador, repetição simbólica e contradições.

Ela não pode:

- fabricar score;
- criar algoritmo não publicado;
- recalcular o mapa;
- usar biografia conhecida para forçar confirmação;
- transformar fixtures de autores em templates;
- esconder divergência autoral.

## Integração futura com IA

Arquivo:

`src/app/lib/natalAiIntegration.ts`

Interface única:

```ts
interface NatalAiProviderAdapter {
  readonly id: string;
  judge(invocation: NatalAiProviderInvocation): Promise<NatalAiProviderResult>;
}
```

O adapter recebe uma invocação já pronta contendo:

1. Prompt Absoluto PT-BR como mensagem de sistema;
2. `NATAL_FACTS`;
3. `NATAL_AUTHORIAL_DOSSIER`;
4. `NATAL_JUDGMENT_CONTEXT`;
5. release gate;
6. contrato obrigatório da resposta;
7. política de execução.

O adapter é somente transporte. Trocar modelo/provedor não muda a astrologia.

## Gates de provedor

- `READY_FOR_PROVIDER`: validação PASS + pergunta concreta roteada;
- `AWAITING_QUESTION`: mapa pronto, mas sem pergunta concreta;
- `BLOCKED_BY_ENGINE_VALIDATION`: pacote bloqueado pela validação técnica.

`executeNatalAiWithProvider()` recusa automaticamente os dois estados não liberados.

## API / interface

`POST /api/birth-chart` devolve agora também:

`reportBundle.aiIntegration`

A interface mostra o status da integração e pode exportar `mapa-natal-invocacao-provedor-ia.json`.

Nenhum segredo de provedor é colocado no browser. Uma implementação futura deve manter chave/token exclusivamente server-side.

## Boundary de deployment

A arquitetura de IA está pronta para provider. A certificação de deployment do motor astronômico continua dependendo de executar `@swisseph/browser`/WASM e `next build` num ambiente com dependências instaladas. Isso é gate de release, não lacuna metodológica da camada de IA.

## Verificação final

`npm run verify:natal:all` passou integralmente nesta versão:

- `STRUCTURAL_ALL_COVERED = True`;
- regressões independentes: **78/78 PASS**;
- céu de estrelas fixas: **PASS**, 1.112 estrelas únicas;
- classificador físico de eclipses: **PASS**;
- referência Barra Mansa: **PASS**;
- `NATAL_ISOLATION = PASS`;
- runtime Absolute AI: **28/28 PASS**;
- UI provider-ready: **PASS**;
- TypeScript focal: **PASS**.

O gate `verify:natal:swisseph-runtime` continua corretamente em `DEPENDENCY_MISSING` porque `node_modules/@swisseph/browser` não está instalado neste ambiente.
