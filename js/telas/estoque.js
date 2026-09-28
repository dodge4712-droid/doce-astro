// Tela Loja → Estoque: ingredientes, contagem, mínimo, validade e histórico com desfazer.
import * as C from '../motor/index.js';
import { S, cfg, lista } from '../nucleo/estado.js';
import { I } from '../nucleo/icones.js';
import { abas, abrirFolha, cab, confirmar, toast } from '../nucleo/interface.js';
import { excluirRegistro, gravarRegistro } from '../nucleo/registros.js';
import { ir, render } from '../nucleo/rotas.js';
import { $, $$, clone, dataDia, esc, hoje, inNum, normBusca, rotUn, uid } from '../nucleo/util.js';
import { modoEstoque, movsEstoque, nomeVitrine, registrarMov, removerMovsRef, saldos } from '../servicos/estoque.js';
import { ABAS_PED } from './pedidos.js';

export function unidadesContagem(ing) {
  const base = C.UNIDADES[C.normUn(ing.unidade)].base;
  const emb = C.paraBase(ing.qtdEmbalagem, ing.unidade);
  const ops = [];
  if (emb > 0) ops.push({ v: 'emb', r: 'embalagens de ' + C.num(ing.qtdEmbalagem) + ' ' + rotUn(ing.unidade), f: emb });
  C.unidadesDaFamilia(base).forEach(u => ops.push({ v: u, r: C.UNIDADES[u].rotulo, f: C.UNIDADES[u].fator }));
  return ops;
}
export function qtdIngTxt(ing, qb) {
  const base = C.UNIDADES[C.normUn(ing.unidade)].base, emb = C.paraBase(ing.qtdEmbalagem, ing.unidade);
  return C.qtdLegivel(qb, base) + (emb > 0 && qb > 0 && base !== 'un' ? ' (' + C.num(qb / emb, 1) + (qb / emb === 1 ? ' embalagem' : ' embalagens') + ')' : '');
}
export function chipValidade(st) {
  if (!st.validade) return '';
  if (st.vencido) return '<span class="chip neg">' + I.alerta + 'venceu em ' + dataDia(st.validade) + '</span>';
  if (st.venceLogo) return '<span class="chip alerta">' + I.alerta + (st.diasParaVencer === 0 ? 'vence hoje' : st.diasParaVencer === 1 ? 'vence amanhã' : 'vence em ' + st.diasParaVencer + ' dias') + '</span>';
  return '<span class="chip mudo">validade ' + dataDia(st.validade) + '</span>';
}
export function telaEstoque(q) {
  const modo = modoEstoque(), v = q.get('v') === 'vitrine' ? 'vitrine' : 'ingredientes';
  let h = cab('Estoque', modo === 'completo' ? 'Modo completo: compras lançadas no Caixa somam e pedidos em produção descontam sozinhos.' : modo === 'manual' ? 'Modo manual: você lança entradas, perdas e contagens; o app avisa o que está acabando.' : '',
    modo === 'desligado' ? '' : (v === 'ingredientes' ? '<a class="btn" href="#/contagem">Contar estoque</a>' : '<button type="button" class="btn" data-acao="vitrine-add">' + I.mais + 'Colocar na vitrine</button>')) + abas(ABAS_PED, '#/estoque');
  if (modo === 'desligado') return h + '<div class="bloco vazio">' + I.emblema + '<h2>Estoque desligado</h2><p>Ligue em Ajustes para acompanhar quanto tem de cada ingrediente, validades e a vitrine de pronta-entrega. Com ele ligado, a lista de compras desconta o que você já tem.</p><a class="btn" href="#/ajustes#estoque">Ir para Ajustes</a></div>';
  h += '<div class="seg" role="group" aria-label="Tipo de estoque" style="margin-bottom:14px"><a href="#/estoque"' + (v === 'ingredientes' ? ' aria-current="true"' : '') + '>Ingredientes</a><a href="#/estoque?v=vitrine"' + (v === 'vitrine' ? ' aria-current="true"' : '') + '>Vitrine</a></div>';
  const sd = saldos(), cf = cfg(), hj = hoje();
  if (v === 'vitrine') {
    const itens = Object.values(sd).filter(x => x.item.startsWith('vit:') && Math.abs(x.qtd) > 1e-9).sort((a, b) => nomeVitrine(a.item).localeCompare(nomeVitrine(b.item), 'pt-BR'));
    if (!itens.length) return h + '<div class="bloco vazio">' + I.emblema + '<h2>Vitrine vazia</h2><p>Registre os doces prontos para pronta-entrega. Ao vender por aqui, a entrada vai sozinha para o Caixa.' + (modo === 'completo' ? ' No modo completo, colocar na vitrine também desconta os ingredientes usados.' : '') + '</p><button type="button" class="btn" data-acao="vitrine-add">' + I.mais + 'Colocar na vitrine</button></div>';
    return h + '<div class="lista">' + itens.map(function (x) {
      const st = C.situacaoEstoque(x, 0, hj, cf.diasAlertaValidade);
      return '<div class="item"><div class="principal"><button type="button" class="nome link-nome" data-acao="vitrine-editar" data-v="' + esc(x.item) + '">' + esc(nomeVitrine(x.item)) + '</button><div class="det">' + (st.negativo ? 'Estoque negativo: confira a contagem' : C.num(x.qtd) + (x.qtd === 1 ? ' unidade' : ' unidades')) + '</div></div>' +
        '<div class="acoes"><button type="button" class="btn fino" data-acao="vitrine-vender" data-v="' + esc(x.item) + '"' + (x.qtd > 0 ? '' : ' disabled') + '>Vender</button><button type="button" class="btn sec fino" data-acao="vitrine-perda" data-v="' + esc(x.item) + '">Perda</button><button type="button" class="btn sec fino" data-acao="vitrine-editar" data-v="' + esc(x.item) + '">Editar</button></div>' +
        '<div class="chips">' + chipValidade(st) + (st.negativo ? '<span class="chip neg">negativo</span>' : '') + '</div></div>';
    }).join('') + '</div>';
  }
  const ings = lista('ingredientes').sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  const f = q.get('f') || 'todos';
  const linhas = ings.map(function (ing) {
    const x = sd[C.chaveIng(ing.id)];
    return { ing: ing, x: x, st: C.situacaoEstoque(x, ing.estoqueMinimo, hj, cf.diasAlertaValidade) };
  });
  const nMin = linhas.filter(l => l.st.abaixoMinimo || l.st.negativo).length, nVal = linhas.filter(l => l.st.vencido || l.st.venceLogo).length;
  const semRegistro = linhas.every(l => !l.x);
  if (semRegistro) h += '<div class="aviso" style="margin-bottom:14px">' + I.alerta + '<div class="txt">Nada contado ainda. Comece por <a href="#/contagem">Contar estoque</a>: informe quanto tem de cada ingrediente hoje' + (modo === 'completo' ? '; daí em diante, compras e produção atualizam sozinhas.' : '.') + '</div></div>';
  h += '<div class="seg rolavel" role="group" aria-label="Filtrar" style="margin-bottom:12px"><a href="#/estoque"' + (f === 'todos' ? ' aria-current="true"' : '') + '>Todos</a><a href="#/estoque?f=minimo"' + (f === 'minimo' ? ' aria-current="true"' : '') + '>Acabando (' + nMin + ')</a><a href="#/estoque?f=validade"' + (f === 'validade' ? ' aria-current="true"' : '') + '>Validade (' + nVal + ')</a></div>';
  h += '<div class="linha-campos" style="margin-bottom:12px"><label class="busca"><span class="sr">Buscar ingrediente</span>' + I.busca + '<input class="entrada" id="busca-est" type="search" placeholder="Buscar ingrediente"></label></div>';
  const peso = l => (l.st.negativo || l.st.abaixoMinimo || l.st.vencido || l.st.venceLogo) ? 0 : l.x ? 1 : 2;
  linhas.sort((x, y) => peso(x) - peso(y) || x.ing.nome.localeCompare(y.ing.nome, 'pt-BR'));
  const vis = linhas.filter(l => f === 'minimo' ? (l.st.abaixoMinimo || l.st.negativo) : f === 'validade' ? (l.st.vencido || l.st.venceLogo) : true);
  if (!vis.length) return h + '<p class="mudo" style="padding:12px 4px">Nada aqui. ' + (f === 'minimo' ? 'Nenhum ingrediente abaixo do mínimo.' : 'Nenhuma validade próxima.') + '</p>';
  h += '<div class="lista" id="lista-est">' + vis.map(function (l) {
    const ing = l.ing, st = l.st;
    return '<button type="button" class="item" data-acao="estoque-item" data-id="' + esc(ing.id) + '" data-busca="' + esc(normBusca(ing.nome)) + '"><div class="principal"><div class="nome">' + esc(ing.nome) + '</div><div class="det">' +
      (l.x ? (st.negativo ? 'Negativo: ' + qtdIngTxt(ing, st.qtd) : qtdIngTxt(ing, Math.max(0, st.qtd))) : 'não contado') + (C.numOk(ing.estoqueMinimo) && ing.estoqueMinimo > 0 ? ', mínimo ' + C.qtdLegivel(ing.estoqueMinimo, C.UNIDADES[C.normUn(ing.unidade)].base) : '') + '</div></div>' + I.seta +
      '<div class="chips">' + (st.negativo ? '<span class="chip neg">' + I.alerta + 'negativo: conte de novo</span>' : st.abaixoMinimo ? '<span class="chip alerta">' + I.alerta + 'abaixo do mínimo</span>' : '') + chipValidade(st) + '</div></button>';
  }).join('') + '</div><p class="mudo" id="sem-res-est" hidden style="padding:16px">Nenhum ingrediente com esse nome.</p>';
  return h;
}
export function montarFiltroEstoque() {
  const b = $('#busca-est'); if (!b) return;
  b.addEventListener('input', function () {
    const q = normBusca(b.value); let n = 0;
    $$('#lista-est .item').forEach(el => { const v = !q || el.dataset.busca.includes(q); el.hidden = !v; if (v) n++; });
    $('#sem-res-est').hidden = n > 0;
  });
}
export function folhaItemEstoque(id, acaoInicial) {
  const ing = S.dados.ingredientes[id]; if (!ing) return;
  const item = C.chaveIng(id), sd = saldos()[item], base = C.UNIDADES[C.normUn(ing.unidade)].base;
  const st = C.situacaoEstoque(sd, ing.estoqueMinimo, hoje(), cfg().diasAlertaValidade);
  const hist = movsEstoque().filter(m => m.item === item).sort((a, b) => String(b.data).localeCompare(String(a.data)) || String(b.criadoEm || '').localeCompare(String(a.criadoEm || ''))).slice(0, 8);
  const uns = unidadesContagem(ing);
  let acao = acaoInicial || 'ajuste';
  const corpo = '<div class="stats" style="margin:0"><div class="stat"><div class="r">Tem agora</div><div class="n' + (st.negativo ? ' neg-txt' : '') + '">' + (sd ? C.qtdLegivel(st.qtd, base) : '—') + '</div></div><div class="stat"><div class="r">Validade</div><div class="n" style="font-size:18px">' + (st.validade ? dataDia(st.validade) : '—') + '</div></div></div>' +
    '<div class="seg" role="group" aria-label="O que registrar">' + [['ajuste', 'Contagem'], ['entrada', 'Entrada'], ['perda', 'Perda']].map(a => '<button type="button" data-ac="' + a[0] + '" aria-pressed="' + (a[0] === acao) + '">' + a[1] + '</button>').join('') + '</div>' +
    '<form id="f-est" style="display:flex;flex-direction:column;gap:12px"><p class="mudo" id="exp-est"></p>' +
    '<div class="campo"><span id="rot-qtd">Quanto tem agora</span><div class="linha-campos" style="flex-wrap:nowrap"><input class="entrada num" name="qtd" inputmode="decimal" required aria-labelledby="rot-qtd"><select class="entrada" name="un" style="flex:0 1 auto" aria-label="Unidade">' + uns.map(u => '<option value="' + u.v + '">' + esc(u.r) + '</option>').join('') + '</select></div></div>' +
    '<label class="campo" id="campo-val"><span>Validade (opcional)</span><input class="entrada" type="date" name="validade"></label>' +
    '<label class="campo"><span>Observação</span><input class="entrada" name="obs" placeholder="Opcional"></label>' +
    '<div class="rodape-folha"><button type="button" class="btn sec" data-fechar>Fechar</button><button class="btn" type="submit" id="btn-est">Registrar</button></div></form>' +
    '<hr class="separa"><label class="campo"><span>Estoque mínimo</span><div class="linha-campos" style="flex-wrap:nowrap"><input class="entrada num" id="min-est" inputmode="decimal" value="' + inNum(ing.estoqueMinimo) + '" placeholder="sem mínimo"><span class="mudo" style="flex:0 0 auto;align-self:center">' + base + '</span><button type="button" class="btn sec fino" id="salvar-min" style="flex:0 0 auto">Salvar mínimo</button></div><small>Abaixo disso, o app avisa no Início e aqui no Estoque.</small></label>' +
    htmlHistorico(hist, q => C.qtdLegivel(q, base));
  abrirFolha(ing.nome, corpo, function (d) {
    const f = $('#f-est', d);
    function ajustar() {
      $$('[data-ac]', d).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.ac === acao)));
      $('#rot-qtd', d).textContent = acao === 'ajuste' ? 'Quanto tem agora' : acao === 'entrada' ? 'Quanto entrou' : 'Quanto foi perdido ou descartado';
      $('#exp-est', d).textContent = acao === 'ajuste' ? 'Conte o que tem de fato. O app registra a diferença em relação ao que ele calculava.' : acao === 'entrada' ? 'Use para o que chegou sem ser lançado como compra no Caixa (doação, sobra de outra receita).' : 'Venceu, estragou, caiu no chão.';
      $('#campo-val', d).hidden = acao === 'perda';
      $('#btn-est', d).textContent = acao === 'ajuste' ? 'Registrar contagem' : acao === 'entrada' ? 'Registrar entrada' : 'Registrar perda';
    }
    $$('[data-ac]', d).forEach(b => b.onclick = () => { acao = b.dataset.ac; ajustar(); });
    ajustar();
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const n = C.lerNum(f.qtd.value);
      if (!C.numOk(n) || n < 0 || (acao !== 'ajuste' && n === 0)) { toast('Informe uma quantidade válida.'); return; }
      const fator = uns.find(u => u.v === f.un.value).f, qb = n * fator;
      const atual = sd ? sd.qtd : 0;
      const delta = acao === 'ajuste' ? qb - atual : acao === 'entrada' ? qb : -qb;
      if (acao === 'ajuste' && Math.abs(delta) < 1e-9 && !f.validade.value) { d.close(); toast('Contagem confere com o estoque.'); return; }
      const m = { item: item, nome: ing.nome, motivo: acao, validade: acao === 'perda' ? '' : f.validade.value, obs: f.obs.value.trim() };
      if (Math.abs(delta) < 1e-9) gravarRegistro('estoque', Object.assign({ id: uid(), qtd: 0, data: hoje(), ref: '' }, m));
      else registrarMov(item, delta, acao, m);
      d.close(); toast(acao === 'ajuste' ? 'Contagem registrada.' : acao === 'entrada' ? 'Entrada registrada.' : 'Perda registrada.'); render(false);
    });
    ligarDesfazer(d);
    $('#salvar-min', d).onclick = function () {
      const v = C.lerNum($('#min-est', d).value);
      const c = clone(S.dados.ingredientes[id]); c.estoqueMinimo = C.numOk(v) && v > 0 ? v : null;
      gravarRegistro('ingredientes', c); toast('Mínimo salvo.'); d.close(); render(false);
    };
  });
}
export function telaContagem() {
  if (modoEstoque() === 'desligado') { location.hash = '#/estoque'; return ''; }
  if (!S.editor || S.editor.tipo !== 'contagem') S.editor = { tipo: 'contagem', sujo: false };
  const ings = lista('ingredientes').sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  const sd = saldos();
  let h = '<div class="cab-pagina"><div class="titulos"><a href="#/estoque" class="link-btn voltar">' + I.voltar + 'Estoque</a><h1>Contar estoque</h1><p class="sub">Preencha só o que contou. Linhas em branco ficam como estão.</p></div></div>';
  h += '<section class="bloco"><div class="grade" style="margin-bottom:10px"><label class="campo"><span>Data da contagem</span><input class="entrada" type="date" id="data-cont" value="' + hoje() + '"></label></div><div class="lista-contagem">' + ings.map(function (ing) {
    const x = sd[C.chaveIng(ing.id)];
    return '<div class="linha-contagem" data-id="' + esc(ing.id) + '"><div class="principal"><b>' + esc(ing.nome) + '</b><small>' + (x ? 'No app: ' + qtdIngTxt(ing, x.qtd) : 'Não contado') + '</small></div>' +
      '<div class="linha-campos" style="flex-wrap:nowrap"><input class="entrada num" data-cont-qtd inputmode="decimal" placeholder="—" aria-label="Quanto tem de ' + esc(ing.nome) + '"><select class="entrada" data-cont-un aria-label="Unidade">' + unidadesContagem(ing).map(u => '<option value="' + u.v + '">' + esc(u.v === 'emb' ? 'embal. (' + C.num(ing.qtdEmbalagem) + ' ' + rotUn(ing.unidade) + ')' : u.r) + '</option>').join('') + '</select></div></div>';
  }).join('') + '</div></section>';
  h += '<div class="barra-salvar"><span class="estado" id="estado-cont">Nada preenchido</span><button type="button" class="btn" data-acao="salvar-contagem">Salvar contagem</button></div>';
  return h;
}
export function montarContagem() {
  const cont = $('.lista-contagem'); if (!cont) return;
  cont.addEventListener('input', function () {
    const n = $$('[data-cont-qtd]').filter(i => i.value.trim() !== '').length;
    $('#estado-cont').textContent = n ? n + (n === 1 ? ' ingrediente preenchido' : ' ingredientes preenchidos') : 'Nada preenchido';
    if (S.editor && S.editor.tipo === 'contagem') S.editor.sujo = n > 0;
  });
}
// ---------- Registros do estoque: histórico com "desfazer" ----------
export function podeDesfazer(m) { return !m.ref && ['ajuste', 'entrada', 'perda', 'vitrine'].indexOf(m.motivo) >= 0; }
export function ondeDesfazer(m) {
  const r = String(m.ref || '');
  if (r.startsWith('compra:')) return 'para desfazer, exclua a compra no Caixa';
  if (r.startsWith('ped:')) return 'volta sozinho se o pedido voltar para confirmado';
  if (r.startsWith('vit:')) return 'para desfazer, desfaça o registro da vitrine';
  if (r.startsWith('venda:')) return 'para desfazer, exclua a venda no Caixa';
  if (r.startsWith('vendaped:')) return 'para desfazer, exclua o pedido do fiado';
  return '';
}
export function htmlHistorico(movs, fmt) {
  if (!movs.length) return '';
  return '<div><h3>Últimos registros</h3><ul class="historico hist-estoque">' + movs.map(function (m) {
    const qtd = Math.abs(m.qtd) < 1e-9 ? (m.validade ? 'validade ' + dataDia(m.validade) : 'confere') : (m.qtd > 0 ? '+' : '−') + fmt(Math.abs(m.qtd));
    const origem = !podeDesfazer(m) ? ondeDesfazer(m) : '';
    return '<li><span>' + dataDia(m.data) + ', ' + esc(C.MOTIVOS_ESTOQUE[m.motivo] || m.motivo) + (m.obs ? ' <small class="mudo">' + esc(m.obs) + '</small>' : '') + (origem ? '<small class="mudo hist-origem">' + esc(origem) + '</small>' : '') + '</span>' +
      '<span class="hist-dir"><b class="' + (m.qtd < 0 ? 'neg-txt' : m.qtd > 0 ? 'pos-txt' : '') + '">' + qtd + '</b>' + (podeDesfazer(m) ? '<button type="button" class="link-btn mini" data-desfazer="' + esc(m.id) + '" aria-label="Desfazer este registro">desfazer</button>' : '') + '</span></li>';
  }).join('') + '</ul></div>';
}
export function ligarDesfazer(d, depois) {
  $$('[data-desfazer]', d).forEach(b => b.onclick = async function () {
    const m = S.dados.estoque[b.dataset.desfazer]; if (!m) return;
    const baixa = movsEstoque().filter(x => x.ref === 'vit:' + m.id);
    d.close();
    const ok = await confirmar('Desfazer registro?', 'Desfazer "' + esc(C.MOTIVOS_ESTOQUE[m.motivo] || m.motivo) + '" de ' + dataDia(m.data) + '.' + (baixa.length ? ' Os ingredientes descontados ao fazer esses doces voltam para o estoque.' : ''), 'Desfazer', true);
    if (ok) { excluirRegistro('estoque', m.id); removerMovsRef('vit:' + m.id); toast('Registro desfeito.'); render(false); }
    if (depois) depois();
  });
}
// ---------- Início: avisos do estoque ----------
export function blocoEstoqueInicio() {
  if (modoEstoque() === 'desligado') return '';
  const sd = saldos(), cf = cfg(), hj = hoje();
  const baixos = [], validade = [];
  lista('ingredientes').forEach(function (ing) {
    const x = sd[C.chaveIng(ing.id)]; if (!x) return;
    const st = C.situacaoEstoque(x, ing.estoqueMinimo, hj, cf.diasAlertaValidade);
    if (st.abaixoMinimo || st.negativo) baixos.push({ nome: ing.nome, id: ing.id, st: st, txt: st.negativo ? 'negativo' : qtdIngTxt(ing, st.qtd) });
    if (st.vencido || st.venceLogo) validade.push({ nome: ing.nome, id: ing.id, st: st });
  });
  Object.values(sd).filter(x => x.item.startsWith('vit:') && x.qtd > 0).forEach(function (x) {
    const st = C.situacaoEstoque(x, 0, hj, cf.diasAlertaValidade);
    if (st.vencido || st.venceLogo) validade.push({ nome: nomeVitrine(x.item) + ' (vitrine)', vit: true, st: st });
  });
  if (!baixos.length && !validade.length) return '';
  let h = '<section class="bloco"><div class="cab-bloco"><h2>Estoque</h2><a class="link-btn" href="#/estoque">Ver estoque</a></div><div class="lista">';
  validade.sort((a, b) => a.st.diasParaVencer - b.st.diasParaVencer).forEach(v => { h += '<a class="item" href="' + (v.vit ? '#/estoque?v=vitrine' : '#/estoque?f=validade') + '"><div class="principal"><div class="nome">' + esc(v.nome) + '</div></div>' + chipValidade(v.st) + '</a>'; });
  baixos.slice(0, 6).forEach(b => { h += '<a class="item" href="#/estoque?f=minimo"><div class="principal"><div class="nome">' + esc(b.nome) + '</div><div class="det">Tem ' + esc(b.txt) + '</div></div><span class="chip ' + (b.st.negativo ? 'neg' : 'alerta') + '">' + (b.st.negativo ? 'negativo' : 'abaixo do mínimo') + '</span></a>'; });
  h += '</div>' + (baixos.length > 6 ? '<a class="link-btn" href="#/estoque?f=minimo">Ver todos os ' + baixos.length + ' abaixo do mínimo</a>' : '') + '</section>';
  return h;
}

