// Gravação de registros: fila para sincronizar e diário de segurança.
import * as C from '../motor/index.js';
import { anotarDiario, salvarLocal } from './armazenamento.js';
import { S } from './estado.js';
import { disparar } from './ganchos.js';
import { agoraISO, clone } from './util.js';

export let filaIdx = null, filaArr = null;
export function naFila(tabela, id) {
  if (filaArr !== S.fila) { filaIdx = new Map(); S.fila.forEach(m => filaIdx.set(m.tabela + '\u0001' + m.rec.id, m)); filaArr = S.fila; }
  return filaIdx.get(tabela + '\u0001' + id);
}
export function gravarRegistro(tabela, rec) {
  if (tabela === 'config') delete rec.mediaContasFixas; // valor calculado, não é guardado
  S.versao = (S.versao || 0) + 1;
  const ant = S.dados[tabela][rec.id];
  const agora = agoraISO();
  rec.atualizadoEm = agora;
  if (!rec.criadoEm) rec.criadoEm = ant && ant.criadoEm || agora;
  S.dados[tabela][rec.id] = rec;
  const pend = naFila(tabela, rec.id);
  const base = pend ? pend.base : (ant ? ant.atualizadoEm : null);
  if (pend) pend.rec = clone(rec);
  else { const m = { tabela: tabela, base: base, rec: clone(rec) }; S.fila.push(m); filaIdx.set(tabela + '\u0001' + rec.id, m); }
  anotarDiario({ tabela: tabela, rec: clone(rec), base: base, naFila: true });
  salvarLocal();
  disparar('registroGravado');
}
export function excluirRegistro(tabela, id) {
  const r = S.dados[tabela][id]; if (!r) return;
  const c = clone(r); c.excluidoEm = agoraISO();
  gravarRegistro(tabela, c);
}
// ================= Configuração inicial =================
// A lista de ingredientes NÃO fica aqui (o código do site é público).
// Ela é gravada pela planilha na instalação, ou importada no modo de teste.
export function garantirConfig() {
  if (S.dados.config.geral) return false;
  gravarRegistro('config', C.mesclarConfig(null));
  return true;
}
