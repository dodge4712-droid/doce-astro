// Tela Receitas → Ingredientes: biblioteca, cadastro, histórico de preço e conversão em receita.
import * as C from '../motor/index.js';
import { S, cfg, ctxCalc, lista } from '../nucleo/estado.js';
import { I } from '../nucleo/icones.js';
import { abas, abrirFolha, confirmar, toast } from '../nucleo/interface.js';
import { excluirRegistro, gravarRegistro } from '../nucleo/registros.js';
import { ir, render } from '../nucleo/rotas.js';
import { $, $$, agoraISO, clone, dataBR, esc, inNum, normBusca, porBaseTxt, rotUn, uid } from '../nucleo/util.js';
import { ABAS_REC, novaReceitaBase } from './receitas.js';

export function pendenteConversao(ing) { return /pendente:\s*converter em receita/i.test(ing.obs || ''); }
// ================= Ingredientes =================
export function usosDoIngrediente(id) {
  return lista('receitas').filter(r => (r.itens || []).some(it => it.tipo !== 'rec' && it.refId === id));
}
export function telaIngredientes() {
  const ings = lista('ingredientes').sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  let h = '<div class="cab-pagina"><div class="titulos"><h1>Ingredientes</h1><p class="sub">Cadastre uma vez e use em todas as receitas. Quando o preço muda, as receitas se atualizam.</p></div>' +
    '<div class="acoes"><button type="button" class="btn" data-acao="novo-ing">' + I.mais + 'Novo ingrediente</button></div></div>' + abas(ABAS_REC, '#/ingredientes');
  if (!ings.length) {
    return h + '<div class="bloco vazio">' + I.emblema + '<h2>Nenhum ingrediente ainda</h2><p>' + (S.meta.modo === 'planilha' ? 'Comece pelo que você mais compra: leite condensado, chocolate, creme de leite.' : 'Importe o arquivo ingredientes-iniciais.json, que veio no pacote, para testar com a sua lista de 30 ingredientes. Ou cadastre um por um.') + '</p><div class="acoes" style="justify-content:center">' + (S.meta.modo !== 'planilha' ? '<label class="btn" style="cursor:pointer">' + I.enviar + 'Importar lista<input type="file" accept="application/json,.json" id="importar" hidden></label>' : '') + '<button type="button" class="btn' + (S.meta.modo !== 'planilha' ? ' sec' : '') + '" data-acao="novo-ing">' + I.mais + 'Cadastrar ingrediente</button></div></div>';
  }
  h += '<div class="linha-campos" style="margin-bottom:14px"><label class="busca"><span class="sr">Buscar ingrediente</span>' + I.busca + '<input class="entrada" id="busca-ing" type="search" placeholder="Buscar ingrediente"></label></div>';
  h += '<div class="lista" id="lista-ing">' + ings.map(function (i) {
    const v = C.variacaoPreco(i, 90);
    const usos = usosDoIngrediente(i.id).length;
    let chips = '';
    if (pendenteConversao(i)) chips += '<span class="chip alerta">' + I.receitaDentro + 'converter em receita</span>';
    else if (i.obs) chips += '<span class="chip alerta">' + I.alerta + esc(i.obs) + '</span>';
    if (v && Math.abs(v.variacao) >= 0.01) chips += '<span class="chip ' + (v.variacao > 0 ? 'neg' : 'pos') + '">' + (v.variacao > 0 ? I.sobe + 'subiu ' : I.desce + 'caiu ') + C.pct(Math.abs(v.variacao)) + ' em 90 dias</span>';
    if (!C.custoIngrediente(i)) chips += '<span class="chip neg">' + I.alerta + 'sem preço ou embalagem</span>';
    return '<button type="button" class="item" data-acao="editar-ing" data-id="' + esc(i.id) + '" data-busca="' + esc(normBusca(i.nome + ' ' + (i.marca || ''))) + '">' +
      '<div class="principal"><div class="nome">' + esc(i.nome) + '</div><div class="det">' + C.num(i.qtdEmbalagem) + ' ' + rotUn(i.unidade) + ' por ' + C.brl(i.valorPago) + (usos ? ', usado em ' + usos + (usos === 1 ? ' receita' : ' receitas') : '') + '</div></div>' +
      '<div class="valor">' + porBaseTxt(i) + '</div><div class="chips">' + chips + '</div></button>';
  }).join('') + '</div><p class="mudo" id="sem-res-ing" hidden style="padding:16px">Nenhum ingrediente com esse nome. <button type="button" class="link-btn" data-acao="novo-ing">Cadastrar novo</button></p>';
  return h;
}
export function montarFiltroIngredientes() {
  const b = $('#busca-ing'); if (!b) return;
  b.addEventListener('input', function () {
    const q = normBusca(b.value); let n = 0;
    $$('#lista-ing .item').forEach(el => { const v = !q || el.dataset.busca.includes(q); el.hidden = !v; if (v) n++; });
    $('#sem-res-ing').hidden = n > 0;
  });
}
export function folhaIngrediente(id, aoSalvar) {
  const orig = id ? S.dados.ingredientes[id] : null;
  const ing = orig ? clone(orig) : { id: uid(), nome: '', marca: '', unidade: 'g', qtdEmbalagem: null, valorPago: null, fornecedor: '', obs: '', historico: [] };
  const unis = Object.keys(C.UNIDADES).map(u => '<option value="' + u + '"' + (C.normUn(ing.unidade) === u ? ' selected' : '') + '>' + C.UNIDADES[u].rotulo + '</option>').join('');
  const usos = orig ? usosDoIngrediente(orig.id) : [];
  const hist = (ing.historico || []).slice().reverse().slice(0, 6);
  const corpo = '<form id="f-ing" class="corpo-form" style="display:flex;flex-direction:column;gap:12px">' +
    (pendenteConversao(ing) ? '<div class="aviso">' + I.receitaDentro + '<div class="txt">Este item é uma receita sua. Convertendo, o custo passa a se atualizar sozinho quando os ingredientes mudam de preço.<br><button type="button" class="link-btn" data-conv>Converter em receita</button></div></div>' : '') +
    '<label class="campo"><span>Nome</span><input class="entrada" name="nome" required value="' + esc(ing.nome) + '" placeholder="Ex.: Leite condensado"></label>' +
    '<div class="linha-campos"><label class="campo"><span>Unidade de compra</span><select class="entrada" name="unidade">' + unis + '</select></label>' +
    '<label class="campo"><span>Quantidade na embalagem</span><input class="entrada num" name="qtdEmbalagem" inputmode="decimal" required value="' + inNum(ing.qtdEmbalagem) + '" placeholder="395"></label></div>' +
    '<label class="campo"><span>Valor pago</span><span class="com-prefixo"><i>R$</i><input class="entrada num" name="valorPago" inputmode="decimal" required value="' + inNum(ing.valorPago) + '" placeholder="0,00"></span></label>' +
    '<p class="mudo" id="custo-ing" role="status"></p>' +
    '<div class="linha-campos"><label class="campo"><span>Marca</span><input class="entrada" name="marca" value="' + esc(ing.marca) + '"></label>' +
    '<label class="campo"><span>Fornecedor</span><input class="entrada" name="fornecedor" value="' + esc(ing.fornecedor) + '"></label></div>' +
    '<label class="campo"><span>Observação</span><input class="entrada" name="obs" value="' + esc(ing.obs) + '"></label>' +
    (hist.length > 1 ? '<div><h3>Histórico de preço</h3>' + sparkline(ing.historico) + '<ul class="historico">' + hist.map(x => '<li><span>' + dataBR(x.data) + (x.compra ? ' <span class="chip mudo">compra</span>' : '') + '</span><span>' + C.num(x.qtdEmbalagem) + ' ' + rotUn(x.unidade) + ' por ' + C.brl(x.valorPago) + '</span></li>').join('') + '</ul></div>' : '') +
    (usos.length ? '<p class="mudo">Usado em: ' + usos.map(r => esc(r.nome)).join(', ') + '</p>' : '') +
    '<div class="rodape-folha">' + (orig ? '<button type="button" class="btn perigo" data-excluir>' + I.lixo + 'Excluir</button>' : '') + '<span style="flex:1"></span><button type="button" class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit">Salvar ingrediente</button></div></form>';
  abrirFolha(orig ? 'Editar ingrediente' : 'Novo ingrediente', corpo, function (d) {
    const f = $('#f-ing', d);
    function mostrarCusto() {
      const t = { unidade: f.unidade.value, qtdEmbalagem: C.lerNum(f.qtdEmbalagem.value), valorPago: C.lerNum(f.valorPago.value) };
      const c = C.custoIngrediente(t);
      $('#custo-ing', d).textContent = c ? 'Custo: ' + C.brl(c.porBase, 4) + ' por ' + c.base : 'Preencha quantidade e valor para ver o custo por unidade.';
    }
    f.addEventListener('input', mostrarCusto); mostrarCusto();
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      const q = C.lerNum(f.qtdEmbalagem.value), v = C.lerNum(f.valorPago.value);
      if (!f.nome.value.trim()) { f.nome.focus(); return; }
      if (!(q > 0)) { toast('A quantidade na embalagem precisa ser maior que zero.'); f.qtdEmbalagem.focus(); return; }
      if (!(v >= 0)) { toast('Informe o valor pago.'); f.valorPago.focus(); return; }
      const novo = Object.assign(ing, { nome: f.nome.value.trim(), unidade: f.unidade.value, qtdEmbalagem: q, valorPago: v, marca: f.marca.value.trim(), fornecedor: f.fornecedor.value.trim(), obs: f.obs.value.trim() });
      const mudouPreco = !orig || orig.valorPago !== v || orig.qtdEmbalagem !== q || C.normUn(orig.unidade) !== C.normUn(novo.unidade);
      if (orig && C.UNIDADES[C.normUn(orig.unidade)].familia !== C.UNIDADES[novo.unidade].familia && usos.length) {
        toast('Não dá para trocar de ' + C.UNIDADES[C.normUn(orig.unidade)].familia + ' para ' + C.UNIDADES[novo.unidade].familia + ': o ingrediente já é usado em receitas.');
        return;
      }
      if (mudouPreco) {
        const c = C.custoIngrediente(novo);
        novo.historico = (novo.historico || []).concat([{ data: agoraISO(), valorPago: v, qtdEmbalagem: q, unidade: novo.unidade, porBase: c ? c.porBase : null }]);
      }
      gravarRegistro('ingredientes', novo);
      d.close();
      if (orig && mudouPreco) avisarRecalculo(novo.id);
      else toast(orig ? 'Ingrediente salvo.' : 'Ingrediente cadastrado.');
      if (aoSalvar) aoSalvar(novo); else render(false);
    });
    const ex = $('[data-excluir]', d);
    if (ex) ex.onclick = async function () {
      if (usos.length) { toast('Este ingrediente está em ' + usos.length + (usos.length === 1 ? ' receita' : ' receitas') + '. Tire-o das receitas antes de excluir.'); return; }
      d.close();
      if (await confirmar('Excluir ingrediente?', 'Excluir <b>' + esc(orig.nome) + '</b> da biblioteca.', 'Excluir', true)) {
        excluirRegistro('ingredientes', orig.id); toast('Ingrediente excluído.'); render(false);
      }
    };
    const cv = $('[data-conv]', d);
    if (cv) cv.onclick = function () { d.close(); converterEmReceita(orig); };
  });
}
export function sparkline(hist) {
  const pts = (hist || []).filter(x => C.numOk(x.porBase));
  if (pts.length < 2) return '';
  const vals = pts.map(x => x.porBase), mn = Math.min(...vals), mx = Math.max(...vals), amp = mx - mn || 1;
  const w = 300, hgt = 48;
  const d = pts.map((x, i) => (i ? 'L' : 'M') + (i / (pts.length - 1) * (w - 8) + 4).toFixed(1) + ' ' + (hgt - 6 - (x.porBase - mn) / amp * (hgt - 12)).toFixed(1)).join(' ');
  return '<svg class="spark" viewBox="0 0 ' + w + ' ' + hgt + '" preserveAspectRatio="none" role="img" aria-label="Evolução do preço"><path d="' + d + '" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>';
}
export function receitasAfetadas(ingId) {
  const diretas = new Set(usosDoIngrediente(ingId).map(r => r.id));
  diretas.forEach(id => C.receitasQueDependemDe(id, S.dados.receitas).forEach(x => diretas.add(x)));
  return Array.from(diretas).map(id => S.dados.receitas[id]).filter(r => r && !r.excluidoEm);
}
export function avisarRecalculo(ingId) {
  const afet = receitasAfetadas(ingId);
  if (!afet.length) { toast('Preço atualizado.'); return; }
  const ctx = ctxCalc(); const alerta = (cfg().margemAlerta || 0) / 100;
  const ruins = afet.filter(r => (C.calcularReceita(r, ctx).variacoes || []).some(v => v.prejuizo || (C.numOk(v.margemReal) && v.margemReal < alerta)));
  const base = 'Preço atualizado. ' + (afet.length === 1 ? '1 receita recalculada' : afet.length + ' receitas recalculadas');
  if (ruins.length) toast(base + '; ' + ruins.length + ' ficou com margem abaixo do mínimo.', 'Ver', () => ir('#/inicio'));
  else toast(base + '.');
}
export function converterEmReceita(ing) {
  const corpo = '<p>Vai ser criada a receita <b>' + esc(ing.nome) + '</b>, e ela substitui o ingrediente nas receitas que o usam. Nessas receitas, ela deve entrar:</p>' +
    '<button type="button" class="opcao-grande" data-modo="custo"><b>Pelo custo</b><span>Só o que custa produzir. O lucro fica todo no produto final.</span></button>' +
    '<button type="button" class="opcao-grande" data-modo="preco"><b>Pelo preço de venda</b><span>Com o lucro desta receita embutido, como se você comprasse de si mesma.</span></button>';
  abrirFolha('Converter em receita', corpo, function (d) {
    $$('[data-modo]', d).forEach(b => b.onclick = function () {
      const modo = b.dataset.modo;
      const rec = novaReceitaBase(); rec.nome = ing.nome; rec.rendimento = { qtd: null, unidade: 'un' };
      gravarRegistro('receitas', rec);
      const unidadeFamilia = C.UNIDADES[C.normUn(ing.unidade)].familia;
      lista('receitas').forEach(function (r) {
        let mudou = false;
        const c = clone(r);
        (c.itens || []).forEach(function (it) {
          if (it.tipo !== 'rec' && it.refId === ing.id) {
            it.tipo = 'rec'; it.refId = rec.id; it.modo = modo;
            if (unidadeFamilia !== 'unidade') { it.unidade = 'un'; }
            mudou = true;
          }
        });
        if (mudou) gravarRegistro('receitas', c);
      });
      const ingC = clone(ing); ingC.excluidoEm = agoraISO(); gravarRegistro('ingredientes', ingC);
      d.close();
      toast('Receita criada. Preencha ingredientes e rendimento para o custo aparecer.');
      ir('#/receita/' + encodeURIComponent(rec.id));
    });
  });
}

// Ações dos botões desta parte (data-acao="...")
export const ACOES_INGREDIENTES = {
  'novo-ing': function () { folhaIngrediente(null); },
  'editar-ing': function (el) { folhaIngrediente(el.dataset.id); }
};
