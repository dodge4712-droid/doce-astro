// Telas de pedidos: lista, filtros, formulário, pagamentos e WhatsApp.
import * as C from '../motor/index.js';
import { S, cfg, ctxCalc, lista } from '../nucleo/estado.js';
import { I, p } from '../nucleo/icones.js';
import { abas, abrirFolha, cab, confirmar, copiarTexto, toast } from '../nucleo/interface.js';
import { excluirRegistro, gravarRegistro } from '../nucleo/registros.js';
import { ir, render, trocarEnderecoSemDesenhar } from '../nucleo/rotas.js';
import { $, $$, MESES, agoraISO, clone, dataCurta, dataDia, dataHoraBR, esc, hoje, inNum, normBusca, uid } from '../nucleo/util.js';
import { aplicarBaixaEstoquePedido, removerMovsRef } from '../servicos/estoque.js';
import { ATIVOS, calcPed, nomeCliente } from '../servicos/pedidos.js';
import { aniversarioNoMes, aniversarioTxt } from './clientes.js';
import { gravarCaminho, marcarSujo } from './receitas.js';

export const ABAS_PED = [['#/pedidos', 'Pedidos'], ['#/agenda', 'Agenda'], ['#/producao', 'Produção'], ['#/compras', 'Compras'], ['#/estoque', 'Estoque']];
export function quandoTxt(p) { return (p.tipoEntrega === 'entrega' ? 'Entrega ' : 'Retirada ') + dataCurta(p.dataEntrega) + (p.horaEntrega ? ' às ' + C.horaFalada(p.horaEntrega) : ''); }
export function rotForma(f) { return C.FORMAS_PAGAMENTO[f] ? C.FORMAS_PAGAMENTO[f].rotulo : ''; }
export function chipStatus(s) {
  const cls = { orcamento: 'tracejado', producao: 'alerta', pronto: 'pos', entregue: 'mudo', cancelado: 'neg' }[s] || '';
  return '<span class="chip ' + cls + '">' + esc(C.STATUS_PEDIDO[s] ? C.STATUS_PEDIDO[s].rotulo : s) + '</span>';
}
export function chipPagamento(c, p) {
  if (p.status === 'cancelado' || p.status === 'orcamento') return '';
  if (c.situacao === 'pago') return '<span class="chip pos">' + I.ok + 'pago</span>';
  if (c.situacao === 'parcial') return '<span class="chip alerta">pago em parte</span>';
  if (c.situacao === 'excedente') return '<span class="chip alerta">pago a mais</span>';
  return '<span class="chip">nada pago</span>';
}
export function ordemData(a, b) { return String(a.dataEntrega || '9').localeCompare(String(b.dataEntrega || '9')) || String(a.horaEntrega || '99').localeCompare(String(b.horaEntrega || '99')); }
export function cardPedido(p) {
  const c = calcPed(p);
  const atrasado = ['confirmado', 'producao', 'pronto'].includes(p.status) && p.dataEntrega && p.dataEntrega < hoje();
  const its = p.itens || [];
  const resumo = its.slice(0, 2).map(it => C.num(it.qtd) + 'x ' + (it.nome || 'Item')).join(', ') + (its.length > 2 ? ' e mais ' + (its.length - 2) : '');
  return '<a class="item" href="#/pedido/' + encodeURIComponent(p.id) + '" data-busca="' + esc(normBusca(nomeCliente(p))) + '">' +
    '<div class="principal"><div class="nome">' + esc(nomeCliente(p)) + '</div><div class="det">' + esc(quandoTxt(p)) + '</div><div class="det">' + esc(resumo) + '</div></div>' +
    '<div class="valor">' + C.brl(c.total) + (c.restante > 0.004 && !['cancelado', 'orcamento'].includes(p.status) ? '<small>falta ' + C.brl(c.restante) + '</small>' : '') + '</div>' +
    '<div class="chips">' + chipStatus(p.status) + (atrasado ? '<span class="chip neg">' + I.alerta + 'data já passou</span>' : '') + chipPagamento(c, p) + '</div></a>';
}
export function listaAgrupada(peds) {
  let h = '', ultimo = null;
  peds.forEach(function (p) {
    if (p.dataEntrega !== ultimo) { ultimo = p.dataEntrega; h += '<h3 class="grupo-data">' + esc(dataCurta(p.dataEntrega)) + '</h3>'; }
    h += cardPedido(p);
  });
  return h;
}
// ---------- Lista de pedidos ----------
export const FILTROS_PED = [
  ['ativos', 'Em aberto', p => ATIVOS.includes(p.status)],
  ['orcamento', 'Orçamentos', p => p.status === 'orcamento'],
  ['receber', 'A receber', p => !['cancelado', 'orcamento'].includes(p.status) && calcPed(p).restante > 0.004],
  ['entregues', 'Entregues', p => p.status === 'entregue'],
  ['cancelados', 'Cancelados', p => p.status === 'cancelado'],
  ['todos', 'Todos', () => true]
];
export function telaPedidos(q) {
  const f = FILTROS_PED.find(x => x[0] === q.get('f')) || FILTROS_PED[0];
  const todos = lista('pedidos');
  let h = cab('Pedidos', 'Encomendas, orçamentos e o que falta receber.', '<a class="btn" href="#/pedido/novo">' + I.mais + 'Novo pedido</a>') + abas(ABAS_PED, '#/pedidos');
  if (!todos.length) {
    return h + '<div class="bloco vazio">' + I.emblema + '<h2>Nenhum pedido ainda</h2><p>Registre orçamentos e encomendas. O app monta a agenda, a lista de produção e a lista de compras a partir deles.</p><a class="btn" href="#/pedido/novo">' + I.mais + 'Novo pedido</a></div>';
  }
  const futuros = ['ativos', 'orcamento', 'receber'].includes(f[0]);
  const lst = todos.filter(f[2]).sort(futuros ? ordemData : (a, b) => ordemData(b, a));
  h += '<div class="seg rolavel" role="group" aria-label="Filtrar pedidos" style="margin-bottom:12px">' + FILTROS_PED.map(x => '<a href="#/pedidos?f=' + x[0] + '"' + (x === f ? ' aria-current="true"' : '') + '>' + x[1] + '</a>').join('') + '</div>';
  h += '<div class="linha-campos" style="margin-bottom:14px"><label class="busca"><span class="sr">Buscar por cliente</span>' + I.busca + '<input class="entrada" id="busca-ped" type="search" placeholder="Buscar por cliente"></label></div>';
  if (!lst.length) return h + '<p class="mudo" style="padding:16px 4px">Nenhum pedido neste filtro.</p>';
  if (f[0] === 'receber') {
    const tot = lst.reduce((s, p) => s + calcPed(p).restante, 0);
    h += '<div class="aviso" style="margin-bottom:12px">' + I.alerta + '<div class="txt">Falta receber <b>' + C.brl(tot) + '</b> em ' + lst.length + (lst.length === 1 ? ' pedido.' : ' pedidos.') + '</div></div>';
  }
  h += '<div class="lista" id="lista-ped">' + (futuros ? listaAgrupada(lst) : lst.map(cardPedido).join('')) + '</div><p class="mudo" id="sem-res-ped" hidden style="padding:16px">Nenhum pedido desse cliente neste filtro.</p>';
  return h;
}
export function montarFiltroPedidos() {
  const b = $('#busca-ped'); if (!b) return;
  b.addEventListener('input', function () {
    const q = normBusca(b.value); let n = 0;
    $$('#lista-ped .item').forEach(el => { const v = !q || el.dataset.busca.includes(q); el.hidden = !v; if (v) n++; });
    $$('#lista-ped .grupo-data').forEach(g => { let el = g.nextElementSibling, vis = false; while (el && !el.classList.contains('grupo-data')) { if (!el.hidden) vis = true; el = el.nextElementSibling; } g.hidden = !vis; });
    $('#sem-res-ped').hidden = n > 0;
  });
}
// ---------- Editor de pedido ----------
export function novoPedidoBase(q) {
  const cf = cfg();
  const p = {
    id: uid(), clienteId: '', clienteNome: '', status: 'orcamento', tipoEntrega: 'retirada',
    dataEntrega: '', horaEntrega: '', endereco: '', taxaEntrega: cf.taxas.entrega,
    itens: [], desconto: null, formaPagamento: 'pix', pagamentos: [], obs: '', historicoStatus: []
  };
  const cli = q && q.get('cliente') && S.dados.clientes[q.get('cliente')];
  if (cli && !cli.excluidoEm) { p.clienteId = cli.id; p.clienteNome = cli.nome; p.endereco = cli.endereco || ''; }
  if (q && /^\d{4}-\d{2}-\d{2}$/.test(q.get('data') || '')) p.dataEntrega = q.get('data');
  return p;
}
export function telaEditorPedido(id, q) {
  if (!S.editor || S.editor.tipo !== 'pedido' || S.editor.idRota !== id) {
    let d;
    if (id === 'novo') d = novoPedidoBase(q);
    else if (S.dados.pedidos[id] && !S.dados.pedidos[id].excluidoEm) d = clone(S.dados.pedidos[id]);
    else return '<div class="bloco vazio">' + I.emblema + '<h2>Pedido não encontrado</h2><p>Ele pode ter sido excluído em outro aparelho.</p><a class="btn" href="#/pedidos">Ver pedidos</a></div>';
    d.itens = d.itens || []; d.pagamentos = d.pagamentos || [];
    S.editor = { tipo: 'pedido', idRota: id, nova: id === 'novo', d: d, sujo: false };
  }
  return htmlEditorPedido();
}
export function htmlEditorPedido() {
  const e = S.editor, p = e.d;
  const cli = p.clienteId ? S.dados.clientes[p.clienteId] : null;
  let h = '<div class="cab-pagina"><div class="titulos"><a href="#/pedidos" class="link-btn voltar">' + I.voltar + 'Pedidos</a><h1>' + (e.nova ? 'Novo pedido' : 'Pedido de ' + esc(nomeCliente(p))) + '</h1>' +
    (!e.nova ? '<p class="sub">Registrado em ' + dataHoraBR(p.criadoEm) + '</p>' : '') + '</div></div>';
  h += '<div class="editor"><div class="form-ped">';

  h += '<section class="bloco"><h2>Cliente</h2>' + (cli
    ? '<div class="linha-cliente"><div class="principal"><div class="nome">' + esc(cli.nome) + '</div><div class="det">' + esc(cli.telefone || 'sem telefone') + '</div>' + (cli.obs ? '<div class="aviso" style="margin-top:8px">' + I.alerta + '<div class="txt">' + esc(cli.obs) + '</div></div>' : '') + '</div><div class="acoes"><a class="btn sec fino" href="#/cliente/' + encodeURIComponent(cli.id) + '">Ver ficha</a><button type="button" class="btn sec fino" data-acao="escolher-cliente">Trocar</button></div></div>'
    : '<button type="button" class="btn" data-acao="escolher-cliente">' + I.clientes + 'Escolher cliente</button>') + '</section>';

  h += '<section class="bloco"><h2>Situação</h2>' + (p.status === 'cancelado'
    ? '<div class="aviso neg">' + I.alerta + '<div class="txt">Pedido cancelado. Ele não entra na agenda, na produção nem nas compras. <button type="button" class="link-btn" data-acao="reabrir-ped">Reabrir pedido</button></div></div>'
    : '<div class="seg rolavel" role="group" aria-label="Situação do pedido">' + ['orcamento', 'confirmado', 'producao', 'pronto', 'entregue'].map(s => '<button type="button" data-acao="status-ped" data-v="' + s + '" aria-pressed="' + (p.status === s) + '">' + C.STATUS_PEDIDO[s].rotulo + '</button>').join('') + '</div>') + '</section>';

  h += '<section class="bloco"><h2>Retirada ou entrega</h2><div class="seg" role="group" aria-label="Como o cliente recebe"><button type="button" data-acao="tipo-ent" data-v="retirada" aria-pressed="' + (p.tipoEntrega !== 'entrega') + '">Retirada</button><button type="button" data-acao="tipo-ent" data-v="entrega" aria-pressed="' + (p.tipoEntrega === 'entrega') + '">Entrega</button></div>' +
    '<div class="grade" style="margin-top:14px"><label class="campo"><span>Data</span><input class="entrada" type="date" data-c="dataEntrega" value="' + esc(p.dataEntrega || '') + '"></label>' +
    '<label class="campo"><span>Horário</span><input class="entrada" type="time" data-c="horaEntrega" value="' + esc(p.horaEntrega || '') + '"></label>' +
    (p.tipoEntrega === 'entrega' ? '<label class="campo"><span>Endereço</span><input class="entrada" data-c="endereco" value="' + esc(p.endereco || '') + '" placeholder="Rua, número, bairro"></label>' +
      '<label class="campo"><span>Taxa de entrega</span><span class="com-prefixo"><i>R$</i><input class="entrada num" data-c="taxaEntrega" data-n inputmode="decimal" value="' + inNum(p.taxaEntrega) + '"></span><small>Cobrada do cliente. Não conta como lucro.</small></label>' : '') + '</div></section>';

  h += '<section class="bloco"><h2>Produtos</h2><div class="linhas-edit">' + (p.itens.length ? p.itens.map(function (it, i) {
    return '<div class="linha-edit linha-ped">' +
      (it.tipo === 'avulso'
        ? '<label class="campo nome-av"><span>Item avulso</span><input class="entrada" data-c="itens.' + i + '.nome" value="' + esc(it.nome || '') + '" placeholder="Ex.: vela, topo de bolo"></label>'
        : '<div class="nome-it"><span>' + esc(it.nome) + '</span></div>') +
      '<label class="campo"><span>Quantidade</span><input class="entrada num" data-c="itens.' + i + '.qtd" data-n inputmode="decimal" value="' + inNum(it.qtd) + '"></label>' +
      '<label class="campo"><span>Preço unitário</span><span class="com-prefixo"><i>R$</i><input class="entrada num" data-c="itens.' + i + '.precoUnit" data-n inputmode="decimal" value="' + inNum(it.precoUnit) + '"></span></label>' +
      (it.tipo === 'avulso' ? '<label class="campo"><span>Custo unitário</span><span class="com-prefixo"><i>R$</i><input class="entrada num" data-c="itens.' + i + '.custoUnit" data-n inputmode="decimal" value="' + inNum(it.custoUnit) + '" placeholder="opcional"></span></label>' : '') +
      '<div class="tot-it"><span class="mudo">Total</span><b data-ped-item="' + i + '"></b></div>' +
      '<button type="button" class="btn-icone" data-acao="rem-item-ped" data-i="' + i + '" aria-label="Remover ' + esc(it.nome || 'item') + '">' + I.lixo + '</button></div>';
  }).join('') : '<p class="mudo">Nenhum produto ainda.</p>') +
    '</div><div class="acoes" style="margin-top:12px"><button type="button" class="btn sec" data-acao="add-produto">' + I.mais + 'Adicionar produto</button><button type="button" class="btn sec" data-acao="add-avulso">' + I.mais + 'Item avulso</button></div>' +
    '<div class="grade" style="margin-top:14px"><label class="campo"><span>Desconto</span><span class="com-prefixo"><i>R$</i><input class="entrada num" data-c="desconto" data-n inputmode="decimal" value="' + inNum(p.desconto) + '" placeholder="0,00"></span></label></div></section>';

  h += '<section class="bloco"><h2>Pagamento</h2><label class="campo"><span>Forma combinada</span><select class="entrada" data-c="formaPagamento">' +
    Object.keys(C.FORMAS_PAGAMENTO).map(k => '<option value="' + k + '"' + (p.formaPagamento === k ? ' selected' : '') + '>' + C.FORMAS_PAGAMENTO[k].rotulo + '</option>').join('') +
    '</select><small>Cartão e aplicativo têm taxa; ela sai do lucro estimado.</small></label>' +
    '<h3 style="margin-top:18px">Recebido</h3>' + (p.pagamentos.length
      ? '<ul class="historico">' + p.pagamentos.map((x, i) => '<li><span>' + dataDia(x.data) + ', ' + esc(rotForma(x.forma)) + (x.obs ? ' (' + esc(x.obs) + ')' : '') + '</span><span><b>' + C.brl(x.valor) + '</b><button type="button" class="link-btn mini" data-acao="rem-pag" data-i="' + i + '" aria-label="Remover pagamento de ' + C.brl(x.valor) + '">remover</button></span></li>').join('') + '</ul>'
      : '<p class="mudo">Nada recebido ainda.</p>') +
    '<div class="acoes" style="margin-top:12px" id="botoes-pag"></div></section>';

  h += '<section class="bloco"><h2>Observações</h2><label class="campo"><span class="sr">Observações</span><textarea class="entrada" data-c="obs" placeholder="Tema da festa, cores, sem lactose, mensagem no cartão…">' + esc(p.obs || '') + '</textarea></label></section>';

  h += '<div class="barra-salvar"><span class="estado" id="estado-ped"></span>' +
    (!e.nova ? '<button type="button" class="btn perigo fino" data-acao="excluir-ped" aria-label="Excluir pedido" title="Excluir pedido">' + I.lixo + '<span>Excluir</span></button>' : '') +
    (!e.nova && p.status !== 'cancelado' ? '<button type="button" class="btn sec fino" data-acao="cancelar-ped" aria-label="Cancelar pedido" title="Cancelar pedido">' + I.fechar + '<span>Cancelar pedido</span></button>' : '') +
    '<button type="button" class="btn" data-acao="salvar-ped">Salvar pedido</button></div>';
  h += '</div><aside class="painel"><div class="bloco" id="resumo-ped" aria-live="polite"></div></aside></div>';
  return h;
}
export function montarEditorPedido() {
  const cont = $('.form-ped'); if (!cont || !S.editor) return;
  cont.addEventListener('input', aoEditarPedido);
  cont.addEventListener('change', aoEditarPedido);
  recalcPedido();
}
export function aoEditarPedido(ev) {
  const el = ev.target, e = S.editor; if (!e || e.tipo !== 'pedido') return;
  const cam = el.dataset.c; if (!cam) return;
  const porChange = el.tagName === 'SELECT' || el.type === 'date' || el.type === 'time';
  if (porChange ? ev.type !== 'change' : ev.type !== 'input') return;
  gravarCaminho(e.d, cam, el.hasAttribute('data-n') ? C.lerNum(el.value) : el.value);
  marcarSujo(); recalcPedido();
}
export function recalcPedido() {
  const e = S.editor; if (!e || e.tipo !== 'pedido') return;
  const p = e.d, c = calcPed(p);
  c.itens.forEach((it, i) => { const el = $('[data-ped-item="' + i + '"]'); if (el) el.textContent = C.brl(it.total); });
  const est = $('#estado-ped');
  if (est) est.innerHTML = '<b style="color:var(--ink)">' + C.brl(c.total) + '</b>' + (c.restante > 0.004 ? ', falta ' + C.brl(c.restante) : '') + '<br>' + (e.sujo ? 'Alterações não salvas' : (e.nova ? 'Pedido novo' : 'Tudo salvo'));
  const bp = $('#botoes-pag');
  if (bp) bp.innerHTML = (c.pago < 0.005 && c.sinalSugerido > 0 && c.restante > 0.004 ? '<button type="button" class="btn sec" data-acao="pagar" data-v="sinal">Registrar sinal de ' + C.brl(c.sinalSugerido) + '</button>' : '') +
    (c.restante > 0.004 ? '<button type="button" class="btn sec" data-acao="pagar" data-v="restante">Registrar pagamento</button>' : '');
  const res = $('#resumo-ped'); if (!res) return;
  const li = (r, v) => '<li><span>' + r + '</span><span>' + v + '</span></li>';
  res.innerHTML = '<h2>Resumo</h2><ul class="decomp">' + li('Produtos', C.brl(c.subtotal)) +
    (c.taxaEntrega ? li('Entrega', C.brl(c.taxaEntrega)) : '') + (c.desconto ? li('Desconto', '-' + C.brl(c.desconto)) : '') +
    '<li class="total"><span>Total</span><span>' + C.brl(c.total) + '</span></li>' + li('Recebido', C.brl(c.pago)) +
    '<li class="total"><span>' + (c.restante < -0.004 ? 'Pago a mais' : 'Falta receber') + '</span><span>' + C.brl(Math.abs(c.restante)) + '</span></li></ul>' +
    '<div class="destaque-un"><div class="r">Lucro estimado</div><div class="v">' + (C.numOk(c.lucro) ? C.brl(c.lucro) : '—') + '</div><div class="r">' +
    (C.numOk(c.lucro) ? 'Custo dos produtos ' + C.brl(c.custo) + (c.taxaPagamento > 0 ? ', taxa ' + C.brl(c.taxaPagamento) : '') + (C.numOk(c.margem) ? ', margem ' + C.pct(c.margem) : '')
      : (p.itens.length ? 'Algum produto está sem custo. Em itens avulsos, informe o custo unitário.' : 'Adicione produtos para ver o lucro.')) + '</div></div>' +
    '<div class="acoes" style="margin-top:16px"><button type="button" class="btn fino" data-acao="whats-ped">' + I.mensagem + 'Mensagem para WhatsApp</button></div>';
}
export function validarPedido(p) {
  if (!p.clienteId) return 'Escolha o cliente do pedido.';
  if (!p.dataEntrega) return 'Informe a data de ' + (p.tipoEntrega === 'entrega' ? 'entrega.' : 'retirada.');
  if (!p.itens.length) return 'Adicione pelo menos um produto.';
  if (p.itens.some(it => !(it.qtd > 0))) return 'Todo produto precisa de quantidade maior que zero.';
  if (p.itens.some(it => it.tipo === 'avulso' && !String(it.nome || '').trim())) return 'Dê um nome ao item avulso.';
  return null;
}
export function salvarPedido(msg) {
  const e = S.editor, p = e.d;
  const erro = validarPedido(p);
  if (erro) { toast(erro); return false; }
  const c = calcPed(p);
  const cli = S.dados.clientes[p.clienteId];
  if (cli) p.clienteNome = cli.nome;
  p.itens.forEach((it, i) => { if (it.tipo === 'rec' && C.numOk(c.itens[i].custoUnit)) it.custoUnit = c.itens[i].custoUnit; });
  // parte do pró-labore em cada item: acompanha a receita até a entrega; depois fica congelada
  const ctxPl = ctxCalc();
  p.itens.forEach(function (it) {
    if (it.tipo !== 'rec') return;
    if (p.status !== 'entregue' || !C.numOk(it.maoObraUnit)) it.maoObraUnit = C.maoObraItemPedido(Object.assign({}, it, { maoObraUnit: null }), ctxPl);
  });
  // Resumo em colunas simples: aparece legível na planilha e servirá aos relatórios.
  p.total = c.total; p.pago = c.pago; p.restante = c.restante; p.lucroEstimado = c.lucro; p.situacaoPagamento = c.situacao;
  const orig = S.dados.pedidos[p.id];
  aplicarBaixaEstoquePedido(orig, p);
  if (!orig || orig.status !== p.status) (p.historicoStatus = p.historicoStatus || []).push({ status: p.status, em: agoraISO() });
  gravarRegistro('pedidos', clone(p));
  const eraNovo = e.nova;
  S.editor = { tipo: 'pedido', idRota: p.id, nova: false, d: clone(p), sujo: false };
  toast(msg || (eraNovo ? 'Pedido criado.' : 'Pedido salvo.'));
  if (eraNovo) { trocarEnderecoSemDesenhar('#/pedido/' + encodeURIComponent(p.id)); }
  render(false);
  return true;
}
export function folhaProduto() {
  const ctx = ctxCalc();
  const ops = [];
  lista('receitas').sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR')).forEach(function (r) {
    const c = C.calcularReceita(r, ctx);
    (c.variacoes || []).forEach(v => ops.push({ r: r, v: v }));
  });
  if (!ops.length) {
    abrirFolha('Adicionar produto', '<p>Ainda não há receitas com opções de venda. Cadastre uma receita e as formas de vender (unidade, caixa, cento) para escolher aqui.</p><div class="rodape-folha"><a class="btn" href="#/receita/nova" data-fechar>Nova receita</a></div>');
    return;
  }
  const corpo = '<label class="busca"><span class="sr">Buscar produto</span>' + I.busca + '<input class="entrada" id="busca-prod" type="search" placeholder="Buscar produto"></label><div class="lista" id="lista-prod">' +
    ops.map((o, i) => '<button type="button" class="item" data-i="' + i + '" data-busca="' + esc(normBusca(o.r.nome + ' ' + o.v.nome)) + '"><div class="principal"><div class="nome">' + esc(o.r.nome) + '</div><div class="det">' + esc(o.v.nome || 'Opção') + '</div></div><div class="valor">' + (C.numOk(o.v.preco) ? C.brl(o.v.preco) : '<small>sem preço</small>') + '</div></button>').join('') +
    '</div><p class="mudo" id="sem-prod" hidden>Nada encontrado.</p>';
  abrirFolha('Adicionar produto', corpo, function (d) {
    const b = $('#busca-prod', d);
    b.addEventListener('input', function () {
      const q = normBusca(b.value); let n = 0;
      $$('#lista-prod .item', d).forEach(el => { const v = !q || el.dataset.busca.includes(q); el.hidden = !v; if (v) n++; });
      $('#sem-prod', d).hidden = n > 0;
    });
    $$('#lista-prod .item', d).forEach(el => el.onclick = function () {
      const o = ops[+el.dataset.i];
      const p = S.editor.d;
      const ja = p.itens.findIndex(it => it.tipo === 'rec' && it.receitaId === o.r.id && it.variacaoId === o.v.id);
      if (ja >= 0) { p.itens[ja].qtd = (p.itens[ja].qtd || 0) + 1; toast('Quantidade aumentada: o produto já estava no pedido.'); }
      else p.itens.push({ id: uid(), tipo: 'rec', receitaId: o.r.id, variacaoId: o.v.id, nome: o.r.nome + ' (' + (o.v.nome || 'opção') + ')', qtd: 1, precoUnit: C.numOk(o.v.preco) ? C.round2(o.v.preco) : null, custoUnit: C.numOk(o.v.custo) ? o.v.custo : null });
      d.close(); marcarSujo(); render(false);
      const idx = ja >= 0 ? ja : p.itens.length - 1;
      setTimeout(() => { const el2 = $('[data-c="itens.' + idx + '.qtd"]'); if (el2) el2.focus(); }, 50);
    });
  });
}
export function folhaPagamento(tipo) {
  const p = S.editor.d, c = calcPed(p);
  const valor = tipo === 'sinal' ? c.sinalSugerido : Math.max(0, c.restante);
  const corpo = '<form id="f-pag" style="display:flex;flex-direction:column;gap:12px">' +
    '<label class="campo"><span>Valor recebido</span><span class="com-prefixo"><i>R$</i><input class="entrada num" name="valor" inputmode="decimal" required value="' + inNum(C.round2(valor)) + '"></span>' + (tipo === 'sinal' ? '<small>Sinal padrão de ' + C.num(cfg().sinalPadraoPct) + '%. Pode mudar o valor.</small>' : '<small>Falta ' + C.brl(c.restante) + '.</small>') + '</label>' +
    '<div class="linha-campos"><label class="campo"><span>Data</span><input class="entrada" type="date" name="data" required value="' + hoje() + '"></label>' +
    '<label class="campo"><span>Forma</span><select class="entrada" name="forma">' + Object.keys(C.FORMAS_PAGAMENTO).map(k => '<option value="' + k + '"' + ((p.formaPagamento || 'pix') === k ? ' selected' : '') + '>' + C.FORMAS_PAGAMENTO[k].rotulo + '</option>').join('') + '</select></label></div>' +
    '<label class="campo"><span>Observação</span><input class="entrada" name="obs" placeholder="Opcional"></label>' +
    '<div class="rodape-folha"><button type="button" class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit">Registrar ' + (tipo === 'sinal' ? 'sinal' : 'pagamento') + '</button></div></form>';
  abrirFolha(tipo === 'sinal' ? 'Registrar sinal' : 'Registrar pagamento', corpo, function (d) {
    $('#f-pag', d).addEventListener('submit', function (ev) {
      ev.preventDefault(); const f = ev.target;
      const v = C.lerNum(f.valor.value);
      if (!(v > 0)) { toast('Informe um valor maior que zero.'); return; }
      p.pagamentos.push({ id: uid(), data: f.data.value || hoje(), valor: C.round2(v), forma: f.forma.value, obs: f.obs.value.trim(), tipo: tipo });
      let msg = 'Pagamento registrado.';
      if (tipo === 'sinal' && p.status === 'orcamento') { p.status = 'confirmado'; msg = 'Sinal registrado e pedido confirmado.'; }
      d.close(); marcarSujo();
      if (!salvarPedido(msg)) render(false);
    });
  });
}
export function folhaWhats(p) {
  const cli = S.dados.clientes[p.clienteId] || {};
  const tel = C.telefoneWhats(cli.telefone);
  const pw = Object.assign({}, p, { clienteNome: cli.nome || p.clienteNome });
  const tipos = [['orcamento', 'Orçamento'], ['confirmacao', 'Confirmação'], ['lembrete', 'Lembrete'], ['recibo', 'Recibo']];
  let atual = p.status === 'orcamento' ? 'orcamento' : ['confirmado', 'producao'].includes(p.status) ? 'confirmacao' : p.status === 'pronto' ? 'lembrete' : 'recibo';
  const corpo = '<div class="seg rolavel" role="group" aria-label="Tipo de mensagem">' + tipos.map(t => '<button type="button" data-tipo="' + t[0] + '" aria-pressed="' + (t[0] === atual) + '">' + t[1] + '</button>').join('') + '</div>' +
    (!tel ? '<div class="aviso">' + I.alerta + '<div class="txt">' + (cli.telefone ? 'O telefone do cliente não parece ter DDD.' : 'Cliente sem telefone.') + ' O WhatsApp vai pedir para você escolher o contato.</div></div>' : '') +
    '<label class="campo"><span>Texto (pode editar antes de enviar)</span><textarea class="entrada" id="txt-whats" rows="12"></textarea></label>' +
    (S.editor && S.editor.sujo ? '<p class="mudo">O texto usa o que está na tela, inclusive o que ainda não foi salvo.</p>' : '') +
    '<div class="rodape-folha"><button type="button" class="btn sec" id="copiar-whats">' + I.copiar + 'Copiar texto</button><a class="btn" id="abrir-whats" target="_blank" rel="noopener">' + I.mensagem + 'Abrir no WhatsApp</a></div>';
  abrirFolha('Mensagem para WhatsApp', corpo, function (d) {
    const ta = $('#txt-whats', d), a = $('#abrir-whats', d);
    function link() { a.href = 'https://wa.me/' + tel + '?text=' + encodeURIComponent(ta.value); }
    function gerar() { ta.value = C.textoWhats(atual, pw, calcPed(pw), S.dados.config.geral, { hoje: hoje() }); link(); }
    $$('[data-tipo]', d).forEach(b => b.onclick = function () { atual = b.dataset.tipo; $$('[data-tipo]', d).forEach(x => x.setAttribute('aria-pressed', String(x === b))); gerar(); });
    ta.addEventListener('input', link);
    $('#copiar-whats', d).onclick = () => copiarTexto(ta.value);
    gerar();
  });
}
// ---------- Início: blocos de pedidos ----------
export function blocosPedidosInicio() {
  const hj = hoje();
  const peds = lista('pedidos').filter(p => p.status !== 'cancelado');
  const deHoje = peds.filter(p => p.dataEntrega === hj).sort(ordemData);
  const amanha = peds.filter(p => p.dataEntrega === C.somarDias(hj, 1) && p.status !== 'entregue').length;
  const passados = peds.filter(p => ['confirmado', 'producao', 'pronto'].includes(p.status) && p.dataEntrega && p.dataEntrega < hj).sort(ordemData);
  const orcs = peds.filter(p => p.status === 'orcamento' && (!p.dataEntrega || p.dataEntrega >= hj)).sort(ordemData);
  const receber = peds.filter(p => p.status === 'entregue').map(p => ({ p: p, c: calcPed(p) })).filter(x => x.c.restante > 0.004);
  const mes = hj.slice(5, 7);
  const aniv = lista('clientes').filter(c => aniversarioNoMes(c, mes)).sort((a, b) => a.aniversario.localeCompare(b.aniversario));
  let h = '<section class="bloco"><div class="cab-bloco"><h2>Hoje</h2><a class="link-btn" href="#/agenda">Ver agenda</a></div>' +
    (deHoje.length ? '<div class="lista">' + deHoje.map(cardPedido).join('') + '</div>' : '<p class="mudo">Nenhuma entrega ou retirada hoje.</p>') +
    (amanha ? '<p class="mudo" style="margin-top:10px">Amanhã: ' + amanha + (amanha === 1 ? ' pedido. ' : ' pedidos. ') + '<a href="#/producao" data-acao="prod-dia" data-v="1">Ver produção de amanhã</a></p>' : '') + '</section>';
  if (passados.length) h += '<section class="bloco"><h2>Data já passou</h2><p class="explica">Pedidos com data anterior a hoje que ainda não foram marcados como entregues.</p><div class="lista">' + passados.map(cardPedido).join('') + '</div></section>';
  if (orcs.length) h += '<section class="bloco"><h2>Orçamentos aguardando resposta</h2><div class="lista">' + orcs.slice(0, 5).map(cardPedido).join('') + '</div>' + (orcs.length > 5 ? '<a class="link-btn" href="#/pedidos?f=orcamento">Ver todos os ' + orcs.length + '</a>' : '') + '</section>';
  if (receber.length) {
    const tot = receber.reduce((s, x) => s + x.c.restante, 0);
    h += '<section class="bloco"><h2>A receber: ' + C.brl(tot) + '</h2><p class="explica">Pedidos entregues que ainda não foram pagos por inteiro.</p><div class="lista">' + receber.map(x => cardPedido(x.p)).join('') + '</div></section>';
  }
  if (aniv.length) h += '<section class="bloco"><h2>Aniversariantes de ' + MESES[Number(mes) - 1] + '</h2><div class="lista">' + aniv.map(c => '<a class="item" href="#/cliente/' + encodeURIComponent(c.id) + '"><div class="principal"><div class="nome">' + esc(c.nome) + '</div><div class="det">' + esc(aniversarioTxt(c.aniversario)) + '</div></div>' + I.seta + '</a>').join('') + '</div></section>';
  return h;
}
// ---------- Ações ----------
export function statusRapido(v) {
  const p = S.editor.d;
  const antes = p.status; p.status = v; marcarSujo();
  const c = calcPed(p);
  if (S.editor.nova) { render(false); return; }
  const msg = 'Marcado como ' + C.STATUS_PEDIDO[v].rotulo.toLowerCase() + '.' + (v === 'entregue' && c.restante > 0.004 ? ' Falta receber ' + C.brl(c.restante) + '.' : '');
  if (!salvarPedido(msg)) { p.status = antes; render(false); }
}

