// Serviço de caixa: movimentos, origens e categorias.
import * as C from '../motor/index.js';
import { lista } from '../nucleo/estado.js';
import { nomeCliente } from './pedidos.js';

export function movsTodos() { return C.movimentos(lista('pedidos'), lista('lancamentos'), nomeCliente); }
export function fontesConhecidas(tipo) {
  const base = tipo === 'saida' ? C.CATEGORIAS_PADRAO : C.ORIGENS_PADRAO;
  const usadas = lista('lancamentos').filter(l => (l.tipo === 'saida') === (tipo === 'saida')).map(l => l.categoria).filter(Boolean);
  const vistos = {}, out = [];
  base.concat(usadas).forEach(f => { const k = C.semAcento(f); if (!vistos[k] && k !== C.semAcento(C.FONTE_PEDIDOS)) { vistos[k] = 1; out.push(f); } });
  return out;
}
export function fonteCanonica(nome, tipo) {
  const k = C.semAcento(nome);
  return fontesConhecidas(tipo).find(f => C.semAcento(f) === k) || String(nome || '').trim();
}
export function formaTxt(f) { return C.FORMAS_LANCAMENTO[f] || ''; }
