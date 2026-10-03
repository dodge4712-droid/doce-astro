// Tela Receitas → Cardápio: monta o cardápio (itens, preços, descrições) e exporta em JPG para WhatsApp e Stories.
import * as C from '../motor/index.js';
import { S, cfg, ctxCalc, lista } from '../nucleo/estado.js';
import { I } from '../nucleo/icones.js';
import { abas, abrirFolha, cab, confirmar, toast } from '../nucleo/interface.js';
import { render } from '../nucleo/rotas.js';
import { $, $$, esc, inNum, uid } from '../nucleo/util.js';
import { lerCardapio, mudarCardapio } from '../servicos/cardapio.js';
import { arquivosJPG, desenharPagina, paginas, prepararDesenho } from './cardapio-imagem.js';
import { ABAS_REC } from './receitas.js';

const L = C.LIMITES_CARDAPIO;
function precosTxt(it) {
  return it.opcoes.map(o => (o.nome ? esc(o.nome) + ' ' : '') + (o.preco !== null ? '<b>' + C.brl(o.preco) + '</b>' : '<i>sem preço</i>')).join(' · ');
}
export function telaCardapio() {
  const c = lerCardapio(), total = C.totalItensCardapio(c);
  let h = cab('Cardápio', 'Monte o cardápio e envie como imagem no WhatsApp ou nos Stories do Instagram.') + abas(ABAS_REC, '#/cardapio');
  h += '<div class="cardapio-ed"><div class="form-cardapio">';

  // Aparência
  h += '<section class="bloco" id="cardapio-aparencia"><h2>Aparência</h2><div class="grade">' +
    '<label class="campo"><span>Título</span><input class="entrada" data-cc="titulo" maxlength="' + L.titulo + '" value="' + esc(c.titulo) + '" placeholder="Cardápio"><small>Ex.: Cardápio, Cardápio de Páscoa, Doces da semana.</small></label>' +
    '<label class="campo"><span>Recado</span><textarea class="entrada" data-cc="recado" maxlength="' + L.recado + '" rows="2" placeholder="Ex.: Encomendas com 2 dias de antecedência.">' + esc(c.recado) + '</textarea><small>Aparece embaixo do título. Opcional.</small></label></div>' +
    '<div class="campo" style="margin-top:14px"><span>Cores</span><div class="seg" role="group" aria-label="Cores do cardápio">' +
    Object.keys(C.TEMAS_CARDAPIO).map(k => '<button type="button" data-acao="cardapio-tema" data-v="' + k + '" aria-pressed="' + (c.tema === k) + '"><i class="amostra-tema tema-' + k + '" aria-hidden="true"></i>' + C.TEMAS_CARDAPIO[k] + '</button>').join('') + '</div></div>' +
    (function () {
      const d = cfg().doceria, contato = [d.telefone, d.instagram].filter(Boolean).join(' · ');
      return '<div class="chave"><span class="rot">WhatsApp e Instagram no rodapé<small>' + (contato ? esc(contato) + ', de ' : 'Preencha em ') + '<a href="#/ajustes">Ajustes → Dados da doceria</a></small></span>' +
        '<button type="button" class="interruptor" role="switch" aria-checked="' + c.rodape + '" aria-label="WhatsApp e Instagram no rodapé" data-acao="cardapio-rodape"></button></div>';
    })() + '</section>';

  // Itens
  h += '<section class="bloco" id="cardapio-itens"><h2>Itens do cardápio</h2>';
  if (!total) {
    h += '<div class="vazio" style="padding:20px 8px">' + I.emblema + '<h2>Cardápio vazio</h2><p>Comece trazendo as suas receitas: o nome e as opções de venda vêm com o preço que você cobra. Depois é só ajustar o que quiser, sem mexer nas receitas.</p>' +
      '<div class="acoes" style="justify-content:center"><button type="button" class="btn" data-acao="cardapio-das-receitas">' + I.receitas + 'Trazer das receitas</button><button type="button" class="btn sec" data-acao="cardapio-novo">' + I.mais + 'Novo item</button></div></div></section>';
  } else {
    h += '<p class="explica">O que você muda aqui vale só para o cardápio: as receitas e os pedidos continuam com os preços de lá. Desligue um item para tirá-lo da imagem sem apagar.</p>';
    c.categorias.forEach(function (cat, ci) {
      h += '<div class="cat-cardapio" data-cat="' + esc(cat.id) + '"><div class="cab-bloco"><h3>' + esc(cat.nome || 'Sem categoria') + '</h3><div class="acoes-mini">' +
        '<button type="button" class="btn-icone" data-acao="cardapio-mover-cat" data-c="' + ci + '" data-v="-1" aria-label="Subir a categoria ' + esc(cat.nome) + '"' + (ci === 0 ? ' disabled' : '') + '>' + I.sobe + '</button>' +
        '<button type="button" class="btn-icone" data-acao="cardapio-mover-cat" data-c="' + ci + '" data-v="1" aria-label="Descer a categoria ' + esc(cat.nome) + '"' + (ci === c.categorias.length - 1 ? ' disabled' : '') + '>' + I.desce + '</button>' +
        '<button type="button" class="btn sec fino" data-acao="cardapio-categoria" data-c="' + ci + '">Renomear</button></div></div>';
      if (!cat.itens.length) h += '<p class="mudo">Nenhum item nesta categoria.</p>';
      cat.itens.forEach(function (it, ii) {
        h += '<div class="item-cardapio' + (it.visivel ? '' : ' desligado') + '" data-item="' + esc(it.id) + '">' +
          '<div class="info"><b>' + esc(it.nome || 'Item sem nome') + '</b>' + (it.descricao ? '<p class="det">' + esc(it.descricao) + '</p>' : '') +
          '<p class="precos">' + (it.opcoes.length ? precosTxt(it) : '<i>sem preço</i>') + '</p></div>' +
          '<div class="ctrl"><button type="button" class="interruptor" role="switch" aria-checked="' + it.visivel + '" aria-label="' + esc((it.nome || 'Item') + ' aparece no cardápio') + '" data-acao="cardapio-visivel" data-c="' + ci + '" data-i="' + ii + '"></button>' +
          '<button type="button" class="btn-icone" data-acao="cardapio-mover" data-c="' + ci + '" data-i="' + ii + '" data-v="-1" aria-label="Subir ' + esc(it.nome) + '"' + (ii === 0 ? ' disabled' : '') + '>' + I.sobe + '</button>' +
          '<button type="button" class="btn-icone" data-acao="cardapio-mover" data-c="' + ci + '" data-i="' + ii + '" data-v="1" aria-label="Descer ' + esc(it.nome) + '"' + (ii === cat.itens.length - 1 ? ' disabled' : '') + '>' + I.desce + '</button>' +
          '<button type="button" class="btn sec fino" data-acao="cardapio-editar" data-c="' + ci + '" data-i="' + ii + '">Editar</button></div></div>';
      });
      h += '</div>';
    });
    h += '<div class="acoes" style="margin-top:16px"><button type="button" class="btn sec" data-acao="cardapio-novo">' + I.mais + 'Novo item</button><button type="button" class="btn sec" data-acao="cardapio-das-receitas">' + I.receitas + 'Trazer das receitas</button></div></section>';
  }
  h += '</div>';

  // Prévia e exportação
  h += '<aside class="previa-col"><section class="bloco" id="previa-cardapio"><h2>Prévia</h2>' +
    '<div class="moldura-previa"><canvas id="canvas-cardapio" width="1080" height="1920" role="img" aria-label="Prévia do cardápio"></canvas></div>' +
    '<div class="paginas-previa" id="paginas-previa" hidden><button type="button" class="btn-icone" data-acao="cardapio-pagina" data-v="-1" aria-label="Página anterior">' + I.voltar + '</button><span id="pagina-txt" role="status"></span><button type="button" class="btn-icone" data-acao="cardapio-pagina" data-v="1" aria-label="Próxima página">' + I.seta + '</button></div>' +
    '<div class="acoes"><button type="button" class="btn" data-acao="cardapio-compartilhar">' + I.enviar + 'Compartilhar</button><button type="button" class="btn sec" data-acao="cardapio-baixar">' + I.baixar + 'Baixar JPG</button></div>' +
    '<p class="mudo dica-previa">Tamanho de Stories (1080 × 1920). No celular, <b>Compartilhar</b> abre o WhatsApp e o Instagram. Se não couber numa imagem, o cardápio vira mais de uma, em sequência.</p>' +
    '</section></aside></div>';
  return h;
}

