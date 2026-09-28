// Motor: Ingredientes: custo, histórico de preço e compras.
// Funções puras: não tocam na tela, na rede nem no armazenamento.
import { dataISO } from './datas.js';
import { numOk } from './numeros.js';
import { UNIDADES, mesmaFamilia, normUn, paraBase } from './unidades.js';

// ---------- Ingrediente ----------
export function custoIngrediente(ing) {
  if (!ing) return null;
  const u = normUn(ing.unidade);
  const qBase = paraBase(ing.qtdEmbalagem, u);
  if (!u || !numOk(qBase) || qBase <= 0 || !numOk(ing.valorPago)) return null;
  return { porBase: ing.valorPago / qBase, base: UNIDADES[u].base };
}
export function variacaoPreco(ing, dias) {
  const h = ordenarHistorico((ing.historico || []).filter(x => numOk(x.porBase)).slice());
  const atual = custoIngrediente(ing);
  if (!atual || h.length < 2) return null;
  const limite = Date.now() - (dias || 90) * 864e5;
  let ref = null;
  for (let i = 0; i < h.length - 1; i++) {
    if (new Date(h[i].data).getTime() >= limite) { ref = h[i]; break; }
    ref = h[i]; // último ponto antes da janela serve de referência
  }
  if (!ref || !(ref.porBase > 0)) return null;
  return { de: ref.porBase, para: atual.porBase, variacao: atual.porBase / ref.porBase - 1, desde: ref.data };
}
// Compra de ingrediente: grava o ponto no histórico (na data da compra) e
// o preço atual passa a ser o do ponto mais recente. Reeditar a mesma compra
// substitui o ponto dela em vez de acrescentar outro.
// Momento de cada ponto do histórico (aceita "AAAA-MM-DD", horário local ou ISO com fuso)
export function momento(x) { const t = new Date(String(x && x.data || '')).getTime(); return isFinite(t) ? t : 0; }
export function ordenarHistorico(h) { return h.sort((a, b) => momento(a) - momento(b)); }
// Compra com data de hoje vale a partir de agora; de outro dia, a partir do fim daquele dia.
export function momentoDaCompra(data) {
  const agora = new Date();
  return data === dataISO(agora) ? agora.toISOString() : new Date(data + 'T23:59:59').toISOString();
}
export function recalcularPrecoAtual(ing) {
  const h = ing.historico || [];
  const ult = h[h.length - 1];
  if (ult && numOk(ult.valorPago) && numOk(ult.qtdEmbalagem) && ult.unidade) {
    ing.valorPago = ult.valorPago; ing.qtdEmbalagem = ult.qtdEmbalagem; ing.unidade = ult.unidade;
  }
  return ing;
}
export function aplicarCompra(ing, it, data, chave) {
  const un = normUn(it.unidade || ing.unidade);
  const tamBase = paraBase(it.qtdEmbalagem, un);
  if (!(it.embalagens > 0) || !(tamBase > 0) || !(numOk(it.valor) && it.valor >= 0) || !mesmaFamilia(un, ing.unidade)) return null;
  const novo = JSON.parse(JSON.stringify(ing));
  const precoEmb = Math.round(it.valor / it.embalagens * 10000) / 10000;
  const ponto = { data: momentoDaCompra(data), valorPago: precoEmb, qtdEmbalagem: it.qtdEmbalagem, unidade: un, porBase: precoEmb / tamBase, compra: chave };
  const h = (novo.historico || []).filter(x => x.compra !== chave);
  h.push(ponto);
  ordenarHistorico(h);
  novo.historico = h;
  const antes = custoIngrediente(ing);
  recalcularPrecoAtual(novo);
  const depois = custoIngrediente(novo);
  return { ing: novo, precoAtualMudou: h[h.length - 1] === ponto, variacao: antes && depois && antes.porBase > 0 ? depois.porBase / antes.porBase - 1 : null };
}
export function removerCompra(ing, chave) {
  if (!(ing.historico || []).some(x => x.compra === chave)) return null;
  const novo = JSON.parse(JSON.stringify(ing));
  novo.historico = ordenarHistorico(novo.historico.filter(x => x.compra !== chave));
  return recalcularPrecoAtual(novo);
}
