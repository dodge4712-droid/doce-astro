import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../js/motor/index.js';
import { ctx, INGREDIENTES } from './dados.mjs';

test('saldo é a soma dos registros e a validade é a do lote mais próximo', () => {
  const s = C.saldosEstoque([
    { item: 'ing:farinha', qtd: 1000, data: '2026-03-01', validade: '2026-06-01' },
    { item: 'ing:farinha', qtd: 1000, data: '2026-03-02', validade: '2026-05-01' },
    { item: 'ing:farinha', qtd: -300, data: '2026-03-03' },
    { item: 'ing:farinha', qtd: 50, data: '2026-03-04', excluidoEm: 'x' }
  ]);
  assert.equal(s['ing:farinha'].qtd, 1700);
  assert.equal(s['ing:farinha'].validade, '2026-05-01');
});

test('quando o item zera, as validades antigas somem', () => {
  const s = C.saldosEstoque([
    { item: 'ing:acucar', qtd: 500, data: '2026-03-01', validade: '2026-04-01' },
    { item: 'ing:acucar', qtd: -500, data: '2026-03-02' },
    { item: 'ing:acucar', qtd: 200, data: '2026-03-03', validade: '2026-09-01' }
  ]);
  assert.equal(s['ing:acucar'].validade, '2026-09-01');
});

test('contagem com validade substitui as anteriores', () => {
  const s = C.saldosEstoque([
    { item: 'x', qtd: 5, data: '2026-03-01', validade: '2026-03-10' },
    { item: 'x', qtd: 0, motivo: 'ajuste', data: '2026-03-02', validade: '2026-08-01' }
  ]);
  assert.equal(s.x.validade, '2026-08-01');
});

test('quando dar baixa no estoque ao mudar o status do pedido', () => {
  assert.equal(C.acaoBaixaPedido('confirmado', 'producao', false, false), 'criar');
  assert.equal(C.acaoBaixaPedido('producao', 'pronto', true, false), 'nada');
  assert.equal(C.acaoBaixaPedido('producao', 'pronto', true, true), 'atualizar');
  assert.equal(C.acaoBaixaPedido('pronto', 'confirmado', true, false), 'remover');
  assert.equal(C.acaoBaixaPedido('producao', 'cancelado', true, false), 'nada');
  assert.equal(C.acaoBaixaPedido('entregue', 'entregue', false, false), 'nada'); // não desconta pedido antigo
});

test('lista de compras desconta o que já tem', () => {
  const [farinha] = C.comprasComEstoque({ farinha: { ingredienteId: 'farinha', qtdBase: 1500 } }, { 'ing:farinha': { qtd: 700 } }, INGREDIENTES);
  assert.equal(farinha.tem, 700);
  assert.equal(farinha.falta, 800);
  assert.equal(farinha.embalagensFalta, 1);
  assert.equal(farinha.custoFalta, 10);
});

test('baixa do pedido em gramas', () => {
  const p = { itens: [{ tipo: 'rec', receitaId: 'bolo', variacaoId: 'fatia', qtd: 2 }] };
  const b = C.baixaDoPedido(p, ctx());
  assert.ok(Math.abs(b.farinha - 100) < 1e-9);
  assert.ok(Math.abs(b.acucar - 40) < 1e-9);
});

test('situação: negativo, abaixo do mínimo, vencido e vencendo', () => {
  assert.equal(C.situacaoEstoque({ qtd: -1 }, 0).negativo, true);
  assert.equal(C.situacaoEstoque({ qtd: 2 }, 5).abaixoMinimo, true);
  assert.equal(C.situacaoEstoque({ qtd: 2, validade: '2026-03-01' }, 0, '2026-03-02', 3).vencido, true);
  assert.equal(C.situacaoEstoque({ qtd: 2, validade: '2026-03-04' }, 0, '2026-03-02', 3).venceLogo, true);
});
