# Equipe de agentes

Um agente por thread. Todo agente de desenvolvimento segue a regra **ponytail** (YAGNI → reuso → stdlib → solução mínima) e entrega por PR. Decisões que mudam o produto vão para o usuário e viram ADR em [decisoes.md](decisoes.md).

Escopo adaptado à PWA atual (ver ADR-007). Onde o pedido original citava IA/Hermes, isso está marcado como suspenso.

| Agente | Responsabilidade | Entradas | Entregável | Pronto quando |
|---|---|---|---|---|
| **Orquestrador / PM** | Coordena, mantém roadmap e backlog, resolve conflitos, leva decisões ao usuário | Repo, pedidos do usuário, entregas dos agentes | `docs/roadmap.md`, `docs/decisoes.md`, README | Todo item do backlog tem dono e prioridade; toda decisão importante tem ADR |
| **Business Blueprint** | Visão da doceria, casos de uso, persona (o usuário), próximo escopo, métricas | Conversa com o usuário, `docs/estado-atual.md` | `docs/visao.md` | Usuário aprovou visão, escopo da fase 2 e 3 a 5 métricas mensuráveis |
| **Pesquisa técnica** | Analisar outras bases de código e dizer o que reaproveitar | Repositórios indicados pelo usuário | Relatório + matriz de reaproveitamento | Cada repo tem veredito (reusar / adaptar / ignorar) com motivo. *Suspenso até o usuário nomear os 4 repos e o Hermes* |
| **Arquitetura** | Guardar o desenho atual (motor/serviços/núcleo/telas, offline-first) e decidir mudanças estruturais | Estado atual, visão | `docs/arquitetura.md` (diagrama + stack) | Diagrama bate com o código e cada mudança proposta tem ADR |
| **UX** | Fluxos de uso das telas existentes e das novas | Visão, app rodando | Fluxos + wireframes de baixa | Fluxos principais revisados com o usuário |
| **UI** | Visual, tokens (`css/01-tokens.css`), componentes, tema escuro | Fluxos da UX | Tokens + protótipo das telas novas | Tokens únicos, contraste AA nos dois temas |
| **Backend / Integrações** | Apps Script da planilha, sincronização, ferramenta de cache | Código do Apps Script (do usuário) | `planilha/` versionado + testes da sincronização | Instalar do zero funciona seguindo o README |
| **Frontend** | Telas, núcleo, service worker | Backlog, wireframes | PRs com a funcionalidade | Funciona offline, sem erro no console, regressão passa |
| **Memória & Contexto** | Indexação, embeddings, memória longa, skills | — | — | *Suspenso: não há IA no produto (ADR-007)* |
| **Segurança & Privacidade** | PIN, Apps Script, dados no aparelho, XSS, backup | Código do app e da planilha | `docs/seguranca.md` (política + revisão) | Cada risco tem decisão (corrigir / aceitar) e as correções viraram PR |
| **QA** | Testes do motor, CI, roteiro de regressão | Código, backlog | `testes/` com `node:test`, workflow de CI, roteiro manual | CI verde na `main`; motor com testes nas regras de dinheiro (custo, preço, caixa) |

## Ordem sugerida para abrir as threads

1. **QA**: testes do motor e CI. Não depende de ninguém e protege tudo que vem depois.
2. **Backend / Integrações**: assim que o usuário enviar o Apps Script e as ferramentas.
3. **Segurança & Privacidade**: depois do Apps Script versionado.
4. **Business Blueprint**: em paralelo, só conversa com o usuário.
5. **UX → UI → Frontend**: quando a visão definir o que construir.
6. **Arquitetura**: só quando surgir mudança estrutural; hoje o desenho está documentado em `estado-atual.md`.
7. **Pesquisa técnica** e **Memória & Contexto**: só se o usuário confirmar os repos, o Hermes e a parte de IA.