// ---------- Prévia ----------
function opcoesImagem() {
  const c = lerCardapio();
  return { titulo: c.titulo, recado: c.recado, tema: c.tema, rodape: c.rodape, doceria: cfg().doceria, categorias: C.cardapioParaImagem(c) };
}
let recursos = null, desenhoAtual = 0;
export async function desenharPrevia() {
  const canvas = $('#canvas-cardapio'); if (!canvas) return;
  const meu = ++desenhoAtual;
  if (!recursos) recursos = await prepararDesenho();
  if (meu !== desenhoAtual || !document.body.contains(canvas)) return;
  const pgs = paginas(opcoesImagem());
  S.cardapioPagina = Math.min(S.cardapioPagina || 0, pgs.length - 1);
  desenharPagina(canvas, pgs[S.cardapioPagina], recursos);
  canvas.setAttribute('aria-label', 'Prévia do cardápio, imagem ' + (S.cardapioPagina + 1) + ' de ' + pgs.length);
  canvas.dataset.paginas = pgs.length;
  const pag = $('#paginas-previa'); pag.hidden = pgs.length < 2;
  $('#pagina-txt').textContent = 'Imagem ' + (S.cardapioPagina + 1) + ' de ' + pgs.length;
}
let espera = null;
// Chamado pelo roteador depois de desenhar a tela
export function montarTelaCardapio() {
  const form = $('#cardapio-aparencia'); if (!form) return;
  // grava todos os campos juntos (quem digita no título e logo depois no recado não perde o título)
  form.addEventListener('input', function (ev) {
    if (!ev.target.dataset.cc) return;
    clearTimeout(espera);
    espera = setTimeout(function () {
      mudarCardapio(c => { $$('[data-cc]', form).forEach(el => { c[el.dataset.cc] = el.value; }); });
      desenharPrevia();
    }, 350);
  });
  desenharPrevia();
}
function gravarEDesenhar(mudar) { mudarCardapio(mudar); render(false); }

