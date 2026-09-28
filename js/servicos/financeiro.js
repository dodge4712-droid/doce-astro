// Serviço financeiro: contas recorrentes e pró-labore.
import * as C from '../motor/index.js';
import { S, configEfetiva, ctxCalc, lista } from '../nucleo/estado.js';
import { gravarRegistro } from '../nucleo/registros.js';
import { hoje } from '../nucleo/util.js';
import { movsTodos } from './caixa.js';
import { nomeCliente } from './pedidos.js';

// ---------- Recorrentes: cria a conta do mês ----------
export let memoRec = '';
export function gerarContasRecorrentes(forcar) {
  if (!S.meta.modo) return;
  // Com planilha, só gera depois de sincronizar nesta sessão (para não duplicar uma conta já paga em outro aparelho)
  if (S.meta.modo === 'planilha' && !S.syncOkNestaSessao) return;
  const chave = hoje() + '|' + (S.versao || 0);
  if (!forcar && memoRec === chave) return;
  const novas = C.contasRecorrentesAGerar(lista('recorrencias'), S.dados.contasPagar, hoje());
  novas.forEach(c => gravarRegistro('contasPagar', c));
  memoRec = hoje() + '|' + (S.versao || 0);
}
// ---------- Pró-labore e reserva ----------
export function calcProLabore() { return C.proLaboreDisponivel(lista('pedidos'), lista('lancamentos'), ctxCalc(), nomeCliente); }
export function dinheiroNoCaixa() {
  const saldo = C.resumoCaixa(movsTodos()).saldo;
  const res = C.resumoReserva(lista('lancamentos'), configEfetiva(), hoje().slice(0, 7), 0).saldo;
  return C.round2(saldo - res);
}
