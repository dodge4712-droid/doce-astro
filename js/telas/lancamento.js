// Formulário de entrada, saída e compra (com ingredientes comprados).
import * as C from '../motor/index.js';
import { S, cfg, ctxCalc, lista } from '../nucleo/estado.js';
import { I } from '../nucleo/icones.js';
import { confirmar, toast } from '../nucleo/interface.js';
import { excluirRegistro, gravarRegistro } from '../nucleo/registros.js';
import { ir, render } from '../nucleo/rotas.js';
import { $, clone, esc, hoje, inNum, porBaseTxt, rotUn, uid } from '../nucleo/util.js';
import { fonteCanonica, fontesConhecidas } from '../servicos/caixa.js';
import { aplicarEstoqueCompra, modoEstoque, removerMovsRef } from '../servicos/estoque.js';
import { folhaIngrediente, receitasAfetadas } from './ingredientes.js';
import { conferirRetiradaNoLancamento } from './prolabore.js';
import { gravarCaminho, marcarSujo, opcoesUn } from './receitas.js';

// ---------- Editor de lançamento ----------
export function novoLancamento(q) {
  if (q && q.get('compra')) {
    return { id: uid(), tipo: 'saida', data: hoje(), valor: null, descricao: '', categoria: fonteCanonica('Ingredientes', 'saida'), forma: 'pix', obs: '',
      itensCompra: [{ id: uid(), ingredienteId: '', embalagens: 1, qtdEmbalagem: null, unidade: 'g', valor: null }], outros: null };
  }
  return { id: uid(), tipo: q && q.get('tipo') === 'saida' ? 'saida' : 'entrada', data: hoje(), valor: null, descricao: '', categoria: (q && q.get('categoria')) || '', forma: 'pix', obs: '', itensCompra: [], outros: null };
}
export function telaEditorLancamento(id, q) {
  if (!S.editor || S.editor.tipo !== 'lancamento' || S.editor.idRota !== id) {
    let d;
    if (id === 'novo') d = novoLancamento(q);
    else if (S.dados.lancamentos[id] && !S.dados.lancamentos[id].excluidoEm) d = clone(S.dados.lancamentos[id]);
    else return '<div class="bloco vazio">' + I.emblema + '<h2>Lançamento não encontrado</h2><p>Ele pode ter sido excluído em outro aparelho.</p><a class="btn" href="#/caixa">Ver caixa</a></div>';
    d.itensCompra = d.itensCompra || [];
    const deCompras = !!(q && (q.get('compra') || q.get('de') === 'compras'));
    S.editor = { tipo: 'lancamento', idRota: id, nova: id === 'novo', d: d, sujo: false, compra: deCompras, voltar: deCompras ? '#/compras?v=feitas' : '#/caixa' };
  }
  return htmlEditorLancamento();
}
export function totalLancamento(l) {
  if (l.tipo === 'saida' && l.itensCompra.length) return C.round2(l.itensCompra.reduce((s, it) => s + (C.numOk(it.valor) ? it.valor : 0), 0) + (C.numOk(l.outros) ? l.outros : 0));
  return C.numOk(l.valor) ? l.valor : null;
}
export function htmlEditorLancamento() {
  const e = S.editor, l = e.d, ent = l.tipo === 'entrada';
  const ings = lista('ingredientes').sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  const titulo = e.compra ? (e.nova ? 'Nova compra' : 'Compra') : (e.nova ? (ent ? 'Nova entrada' : 'Nova saída') : (ent ? 'Entrada' : 'Saída'));
  let h = '<div class="cab-pagina"><div class="titulos"><a href="' + e.voltar + '" class="link-btn voltar">' + I.voltar + (e.compra ? 'Compras feitas' : 'Caixa') + '</a><h1>' + titulo + '</h1>' +
    (e.compra && e.nova ? '<p class="sub">Marque os ingredientes comprados: o preço e o histórico de cada um se atualizam, e a compra entra no Caixa como saída.</p>' : '') + '</div></div>';
  h += '<div class="form-lanc">';
  h += '<section class="bloco">' + (e.nova && !l.itensCompra.length ? '<div class="seg" role="group" aria-label="Tipo"><button type="button" data-acao="lanc-tipo" data-v="entrada" aria-pressed="' + ent + '">Entrada</button><button type="button" data-acao="lanc-tipo" data-v="saida" aria-pressed="' + !ent + '">Saída</button></div>' : '') +
    '<div class="grade" style="margin-top:14px"><label class="campo"><span>Data</span><input class="entrada" type="date" data-c="data" value="' + esc(l.data) + '"></label>' +
    '<label class="campo"><span>' + (ent ? 'Origem' : 'Categoria') + '</span><input class="entrada" data-c="categoria" list="dl-fontes" value="' + esc(l.categoria) + '" placeholder="' + (ent ? 'Ex.: Venda de balcão' : 'Ex.: Embalagens') + '" autocomplete="off"><datalist id="dl-fontes">' + fontesConhecidas(l.tipo).map(f => '<option value="' + esc(f) + '">').join('') + '</datalist><small>Escolha da lista ou escreva uma nova.</small></label>' +
    '<label class="campo"><span>Descrição</span><input class="entrada" data-c="descricao" value="' + esc(l.descricao) + '" placeholder="' + (ent ? 'Ex.: 20 brigadeiros no balcão' : 'Ex.: Compra no atacado') + '"></label>' +
    '<label class="campo"><span>Forma de pagamento</span><select class="entrada" data-c="forma">' + Object.keys(C.FORMAS_LANCAMENTO).map(k => '<option value="' + k + '"' + (l.forma === k ? ' selected' : '') + '>' + C.FORMAS_LANCAMENTO[k] + '</option>').join('') + '</select></label></div></section>';

  if (!ent) {
    h += '<section class="bloco"><h2>Ingredientes comprados</h2><p class="explica">Opcional. Cada ingrediente marcado aqui tem o preço e o histórico atualizados na biblioteca, na data desta compra, e as receitas são recalculadas.</p><div class="linhas-edit">' +
      l.itensCompra.map(function (it, i) {
        const ing = S.dados.ingredientes[it.ingredienteId];
        return '<div class="linha-edit linha-compra">' +
          '<label class="campo nome-av"><span>Ingrediente</span><select class="entrada" data-c="itensCompra.' + i + '.ingredienteId"><option value="">Escolha…</option><option value="__novo__">+ Cadastrar ingrediente novo…</option>' + ings.map(x => '<option value="' + esc(x.id) + '"' + (x.id === it.ingredienteId ? ' selected' : '') + '>' + esc(x.nome) + '</option>').join('') + (ing && ing.excluidoEm ? '<option value="' + esc(ing.id) + '" selected>' + esc(ing.nome) + ' (excluído)</option>' : '') + '</select></label>' +
          '<label class="campo"><span>Embalagens</span><input class="entrada num" data-c="itensCompra.' + i + '.embalagens" data-n inputmode="decimal" value="' + inNum(it.embalagens) + '"></label>' +
          '<div class="campo"><span>Tamanho de cada</span><div class="qtd" style="display:flex;gap:6px"><input class="entrada num" data-c="itensCompra.' + i + '.qtdEmbalagem" data-n inputmode="decimal" value="' + inNum(it.qtdEmbalagem) + '" aria-label="Tamanho da embalagem"><select class="entrada" data-c="itensCompra.' + i + '.unidade" style="flex:0 0 78px" aria-label="Unidade">' + opcoesUn(ing ? ing.unidade : null, it.unidade) + '</select></div></div>' +
          (modoEstoque() === 'completo' ? '<label class="campo"><span>Validade</span><input class="entrada" type="date" data-c="itensCompra.' + i + '.validade" value="' + esc(it.validade || '') + '"></label>' : '') +
          '<label class="campo"><span>Valor pago no item</span><span class="com-prefixo"><i>R$</i><input class="entrada num" data-c="itensCompra.' + i + '.valor" data-n inputmode="decimal" value="' + inNum(it.valor) + '"></span></label>' +
          '<p class="info-compra" data-compra-info="' + i + '"></p>' +
          '<button type="button" class="btn-icone" data-acao="rem-compra" data-i="' + i + '" aria-label="Remover ingrediente da compra">' + I.lixo + '</button></div>';
      }).join('') + '</div><button type="button" class="btn sec" style="margin-top:12px" data-acao="add-compra">' + I.mais + 'Adicionar ingrediente comprado</button>' +
      (l.itensCompra.length ? '<div class="grade" style="margin-top:14px"><label class="campo"><span>Outros itens da mesma compra</span><span class="com-prefixo"><i>R$</i><input class="entrada num" data-c="outros" data-n inputmode="decimal" value="' + inNum(l.outros) + '" placeholder="0,00"></span><small>O que não está na biblioteca: guardanapos, produtos de limpeza…</small></label></div>' : '') + '</section>';
  }
  h += '<section class="bloco"><h2>Valor</h2>' + (!ent && l.itensCompra.length
    ? '<p class="total-lanc" id="total-lanc"></p><small class="mudo">Soma dos ingredientes e dos outros itens.</small>'
    : '<label class="campo"><span class="sr">Valor</span><span class="com-prefixo" style="max-width:260px"><i>R$</i><input class="entrada num" data-c="valor" data-n inputmode="decimal" value="' + inNum(l.valor) + '" placeholder="0,00"></span></label>') +
    '<label class="campo" style="margin-top:14px"><span>Observações</span><textarea class="entrada" data-c="obs" placeholder="Opcional">' + esc(l.obs || '') + '</textarea></label></section>';
  h += '<div class="barra-salvar"><span class="estado" id="estado-lanc"></span>' +
    (!e.nova ? '<button type="button" class="btn perigo fino" data-acao="excluir-lanc" aria-label="Excluir lançamento" title="Excluir lançamento">' + I.lixo + '<span>Excluir</span></button>' : '') +
    '<button type="button" class="btn" data-acao="salvar-lanc">Salvar ' + (e.compra ? 'compra' : ent ? 'entrada' : 'saída') + '</button></div></div>';
  return h;
}
export function montarEditorLancamento() {
  const cont = $('.form-lanc'); if (!cont) return;
  cont.addEventListener('input', aoEditarLanc); cont.addEventListener('change', aoEditarLanc);
  recalcLanc();
}
export function aoEditarLanc(ev) {
  const el = ev.target, e = S.editor; if (!e || e.tipo !== 'lancamento') return;
  const cam = el.dataset.c; if (!cam) return;
  const porChange = el.tagName === 'SELECT' || el.type === 'date';
  if (porChange ? ev.type !== 'change' : ev.type !== 'input') return;
  gravarCaminho(e.d, cam, el.hasAttribute('data-n') ? C.lerNum(el.value) : el.value);
  marcarSujo();
  const m = cam.match(/^itensCompra\.(\d+)\.ingredienteId$/);
  if (m && el.value === '__novo__') {
    const idx = +m[1], it = e.d.itensCompra[idx];
    it.ingredienteId = ''; render(false);
    folhaIngrediente(null, function (ing) {
      const ed = S.editor; if (!ed || ed.tipo !== 'lancamento') return;
      const alvo = ed.d.itensCompra[idx]; if (!alvo) return;
      alvo.ingredienteId = ing.id; alvo.qtdEmbalagem = ing.qtdEmbalagem; alvo.unidade = C.normUn(ing.unidade);
      marcarSujo(); render(false);
      setTimeout(() => { const v = $('[data-c="itensCompra.' + idx + '.valor"]'); if (v) v.focus(); }, 50);
    });
    return;
  }
  if (m) {
    const it = e.d.itensCompra[+m[1]], ing = S.dados.ingredientes[it.ingredienteId];
    if (ing) { it.qtdEmbalagem = ing.qtdEmbalagem; it.unidade = C.normUn(ing.unidade); }
    render(false); return;
  }
  recalcLanc();
}
export function recalcLanc() {
  const e = S.editor; if (!e || e.tipo !== 'lancamento') return;
  const l = e.d;
  l.itensCompra.forEach(function (it, i) {
    const el = $('[data-compra-info="' + i + '"]'); if (!el) return;
    const ing = S.dados.ingredientes[it.ingredienteId];
    if (!ing) { el.textContent = ''; return; }
    const r = C.aplicarCompra(ing, it, l.data || hoje(), l.id + ':' + it.id);
    if (!r) { el.className = 'info-compra'; el.textContent = 'Preencha embalagens, tamanho e valor para ver o preço.'; return; }
    const novo = C.custoIngrediente(r.ing), emb = it.valor / it.embalagens;
    el.className = 'info-compra' + (r.variacao > 0.004 ? ' neg-txt' : r.variacao < -0.004 ? ' pos-txt' : '');
    el.textContent = C.brl(emb) + ' por ' + C.num(it.qtdEmbalagem) + ' ' + rotUn(it.unidade) + ' (' + C.brl(novo.porBase, 4) + '/' + novo.base + ')' +
      (r.precoAtualMudou ? (C.numOk(r.variacao) && Math.abs(r.variacao) >= 0.005 ? '. Antes: ' + porBaseTxt(ing) + ' (' + (r.variacao > 0 ? 'subiu ' : 'caiu ') + C.pct(Math.abs(r.variacao)) + ')' : '. Mesmo preço de antes.') : '. Há uma compra mais recente; o preço atual não muda.');
  });
  const tot = totalLancamento(l);
  const t = $('#total-lanc'); if (t) t.textContent = C.brl(tot || 0);
  const est = $('#estado-lanc');
  if (est) est.innerHTML = '<b style="color:var(--ink)">' + (C.numOk(tot) ? (l.tipo === 'entrada' ? '+ ' : '− ') + C.brl(tot) : 'Sem valor') + '</b><br>' + (e.sujo ? 'Alterações não salvas' : (e.nova ? (e.compra ? 'Nova compra' : 'Novo lançamento') : 'Tudo salvo'));
}
export function validarLancamento(l) {
  if (!l.data) return 'Informe a data.';
  if (l.tipo === 'saida' && l.itensCompra.length) {
    for (const it of l.itensCompra) {
      const ing = S.dados.ingredientes[it.ingredienteId];
      if (!ing) return 'Escolha o ingrediente em todas as linhas da compra.';
      if (!(it.embalagens > 0)) return ing.nome + ': informe quantas embalagens.';
      if (!(it.qtdEmbalagem > 0)) return ing.nome + ': informe o tamanho da embalagem.';
      if (!(C.numOk(it.valor) && it.valor >= 0)) return ing.nome + ': informe o valor pago.';
      if (!C.mesmaFamilia(it.unidade, ing.unidade)) return ing.nome + ': a unidade não combina com a do ingrediente.';
    }
    const ids = l.itensCompra.map(it => it.ingredienteId);
    if (new Set(ids).size !== ids.length) return 'O mesmo ingrediente aparece duas vezes. Junte numa linha só.';
  }
  const tot = totalLancamento(l);
  if (!(tot > 0)) return 'Informe um valor maior que zero.';
  return null;
}
export function salvarLancamento() {
  const e = S.editor, l = e.d;
  const erro = validarLancamento(l);
  if (erro) { toast(erro); return false; }
  if (l.tipo === 'entrada') { l.itensCompra = []; l.outros = null; }
  l.valor = totalLancamento(l);
  l.categoria = fonteCanonica(l.categoria, l.tipo) || (l.tipo === 'saida' ? (l.itensCompra.length ? 'Ingredientes' : 'Outras saídas') : 'Outras entradas');
  l.descricao = String(l.descricao || '').trim() || l.categoria;
  // Preços dos ingredientes: tira os pontos de itens removidos, aplica os atuais
  const orig = S.dados.lancamentos[l.id];
  const trabalho = {}, mudancas = [];
  const pegar = id => trabalho[id] || S.dados.ingredientes[id];
  const chavesNovas = new Set(l.itensCompra.map(it => l.id + ':' + it.id));
  ((orig && orig.itensCompra) || []).forEach(function (it) {
    const ch = l.id + ':' + it.id, novoIt = l.itensCompra.find(x => x.id === it.id);
    if (!chavesNovas.has(ch) || (novoIt && novoIt.ingredienteId !== it.ingredienteId)) {
      const ing = pegar(it.ingredienteId); if (!ing) return;
      const r = C.removerCompra(ing, ch); if (r) trabalho[ing.id] = r;
    }
  });
  l.itensCompra.forEach(function (it) {
    const ing = pegar(it.ingredienteId);
    const r = C.aplicarCompra(ing, it, l.data, l.id + ':' + it.id);
    trabalho[ing.id] = r.ing;
    if (r.precoAtualMudou && C.numOk(r.variacao) && Math.abs(r.variacao) >= 0.005) mudancas.push(ing.nome + ' (' + (r.variacao > 0 ? '+' : '−') + C.pct(Math.abs(r.variacao)) + ')');
  });
  Object.values(trabalho).forEach(ing => gravarRegistro('ingredientes', ing));
  gravarRegistro('lancamentos', clone(l));
  aplicarEstoqueCompra(l);
  const eraNovo = e.nova, destino = e.voltar || '#/caixa', eraCompra = e.compra;
  S.editor = null;
  let msg = eraCompra ? (eraNovo ? 'Compra registrada.' : 'Compra salva.') : (l.tipo === 'entrada' ? 'Entrada ' : 'Saída ') + (eraNovo ? 'registrada.' : 'salva.');
  if (mudancas.length) msg += ' Preço atualizado: ' + mudancas.join(', ') + '.';
  const alerta = (cfg().margemAlerta || 0) / 100, ctx = ctxCalc();
  const ruins = new Set();
  Object.keys(trabalho).forEach(id => receitasAfetadas(id).forEach(r => { if ((C.calcularReceita(r, ctx).variacoes || []).some(v => v.prejuizo || (C.numOk(v.margemReal) && v.margemReal < alerta))) ruins.add(r.id); }));
  if (ruins.size) toast(msg + ' ' + (ruins.size === 1 ? '1 receita ficou' : ruins.size + ' receitas ficaram') + ' com margem abaixo do mínimo.', 'Ver', () => ir('#/inicio'));
  else toast(msg);
  ir(destino);
  return true;
}

