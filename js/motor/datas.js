// Motor: Datas no fuso do aparelho (AAAA-MM-DD).
// Funções puras: não tocam na tela, na rede nem no armazenamento.

// ---------- Datas (sempre no fuso do aparelho, formato AAAA-MM-DD) ----------
export function dataISO(d) {
  d = d || new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
export function paraData(iso) { const p = String(iso || '').split('-').map(Number); return p.length === 3 && p[0] ? new Date(p[0], p[1] - 1, p[2]) : null; }
export function somarDias(iso, n) { const d = paraData(iso); if (!d) return null; d.setDate(d.getDate() + n); return dataISO(d); }
export function diasEntre(a, b) { const x = paraData(a), y = paraData(b); return x && y ? Math.round((y - x) / 864e5) : null; }
export function round2(v) { return Math.round((v + Number.EPSILON) * 100) / 100; }