// Ações dos botões desta parte (data-acao="...")
export const ACOES_PEDIDOS = {
  'status-ped': function (el) { statusRapido(el.dataset.v); },
  'reabrir-ped': function () { statusRapido('confirmado'); },
  'cancelar-ped': async function () {
    if (!await confirmar('Cancelar pedido?', 'O pedido sai da agenda, da produção e das compras. Os pagamentos registrados continuam nele.', 'Cancelar pedido', true)) return;
    statusRapido('cancelado');
  },
  'excluir-ped': async function () {
    const p = S.editor.d;
    if (!await confirmar('Excluir pedido?', 'O pedido de <b>' + esc(nomeCliente(p)) + '</b> some da lista e do histórico do cliente. Para manter o registro, prefira cancelar.', 'Excluir pedido', true)) return;
    const devolveu = removerMovsRef('vendaped:' + p.id);
    excluirRegistro('pedidos', p.id); S.editor = null; toast('Pedido excluído.' + (devolveu ? ' As unidades voltaram para a vitrine.' : '')); ir('#/pedidos');
  },
  'add-produto': folhaProduto,
  pagar: function (el) { folhaPagamento(el.dataset.v); },
  'salvar-ped': function () { salvarPedido(); },
  'whats-ped': function () { folhaWhats(S.editor.d); }
};
