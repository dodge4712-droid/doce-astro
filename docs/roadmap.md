# Roadmap e backlog

Regra para todo item: **ponytail** (YAGNI → reuso → stdlib → solução mínima). Nada entra sem um problema real da doceria por trás.

## Roadmap

| Fase | Objetivo | Sai quando |
|---|---|---|
| **0. Base** (agora) | Repositório completo e confiável: tudo que o app precisa está versionado, há testes do motor e CI. | Itens P0 fechados. |
| **1. Proteção** | Revisão de segurança e roteiro de regressão das telas, para mexer no app sem medo. | Itens P1 fechados. |
| **2. Evolução** | Novas funções escolhidas pela visão de negócio (o que mais dói no dia a dia da doceria). | Visão + escopo aprovados pelo usuário e primeiras entregas em produção. |

## Backlog priorizado

| # | Prioridade | Item | Agente | Depende de |
|---|---|---|---|---|
| 1 | P0 | Versionar o código do Apps Script (servidor da planilha) em `planilha/` | Backend | Usuário enviar o código |
| 2 | P0 | Versionar `ferramentas/atualizar-cache.js` e os testes que já existem fora do repo | Backend / QA | Usuário enviar os arquivos |
| 3 | P0 | README curto: rodar localmente, publicar, instalar a planilha | Orquestrador | 1, 2 |
| 4 | P0 | Testes do motor com `node:test` (receitas, pedidos, estoque, caixa, financeiro) | QA | — |
| 5 | P0 | CI no GitHub Actions: `node --check` + `node --test` | QA | 4 |
| 6 | P0 | Passar a trabalhar por PR em vez de upload direto na `main` | Orquestrador | Decisão do usuário (ADR-006) |
| 7 | P1 | Corrigir nomes faltantes na confirmação de importar backup (`js/telas/ajustes.js:137`) | Frontend | — |
| 8 | P1 | Revisão de segurança: PIN, Apps Script, XSS nos `innerHTML`, backup | Segurança | 1 |
| 9 | P1 | Roteiro de regressão manual das 21 telas + offline/sincronização/conflito | QA | — |
| 10 | P2 | Documento de visão: o que a doceria precisa a seguir, métricas de sucesso | Business Blueprint | — |
| 11 | P2 | Auditoria de fluxos (pedido → produção → estoque → caixa) | UX | 10 |
| 12 | P2 | Revisão dos tokens e dos 14 CSS (ex.: absorver `99-ajustes-finais.css`) | UI | 11 |

Itens fora do backlog até o usuário confirmar (ADR-007): memória/RAG, indexação do computador, roteamento de modelos, conectores de e-mail/agenda, CLIs de IA, MCP, Hermes.
