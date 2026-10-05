import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../js/motor/index.js';
import { ctx, perto } from './dados.mjs';

// 10 fatias a 8 = 80; entrega 10; desconto 5 → total 85. Custo da fatia 3,80.
function pedido(extra) {
  return Object.assign({
    id: 'p1', status: 'confirmado', clienteNome: 'Ana', dataEntrega: '2026-10-10',
    itens: [{ id: 'i1', tipo: 'rec', receitaId: 'bolo', variacaoId: 'fatia', nome: 'Fatia', qtd: 10, precoUnit: 8 }],
    tipoEntrega: 'entrega', taxaEntrega: 10, desconto: 5, formaPagamento: 'credito',
    pagamentos: [{ id: 'pg1', tipo: 'sinal', valor: 40, data: '2026-10-01', forma: 'pix' }]
  }, extra);
}

test('totais, saldo e situação do pedido', () => {
  const c = C.calcularPedido(pedido(), ctx());
  assert.equal(c.subtotal, 80);
  assert.equal(c.total, 85);
  assert.equal(c.pago, 40);
  assert.equal(c.restante, 45);
  assert.equal(c.situacao, 'parcial');
  assert.equal(c.sinalSugerido, 42.5); // 50% padrão
  perto(c.custo, 38, 'custo');
});

test('lucro desconta custo, taxa do cartão e deixa a entrega de fora', () => {
  const c = C.calcularPedido(pedido(), ctx());
  perto(c.taxaPagamento, 85 * 0.0498, 'taxa do crédito');
  perto(c.lucro, 85 - 10 - 38 - 85 * 0.0498, 'lucro');
  perto(c.margem, c.lucro / 75, 'margem sobre o valor sem entrega');
});

test('retirada não cobra taxa de entrega', () => {
  assert.equal(C.calcularPedido(pedido({ tipoEntrega: 'retirada' }), ctx()).total, 75);
});

test('desconto maior que o pedido não deixa total negativo', () => {
  assert.equal(C.calcularPedido(pedido({ desconto: 500 }), ctx()).total, 0);
});

test('pago, excedente e pendente', () => {
  assert.equal(C.calcularPedido(pedido({ pagamentos: [{ valor: 85 }] }), ctx()).situacao, 'pago');
  assert.equal(C.calcularPedido(pedido({ pagamentos: [{ valor: 90 }] }), ctx()).situacao, 'excedente');
  assert.equal(C.calcularPedido(pedido({ pagamentos: [] }), ctx()).situacao, 'pendente');
});

test('centavos somados não deixam saldo fantasma', () => {
  const c = C.calcularPedido(pedido({ desconto: 0, taxaEntrega: 0, itens: [{ tipo: 'avulso', qtd: 3, precoUnit: 0.1 }], pagamentos: [{ valor: 0.1 }, { valor: 0.2 }] }), ctx());
  assert.equal(c.restante, 0);
  assert.equal(c.situacao, 'pago');
});

test('item sem custo conhecido deixa o lucro em branco', () => {
  const c = C.calcularPedido(pedido({ itens: [{ tipo: 'avulso', qtd: 1, precoUnit: 10 }] }), ctx());
  assert.equal(c.custo, null);
  assert.equal(c.lucro, null);
});

test('necessidades: quanto produzir e quanto comprar', () => {
  const nx = C.necessidades([pedido()], ctx());
  perto(nx.producao.bolo.qtdBase, 10, 'fatias');
  perto(nx.compras.farinha.qtdBase, 500, 'farinha (g)');
  perto(nx.compras.acucar.qtdBase, 200, 'açúcar (g)');
  assert.equal(nx.compras.farinha.embalagens, 1);
  perto(nx.compras.farinha.custoProporcional, 5);
  assert.deepEqual(nx.avisos, []);
});

test('necessidades avisa quando a opção de venda sumiu', () => {
  const p = pedido();
  p.itens[0].variacaoId = 'nao-existe';
  assert.equal(C.necessidades([p], ctx()).avisos.length, 1);
});

test('taxa por forma de pagamento', () => {
  const cfg = C.mesclarConfig({});
  assert.equal(C.taxaFormaPct(cfg, 'pix'), 0);
  assert.equal(C.taxaFormaPct(cfg, 'debito'), 1.99);
  assert.equal(C.taxaFormaPct(cfg, 'app'), 23);
});
