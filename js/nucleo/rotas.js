// Rotas (#/...) e desenho da tela atual.
import { S, VERSAO } from './estado.js';
import { disparar } from './ganchos.js';
import { I } from './icones.js';
import { confirmar } from './interface.js';
import { atualizarPilula } from './sincronizacao.js';
import { $, $$ } from './util.js';
import { telaAgenda } from '../telas/agenda.js';
import { telaAjustes } from '../telas/ajustes.js';
import { telaBoasVindas } from '../telas/boas-vindas.js';
import { telaCaixa } from '../telas/caixa.js';
import { montarTelaCardapio, telaCardapio } from '../telas/cardapio.js';
import { montarFiltroClientes, telaCliente, telaClientes } from '../telas/clientes.js';
import { telaCompras, telaComprasFeitas } from '../telas/compras.js';
import { telaContas } from '../telas/contas.js';
import { montarContagem, montarFiltroEstoque, telaContagem, telaEstoque } from '../telas/estoque.js';
import { telaImportarCompras } from '../telas/importar-compras.js';
import { montarFiltroIngredientes, telaIngredientes } from '../telas/ingredientes.js';
import { telaInicio } from '../telas/inicio.js';
import { montarEditorLancamento, telaEditorLancamento } from '../telas/lancamento.js';
import { montarEditorPedido, montarFiltroPedidos, telaEditorPedido, telaPedidos } from '../telas/pedidos.js';
import { telaProducao } from '../telas/producao.js';
import { telaProLabore } from '../telas/prolabore.js';
import { telaReceber } from '../telas/receber.js';
import { montarEditor, montarFiltroReceitas, telaEditorReceita, telaReceitas } from '../telas/receitas.js';
import { telaRelatorios } from '../telas/relatorios.js';

