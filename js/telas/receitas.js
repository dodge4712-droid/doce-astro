// Telas de receitas: lista e editor (ingredientes, custos, lucro, opções de venda).
import * as C from '../motor/index.js';
import { S, cfg, ctxCalc, lista } from '../nucleo/estado.js';
import { I, p } from '../nucleo/icones.js';
import { abas, abrirFolha, confirmar, toast } from '../nucleo/interface.js';
import { excluirRegistro, gravarRegistro } from '../nucleo/registros.js';
import { ir, render, trocarEnderecoSemDesenhar } from '../nucleo/rotas.js';
import { $, $$, clone, dataDia, esc, inNum, normBusca, porBaseTxt, rotUn, uid } from '../nucleo/util.js';
import { folhaIngrediente } from './ingredientes.js';
import { salvarPedido } from './pedidos.js';

// ================= Receitas =================
export function novaReceitaBase() {
  const cf = cfg();
  return {
    id: uid(), nome: '', categoria: '', tempoMin: null, perdaPct: null,
    rendimento: { qtd: null, unidade: 'un' }, itens: [], custosDiretos: [],
    incluir: { fixos: true, maoObra: true },
    precificacao: { modo: 'margem', valor: cf.margemPadrao },
    taxas: { cartao: 'nenhum', app: false, entrega: false },
    variacoes: [{ id: uid(), nome: 'Unidade', qtd: 1, unidade: 'un', embalagem: null, precoPraticado: null }],
    obs: ''
  };
}
export function telaReceitas() {
  const recs = lista('receitas').sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));
  let h = '<div class="cab-pagina"><div class="titulos"><h1>Receitas</h1><p class="sub">Custo, preço sugerido e lucro de cada doce.</p></div><div class="acoes"><a class="btn" href="#/receita/nova">' + I.mais + 'Nova receita</a></div></div>' + abas(ABAS_REC, '#/receitas');
  if (!recs.length) {
    return h + '<div class="bloco vazio">' + I.emblema + '<h2>Nenhuma receita ainda</h2><p>Cadastre a receita com os ingredientes e quanto ela rende. O app calcula o resto.</p><a class="btn" href="#/receita/nova">' + I.mais + 'Nova receita</a></div>';
  }
  const cats = Array.from(new Set(recs.map(r => r.categoria).filter(Boolean))).sort();
  h += '<div class="linha-campos" style="margin-bottom:14px"><label class="busca"><span class="sr">Buscar receita</span>' + I.busca + '<input class="entrada" id="busca-rec" type="search" placeholder="Buscar receita"></label>' +
    (cats.length ? '<label class="campo" style="flex:0 1 220px"><span class="sr">Categoria</span><select class="entrada" id="cat-rec"><option value="">Todas as categorias</option>' + cats.map(c => '<option>' + esc(c) + '</option>').join('') + '</select></label>' : '') + '</div>';
  const ctx = ctxCalc(); const alerta = (cfg().margemAlerta || 0) / 100;
  h += '<div class="lista" id="lista-rec">' + recs.map(function (r) {
    const c = C.calcularReceita(r, ctx);
    const v = (c.variacoes || [])[0];
    let chips = '';
    if (r.categoria) chips += '<span class="chip">' + esc(r.categoria) + '</span>';
    const temPrej = (c.variacoes || []).some(x => x.prejuizo);
    if (temPrej) chips += '<span class="chip neg">' + I.desce + 'abaixo do custo</span>';
    else if (v && C.numOk(v.margemReal)) chips += '<span class="chip ' + (v.margemReal < alerta ? 'alerta' : 'pos') + '">margem ' + C.pct(v.margemReal) + '</span>';
    if (c.avisos.length) chips += '<span class="chip alerta">' + I.alerta + (c.avisos.length === 1 ? '1 aviso' : c.avisos.length + ' avisos') + '</span>';
    const rend = r.rendimento && C.numOk(r.rendimento.qtd) ? 'rende ' + C.num(r.rendimento.qtd) + ' ' + rotUn(r.rendimento.unidade) : 'sem rendimento';
    return '<a class="item" href="#/receita/' + encodeURIComponent(r.id) + '" data-busca="' + esc(normBusca(r.nome)) + '" data-cat="' + esc(r.categoria || '') + '">' +
      '<div class="principal"><div class="nome">' + esc(r.nome || 'Receita sem nome') + '</div><div class="det">' + rend + (C.numOk(c.custoPorBase) ? ', custo ' + C.brl(c.custoPorBase, c.custoPorBase < 1 ? 4 : 2) + '/' + c.unidadeBase : '') + '</div></div>' +
      '<div class="valor">' + (v && C.numOk(v.preco) ? C.brl(v.preco) + '<small>' + esc(v.nome || '') + '</small>' : '—') + '</div><div class="chips">' + chips + '</div></a>';
  }).join('') + '</div><p class="mudo" id="sem-res-rec" hidden style="padding:16px">Nenhuma receita encontrada.</p>';
  return h;
}
export function montarFiltroReceitas() {
  const b = $('#busca-rec'), c = $('#cat-rec'); if (!b) return;
  function f() {
    const q = normBusca(b.value), cat = c ? c.value : ''; let n = 0;
    $$('#lista-rec .item').forEach(el => { const v = (!q || el.dataset.busca.includes(q)) && (!cat || el.dataset.cat === cat); el.hidden = !v; if (v) n++; });
    $('#sem-res-rec').hidden = n > 0;
  }
  b.addEventListener('input', f); if (c) c.addEventListener('change', f);
}
// ---------- Editor de receita ----------
export function telaEditorReceita(id) {
  if (!S.editor || S.editor.tipo !== 'receita' || S.editor.idRota !== id) {
    let d;
    if (id === 'nova') d = novaReceitaBase();
    else if (S.dados.receitas[id] && !S.dados.receitas[id].excluidoEm) d = clone(S.dados.receitas[id]);
    else return '<div class="bloco vazio">' + I.emblema + '<h2>Receita não encontrada</h2><p>Ela pode ter sido excluída em outro aparelho.</p><a class="btn" href="#/receitas">Ver receitas</a></div>';
    S.editor = { tipo: 'receita', idRota: id, nova: id === 'nova', d: d, sujo: false };
  }
  return htmlEditor();
}
export function opcoesUn(unidadeRef, atual) {
  const fam = C.unidadesDaFamilia(unidadeRef);
  const lst = fam.length ? fam : Object.keys(C.UNIDADES);
  return lst.map(u => '<option value="' + u + '"' + (C.normUn(atual) === u ? ' selected' : '') + '>' + C.UNIDADES[u].rotulo + '</option>').join('');
}
export function htmlEditor() {
  const e = S.editor, r = e.d, cf = cfg();
  const cats = Array.from(new Set(lista('receitas').map(x => x.categoria).filter(Boolean)));
  const tH = C.numOk(r.tempoMin) ? Math.floor(r.tempoMin / 60) : null, tM = C.numOk(r.tempoMin) ? r.tempoMin % 60 : null;
  const pc = r.precificacao || {};
  const vMarkup = pc.modo === 'markup' ? pc.valor : (C.numOk(pc.valor) ? C.margemParaMarkup(pc.valor / 100) * 100 : null);
  const vMargem = pc.modo === 'markup' ? (C.numOk(pc.valor) ? C.markupParaMargem(pc.valor / 100) * 100 : null) : pc.valor;
  const fh = C.fixosPorHora(cf), vh = C.valorHora(cf);
  const t = r.taxas || {};

  let h = '<div class="cab-pagina"><div class="titulos"><a href="#/receitas" class="link-btn" style="display:inline-flex;align-items:center;gap:4px;text-decoration:none">' + I.voltar + 'Receitas</a><h1>' + esc(r.nome || (e.nova ? 'Nova receita' : 'Receita sem nome')) + '</h1></div></div>';
  h += '<div class="editor"><div class="form-rec">';

  // Básico
  h += '<section class="bloco"><h2>Receita</h2><div class="grade">' +
    '<label class="campo"><span>Nome</span><input class="entrada" data-c="nome" value="' + esc(r.nome) + '" placeholder="Ex.: Brigadeiro gourmet"></label>' +
    (function () {
      const lst = cats.slice().sort((x, y) => x.localeCompare(y, 'pt-BR'));
      const nova = !!e.catNova || (r.categoria && lst.indexOf(r.categoria) < 0);
      return '<div class="campo"><label for="sel-cat"><span>Categoria</span></label><select class="entrada" id="sel-cat" data-cat-sel>' +
        '<option value=""' + (!r.categoria && !nova ? ' selected' : '') + '>Sem categoria</option>' +
        lst.map(c => '<option' + (c === r.categoria && !nova ? ' selected' : '') + '>' + esc(c) + '</option>').join('') +
        '<option value="__nova__"' + (nova ? ' selected' : '') + '>+ Criar nova categoria…</option></select>' +
        '<input class="entrada" data-c="categoria" id="nova-cat" aria-label="Nome da nova categoria" placeholder="Nome da nova categoria" value="' + (nova ? esc(r.categoria) : '') + '"' + (nova ? '' : ' hidden') + ' style="margin-top:8px"></div>';
    })() + '</div>' +
    '<div class="grade" style="margin-top:12px">' +
    '<div class="campo"><span>Rendimento</span><div class="linha-campos" style="flex-wrap:nowrap"><input class="entrada num" data-c="rendimento.qtd" data-n inputmode="decimal" value="' + inNum(r.rendimento.qtd) + '" placeholder="40" aria-label="Quantidade que a receita rende"><select class="entrada" data-c="rendimento.unidade" data-estrut style="flex:0 0 96px" aria-label="Unidade do rendimento">' + opcoesUn(null, r.rendimento.unidade) + '</select></div><small>Quanto sai de uma receita: unidades, gramas ou ml.</small></div>' +
    '<div class="campo"><span>Tempo de produção</span><div class="linha-campos" style="flex-wrap:nowrap"><span class="com-prefixo"><input class="entrada num" data-c="_th" data-n inputmode="numeric" value="' + (tH === null ? '' : tH) + '" aria-label="Horas"><i class="dir">h</i></span><span class="com-prefixo"><input class="entrada num" data-c="_tm" data-n inputmode="numeric" value="' + (tM === null ? '' : tM) + '" aria-label="Minutos"><i class="dir">min</i></span></div><small>Usado para mão de obra e custos fixos.</small></div>' +
    '<label class="campo"><span>Perda</span><span class="com-prefixo"><input class="entrada num" data-c="perdaPct" data-n inputmode="decimal" value="' + inNum(r.perdaPct) + '" placeholder="0"><i class="dir">%</i></span><small>O que fica na panela ou quebra. Aumenta o custo dos ingredientes.</small></label>' +
    '</div></section>';

  // Ingredientes
  h += '<section class="bloco"><h2>Ingredientes</h2><div class="linhas-edit">' +
    (r.itens.length ? r.itens.map(function (it, i) {
      let nome, unRef, tag = '';
      if (it.tipo === 'rec') {
        const sub = S.dados.receitas[it.refId];
        nome = sub ? sub.nome || 'Receita sem nome' : '(receita removida)';
        unRef = sub && sub.rendimento ? sub.rendimento.unidade : it.unidade;
        tag = '<span class="chip">' + I.receitaDentro + 'receita, ' + (it.modo === 'preco' ? 'pelo preço' : 'pelo custo') + '</span>';
      } else {
        const ing = S.dados.ingredientes[it.refId];
        nome = ing ? ing.nome : '(ingrediente removido)'; unRef = ing ? ing.unidade : it.unidade;
      }
      return '<div class="linha-edit"><div class="nome-it"><span>' + esc(nome) + '</span>' + tag + '<span class="custo-it" data-custo-item="' + i + '"></span></div>' +
        '<div class="qtd"><input class="entrada num" data-c="itens.' + i + '.qtd" data-n inputmode="decimal" value="' + inNum(it.qtd) + '" aria-label="Quantidade de ' + esc(nome) + '" placeholder="Qtd"><select class="entrada" data-c="itens.' + i + '.unidade" aria-label="Unidade">' + opcoesUn(unRef, it.unidade) + '</select></div>' +
        '<div class="acoes">' + (it.tipo === 'rec' ? '<button type="button" class="btn sec fino" data-acao="alternar-modo" data-i="' + i + '">Trocar para ' + (it.modo === 'preco' ? 'custo' : 'preço') + '</button>' : '') + '<button type="button" class="btn-icone" data-acao="rem-item" data-i="' + i + '" aria-label="Remover ' + esc(nome) + '">' + I.lixo + '</button></div>' +
        '<div class="aviso-it" data-aviso-item="' + i + '"></div></div>';
    }).join('') : '<p class="mudo">Nenhum ingrediente na receita.</p>') +
    '</div><button type="button" class="btn sec" style="margin-top:12px" data-acao="add-item">' + I.mais + 'Adicionar ingrediente ou receita</button></section>';

  // Custos diretos
  h += '<section class="bloco"><h2>Outros custos da receita</h2><p class="explica">Coisas gastas a cada receita que não são ingrediente: forminhas, fitas, etiquetas. A embalagem de venda (caixa, pote) vai em cada opção de venda, lá embaixo.</p><div class="linhas-edit">' +
    (r.custosDiretos || []).map((c, i) => '<div class="linha-edit" style="grid-template-columns:1fr 150px auto"><input class="entrada" data-c="custosDiretos.' + i + '.desc" value="' + esc(c.desc) + '" placeholder="Ex.: forminhas nº 4" aria-label="Descrição"><span class="com-prefixo"><i>R$</i><input class="entrada num" data-c="custosDiretos.' + i + '.valor" data-n inputmode="decimal" value="' + inNum(c.valor) + '" aria-label="Valor"></span><button type="button" class="btn-icone" data-acao="rem-direto" data-i="' + i + '" aria-label="Remover custo">' + I.lixo + '</button></div>').join('') +
    '</div><button type="button" class="btn sec" style="margin-top:12px" data-acao="add-direto">' + I.mais + 'Adicionar custo</button></section>';

  // Incluir
  h += '<section class="bloco"><h2>Tempo e custos da doceria</h2>' +
    '<label class="chave"><span class="rot">Custos fixos rateados<small>' + (C.numOk(fh) && C.totalFixos(cf) > 0 ? C.brl(fh) + ' por hora de produção (aluguel, luz, gás…)' : 'Custos fixos ainda não preenchidos em Ajustes') + '</small></span><input type="checkbox" data-c="incluir.fixos" data-b' + (r.incluir && r.incluir.fixos === false ? '' : ' checked') + '></label>' +
    '<label class="chave"><span class="rot">Mão de obra<small>' + (C.numOk(vh) ? C.brl(vh) + ' por hora' : 'Valor da hora não definido em Ajustes') + '</small></span><input type="checkbox" data-c="incluir.maoObra" data-b' + (r.incluir && r.incluir.maoObra === false ? '' : ' checked') + '></label>' +
    '<a class="link-btn" href="#/ajustes#fixos">Mudar valores em Ajustes</a></section>';

  // Preço
  h += '<section class="bloco"><h2>Lucro desejado</h2><p class="explica">Digite em um dos campos; o outro mostra o equivalente. Vale o último que você digitou.</p><div class="grade">' +
    '<label class="campo"><span>Markup' + (pc.modo === 'markup' ? ' (definido por você)' : '') + '</span><span class="com-prefixo"><input class="entrada num" id="in-markup" data-preco="markup" inputmode="decimal" value="' + (C.numOk(vMarkup) ? inNum(Math.round(vMarkup * 10) / 10) : '') + '"><i class="dir">%</i></span><small>Quanto soma em cima do custo.</small></label>' +
    '<label class="campo"><span>Margem' + (pc.modo !== 'markup' ? ' (definida por você)' : '') + '</span><span class="com-prefixo"><input class="entrada num" id="in-margem" data-preco="margem" inputmode="decimal" value="' + (C.numOk(vMargem) ? inNum(Math.round(vMargem * 10) / 10) : '') + '"><i class="dir">%</i></span><small>Quanto do preço vira lucro.</small></label></div>' +
    '<details class="ajuda"><summary>Qual a diferença entre markup e margem?</summary><div><p>Markup é quanto se soma em cima do custo. Margem é quanto do preço final vira lucro.</p><p>Um doce que custa R$ 1,00 e é vendido a R$ 2,00 tem markup de 100% e margem de 50%. É a mesma venda; muda só a conta.</p><p>Com taxas de cartão ou aplicativo, o app ajusta o preço para que você receba o markup ou a margem que digitou, depois de descontadas as taxas.</p></div></details></section>';

  // Taxas
  const tx = cf.taxas;
  h += '<section class="bloco"><h2>Taxas no preço</h2><p class="explica">Opcionais. Ligue as que costumam incidir na venda deste produto.</p>' +
    '<label class="campo"><span>Cartão</span><select class="entrada" data-c="taxas.cartao">' +
    [['nenhum', 'Sem taxa de cartão'], ['debito', 'Débito (' + C.num(tx.debito) + '%)'], ['credito', 'Crédito à vista (' + C.num(tx.credito) + '%)'], ['parcelado', 'Crédito parcelado (' + C.num(tx.parcelado) + '%)']].map(o => '<option value="' + o[0] + '"' + ((t.cartao || 'nenhum') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select></label>' +
    '<label class="chave"><span class="rot">Aplicativo de entrega<small>' + C.num(tx.app) + '% do preço</small></span><input type="checkbox" data-c="taxas.app" data-b' + (t.app ? ' checked' : '') + '></label>' +
    '<label class="chave"><span class="rot">Taxa de entrega<small>' + C.brl(tx.entrega) + ' por venda, embutida no preço</small></span><input type="checkbox" data-c="taxas.entrega" data-b' + (t.entrega ? ' checked' : '') + '></label></section>';

  // Variações
  h += '<section class="bloco"><h2>Opções de venda</h2><p class="explica">Como este doce é vendido: unidade, caixa com 4, cento, bolo de 1 kg. Cada opção usa uma parte do rendimento e pode ter embalagem própria.</p><div class="linhas-edit">' +
    (r.variacoes || []).map((v, i) => '<div class="linha-edit linha-var">' +
      '<label class="campo"><span>Nome</span><input class="entrada" data-c="variacoes.' + i + '.nome" value="' + esc(v.nome) + '" placeholder="Ex.: Caixa com 4"></label>' +
      '<div class="campo"><span>Usa da receita</span><div class="qtd" style="display:flex;gap:8px"><input class="entrada num" data-c="variacoes.' + i + '.qtd" data-n inputmode="decimal" value="' + inNum(v.qtd) + '" aria-label="Quantidade usada"><select class="entrada" data-c="variacoes.' + i + '.unidade" style="flex:0 0 84px" aria-label="Unidade">' + opcoesUn(r.rendimento.unidade, v.unidade || r.rendimento.unidade) + '</select></div></div>' +
      '<label class="campo"><span>Embalagem</span><span class="com-prefixo"><i>R$</i><input class="entrada num" data-c="variacoes.' + i + '.embalagem" data-n inputmode="decimal" value="' + inNum(v.embalagem) + '" placeholder="0,00"></span></label>' +
      '<label class="campo"><span>Preço que você cobra</span><span class="com-prefixo"><i>R$</i><input class="entrada num" data-c="variacoes.' + i + '.precoPraticado" data-n inputmode="decimal" value="' + inNum(v.precoPraticado) + '" placeholder="sugerido"></span></label>' +
      '<div class="res" data-var-res="' + i + '"></div>' +
      '<div class="acoes" style="grid-column:1/-1;justify-content:flex-end"><button type="button" class="btn perigo fino" data-acao="rem-var" data-i="' + i + '">' + I.lixo + 'Remover opção</button></div></div>').join('') +
    '</div><button type="button" class="btn sec" style="margin-top:12px" data-acao="add-var">' + I.mais + 'Adicionar opção de venda</button></section>';

  h += '<section class="bloco"><h2>Anotações</h2><label class="campo"><span class="sr">Anotações</span><textarea class="entrada" data-c="obs" placeholder="Modo de preparo, dicas, fornecedor…">' + esc(r.obs) + '</textarea></label></section>';

  h += '<div class="barra-salvar"><span class="estado" id="estado-ed">' + (e.sujo ? 'Alterações não salvas' : (e.nova ? 'Receita nova' : 'Tudo salvo')) + '</span>' +
    (!e.nova ? '<button type="button" class="btn perigo fino" data-acao="excluir-rec" aria-label="Excluir receita" title="Excluir receita">' + I.lixo + '<span>Excluir</span></button><button type="button" class="btn sec fino" data-acao="duplicar-rec" aria-label="Duplicar receita" title="Duplicar receita">' + I.copiar + '<span>Duplicar</span></button>' : '') +
    '<button type="button" class="btn" data-acao="salvar-rec">Salvar receita</button></div>';

  h += '</div><aside class="painel"><div class="bloco" id="resumo" aria-live="polite"></div></aside></div>';
  return h;
}
export function lerCaminho(o, cam) { return cam.split('.').reduce((a, k) => (a === undefined || a === null ? undefined : a[k]), o); }
export function gravarCaminho(o, cam, v) {
  const ks = cam.split('.'); let a = o;
  for (let i = 0; i < ks.length - 1; i++) { if (a[ks[i]] === undefined || a[ks[i]] === null) a[ks[i]] = {}; a = a[ks[i]]; }
  a[ks[ks.length - 1]] = v;
}
export function montarEditor() {
  const cont = $('.form-rec'); if (!cont || !S.editor) return;
  cont.addEventListener('input', aoEditar);
  cont.addEventListener('change', aoEditar);
  recalcular();
}
export function marcarSujo() {
  if (!S.editor) return;
  S.editor.sujo = true;
}
export function aoEditar(ev) {
  const el = ev.target; const d = S.editor && S.editor.d; if (!d) return;
  if (el.hasAttribute('data-cat-sel')) {
    if (ev.type !== 'change') return;
    const campo = $('#nova-cat');
    if (el.value === '__nova__') { S.editor.catNova = true; d.categoria = ''; campo.value = ''; campo.hidden = false; campo.focus(); }
    else { S.editor.catNova = false; d.categoria = el.value; campo.hidden = true; campo.value = ''; }
    marcarSujo(); return;
  }
  if (el.dataset.preco) {
    if (ev.type !== 'input') return;
    const v = C.lerNum(el.value);
    d.precificacao = { modo: el.dataset.preco, valor: v };
    const outro = el.dataset.preco === 'markup' ? $('#in-margem') : $('#in-markup');
    const eq = !C.numOk(v) ? null : el.dataset.preco === 'markup' ? C.markupParaMargem(v / 100) : C.margemParaMarkup(v / 100);
    outro.value = C.numOk(eq) ? inNum(Math.round(eq * 1000) / 10) : '';
    marcarSujo(); recalcular(); return;
  }
  const cam = el.dataset.c; if (!cam) return;
  if (el.tagName === 'SELECT' || el.type === 'checkbox') { if (ev.type !== 'change') return; }
  else if (ev.type !== 'input') return;
  let v;
  if (el.hasAttribute('data-b')) v = el.checked;
  else if (el.hasAttribute('data-n')) v = C.lerNum(el.value);
  else v = el.value;
  if (cam === '_th' || cam === '_tm') {
    const hh = C.lerNum($('[data-c="_th"]').value), mm = C.lerNum($('[data-c="_tm"]').value);
    d.tempoMin = (hh === null && mm === null) ? null : Math.round((hh || 0) * 60 + (mm || 0));
  } else gravarCaminho(d, cam, v);
  if (cam === 'nome') { const t = $('.cab-pagina h1'); if (t) t.textContent = v || 'Nova receita'; }
  marcarSujo();
  if (cam === 'rendimento.unidade') {
    // opções de venda acompanham a nova família de unidade
    (d.variacoes || []).forEach(x => { if (!C.mesmaFamilia(x.unidade, v)) x.unidade = v; });
    render(false); return;
  }
  recalcular();
}
export function recalcular() {
  const e = S.editor; if (!e) return;
  const r = e.d;
  const c = C.calcularReceita(r, ctxCalc(r));
  (c.itens || []).forEach(function (it, i) {
    const ce = $('[data-custo-item="' + i + '"]'), ae = $('[data-aviso-item="' + i + '"]');
    if (ce) ce.textContent = C.numOk(it.custo) ? C.brl(it.custo) : '';
    if (ae) ae.textContent = it.aviso || '';
  });
  (c.variacoes || []).forEach(function (v, i) {
    const el = $('[data-var-res="' + i + '"]'); if (!el) return;
    if (v.aviso && !C.numOk(v.preco)) { el.innerHTML = '<div class="aviso">' + I.alerta + '<div class="txt">' + esc(v.aviso) + '</div></div>'; return; }
    el.innerHTML = '<dl class="resultados">' +
      '<div><dt>Custo</dt><dd>' + C.brl(v.custo) + '</dd></div>' +
      '<div><dt>Preço sugerido</dt><dd>' + C.brl(v.precoSugerido) + '</dd></div>' +
      (v.taxasValor > 0 ? '<div><dt>Taxas</dt><dd>' + C.brl(v.taxasValor) + '</dd></div>' : '') +
      '<div class="' + (v.prejuizo ? 'neg' : 'pos') + '"><dt>' + (v.prejuizo ? 'Prejuízo' : 'Lucro') + '</dt><dd>' + (v.prejuizo ? I.desce : I.sobe) + ' ' + C.brl(Math.abs(v.lucro)) + '</dd></div>' +
      '<div><dt>Margem real</dt><dd>' + C.pct(v.margemReal) + '</dd></div>' +
      '<div><dt>Markup real</dt><dd>' + C.pct(v.markupReal) + '</dd></div></dl>' +
      (v.prejuizo ? '<div class="aviso neg" style="margin-top:8px">' + I.alerta + '<div class="txt">O preço cobrado não cobre o custo desta opção.</div></div>' : '') +
      (v.aviso ? '<div class="aviso" style="margin-top:8px">' + I.alerta + '<div class="txt">' + esc(v.aviso) + '</div></div>' : '');
  });
  const est = $('#estado-ed');
  if (est) est.innerHTML = (C.numOk(c.custoPorBase) ? '<b style="color:var(--ink)">' + C.brl(c.custoPorBase, c.custoPorBase < 1 ? 4 : 2) + '</b> por ' + esc(c.unidadeBase) + '<br>' : '') + (e.sujo ? 'Alterações não salvas' : (e.nova ? 'Receita nova' : 'Tudo salvo'));
  const res = $('#resumo'); if (!res) return;
  const partes = [
    ['Ingredientes', c.custoIngredientes, '#E2A65A'],
    ['Perda', c.perdaValor, '#C98B6B'],
    ['Outros custos', c.diretos, '#F3C9BD'],
    ['Custos fixos', c.fixos, '#9FC7A8'],
    ['Mão de obra', c.maoObra, '#FEF0ED']
  ];
  const tot = c.custoLote || 0;
  const rend = r.rendimento || {};
  res.innerHTML = '<h2>Custo da receita</h2><ul class="decomp">' +
    partes.map(x => '<li><span><i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:' + x[2] + ';margin-right:8px"></i>' + x[0] + '</span><span>' + C.brl(x[1]) + '</span></li>').join('') +
    '<li class="total"><span>Custo total</span><span>' + C.brl(tot) + '</span></li></ul>' +
    (tot > 0 ? '<div class="barra" aria-hidden="true">' + partes.map(x => x[1] > 0 ? '<i style="width:' + (x[1] / tot * 100).toFixed(2) + '%;background:' + x[2] + '"></i>' : '').join('') + '</div>' : '') +
    '<div class="destaque-un"><div class="r">Custo por ' + (c.unidadeBase || 'unidade') + '</div><div class="v">' + (C.numOk(c.custoPorBase) ? C.brl(c.custoPorBase, c.custoPorBase < 1 ? 4 : 2) : '—') + '</div>' +
    '<div class="r">' + (C.numOk(rend.qtd) ? 'Receita rende ' + C.num(rend.qtd) + ' ' + rotUn(rend.unidade) : 'Informe o rendimento') + (c.horas > 0 ? ', ' + C.num(c.horas, 2) + ' h de produção' : '') + '</div></div>' +
    (c.avisos.length ? '<div class="avisos-painel"><b>Para o cálculo ficar completo:</b><ul>' + Array.from(new Set(c.avisos)).map(a => '<li>' + esc(a) + '</li>').join('') + '</ul></div>' : '');
}
export function folhaEscolherItem() {
  const e = S.editor; const atual = e.d;
  const bloqueadas = C.receitasQueDependemDe(atual.id, S.dados.receitas);
  const ings = lista('ingredientes').sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  const recs = lista('receitas').filter(r => !bloqueadas.has(r.id)).sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));
  const corpo = '<label class="busca"><span class="sr">Buscar</span>' + I.busca + '<input class="entrada" id="busca-it" type="search" placeholder="Buscar ingrediente ou receita" autofocus></label>' +
    '<div class="lista" id="lista-it">' +
    ings.map(i => '<button type="button" class="item" data-tipo="ing" data-id="' + esc(i.id) + '" data-busca="' + esc(normBusca(i.nome)) + '"><div class="principal"><div class="nome">' + esc(i.nome) + '</div><div class="det">' + porBaseTxt(i) + '</div></div></button>').join('') +
    (recs.length ? '<p class="mudo" data-sep style="margin-top:8px">Receitas</p>' + recs.map(r => '<button type="button" class="item" data-tipo="rec" data-id="' + esc(r.id) + '" data-busca="' + esc(normBusca(r.nome)) + '"><div class="principal"><div class="nome">' + I.receitaDentro + ' ' + esc(r.nome || 'Receita sem nome') + '</div><div class="det">rende ' + (r.rendimento && C.numOk(r.rendimento.qtd) ? C.num(r.rendimento.qtd) + ' ' + rotUn(r.rendimento.unidade) : '—') + '</div></div></button>').join('') : '') +
    '</div><p class="mudo" id="sem-it" hidden>Nada encontrado.</p><button type="button" class="btn sec" data-novo-ing>' + I.mais + 'Cadastrar ingrediente novo</button>';
  abrirFolha('Adicionar à receita', corpo, function (d) {
    const b = $('#busca-it', d);
    b.addEventListener('input', function () {
      const q = normBusca(b.value); let n = 0;
      $$('#lista-it .item', d).forEach(el => { const v = !q || el.dataset.busca.includes(q); el.hidden = !v; if (v) n++; });
      const sep = $('[data-sep]', d); if (sep) sep.hidden = !!q;
      $('#sem-it', d).hidden = n > 0;
    });
    $('[data-novo-ing]', d).onclick = function () { d.close(); folhaIngrediente(null, function (ing) { adicionarItem({ tipo: 'ing', refId: ing.id, qtd: null, unidade: C.UNIDADES[ing.unidade].base }); }); };
    $$('#lista-it .item', d).forEach(el => el.onclick = function () {
      if (el.dataset.tipo === 'ing') {
        const ing = S.dados.ingredientes[el.dataset.id];
        d.close(); adicionarItem({ tipo: 'ing', refId: ing.id, qtd: null, unidade: C.UNIDADES[C.normUn(ing.unidade)].base });
      } else {
        const sub = S.dados.receitas[el.dataset.id];
        d.close();
        escolherModo(sub.nome, function (modo) { adicionarItem({ tipo: 'rec', refId: sub.id, qtd: null, unidade: C.normUn(sub.rendimento && sub.rendimento.unidade) || 'un', modo: modo }); });
      }
    });
  });
}
export function escolherModo(nome, fn) {
  const corpo = '<p>Como <b>' + esc(nome || 'esta receita') + '</b> deve entrar no custo?</p>' +
    '<button type="button" class="opcao-grande" data-modo="custo"><b>Pelo custo, sem lucro</b><span>Entra só o que custa produzir. O lucro fica todo no produto final.</span></button>' +
    '<button type="button" class="opcao-grande" data-modo="preco"><b>Pelo preço de venda, com lucro</b><span>Entra com o lucro desta receita embutido, como se você comprasse de si mesma.</span></button>';
  abrirFolha('Receita dentro de receita', corpo, function (d) {
    $$('[data-modo]', d).forEach(b => b.onclick = () => { d.close(); fn(b.dataset.modo); });
  });
}
export function adicionarItem(it) {
  S.editor.d.itens.push(it); marcarSujo(); render(false);
  setTimeout(function () { const el = $('[data-c="itens.' + (S.editor.d.itens.length - 1) + '.qtd"]'); if (el) el.focus(); }, 50);
}
export function validarReceita(r) {
  if (!String(r.nome || '').trim()) return 'Dê um nome para a receita.';
  const nomeIgual = lista('receitas').find(x => x.id !== r.id && normBusca(x.nome) === normBusca(r.nome));
  if (nomeIgual) return 'Já existe uma receita com esse nome.';
  if (C.numOk(r.perdaPct) && (r.perdaPct < 0 || r.perdaPct >= 100)) return 'A perda precisa ficar entre 0 e 99%.';
  return null;
}
export function salvarReceita() {
  const e = S.editor; const r = e.d;
  const erro = validarReceita(r);
  if (erro) { toast(erro); return false; }
  r.nome = r.nome.trim();
  // categoria escrita com outra grafia vira a que já existe ("brigadeiros" → "Brigadeiros")
  const catExist = lista('receitas').map(x => x.categoria).filter(Boolean).find(c => C.semAcento(c) === C.semAcento(r.categoria));
  r.categoria = catExist || String(r.categoria || '').trim();
  gravarRegistro('receitas', clone(r));
  const eraNova = e.nova;
  S.editor = { tipo: 'receita', idRota: r.id, nova: false, d: clone(r), sujo: false };
  toast('Receita salva.');
  if (eraNova) { trocarEnderecoSemDesenhar('#/receita/' + encodeURIComponent(r.id)); }
  render(false);
  return true;
}
export const ABAS_REC = [['#/receitas', 'Receitas'], ['#/ingredientes', 'Ingredientes']];

