# Estado atual do projeto (05/10/2026)

## O que é

**Espaço Nave — Doce Astro** (versão 6.2.0): app de gestão da doceria Doce Astro. É uma PWA instalável no celular, funciona sem internet e sincroniza com uma Planilha do Google.

Cobre: receitas (custo, markup, margem), ingredientes e histórico de preço, pedidos (pagamentos, WhatsApp), agenda, produção, estoque e vitrine, compras (inclusive importação CSV), caixa (entradas, saídas, relatórios, ponto de equilíbrio), contas a pagar e a receber, pró-labore e reserva, clientes, cardápio exportado em JPG (WhatsApp e Stories), backup em JSON.

## Como está construído

| Camada | Pasta | Papel |
|---|---|---|
| Motor | `js/motor/` (19 arquivos) | Cálculo puro, sem DOM. Ponto único: `js/motor/index.js` (104 funções/constantes exportadas). Roda no Node. |
| Serviços | `js/servicos/` (5) | Regras que leem/gravam o estado (estoque, caixa, financeiro, pedidos, cardápio). |
| Núcleo | `js/nucleo/` (11) | Estado (`S`), armazenamento, sincronização, rotas, ações, ganchos, interface. |
| Telas | `js/telas/` (21) | HTML gerado por string, ações por `data-acao`. |
| Estilos | `css/` (14) | Ordem pelo número no nome; tokens em `01-tokens.css`. |
| Casca offline | `sw.js`, `manifest.webmanifest` | Cache da casca, atualização em segundo plano. |

- **Sem build e sem dependências**: JavaScript puro com módulos ES, servido como arquivos estáticos.
- **Dados no aparelho**: IndexedDB (`espaco-nave`) + diário de segurança no localStorage, reaplicado ao abrir.
- **Sincronização**: `POST` para um Google Apps Script com PIN (`js/nucleo/sincronizacao.js`), fila de alterações, detecção de conflito por `atualizadoEm` e tela para restaurar a versão perdida.
- **Modos**: "demo" (só no aparelho) ou "planilha".

## Saúde do código (verificado)

- Todos os 59 arquivos JS passam em `node --check`.
- `import('./js/motor/index.js')` funciona no Node: o motor pode ser testado sem navegador.
- Histórico: 18 commits de 25/09 a 03/10/2026, todos "Add files via upload" direto na `main`. Sem PRs, sem CI.

## O que falta no repositório

1. **Servidor da planilha (Apps Script)**: o app chama ações `sync` e `trocarPin` e manda rodar a função `instalar`, mas esse código não está no repo.
2. **`ferramentas/atualizar-cache.js`**: `sw.js` diz que a versão e a lista de arquivos são geradas por ele; não existe aqui.
3. **Testes automatizados**: `js/app.js` expõe `window.__EN` "para os testes automatizados"; os testes não estão aqui.
4. **README**: não há instruções de como rodar, publicar ou instalar a planilha.

## Problemas encontrados na leitura

- Importar backup: o texto de confirmação não tem nome para `contasPagar` e `recorrencias` (`js/telas/ajustes.js:137`), então pode aparecer "undefined" na mensagem.
- O PIN fica guardado em texto no aparelho (`S.meta.pin`, IndexedDB/localStorage) e viaja no corpo da requisição. Aceitável para uso pessoal; vale registro na revisão de segurança.

## Divergência com o pedido de organização

A tabela de agentes do pedido fala em memória/RAG, indexação do computador, roteamento de modelos, CLIs de IA, MCP, "os 4 repositórios" e o "Hermes". **Nada disso existe neste repositório**, que é a PWA da doceria. Ver ADR-007 em [decisoes.md](decisoes.md): os papéis foram adaptados à PWA até o usuário confirmar.
