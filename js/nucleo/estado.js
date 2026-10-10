// Estado do app e gravação de registros (com fila para sincronizar).
import * as C from '../motor/index.js';
import { hoje } from './util.js';

export const VERSAO = '6.2.3';
export const TABELAS_LOCAIS = ['ingredientes', 'receitas', 'config', 'clientes', 'pedidos', 'lancamentos', 'estoque', 'contasPagar', 'recorrencias'];
export function dadosVazios() { const d = {}; TABELAS_LOCAIS.forEach(t => { d[t] = {}; }); return d; }
// ================= Estado =================
export const S = {
  dados: dadosVazios(),
  fila: [],
  meta: { modo: null, url: '', pin: '', ultimaSync: '', conflitos: [], tema: 'auto', fonte: 1 },
  sync: { estado: 'demo', msg: '', rodando: false },
  rota: '', editor: null
};
export function lista(t) { return Object.values(S.dados[t] || {}).filter(r => !r.excluidoEm); }
export function cfg() { return C.mesclarConfig(configEfetiva()); }
export function ctxCalc(extra) {
  const receitas = Object.assign({}, S.dados.receitas);
  if (extra) receitas[extra.id] = extra;
  return { ingredientes: S.dados.ingredientes, receitas: receitas, config: configEfetiva() };
}
export let memoMedia = { chave: '', v: null };
export function mediaContas() {
  const chave = (S.versao || 0) + '|' + hoje();
  if (memoMedia.chave !== chave) memoMedia = { chave: chave, v: C.mediaContasFixas(lista('lancamentos'), hoje()) };
  return memoMedia.v;
}
export function configEfetiva() { return Object.assign({}, S.dados.config.geral || {}, { mediaContasFixas: mediaContas().media }); }