// ---------- Editar um item ----------
function linhaOpcao(o) {
  return '<div class="linha-opcao"><input class="entrada" name="opNome" maxlength="' + L.opcao + '" value="' + esc(o.nome) + '" placeholder="Ex.: Unidade" aria-label="Nome da opção">' +
    '<span class="com-prefixo"><i>R$</i><input class="entrada num" name="opPreco" inputmode="decimal" value="' + inNum(o.preco) + '" placeholder="0,00" aria-label="Preço"></span>' +
    '<button type="button" class="btn-icone" data-rem-op aria-label="Remover opção">' + I.lixo + '</button></div>';
}
function folhaItem(ci, ii) {
  const c = lerCardapio();
  const novo = ii === undefined;
  const cat = c.categorias[ci], it = novo ? { nome: '', descricao: '', visivel: true, opcoes: [{ nome: '', preco: null }] } : cat.itens[ii];
  const cats = c.categorias.map(x => x.nome);
  const corpo = '<form id="f-item-card" style="display:flex;flex-direction:column;gap:12px">' +
    '<label class="campo"><span>Nome</span><input class="entrada" name="nome" maxlength="' + L.nome + '" value="' + esc(it.nome) + '" placeholder="Ex.: Brigadeiro gourmet"></label>' +
    '<label class="campo"><span>Descrição</span><textarea class="entrada" name="descricao" maxlength="' + L.descricao + '" rows="2" placeholder="Ex.: Chocolate belga com granulado crocante">' + esc(it.descricao) + '</textarea><small>Uma frase curta. Até ' + L.descricao + ' letras.</small></label>' +
    '<div class="campo"><label for="cat-item"><span>Categoria</span></label><select class="entrada" id="cat-item" name="categoria">' +
    cats.map((n, k) => '<option value="' + k + '"' + (k === ci ? ' selected' : '') + '>' + esc(n || 'Sem categoria') + '</option>').join('') +
    '<option value="__nova__"' + (!cats.length ? ' selected' : '') + '>+ Nova categoria…</option></select>' +
    '<input class="entrada" name="novaCat" maxlength="' + L.categoria + '" placeholder="Nome da nova categoria" aria-label="Nome da nova categoria" style="margin-top:8px"' + (cats.length ? ' hidden' : '') + '></div>' +
    '<div class="campo"><span>Opções e preços</span><div id="ops-item" class="ops-item">' + it.opcoes.map(linhaOpcao).join('') + '</div>' +
    '<button type="button" class="btn sec fino" data-add-op style="align-self:flex-start;margin-top:6px">' + I.mais + 'Adicionar opção</button><small>Ex.: Unidade R$ 3,50 e Caixa com 4 R$ 14,00. Deixe o preço em branco para "sob consulta".</small></div>' +
    '<p class="mudo" id="msg-item" role="status"></p>' +
    '<div class="rodape-folha">' + (novo ? '' : '<button type="button" class="btn perigo" data-excluir style="margin-right:auto">' + I.lixo + 'Excluir</button>') +
    '<button type="button" class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit">' + (novo ? 'Adicionar item' : 'Salvar item') + '</button></div></form>';
  abrirFolha(novo ? 'Novo item do cardápio' : 'Editar item', corpo, function (d) {
    const f = $('#f-item-card', d), ops = $('#ops-item', d);
    f.categoria.addEventListener('change', function () { f.novaCat.hidden = f.categoria.value !== '__nova__'; if (!f.novaCat.hidden) f.novaCat.focus(); });
    $('[data-add-op]', d).onclick = function () {
      if (ops.children.length >= L.opcoes) { $('#msg-item', d).textContent = 'No máximo ' + L.opcoes + ' opções por item.'; return; }
      ops.insertAdjacentHTML('beforeend', linhaOpcao({ nome: '', preco: null })); ops.lastElementChild.querySelector('input').focus();
    };
    ops.addEventListener('click', function (e) { const b = e.target.closest('[data-rem-op]'); if (b) b.parentElement.remove(); });
    const exc = $('[data-excluir]', d);
    if (exc) exc.onclick = async function () {
      d.close();
      if (!await confirmar('Excluir item?', 'Tirar <b>' + esc(it.nome) + '</b> do cardápio. A receita não é afetada.', 'Excluir item', true)) return;
      gravarEDesenhar(x => { x.categorias[ci].itens.splice(ii, 1); }); toast('Item excluído.');
    };
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      const nome = f.nome.value.trim();
      if (!nome) { $('#msg-item', d).textContent = 'Dê um nome para o item.'; return; }
      const nomeCat = f.categoria.value === '__nova__' ? f.novaCat.value.trim() : cats[+f.categoria.value];
      if (f.categoria.value === '__nova__' && !nomeCat) { $('#msg-item', d).textContent = 'Dê um nome para a categoria nova.'; return; }
      const opcoes = $$('.linha-opcao', ops).map(l => ({ id: uid(), nome: l.querySelector('[name=opNome]').value, preco: C.lerNum(l.querySelector('[name=opPreco]').value) }))
        .filter(o => o.nome.trim() || o.preco !== null);
      if (opcoes.some(o => o.preco !== null && !(o.preco > 0))) { $('#msg-item', d).textContent = 'Os preços precisam ser maiores que zero.'; return; }
      const item = Object.assign({}, it, { id: it.id || uid(), nome: nome, descricao: f.descricao.value, opcoes: opcoes });
      d.close();
      gravarEDesenhar(function (x) {
        if (!novo) x.categorias[ci].itens.splice(ii, 1);
        const destino = x.categorias.findIndex(k => k.nome === nomeCat);
        if (!novo && destino === ci) { x.categorias[ci].itens.splice(ii, 0, item); return x; }
        return C.adicionarAoCardapio(x, item, nomeCat, uid);
      });
      toast(novo ? 'Item adicionado.' : 'Item salvo.');
    });
  });
}
function folhaDasReceitas() {
  const c = lerCardapio();
  const ja = new Set(); c.categorias.forEach(k => k.itens.forEach(it => { if (it.receitaId) ja.add(it.receitaId); }));
  const recs = lista('receitas').filter(r => (r.variacoes || []).length).sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));
  if (!recs.length) { toast('Nenhuma receita com opção de venda ainda.'); return; }
  const corpo = '<form id="f-das-rec" style="display:flex;flex-direction:column;gap:12px"><p class="mudo">Cada receita marcada entra no cardápio com o nome e as opções de venda, pelo <b>Preço que você cobra</b> (ou o sugerido). Depois, mudar aqui não muda a receita.</p>' +
    '<div class="lista-check">' + recs.map(r => '<label class="chave"><span class="rot">' + esc(r.nome) + '<small>' + esc(r.categoria || 'Sem categoria') + (ja.has(r.id) ? ' · já está no cardápio' : '') + '</small></span><input type="checkbox" name="rec" value="' + esc(r.id) + '"' + (ja.has(r.id) ? '' : ' checked') + '></label>').join('') + '</div>' +
    '<div class="rodape-folha"><button type="button" class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit">Trazer para o cardápio</button></div></form>';
  abrirFolha('Trazer das receitas', corpo, function (d) {
    $('#f-das-rec', d).addEventListener('submit', function (e) {
      e.preventDefault();
      const ids = $$('[name=rec]:checked', d).map(x => x.value);
      d.close(); if (!ids.length) return;
      const ctx = ctxCalc();
      gravarEDesenhar(function (x) {
        ids.forEach(id => { const r = S.dados.receitas[id]; if (r) x = C.adicionarAoCardapio(x, C.itemDaReceita(r, ctx, uid), r.categoria || 'Outros', uid); });
        return x;
      });
      toast(ids.length === 1 ? '1 receita trazida para o cardápio.' : ids.length + ' receitas trazidas para o cardápio.');
    });
  });
}

