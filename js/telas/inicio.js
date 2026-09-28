// Tela Início: resumo do dia e avisos.
import * as C from '../motor/index.js';
import { S, cfg, ctxCalc, lista } from '../nucleo/estado.js';
import { I } from '../nucleo/icones.js';
import { dataBR, esc, hoje } from '../nucleo/util.js';
import { movsTodos } from '../servicos/caixa.js';
import { calcProLabore } from '../servicos/financeiro.js';
import { blocoContasInicio } from './contas.js';
import { blocoEstoqueInicio } from './estoque.js';
import { blocosPedidosInicio } from './pedidos.js';

// ================= Início =================
export function analisarReceitas() {
  const ctx = ctxCalc();
  const cf = cfg();
  const alerta = (cf.margemAlerta || 0) / 100;
  const res = { prejuizo: [], margemBaixa: [], incompletas: [] };
  lista('receitas').forEach(function (r) {
    const c = C.calcularReceita(r, ctx);
    if (c.avisos.some(a => /rendimento|Informe|não encontrad|incompat|Ciclo/i.test(a))) res.incompletas.push(r);
    (c.variacoes || []).forEach(function (v) {
      if (v.prejuizo) res.prejuizo.push({ r: r, v: v });
      else if (C.numOk(v.margemReal) && v.margemReal < alerta) res.margemBaixa.push({ r: r, v: v });
    });
  });
  return res;
}
export function telaInicio() {
  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const nRec = lista('receitas').length, nIng = lista('ingredientes').length;
  const a = analisarReceitas();
  const cf = cfg();
  const pend = lista('ingredientes').filter(i => i.obs);
  const altas = lista('ingredientes').map(i => ({ i: i, v: C.variacaoPreco(i, 90) })).filter(x => x.v && x.v.variacao > 0.05).sort((x, y) => y.v.variacao - x.v.variacao).slice(0, 5);
  let h = '<div class="cab-pagina"><div class="titulos"><h1>Início</h1><p class="sub">' + esc(hoje.charAt(0).toUpperCase() + hoje.slice(1)) + '</p></div><div class="acoes"><a class="btn" href="#/pedido/novo">' + I.mais + 'Novo pedido</a></div></div>';

  if (S.meta.conflitos.length) {
    h += '<div class="aviso neg" style="margin-bottom:16px">' + I.alerta + '<div class="txt"><b>' + (S.meta.conflitos.length === 1 ? 'Um registro foi alterado em dois aparelhos ao mesmo tempo.' : S.meta.conflitos.length + ' registros foram alterados em dois aparelhos ao mesmo tempo.') + '</b> Ficou a versão mais recente. <a href="#/ajustes#conflitos">Ver a versão que ficou de fora</a></div></div>';
  }

  h += blocosPedidosInicio();
  h += blocoContasInicio();
  h += blocoEstoqueInicio();

  if (!nRec) {
    h += '<div class="bloco vazio">' + I.emblema + '<h2>Cadastre sua primeira receita</h2><p>Com a receita cadastrada, o app calcula o custo de cada doce, sugere o preço e avisa quando algum produto dá prejuízo.</p><a class="btn" href="#/receita/nova">' + I.mais + 'Nova receita</a></div>';
  }

  h += '<div class="stats"><a class="stat" href="#/receitas" style="text-decoration:none"><div class="n">' + nRec + '</div><div class="r">receitas cadastradas</div></a>' +
    (function () { const d = calcProLabore().disponivel; return '<a class="stat" href="#/prolabore" style="text-decoration:none"><div class="n' + (d < 0 ? ' neg-txt' : '') + '">' + (d < 0 ? '−' : '') + C.brl(Math.abs(d)) + '</div><div class="r">de pró-labore disponível</div></a>'; })() +
    (function () {
      const pm = C.periodoPreset('mes', C.dataISO()), rm = C.resumoCaixa(C.filtrarMovimentos(movsTodos(), pm));
      return '<a class="stat" href="#/caixa" style="text-decoration:none"><div class="n ' + (rm.saldo < 0 ? 'neg-txt' : '') + '">' + (rm.saldo < 0 ? '−' : '') + C.brl(Math.abs(rm.saldo)) + '</div><div class="r">de saldo no caixa este mês</div></a>' +
        (C.numOk(cfg().metaFaturamento) && cfg().metaFaturamento > 0 ? '<a class="stat" href="#/relatorios" style="text-decoration:none"><div class="n">' + C.pct(Math.max(0, rm.entradas) / cfg().metaFaturamento, 0) + '</div><div class="r">da meta de ' + C.brl(cfg().metaFaturamento) + ' recebidos</div></a>' : '');
    })() + '</div>';

  if (a.prejuizo.length) {
    h += '<section class="bloco"><h2>Vendendo abaixo do custo</h2><p class="explica">O preço praticado destas opções não cobre o custo. Cada venda tira dinheiro do caixa.</p><div class="lista">' +
      a.prejuizo.map(x => '<a class="item" href="#/receita/' + encodeURIComponent(x.r.id) + '"><div class="principal"><div class="nome">' + esc(x.r.nome) + '</div><div class="det">' + esc(x.v.nome || 'Opção') + '</div></div><div class="valor" style="color:var(--neg)">' + I.desce + ' ' + C.brl(x.v.lucro) + '<small>por venda</small></div></a>').join('') + '</div></section>';
  }
  if (a.margemBaixa.length) {
    h += '<section class="bloco"><h2>Margem abaixo de ' + C.num(cf.margemAlerta, 1) + '%</h2><p class="explica">Dão lucro, mas menos do que o mínimo que você definiu em Ajustes.</p><div class="lista">' +
      a.margemBaixa.map(x => '<a class="item" href="#/receita/' + encodeURIComponent(x.r.id) + '"><div class="principal"><div class="nome">' + esc(x.r.nome) + '</div><div class="det">' + esc(x.v.nome || 'Opção') + '</div></div><span class="chip alerta">margem ' + C.pct(x.v.margemReal) + '</span></a>').join('') + '</div></section>';
  }
  if (a.incompletas.length) {
    h += '<section class="bloco"><h2>Receitas com dados faltando</h2><div class="lista">' +
      a.incompletas.map(r => '<a class="item" href="#/receita/' + encodeURIComponent(r.id) + '"><div class="principal"><div class="nome">' + esc(r.nome || 'Receita sem nome') + '</div><div class="det">Falta rendimento, quantidade ou ingrediente</div></div>' + I.seta + '</a>').join('') + '</div></section>';
  }
  if (altas.length) {
    h += '<section class="bloco"><h2>Ingredientes que subiram de preço</h2><p class="explica">Nos últimos 90 dias. As receitas já foram recalculadas com o preço novo.</p><div class="lista">' +
      altas.map(x => '<button type="button" class="item" data-acao="editar-ing" data-id="' + esc(x.i.id) + '"><div class="principal"><div class="nome">' + esc(x.i.nome) + '</div><div class="det">desde ' + dataBR(x.v.desde) + '</div></div><span class="chip neg">' + I.sobe + ' ' + C.pct(x.v.variacao) + '</span></button>').join('') + '</div></section>';
  }
  if (pend.length) {
    h += '<section class="bloco"><h2>Pendências na biblioteca</h2><div class="lista">' +
      pend.map(i => '<button type="button" class="item" data-acao="editar-ing" data-id="' + esc(i.id) + '"><div class="principal"><div class="nome">' + esc(i.nome) + '</div><div class="det">' + esc(i.obs) + '</div></div>' + I.seta + '</button>').join('') + '</div></section>';
  }
  if (C.totalFixos(cf) === 0) {
    h += '<div class="aviso">' + I.alerta + '<div class="txt">Os custos fixos do mês ainda estão em branco, então o preço das receitas não inclui aluguel, luz e gás. <a href="#/ajustes#fixos">Preencher em Ajustes</a></div></div>';
  }
  return h;
}
