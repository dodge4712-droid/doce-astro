// Tela Caixa → Movimento: período, filtros, totais, gráfico e lista de entradas e saídas.
import * as C from '../motor/index.js';
import { S } from '../nucleo/estado.js';
import { I, p } from '../nucleo/icones.js';
import { abas, cab, toast } from '../nucleo/interface.js';
import { render } from '../nucleo/rotas.js';
import { $, $$, dataCurta, esc, hoje } from '../nucleo/util.js';
import { fontesConhecidas, formaTxt, movsTodos } from '../servicos/caixa.js';

// ================= Caixa: entradas e saídas =================
export const PRESETS_CX = [['hoje', 'Hoje'], ['7dias', '7 dias'], ['mes', 'Este mês'], ['mesPassado', 'Mês passado'], ['ano', 'Este ano']];
export function filtroCaixa() {
  if (!S.caixa) { const p = C.periodoPreset('mes', hoje()); S.caixa = { preset: 'mes', de: p.de, ate: p.ate, tipo: 'todos', fontes: [], busca: '' }; }
  return S.caixa;
}
export function telaCaixa() {
  const F = filtroCaixa();
  const todos = movsTodos();
  let h = cab('Caixa', 'Tudo o que entrou e saiu. Os pagamentos registrados nos pedidos entram sozinhos.',
    '<a class="btn sec" href="#/lancamento/novo?tipo=entrada">' + I.mais + 'Nova entrada</a><a class="btn" href="#/lancamento/novo?tipo=saida">' + I.mais + 'Nova saída</a>') + abas(ABAS_CX, '#/caixa');
  if (!todos.length) {
    return h + '<div class="bloco vazio">' + I.emblema + '<h2>Nenhum movimento ainda</h2><p>Registre as saídas (compras, contas) e as entradas de fora dos pedidos, como vendas de balcão. Os sinais e pagamentos dos pedidos aparecem aqui sozinhos.</p><div class="acoes" style="justify-content:center"><a class="btn" href="#/lancamento/novo?tipo=saida">' + I.mais + 'Registrar uma saída</a><a class="btn sec" href="#/lancamento/novo?tipo=entrada">' + I.mais + 'Registrar uma entrada</a></div></div>';
  }
  const noPeriodo = C.filtrarMovimentos(todos, { de: F.de, ate: F.ate });
  const semFonte = C.filtrarMovimentos(noPeriodo, { tipo: F.tipo, busca: F.busca });
  const lst = C.filtrarMovimentos(semFonte, { fontes: F.fontes });
  const r = C.resumoCaixa(lst), rf = C.resumoCaixa(semFonte);
  S.movsFiltrados = lst;
  const sel = f => F.fontes.some(x => C.semAcento(x) === C.semAcento(f));
  const chip = f => '<button type="button" class="chip-filtro" data-acao="cx-fonte" data-v="' + esc(f) + '" aria-pressed="' + sel(f) + '">' + (sel(f) ? I.ok : '') + esc(f) + '</button>';
  const fontesDe = tipo => { const nomes = Object.keys(rf.porFonte[tipo]); F.fontes.forEach(f => { if (!nomes.some(n => C.semAcento(n) === C.semAcento(f)) && (tipo === 'saida' ? fontesConhecidas('saida') : fontesConhecidas('entrada').concat([C.FONTE_PEDIDOS])).some(n => C.semAcento(n) === C.semAcento(f))) nomes.push(f); }); return nomes.sort((a, b) => a.localeCompare(b, 'pt-BR')); };
  const fe = F.tipo !== 'saida' ? fontesDe('entrada') : [], fs = F.tipo !== 'entrada' ? fontesDe('saida') : [];
  const filtrosAtivos = F.tipo !== 'todos' || F.fontes.length || F.busca;

  const nAtivos = (F.tipo !== 'todos' ? 1 : 0) + F.fontes.length + (F.busca ? 1 : 0);
  h += '<section class="bloco filtros-cx"><h2 class="sr">Período</h2><div class="seg" role="group" aria-label="Período">' +
    PRESETS_CX.map(p => '<button type="button" data-acao="cx-preset" data-v="' + p[0] + '" aria-pressed="' + (F.preset === p[0]) + '">' + p[1] + '</button>').join('') + '</div>' +
    '<div class="linha-campos" style="margin-top:12px"><label class="campo"><span>De</span><input class="entrada" type="date" data-cx="de" value="' + F.de + '"></label><label class="campo"><span>Até</span><input class="entrada" type="date" data-cx="ate" value="' + F.ate + '"></label></div></section>';
  if (F.ate < F.de) return h + '<div class="aviso neg">' + I.alerta + '<div class="txt">A data final vem antes da inicial.</div></div>';

  h += '<div class="stats stats-cx"><div class="stat"><div class="r">Entradas</div><div class="n pos-txt">' + C.brl(r.entradas) + '</div></div>' +
    '<div class="stat"><div class="r">Saídas</div><div class="n neg-txt">' + C.brl(r.saidas) + '</div>' + (r.retiradas > 0 ? '<small class="mudo">inclui ' + C.brl(r.retiradas) + ' de pró-labore</small>' : '') + '</div>' +
    '<div class="stat"><div class="r">Saldo ' + (r.saldo < 0 ? '(negativo)' : '') + '</div><div class="n ' + (r.saldo < 0 ? 'neg-txt' : 'pos-txt') + '">' + (r.saldo < 0 ? '−' : '') + C.brl(Math.abs(r.saldo)) + '</div></div></div>';

  h += '<details class="bloco mais-filtros"' + (nAtivos || F.maisAberto ? ' open' : '') + '><summary><span>Filtrar por tipo, origem ou categoria</span>' + (nAtivos ? '<span class="chip alerta">' + nAtivos + (nAtivos === 1 ? ' filtro ativo' : ' filtros ativos') + '</span>' : '') + '</summary>' +
    '<div class="seg" role="group" aria-label="Tipo de movimento" style="margin-top:6px">' + [['todos', 'Tudo'], ['entrada', 'Entradas'], ['saida', 'Saídas']].map(t => '<button type="button" data-acao="cx-tipo" data-v="' + t[0] + '" aria-pressed="' + (F.tipo === t[0]) + '">' + t[1] + '</button>').join('') + '</div>' +
    (fe.length ? '<div class="grupo-fontes"><span class="rot-fontes">Origem das entradas</span><div class="chips-filtro">' + fe.map(chip).join('') + '</div></div>' : '') +
    (fs.length ? '<div class="grupo-fontes"><span class="rot-fontes">Categoria das saídas</span><div class="chips-filtro">' + fs.map(chip).join('') + '</div></div>' : '') +
    '<div class="linha-campos" style="margin-top:14px"><label class="busca"><span class="sr">Buscar na descrição</span>' + I.busca + '<input class="entrada" id="busca-cx" type="search" placeholder="Buscar na descrição" value="' + esc(F.busca) + '"></label></div>' +
    (filtrosAtivos ? '<button type="button" class="link-btn" data-acao="cx-limpar">Limpar filtros (mantém o período)</button>' : '') + '</details>';
  if (!lst.length) return h + '<p class="mudo" style="padding:8px 4px 24px">Nenhum movimento com esses filtros.</p>';

  h += graficoCaixa(lst, F.de, F.ate);
  h += '<div class="grade-fontes">' + blocoPorFonte('Entradas por origem', rf.porFonte.entrada, 'entrada', sel) + blocoPorFonte('Saídas por categoria', rf.porFonte.saida, 'saida', sel) + '</div>';

  const LIM = 300;
  let lista_ = '', ultimo = null;
  lst.slice(0, LIM).forEach(function (m) {
    if (m.data !== ultimo) { ultimo = m.data; lista_ += '<h3 class="grupo-data">' + esc(dataCurta(m.data)) + '</h3>'; }
    const ent = m.tipo === 'entrada';
    const href = m.automatico ? '#/pedido/' + encodeURIComponent(m.pedidoId) : '#/lancamento/' + encodeURIComponent(m.lancamentoId);
    lista_ += '<a class="item mov" href="' + href + '"><div class="principal"><div class="nome">' + esc(m.descricao) + '</div><div class="det">' + esc(m.fonte) +
      (m.forma ? ', ' + esc(formaTxt(m.forma)) : '') + (m.nItensCompra ? ', ' + m.nItensCompra + (m.nItensCompra === 1 ? ' ingrediente' : ' ingredientes') : '') + (m.pedidoCancelado ? ', pedido cancelado' : '') + '</div></div>' +
      '<div class="valor ' + (ent ? 'pos-txt' : 'neg-txt') + '"><span class="sr">' + (ent ? 'Entrada de' : 'Saída de') + '</span>' + (ent ? '+ ' : '− ') + C.brl(m.valor) + '</div></a>';
  });
  h += '<section class="bloco"><div class="cab-bloco"><h2>' + lst.length + (lst.length === 1 ? ' movimento' : ' movimentos') + '</h2><button type="button" class="btn sec fino" data-acao="cx-csv">' + I.baixar + 'Exportar planilha (CSV)</button></div>' +
    '<div class="lista">' + lista_ + '</div>' + (lst.length > LIM ? '<p class="mudo" style="margin-top:10px">Mostrando os ' + LIM + ' mais recentes. Use os filtros ou exporte para ver todos.</p>' : '') + '</section>';
  return h;
}
export function graficoCaixa(lst, de, ate) {
  const g = C.agruparPeriodo(lst, de, ate);
  const B = g.baldes; if (!B.length) return '';
  S.grafBaldes = B;
  const max = Math.max(0.01, ...B.map(b => Math.max(b.entradas, b.saidas)));
  const passo = Math.ceil(B.length / 7);
  const nomeBalde = { dia: 'dia', semana: 'semana', mes: 'mês' }[g.modo];
  const cols = B.map(function (b, i) {
    const he = b.entradas / max * 100, hs = b.saidas / max * 100;
    return '<button type="button" class="graf-col" data-acao="cx-barra" data-i="' + i + '" title="' + esc(b.rotulo + ': entradas ' + C.brl(b.entradas) + ', saídas ' + C.brl(b.saidas)) + '" aria-label="' + esc(b.rotulo + ': entradas ' + C.brl(b.entradas) + ', saídas ' + C.brl(b.saidas)) + '">' +
      '<span class="graf-barras"><i class="b-ent" style="height:' + he.toFixed(2) + '%"></i><i class="b-sai" style="height:' + hs.toFixed(2) + '%"></i></span>' +
      '<span class="graf-rot">' + (i % passo === 0 ? esc(g.modo === 'semana' ? b.rotulo : b.rotulo) : '') + '</span></button>';
  }).join('');
  return '<section class="bloco"><div class="cab-bloco"><h2>Movimento por ' + nomeBalde + '</h2><div class="legenda"><span><i class="b-ent"></i>Entradas</span><span><i class="b-sai"></i>Saídas</span></div></div>' +
    '<div class="graf">' + cols + '</div><p class="mudo" id="graf-info" role="status">Toque numa barra para ver os valores ' + (g.modo === 'dia' ? 'do dia' : g.modo === 'semana' ? 'da semana (começa no domingo)' : 'do mês') + '.</p></section>';
}
export function blocoPorFonte(titulo, mapa, tipo, sel) {
  const itens = Object.entries(mapa).sort((a, b) => b[1] - a[1]);
  if (!itens.length) return '';
  const total = itens.reduce((s, x) => s + x[1], 0), max = itens[0][1] || 1;
  return '<section class="bloco"><h2>' + titulo + '</h2><div class="por-fonte">' + itens.map(([f, v]) => '<button type="button" class="linha-fonte" data-acao="cx-fonte" data-v="' + esc(f) + '" aria-pressed="' + sel(f) + '"><span class="nome-f">' + (sel(f) ? I.ok : '') + esc(f) + '</span><span class="val-f">' + C.brl(v) + ' <small>' + C.pct(total ? v / total : 0, 0) + '</small></span><span class="barra-f"><i class="' + (tipo === 'entrada' ? 'b-ent' : 'b-sai') + '" style="width:' + (v / max * 100).toFixed(2) + '%"></i></span></button>').join('') +
    '</div><p class="mudo" style="margin-top:8px">Toque numa linha para filtrar por ela.</p></section>';
}
export let timerBuscaCx = null;
// ================= Financeiro =================
export const ABAS_CX = [['#/caixa', 'Movimento'], ['#/contas', 'A pagar'], ['#/receber', 'A receber'], ['#/prolabore', 'Pró-labore'], ['#/relatorios', 'Relatórios']];

