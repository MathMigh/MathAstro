# MathAstro Natal — contrato para conectar uma IA

## Estado

A camada natal já produz todo o input que uma IA externa precisa. O provedor de IA não deve recalcular astrologia nem reconstruir o método.

O ponto de integração é:

- `src/app/lib/natalAiIntegration.ts`
- interface `NatalAiProviderAdapter`
- função `executeNatalAiWithProvider(packageData, provider)`

## Contrato mínimo

Um provedor futuro implementa somente:

```ts
interface NatalAiProviderAdapter {
  readonly id: string;
  judge(invocation: NatalAiProviderInvocation): Promise<NatalAiProviderResult>;
}
```

O `invocation` já contém:

- Prompt Absoluto em português (`system`);
- `NATAL_FACTS`;
- `NATAL_AUTHORIAL_DOSSIER`;
- `NATAL_JUDGMENT_CONTEXT`;
- release gate;
- contrato de resposta;
- política de execução.

A chave/API secret do provedor deve permanecer **somente no servidor**. Nunca coloque chave no React/browser nem no JSON devolvido ao cliente.

## Gates

`buildNatalAiIntegrationEnvelope()` produz exatamente um dos estados:

- `READY_FOR_PROVIDER`: cálculo validado + pergunta roteada;
- `AWAITING_QUESTION`: mapa calculado, mas sem pergunta concreta;
- `BLOCKED_BY_ENGINE_VALIDATION`: pacote não pode sair para IA.

`executeNatalAiWithProvider()` recusa automaticamente os dois últimos estados.

## Regra arquitetural

O adapter é transporte, não astrologia. Ele NÃO pode:

- recalcular casas, aspectos, dignidades ou Partes;
- alterar `NATAL_FACTS`;
- criar regras ausentes;
- misturar autores;
- remover as zonas de julgamento qualitativo;
- inserir scores ocultos.

Assim, trocar o provedor/modelo não altera a metodologia natal.
