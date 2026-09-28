// Motor: Números, moeda e porcentagem.
// Funções puras: não tocam na tela, na rede nem no armazenamento.

// ---------- Números ----------
export function numOk(v) { return typeof v === 'number' && isFinite(v); }
export function lerNum(v) {
  if (numOk(v)) return v;
  if (v === null || v === undefined) return null;
  let s = String(v).trim().replace(/\s|R\$/g, '');
  if (!s) return null;
  if (s.indexOf(',') >= 0) s = s.replace(/\./g, '').replace(',', '.');
  const n = Number(s);
  return isFinite(n) ? n : null;
}
export const fmtMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export function brl(v, casas) {
  if (!numOk(v)) return '—';
  if (casas && casas !== 2) {
    return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
  }
  return fmtMoeda.format(v);
}
export function num(v, casas) {
  if (!numOk(v)) return '—';
  const c = casas === undefined ? 2 : casas;
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: c });
}
export function pct(v, casas) {
  if (!numOk(v)) return '—';
  return (v * 100).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: casas === undefined ? 1 : casas }) + '%';
}
