// Armazenamento no aparelho: IndexedDB, localStorage e diário de segurança.
import { S } from './estado.js';

// ================= Armazenamento local =================
export const Local = (function () {
  let db = null;
  function abrir() {
    return new Promise(function (res) {
      if (!('indexedDB' in window)) return res(null);
      try {
        const r = indexedDB.open('espaco-nave', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('kv');
        r.onsuccess = () => { db = r.result; res(db); };
        r.onerror = () => res(null);
      } catch (e) { res(null); }
    });
  }
  function ler(k) {
    return new Promise(function (res) {
      if (!db) { try { const v = localStorage.getItem('en:' + k); return res(v ? JSON.parse(v) : null); } catch (e) { return res(null); } }
      try {
        const t = db.transaction('kv').objectStore('kv').get(k);
        t.onsuccess = () => res(t.result === undefined ? null : t.result);
        t.onerror = () => res(null);
      } catch (e) { res(null); }
    });
  }
  function gravar(k, v) {
    return new Promise(function (res) {
      if (!db) { try { localStorage.setItem('en:' + k, JSON.stringify(v)); } catch (e) { /* cheio */ } return res(); }
      try {
        const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k);
        t.oncomplete = () => res(); t.onerror = () => res();
      } catch (e) { res(); }
    });
  }
  return { abrir, ler, gravar };
})();
export let timerSalvar = null;
// Diário de segurança: cada alteração vai na hora (de forma síncrona) para o
// localStorage; o banco principal (IndexedDB) é gravado logo depois. Se o app
// fechar no meio, o diário é reaplicado ao abrir.
export function lsLer(k) { try { const v = localStorage.getItem('en:' + k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
export function lsGravar(k, v) { try { localStorage.setItem('en:' + k, JSON.stringify(v)); } catch (e) { /* cheio */ } }
// As anotações do diário e do meta vão para o localStorage uma vez só, ao fim da
// operação em andamento (microtarefa): numa alteração isolada, isso acontece antes de
// qualquer outro evento; numa operação em lote (importar, restaurar backup), evita
// regravar o diário inteiro a cada registro.
export let diarioPendente = [], metaSuja = false, descargaAgendada = false;
export const LIMITE_DIARIO = 400;
 // acima disso, grava direto no banco do aparelho (mais rápido que o diário)
export function descarregar() {
  descargaAgendada = false;
  if (diarioPendente.length) {
    if (diarioPendente.length <= LIMITE_DIARIO) { const d = lsLer('diario') || []; lsGravar('diario', d.concat(diarioPendente)); }
    else { clearTimeout(timerSalvar); timerSalvar = setTimeout(gravarJa, 0); }
    diarioPendente = [];
  }
  if (metaSuja) { metaSuja = false; lsGravar('meta', S.meta); }
}
export function agendarDescarga() { if (!descargaAgendada) { descargaAgendada = true; queueMicrotask(descarregar); } }
export function anotarDiario(entrada) { diarioPendente.push(entrada); agendarDescarga(); }
export function gravarJa() {
  clearTimeout(timerSalvar); timerSalvar = null;
  if (diarioPendente.length) diarioPendente = []; // o banco do aparelho vai receber tudo agora
  const n = (lsLer('diario') || []).length;
  return Promise.all([Local.gravar('dados', S.dados), Local.gravar('fila', S.fila), Local.gravar('meta', S.meta)]).then(function () {
    const d = lsLer('diario') || []; lsGravar('diario', d.slice(n));
  });
}
export function salvarLocal() {
  S.meta.salvoEm = Date.now();
  metaSuja = true; agendarDescarga();
  clearTimeout(timerSalvar);
  timerSalvar = setTimeout(gravarJa, 150);
}
export function reaplicarDiario() {
  const d = lsLer('diario') || [];
  d.forEach(function (x) {
    if (!S.dados[x.tabela]) S.dados[x.tabela] = {};
    const loc = S.dados[x.tabela][x.rec.id];
    if (!loc || String(loc.atualizadoEm || '') <= String(x.rec.atualizadoEm || '')) S.dados[x.tabela][x.rec.id] = x.rec;
    if (!x.naFila) return;
    const pend = S.fila.find(m => m.tabela === x.tabela && m.rec.id === x.rec.id);
    if (pend) { if (String(pend.rec.atualizadoEm) < String(x.rec.atualizadoEm)) pend.rec = x.rec; }
    else S.fila.push({ tabela: x.tabela, base: x.base, rec: x.rec });
  });
  return d.length;
}

// Eventos globais desta parte (registrados uma vez, no arranque)
export function eventosArmazenamento() {
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden' && timerSalvar) gravarJa(); });
  window.addEventListener('pagehide', function () { if (timerSalvar) gravarJa(); });
}
