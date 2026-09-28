// Motor: Relatórios, ponto de equilíbrio e metas.
// Funções puras: não tocam na tela, na rede nem no armazenamento.
import { filtrarMovimentos, movimentos, resumoCaixa } from './caixa.js';
import { round2 } from './datas.js';
import { limitesMes, mesDe, nomeMes } from './financeiro.js';
import { numOk } from './numeros.js';
import { calcularPedido } from './pedidos.js';
import { calcularReceita } from './receitas.js';
import { celulaCSV, semAcento } from './texto.js';

// ---------- Relatórios ----------
// Produtos vendidos no período: pedidos entregues (pela data de entrega) e vendas da vitrine
export function produtosVendidos(pedidos, lancamentos, ctx, de, ate) {
  const mapa = {};
  function soma(chave, nome, qtd, receita, custoUnit, custoVarUnit) {
    const x = mapa[chave] || (mapa[chave] = { chave: chave, nome: nome, qtd: 0, receita: 0, custo: 0, custoVariavel: 0, custoCompleto: true });
    x.qtd += qtd; x.receita += receita;
    if (numOk(custoUnit)) x.custo += custoUnit * qtd; else x.custoCompleto = false;
    x.custoVariavel += (numOk(custoVarUnit) ? custoVarUnit : (numOk(custoUnit) ? custoUnit : 0)) * qtd;
  }
  const varDe = {};
  function variacao(rid, vid) {
    const k = rid + ':' + vid;
    if (!(k in varDe)) { const r = ctx.receitas[rid]; varDe[k] = r ? (calcularReceita(r, ctx).variacoes || []).find(v => v.id === vid) || null : null; }
    return varDe[k];
  }
  (pedidos || []).forEach(function (p) {
    if (p.excluidoEm || p.status !== 'entregue' || !p.dataEntrega || p.dataEntrega < de || p.dataEntrega > ate) return;
    (p.itens || []).forEach(function (it) {
      if (!numOk(it.qtd) || it.qtd <= 0) return;
      const pu = numOk(it.precoUnit) ? it.precoUnit : 0;
      if (it.tipo === 'rec') {
        const v = variacao(it.receitaId, it.variacaoId);
        soma('rec:' + it.receitaId + ':' + it.variacaoId, it.nome || 'Produto', it.qtd, it.qtd * pu, numOk(it.custoUnit) ? it.custoUnit : v && v.custo, v && v.custoVariavel);
      } else soma('avulso:' + semAcento(it.nome), it.nome || 'Item avulso', it.qtd, it.qtd * pu, it.custoUnit, it.custoUnit);
    });
  });
  (lancamentos || []).forEach(function (l) {
    if (l.excluidoEm || l.tipo !== 'entrada' || !l.vitrine || !l.data || l.data < de || l.data > ate) return;
    const [, rid, vid] = String(l.vitrine.item).split(':');
    const v = variacao(rid, vid), r = ctx.receitas[rid];
    soma('rec:' + rid + ':' + vid, r ? (r.nome || 'Receita') + ' (' + ((r.variacoes || []).find(x => x.id === vid) || {}).nome + ')' : 'Produto', l.vitrine.qtd, l.valor, v && v.custo, v && v.custoVariavel);
  });
  return Object.values(mapa).map(x => Object.assign(x, { receita: round2(x.receita), lucro: x.custoCompleto ? round2(x.receita - x.custo) : null }));
}
export function pontoEquilibrio(fixosMes, proLabore, vendas, custoVariavel) {
  const mc = vendas > 0 ? (vendas - custoVariavel) / vendas : null;
  const alvo = (fixosMes || 0) + (proLabore || 0);
  return { margemContribuicao: mc, custosACobrir: round2(alvo), valor: numOk(mc) && mc > 0 ? round2(alvo / mc) : null };
}
export function resumoMes(mes, dados, ctx) {
  const lim = limitesMes(mes);
  const movs = filtrarMovimentos(movimentos(dados.pedidos, dados.lancamentos, dados.nome), lim);
  const cx = resumoCaixa(movs);
  const entregues = (dados.pedidos || []).filter(p => !p.excluidoEm && p.status === 'entregue' && p.dataEntrega >= lim.de && p.dataEntrega <= lim.ate);
  const vendido = round2(entregues.reduce((s, p) => s + calcularPedido(p, ctx).total, 0));
  const guardado = round2((dados.lancamentos || []).filter(l => !l.excluidoEm && l.tipo === 'reserva' && l.valor > 0 && mesDe(l.data) === mes).reduce((s, l) => s + l.valor, 0));
  return { mes: mes, recebido: cx.entradas, despesas: cx.despesas, lucro: cx.lucro, retiradas: cx.retiradas, saldo: cx.saldo, guardado: guardado,
    pedidosEntregues: entregues.length, vendido: vendido, ticketMedio: entregues.length ? round2(vendido / entregues.length) : null, porFonte: cx.porFonte };
}
export function variacaoPct(atual, anterior) { return numOk(atual) && numOk(anterior) && Math.abs(anterior) > 0.004 ? (atual - anterior) / Math.abs(anterior) : null; }
export function projecaoMes(valorAteHoje, mes, hoje) {
  const lim = limitesMes(mes), dias = Number(lim.ate.slice(8));
  if (hoje < lim.de) return null;
  if (hoje > lim.ate) return valorAteHoje;
  const passados = Number(hoje.slice(8));
  return round2(valorAteHoje / passados * dias);
}
export function csvRelatorio(serie, ranking) {
  const d = v => numOk(v) ? v.toFixed(2).replace('.', ',') : '';
  const c = celulaCSV;
  const L = ['Mês;Recebido;Despesas;Lucro;Pró-labore;Guardado na reserva;Pedidos entregues;Vendido em pedidos;Ticket médio'];
  serie.forEach(r => L.push([nomeMes(r.mes), d(r.recebido), d(r.despesas), d(r.lucro), d(r.retiradas), d(r.guardado), r.pedidosEntregues, d(r.vendido), d(r.ticketMedio)].join(';')));
  if (ranking && ranking.length) {
    L.push(''); L.push('Produto;Quantidade;Vendido;Lucro estimado');
    ranking.forEach(p => L.push([c(p.nome), String(p.qtd).replace('.', ','), d(p.receita), d(p.lucro)].join(';')));
  }
  return '\ufeff' + L.join('\r\n');
}
