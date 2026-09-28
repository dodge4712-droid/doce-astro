// Motor: Pró-labore disponível.
// Funções puras: não tocam na tela, na rede nem no armazenamento.
import { FONTE_PROLABORE } from './caixa.js';
import { round2 } from './datas.js';
import { numOk } from './numeros.js';
import { calcularPedido, maoObraItemPedido } from './pedidos.js';
import { calcularReceita } from './receitas.js';
import { semAcento } from './texto.js';

// ---------- Pró-labore disponível ----------
// Cada preço já traz a parte do seu trabalho (a mão de obra da receita).
// Disponível = parte liberada pelas vendas − retiradas registradas.
export const ORIGENS_NAO_VENDA = ['outras entradas'];
export function proLaboreDisponivel(pedidos, lancamentos, ctx, nomeDoPedido) {
  const prod = {};
  let liberado = 0, aLiberar = 0, receitaIdent = 0, moIdent = 0;
  function porProduto(chave, nome, qtd, preco, moUnit, lib) {
    const x = prod[chave] || (prod[chave] = { nome: nome, qtd: 0, receita: 0, maoObraUnit: moUnit, liberado: 0 });
    x.qtd += qtd; x.receita += preco * qtd; x.liberado += lib; x.maoObraUnit = moUnit;
  }
  (pedidos || []).forEach(function (p) {
    if (p.excluidoEm || ['cancelado', 'orcamento'].indexOf(p.status) >= 0) return;
    const c = calcularPedido(p, ctx);
    const mo = (p.itens || []).reduce((s, it, i) => s + (numOk(it.qtd) ? it.qtd : 0) * (c.itens[i].maoObraUnit || 0), 0);
    if (p.status !== 'entregue') { aLiberar += mo; return; }
    const frac = c.total > 0 ? Math.min(1, Math.max(0, c.pago / c.total)) : 0;
    liberado += mo * frac; aLiberar += mo * (1 - frac);
    (p.itens || []).forEach(function (it, i) {
      if (!numOk(it.qtd) || it.qtd <= 0) return;
      const pu = numOk(it.precoUnit) ? it.precoUnit : 0, mu = c.itens[i].maoObraUnit || 0;
      receitaIdent += it.qtd * pu * frac; moIdent += it.qtd * mu * frac;
      if (it.tipo === 'rec') porProduto('rec:' + it.receitaId + ':' + it.variacaoId, it.nome || 'Produto', it.qtd, pu, mu, it.qtd * mu * frac);
    });
  });
  let receitaAvulsa = 0;
  const retiradas = [];
  (lancamentos || []).forEach(function (l) {
    if (l.excluidoEm || !numOk(l.valor)) return;
    if (l.tipo === 'saida' && semAcento(l.categoria) === semAcento(FONTE_PROLABORE)) { retiradas.push(l); return; }
    if (l.tipo !== 'entrada') return;
    if (l.vitrine) {
      const [, rid, vid] = String(l.vitrine.item).split(':');
      const mu = numOk(l.vitrine.maoObraUnit) ? l.vitrine.maoObraUnit : maoObraItemPedido({ tipo: 'rec', receitaId: rid, variacaoId: vid }, ctx);
      const lib = mu * l.vitrine.qtd;
      liberado += lib; receitaIdent += l.valor; moIdent += lib;
      const r = ctx.receitas[rid], v = r && (r.variacoes || []).find(x => x.id === vid);
      porProduto('rec:' + rid + ':' + vid, r ? (r.nome || 'Receita') + ' (' + (v ? v.nome : 'opção') + ')' : 'Produto', l.vitrine.qtd, l.valor / l.vitrine.qtd, mu, lib);
      return;
    }
    if (ORIGENS_NAO_VENDA.indexOf(semAcento(l.categoria)) >= 0 || l.contaId) return;
    receitaAvulsa += l.valor;
  });
  // Porcentagem média: das vendas com produto; sem elas, a média das receitas cadastradas
  let pctMedio = receitaIdent > 0 ? moIdent / receitaIdent : null, pctOrigem = 'vendas';
  if (pctMedio === null) {
    let mo = 0, pr = 0;
    Object.values(ctx.receitas || {}).forEach(function (r) {
      if (r.excluidoEm) return;
      (calcularReceita(r, ctx).variacoes || []).forEach(v => { if (numOk(v.maoObra) && numOk(v.preco) && v.preco > 0) { mo += v.maoObra; pr += v.preco; } });
    });
    pctMedio = pr > 0 ? mo / pr : 0; pctOrigem = pr > 0 ? 'receitas' : 'nenhuma';
  }
  const estimado = receitaAvulsa * pctMedio;
  const retirado = retiradas.reduce((s, l) => s + l.valor, 0);
  const lista = Object.values(prod).map(x => Object.assign(x, { receita: round2(x.receita), liberado: round2(x.liberado), pct: x.receita > 0 && x.qtd > 0 ? x.maoObraUnit / (x.receita / x.qtd) : null }))
    .sort((a, b) => b.liberado - a.liberado);
  return {
    liberado: round2(liberado), estimado: round2(estimado), receitaAvulsa: round2(receitaAvulsa), pctMedio: pctMedio, pctOrigem: pctOrigem,
    aLiberar: round2(aLiberar), retirado: round2(retirado), disponivel: round2(liberado + estimado - retirado),
    porProduto: lista, retiradas: retiradas.sort((a, b) => String(b.data).localeCompare(String(a.data)))
  };
}
