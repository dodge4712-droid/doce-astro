// Tela Caixa → Relatórios: mês a mês, metas, ponto de equilíbrio, rankings e comparação.
import * as C from '../motor/index.js';
import { S, cfg, configEfetiva, ctxCalc, lista, mediaContas } from '../nucleo/estado.js';
import { I, p } from '../nucleo/icones.js';
import { abas, abrirFolha, cab, toast } from '../nucleo/interface.js';
import { gravarRegistro } from '../nucleo/registros.js';
import { render } from '../nucleo/rotas.js';
import { $, clone, esc, hoje, inNum } from '../nucleo/util.js';
import { nomeCliente } from '../servicos/pedidos.js';
import { ABAS_CX } from './caixa.js';

export function varChip(v, inverter) {
  if (!C.numOk(v) || Math.abs(v) < 0.005) return '<span class="chip mudo">igual ao mês anterior</span>';
  const bom = inverter ? v < 0 : v > 0;
  return '<span class="chip ' + (inverter === 'neutro' ? '' : bom ? 'pos' : 'neg') + '">' + (v > 0 ? I.sobe : I.desce) + C.pct(Math.abs(v), 0) + ' vs mês anterior</span>';
}
// ---------- Relatórios ----------
export function telaRelatorios() {
  const mes = S.relMes || (S.relMes = hoje().slice(0, 7));
  const nMeses = S.relN || 6;
  const ctx = ctxCalc(), cf = cfg();
  const dados = { pedidos: lista('pedidos'), lancamentos: lista('lancamentos'), nome: nomeCliente };
  const at = C.resumoMes(mes, dados, ctx), an = C.resumoMes(C.somarMeses(mes, -1), dados, ctx);
  const lim = C.limitesMes(mes), mesCorrente = mes === hoje().slice(0, 7);
  const prods = C.produtosVendidos(dados.pedidos, dados.lancamentos, ctx, lim.de, lim.ate);
  S.relRanking = prods;
  let h = cab('Relatórios', 'Como a doceria foi no mês, comparado com o anterior.') + abas(ABAS_CX, '#/relatorios');
  h += '<div class="cal-cab" style="margin-bottom:14px"><button type="button" class="btn-icone" data-acao="rel-mes" data-v="-1" aria-label="Mês anterior">' + I.voltar + '</button><h2>' + esc(C.nomeMes(mes).charAt(0).toUpperCase() + C.nomeMes(mes).slice(1)) + '</h2><button type="button" class="btn-icone" data-acao="rel-mes" data-v="1" aria-label="Próximo mês"' + (mesCorrente ? ' disabled' : '') + '>' + I.seta + '</button></div>';
  if (mesCorrente) h += '<p class="mudo" style="margin:-6px 0 14px;text-align:center">Mês em andamento: os números ainda vão mudar.</p>';
  const card = (rot, v, vAnt, inverter, extra) => '<div class="stat"><div class="r">' + rot + '</div><div class="n' + (v < 0 ? ' neg-txt' : '') + '">' + (v < 0 ? '−' : '') + C.brl(Math.abs(v)) + '</div>' + (extra || '') + varChip(C.variacaoPct(v, vAnt), inverter) + '</div>';
  h += '<div class="stats stats-rel">' + card('Recebido', at.recebido, an.recebido) + card('Despesas', at.despesas, an.despesas, true, '<small class="mudo">sem o pró-labore</small>') + card('Lucro da doceria', at.lucro, an.lucro, false, '<small class="mudo">recebido − despesas</small>') +
    card('Pró-labore', at.retiradas, an.retiradas, 'neutro') + card('Guardado na reserva', at.guardado, an.guardado) +
    '<div class="stat"><div class="r">Pedidos entregues</div><div class="n">' + at.pedidosEntregues + '</div>' + (at.ticketMedio ? '<small class="mudo">' + C.brl(at.ticketMedio) + ' por pedido, em média</small>' : '') + varChip(C.variacaoPct(at.pedidosEntregues, an.pedidosEntregues)) + '</div></div>';

  // Metas
  const metaF = C.numOk(cf.metaFaturamento) && cf.metaFaturamento > 0 ? cf.metaFaturamento : null, metaL = C.numOk(cf.metaLucro) && cf.metaLucro > 0 ? cf.metaLucro : null;
  const barraMeta = function (rot, feito, meta) {
    const proj = mesCorrente ? C.projecaoMes(feito, mes, hoje()) : null;
    const p = Math.max(0, feito / meta);
    return '<div class="linha-meta"><div class="cab-bloco" style="margin:0"><b>' + rot + '</b><span>' + C.brl(feito) + ' de ' + C.brl(meta) + '</span></div><div class="meta-barra"><i style="width:' + Math.min(100, p * 100).toFixed(1) + '%"></i></div>' +
      '<small class="mudo">' + C.pct(p, 0) + ' da meta' + (C.numOk(proj) ? '. No ritmo atual, fecha o mês em ' + C.brl(proj) + (proj >= meta ? ' (bate a meta)' : ' (faltariam ' + C.brl(meta - proj) + ')') : '') + '</small></div>';
  };
  h += '<section class="bloco"><div class="cab-bloco"><h2>Metas do mês</h2><button type="button" class="btn sec fino" data-acao="definir-metas">' + (metaF || metaL ? 'Mudar metas' : 'Definir metas') + '</button></div>' +
    (metaF || metaL ? (metaF ? barraMeta('Recebido', at.recebido, metaF) : '') + (metaL ? barraMeta('Lucro da doceria', at.lucro, metaL) : '') : '<p class="mudo">Defina quanto quer receber e lucrar por mês; o app mostra o progresso e se o ritmo atual chega lá.</p>') + '</section>';

  // Ponto de equilíbrio
  let base = prods, rotBase = 'deste mês';
  if (!prods.some(p => p.receita > 0)) { const l3 = { de: C.limitesMes(C.somarMeses(mes, -3)).de, ate: C.limitesMes(C.somarMeses(mes, -1)).ate }; base = C.produtosVendidos(dados.pedidos, dados.lancamentos, ctx, l3.de, l3.ate); rotBase = 'dos 3 meses anteriores'; }
  const vendas = base.reduce((s, p) => s + p.receita, 0), cv = base.reduce((s, p) => s + p.custoVariavel, 0);
  const fixos = C.totalFixos(cf), pl = C.proLaboreDesejado(configEfetiva()) || 0;
  const pe = C.pontoEquilibrio(fixos, pl, vendas, cv);
  const vendidoMes = prods.reduce((s, p) => s + p.receita, 0);
  h += '<section class="bloco"><h2>Ponto de equilíbrio</h2>' + (pe.valor
    ? '<p>Para pagar as contas fixas (' + C.brl(fixos) + ') e o seu pró-labore (' + C.brl(pl) + '), a doceria precisa vender cerca de <b>' + C.brl(pe.valor) + ' por mês</b>.</p>' +
      '<div class="meta-barra" style="margin-top:12px"><i style="width:' + Math.min(100, vendidoMes / pe.valor * 100).toFixed(1) + '%"></i></div><small class="mudo">Vendido neste mês: ' + C.brl(vendidoMes) + ' (' + C.pct(vendidoMes / pe.valor, 0) + ')</small>' +
      '<details class="ajuda"><summary>Como é feita essa conta?</summary><div><p>De cada R$ 100 vendidos ' + rotBase + ', cerca de ' + C.brl(pe.margemContribuicao * 100) + ' sobram depois de ingredientes, perdas e embalagens. É a margem de contribuição (' + C.pct(pe.margemContribuicao, 0) + ').</p><p>Dividindo o que precisa ser coberto todo mês (' + C.brl(pe.custosACobrir) + ') por essa margem, chega-se ao valor de vendas que empata as contas. As contas fixas vêm de Ajustes → Custos fixos (' + (cf.custosFixosFonte === 'contas' && C.numOk(cf.mediaContasFixas) ? 'média das contas pagas' : 'valores preenchidos à mão') + ').</p></div></details>'
    : '') + (pe.valor && !(fixos > 0) && C.numOk(mediaContas().media) ? '<div class="aviso" style="margin-top:12px">' + I.alerta + '<div class="txt">Os custos fixos preenchidos à mão estão em R$ 0,00. Pelas contas pagas, a média é ' + C.brl(mediaContas().media) + ' por mês. <a href="#/ajustes#fixos">Escolher em Ajustes</a></div></div>' : '') + (pe.valor ? '' : '<p class="mudo">' + (!(fixos > 0) && !(pl > 0) ? 'Preencha os custos fixos e o pró-labore em Ajustes para calcular.' : 'Precisa de vendas entregues (pedidos ou vitrine) para calcular a margem.') + '</p>') + '</section>';

  // Mais vendidos e mais lucrativos
  const topQ = prods.slice().sort((a, b) => b.qtd - a.qtd).slice(0, 8), topL = prods.filter(p => C.numOk(p.lucro)).sort((a, b) => b.lucro - a.lucro).slice(0, 8);
  const ranking = (t, lst, val, fmt, cls) => { const mx = Math.max(0.01, ...lst.map(val)); return '<section class="bloco"><h2>' + t + '</h2>' + (lst.length ? '<div class="por-fonte">' + lst.map(p => '<div class="linha-fonte" style="cursor:default"><span class="nome-f">' + esc(p.nome) + '</span><span class="val-f">' + fmt(p) + '</span><span class="barra-f"><i class="' + cls + '" style="width:' + (Math.max(0, val(p)) / mx * 100).toFixed(1) + '%"></i></span></div>').join('') + '</div>' : '<p class="mudo">Nenhuma venda entregue neste mês.</p>') + '</section>'; };
  h += '<div class="grade-fontes">' + ranking('Mais vendidos', topQ, p => p.qtd, p => C.num(p.qtd) + ' <small>' + C.brl(p.receita) + '</small>', 'b-ouro') +
    ranking('Mais lucrativos', topL, p => p.lucro, p => C.brl(p.lucro) + ' <small>' + C.num(p.qtd) + ' vendidos</small>', 'b-ent') + '</div>';

  // Comparação entre meses
  const serie = []; for (let i = nMeses - 1; i >= 0; i--) serie.push(C.resumoMes(C.somarMeses(mes, -i), dados, ctx));
  S.relSerie = serie;
  const mx = Math.max(0.01, ...serie.map(r => Math.max(r.recebido, r.despesas)));
  h += '<section class="bloco"><div class="cab-bloco"><h2>Comparação entre meses</h2><div class="seg" role="group" aria-label="Quantos meses"><button type="button" data-acao="rel-n" data-v="6" aria-pressed="' + (nMeses === 6) + '">6 meses</button><button type="button" data-acao="rel-n" data-v="12" aria-pressed="' + (nMeses === 12) + '">12 meses</button></div></div>' +
    '<div class="legenda" style="margin:6px 0"><span><i class="b-ent"></i>Recebido</span><span><i class="b-sai"></i>Despesas</span></div>' +
    '<div class="graf graf-meses">' + serie.map(r => '<div class="graf-col" title="' + esc(C.nomeMes(r.mes) + ': recebido ' + C.brl(r.recebido) + ', despesas ' + C.brl(r.despesas) + ', lucro ' + C.brl(r.lucro)) + '"><span class="graf-barras"><i class="b-ent" style="height:' + (r.recebido / mx * 100).toFixed(1) + '%"></i><i class="b-sai" style="height:' + (r.despesas / mx * 100).toFixed(1) + '%"></i></span><span class="graf-rot">' + esc(C.nomeMes(r.mes, true).split('/')[0]) + '</span></div>').join('') + '</div>' +
    '<div class="tabela-rola" tabindex="0" role="region" aria-label="Tabela dos meses (role para o lado)"><table class="tabela-meses"><thead><tr><th scope="col">Mês</th><th scope="col">Recebido</th><th scope="col">Despesas</th><th scope="col">Lucro</th><th scope="col">Pró-labore</th><th scope="col">Pedidos</th></tr></thead><tbody>' +
    serie.slice().reverse().map(r => '<tr' + (r.mes === mes ? ' class="atual"' : '') + '><th scope="row">' + esc(C.nomeMes(r.mes, true)) + '</th><td>' + C.brl(r.recebido) + '</td><td>' + C.brl(r.despesas) + '</td><td class="' + (r.lucro < 0 ? 'neg-txt' : '') + '">' + (r.lucro < 0 ? '−' : '') + C.brl(Math.abs(r.lucro)) + '</td><td>' + C.brl(r.retiradas) + '</td><td>' + r.pedidosEntregues + '</td></tr>').join('') + '</tbody></table></div>' +
    '<div class="acoes" style="margin-top:14px"><button type="button" class="btn sec" data-acao="rel-csv">' + I.baixar + 'Exportar relatório (CSV)</button></div></section>';
  return h;
}
export function folhaMetas() {
  const cf = cfg();
  const corpo = '<form id="f-metas" style="display:flex;flex-direction:column;gap:12px"><p class="mudo">Valem para todos os meses até você mudar.</p>' +
    '<label class="campo"><span>Receber por mês</span><span class="com-prefixo"><i>R$</i><input class="entrada num" name="fat" inputmode="decimal" value="' + inNum(cf.metaFaturamento) + '" placeholder="sem meta"></span></label>' +
    '<label class="campo"><span>Lucro da doceria por mês</span><span class="com-prefixo"><i>R$</i><input class="entrada num" name="luc" inputmode="decimal" value="' + inNum(cf.metaLucro) + '" placeholder="sem meta"></span><small>Recebido menos despesas, antes do pró-labore.</small></label>' +
    '<div class="rodape-folha"><button type="button" class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit">Salvar metas</button></div></form>';
  abrirFolha('Metas do mês', corpo, function (d) {
    $('#f-metas', d).addEventListener('submit', function (ev) {
      ev.preventDefault(); const f = ev.target;
      const c = clone(cfg()); const a = C.lerNum(f.fat.value), b = C.lerNum(f.luc.value);
      c.metaFaturamento = a > 0 ? a : null; c.metaLucro = b > 0 ? b : null;
      gravarRegistro('config', c); d.close(); toast('Metas salvas.'); render(false);
    });
  });
}

// Ações dos botões desta parte (data-acao="...")
export const ACOES_RELATORIOS = {
  'rel-mes': function (el) { const n = C.somarMeses(S.relMes || hoje().slice(0, 7), Number(el.dataset.v)); if (n > hoje().slice(0, 7)) return; S.relMes = n; render(false); },
  'rel-n': function (el) { S.relN = Number(el.dataset.v); render(false); },
  'rel-csv': function () {
    const blob = new Blob([C.csvRelatorio(S.relSerie || [], (S.relRanking || []).slice().sort((a, b) => b.receita - a.receita))], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'relatorio-' + (S.relMes || hoje().slice(0, 7)) + '.csv';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast('Relatório exportado.');
  },
  'definir-metas': folhaMetas
};
