import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../js/motor/index.js';

const pedidos = [
  { id: 'p1', status: 'entregue', clienteNome: 'Ana', pagamentos: [{ id: 'a', tipo: 'sinal', valor: 40, data: '2026-03-02' }] },
  { id: 'p2', excluidoEm: '2026-03-03', pagamentos: [{ valor: 999, data: '2026-03-03' }] }
];
const lancamentos = [
  { id: 'l1', tipo: 'saida', valor: 30, data: '2026-03-05', categoria: 'Ingredientes' },
  { id: 'l2', tipo: 'saida', valor: 20, data: '2026-03-06', categoria: 'Pró-labore' },
  { id: 'l3', tipo: 'reserva', valor: 100, data: '2026-03-06' },
  { id: 'l4', tipo: 'entrada', valor: 15, data: '2026-03-07', categoria: 'Venda de balcão', excluidoEm: '2026-03-08' }
];

test('movimentos junta pagamentos e lançamentos, sem excluídos nem reserva', () => {
  const m = C.movimentos(pedidos, lancamentos);
  assert.deepEqual(m.map(x => x.id), ['l2', 'l1', 'pg:p1:a']);
  assert.equal(m[2].descricao, 'Sinal do pedido de Ana');
});

test('resumo do caixa separa retirada de despesa', () => {
  const r = C.resumoCaixa(C.movimentos(pedidos, lancamentos));
  assert.equal(r.entradas, 40);
  assert.equal(r.saidas, 50);
  assert.equal(r.retiradas, 20);
  assert.equal(r.despesas, 30);
  assert.equal(r.saldo, -10);
  assert.equal(r.lucro, 10);
});

test('filtro por período, tipo e busca sem acento', () => {
  const m = C.movimentos(pedidos, lancamentos);
  assert.equal(C.filtrarMovimentos(m, { de: '2026-03-05', ate: '2026-03-05' }).length, 1);
  assert.equal(C.filtrarMovimentos(m, { tipo: 'entrada' }).length, 1);
  assert.equal(C.filtrarMovimentos(m, { busca: 'pro-labore' }).length, 1);
});

test('períodos prontos', () => {
  assert.deepEqual(C.periodoPreset('mes', '2026-02-15'), { de: '2026-02-01', ate: '2026-02-28' });
  assert.deepEqual(C.periodoPreset('mesPassado', '2026-01-10'), { de: '2025-12-01', ate: '2025-12-31' });
  assert.deepEqual(C.periodoPreset('7dias', '2026-03-03'), { de: '2026-02-25', ate: '2026-03-03' });
});

test('gráfico agrupa por dia, semana ou mês', () => {
  assert.equal(C.agruparPeriodo([], '2026-03-01', '2026-03-31').modo, 'dia');
  assert.equal(C.agruparPeriodo([], '2026-01-01', '2026-03-31').modo, 'semana');
  const ano = C.agruparPeriodo(C.movimentos(pedidos, lancamentos), '2026-01-01', '2026-12-31');
  assert.equal(ano.baldes.length, 12);
  assert.equal(ano.baldes[2].saidas, 50);
});

test('CSV: saída negativa, número negativo intacto, fórmula neutralizada', () => {
  const csv = C.csvMovimentos([
    { tipo: 'saida', data: '2026-03-05', valor: 30, fonte: 'Ingredientes', descricao: '=HYPERLINK("x")', forma: 'pix' }
  ]);
  assert.ok(csv.startsWith('﻿'));
  const linha = csv.split('\r\n')[1];
  assert.match(linha, /^05\/03\/2026;Saída;Ingredientes;/);
  assert.ok(linha.endsWith(';Pix;-30,00'));
  assert.ok(linha.includes(`"'=HYPERLINK(""x"")"`));
});
