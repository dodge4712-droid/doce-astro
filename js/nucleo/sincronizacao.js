// Sincronização com a Planilha do Google.
import { salvarLocal } from './armazenamento.js';
import { S } from './estado.js';
import { disparar } from './ganchos.js';
import { I } from './icones.js';
import { toast } from './interface.js';
import { $, agoraISO, clone, esc, uid } from './util.js';

// ================= Sincronização =================
export let timerSync = null;
export function agendarSync(ms) { clearTimeout(timerSync); timerSync = setTimeout(sincronizar, ms || 0); }
export async function chamar(corpo) {
  const r = await fetch(S.meta.url, {
    method: 'POST', redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(corpo)
  });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}
export const ERROS = {
  pin: 'PIN incorreto. Confira em Ajustes.',
  bloqueado: 'Muitas tentativas com PIN errado. Aguarde 10 minutos.',
  sem_pin: 'A planilha ainda não tem PIN. Rode a função "instalar" no Apps Script.',
  servidor: 'A planilha respondeu com erro.',
  formato: 'Resposta inválida da planilha.'
};
export async function sincronizar() {
  if (S.meta.modo !== 'planilha' || !S.meta.url) { S.sync.estado = 'demo'; atualizarPilula(); return; }
  if (S.sync.rodando) { agendarSync(3000); return; }
  if (!navigator.onLine) { S.sync.estado = 'offline'; atualizarPilula(); return; }
  S.sync.rodando = true; S.sync.estado = 'enviando'; atualizarPilula();
  const enviados = S.fila.map(m => ({ tabela: m.tabela, id: m.rec.id, em: m.rec.atualizadoEm }));
  try {
    const resp = await chamar({ acao: 'sync', pin: S.meta.pin, desde: S.meta.ultimaSync, mudancas: S.fila.map(clone) });
    if (!resp || !resp.ok) {
      S.sync.estado = resp && resp.erro === 'pin' ? 'pin' : 'erro';
      S.sync.msg = ERROS[resp && resp.erro] || 'Não foi possível sincronizar.';
    } else {
      // tira da fila o que foi enviado e não mudou depois
      S.fila = S.fila.filter(m => !enviados.some(e => e.tabela === m.tabela && e.id === m.rec.id && e.em === m.rec.atualizadoEm));
      const pendentes = new Set(S.fila.map(m => m.tabela + ':' + m.rec.id));
      let mudouAlgo = false;
      (resp.registros || []).forEach(function (x) {
        if (!S.dados[x.tabela]) S.dados[x.tabela] = {};
        if (pendentes.has(x.tabela + ':' + x.rec.id)) return;
        const loc = S.dados[x.tabela][x.rec.id];
        if (!loc || loc.atualizadoEm !== x.rec.atualizadoEm) { S.dados[x.tabela][x.rec.id] = x.rec; mudouAlgo = true; }
      });
      const semData = r => { const x = Object.assign({}, r || {}); delete x.atualizadoEm; delete x.criadoEm; return JSON.stringify(x, Object.keys(x).sort()); };
      resp.conflitos = (resp.conflitos || []).filter(function (c) {
        if (c.vencedora) { S.dados[c.tabela][c.id] = c.vencedora; mudouAlgo = true; }
        return !(c.perdida && c.vencedora && semData(c.perdida) === semData(c.vencedora)); // mesma coisa criada nos dois aparelhos: não é conflito
      });
      resp.conflitos.forEach(function (c) {
        if (c.perdida) S.meta.conflitos.push({ id: uid(), tabela: c.tabela, regId: c.id, em: agoraISO(), perdida: c.perdida, vencedora: c.vencedora });
      });
      S.meta.ultimaSync = resp.agora;
      S.sync.estado = 'ok'; S.sync.msg = ''; S.syncOkNestaSessao = true;
      if (mudouAlgo) S.versao = (S.versao || 0) + 1;
      disparar('depoisDeSincronizar');
      salvarLocal();
      if ((resp.conflitos || []).length) toast((resp.conflitos.length === 1 ? 'Um registro foi alterado em dois aparelhos.' : resp.conflitos.length + ' registros foram alterados em dois aparelhos.') + ' Confira a versão que ficou de fora.', 'Ver', () => { location.hash = '#/ajustes'; });
      if (mudouAlgo && !(S.editor && S.editor.sujo)) { S.editor = null; disparar('dadosMudaram'); }
      if (S.fila.length) agendarSync(1000);
    }
  } catch (e) {
    S.sync.estado = navigator.onLine ? 'erro' : 'offline';
    S.sync.msg = navigator.onLine ? 'Não foi possível falar com a planilha. Confira o endereço em Ajustes.' : '';
  } finally {
    S.sync.rodando = false; atualizarPilula();
  }
}
export function textoSync() {
  const n = S.fila.length;
  const pend = n === 1 ? '1 alteração aguardando envio' : n + ' alterações aguardando envio';
  switch (S.sync.estado) {
    case 'demo': return { e: 'demo', t: 'Só neste aparelho', i: I.celular };
    case 'enviando': return { e: 'enviando', t: 'Sincronizando', i: I.girar };
    case 'offline': return { e: 'offline', t: n ? 'Sem internet: ' + pend : 'Sem internet', i: I.semNuvem };
    case 'erro': return { e: 'erro', t: 'Erro ao sincronizar', i: I.alerta };
    case 'pin': return { e: 'pin', t: 'PIN incorreto', i: I.alerta };
    default: return n ? { e: 'pendente', t: pend, i: I.nuvem } : { e: 'ok', t: 'Sincronizado', i: I.nuvem };
  }
}
export function atualizarPilula() {
  const el = $('#pilula-sync'); if (!el) return;
  const s = textoSync();
  el.dataset.estado = s.e; el.innerHTML = s.i + '<span>' + esc(s.t) + '</span>';
  disparar('estadoDaSincronizacao');
  el.title = S.sync.msg || s.t;
}
