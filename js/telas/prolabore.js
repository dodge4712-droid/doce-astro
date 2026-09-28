// Tela Caixa → Pró-labore: disponível para retirar, retiradas e reserva.
import * as C from '../motor/index.js';
import { S, cfg, configEfetiva, lista } from '../nucleo/estado.js';
import { I } from '../nucleo/icones.js';
import { abas, abrirFolha, cab, confirmar, toast } from '../nucleo/interface.js';
import { excluirRegistro, gravarRegistro } from '../nucleo/registros.js';
import { render } from '../nucleo/rotas.js';
import { $, dataCurta, dataDia, esc, hoje, inNum, uid } from '../nucleo/util.js';
import { fonteCanonica, formaTxt, movsTodos } from '../servicos/caixa.js';
import { calcProLabore, dinheiroNoCaixa } from '../servicos/financeiro.js';
import { ABAS_CX } from './caixa.js';
import { totalLancamento } from './lancamento.js';

export function telaProLabore() {
  const mes = hoje().slice(0, 7), cf = cfg();
  const lim = C.limitesMes(mes);
  const pl = calcProLabore();
  const neg = pl.disponivel < -0.004;
  const caixa = dinheiroNoCaixa();
  let h = cab('Pró-labore e reserva', 'Quanto do seu trabalho as vendas já pagaram, o que você retirou e o que guardar.') + abas(ABAS_CX, '#/prolabore');
  h += '<section class="bloco"><h2>Pró-labore</h2>' +
    '<div class="destaque-reserva destaque-pl"><div class="r">Disponível para retirar</div><div class="v ' + (neg ? 'neg-txt' : 'pos-txt') + '">' + (neg ? '−' : '') + C.brl(Math.abs(pl.disponivel)) + '</div>' +
    (neg ? '<div class="r neg-txt">Você retirou ' + C.brl(-pl.disponivel) + ' a mais do que as vendas liberaram até agora.</div>' : '') + '</div>' +
    '<dl class="resultados" style="margin-top:12px"><div><dt>Liberado pelas vendas</dt><dd>' + C.brl(pl.liberado) + '</dd></div>' +
    (pl.estimado > 0 ? '<div><dt>Estimado (vendas sem produto)</dt><dd>' + C.brl(pl.estimado) + '</dd></div>' : '') +
    '<div><dt>Já retirado</dt><dd>' + C.brl(pl.retirado) + '</dd></div><div><dt>A liberar</dt><dd>' + C.brl(pl.aLiberar) + '</dd></div></dl>' +
    '<p class="mudo" style="margin-top:8px">"A liberar" é a sua parte em pedidos ainda não entregues ou não pagos. Entra no disponível quando o pedido for entregue e pago.</p>' +
    (pl.disponivel > 0.004 && caixa < pl.disponivel ? '<div class="aviso" style="margin-top:12px">' + I.alerta + '<div class="txt">O caixa tem ' + C.brl(Math.max(0, caixa)) + ' agora, sem contar a reserva. Parte do pró-labore liberado pode estar em ingredientes, estoque ou contas já pagas.</div></div>' : '') +
    '<div class="acoes" style="margin-top:14px"><button type="button" class="btn" data-acao="retirar">' + I.mais + 'Registrar retirada</button></div>' +
    '<details class="ajuda"><summary>Como é calculado?</summary><div>' +
    '<p>Cada preço já traz uma parte para o seu trabalho: a mão de obra da receita (valor da hora × tempo de produção, incluindo o das receitas usadas dentro de outras). Essa parte é liberada quando o pedido é entregue, na proporção do que foi pago. Nas vendas da vitrine, na hora da venda.</p>' +
    (pl.porProduto.length ? '<ul class="historico" style="margin-top:8px">' + pl.porProduto.slice(0, 10).map(x => '<li><span>' + esc(x.nome) + ' <small class="mudo">' + C.brl(x.maoObraUnit) + (C.numOk(x.pct) ? ' (' + C.pct(x.pct, 0) + ' do preço)' : '') + ' × ' + C.num(x.qtd) + '</small></span><b>' + C.brl(x.liberado) + '</b></li>').join('') + '</ul>' : '<p class="mudo">Ainda não há vendas entregues com produto.</p>') +
    (pl.receitaAvulsa > 0 ? '<p style="margin-top:8px">Vendas lançadas no Caixa sem produto (balcão, iFood): ' + C.brl(pl.receitaAvulsa) + ' × ' + C.pct(pl.pctMedio, 1) + ' = ' + C.brl(pl.estimado) + '. A porcentagem é a média ' + (pl.pctOrigem === 'vendas' ? 'das vendas com produto' : pl.pctOrigem === 'receitas' ? 'das receitas cadastradas' : '(sem dados ainda)') + '. "Outras entradas" não contam como venda.</p>' : '') +
    '<p style="margin-top:8px">O valor da hora fica guardado em cada venda: mudar o valor em Ajustes vale para as próximas vendas, não muda o que já foi vendido.</p></div></details></section>';
  const plDesejado = C.proLaboreDesejado(configEfetiva());
  const retMes = pl.retiradas.filter(l => l.data >= lim.de && l.data <= lim.ate);
  const totMes = retMes.reduce((s, l) => s + l.valor, 0);
  h += '<section class="bloco"><div class="cab-bloco"><h2>Retiradas</h2><span class="mudo">em ' + esc(C.nomeMes(mes).split(' ')[0]) + ': <b>' + C.brl(totMes) + '</b></span></div>' +
    (C.numOk(plDesejado) && plDesejado > 0 ? '<div class="meta-barra"><i style="width:' + Math.min(100, totMes / plDesejado * 100).toFixed(1) + '%"></i></div><small class="mudo">' + C.pct(totMes / plDesejado, 0) + ' do salário desejado de ' + C.brl(plDesejado) + ' (Ajustes → Mão de obra)</small>' : '') +
    (pl.retiradas.length ? '<div class="lista" style="margin-top:12px">' + pl.retiradas.slice(0, 20).map(l => '<a class="item" href="#/lancamento/' + encodeURIComponent(l.id) + '"><div class="principal"><div class="nome">' + esc(dataCurta(l.data)) + '</div><div class="det">' + esc(l.descricao && l.descricao !== C.FONTE_PROLABORE ? l.descricao : 'Pró-labore') + (l.forma ? ', ' + esc(formaTxt(l.forma)) : '') + '</div></div><div class="valor">' + C.brl(l.valor) + '</div></a>').join('') + '</div>' + (pl.retiradas.length > 20 ? '<p class="mudo" style="margin-top:8px">Mostrando as 20 mais recentes. Todas estão no Movimento, categoria Pró-labore.</p>' : '')
      : '<p class="mudo" style="margin-top:8px">Nenhuma retirada registrada ainda.</p>') + '</section>';
  h += telaReservaBloco(mes, cf);
  return h;
}
export function folhaRetirada() {
  const pl = calcProLabore(), disp = pl.disponivel;
  const corpo = '<div class="destaque-reserva"><div class="r">Disponível agora</div><div class="v ' + (disp < 0 ? 'neg-txt' : 'pos-txt') + '">' + (disp < 0 ? '−' : '') + C.brl(Math.abs(disp)) + '</div></div>' +
    '<form id="f-ret" style="display:flex;flex-direction:column;gap:12px"><div class="linha-campos"><label class="campo"><span>Valor da retirada</span><span class="com-prefixo"><i>R$</i><input class="entrada num" name="valor" inputmode="decimal" required></span></label>' +
    '<label class="campo"><span>Data</span><input class="entrada" type="date" name="data" value="' + hoje() + '"></label></div>' +
    '<label class="campo"><span>Forma</span><select class="entrada" name="forma">' + Object.keys(C.FORMAS_LANCAMENTO).map(k => '<option value="' + k + '"' + (k === 'pix' ? ' selected' : '') + '>' + C.FORMAS_LANCAMENTO[k] + '</option>').join('') + '</select></label>' +
    '<label class="campo"><span>Observação</span><input class="entrada" name="obs" placeholder="Opcional"></label>' +
    '<div class="aviso neg" id="aviso-ret" hidden></div>' +
    '<div class="rodape-folha"><button type="button" class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit">Registrar retirada</button></div></form>';
  abrirFolha('Retirada de pró-labore', corpo, function (d) {
    const f = $('#f-ret', d), av = $('#aviso-ret', d);
    f.valor.focus();
    function conferir() {
      const v = C.lerNum(f.valor.value);
      const passa = v > 0 && v > disp + 0.004;
      av.hidden = !passa;
      if (passa) av.innerHTML = I.alerta + '<div class="txt">Passa ' + C.brl(v - Math.max(0, disp)) + ' do disponível. Esse valor sairia do dinheiro da doceria (ingredientes, contas, reserva), não do que as vendas já pagaram pelo seu trabalho.</div>';
    }
    f.addEventListener('input', conferir);
    f.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      const v = C.lerNum(f.valor.value);
      if (!(v > 0)) { toast('Informe o valor.'); return; }
      if (v > disp + 0.004) {
        const ok = await confirmar('Retirar mais do que o disponível?', 'O disponível é ' + (disp < 0 ? '−' : '') + C.brl(Math.abs(disp)) + '. Retirando ' + C.brl(v) + ', você fica ' + C.brl(v - disp) + ' acima do que as vendas liberaram até agora.', 'Retirar mesmo assim', true);
        if (!ok) return;
      }
      gravarRegistro('lancamentos', { id: uid(), tipo: 'saida', data: f.data.value || hoje(), valor: C.round2(v), categoria: C.FONTE_PROLABORE, descricao: f.obs.value.trim() || C.FONTE_PROLABORE, forma: f.forma.value, obs: '', itensCompra: [] });
      d.close();
      const novo = calcProLabore().disponivel;
      toast('Retirada registrada. Disponível agora: ' + (novo < 0 ? '−' : '') + C.brl(Math.abs(novo)) + '.');
      render(false);
    });
  });
}
// Retirada lançada pelo Movimento: mesmo aviso
export async function conferirRetiradaNoLancamento(l) {
  if (l.tipo !== 'saida' || C.semAcento(fonteCanonica(l.categoria, 'saida')) !== C.semAcento(C.FONTE_PROLABORE)) return true;
  const orig = S.dados.lancamentos[l.id];
  const jaContava = orig && !orig.excluidoEm && C.semAcento(orig.categoria) === C.semAcento(C.FONTE_PROLABORE) ? orig.valor : 0;
  const disp = calcProLabore().disponivel + jaContava, v = totalLancamento(l);
  if (v <= jaContava + 0.004) return true; // editar sem aumentar o valor não pede confirmação
  if (!(v > disp + 0.004)) return true;
  return confirmar('Retirar mais do que o disponível?', 'O pró-labore disponível é ' + (disp < 0 ? '−' : '') + C.brl(Math.abs(disp)) + '. Com esta retirada de ' + C.brl(v) + ', você fica ' + C.brl(v - disp) + ' acima do que as vendas liberaram.', 'Salvar mesmo assim', true);
}
export function telaReservaBloco(mes, cf) {
  const lim = C.limitesMes(mes);
  const rm = C.resumoCaixa(C.filtrarMovimentos(movsTodos(), lim));
  const rv = C.resumoReserva(lista('lancamentos'), configEfetiva(), mes, rm.entradas);
  let h = '';
  h += '<section class="bloco" id="reserva"><h2>Reserva</h2><p class="explica">O app não mexe no seu dinheiro: ele calcula quanto separar. Quando transferir para a poupança ou guardar o valor, registre aqui.</p>' +
    '<div class="destaque-reserva"><div class="r">Guardado até hoje</div><div class="v">' + C.brl(rv.saldo) + '</div>' +
    (rv.meta ? '<div class="meta-barra" role="progressbar" aria-label="Quanto da meta da reserva já foi guardado" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(Math.min(100, rv.saldo / rv.meta * 100)) + '"><i style="width:' + Math.min(100, Math.max(0, rv.saldo / rv.meta * 100)).toFixed(1) + '%"></i></div><div class="r">' + C.pct(Math.max(0, rv.saldo) / rv.meta, 0) + ' da meta de ' + C.brl(rv.meta) + '</div>' : '') + '</div>' +
    '<h3 style="margin-top:18px">Em ' + esc(C.nomeMes(mes).split(' ')[0]) + '</h3><dl class="resultados" style="margin-top:8px"><div><dt>Entradas do mês</dt><dd>' + C.brl(rm.entradas) + '</dd></div><div><dt>Separar (' + C.num(rv.pct) + '%)</dt><dd>' + C.brl(rv.sugeridoMes) + '</dd></div><div><dt>Já guardado</dt><dd>' + C.brl(rv.guardadoMes) + '</dd></div><div class="' + (rv.faltaGuardar > 0 ? 'neg' : 'pos') + '"><dt>Falta guardar</dt><dd>' + C.brl(rv.faltaGuardar) + '</dd></div></dl>' +
    '<div class="acoes" style="margin-top:14px">' + (rv.faltaGuardar > 0 ? '<button type="button" class="btn" data-acao="reserva-mov" data-v="guardar">Guardei ' + C.brl(rv.faltaGuardar) + '</button>' : '<button type="button" class="btn sec" data-acao="reserva-mov" data-v="guardar">' + I.mais + 'Guardar um valor</button>') + '<button type="button" class="btn sec" data-acao="reserva-mov" data-v="usar">Usar da reserva</button></div>' +
    '<div class="grade" style="margin-top:16px"><label class="campo"><span>Separar de cada entrada</span><span class="com-prefixo"><input class="entrada num" data-cfg="reservaPct" data-n inputmode="decimal" value="' + inNum(cf.reservaPct) + '"><i class="dir">%</i></span></label>' +
    '<label class="campo"><span>Meta da reserva (opcional)</span><span class="com-prefixo"><i>R$</i><input class="entrada num" data-cfg="reservaMeta" data-n inputmode="decimal" value="' + inNum(cf.reservaMeta) + '" placeholder="sem meta"></span></label></div>' +
    (rv.historico.length ? '<h3 style="margin-top:18px">Histórico</h3><ul class="historico">' + rv.historico.slice(0, 12).map(l => '<li><span>' + dataDia(l.data) + ', ' + (l.valor > 0 ? 'guardado' : 'usado') + (l.descricao && l.descricao !== 'Reserva' ? ' <small class="mudo">' + esc(l.descricao) + '</small>' : '') + '</span><span><b class="' + (l.valor > 0 ? 'pos-txt' : 'neg-txt') + '">' + (l.valor > 0 ? '+' : '−') + C.brl(Math.abs(l.valor)) + '</b><button type="button" class="link-btn mini" data-acao="reserva-rem" data-id="' + esc(l.id) + '" aria-label="Remover registro">remover</button></span></li>').join('') + '</ul>' : '') + '</section>';
  return h;
}
export function folhaReserva(tipo) {
  const mes = hoje().slice(0, 7);
  const rm = C.resumoCaixa(C.filtrarMovimentos(movsTodos(), C.limitesMes(mes)));
  const rv = C.resumoReserva(lista('lancamentos'), configEfetiva(), mes, rm.entradas);
  const guardar = tipo === 'guardar';
  const corpo = '<form id="f-res" style="display:flex;flex-direction:column;gap:12px"><div class="linha-campos"><label class="campo"><span>Valor</span><span class="com-prefixo"><i>R$</i><input class="entrada num" name="valor" inputmode="decimal" required value="' + (guardar && rv.faltaGuardar > 0 ? inNum(rv.faltaGuardar) : '') + '"></span></label><label class="campo"><span>Data</span><input class="entrada" type="date" name="data" value="' + hoje() + '"></label></div>' +
    '<label class="campo"><span>' + (guardar ? 'Onde guardou (opcional)' : 'Para quê (opcional)') + '</span><input class="entrada" name="obs" placeholder="' + (guardar ? 'Ex.: poupança' : 'Ex.: forno novo') + '"></label>' +
    (!guardar ? '<p class="mudo">Disponível na reserva: ' + C.brl(rv.saldo) + '.</p>' : '') +
    '<div class="rodape-folha"><button type="button" class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit">' + (guardar ? 'Registrar que guardei' : 'Registrar uso') + '</button></div></form>';
  abrirFolha(guardar ? 'Guardar na reserva' : 'Usar da reserva', corpo, function (d) {
    const f = $('#f-res', d);
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const v = C.lerNum(f.valor.value);
      if (!(v > 0)) { toast('Informe o valor.'); return; }
      if (!guardar && v > rv.saldo + 0.004 && !confirm('O valor passa do que está na reserva (' + C.brl(rv.saldo) + '). Registrar mesmo assim?')) return;
      gravarRegistro('lancamentos', { id: uid(), tipo: 'reserva', data: f.data.value || hoje(), valor: C.round2(guardar ? v : -v), categoria: 'Reserva', descricao: f.obs.value.trim() || 'Reserva', forma: '', obs: '', itensCompra: [] });
      d.close(); toast(guardar ? 'Registrado na reserva.' : 'Uso da reserva registrado.'); render(false);
    });
  });
}

// Ações dos botões desta parte (data-acao="...")
export const ACOES_PROLABORE = {
  'reserva-mov': function (el) { folhaReserva(el.dataset.v); },
  retirar: folhaRetirada,
  'reserva-rem': async function (el) {
    const l = S.dados.lancamentos[el.dataset.id]; if (!l) return;
    if (!await confirmar('Remover registro?', 'Remover ' + (l.valor > 0 ? 'o depósito' : 'o uso') + ' de ' + C.brl(Math.abs(l.valor)) + ' de ' + dataDia(l.data) + '.', 'Remover', true)) return;
    excluirRegistro('lancamentos', l.id); toast('Registro removido.'); render(false);
  }
};