// Ações dos botões desta parte (data-acao="...")
export const ACOES_CAIXA = {
  'cx-preset': function (el) { const F = filtroCaixa(), p = C.periodoPreset(el.dataset.v, hoje()); F.preset = el.dataset.v; F.de = p.de; F.ate = p.ate; render(false); },
  'cx-tipo': function (el) { filtroCaixa().tipo = el.dataset.v; render(false); },
  'cx-fonte': function (el) {
    const F = filtroCaixa(), v = el.dataset.v, k = C.semAcento(v);
    F.fontes = F.fontes.some(x => C.semAcento(x) === k) ? F.fontes.filter(x => C.semAcento(x) !== k) : F.fontes.concat([v]);
    render(false);
  },
  'cx-limpar': function () { const F = filtroCaixa(); F.tipo = 'todos'; F.fontes = []; F.busca = ''; render(false); },
  'cx-barra': function (el) {
    const b = (S.grafBaldes || [])[+el.dataset.i]; if (!b) return;
    $$('.graf-col.sel').forEach(x => x.classList.remove('sel')); el.classList.add('sel');
    const info = $('#graf-info');
    if (info) info.innerHTML = '<b>' + esc(b.rotulo) + ':</b> entradas <span class="pos-txt">' + C.brl(b.entradas) + '</span>, saídas <span class="neg-txt">' + C.brl(b.saidas) + '</span>, saldo ' + (b.entradas - b.saidas < 0 ? '−' : '') + C.brl(Math.abs(b.entradas - b.saidas));
  },
  'cx-csv': function () {
    const F = filtroCaixa();
    const blob = new Blob([C.csvMovimentos(S.movsFiltrados || [])], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'caixa-' + F.de + '-a-' + F.ate + '.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast('Planilha exportada. Abre no Excel ou no Google Planilhas.');
  }
};

// Eventos globais desta parte (registrados uma vez, no arranque)
export function eventosCaixa() {
  document.addEventListener('toggle', function (e) {
    if (e.target.classList && e.target.classList.contains('mais-filtros')) filtroCaixa().maisAberto = e.target.open;
  }, true);
  document.addEventListener('input', function (e) {
    if (e.target.id !== 'busca-cx') return;
    filtroCaixa().busca = e.target.value;
    clearTimeout(timerBuscaCx);
    timerBuscaCx = setTimeout(function () { render(false); const b = $('#busca-cx'); if (b) { b.focus(); b.setSelectionRange(b.value.length, b.value.length); } }, 350);
  });
  document.addEventListener('change', function (e) {
    const t = e.target;
    if (t.dataset && t.dataset.cx && t.value) { const F = filtroCaixa(); F[t.dataset.cx] = t.value; F.preset = 'personalizado'; render(false); }
  });
}
