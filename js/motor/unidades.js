// Motor: Unidades de medida e conversões.
// Funções puras: não tocam na tela, na rede nem no armazenamento.
import { numOk } from './numeros.js';

// ---------- Unidades ----------
export const UNIDADES = {
  g:     { familia: 'massa',   fator: 1,    base: 'g',  rotulo: 'g' },
  kg:    { familia: 'massa',   fator: 1000, base: 'g',  rotulo: 'kg' },
  ml:    { familia: 'volume',  fator: 1,    base: 'ml', rotulo: 'ml' },
  L:     { familia: 'volume',  fator: 1000, base: 'ml', rotulo: 'L' },
  un:    { familia: 'unidade', fator: 1,    base: 'un', rotulo: 'un' },
  duzia: { familia: 'unidade', fator: 12,   base: 'un', rotulo: 'dúzia' }
};
export const ALIAS = { unidade: 'un', unidades: 'un', 'dúzia': 'duzia', l: 'L', KG: 'kg', G: 'g' };
export function normUn(u) {
  if (!u) return null;
  if (UNIDADES[u]) return u;
  return ALIAS[u] || ALIAS[String(u).toLowerCase()] || null;
}
export function unidadesDaFamilia(u) {
  const n = normUn(u); if (!n) return [];
  const f = UNIDADES[n].familia;
  return Object.keys(UNIDADES).filter(k => UNIDADES[k].familia === f);
}
export function paraBase(qtd, u) {
  const n = normUn(u);
  if (!n || !numOk(qtd)) return null;
  return qtd * UNIDADES[n].fator;
}
export function mesmaFamilia(a, b) {
  const x = normUn(a), y = normUn(b);
  return !!(x && y && UNIDADES[x].familia === UNIDADES[y].familia);
}
