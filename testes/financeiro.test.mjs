import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../js/motor/index.js';
import { ctx } from './dados.mjs';

test('meses: somar, limites e nome', () => {
  assert.equal(C.somarMeses('2026-01', -1), '2025-12');
  assert.deepEqual(C.limitesMes('2028-02'), { de: '2028-02-01', ate: '2028-02-29' });
  assert.equal(C.nomeMes('2026-03'), 'março de 2026');
});

test('vencimento no dia 31 cai no último dia do mês', () => {
  assert.equal(C.vencimentoNoMes('2026-02', 31), '2026-02-28');
  assert.equal(C.vencimentoNoMes('2026-04', 31), '2026-04-30');
});

test('média das contas fixas dos 3 meses completos anteriores', () => {
  const l = [
    { tipo: 'saida', categoria: 'Contas fixas', valor: 300, data: '2026-02-10', descricao: 'Luz' },
    { tipo: 'saida', categoria: 'contas fixas', valor: 500, data: '2026-03-10', descricao: 'Luz' },
    { tipo: 'saida', categoria: 'Contas fixas', valor: 999, data: '2026-04-02', descricao: 'Mês atual' },
    { tipo: 'saida', categoria: 'Ingredientes', valor: 999, data: '2026-03-02' }
  ];
  const m = C.mediaContasFixas(l, '2026-04-15');
  assert.equal(m.considerados, 2); // janeiro sem lançamento não entra na média
  assert.equal(m.media, 400);
});

test('contas recorrentes: no máximo 3 meses para trás e sem duplicar', () => {
  const rec = [{ id: 'r1', descricao: 'Aluguel', valor: 800, dia: 5, inicio: '2026-01' }];
  const novas = C.contasRecorrentesAGerar(rec, { 'rec:r1:2026-04': {} }, '2026-05-10');
  assert.deepEqual(novas.map(c => c.id), ['rec:r1:2026-03', 'rec:r1:2026-05']);
  assert.equal(novas[0].vencimento, '2026-03-05');
  assert.deepEqual(C.contasRecorrentesAGerar([{ ...rec[0], ativa: false }], {}, '2026-05-10'), []);
});

test('status da conta a pagar', () => {
  const lanc = { l1: { data: '2026-03-04', valor: 800 } };
  assert.equal(C.statusConta({ lancamentoId: 'l1', vencimento: '2026-03-05' }, lanc, '2026-03-10').status, 'paga');
  assert.equal(C.statusConta({ vencimento: '2026-03-05' }, {}, '2026-03-10').status, 'vencida');
  assert.equal(C.statusConta({ vencimento: '2026-03-10' }, {}, '2026-03-10').status, 'hoje');
  assert.equal(C.statusConta({ vencimento: '2026-03-11' }, {}, '2026-03-10').status, 'aberta');
});

test('a receber: só pedidos confirmados em diante, agrupados por cliente', () => {
  const it = [{ tipo: 'avulso', qtd: 1, precoUnit: 100 }];
  const r = C.aReceber([
    { id: 'a', clienteId: 'c1', clienteNome: 'Ana', status: 'entregue', itens: it, pagamentos: [{ valor: 30 }] },
    { id: 'b', clienteId: 'c1', clienteNome: 'Ana', status: 'confirmado', itens: it },
    { id: 'c', clienteId: 'c2', status: 'orcamento', itens: it },
    { id: 'd', clienteId: 'c3', status: 'cancelado', itens: it }
  ], ctx());
  assert.equal(r.grupos.length, 1);
  assert.equal(r.grupos[0].total, 170);
  assert.equal(r.entregue, 70);
  assert.equal(r.aberto, 100);
});

test('reserva: saldo com resgates e quanto falta guardar no mês', () => {
  const l = [
    { tipo: 'reserva', valor: 200, data: '2026-03-01' },
    { tipo: 'reserva', valor: -50, data: '2026-03-05' },
    { tipo: 'reserva', valor: 100, data: '2026-02-01' }
  ];
  const r = C.resumoReserva(l, { reservaPct: 10 }, '2026-03', 3000);
  assert.equal(r.saldo, 250);
  assert.equal(r.guardadoMes, 200);
  assert.equal(r.sugeridoMes, 300);
  assert.equal(r.faltaGuardar, 100);
});

test('pró-labore disponível: parte da mão de obra liberada pelo que foi pago', () => {
  // fatia leva 1,50 de mão de obra (15 por hora ÷ 10 fatias)
  const p = { id: 'p', status: 'entregue', itens: [{ tipo: 'rec', receitaId: 'bolo', variacaoId: 'fatia', qtd: 10, precoUnit: 8 }], pagamentos: [{ valor: 40 }] };
  const r = C.proLaboreDisponivel([p], [{ tipo: 'saida', categoria: 'Pró-labore', valor: 5, data: '2026-03-01' }], ctx());
  assert.equal(r.liberado, 7.5); // 15 × metade paga
  assert.equal(r.aLiberar, 7.5);
  assert.equal(r.retirado, 5);
  assert.equal(r.disponivel, 2.5);
});
