// Telas de clientes: lista, ficha, cadastro e escolha de cliente no pedido.
import * as C from '../motor/index.js';
import { S, lista } from '../nucleo/estado.js';
import { I, p } from '../nucleo/icones.js';
import { abrirFolha, cab, confirmar, toast } from '../nucleo/interface.js';
import { excluirRegistro, gravarRegistro } from '../nucleo/registros.js';
import { ir, render } from '../nucleo/rotas.js';
import { $, $$, MESES, clone, dataDia, esc, hoje, normBusca, uid } from '../nucleo/util.js';
import { calcPed } from '../servicos/pedidos.js';
import { cardPedido, ordemData } from './pedidos.js';
import { marcarSujo } from './receitas.js';

export function aniversarioTxt(a) { if (!a) return ''; const [m, d] = a.split('-'); return d + ' de ' + MESES[Number(m) - 1]; }
// ---------- Clientes ----------
export function statsCliente(id) {
  const ps = lista('pedidos').filter(p => p.clienteId === id && p.status !== 'cancelado').sort((a, b) => ordemData(b, a));
  const feitos = ps.filter(p => p.status !== 'orcamento');
  let total = 0, receber = 0;
  feitos.forEach(p => { const c = calcPed(p); total += c.total; if (p.status === 'entregue') receber += Math.max(0, c.restante); });
  const ultimo = feitos.map(p => p.dataEntrega).filter(Boolean).sort().slice(-1)[0] || null;
  return { pedidos: ps, n: feitos.length, total: total, ticket: feitos.length ? total / feitos.length : null, ultimo: ultimo, receber: receber };
}
export function aniversarioNoMes(c, mes) { return !!(c.aniversario && c.aniversario.slice(0, 2) === mes); }
export function telaClientes() {
  const cls = lista('clientes').sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));
  let h = cab('Clientes', 'Contatos, preferências e histórico de compras.', '<button type="button" class="btn" data-acao="novo-cliente">' + I.mais + 'Novo cliente</button>');
  if (!cls.length) return h + '<div class="bloco vazio">' + I.emblema + '<h2>Nenhum cliente ainda</h2><p>Cadastre nome e WhatsApp. O histórico de pedidos de cada cliente se monta sozinho.</p><button type="button" class="btn" data-acao="novo-cliente">' + I.mais + 'Cadastrar cliente</button></div>';
  const mes = hoje().slice(5, 7);
  h += '<div class="linha-campos" style="margin-bottom:14px"><label class="busca"><span class="sr">Buscar cliente</span>' + I.busca + '<input class="entrada" id="busca-cli" type="search" placeholder="Buscar por nome ou telefone"></label></div><div class="lista" id="lista-cli">' +
    cls.map(function (c) {
      const s = statsCliente(c.id);
      return '<a class="item" href="#/cliente/' + encodeURIComponent(c.id) + '" data-busca="' + esc(normBusca(c.nome + ' ' + (c.telefone || '') + ' ' + String(c.telefone || '').replace(/\D/g, ''))) + '"><div class="principal"><div class="nome">' + esc(c.nome) + '</div><div class="det">' + esc(c.telefone || 'sem telefone') + '</div></div>' +
        '<div class="valor">' + (s.n ? C.brl(s.total) + '<small>' + s.n + (s.n === 1 ? ' pedido' : ' pedidos') + '</small>' : '<small>sem pedidos</small>') + '</div>' +
        '<div class="chips">' + (aniversarioNoMes(c, mes) ? '<span class="chip alerta">aniversário em ' + esc(aniversarioTxt(c.aniversario)) + '</span>' : '') + (s.receber > 0.004 ? '<span class="chip neg">deve ' + C.brl(s.receber) + '</span>' : '') + '</div></a>';
    }).join('') + '</div><p class="mudo" id="sem-res-cli" hidden style="padding:16px">Ninguém com esse nome. <button type="button" class="link-btn" data-acao="novo-cliente">Cadastrar novo</button></p>';
  return h;
}
export function montarFiltroClientes() {
  const b = $('#busca-cli'); if (!b) return;
  b.addEventListener('input', function () {
    const q = normBusca(b.value); let n = 0;
    $$('#lista-cli .item').forEach(el => { const v = !q || el.dataset.busca.includes(q); el.hidden = !v; if (v) n++; });
    $('#sem-res-cli').hidden = n > 0;
  });
}
export function telaCliente(id) {
  const c = S.dados.clientes[id];
  if (!c || c.excluidoEm) return '<div class="bloco vazio">' + I.emblema + '<h2>Cliente não encontrado</h2><p>Pode ter sido excluído em outro aparelho.</p><a class="btn" href="#/clientes">Ver clientes</a></div>';
  const s = statsCliente(id);
  const tel = C.telefoneWhats(c.telefone);
  let h = '<div class="cab-pagina"><div class="titulos"><a href="#/clientes" class="link-btn voltar">' + I.voltar + 'Clientes</a><h1>' + esc(c.nome) + '</h1></div><div class="acoes">' +
    (tel ? '<a class="btn sec" href="https://wa.me/' + tel + '" target="_blank" rel="noopener">' + I.mensagem + 'WhatsApp</a>' : '') +
    '<button type="button" class="btn sec" data-acao="editar-cliente" data-id="' + esc(id) + '">Editar</button><a class="btn" href="#/pedido/novo?cliente=' + encodeURIComponent(id) + '">' + I.mais + 'Novo pedido</a></div></div>';
  h += '<div class="stats"><div class="stat"><div class="n">' + s.n + '</div><div class="r">' + (s.n === 1 ? 'pedido feito' : 'pedidos feitos') + '</div></div>' +
    '<div class="stat"><div class="n">' + C.brl(s.total) + '</div><div class="r">no total</div></div>' +
    '<div class="stat"><div class="n">' + (C.numOk(s.ticket) ? C.brl(s.ticket) : '—') + '</div><div class="r">por pedido, em média</div></div>' +
    '<div class="stat"><div class="n">' + (s.ultimo ? dataDia(s.ultimo) : '—') + '</div><div class="r">último pedido</div></div></div>';
  if (s.receber > 0.004) h += '<div class="aviso neg" style="margin-bottom:16px">' + I.alerta + '<div class="txt">Falta receber <b>' + C.brl(s.receber) + '</b> de pedidos já entregues.</div></div>';
  h += '<section class="bloco"><h2>Dados</h2><dl class="dados-cli">' +
    '<div><dt>Telefone</dt><dd>' + esc(c.telefone || '—') + '</dd></div><div><dt>Endereço</dt><dd>' + esc(c.endereco || '—') + '</dd></div>' +
    '<div><dt>Aniversário</dt><dd>' + esc(aniversarioTxt(c.aniversario) || '—') + '</dd></div><div><dt>Preferências e restrições</dt><dd>' + esc(c.obs || '—') + '</dd></div></dl></section>';
  h += '<section class="bloco"><h2>Pedidos</h2>' + (s.pedidos.length ? '<div class="lista">' + s.pedidos.map(cardPedido).join('') + '</div>' : '<p class="mudo">Nenhum pedido ainda.</p>') + '</section>';
  return h;
}
export function folhaCliente(id, aoSalvar) {
  const orig = id ? S.dados.clientes[id] : null;
  const c = orig ? clone(orig) : { id: uid(), nome: '', telefone: '', endereco: '', aniversario: '', obs: '' };
  const [am, ad] = c.aniversario ? c.aniversario.split('-') : ['', ''];
  const corpo = '<form id="f-cli" style="display:flex;flex-direction:column;gap:12px">' +
    '<label class="campo"><span>Nome</span><input class="entrada" name="nome" required value="' + esc(c.nome) + '" autocomplete="off"></label>' +
    '<label class="campo"><span>WhatsApp</span><input class="entrada" name="telefone" type="tel" inputmode="tel" value="' + esc(c.telefone) + '" placeholder="(11) 90000-0000"></label>' +
    '<label class="campo"><span>Endereço</span><input class="entrada" name="endereco" value="' + esc(c.endereco) + '" placeholder="Para entregas"></label>' +
    '<div class="campo"><span>Aniversário</span><div class="linha-campos" style="flex-wrap:nowrap"><select class="entrada" name="dia" aria-label="Dia"><option value="">Dia</option>' + Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map(d => '<option' + (d === ad ? ' selected' : '') + '>' + d + '</option>').join('') + '</select>' +
    '<select class="entrada" name="mes" aria-label="Mês"><option value="">Mês</option>' + MESES.map((m, i) => { const v = String(i + 1).padStart(2, '0'); return '<option value="' + v + '"' + (v === am ? ' selected' : '') + '>' + m + '</option>'; }).join('') + '</select></div><small>Opcional. Aparece no Início no mês do aniversário.</small></div>' +
    '<label class="campo"><span>Preferências e restrições</span><textarea class="entrada" name="obs" placeholder="Ex.: alergia a amendoim, prefere meio amargo">' + esc(c.obs) + '</textarea><small>Aparece em destaque nos pedidos deste cliente.</small></label>' +
    '<div class="rodape-folha">' + (orig ? '<button type="button" class="btn perigo" data-excluir>' + I.lixo + 'Excluir</button>' : '') + '<span style="flex:1"></span><button type="button" class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit">Salvar cliente</button></div></form>';
  abrirFolha(orig ? 'Editar cliente' : 'Novo cliente', corpo, function (d) {
    const f = $('#f-cli', d);
    f.nome.focus();
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const nome = f.nome.value.trim();
      if (!nome) { f.nome.focus(); return; }
      if ((f.dia.value && !f.mes.value) || (!f.dia.value && f.mes.value)) { toast('Escolha o dia e o mês do aniversário, ou deixe os dois em branco.'); return; }
      const novo = Object.assign(c, { nome: nome, telefone: f.telefone.value.trim(), endereco: f.endereco.value.trim(), aniversario: f.dia.value ? f.mes.value + '-' + f.dia.value : '', obs: f.obs.value.trim() });
      gravarRegistro('clientes', novo);
      d.close();
      toast(orig ? 'Cliente salvo.' : 'Cliente cadastrado.');
      if (aoSalvar) aoSalvar(novo); else render(false);
    });
    const ex = $('[data-excluir]', d);
    if (ex) ex.onclick = async function () {
      const n = lista('pedidos').filter(p => p.clienteId === orig.id).length;
      if (n) { toast('Este cliente tem ' + n + (n === 1 ? ' pedido' : ' pedidos') + ' e não pode ser excluído, para não perder o histórico.'); return; }
      d.close();
      if (await confirmar('Excluir cliente?', 'Excluir <b>' + esc(orig.nome) + '</b>.', 'Excluir cliente', true)) { excluirRegistro('clientes', orig.id); toast('Cliente excluído.'); ir('#/clientes'); }
    };
  });
}
export function folhaEscolherCliente(fn) {
  const cls = lista('clientes').sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));
  const corpo = '<label class="busca"><span class="sr">Buscar cliente</span>' + I.busca + '<input class="entrada" id="busca-ec" type="search" placeholder="Buscar por nome ou telefone"></label>' +
    '<div class="lista" id="lista-ec">' + cls.map(c => '<button type="button" class="item" data-id="' + esc(c.id) + '" data-busca="' + esc(normBusca(c.nome + ' ' + String(c.telefone || '').replace(/\D/g, ''))) + '"><div class="principal"><div class="nome">' + esc(c.nome) + '</div><div class="det">' + esc(c.telefone || 'sem telefone') + '</div></div></button>').join('') + '</div>' +
    '<p class="mudo" id="sem-ec"' + (cls.length ? ' hidden' : '') + '>' + (cls.length ? 'Ninguém com esse nome.' : 'Nenhum cliente cadastrado ainda.') + '</p><button type="button" class="btn sec" data-novo>' + I.mais + 'Cadastrar cliente novo</button>';
  abrirFolha('Escolher cliente', corpo, function (d) {
    const b = $('#busca-ec', d);
    b.addEventListener('input', function () {
      const q = normBusca(b.value); let n = 0;
      $$('#lista-ec .item', d).forEach(el => { const v = !q || el.dataset.busca.includes(q.replace(/\D/g, '') || q) || el.dataset.busca.includes(q); el.hidden = !v; if (v) n++; });
      $('#sem-ec', d).hidden = n > 0;
    });
    $$('#lista-ec .item', d).forEach(el => el.onclick = () => { d.close(); fn(S.dados.clientes[el.dataset.id]); });
    $('[data-novo]', d).onclick = () => { d.close(); folhaCliente(null, fn); };
  });
}

// Ações dos botões desta parte (data-acao="...")
export const ACOES_CLIENTES = {
  'novo-cliente': function () { folhaCliente(null, c => ir('#/cliente/' + encodeURIComponent(c.id))); },
  'editar-cliente': function (el) { folhaCliente(el.dataset.id); },
  'escolher-cliente': function () {
    folhaEscolherCliente(function (cli) {
      const p = S.editor.d;
      p.clienteId = cli.id; p.clienteNome = cli.nome;
      if (!p.endereco && cli.endereco) p.endereco = cli.endereco;
      marcarSujo(); render(false);
    });
  }
};
