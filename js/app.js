// Arranque do app: liga as peças e abre a primeira tela.
import { gravarRegistro } from './nucleo/registros.js';
import { gerarContasRecorrentes } from './servicos/financeiro.js';
import { aoAcontecer } from './nucleo/ganchos.js';
import * as C from './motor/index.js';
import { ACOES_ATUALIZACAO } from './nucleo/atualizacao.js';
import { ACOES_AGENDA } from './telas/agenda.js';
import { ACOES_AJUSTES, atualizarEstadoAjustes } from './telas/ajustes.js';
import { ACOES_BOAS_VINDAS } from './telas/boas-vindas.js';
import { ACOES_CAIXA } from './telas/caixa.js';
import { ACOES_CARDAPIO } from './telas/cardapio.js';
import { ACOES_CLIENTES } from './telas/clientes.js';
import { ACOES_COMPRAS, eventosCompras } from './telas/compras.js';
import { ACOES_CONTAS } from './telas/contas.js';
import { ACOES_ESTOQUE } from './telas/estoque.js';
import { ACOES_IMPORTAR_COMPRAS } from './telas/importar-compras.js';
import { ACOES_INGREDIENTES } from './telas/ingredientes.js';
import { ACOES_LANCAMENTO } from './telas/lancamento.js';
import { ACOES_PEDIDOS } from './telas/pedidos.js';
import { ACOES_PRODUCAO } from './telas/producao.js';
import { ACOES_PROLABORE } from './telas/prolabore.js';
import { ACOES_RECEBER } from './telas/receber.js';
import { ACOES_RECEITAS } from './telas/receitas.js';
import { ACOES_RELATORIOS } from './telas/relatorios.js';
import { ACOES_VITRINE } from './telas/vitrine.js';
import { eventosAcoes, registrarAcoes } from './nucleo/acoes.js';
import { eventosArmazenamento } from './nucleo/armazenamento.js';
import { eventosRotas } from './nucleo/rotas.js';
import { eventosAjustes } from './telas/ajustes.js';
import { eventosBoasVindas } from './telas/boas-vindas.js';
import { eventosCaixa } from './telas/caixa.js';
import { eventosImportarCompras } from './telas/importar-compras.js';
import { eventosProducao } from './telas/producao.js';
import { Local, gravarJa, lsLer, reaplicarDiario } from './nucleo/armazenamento.js';
import { avisoAtualizacao } from './nucleo/atualizacao.js';
import { S, dadosVazios } from './nucleo/estado.js';
import { aplicarTema } from './nucleo/interface.js';
import { render } from './nucleo/rotas.js';
import { agendarSync, atualizarPilula, sincronizar } from './nucleo/sincronizacao.js';

// ================= Início do app =================
export async function iniciar() {
  await Local.abrir();
  const [d, f, m] = await Promise.all([Local.ler('dados'), Local.ler('fila'), Local.ler('meta')]);
  if (d) { S.dados = Object.assign(dadosVazios(), d); }
  if (Array.isArray(f)) S.fila = f;
  if (m) S.meta = Object.assign(S.meta, m);
  const mRapida = lsLer('meta');
  if (mRapida && (mRapida.salvoEm || 0) > (S.meta.salvoEm || 0)) S.meta = Object.assign(S.meta, mRapida);
  if (reaplicarDiario()) gravarJa();
  if (!Array.isArray(S.meta.conflitos)) S.meta.conflitos = [];
  S.sync.estado = S.meta.modo === 'planilha' ? 'ok' : 'demo';
  aplicarTema();
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', aplicarTema);
  render(true);
  if (S.meta.modo === 'planilha') sincronizar();
  window.addEventListener('online', () => sincronizar());
  window.addEventListener('offline', () => { if (S.meta.modo === 'planilha') { S.sync.estado = 'offline'; atualizarPilula(); } });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') sincronizar(); });
  setInterval(() => { if (document.visibilityState === 'visible') sincronizar(); }, 60000);
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    // Versão nova: o service worker baixa em segundo plano; quando assume, o app oferece recarregar.
    const tinhaControle = !!navigator.serviceWorker.controller;
    let avisou = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (!tinhaControle || avisou) return; // primeira instalação não é atualização
      avisou = true; avisoAtualizacao();
    });
    navigator.serviceWorker.register('sw.js').then(function (reg) {
      S.swReg = reg;
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
      setInterval(() => reg.update().catch(() => {}), 30 * 60 * 1000);
    }).catch(() => {});
  }
}

// ---------- Ligações: cada parte registra suas ações e seus eventos ----------
function ligar() {
  // o que acontece quando o núcleo avisa (ver nucleo/ganchos.js)
  aoAcontecer('registroGravado', () => { agendarSync(1500); atualizarPilula(); });
  aoAcontecer('antesDeDesenhar', gerarContasRecorrentes);
  aoAcontecer('depoisDeSincronizar', gerarContasRecorrentes);
  aoAcontecer('dadosMudaram', () => render(false));
  aoAcontecer('estadoDaSincronizacao', atualizarEstadoAjustes);
  // ações dos botões (data-acao) de cada parte
  registrarAcoes('atualizacao', ACOES_ATUALIZACAO);
  registrarAcoes('agenda', ACOES_AGENDA);
  registrarAcoes('ajustes', ACOES_AJUSTES);
  registrarAcoes('boas-vindas', ACOES_BOAS_VINDAS);
  registrarAcoes('caixa', ACOES_CAIXA);
  registrarAcoes('cardapio', ACOES_CARDAPIO);
  registrarAcoes('clientes', ACOES_CLIENTES);
  registrarAcoes('compras', ACOES_COMPRAS);
  registrarAcoes('contas', ACOES_CONTAS);
  registrarAcoes('estoque', ACOES_ESTOQUE);
  registrarAcoes('importar-compras', ACOES_IMPORTAR_COMPRAS);
  registrarAcoes('ingredientes', ACOES_INGREDIENTES);
  registrarAcoes('lancamento', ACOES_LANCAMENTO);
  registrarAcoes('pedidos', ACOES_PEDIDOS);
  registrarAcoes('producao', ACOES_PRODUCAO);
  registrarAcoes('prolabore', ACOES_PROLABORE);
  registrarAcoes('receber', ACOES_RECEBER);
  registrarAcoes('receitas', ACOES_RECEITAS);
  registrarAcoes('relatorios', ACOES_RELATORIOS);
  registrarAcoes('vitrine', ACOES_VITRINE);
  eventosAcoes();
  eventosArmazenamento();
  eventosRotas();
  eventosAjustes();
  eventosBoasVindas();
  eventosCaixa();
  eventosImportarCompras();
  eventosProducao();
  eventosCompras();
}

ligar();
// Exposto para os testes automatizados
window.__EN = { S: S, C: C, gravarRegistro: gravarRegistro, sincronizar: sincronizar, render: render };
iniciar();
