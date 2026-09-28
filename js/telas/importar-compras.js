// Importar compras de CSV: modelo, conferência e gravação.
import * as C from '../motor/index.js';
import { salvarLocal } from '../nucleo/armazenamento.js';
import { S, lista } from '../nucleo/estado.js';
import { I } from '../nucleo/icones.js';
import { toast } from '../nucleo/interface.js';
import { gravarRegistro } from '../nucleo/registros.js';
import { ir, render } from '../nucleo/rotas.js';
import { dataCurta, esc, hoje, rotUn, uid } from '../nucleo/util.js';
import { fonteCanonica, formaTxt } from '../servicos/caixa.js';
import { aplicarEstoqueCompra } from '../servicos/estoque.js';

// ================= Importar compras de um arquivo CSV =================
export function jaImportada(g) { const l = S.dados.lancamentos[g.id]; return !!(l && !l.excluidoEm); }
export function blocoImportarCompras() {
  return '<section class="bloco barra-import"><div class="txt-import"><b>Muitas compras de uma vez?</b><small>Baixe o modelo, preencha no Excel ou no Google Planilhas e importe aqui.</small></div>' +
    '<div class="acoes"><button type="button" class="btn sec fino" data-acao="modelo-compras">' + I.baixar + 'Baixar modelo</button><label class="btn fino" style="cursor:pointer">' + I.enviar + 'Importar compras<input type="file" accept=".csv,text/csv,text/plain" id="arq-compras" hidden></label></div></section>';
}
export async function lerArquivoTexto(arq) {
  const buf = await arq.arrayBuffer();
  try { return new TextDecoder('utf-8', { fatal: true }).decode(buf); }
  catch (e) { return new TextDecoder('windows-1252').decode(buf); } // CSV salvo pelo Excel em português
}
export function telaImportarCompras() {
  const im = S.importacao;
  let h = '<div class="cab-pagina"><div class="titulos"><a href="#/compras?v=feitas" class="link-btn voltar">' + I.voltar + 'Compras feitas</a><h1>Importar compras</h1>' + (im ? '<p class="sub">' + esc(im.nome) + '</p>' : '') + '</div></div>';
  if (!im) return h + '<div class="bloco vazio">' + I.emblema + '<h2>Nenhum arquivo aberto</h2><p>Volte para Compras feitas e escolha o arquivo.</p><a class="btn" href="#/compras?v=feitas">Ir para Compras feitas</a></div>';
  const res = C.interpretarCompras(im.csv, S.dados.ingredientes, im.padroes, im.resolucoes);
  if (res.semCabecalho) return h + '<div class="aviso neg">' + I.alerta + '<div class="txt">Não encontrei as colunas de ingrediente e valor neste arquivo. Use o modelo: ele já vem com as colunas certas.<br><button type="button" class="link-btn" data-acao="modelo-compras">Baixar modelo</button></div></div>';
  const novas = res.grupos.filter(g => g.ok && !jaImportada(g)), ja = res.grupos.filter(g => g.ok && jaImportada(g)), erradas = res.grupos.filter(g => !g.ok);
  const total = novas.reduce((s, g) => s + g.total, 0), nItens = novas.reduce((s, g) => s + g.itens.length, 0);
  h += '<div class="stats stats-cx"><div class="stat"><div class="r">Compras a importar</div><div class="n">' + novas.length + '</div></div><div class="stat"><div class="r">Total</div><div class="n">' + C.brl(total) + '</div></div><div class="stat"><div class="r">Ingredientes com preço atualizado</div><div class="n">' + nItens + '</div></div></div>';
  const info = [];
  if (res.ignoradas) info.push(res.ignoradas + (res.ignoradas === 1 ? ' linha sem quantidade e valor foi ignorada' : ' linhas sem quantidade e valor foram ignoradas') + ' (normal no modelo).');
  if (res.exemplos) info.push('A linha de exemplo foi ignorada.');
  if (ja.length) info.push(ja.length + (ja.length === 1 ? ' compra já tinha sido importada e não entra de novo.' : ' compras já tinham sido importadas e não entram de novo.'));
  if (info.length) h += '<p class="mudo" style="margin:-4px 0 14px">' + info.map(esc).join(' ') + '</p>';
  h += '<section class="bloco"><h2>Para células em branco</h2><p class="explica">Valem só para linhas sem data, sem local ou sem forma de pagamento. Preencher no arquivo evita importar em dobro depois.</p><div class="grade">' +
    '<label class="campo"><span>Data</span><input class="entrada" type="date" data-imp="data" value="' + esc(im.padroes.data) + '"></label>' +
    '<label class="campo"><span>Local ou descrição</span><input class="entrada" data-imp="descricao" value="' + esc(im.padroes.descricao) + '" placeholder="Compra importada"></label>' +
    '<label class="campo"><span>Forma de pagamento</span><select class="entrada" data-imp="forma">' + Object.keys(C.FORMAS_LANCAMENTO).map(k => '<option value="' + k + '"' + (im.padroes.forma === k ? ' selected' : '') + '>' + C.FORMAS_LANCAMENTO[k] + '</option>').join('') + '</select></label></div></section>';
  if (res.naoEncontrados.length) {
    const ings = lista('ingredientes').sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    h += '<section class="bloco"><h2>Fora da biblioteca</h2><p class="explica">Estes nomes não batem com nenhum ingrediente. Escolha o que fazer com cada um.</p><div class="lista-contagem">' +
      res.naoEncontrados.map(function (x) {
        const dec = im.resolucoes[x.chave] || 'novo';
        const compat = ings.filter(i => !x.unidade || C.mesmaFamilia(i.unidade, x.unidade));
        return '<div class="linha-contagem"><div class="principal"><b>' + esc(x.nome) + '</b><small>' + (x.linhas.length === 1 ? 'linha ' : 'linhas ') + x.linhas.join(', ') + '</small></div>' +
          '<select class="entrada" data-imp-res="' + esc(x.chave) + '" aria-label="O que fazer com ' + esc(x.nome) + '"><option value="novo"' + (dec === 'novo' ? ' selected' : '') + '>Criar ingrediente novo</option><option value="outro"' + (dec === 'outro' ? ' selected' : '') + '>Contar como outro item</option>' +
          (compat.length ? '<optgroup label="É o mesmo que…">' + compat.map(i => '<option value="' + esc(i.id) + '"' + (dec === i.id ? ' selected' : '') + '>' + esc(i.nome) + '</option>').join('') + '</optgroup>' : '') + '</select></div>';
      }).join('') + '</div><p class="mudo" style="margin-top:8px">"Contar como outro item" entra no valor da compra, mas não cria ingrediente nem atualiza preço.</p></section>';
  }
  if (res.erros.length) {
    h += '<section class="bloco"><div class="aviso neg">' + I.alerta + '<div class="txt"><b>' + (erradas.length === 1 ? '1 compra tem erro e não será importada.' : erradas.length + ' compras têm erro e não serão importadas.') + '</b> Corrija no arquivo e importe de novo; as compras certas deste arquivo não entram em dobro.<ul>' +
      res.erros.slice(0, 30).map(e => '<li>Linha ' + e.linha + ': ' + esc(e.msg) + '</li>').join('') + (res.erros.length > 30 ? '<li>e mais ' + (res.erros.length - 30) + '</li>' : '') + '</ul></div></div></section>';
  }
  if (res.grupos.length) {
    const trabalho = {};
    h += '<section class="bloco"><h2>Compras no arquivo</h2><div class="lista">' + res.grupos.map(function (g) {
      const st = !g.ok ? '<span class="chip neg">com erro</span>' : jaImportada(g) ? '<span class="chip mudo">já importada</span>' : '<span class="chip pos">' + I.ok + 'vai importar</span>';
      const linhas = g.itens.map(function (it) {
        let prev = '';
        if (g.ok && !jaImportada(g) && it.ingredienteId) {
          const ing = trabalho[it.ingredienteId] || S.dados.ingredientes[it.ingredienteId];
          const r = C.aplicarCompra(ing, it, g.data, 'prev:' + g.id + ':' + it.linha);
          if (r) { trabalho[it.ingredienteId] = r.ing; prev = !r.precoAtualMudou ? 'compra antiga: só entra no histórico' : C.numOk(r.variacao) && Math.abs(r.variacao) >= 0.005 ? (r.variacao > 0 ? 'preço sobe ' : 'preço cai ') + C.pct(Math.abs(r.variacao)) : 'mesmo preço'; }
        }
        return '<li><span>' + esc(it.nome) + (it.novo ? ' <span class="chip alerta">novo</span>' : '') + ' <small class="mudo">' + C.num(it.embalagens) + ' × ' + C.num(it.qtdEmbalagem) + ' ' + rotUn(it.unidade) + (prev ? ', ' + prev : '') + '</small></span><b>' + C.brl(it.valor) + '</b></li>';
      }).join('') + (g.outros > 0 ? '<li><span>Outros itens</span><b>' + C.brl(g.outros) + '</b></li>' : '');
      return '<div class="item compra-imp"><div class="principal"><div class="nome">' + esc(g.descricao) + '</div><div class="det">' + (g.data ? esc(dataCurta(g.data)) : 'sem data') + (g.forma ? ', ' + esc(formaTxt(g.forma)) : '') + '</div></div><div class="valor">' + C.brl(g.total || 0) + '</div><div class="chips">' + st + '</div>' +
        (linhas ? '<ul class="historico" style="width:100%">' + linhas + '</ul>' : '') + '</div>';
    }).join('') + '</div></section>';
  } else h += '<p class="mudo" style="padding:8px 4px 20px">Nenhuma compra preenchida no arquivo.</p>';
  h += '<div class="barra-salvar"><span class="estado">' + (novas.length ? '<b style="color:var(--ink)">' + C.brl(total) + '</b><br>' + novas.length + (novas.length === 1 ? ' compra' : ' compras') : 'Nada para importar') + '</span>' +
    '<button type="button" class="btn sec fino" data-acao="importar-cancelar">Cancelar</button><button type="button" class="btn" data-acao="importar-compras-ok"' + (novas.length ? '' : ' disabled') + '>Importar ' + (novas.length === 1 ? '1 compra' : novas.length + ' compras') + '</button></div>';
  return h;
}
export function executarImportacao() {
  const im = S.importacao; if (!im) return;
  const res = C.interpretarCompras(im.csv, S.dados.ingredientes, im.padroes, im.resolucoes);
  const grupos = res.grupos.filter(g => g.ok && !jaImportada(g));
  if (!grupos.length) { toast('Nada para importar.'); return; }
  // guarda as escolhas "outro item" e "é o mesmo que" para a próxima importação
  S.meta.decisoesImport = S.meta.decisoesImport || {};
  Object.keys(im.resolucoes).forEach(k => { if (im.resolucoes[k] !== 'novo') S.meta.decisoesImport[k] = im.resolucoes[k]; });
  salvarLocal();
  const trabalho = {}, criados = {}, antes = {};
  const pegar = id => trabalho[id] || S.dados.ingredientes[id];
  grupos.forEach(function (g) {
    const l = { id: g.id, tipo: 'saida', data: g.data, valor: g.total, categoria: fonteCanonica('Ingredientes', 'saida'), descricao: g.descricao, forma: g.forma, obs: 'Importado de ' + im.nome, itensCompra: [], outros: g.outros || null, importado: im.nome };
    g.itens.forEach(function (it) {
      let ingId = it.ingredienteId;
      if (!ingId && it.novo) {
        const k = C.semAcento(it.nome);
        if (!criados[k]) {
          const novo = { id: uid(), nome: it.nome, unidade: it.unidade, qtdEmbalagem: it.qtdEmbalagem, valorPago: C.round2(it.valor / it.embalagens), marca: '', fornecedor: '', obs: 'Criado na importação de compras', historico: [] };
          trabalho[novo.id] = novo; criados[k] = novo.id;
        }
        ingId = criados[k];
      }
      if (!ingId) return;
      if (S.dados.ingredientes[ingId] && !(ingId in antes)) antes[ingId] = C.custoIngrediente(S.dados.ingredientes[ingId]);
      const item = { id: uid(), ingredienteId: ingId, embalagens: it.embalagens, qtdEmbalagem: it.qtdEmbalagem, unidade: it.unidade, valor: it.valor, validade: it.validade || '' };
      const r = C.aplicarCompra(pegar(ingId), item, g.data, l.id + ':' + item.id);
      if (r) trabalho[ingId] = r.ing;
      l.itensCompra.push(item);
    });
    gravarRegistro('lancamentos', l);
    aplicarEstoqueCompra(l);
  });
  Object.values(trabalho).forEach(ing => gravarRegistro('ingredientes', ing));
  const mud = Object.keys(antes).map(function (id) {
    const a = antes[id], d = C.custoIngrediente(S.dados.ingredientes[id]);
    return a && d && a.porBase > 0 ? { nome: S.dados.ingredientes[id].nome, v: d.porBase / a.porBase - 1 } : null;
  }).filter(x => x && Math.abs(x.v) >= 0.005).sort((a, b) => Math.abs(b.v) - Math.abs(a.v));
  const nNovos = Object.keys(criados).length;
  const total = grupos.reduce((s, g) => s + g.total, 0);
  S.importacao = null;
  toast((grupos.length === 1 ? '1 compra importada' : grupos.length + ' compras importadas') + ' (' + C.brl(total) + ').' +
    (nNovos ? ' ' + (nNovos === 1 ? '1 ingrediente novo.' : nNovos + ' ingredientes novos.') : '') +
    (mud.length ? ' Preços: ' + mud.slice(0, 3).map(x => x.nome + ' ' + (x.v > 0 ? '+' : '−') + C.pct(Math.abs(x.v))).join(', ') + (mud.length > 3 ? ' e mais ' + (mud.length - 3) : '') + '.' : ''), 'Ver no Caixa', () => ir('#/caixa'), 10000);
  ir('#/compras?v=feitas');
}