let exportando = false;
async function gerarArquivos() {
  if (!recursos) recursos = await prepararDesenho();
  return arquivosJPG(opcoesImagem(), recursos);
}
function baixar(arqs) {
  arqs.forEach(function (f, i) {
    setTimeout(function () {
      const a = document.createElement('a'); a.href = URL.createObjectURL(f); a.download = f.name;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }, i * 400);
  });
}
function vazio() { return !C.cardapioParaImagem(lerCardapio()).length; }

// Ações dos botões desta parte (data-acao="...")
export const ACOES_CARDAPIO = {
  'cardapio-tema': function (el) { gravarEDesenhar(c => { c.tema = el.dataset.v; }); },
  'cardapio-rodape': function () { gravarEDesenhar(c => { c.rodape = !c.rodape; }); },
  'cardapio-visivel': function (el) { gravarEDesenhar(c => { const it = c.categorias[+el.dataset.c].itens[+el.dataset.i]; it.visivel = !it.visivel; }); },
  'cardapio-mover': function (el) {
    gravarEDesenhar(function (c) {
      const lst = c.categorias[+el.dataset.c].itens, i = +el.dataset.i, j = i + +el.dataset.v;
      if (j >= 0 && j < lst.length) lst.splice(j, 0, lst.splice(i, 1)[0]);
    });
  },
  'cardapio-mover-cat': function (el) {
    gravarEDesenhar(function (c) {
      const i = +el.dataset.c, j = i + +el.dataset.v;
      if (j >= 0 && j < c.categorias.length) c.categorias.splice(j, 0, c.categorias.splice(i, 1)[0]);
    });
  },
  'cardapio-categoria': function (el) {
    const ci = +el.dataset.c, cat = lerCardapio().categorias[ci];
    abrirFolha('Categoria', '<form id="f-cat-card" style="display:flex;flex-direction:column;gap:12px"><label class="campo"><span>Nome da categoria</span><input class="entrada" name="nome" maxlength="' + L.categoria + '" required value="' + esc(cat.nome) + '"></label>' +
      '<div class="rodape-folha"><button type="button" class="btn perigo" data-excluir style="margin-right:auto">' + I.lixo + 'Excluir</button><button type="button" class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit">Salvar</button></div></form>', function (d) {
      $('#f-cat-card', d).addEventListener('submit', function (e) {
        e.preventDefault(); const nome = e.target.nome.value.trim(); if (!nome) return;
        d.close(); gravarEDesenhar(c => { c.categorias[ci].nome = nome; });
      });
      $('[data-excluir]', d).onclick = async function () {
        d.close();
        const n = cat.itens.length;
        if (n && !await confirmar('Excluir a categoria?', 'A categoria <b>' + esc(cat.nome) + '</b> e ' + (n === 1 ? 'o item dela saem' : 'os ' + n + ' itens dela saem') + ' do cardápio. As receitas não são afetadas.', 'Excluir categoria', true)) return;
        gravarEDesenhar(c => { c.categorias.splice(ci, 1); }); toast('Categoria excluída.');
      };
    });
  },
  'cardapio-editar': function (el) { folhaItem(+el.dataset.c, +el.dataset.i); },
  'cardapio-novo': function () { folhaItem(0); },
  'cardapio-das-receitas': folhaDasReceitas,
  'cardapio-pagina': function (el) {
    const n = +($('#canvas-cardapio').dataset.paginas || 1);
    S.cardapioPagina = Math.max(0, Math.min(n - 1, (S.cardapioPagina || 0) + +el.dataset.v));
    desenharPrevia();
  },
  'cardapio-baixar': async function () {
    if (vazio()) { toast('Ligue pelo menos um item para exportar.'); return; }
    if (exportando) return; exportando = true;
    try { const arqs = await gerarArquivos(); baixar(arqs); toast(arqs.length === 1 ? 'Imagem baixada.' : arqs.length + ' imagens baixadas.'); } finally { exportando = false; }
  },
  'cardapio-compartilhar': async function () {
    if (vazio()) { toast('Ligue pelo menos um item para exportar.'); return; }
    if (exportando) return; exportando = true;
    try {
      const arqs = await gerarArquivos();
      if (navigator.canShare && navigator.canShare({ files: arqs })) {
        try { await navigator.share({ files: arqs, title: lerCardapio().titulo || 'Cardápio' }); }
        catch (e) { if (e && e.name !== 'AbortError') { baixar(arqs); toast('Não foi possível abrir o compartilhamento. As imagens foram baixadas.'); } }
      } else {
        baixar(arqs);
        toast('Este aparelho não compartilha imagens direto. ' + (arqs.length === 1 ? 'A imagem foi baixada' : 'As imagens foram baixadas') + ': envie pelo WhatsApp ou pelo Instagram.');
      }
    } finally { exportando = false; }
  }
};
