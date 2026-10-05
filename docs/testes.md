# Plano de testes

Regra ponytail: só `node:test` e `node:assert`, nada para instalar. Teste de tela fica no roteiro manual até haver um motivo real para automatizar (ADR-005).

## O que roda sozinho

| O quê | Onde | Como rodar |
|---|---|---|
| Sintaxe de todos os `.js` | CI | `find . -path ./.git -prune -o \( -name '*.js' -o -name '*.mjs' \) -print0 \| xargs -0 -n1 node --check` |
| Testes do motor (regras de dinheiro) | `testes/*.test.mjs` | `node --test` na raiz do repositório (Node 22) |

O CI (`.github/workflows/testes.yml`) roda os dois em todo PR e em todo push na `main`, com o fuso de São Paulo.

### Cobertura atual do motor

| Arquivo de teste | Regras |
|---|---|
| `receitas.test.mjs` | custo do lote (ingredientes, perda, diretos, fixos, mão de obra), markup x margem, preço sugerido com taxas, preço praticado e prejuízo, receita dentro de receita, ciclo, unidade errada |
| `pedidos.test.mjs` | total, entrega, desconto, pago/parcial/excedente, centavos, lucro sem a entrega, taxa do cartão, lista de produção e compras |
| `caixa.test.mjs` | movimentos (sem excluídos e sem reserva), resumo com retirada x despesa, filtros, períodos, gráfico, CSV (negativo e proteção contra fórmula) |
| `estoque.test.mjs` | saldo, validade, contagem, baixa por status do pedido, compras descontando o estoque, situação do item |
| `financeiro.test.mjs` | meses, vencimento no fim do mês, média de contas fixas, recorrentes sem duplicar, status da conta, a receber, reserva, pró-labore disponível |
| `basicos.test.mjs` | números no formato brasileiro, moeda, unidades, datas, leitura de CSV, importar compras, compra no histórico de preço, nomes das tabelas no backup |

Os dados de exemplo ficam em `testes/dados.mjs`, com as contas feitas à mão nos comentários.

### Ao mudar o motor

1. Todo bug de cálculo ganha um teste que falha antes da correção.
2. Toda regra nova de dinheiro (custo, preço, caixa) entra com teste no mesmo PR.
3. PR só vai para merge com o CI verde.

## Roteiro manual (antes de publicar uma versão)

Rodar no celular, com o app instalado, em uma planilha de teste. Marcar o que passou; o que falhar vira issue.

### Telas

- [ ] **Boas-vindas**: escolher modo demo; escolher modo planilha com URL e PIN.
- [ ] **Início**: resumo do dia bate com pedidos e caixa.
- [ ] **Ingredientes**: criar, editar preço, ver histórico e variação.
- [ ] **Receitas**: criar com ingrediente e com outra receita; perda; opção de venda; preço sugerido muda ao trocar margem/markup e taxas.
- [ ] **Cardápio** e **Cardápio em imagem**: montar, exportar JPG para WhatsApp e Stories.
- [ ] **Clientes**: criar, ver pedidos da cliente.
- [ ] **Pedidos**: criar, adicionar itens, entrega e desconto, sinal, mudar status até entregue, mensagem de WhatsApp.
- [ ] **Agenda** e **Produção**: pedidos aparecem no dia certo; quantidades por receita.
- [ ] **Compras** e **Importar compras**: lista desconta o estoque; baixar modelo CSV, preencher e importar.
- [ ] **Estoque** e **Vitrine**: contagem, perda, validade vencendo; venda da vitrine entra no caixa.
- [ ] **Caixa** e **Lançamento**: entrada e saída à mão, filtros, gráfico, exportar CSV.
- [ ] **Contas**: conta avulsa e recorrente, marcar como paga.
- [ ] **Receber**: fiado por cliente, texto de cobrança.
- [ ] **Pró-labore**: valor disponível, registrar retirada; reserva.
- [ ] **Relatórios**: mês atual x anterior, ponto de equilíbrio, CSV.
- [ ] **Ajustes**: custos fixos, mão de obra, taxas, tema e fonte, trocar PIN.
- [ ] **Backup**: exportar; importar o mesmo arquivo; a confirmação lista todas as tabelas sem "undefined".

### Offline e sincronização

- [ ] Modo avião: abrir o app, criar um pedido, fechar e reabrir; o pedido continua lá.
- [ ] Voltar a internet: a fila envia sozinha e a planilha recebe o pedido.
- [ ] Dois aparelhos: editar o mesmo pedido nos dois sem internet, sincronizar; aparece o conflito e dá para restaurar a versão perdida.
- [ ] PIN errado: o app avisa e não perde as alterações da fila.
- [ ] Nova versão publicada: o aviso de atualização aparece e, depois de atualizar, a versão em Ajustes muda.