// Ações dos botões desta parte (data-acao="...")
export const ACOES_IMPORTAR_COMPRAS = {
  'modelo-compras': function () {
    const blob = new Blob([C.modeloCSVCompras(S.dados.ingredientes, hoje())], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'modelo-compras-doce-astro.csv';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast('Modelo baixado. Preencha as linhas do que comprou; as outras podem ficar em branco.');
  },
  'importar-compras-ok': executarImportacao,
  'importar-cancelar': function () { S.importacao = null; ir('#/compras?v=feitas'); }
};

// Eventos globais desta parte (registrados uma vez, no arranque)
export function eventosImportarCompras() {
  document.addEventListener('change', async function (e) {
    const t = e.target;
    if (t.id === 'arq-compras' && t.files && t.files[0]) {
      const arq = t.files[0]; t.value = '';
      let texto;
      try { texto = await lerArquivoTexto(arq); } catch (err) { toast('Não foi possível ler o arquivo.'); return; }
      const csv = C.lerCSV(texto);
      const im = { nome: arq.name, csv: csv, padroes: { data: hoje(), descricao: '', forma: 'pix' }, resolucoes: {} };
      const lembradas = S.meta.decisoesImport || {};
      C.interpretarCompras(csv, S.dados.ingredientes, im.padroes, {}).naoEncontrados.forEach(x => {
        const d = lembradas[x.chave];
        im.resolucoes[x.chave] = d && (d === 'novo' || d === 'outro' || (S.dados.ingredientes[d] && !S.dados.ingredientes[d].excluidoEm)) ? d : 'novo';
      });
      S.importacao = im;
      if (location.hash === '#/importar-compras') render(false); else ir('#/importar-compras');
      return;
    }
    if (t.dataset && t.dataset.imp && S.importacao) { S.importacao.padroes[t.dataset.imp] = t.value; render(false); return; }
    if (t.dataset && t.dataset.impRes !== undefined && S.importacao) { S.importacao.resolucoes[t.dataset.impRes] = t.value; render(false); }
  });
}
