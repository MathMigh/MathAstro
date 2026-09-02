# MathAstro Natal — Hardening 2026-08-28

Escopo deliberado: Natal apenas.

## Correções de produção

- casa geométrica e casa efetiva separadas e propagadas;
- Saturno do caso Manaus 1999 efetivamente resolvido na VI quando aplicável à regra de cúspide;
- ingresso anterior não pode mais produzir transição impossível `signo→mesmo signo`;
- carry sexagesimal elimina `60″`;
- distância de Anareta normalizada em torno da cúspide VIII;
- orbe de influência Marcos separada da regra de cúspide;
- aspectos largos permanecem geometria/Frawley-context, não vazam para Marcos;
- nodo: somente conjunção; raw distances preservadas; sem orbe Marcos inventado;
- condição solar separada Marcos/Frawley;
- testemunhos solares separados por autor;
- catálogo estelar completo separado dos contatos interpretativos;
- orbes estelares separadas por fonte;
- aliases/objetos deep-sky tratados explicitamente;
- Gugu recebe geometria raw ampliada e orientação lunar específica;
- gaps de fonte formalizados e auditados;
- critério profissional não verificado de Frawley permanece desabilitado;
- scores auxiliares recebem proveniência explícita e são excluídos da saída limpa da IA;
- API mantém relatório IA / relatório auditoria / JSON IA / JSON auditoria / validação separados;
- liberação para IA é fail-closed.
