# Método Absoluto de Horária — Marcos + Frawley + Gugu — v2.0

Esta versão consolida a arquitetura final do método em quatro camadas: **semântica humana → compilação de casas → cálculo/julgamento determinístico → síntese interpretativa controlada**.

A implementação executável do ensino à IA é o arquivo `src/traditions/western/horary/aiHandoff.ts`, constante `HORARY_ABSOLUTE_AI_SYSTEM_PROMPT`, versão `MATHASTRO-HORARY-AI-PTBR-v3.0`. O espelho legível está em `docs/PROMPT_ABSOLUTO_HORARIA_IA_PTBR_v3.0.md`.

## 1. O que é fechado pelo motor

- nascimento/aceitação da pergunta e gates de contexto;
- casas Regiomontanus e regentes tradicionais;
- atlas semântico das 12 casas e turning recursivo;
- significadores, dignidades essenciais e acidentais separadas;
- recepções direcionais;
- aspectos, aplicação/separação e perfeição sem gate arbitrário por orbe;
- Lua, VOC e sequência lunar;
- antíscios/contra-antíscios;
- tradução, coleta, proibição e demais mediações materializadas;
- cronologia Swiss Ephemeris, estações, ingressos e contatos solares;
- módulos tópicos e contratos de segurança;
- dossiê neutro e auditável para IA.

## 2. O que permanece legitimamente interpretativo

O mundo humano não pode ser reduzido a presets. A pergunta “problema financeiro com vizinho”, por exemplo, precisa primeiro ser entendida: dívida? dinheiro dele? dinheiro do querente? dano ao imóvel? litígio? A IA/astrólogo resolve esse significado, mas o motor calcula a casa resultante e impede adivinhação lexical.

A mesma disciplina vale para perspectiva em eleições, relações familiares complexas, escolhas, default da situação, relevância de símbolos descritivos e unidade de timing.

## 3. Como a IA é ensinada

O Prompt Absoluto v3.0 contém o procedimento integral e protocolos tópicos. Ele ensina a distinguir evento de estado; recepção de perfeição; condição intrínseca de capacidade de agir; passado de futuro; arco simbólico de tempo efemérico; contato principal de decoração; regra canônica de variante de fonte.

Também contém protocolos para relacionamentos, trabalho, dinheiro/pagamento/dívida, investimentos/apostas/loteria, herança/impostos, imóveis, objetos perdidos, furto, desaparecidos, processos/competições/eleições, viagem/estudo, saúde, gravidez, morte, prisão, sonhos/verdade, serviços/comunicação/entrega, governo, adoção e perguntas de escolha.

## 4. Fontes

Hierarquia: Marcos Monteiro → John Frawley → Gugu como suplemento explícito → contratos MathAstro. Quando uma técnica de Gugu diverge do canônico Marcos/Frawley, a divergência é declarada e não mesclada silenciosamente.

A base `aiKnowledgeBase.ts` fornece resumos curados de fonte como fallback. O RAG externo, quando conectado, pode recuperar o corpus primário por `requiredSourceIds`.

## 5. Regra de fechamento

Uma horária pode terminar em julgamento, descrição, pedido de clarificação ou regra-fonte necessária. Completo não significa “inventar uma resposta para qualquer frase”; significa que **nenhuma situação é resolvida por fallback silencioso fora do método**.

## 6. Limite epistemológico

Nenhum prompt garante acerto absoluto em toda consulta. O desenho busca máxima reprodutibilidade e fidelidade metodológica: cálculo objetivo é travado, interpretação é auditada, fontes são rastreadas e a subjetividade residual é declarada.
