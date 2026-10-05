import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../js/motor/index.js';
import { ctx, perto, receitaBolo } from './dados.mjs';

test('markup e margem são o inverso um do outro', () => {
  assert.equal(C.markupParaMargem(1), 0.5);
  assert.equal(C.margemParaMarkup(0.5), 1);
  assert.equal(C.margemParaMarkup(1), null); // margem de 100% não tem markup
});

test('custo do lote soma ingredientes, diretos, fixos e mão de obra', () => {
  const r = C.calcularReceita(receitaBolo(), ctx());
  perto(r.custoIngredientes, 6, 'ingredientes');
  perto(r.diretos, 2, 'diretos');
  perto(r.fixos, 10, 'fixos');
  perto(r.maoObra, 15, 'mão de obra');
  perto(r.custoLote, 33, 'lote');
  perto(r.custoPorBase, 3.3, 'por unidade');
  perto(r.precoInternoPorBase, 3.3 / 0.6, 'preço interno com margem 40%');
  assert.deepEqual(r.avisos, []);
});

test('perda aumenta o custo dos ingredientes', () => {
  const rec = Object.assign(receitaBolo(), { perdaPct: 20 });
  perto(C.calcularReceita(rec, ctx()).perdaValor, 1.5); // 6 / 0,8 − 6
});

test('perda de 100% gera aviso em vez de dividir por zero', () => {
  const rec = Object.assign(receitaBolo(), { perdaPct: 100 });
  const r = C.calcularReceita(rec, ctx());
  assert.ok(r.avisos.includes('Perda precisa ser menor que 100%.'));
  assert.ok(Number.isFinite(r.custoLote));
});

test('preço sugerido no modo margem e no modo markup', () => {
  const v = C.calcularReceita(receitaBolo(), ctx()).variacoes[0];
  perto(v.custo, 3.8, 'custo da fatia (3,30 + 0,50 de embalagem)');
  perto(v.precoSugerido, 3.8 / 0.6, 'margem 40%');
  perto(v.lucro, 3.8 / 0.6 - 3.8, 'lucro');
  perto(v.margemReal, 0.4, 'margem real');

  const rec = Object.assign(receitaBolo(), { precificacao: { modo: 'markup', valor: 100 } });
  perto(C.calcularReceita(rec, ctx()).variacoes[0].precoSugerido, 7.6, 'markup 100%');
});

test('taxa do cartão entra no preço sugerido', () => {
  const rec = Object.assign(receitaBolo(), { taxas: { cartao: 'credito', entrega: true } });
  const v = C.calcularReceita(rec, ctx()).variacoes[0];
  // padrão: crédito 4,98% e entrega 8
  perto(v.precoSugerido, (3.8 + 8) / (1 - 0.4 - 0.0498));
  perto(v.margemReal, 0.4);
});

test('margem + taxas acima de 100% avisa e não inventa preço', () => {
  const rec = Object.assign(receitaBolo(), { precificacao: { modo: 'margem', valor: 99 }, taxas: { cartao: 'credito' } });
  const v = C.calcularReceita(rec, ctx()).variacoes[0];
  assert.equal(v.precoSugerido, undefined);
  assert.match(v.aviso, /passam de 100%/);
});

test('preço praticado prevalece e prejuízo é marcado', () => {
  const rec = receitaBolo();
  rec.variacoes[0].precoPraticado = 3;
  const v = C.calcularReceita(rec, ctx()).variacoes[0];
  assert.equal(v.preco, 3);
  assert.equal(v.prejuizo, true);
});

test('receita dentro de receita usa o custo por unidade da base', () => {
  const recheio = { id: 'recheio', nome: 'Recheio', itens: [{ tipo: 'ing', refId: 'acucar', qtd: 1000, unidade: 'g' }], rendimento: { qtd: 500, unidade: 'g' } }; // 5 por 500 g
  const torta = { id: 'torta', nome: 'Torta', itens: [{ tipo: 'rec', refId: 'recheio', qtd: 100, unidade: 'g' }], rendimento: { qtd: 1, unidade: 'un' } };
  perto(C.calcularReceita(torta, ctx([recheio, torta])).custoIngredientes, 1);
});

test('receitas em ciclo são detectadas', () => {
  const a = { id: 'a', nome: 'A', itens: [{ tipo: 'rec', refId: 'b', qtd: 1, unidade: 'un' }], rendimento: { qtd: 1, unidade: 'un' } };
  const b = { id: 'b', nome: 'B', itens: [{ tipo: 'rec', refId: 'a', qtd: 1, unidade: 'un' }], rendimento: { qtd: 1, unidade: 'un' } };
  assert.equal(C.calcularReceita(a, ctx([a, b])).temCiclo, true);
  assert.deepEqual([...C.receitasQueDependemDe('a', { a, b })].sort(), ['a', 'b']);
});

test('ingrediente com unidade incompatível avisa e fica fora do custo', () => {
  const rec = receitaBolo();
  rec.itens[0].unidade = 'ml';
  const r = C.calcularReceita(rec, ctx());
  perto(r.custoIngredientes, 1);
  assert.ok(r.avisos.some(a => /Unidade incompatível/.test(a)));
});