// Ações dos botões desta parte (data-acao="...")
export const ACOES_LANCAMENTO = {
  'salvar-lanc': async function () {
    const l = S.editor && S.editor.d; if (!l) return;
    if (validarLancamento(l)) { salvarLancamento(); return; } // mostra o erro de validação
    if (!(await conferirRetiradaNoLancamento(l))) return;
    salvarLancamento();
  },
  'excluir-lanc': async function () {
    const l = S.editor.d, orig = S.dados.lancamentos[l.id];
    const temCompra = orig && (orig.itensCompra || []).length;
    if (!await confirmar('Excluir lançamento?', 'Excluir <b>' + esc(orig ? orig.descricao : '') + '</b> de ' + C.brl(orig ? orig.valor : 0) + '.' + (temCompra ? ' Os ingredientes desta compra voltam ao preço anterior.' : ''), 'Excluir', true)) return;
    (orig.itensCompra || []).forEach(function (it) {
      const ing = S.dados.ingredientes[it.ingredienteId]; if (!ing) return;
      const r = C.removerCompra(ing, orig.id + ':' + it.id); if (r) gravarRegistro('ingredientes', r);
    });
    aplicarEstoqueCompra(orig, true); removerMovsRef('venda:' + orig.id);
    const destino = (S.editor && S.editor.voltar) || '#/caixa';
    excluirRegistro('lancamentos', orig.id); S.editor = null; ir(destino); toast('Lançamento excluído.' + (orig.vitrine ? ' A quantidade volta para a vitrine.' : ''));
  }
};
