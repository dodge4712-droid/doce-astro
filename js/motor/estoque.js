// Motor: Estoque: saldos, baixas e validade.
// Funções puras: não tocam na tela, na rede nem no armazenamento.
import { diasEntre } from './datas.js';
import { numOk } from './numeros.js';
import { necessidades } from './pedidos.js';
import { paraBase } from './unidades.js';

// ---------- Estoque ----------
// Cada entrada, uso, contagem ou perda é um registro próprio (não se sobrescrevem
// entre aparelhos). A quantidade de um item é a soma dos registros dele.
export const MOTIVOS_ESTOQUE = {
  compra: 'Compra', producao: 'Usado na produção', ajuste: 'Contagem', entrada: 'Entrada',
  perda: 'Perda ou descarte', venda: 'Venda', vitrine: 'Feito para a vitrine'
};
export const STATUS_COM_BAIXA = ['producao', 'pronto', 'entregue'];
export function chaveIng(id) { return 'ing:' + id; }
export function chaveVitrine(receitaId, variacaoId) { return 'vit:' + receitaId + ':' + variacaoId; }
// Validade: a mais próxima entre os lotes que entraram desde a última vez que o
// item zerou. Uma contagem com validade substitui as anteriores.
export function saldosEstoque(movs) {
  const s = {};
  (movs || []).filter(m => !m.excluidoEm && numOk(m.qtd) && m.item)
    .sort((a, b) => String(a.data).localeCompare(String(b.data)) || String(a.criadoEm || '').localeCompare(String(b.criadoEm || '')))
    .forEach(function (m) {
      const x = s[m.item] || (s[m.item] = { item: m.item, qtd: 0, validades: [], ultimaData: null, n: 0 });
      x.qtd += m.qtd; x.n++; x.ultimaData = m.data;
      if (x.qtd <= 1e-9) x.validades = [];
      else if (m.motivo === 'ajuste' && m.validade) x.validades = [m.validade];
      else if (m.qtd > 0 && m.validade) x.validades.push(m.validade);
    });
  Object.values(s).forEach(function (x) {
    x.qtd = Math.round(x.qtd * 1e6) / 1e6;
    x.validade = x.qtd > 0 && x.validades.length ? x.validades.slice().sort()[0] : null;
    delete x.validades;
  });
  return s;
}
// Quanto de cada ingrediente um pedido consome (base: g, ml ou un)
export function baixaDoPedido(p, ctx) {
  const nx = necessidades([p], ctx), out = {};
  Object.values(nx.compras).forEach(c => { if (c.qtdBase > 0) out[c.ingredienteId] = c.qtdBase; });
  return out;
}
export function assinaturaItensPedido(p) {
  return (p.itens || []).filter(it => it.tipo === 'rec').map(it => it.receitaId + '|' + it.variacaoId + '|' + it.qtd).sort().join(';');
}
// O que fazer com a baixa de estoque de um pedido ao salvar
export function acaoBaixaPedido(statusAntes, statusDepois, temBaixa, assinaturaMudou) {
  const dentro = s => STATUS_COM_BAIXA.indexOf(s) >= 0;
  if (statusDepois === 'cancelado') return 'nada';            // o que já foi usado continua usado
  if (dentro(statusDepois)) {
    if (temBaixa) return assinaturaMudou ? 'atualizar' : 'nada';
    return dentro(statusAntes) ? 'nada' : 'criar';             // pedidos antigos não descontam retroativamente
  }
  return temBaixa ? 'remover' : 'nada';                        // voltou para orçamento ou confirmado
}
// Lista de compras descontando o que já tem
export function comprasComEstoque(compras, saldos, ingredientes) {
  return Object.values(compras).map(function (c) {
    const ing = ingredientes[c.ingredienteId];
    const tem = Math.max(0, (saldos[chaveIng(c.ingredienteId)] || {}).qtd || 0);
    const falta = Math.max(0, c.qtdBase - tem);
    const emb = ing ? paraBase(ing.qtdEmbalagem, ing.unidade) : null;
    const r = Object.assign({}, c, { tem: tem, falta: falta });
    r.embalagensFalta = emb > 0 ? Math.ceil(falta / emb - 1e-9) : null;
    r.custoFalta = emb > 0 ? r.embalagensFalta * (ing.valorPago || 0) : null;
    return r;
  });
}
export function situacaoEstoque(saldo, minimo, hoje, diasAlerta) {
  const q = saldo ? saldo.qtd : 0;
  const r = { qtd: q, negativo: q < -1e-9, abaixoMinimo: numOk(minimo) && minimo > 0 && q < minimo, validade: saldo ? saldo.validade : null };
  if (r.validade && hoje) {
    const d = diasEntre(hoje, r.validade);
    r.diasParaVencer = d; r.vencido = d < 0; r.venceLogo = d >= 0 && d <= (diasAlerta || 0);
  }
  return r;
}
// Produção em vários dias: quanto de cada receita, dia a dia
export function producaoPorDia(pedidos, ctx) {
  const porDia = {};
  (pedidos || []).forEach(p => { (porDia[p.dataEntrega] = porDia[p.dataEntrega] || []).push(p); });
  const out = {};
  Object.keys(porDia).sort().forEach(function (dia) {
    const nx = necessidades(porDia[dia], ctx);
    Object.values(nx.producao).forEach(x => { (out[x.receitaId] = out[x.receitaId] || []).push({ dia: dia, qtdBase: x.qtdBase }); });
  });
  return out;
}