// Ações dos botões desta parte (data-acao="...")
export const ACOES_RECEITAS = {
  'tipo-ent': function (el) {
    const p = S.editor.d; p.tipoEntrega = el.dataset.v;
    if (p.tipoEntrega === 'entrega') {
      if (!C.numOk(p.taxaEntrega)) p.taxaEntrega = cfg().taxas.entrega;
      const cli = S.dados.clientes[p.clienteId];
      if (!p.endereco && cli && cli.endereco) p.endereco = cli.endereco;
    }
    marcarSujo(); render(false);
  },
  'add-avulso': function () {
    S.editor.d.itens.push({ id: uid(), tipo: 'avulso', nome: '', qtd: 1, precoUnit: null, custoUnit: null });
    marcarSujo(); render(false);
    setTimeout(() => { const el = $('[data-c="itens.' + (S.editor.d.itens.length - 1) + '.nome"]'); if (el) el.focus(); }, 50);
  },
  'rem-item-ped': function (el) { S.editor.d.itens.splice(+el.dataset.i, 1); marcarSujo(); render(false); },
  'rem-pag': async function (el) {
    const x = S.editor.d.pagamentos[+el.dataset.i];
    if (!await confirmar('Remover pagamento?', 'Remover o registro de ' + C.brl(x.valor) + ' de ' + dataDia(x.data) + '.', 'Remover', true)) return;
    S.editor.d.pagamentos.splice(+el.dataset.i, 1); marcarSujo();
    if (!salvarPedido('Pagamento removido.')) render(false);
  },
  'lanc-tipo': function (el) { const l = S.editor.d; l.tipo = el.dataset.v; l.categoria = ''; marcarSujo(); render(false); },
  'add-compra': function () {
    const l = S.editor.d;
    l.itensCompra.push({ id: uid(), ingredienteId: '', embalagens: 1, qtdEmbalagem: null, unidade: 'g', valor: null });
    if (!l.categoria) l.categoria = 'Ingredientes';
    marcarSujo(); render(false);
    setTimeout(() => { const s = $('[data-c="itensCompra.' + (l.itensCompra.length - 1) + '.ingredienteId"]'); if (s) s.focus(); }, 50);
  },
  'rem-compra': function (el) { S.editor.d.itensCompra.splice(+el.dataset.i, 1); marcarSujo(); render(false); },
  'add-item': folhaEscolherItem,
  'rem-item': function (el) { S.editor.d.itens.splice(+el.dataset.i, 1); marcarSujo(); render(false); },
  'alternar-modo': function (el) { const it = S.editor.d.itens[+el.dataset.i]; it.modo = it.modo === 'preco' ? 'custo' : 'preco'; marcarSujo(); render(false); },
  'add-direto': function () { S.editor.d.custosDiretos = S.editor.d.custosDiretos || []; S.editor.d.custosDiretos.push({ desc: '', valor: null }); marcarSujo(); render(false); },
  'rem-direto': function (el) { S.editor.d.custosDiretos.splice(+el.dataset.i, 1); marcarSujo(); render(false); },
  'add-var': function () {
    const r = S.editor.d; r.variacoes = r.variacoes || [];
    r.variacoes.push({ id: uid(), nome: '', qtd: null, unidade: C.normUn(r.rendimento.unidade) || 'un', embalagem: null, precoPraticado: null });
    marcarSujo(); render(false);
  },
  'rem-var': function (el) { S.editor.d.variacoes.splice(+el.dataset.i, 1); marcarSujo(); render(false); },
  'salvar-rec': salvarReceita,
  'duplicar-rec': function () {
    if (S.editor.sujo && !salvarReceita()) return;
    const c = clone(S.editor.d); c.id = uid(); c.nome = c.nome + ' (cópia)'; delete c.criadoEm; delete c.atualizadoEm;
    (c.variacoes || []).forEach(v => { v.id = uid(); });
    S.editor = { tipo: 'receita', idRota: 'nova', nova: true, d: c, sujo: true };
    trocarEnderecoSemDesenhar('#/receita/nova'); render(true);
    toast('Cópia criada. Ajuste e salve.');
  },
  'excluir-rec': async function () {
    const r = S.editor.d;
    const usam = lista('receitas').filter(x => x.id !== r.id && (x.itens || []).some(it => it.tipo === 'rec' && it.refId === r.id));
    if (usam.length) { toast('Esta receita é usada em: ' + usam.map(x => x.nome).join(', ') + '. Tire-a de lá antes de excluir.'); return; }
    const emPedidos = lista('pedidos').filter(p => ['orcamento', 'confirmado', 'producao', 'pronto'].includes(p.status) && (p.itens || []).some(it => it.tipo === 'rec' && it.receitaId === r.id));
    if (emPedidos.length) { toast('Esta receita está em ' + emPedidos.length + (emPedidos.length === 1 ? ' pedido em aberto' : ' pedidos em aberto') + '. Conclua ou tire dos pedidos antes de excluir.'); return; }
    if (await confirmar('Excluir receita?', 'Excluir <b>' + esc(r.nome) + '</b>. As outras receitas não são afetadas.', 'Excluir receita', true)) {
      excluirRegistro('receitas', r.id); S.editor = null; toast('Receita excluída.'); ir('#/receitas');
    }
  }
};
