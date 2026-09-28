// Tela Loja → Produção: o que fazer no período, por receita e por dia.
import * as C from '../motor/index.js';
import { salvarLocal } from '../nucleo/armazenamento.js';
import { S, ctxCalc, lista } from '../nucleo/estado.js';
import { I, p } from '../nucleo/icones.js';
import { abas, cab, copiarTexto, toast } from '../nucleo/interface.js';
import { gravarRegistro } from '../nucleo/registros.js';
import { ir, render } from '../nucleo/rotas.js';
import { agoraISO, clone, dataCurta, dataDia, esc, hoje } from '../nucleo/util.js';
import { aplicarBaixaEstoquePedido, modoEstoque } from '../servicos/estoque.js';
import { ABAS_PED, cardPedido, listaAgrupada, ordemData } from './pedidos.js';

// ---------- Produção (um ou vários dias) ----------
export const PRESETS_PROD = [['hoje', 'Hoje', 0, 0], ['amanha', 'Amanhã', 1, 1], ['3dias', 'Próximos 3 dias', 0, 2], ['7dias', 'Próximos 7 dias', 0, 6]];
export function faixaProd() { if (!S.prod) S.prod = { preset: 'hoje', de: hoje(), ate: hoje() }; return S.prod; }
export function rotuloFaixa(de, ate) { return de === ate ? dataCurta(de) : dataCurta(de) + ' até ' + dataCurta(ate); }
export function textoProducao(de, ate, linhas) {
  return 'Produção ' + (de === ate ? 'de ' + dataDia(de) : 'de ' + dataDia(de) + ' a ' + dataDia(ate)) + '\n\n' +
    linhas.map(l => (l.feito ? '[x] ' : '[ ] ') + l.nome + ': ' + l.qtd + (l.lotes ? ' (' + l.lotes + ')' : '') + (l.porDia ? '\n    ' + l.porDia.join('; ') : '')).join('\n');
}
export function telaProducao() {
  const P = faixaProd(), umDia = P.de === P.ate;
  let h = cab('Produção', 'O que fazer para os pedidos do período, já somando receitas usadas dentro de outras.') + abas(ABAS_PED, '#/producao');
  h += '<section class="bloco"><div class="seg" role="group" aria-label="Período da produção">' + PRESETS_PROD.map(p => '<button type="button" data-acao="prod-preset" data-v="' + p[0] + '" aria-pressed="' + (P.preset === p[0]) + '">' + p[1] + '</button>').join('') + '</div>' +
    '<div class="linha-campos" style="margin-top:12px"><label class="campo"><span>De</span><input class="entrada" type="date" data-prodfaixa="de" value="' + P.de + '"></label><label class="campo"><span>Até</span><input class="entrada" type="date" data-prodfaixa="ate" value="' + P.ate + '"></label></div></section>';
  if (P.ate < P.de) return h + '<div class="aviso neg">' + I.alerta + '<div class="txt">A data final vem antes da inicial.</div></div>';
  const naFaixa = lista('pedidos').filter(p => p.dataEntrega && p.dataEntrega >= P.de && p.dataEntrega <= P.ate && p.status !== 'cancelado');
  const peds = naFaixa.filter(p => ['confirmado', 'producao'].includes(p.status)).sort(ordemData);
  const orc = naFaixa.filter(p => p.status === 'orcamento').length;
  const prontos = naFaixa.filter(p => ['pronto', 'entregue'].includes(p.status)).length;
  const feito = S.meta.producaoFeita || {};
  const chaveFeito = umDia ? P.de : P.de + '..' + P.ate;
  if (!peds.length) {
    return h + '<div class="bloco vazio">' + I.emblema + '<h2>Nada para produzir</h2><p class="faixa-prod">' + esc((t => t.charAt(0).toUpperCase() + t.slice(1))(rotuloFaixa(P.de, P.ate))) + '</p><p>' +
      (prontos ? prontos + (prontos === 1 ? ' pedido do período já está pronto ou entregue. ' : ' pedidos do período já estão prontos ou entregues. ') : '') +
      (orc ? orc + (orc === 1 ? ' orçamento ainda não foi confirmado.' : ' orçamentos ainda não foram confirmados.') : 'A lista usa pedidos confirmados ou em produção.') + '</p><a class="btn sec" href="#/agenda">Ver agenda</a></div>';
  }
  const ctx = ctxCalc();
  const nx = C.necessidades(peds, ctx);
  const pd = umDia ? null : C.producaoPorDia(peds, ctx);
  const linhas = Object.values(nx.producao).map(function (x) {
    const r = S.dados.receitas[x.receitaId] || {};
    const lotes = x.rendBase ? x.qtdBase / x.rendBase : null;
    const ub = x.unidadeBase || 'un';
    return { id: x.receitaId, nome: r.nome || 'Receita', direto: x.direto > 0, qtd: C.qtdLegivel(x.qtdBase, ub),
      lotes: C.numOk(lotes) ? C.num(lotes, 2) + (lotes === 1 ? ' receita' : ' receitas') : '', feito: !!feito[chaveFeito + ':' + x.receitaId],
      porDia: pd && pd[x.receitaId] ? pd[x.receitaId].map(d => dataCurta(d.dia) + ': ' + C.qtdLegivel(d.qtdBase, ub)) : null };
  }).sort((a, b) => (a.direto === b.direto ? a.nome.localeCompare(b.nome, 'pt-BR') : a.direto ? 1 : -1));
  S.textoCopia = textoProducao(P.de, P.ate, linhas);
  const nConf = peds.filter(p => p.status === 'confirmado').length;
  const faixaTxt = rotuloFaixa(P.de, P.ate);
  h += '<section class="bloco"><h2>O que fazer</h2><p class="faixa-prod">' + esc(faixaTxt.charAt(0).toUpperCase() + faixaTxt.slice(1)) + '</p><p class="explica">As receitas de base (recheios, massas) aparecem primeiro, porque entram nas outras.' + (umDia ? '' : ' Embaixo de cada uma, quanto é para cada dia.') + '</p><div class="lista-check">' +
    linhas.map(l => '<label class="linha-check' + (l.feito ? ' feito' : '') + '"><input type="checkbox" data-prod="' + esc(chaveFeito + ':' + l.id) + '"' + (l.feito ? ' checked' : '') + '><span class="principal"><b>' + esc(l.nome) + '</b><small>' + (l.direto ? '' : 'base para outras receitas') + '</small>' +
      (l.porDia ? '<small class="por-dia">' + l.porDia.map(esc).join('<br>') + '</small>' : '') + '</span><span class="valor">' + esc(l.qtd) + '<small>' + esc(l.lotes) + '</small></span></label>').join('') + '</div>' +
    (nx.avisos.length ? '<div class="aviso" style="margin-top:12px">' + I.alerta + '<div class="txt"><ul>' + nx.avisos.map(a => '<li>' + esc(a) + '</li>').join('') + '</ul></div></div>' : '') +
    '<div class="acoes" style="margin-top:14px">' + (nConf ? '<button type="button" class="btn" data-acao="prod-iniciar">' + (nConf === 1 ? 'Colocar o pedido confirmado em produção' : 'Colocar os ' + nConf + ' pedidos confirmados em produção') + '</button>' : '') +
    '<button type="button" class="btn sec" data-acao="copiar-lista">' + I.copiar + 'Copiar lista</button><a class="btn sec" href="#/compras?de=' + P.de + '&ate=' + P.ate + '">Ver ingredientes</a></div>' +
    (nConf && modoEstoque() === 'completo' ? '<p class="mudo" style="margin-top:8px">Ao entrar em produção, os ingredientes saem do estoque.</p>' : '') + '</section>';
  h += '<section class="bloco"><h2>Pedidos do período</h2>' + (orc ? '<p class="explica">' + orc + (orc === 1 ? ' orçamento do período não entra na conta' : ' orçamentos do período não entram na conta') + ' até ser confirmado.</p>' : '') + '<div class="lista">' + (umDia ? peds.map(cardPedido).join('') : listaAgrupada(peds)) + '</div></section>';
  return h;
}

