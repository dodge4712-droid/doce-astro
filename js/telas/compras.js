// Tela Loja → Compras: lista do que comprar e compras feitas.
import * as C from '../motor/index.js';
import { S, ctxCalc, lista } from '../nucleo/estado.js';
import { I, p } from '../nucleo/icones.js';
import { abas, cab } from '../nucleo/interface.js';
import { ir, render } from '../nucleo/rotas.js';
import { dataCurta, dataDia, esc, hoje, rotUn } from '../nucleo/util.js';
import { fonteCanonica, formaTxt } from '../servicos/caixa.js';
import { modoEstoque, saldos } from '../servicos/estoque.js';
import { blocoImportarCompras } from './importar-compras.js';
import { ABAS_PED } from './pedidos.js';

// ---------- Compras ----------
export function telaCompras() {
  const F = S.compras || (S.compras = { de: hoje(), ate: C.somarDias(hoje(), 6), orc: false });
  const sts = F.orc ? ['orcamento', 'confirmado', 'producao'] : ['confirmado', 'producao'];
  const peds = lista('pedidos').filter(p => sts.includes(p.status) && p.dataEntrega && p.dataEntrega >= F.de && p.dataEntrega <= F.ate);
  const nx = C.necessidades(peds, ctxCalc());
  const comEstoque = modoEstoque() !== 'desligado';
  let h = cab('Lista de compras', 'Ingredientes para os pedidos do período, com receitas dentro de receitas já desmontadas e a perda de cada uma.') + abas(ABAS_PED, '#/compras') + segCompras('lista');
  h += '<section class="bloco"><div class="linha-campos"><label class="campo"><span>De</span><input class="entrada" type="date" data-compras="de" value="' + F.de + '"></label><label class="campo"><span>Até</span><input class="entrada" type="date" data-compras="ate" value="' + F.ate + '"></label></div>' +
    '<div class="acoes" style="margin-top:10px"><button type="button" class="btn sec fino" data-acao="compras-periodo" data-v="7">Próximos 7 dias</button><button type="button" class="btn sec fino" data-acao="compras-periodo" data-v="1">Só amanhã</button></div>' +
    '<label class="chave" style="margin-top:6px"><span class="rot">Incluir orçamentos<small>Para já ter noção, antes de o cliente confirmar</small></span><input type="checkbox" data-compras="orc"' + (F.orc ? ' checked' : '') + '></label></section>';
  if (F.ate < F.de) return h + '<div class="aviso neg">' + I.alerta + '<div class="txt">A data final vem antes da inicial.</div></div>';
  const base = comEstoque ? C.comprasComEstoque(nx.compras, saldos(), S.dados.ingredientes) : Object.values(nx.compras).map(c => Object.assign({}, c, { tem: 0, falta: c.qtdBase, embalagensFalta: c.embalagens, custoFalta: c.custoEmbalagens }));
  const linhas = base.map(c => ({ c: c, ing: S.dados.ingredientes[c.ingredienteId] })).filter(x => x.ing)
    .sort((a, b) => ((b.c.embalagensFalta > 0) - (a.c.embalagensFalta > 0)) || a.ing.nome.localeCompare(b.ing.nome, 'pt-BR'));
  if (!peds.length || !linhas.length) {
    return h + '<div class="bloco vazio">' + I.emblema + '<h2>Nada a comprar no período</h2><p>' + (peds.length ? 'Os pedidos do período não têm receitas com ingredientes calculáveis.' : 'Não há pedidos ' + (F.orc ? '' : 'confirmados ') + 'entre ' + dataDia(F.de) + ' e ' + dataDia(F.ate) + '.') + '</p></div>' +
      (nx.avisos.length ? '<div class="aviso">' + I.alerta + '<div class="txt"><ul>' + nx.avisos.map(a => '<li>' + esc(a) + '</li>').join('') + '</ul></div></div>' : '');
  }
  const comprar = linhas.filter(x => x.c.embalagensFalta > 0);
  const total = comprar.reduce((s, x) => s + (x.c.custoFalta || 0), 0);
  const embTxt = x => x.c.embalagensFalta + ' × ' + C.num(x.ing.qtdEmbalagem) + ' ' + rotUn(x.ing.unidade);
  S.textoCopia = 'Lista de compras (' + dataDia(F.de) + (F.ate !== F.de ? ' a ' + dataDia(F.ate) : '') + ')\n\n' +
    (comprar.length ? comprar.map(x => '- ' + x.ing.nome + ': ' + embTxt(x)).join('\n') : 'Nada a comprar: o estoque cobre tudo.') + '\n\nEstimativa: ' + C.brl(total);
  h += '<section class="bloco"><h2>' + (comprar.length ? comprar.length + (comprar.length === 1 ? ' ingrediente a comprar' : ' ingredientes a comprar') : 'O estoque cobre tudo') + ' para ' + peds.length + (peds.length === 1 ? ' pedido' : ' pedidos') + '</h2>' +
    '<p class="explica">"Usa" é o que as receitas consomem.' + (comEstoque ? ' "Tem" vem do Estoque; "Comprar" é só o que falta, arredondado para embalagens inteiras.' : ' "Comprar" arredonda para embalagens inteiras. Ligue o Estoque em Ajustes para descontar o que você já tem.') + '</p>' +
    '<div class="tabela-compras' + (comEstoque ? ' com-estoque' : '') + '" role="table"><div class="tc-cab" role="row"><span role="columnheader">Ingrediente</span><span role="columnheader">Usa</span>' + (comEstoque ? '<span role="columnheader">Tem</span>' : '') + '<span role="columnheader">Comprar</span><span role="columnheader">Custo</span></div>' +
    linhas.map(x => '<div class="tc-lin' + (x.c.embalagensFalta > 0 ? '' : ' tc-ok') + '" role="row"><span role="cell"><b>' + esc(x.ing.nome) + '</b></span><span role="cell" data-r="Usa">' + C.qtdLegivel(x.c.qtdBase, x.c.base) + '</span>' +
      (comEstoque ? '<span role="cell" data-r="Tem">' + C.qtdLegivel(x.c.tem, x.c.base) + '</span>' : '') +
      '<span role="cell" data-r="Comprar">' + (x.c.embalagensFalta > 0 ? embTxt(x) : (comEstoque ? 'já tem' : '—')) + '</span><span role="cell" data-r="Custo">' + (x.c.embalagensFalta > 0 ? C.brl(x.c.custoFalta) : '—') + '</span></div>').join('') +
    '<div class="tc-lin tc-total" role="row"><span role="cell"><b>Total estimado</b></span><span role="cell"></span>' + (comEstoque ? '<span role="cell"></span>' : '') + '<span role="cell"></span><span role="cell"><b>' + C.brl(total) + '</b></span></div></div>' +
    (nx.avisos.length ? '<div class="aviso" style="margin-top:12px">' + I.alerta + '<div class="txt"><ul>' + nx.avisos.map(a => '<li>' + esc(a) + '</li>').join('') + '</ul></div></div>' : '') +
    '<div class="acoes" style="margin-top:14px"><button type="button" class="btn sec" data-acao="copiar-lista">' + I.copiar + 'Copiar lista</button><a class="btn sec" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(S.textoCopia) + '">' + I.mensagem + 'Enviar no WhatsApp</a></div></section>';
  return h;
}
export function segCompras(ativa) {
  return '<div class="seg" role="group" aria-label="Parte da aba Compras" style="margin-bottom:14px"><a href="#/compras"' + (ativa === 'lista' ? ' aria-current="true"' : '') + '>Lista de compras</a><a href="#/compras?v=feitas"' + (ativa === 'feitas' ? ' aria-current="true"' : '') + '>Compras feitas</a></div>';
}
export function comprasRegistradas() {
  return lista('lancamentos').filter(l => l.tipo === 'saida' && ((l.itensCompra || []).length || C.semAcento(l.categoria) === 'ingredientes'))
    .sort((a, b) => String(b.data).localeCompare(String(a.data)) || String(b.atualizadoEm || '').localeCompare(String(a.atualizadoEm || '')));
}
export function telaComprasFeitas() {
  let h = cab('Compras feitas', 'Registre o que comprou: à mão ou por uma planilha do Excel. O preço dos ingredientes se atualiza sozinho.',
    '<a class="btn" href="#/lancamento/novo?compra=1">' + I.mais + 'Nova compra</a>') + abas(ABAS_PED, '#/compras') + segCompras('feitas');
  h += blocoImportarCompras();
  const todas = comprasRegistradas(), mes = hoje().slice(0, 7);
  const doMes = todas.filter(l => String(l.data).slice(0, 7) === mes), totMes = doMes.reduce((s, l) => s + (l.valor || 0), 0);
  const recentes = todas.filter(l => l.data >= C.somarDias(hoje(), -60));
  if (!todas.length) return h + '<div class="bloco vazio">' + I.emblema + '<h2>Nenhuma compra registrada</h2><p>Registre as compras de ingredientes para o app manter os preços atualizados e, no modo completo, o estoque.</p><a class="btn" href="#/lancamento/novo?compra=1">' + I.mais + 'Registrar a primeira compra</a></div>';
  h += '<div class="stats stats-cx" style="grid-template-columns:repeat(2,minmax(0,1fr))"><div class="stat"><div class="r">Compras em ' + esc(C.nomeMes(mes).split(' ')[0]) + '</div><div class="n">' + C.brl(totMes) + '</div></div><div class="stat" style="grid-column:auto"><div class="r">Quantidade</div><div class="n">' + doMes.length + '</div></div></div>';
  h += '<section class="bloco"><div class="cab-bloco"><h2>Últimos 60 dias</h2><button type="button" class="link-btn" data-acao="compras-no-caixa">Ver todas no Caixa</button></div>' +
    (recentes.length ? '<div class="lista">' + recentes.map(function (l) {
      const its = (l.itensCompra || []).map(it => (S.dados.ingredientes[it.ingredienteId] || {}).nome).filter(Boolean);
      return '<a class="item" href="#/lancamento/' + encodeURIComponent(l.id) + '?de=compras"><div class="principal"><div class="nome">' + esc(l.descricao || 'Compra') + '</div><div class="det">' + esc(dataCurta(l.data)) + (l.forma ? ', ' + esc(formaTxt(l.forma)) : '') + '</div>' +
        (its.length ? '<div class="det">' + esc(its.slice(0, 3).join(', ') + (its.length > 3 ? ' e mais ' + (its.length - 3) : '')) + '</div>' : '') + '</div>' +
        '<div class="valor">' + C.brl(l.valor) + '</div>' + (l.importado ? '<div class="chips"><span class="chip mudo">importada do Excel</span></div>' : '') + '</a>';
    }).join('') + '</div>' : '<p class="mudo">Nenhuma compra nos últimos 60 dias.</p>') + '</section>';
  return h;
}

// Ações dos botões desta parte (data-acao="...")
export const ACOES_COMPRAS = {
  'compras-periodo': function (el) {
    const n = Number(el.dataset.v);
    S.compras = Object.assign(S.compras || {}, n === 1 ? { de: C.somarDias(hoje(), 1), ate: C.somarDias(hoje(), 1) } : { de: hoje(), ate: C.somarDias(hoje(), n - 1) });
    render(false);
  },
  'compras-no-caixa': function () {
    const p = C.periodoPreset('ano', hoje());
    S.caixa = { preset: 'ano', de: p.de, ate: p.ate, tipo: 'saida', fontes: [fonteCanonica('Ingredientes', 'saida')], busca: '', maisAberto: true };
    ir('#/caixa');
  }
};

// Eventos globais desta parte (registrados uma vez, no arranque)
export function eventosCompras() {
  // período e "incluir orçamentos" da lista de compras
  document.addEventListener('change', function (e) {
    const t = e.target;
    if (!t.dataset || !t.dataset.compras) return;
    S.compras = S.compras || {};
    if (t.dataset.compras === 'orc') S.compras.orc = t.checked; else if (t.value) S.compras[t.dataset.compras] = t.value;
    render(false);
  });
}
