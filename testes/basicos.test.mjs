import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../js/motor/index.js';
import { NOMES_TABELAS, TABELAS_LOCAIS } from '../js/nucleo/estado.js';

test('lerNum entende o jeito brasileiro de escrever número', () => {
  assert.equal(C.lerNum('R$ 1.234,56'), 1234.56);
  assert.equal(C.lerNum('1.5'), 1.5);
  assert.equal(C.lerNum('2,5'), 2.5);
  assert.equal(C.lerNum(''), null);
  assert.equal(C.lerNum('abc'), null);
});

test('formatos de moeda e porcentagem', () => {
  assert.match(C.brl(1234.5), /^R\$\s1\.234,50$/);
  assert.equal(C.brl(NaN), '—');
  assert.equal(C.pct(0.255), '25,5%');
});

test('unidades convertem para a base da família', () => {
  assert.equal(C.paraBase(2, 'kg'), 2000);
  assert.equal(C.paraBase(1, 'L'), 1000);
  assert.equal(C.paraBase(2, 'dúzia'), 24);
  assert.equal(C.mesmaFamilia('kg', 'g'), true);
  assert.equal(C.mesmaFamilia('kg', 'ml'), false);
  assert.equal(C.paraBase(1, 'xícara'), null);
});

test('datas sem pular dia na virada do mês', () => {
  assert.equal(C.somarDias('2026-02-28', 1), '2026-03-01');
  assert.equal(C.diasEntre('2026-02-28', '2026-03-02'), 2);
  assert.equal(C.round2(1.005), 1.01);
});

test('CSV de compras: aspas, ponto e vírgula e quebra de linha', () => {
  const { sep, linhas } = C.lerCSV('﻿a;b\r\n"x;y";"linha\ncom ""aspas"""\n');
  assert.equal(sep, ';');
  assert.deepEqual(linhas, [['a', 'b'], ['x;y', 'linha\ncom "aspas"']]);
});

test('datas do CSV: aceita dd/mm/aaaa e recusa data impossível', () => {
  assert.equal(C.lerDataBR('05/03/26'), '2026-03-05');
  assert.equal(C.lerDataBR('2026-3-5'), '2026-03-05');
  assert.equal(C.lerDataBR('31/02/2026'), null);
});

test('importar compras agrupa por data, local e forma de pagamento', () => {
  const ing = { farinha: { id: 'farinha', nome: 'Farinha', unidade: 'kg', qtdEmbalagem: 1, valorPago: 10 } };
  const csv = C.lerCSV([
    'Data;Local;Ingrediente;Embalagens;Tamanho;Unidade;Valor;Forma',
    '05/03/2026;Atacadão;Farinha;2;1;kg;1.234,50;Pix',
    '05/03/2026;Atacadão;;;;;10;Pix',
    '05/03/2026;Atacadão;Chocolate;1;1;kg;30;Pix'
  ].join('\n'));
  const r = C.interpretarCompras(csv, ing);
  assert.equal(r.grupos.length, 1);
  const g = r.grupos[0];
  assert.equal(g.itens[0].valor, 1234.5);
  assert.equal(g.outros, 10);
  assert.deepEqual(r.erros.map(e => e.linha), [4]); // Chocolate não está na biblioteca
  assert.equal(g.ok, false);
});

test('compra aplicada vira o preço atual do ingrediente', () => {
  const ing = { id: 'f', unidade: 'kg', qtdEmbalagem: 1, valorPago: 10, historico: [] };
  const r = C.aplicarCompra(ing, { embalagens: 2, qtdEmbalagem: 1, unidade: 'kg', valor: 24 }, '2026-01-10', 'c1');
  assert.equal(r.ing.valorPago, 12);
  assert.ok(Math.abs(r.variacao - 0.2) < 1e-9);
  assert.equal(C.aplicarCompra(ing, { embalagens: 1, qtdEmbalagem: 1, unidade: 'L', valor: 5 }, '2026-01-10', 'c2'), null);
});

test('backup: toda tabela do app tem nome na confirmação de importar', () => {
  for (const t of TABELAS_LOCAIS) assert.ok(NOMES_TABELAS[t], 'falta o nome de ' + t);
});