// Ações dos botões desta parte (data-acao="...")
export const ACOES_PRODUCAO = {
  'prod-dia': function (el) { const n = Number(el.dataset.v), d = C.somarDias(hoje(), n); S.prod = { preset: n === 1 ? 'amanha' : n === 0 ? 'hoje' : 'personalizado', de: d, ate: d }; if (location.hash !== '#/producao') ir('#/producao'); else render(false); },
  'prod-preset': function (el) { const p = PRESETS_PROD.find(x => x[0] === el.dataset.v); S.prod = { preset: p[0], de: C.somarDias(hoje(), p[2]), ate: C.somarDias(hoje(), p[3]) }; render(false); },
  'prod-iniciar': function () {
    const P = faixaProd();
    const ps = lista('pedidos').filter(p => p.dataEntrega >= P.de && p.dataEntrega <= P.ate && p.status === 'confirmado');
    ps.forEach(function (p) { const c = clone(p); c.status = 'producao'; (c.historicoStatus = c.historicoStatus || []).push({ status: 'producao', em: agoraISO() }); aplicarBaixaEstoquePedido(p, c); gravarRegistro('pedidos', c); });
    toast((ps.length === 1 ? '1 pedido em produção.' : ps.length + ' pedidos em produção.') + (modoEstoque() === 'completo' ? ' Ingredientes descontados do estoque.' : '')); render(false);
  },
  'copiar-lista': function () { if (S.textoCopia) copiarTexto(S.textoCopia); }
};

// Eventos globais desta parte (registrados uma vez, no arranque)
export function eventosProducao() {
  document.addEventListener('change', function (e) {
    const t = e.target;
    if (t.dataset && t.dataset.prod !== undefined) {
      S.meta.producaoFeita = S.meta.producaoFeita || {};
      if (t.checked) S.meta.producaoFeita[t.dataset.prod] = true; else delete S.meta.producaoFeita[t.dataset.prod];
      // guarda só as duas últimas semanas
      const limite = C.somarDias(hoje(), -14);
      Object.keys(S.meta.producaoFeita).forEach(k => { if (k.slice(0, 10) < limite) delete S.meta.producaoFeita[k]; });
      salvarLocal();
      t.closest('.linha-check').classList.toggle('feito', t.checked);
      return;
    }
    if (t.dataset && t.dataset.prodfaixa && t.value) { const P = faixaProd(); P[t.dataset.prodfaixa] = t.value; P.preset = 'personalizado'; render(false); }
  });
}