// Ações dos botões desta parte (data-acao="...")
export const ACOES_ESTOQUE = {
  'estoque-item': function (el) { folhaItemEstoque(el.dataset.id); },
  'salvar-contagem': function () {
    const data = ($('#data-cont') || {}).value || hoje();
    const sd = saldos(); let n = 0;
    $$('.linha-contagem').forEach(function (row) {
      const v = row.querySelector('[data-cont-qtd]').value.trim(); if (v === '') return;
      const qtd = C.lerNum(v); if (!C.numOk(qtd) || qtd < 0) return;
      const ing = S.dados.ingredientes[row.dataset.id];
      const u = unidadesContagem(ing).find(x => x.v === row.querySelector('[data-cont-un]').value);
      const item = C.chaveIng(ing.id), atual = sd[item] ? sd[item].qtd : 0;
      const delta = qtd * u.f - atual;
      if (Math.abs(delta) > 1e-9) registrarMov(item, delta, 'ajuste', { data: data, obs: 'Contagem geral' });
      else if (!sd[item]) gravarRegistro('estoque', { id: uid(), item: item, nome: ing.nome, qtd: 0, motivo: 'ajuste', data: data, ref: '', validade: '', obs: 'Contagem geral' });
      n++;
    });
    if (!n) { toast('Preencha pelo menos um ingrediente.'); return; }
    S.editor = null;
    toast(n === 1 ? '1 ingrediente contado.' : n + ' ingredientes contados.'); ir('#/estoque');
  }
};
