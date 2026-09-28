// Motor: Contas fixas cobertas pelas receitas produzidas no mês.
// Cada preço traz uma parte das contas fixas (custo fixo por hora × tempo de produção).
// Somando essa parte em tudo o que foi feito no período, e dividindo na proporção de
// cada conta cadastrada em Ajustes, sabe-se quanto de cada conta as receitas cobriram.
import { fixosPorHora, mesclarConfig, totalFixos } from './config.js';
import { round2 } from './datas.js';
import { numOk } from './numeros.js';
import { fixosItemPedido } from './pedidos.js';

// Pedido criado por uma venda fiado da vitrine: o doce já foi contado ao ir para a vitrine
function veioDaVitrine(p) { return p.origem === 'vitrine' || /^Venda da vitrine/.test(p.obs || ''); }

export function contasFixasCobertas(pedidos, movsEstoque, ctx, de, ate) {
  const cfg = mesclarConfig(ctx.config);
  const contas = (cfg.custosFixos || []).filter(c => numOk(c.valor) && c.valor > 0);
  const totalAjustes = contas.reduce((s, c) => s + c.valor, 0);
  const prod = {};
  let coberto = 0;
  function somar(chave, nome, qtd, porUnidade) {
    if (!(qtd > 0)) return;
    const x = prod[chave] || (prod[chave] = { nome: nome, qtd: 0, porUnidade: porUnidade, coberto: 0 });
    x.qtd += qtd; x.coberto += qtd * porUnidade; x.porUnidade = porUnidade;
    coberto += qtd * porUnidade;
  }
  (pedidos || []).forEach(function (p) {
    if (p.excluidoEm || p.status !== 'entregue' || !p.dataEntrega || p.dataEntrega < de || p.dataEntrega > ate || veioDaVitrine(p)) return;
    (p.itens || []).forEach(function (it) {
      if (it.tipo !== 'rec' || !numOk(it.qtd)) return;
      somar('rec:' + it.receitaId + ':' + it.variacaoId, it.nome || 'Produto', it.qtd, fixosItemPedido(it, ctx));
    });
  });
  (movsEstoque || []).forEach(function (m) {
    if (m.excluidoEm || m.motivo !== 'vitrine' || !(m.qtd > 0) || !m.data || m.data < de || m.data > ate) return;
    const [, rid, vid] = String(m.item).split(':');
    const fu = numOk(m.fixosUnit) ? m.fixosUnit : fixosItemPedido({ tipo: 'rec', receitaId: rid, variacaoId: vid }, ctx);
    const r = ctx.receitas[rid], v = r && (r.variacoes || []).find(x => x.id === vid);
    somar('rec:' + rid + ':' + vid, r ? (r.nome || 'Receita') + ' (' + (v ? v.nome : 'opção') + ')' : (m.nome || 'Produto'), m.qtd, fu);
  });
  const taxaHora = fixosPorHora(cfg);
  // Divide o coberto em centavos pelo método dos maiores restos: as partes somam exatamente o total.
  const totalCent = Math.round(coberto * 100);
  const bruto = contas.map(c => totalAjustes > 0 ? totalCent * c.valor / totalAjustes : 0);
  const cents = bruto.map(Math.floor);
  let sobra = totalCent - cents.reduce((s, x) => s + x, 0);
  bruto.map((b, i) => [b - Math.floor(b), i]).sort((x, y) => y[0] - x[0]).forEach(([, i]) => { if (sobra > 0) { cents[i]++; sobra--; } });
  const porConta = contas.map(function (c, i) {
    const cob = cents[i] / 100;
    return { nome: c.nome || 'Conta', valor: c.valor, coberto: cob, falta: round2(Math.max(0, c.valor - cob)), pct: cob / c.valor };
  });
  return {
    coberto: round2(coberto), totalAjustes: round2(totalAjustes), falta: round2(Math.max(0, totalAjustes - coberto)),
    pct: totalAjustes > 0 ? coberto / totalAjustes : null,
    horas: numOk(taxaHora) && taxaHora > 0 ? coberto / taxaHora : null, horasMes: cfg.horasMes, taxaHora: taxaHora,
    usaContasPagas: cfg.custosFixosFonte === 'contas' && numOk(cfg.mediaContasFixas), totalNoPreco: totalFixos(cfg),
    porConta: porConta,
    porProduto: Object.values(prod).map(x => Object.assign(x, { coberto: round2(x.coberto) })).sort((a, b) => b.coberto - a.coberto)
  };
}
