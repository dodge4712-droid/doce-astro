// Motor: Configuração da doceria e custos fixos.
// Funções puras: não tocam na tela, na rede nem no armazenamento.
import { numOk } from './numeros.js';

// ---------- Configuração ----------
export const CONFIG_PADRAO = {
  id: 'geral',
  custosFixos: [
    { nome: 'Aluguel', valor: null },
    { nome: 'Energia', valor: null },
    { nome: 'Gás', valor: null },
    { nome: 'Água', valor: null },
    { nome: 'Internet/Telefone', valor: null },
    { nome: 'MEI', valor: null }
  ],
  horasMes: 120,
  maoObra: { modo: 'hora', valorHora: 15, salario: null, horasTrabalhadas: 120 },
  taxas: { debito: 1.99, credito: 4.98, parcelado: 9.9, app: 23, entrega: 8 },
  margemPadrao: 40,
  margemAlerta: 25,
  sinalPadraoPct: 50,
  estoqueModo: 'manual',
  custosFixosFonte: 'manual',
  reservaPct: 10,
  reservaMeta: null,
  metaFaturamento: null,
  metaLucro: null,
  diasAlertaValidade: 3,
  doceria: { nome: 'Doce Astro', instagram: '@doce.astro', telefone: '(11) 91220-9162', email: 'doceastro@gmail.com' }
};
export function mesclarConfig(c) {
  const p = JSON.parse(JSON.stringify(CONFIG_PADRAO));
  if (!c) return p;
  const r = Object.assign(p, c);
  r.maoObra = Object.assign({}, CONFIG_PADRAO.maoObra, c.maoObra || {});
  r.taxas = Object.assign({}, CONFIG_PADRAO.taxas, c.taxas || {});
  r.doceria = Object.assign({}, CONFIG_PADRAO.doceria, c.doceria || {});
  if (!Array.isArray(r.custosFixos)) r.custosFixos = [];
  return r;
}
export function totalFixos(cfg) {
  if (cfg.custosFixosFonte === 'contas' && numOk(cfg.mediaContasFixas)) return cfg.mediaContasFixas;
  return (cfg.custosFixos || []).reduce((s, c) => s + (numOk(c.valor) ? c.valor : 0), 0);
}
export function fixosPorHora(cfg) {
  const t = totalFixos(cfg);
  return numOk(cfg.horasMes) && cfg.horasMes > 0 ? t / cfg.horasMes : null;
}
export function valorHora(cfg) {
  const m = cfg.maoObra || {};
  if (m.modo === 'salario') {
    return numOk(m.salario) && numOk(m.horasTrabalhadas) && m.horasTrabalhadas > 0 ? m.salario / m.horasTrabalhadas : null;
  }
  return numOk(m.valorHora) ? m.valorHora : null;
}
export function taxaCartaoPct(cfg, tipo) {
  const t = cfg.taxas || {};
  if (tipo === 'debito') return t.debito || 0;
  if (tipo === 'credito') return t.credito || 0;
  if (tipo === 'parcelado') return t.parcelado || 0;
  return 0;
}
