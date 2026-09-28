// Tela Caixa → A receber: fiado por cliente e cobrança pelo WhatsApp.
import * as C from '../motor/index.js';
import { S, configEfetiva, ctxCalc, lista } from '../nucleo/estado.js';
import { I } from '../nucleo/icones.js';
import { abas, abrirFolha, cab, copiarTexto } from '../nucleo/interface.js';
import { $, dataCurta, esc, hoje } from '../nucleo/util.js';
import { nomeCliente } from '../servicos/pedidos.js';
import { ABAS_CX } from './caixa.js';
import { chipStatus } from './pedidos.js';

// ---------- A receber (fiado) ----------
export function telaReceber() {
  const ar = C.aReceber(lista('pedidos'), ctxCalc(), nomeCliente);
  S.gruposReceber = ar.grupos;
  let h = cab('A receber', 'Fiado e valores em aberto dos pedidos, por cliente. Ao registrar o pagamento no pedido, ele entra no Movimento.') + abas(ABAS_CX, '#/receber');
  h += '<div class="stats stats-cx" style="grid-template-columns:repeat(2,minmax(0,1fr))"><div class="stat"><div class="r">Entregue, falta pagar</div><div class="n' + (ar.entregue > 0 ? ' neg-txt' : '') + '">' + C.brl(ar.entregue) + '</div></div>' +
    '<div class="stat" style="grid-column:auto"><div class="r">De pedidos ainda não entregues</div><div class="n">' + C.brl(ar.aberto) + '</div></div></div>';
  if (!ar.grupos.length) return h + '<div class="bloco vazio">' + I.emblema + '<h2>Ninguém devendo</h2><p>Quando um pedido é entregue sem o pagamento completo, ou uma venda da vitrine fica no fiado, aparece aqui.</p></div>';
  h += ar.grupos.map(function (g, i) {
    const cli = g.clienteId && S.dados.clientes[g.clienteId];
    return '<section class="bloco"><div class="cab-bloco"><h2>' + esc(g.nome) + '</h2><b class="' + (g.entregue > 0 ? 'neg-txt' : '') + '">' + C.brl(g.total) + '</b></div>' +
      (g.entregue > 0 && g.entregue < g.total ? '<p class="mudo" style="margin:-4px 0 8px">' + C.brl(g.entregue) + ' de pedidos já entregues</p>' : '') +
      '<div class="lista">' + g.itens.map(it => '<a class="item" href="#/pedido/' + encodeURIComponent(it.pedidoId) + '"><div class="principal"><div class="nome">Pedido de ' + esc(dataCurta(it.data)) + '</div><div class="det">' + esc(it.resumo) + '</div></div><div class="valor">falta ' + C.brl(it.restante) + '<small>de ' + C.brl(it.total) + '</small></div><div class="chips">' + chipStatus(it.status) + '</div></a>').join('') + '</div>' +
      '<div class="acoes" style="margin-top:12px">' + (g.entregue > 0 ? '<button type="button" class="btn fino" data-acao="cobrar" data-i="' + i + '">' + I.mensagem + 'Cobrar no WhatsApp</button>' : '') + (cli ? '<a class="btn sec fino" href="#/cliente/' + encodeURIComponent(cli.id) + '">Ver cliente</a>' : '') + '</div></section>';
  }).join('');
  return h;
}
export function folhaCobranca(g) {
  const cli = g.clienteId && S.dados.clientes[g.clienteId];
  const tel = C.telefoneWhats(cli && cli.telefone);
  const corpo = (!tel ? '<div class="aviso">' + I.alerta + '<div class="txt">Cliente sem telefone com DDD. O WhatsApp vai pedir para escolher o contato.</div></div>' : '') +
    '<label class="campo"><span>Texto (pode editar antes de enviar)</span><textarea class="entrada" id="txt-cob" rows="11"></textarea></label>' +
    '<div class="rodape-folha"><button type="button" class="btn sec" id="copiar-cob">' + I.copiar + 'Copiar texto</button><a class="btn" id="abrir-cob" target="_blank" rel="noopener">' + I.mensagem + 'Abrir no WhatsApp</a></div>';
  abrirFolha('Cobrar ' + String(g.nome || '').split(' ')[0], corpo, function (d) {
    const ta = $('#txt-cob', d), a = $('#abrir-cob', d);
    ta.value = C.textoCobranca(g, configEfetiva(), hoje());
    const link = () => { a.href = 'https://wa.me/' + tel + '?text=' + encodeURIComponent(ta.value); };
    ta.addEventListener('input', link); link();
    $('#copiar-cob', d).onclick = () => copiarTexto(ta.value);
  });
}

// Ações dos botões desta parte (data-acao="...")
export const ACOES_RECEBER = {
  cobrar: function (el) { const g = (S.gruposReceber || [])[+el.dataset.i]; if (g) folhaCobranca(g); }
};
