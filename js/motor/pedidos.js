// Motor: Pedidos: totais, pagamentos, necessidades de produção.
// Funções puras: não tocam na tela, na rede nem no armazenamento.
import { mesclarConfig } from './config.js';
import { round2 } from './datas.js';
import { custoIngrediente } from './ingredientes.js';
import { num, numOk } from './numeros.js';
import { calcularReceita } from './receitas.js';
import { UNIDADES, normUn, paraBase } from './unidades.js';

// ---------- Pedidos ----------
export const FORMAS_PAGAMENTO = {
  pix: { rotulo: 'Pix', taxa: null },
  dinheiro: { rotulo: 'Dinheiro', taxa: null },
  debito: { rotulo: 'Cartão de débito', taxa: 'debito' },
  credito: { rotulo: 'Cartão de crédito', taxa: 'credito' },
  app: { rotulo: 'Aplicativo de entrega', taxa: 'app' }
};
export const STATUS_PEDIDO = {
  orcamento: { rotulo: 'Orçamento', ordem: 0 },
  confirmado: { rotulo: 'Confirmado', ordem: 1 },
  producao: { rotulo: 'Em produção', ordem: 2 },
  pronto: { rotulo: 'Pronto', ordem: 3 },
  entregue: { rotulo: 'Entregue', ordem: 4 },
  cancelado: { rotulo: 'Cancelado', ordem: 5 }
};
export function taxaFormaPct(cfg, forma) {
  const f = FORMAS_PAGAMENTO[forma];
  return f && f.taxa ? (cfg.taxas[f.taxa] || 0) : 0;
}
export function custoItemPedido(it, ctx) {
  if (it.tipo === 'avulso') return numOk(it.custoUnit) ? it.custoUnit : null;
  const rec = ctx.receitas[it.receitaId];
  if (!rec || rec.excluidoEm) return numOk(it.custoUnit) ? it.custoUnit : null;
  const r = calcularReceita(rec, ctx);
  const v = (r.variacoes || []).find(x => x.id === it.variacaoId);
  return v && numOk(v.custo) ? v.custo : (numOk(it.custoUnit) ? it.custoUnit : null);
}
export function maoObraItemPedido(it, ctx) {
  if (it.tipo !== 'rec') return 0;
  if (numOk(it.maoObraUnit)) return it.maoObraUnit;
  const rec = ctx.receitas[it.receitaId];
  if (!rec || rec.excluidoEm) return 0;
  const v = (calcularReceita(rec, ctx).variacoes || []).find(x => x.id === it.variacaoId);
  return v && numOk(v.maoObra) ? v.maoObra : 0;
}
export function fixosItemPedido(it, ctx) {
  if (it.tipo !== 'rec') return 0;
  if (numOk(it.fixosUnit)) return it.fixosUnit;
  const rec = ctx.receitas[it.receitaId];
  if (!rec || rec.excluidoEm) return 0;
  const v = (calcularReceita(rec, ctx).variacoes || []).find(x => x.id === it.variacaoId);
  return v && numOk(v.fixos) ? v.fixos : 0;
}
export function calcularPedido(p, ctx) {
  const cfg = mesclarConfig(ctx.config);
  let subtotal = 0, custo = 0, custoCompleto = true;
  const itens = (p.itens || []).map(function (it) {
    const q = numOk(it.qtd) ? it.qtd : 0, pu = numOk(it.precoUnit) ? it.precoUnit : 0;
    const cu = custoItemPedido(it, ctx);
    subtotal += q * pu;
    if (numOk(cu)) custo += cu * q; else if (q > 0) custoCompleto = false;
    return { id: it.id, total: q * pu, custoUnit: cu, custo: numOk(cu) ? cu * q : null, maoObraUnit: maoObraItemPedido(it, ctx) };
  });
  const taxaEntrega = p.tipoEntrega === 'entrega' && numOk(p.taxaEntrega) ? p.taxaEntrega : 0;
  const desconto = numOk(p.desconto) ? p.desconto : 0;
  const total = round2(Math.max(0, subtotal + taxaEntrega - desconto));
  const pago = round2((p.pagamentos || []).reduce((s, x) => s + (numOk(x.valor) ? x.valor : 0), 0));
  const restante = round2(total - pago);
  const taxaPagamento = total * taxaFormaPct(cfg, p.formaPagamento) / 100;
  // A taxa de entrega é repasse (motoboy/combustível): não conta como lucro dos doces.
  const lucro = custoCompleto && itens.length ? total - taxaEntrega - custo - taxaPagamento : null;
  let situacao = 'pendente';
  if (total > 0 && restante <= 0.004) situacao = restante < -0.004 ? 'excedente' : 'pago';
  else if (pago > 0.004) situacao = 'parcial';
  return {
    itens: itens, subtotal: round2(subtotal), taxaEntrega: taxaEntrega, desconto: desconto, total: total,
    pago: pago, restante: restante, custo: custoCompleto ? custo : null, taxaPagamento: taxaPagamento,
    lucro: lucro, margem: numOk(lucro) && total - taxaEntrega > 0 ? lucro / (total - taxaEntrega) : null,
    situacao: situacao, sinalSugerido: round2(total * (cfg.sinalPadraoPct || 0) / 100)
  };
}
// Quanto produzir e quanto comprar para um conjunto de pedidos.
// Desmonta receita dentro de receita e aplica a perda de cada uma.
export function necessidades(pedidos, ctx) {
  const producao = {}, compras = {}, avisos = [];
  function expandir(recId, qtdBase, pilha, direto) {
    const rec = ctx.receitas[recId];
    if (!rec || rec.excluidoEm) { avisos.push('Uma receita usada nos pedidos foi excluída.'); return; }
    if (pilha.indexOf(recId) >= 0) { avisos.push((rec.nome || 'Receita') + ': receitas usam uma à outra em ciclo.'); return; }
    const p = producao[recId] || (producao[recId] = { receitaId: recId, qtdBase: 0, direto: 0 });
    p.qtdBase += qtdBase; if (direto) p.direto += qtdBase;
    const rend = rec.rendimento || {};
    const rendBase = paraBase(rend.qtd, rend.unidade);
    if (!(rendBase > 0)) { avisos.push((rec.nome || 'Receita') + ': sem rendimento, os ingredientes dela ficaram de fora.'); return; }
    p.rendBase = rendBase; p.unidadeBase = UNIDADES[normUn(rend.unidade)].base;
    const perda = numOk(rec.perdaPct) && rec.perdaPct > 0 && rec.perdaPct < 100 ? rec.perdaPct / 100 : 0;
    const fator = qtdBase / rendBase / (1 - perda);
    (rec.itens || []).forEach(function (it) {
      const q = paraBase(it.qtd, it.unidade);
      if (!numOk(q)) return;
      if (it.tipo === 'rec') expandir(it.refId, q * fator, pilha.concat([recId]), false);
      else {
        const c = compras[it.refId] || (compras[it.refId] = { ingredienteId: it.refId, qtdBase: 0 });
        c.qtdBase += q * fator;
      }
    });
  }
  (pedidos || []).forEach(function (pd) {
    (pd.itens || []).forEach(function (it) {
      if (it.tipo !== 'rec' || !numOk(it.qtd) || it.qtd <= 0) return;
      const rec = ctx.receitas[it.receitaId];
      if (!rec || rec.excluidoEm) { avisos.push((it.nome || 'Item') + ': a receita foi excluída.'); return; }
      const v = (rec.variacoes || []).find(x => x.id === it.variacaoId);
      if (!v) { avisos.push((it.nome || rec.nome) + ': a opção de venda não existe mais na receita.'); return; }
      const qb = paraBase(v.qtd, v.unidade || (rec.rendimento && rec.rendimento.unidade));
      if (!numOk(qb)) { avisos.push((it.nome || rec.nome) + ': a opção de venda não diz quanto usa da receita.'); return; }
      expandir(rec.id, qb * it.qtd, [], true);
    });
  });
  Object.values(compras).forEach(function (c) {
    const ing = ctx.ingredientes[c.ingredienteId];
    if (!ing) return;
    const emb = paraBase(ing.qtdEmbalagem, ing.unidade);
    c.base = UNIDADES[normUn(ing.unidade)] ? UNIDADES[normUn(ing.unidade)].base : null;
    if (emb > 0) { c.embalagens = Math.ceil(c.qtdBase / emb - 1e-9); c.custoEmbalagens = c.embalagens * (ing.valorPago || 0); }
    const ci = custoIngrediente(ing);
    c.custoProporcional = ci ? ci.porBase * c.qtdBase : null;
  });
  return { producao: producao, compras: compras, avisos: Array.from(new Set(avisos)) };
}
export function qtdLegivel(qtdBase, base) {
  if (!numOk(qtdBase)) return '—';
  if (base === 'g' && qtdBase >= 1000) return num(qtdBase / 1000, 2) + ' kg';
  if (base === 'ml' && qtdBase >= 1000) return num(qtdBase / 1000, 2) + ' L';
  if (base === 'un') return num(qtdBase, 1) + ' un';
  return num(qtdBase, 0) + ' ' + (base || '');
}
