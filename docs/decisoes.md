# Registro de decisões (ADRs)

Formato: contexto, decisão, consequência. Status: **aceita**, **proposta** (aguarda o usuário) ou **substituída**.

## ADR-001: PWA estática, sem build e sem dependências (aceita, já em uso)
- Contexto: app de uso pessoal da doceria, no celular, precisa abrir sem internet.
- Decisão: HTML + CSS + JavaScript com módulos ES, servidos como arquivos estáticos; service worker para offline.
- Consequência: nada para instalar ou atualizar; qualquer biblioteca nova precisa de ADR.

## ADR-002: Offline-first com Planilha do Google como servidor (aceita, já em uso)
- Contexto: um ou mais aparelhos, sem custo de servidor.
- Decisão: dados em IndexedDB + diário no localStorage; sincronização por fila com um Apps Script protegido por PIN; conflito resolvido por `atualizadoEm`, com a versão perdida guardada para restaurar.
- Consequência: a planilha é a fonte compartilhada; o código do Apps Script faz parte do produto e precisa estar versionado (backlog #1).

## ADR-003: Camadas motor / serviços / núcleo / telas (aceita, já em uso)
- Decisão: cálculo puro em `js/motor/` (sem DOM, entrada única `index.js`); estado e IO no núcleo; telas só desenham e disparam ações.
- Consequência: regras de dinheiro testáveis no Node; telas não fazem conta.

## ADR-004: Regra ponytail para todos os agentes de desenvolvimento (aceita, pelo usuário)
- Decisão: YAGNI → reuso → biblioteca padrão → solução mínima.
- Consequência: sem framework novo, sem camada nova, sem item no backlog que não resolva um problema real.

## ADR-005: Testes com `node:test` sobre o motor (proposta)
- Contexto: não há testes no repo; o motor já roda no Node.
- Decisão: testes em `testes/*.test.js` com o runner nativo do Node; CI no GitHub Actions rodando `node --check` e `node --test`.
- Consequência: zero dependência; testes de tela ficam no roteiro manual até haver necessidade real.

## ADR-006: Mudanças por PR, não por upload na `main` (aceita, pelo usuário em 05/10/2026)
- Contexto: os 18 commits até hoje são uploads direto na `main`, sem revisão nem CI.
- Decisão: cada agente trabalha em branch e abre PR; o usuário aprova o merge.
- Consequência: histórico legível e CI antes de chegar ao celular.

## ADR-007: Escopo é só o app da doceria (aceita, pelo usuário em 05/10/2026)
- Contexto: a tabela de agentes do pedido descrevia um assistente de IA local (memória/RAG, indexação do computador, roteamento de modelos, CLIs de IA, MCP) e outros repositórios.
- Decisão: o projeto é apenas o app Espaço Nave deste repositório. Assistente de IA e outros repositórios ficam fora.
- Consequência: não há agentes de Pesquisa técnica nem de Memória & Contexto; os demais papéis valem para a PWA.

## ADR-008: Hermes fora do projeto (aceita, pelo usuário em 05/10/2026)
- Decisão: ignorar tudo que se refere ao Hermes (análise, integração, arquitetura).
- Consequência: nenhum agente estuda nem integra o Hermes.
