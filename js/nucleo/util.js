// Utilidades: DOM, texto, datas e formatos.
import * as C from '../motor/index.js';

// ================= Utilidades =================
export const $ = (s, r) => (r || document).querySelector(s);
export const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
export function esc(s) { return String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
export function uid() { return (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10)); }
export function agoraISO() { return new Date().toISOString(); }
export function clone(o) { return JSON.parse(JSON.stringify(o)); }
export function inNum(v) { return C.numOk(v) ? String(Math.round(v * 10000) / 10000).replace('.', ',') : ''; }
export function dataBR(iso) { if (!iso) return '—'; const d = new Date(iso); return isNaN(d) ? '—' : d.toLocaleDateString('pt-BR'); }
export function dataHoraBR(iso) { if (!iso) return '—'; const d = new Date(iso); return isNaN(d) ? '—' : d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); }
export function normBusca(s) { return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
export function rotUn(u) { const n = C.normUn(u); return n ? C.UNIDADES[n].rotulo : (u || ''); }
export function porBaseTxt(ing) { const c = C.custoIngrediente(ing); return c ? C.brl(c.porBase, 4) + '/' + c.base : '—'; }
export const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
export function hoje() { return C.dataISO(); }
export function dataDia(iso) { const d = C.paraData(iso); return d ? iso.split('-').reverse().join('/') : '—'; }
export function dataCurta(iso) {
  const d = C.paraData(iso); if (!d) return 'sem data';
  const dif = C.diasEntre(hoje(), iso);
  const dm = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
  if (dif === 0) return 'hoje, ' + dm;
  if (dif === 1) return 'amanhã, ' + dm;
  if (dif === -1) return 'ontem, ' + dm;
  return ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'][d.getDay()] + ', ' + dm;
}