// ================= Navegação =================
export const NAV = [
  { h: '#/inicio', t: 'Início', i: I.inicio },
  { h: '#/pedidos', t: 'Loja', i: I.loja },
  { h: '#/caixa', t: 'Caixa', i: I.caixa },
  { h: '#/receitas', t: 'Receitas', i: I.receitas },
  { h: '#/clientes', t: 'Clientes', i: I.clientes },
  { h: '#/ajustes', t: 'Ajustes', i: I.ajustes }
];
export function ir(h) { location.hash = h; }
export let ignorarHash = false, hashAnterior = '';
// Muda o endereço (#/...) sem redesenhar a tela (ex.: depois de salvar um item novo)
export function trocarEnderecoSemDesenhar(h) { ignorarHash = true; location.hash = h; }
export function secaoAtiva(h) {
  if (/^#\/lancamento\/[^?]*\?(.*&)?(compra=1|de=compras)/.test(h)) return '#/pedidos'; // compra aberta pela Loja
  const r = h.split('?')[0].replace(/^(#\/[^#]*)#.*$/, '$1');
  if (r.startsWith('#/receita') || r === '#/ingredientes' || r === '#/cardapio') return '#/receitas';
  if (r.startsWith('#/pedido') || ['#/agenda', '#/producao', '#/compras', '#/importar-compras', '#/estoque', '#/contagem'].includes(r)) return '#/pedidos';
  if (r.startsWith('#/cliente')) return '#/clientes';
  if (r === '#/caixa' || r.startsWith('#/lancamento') || ['#/contas', '#/receber', '#/reserva', '#/prolabore', '#/relatorios'].includes(r)) return '#/caixa';
  return NAV.some(n => n.h === r) ? r : '#/inicio';
}
export function casca(conteudo) {
  const ativa = secaoAtiva(location.hash || '#/inicio');
  const links = NAV.map(n => '<a href="' + n.h + '"' + (n.h === ativa ? ' aria-current="page"' : '') + '>' + n.i + '<span>' + n.t + '</span></a>').join('');
  return '<div class="app">' +
    '<aside class="lateral"><a class="marca-lat" href="#/inicio"><span class="logo-selo" role="img" aria-label="Doce Astro, doces artesanais"></span></a>' +
    '<nav aria-label="Seções">' + links + '</nav>' +
    '<div class="rodape-lat">Espaço Nave ' + VERSAO + '</div></aside>' +
    '<div class="principal-col"><header class="topo"><a class="marca" href="#/inicio"><span class="emblema"><span class="logo-estrela"></span></span><b>Doce Astro</b></a><span class="espaco"></span>' +
    '<button type="button" class="pilula-sync" id="pilula-sync" data-acao="pilula"></button>' +
    '<a class="btn-icone" href="#/ajustes" aria-label="Ajustes">' + I.ajustes + '</a></header>' +
    '<main class="conteudo" id="conteudo">' + conteudo + '</main></div>' +
    '<nav class="nav-baixo" aria-label="Seções">' + links + '</nav></div>';
}
export function render(trocouRota) {
  const h = location.hash || '#/inicio';
  const mudou = trocouRota || h !== S.rota;
  // Ao trocar de tela (inclusive pelo botão Voltar), nenhuma janela fica aberta por cima
  if (h !== S.rota) $$('dialog.folha[open]').forEach(d => d.close());
  const y = window.scrollY;
  const raiz = $('#raiz');
  if (!S.meta.modo) { raiz.innerHTML = telaBoasVindas(); S.rota = h; return; }
  let html;
  const [caminhoAncora, busca] = h.replace(/^#\//, '').split('?');
  const [caminho, ancora] = caminhoAncora.split('#');
  const partes = caminho.split('/');
  const q = new URLSearchParams(busca || '');
  disparar('antesDeDesenhar');
  const tipoEditor = { receita: 'receita', pedido: 'pedido', lancamento: 'lancamento', contagem: 'contagem' }[partes[0]];
  if (!S.editor || S.editor.tipo !== tipoEditor) S.editor = null;
  switch (partes[0]) {
    case 'receitas': html = telaReceitas(); break;
    case 'receita': html = telaEditorReceita(decodeURIComponent(partes[1] || 'nova')); break;
    case 'ingredientes': html = telaIngredientes(); break;
    case 'cardapio': html = telaCardapio(); break;
    case 'pedidos': html = telaPedidos(q); break;
    case 'pedido': html = telaEditorPedido(decodeURIComponent(partes[1] || 'novo'), q); break;
    case 'agenda': html = telaAgenda(); break;
    case 'producao': html = telaProducao(); break;
    case 'importar-compras': html = telaImportarCompras(); break;
    case 'compras':
      if (q.get('v') === 'feitas') { html = telaComprasFeitas(); break; }
      if (q.get('de') && q.get('ate')) S.compras = Object.assign(S.compras || { orc: false }, { de: q.get('de'), ate: q.get('ate') });
      html = telaCompras(); break;
    case 'caixa': html = telaCaixa(); break;
    case 'contas': html = telaContas(); break;
    case 'receber': html = telaReceber(); break;
    case 'reserva': case 'prolabore': html = telaProLabore(); break;
    case 'relatorios': html = telaRelatorios(); break;
    case 'estoque': html = telaEstoque(q); break;
    case 'contagem': html = telaContagem(); break;
    case 'lancamento': html = telaEditorLancamento(decodeURIComponent(partes[1] || 'novo'), q); break;
    case 'clientes': html = telaClientes(); break;
    case 'cliente': html = telaCliente(decodeURIComponent(partes[1] || '')); break;
    case 'ajustes': html = telaAjustes(); break;
    default: html = telaInicio();
  }
  raiz.innerHTML = casca(html);
  atualizarPilula();
  hashAnterior = h; S.rota = h;
  if (mudou) window.scrollTo(0, 0); else window.scrollTo(0, y);
  if (ancora && mudou) { const alvo = document.getElementById(ancora); if (alvo) setTimeout(() => alvo.scrollIntoView({ block: 'start' }), 0); }
  const abaAtual = $('.abas a[aria-current="page"]');
  if (abaAtual && abaAtual.parentElement.scrollWidth > abaAtual.parentElement.clientWidth) abaAtual.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  if (partes[0] === 'receita') montarEditor();
  if (partes[0] === 'ingredientes') montarFiltroIngredientes();
  if (partes[0] === 'receitas') montarFiltroReceitas();
  if (partes[0] === 'pedido') montarEditorPedido();
  if (partes[0] === 'pedidos') montarFiltroPedidos();
  if (partes[0] === 'clientes') montarFiltroClientes();
  if (partes[0] === 'lancamento') montarEditorLancamento();
  if (partes[0] === 'estoque') montarFiltroEstoque();
  if (partes[0] === 'contagem') montarContagem();
  if (partes[0] === 'cardapio') montarTelaCardapio();
}

// Eventos globais desta parte (registrados uma vez, no arranque)
export function eventosRotas() {
  window.addEventListener('hashchange', async function () {
    if (ignorarHash) { ignorarHash = false; return; }
    if (S.editor && S.editor.sujo) {
      const alvo = location.hash;
      trocarEnderecoSemDesenhar(hashAnterior);
      const ok = await confirmar('Sair sem salvar?', 'As alterações ainda não foram salvas.', 'Descartar alterações', true);
      if (!ok) return;
      S.editor = null; ignorarHash = false; location.hash = alvo; return;
    }
    render(true);
  });
  window.addEventListener('beforeunload', function (e) { if (S.editor && S.editor.sujo) { e.preventDefault(); e.returnValue = ''; } });
}
