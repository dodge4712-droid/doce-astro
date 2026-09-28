// Serviço de estoque: movimentos, saldos, baixas e vitrine.
import * as C from '../motor/index.js';
import { S, cfg, ctxCalc, lista } from '../nucleo/estado.js';
import { p } from '../nucleo/icones.js';
import { excluirRegistro, gravarRegistro } from '../nucleo/registros.js';
import { agoraISO, hoje, uid } from '../nucleo/util.js';
import { nomeCliente } from './pedidos.js';

// ================= Estoque =================
export function modoEstoque() { return cfg().estoqueModo || 'manual'; }
export function movsEstoque() { return lista('estoque'); }
export function saldos() { return C.saldosEstoque(movsEstoque()); }
export function nomeVitrine(item) {
  const [, rid, vid] = item.split(':');
  const r = S.dados.receitas[rid], v = r && (r.variacoes || []).find(x => x.id === vid);
  return r ? (r.nome || 'Receita') + ' (' + (v ? v.nome || 'opção' : 'opção removida') + ')' : 'Produto removido';
}
export function registrarMov(item, qtd, motivo, extra) {
  if (!C.numOk(qtd) || Math.abs(qtd) < 1e-9) return null;
  const ing = item.startsWith('ing:') ? S.dados.ingredientes[item.slice(4)] : null;
  const m = Object.assign({ id: uid(), item: item, nome: ing ? ing.nome : nomeVitrine(item), qtd: Math.round(qtd * 10000) / 10000, motivo: motivo, data: hoje(), ref: '', validade: '', obs: '' }, extra || {});
  gravarRegistro('estoque', m);
  return m;
}
export function removerMovsRef(ref) {
  let n = 0;
  movsEstoque().filter(m => m.ref === ref).forEach(m => { excluirRegistro('estoque', m.id); n++; });
  return n;
}
// Pedido: desconta os ingredientes quando entra em produção (modo completo)
export function aplicarBaixaEstoquePedido(orig, p) {
  const temBaixa = !!(orig && orig.baixaEstoque);
  if (modoEstoque() !== 'completo' && !temBaixa) return;
  const assin = C.assinaturaItensPedido(p);
  const acao = C.acaoBaixaPedido(orig ? orig.status : null, p.status, temBaixa, temBaixa && orig.baixaEstoque.assinatura !== assin);
  const ref = 'ped:' + p.id;
  if (acao === 'remover' || acao === 'atualizar') { removerMovsRef(ref); delete p.baixaEstoque; }
  if (acao === 'criar' || acao === 'atualizar') {
    const bx = C.baixaDoPedido(p, ctxCalc());
    Object.keys(bx).forEach(id => registrarMov(C.chaveIng(id), -bx[id], 'producao', { ref: ref, obs: 'Pedido de ' + nomeCliente(p), data: hoje() }));
    p.baixaEstoque = { assinatura: assin, em: agoraISO() };
  }
}
// Caixa: compra de ingredientes soma ao estoque (modo completo)
export function aplicarEstoqueCompra(l, excluindo) {
  const ref = 'compra:' + l.id;
  const tinha = movsEstoque().some(m => m.ref === ref);
  if (tinha) removerMovsRef(ref);
  if (excluindo || modoEstoque() !== 'completo' || l.tipo !== 'saida') return;
  (l.itensCompra || []).forEach(function (it) {
    const qb = C.paraBase(it.qtdEmbalagem, it.unidade) * it.embalagens;
    if (qb > 0) registrarMov(C.chaveIng(it.ingredienteId), qb, 'compra', { ref: ref, data: l.data, validade: it.validade || '', obs: l.descricao || '' });
  });
}
// Colocar na vitrine (no modo completo, desconta os ingredientes usados)
export function colocarNaVitrine(chave, n, validade, obs) {
  const [, rid, vid] = chave.split(':');
  const fixosUnit = C.fixosItemPedido({ tipo: 'rec', receitaId: rid, variacaoId: vid }, ctxCalc()); // parte das contas fixas no momento
  const m = registrarMov(chave, n, 'vitrine', { validade: validade || '', obs: obs || '', fixosUnit: fixosUnit });
  if (modoEstoque() === 'completo' && m) {
    const bx = C.baixaDoPedido({ itens: [{ tipo: 'rec', receitaId: rid, variacaoId: vid, qtd: n }] }, ctxCalc());
    Object.keys(bx).forEach(id => registrarMov(C.chaveIng(id), -bx[id], 'producao', { ref: 'vit:' + m.id, obs: 'Vitrine: ' + nomeVitrine(chave) }));
  }
  return m;
}
