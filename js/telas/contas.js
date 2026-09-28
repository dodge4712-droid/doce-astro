// Tela Caixa → A pagar: contas avulsas, contas de todo mês e pagamento.
import * as C from '../motor/index.js';
import { S, lista } from '../nucleo/estado.js';
import { I } from '../nucleo/icones.js';
import { abas, abrirFolha, cab, confirmar, toast } from '../nucleo/interface.js';
import { excluirRegistro, gravarRegistro } from '../nucleo/registros.js';
import { render } from '../nucleo/rotas.js';
import { $, clone, dataDia, esc, hoje, inNum, uid } from '../nucleo/util.js';
import { fonteCanonica, fontesConhecidas } from '../servicos/caixa.js';
import { gerarContasRecorrentes } from '../servicos/financeiro.js';
import { ABAS_CX } from './caixa.js';

// ---------- Contas a pagar ----------
export function chipConta(st) {
  if (st.status === 'paga') return '<span class="chip pos">' + I.ok + 'paga em ' + dataDia(st.pagaEm) + '</span>';
  if (st.status === 'vencida') return '<span class="chip neg">' + I.alerta + (st.dias === -1 ? 'venceu ontem' : 'venceu há ' + (-st.dias) + ' dias') + '</span>';
  if (st.status === 'hoje') return '<span class="chip alerta">' + I.alerta + 'vence hoje</span>';
  return '<span class="chip ' + (st.dias <= 3 ? 'alerta' : 'mudo') + '">' + (st.dias === 1 ? 'vence amanhã' : 'vence em ' + st.dias + ' dias') + '</span>';
}
export function cardConta(x) {
  const c = x.c, st = x.st, paga = st.status === 'paga';
  return '<div class="item conta"><div class="principal"><div class="nome">' + esc(c.descricao || 'Conta') + '</div><div class="det">' + esc(c.categoria || '') + ', vence ' + dataDia(c.vencimento) + (c.recorrenciaId ? ', todo mês' : '') + '</div></div>' +
    '<div class="valor">' + C.brl(paga ? st.valorPago : c.valor) + '</div>' +
    '<div class="chips">' + chipConta(st) + '</div>' +
    '<div class="acoes acoes-conta">' + (paga ? '<button type="button" class="btn sec fino" data-acao="desfazer-conta" data-id="' + esc(c.id) + '">Desfazer pagamento</button>' : '<button type="button" class="btn fino" data-acao="pagar-conta" data-id="' + esc(c.id) + '">Pagar</button>') +
    '<button type="button" class="btn sec fino" data-acao="editar-conta" data-id="' + esc(c.id) + '">Editar</button></div></div>';
}
export function telaContas() {
  gerarContasRecorrentes();
  const hj = hoje(), L = S.dados.lancamentos;
  const contas = lista('contasPagar').map(c => ({ c: c, st: C.statusConta(c, L, hj) }));
  const recs = lista('recorrencias').sort((a, b) => (a.dia || 0) - (b.dia || 0));
  let h = cab('Contas a pagar', 'As recorrentes (aluguel, luz, internet) aparecem sozinhas todo mês. Ao pagar, a saída vai para o Movimento.',
    '<button type="button" class="btn sec" data-acao="nova-recorrente">' + I.mais + 'Conta de todo mês</button><button type="button" class="btn" data-acao="nova-conta">' + I.mais + 'Nova conta</button>') + abas(ABAS_CX, '#/contas');
  if (!contas.length && !recs.length) return h + '<div class="bloco vazio">' + I.emblema + '<h2>Nenhuma conta ainda</h2><p>Cadastre as contas de todo mês uma vez só; o app cria a conta de cada mês e avisa perto do vencimento.</p><div class="acoes" style="justify-content:center"><button type="button" class="btn" data-acao="nova-recorrente">' + I.mais + 'Conta de todo mês</button><button type="button" class="btn sec" data-acao="nova-conta">' + I.mais + 'Conta avulsa</button></div></div>';
  const abertas = contas.filter(x => x.st.status !== 'paga').sort((a, b) => String(a.c.vencimento).localeCompare(String(b.c.vencimento)));
  const vencidas = abertas.filter(x => x.st.status === 'vencida');
  const semana = abertas.filter(x => x.st.status === 'hoje' || (x.st.dias > 0 && x.st.dias <= 7));
  const depois = abertas.filter(x => x.st.dias > 7);
  const pagas = contas.filter(x => x.st.status === 'paga' && x.st.pagaEm >= C.somarDias(hj, -45)).sort((a, b) => String(b.st.pagaEm).localeCompare(String(a.st.pagaEm)));
  const soma = lst => lst.reduce((s, x) => s + (x.c.valor || 0), 0);
  const mesAtual = hj.slice(0, 7), doMes = abertas.filter(x => String(x.c.vencimento).slice(0, 7) === mesAtual);
  h += '<div class="stats stats-cx"><div class="stat"><div class="r">Vencidas</div><div class="n' + (vencidas.length ? ' neg-txt' : '') + '">' + C.brl(soma(vencidas)) + '</div></div>' +
    '<div class="stat"><div class="r">Próximos 7 dias</div><div class="n">' + C.brl(soma(semana)) + '</div></div>' +
    '<div class="stat"><div class="r">Em aberto em ' + C.nomeMes(mesAtual).split(' ')[0] + '</div><div class="n">' + C.brl(soma(doMes)) + '</div></div></div>';
  const bloco = (t, lst, extra) => lst.length ? '<section class="bloco"><h2>' + t + '</h2>' + (extra || '') + '<div class="lista">' + lst.map(cardConta).join('') + '</div></section>' : '';
  h += bloco('Vencidas', vencidas) + bloco('Vencem nos próximos 7 dias', semana) + bloco('Mais adiante', depois);
  if (!abertas.length) h += '<div class="aviso pos" style="margin-bottom:16px">' + I.ok + '<div class="txt">Nenhuma conta em aberto.</div></div>';
  h += bloco('Pagas nos últimos 45 dias', pagas);
  h += '<details class="bloco mais-filtros"' + (recs.length && !contas.length ? ' open' : '') + '><summary><span>Contas de todo mês (' + recs.filter(r => r.ativa !== false).length + ' ativas)</span></summary>' +
    (recs.length ? '<div class="lista">' + recs.map(r => '<button type="button" class="item" data-acao="editar-recorrente" data-id="' + esc(r.id) + '"><div class="principal"><div class="nome">' + esc(r.descricao) + '</div><div class="det">' + esc(r.categoria || '') + ', todo dia ' + r.dia + (r.ativa === false ? ', encerrada' : '') + '</div></div><div class="valor">' + C.brl(r.valor) + '</div></button>').join('') + '</div>' : '<p class="mudo">Nenhuma ainda.</p>') +
    '<button type="button" class="btn sec" style="margin-top:12px" data-acao="nova-recorrente">' + I.mais + 'Conta de todo mês</button></details>';
  return h;
}
export function campoCategoriaSaida(valor) {
  return '<label class="campo"><span>Categoria</span><input class="entrada" name="categoria" list="dl-cat-conta" value="' + esc(valor || '') + '" placeholder="Ex.: Contas fixas" autocomplete="off"><datalist id="dl-cat-conta">' + fontesConhecidas('saida').map(f => '<option value="' + esc(f) + '">').join('') + '</datalist><small>As de "Contas fixas" entram na média dos custos fixos.</small></label>';
}
export function folhaConta(id) {
  const orig = id ? S.dados.contasPagar[id] : null;
  const c = orig ? clone(orig) : { id: uid(), descricao: '', categoria: C.FONTE_CONTAS_FIXAS, valor: null, vencimento: hoje(), lancamentoId: '', obs: '' };
  const rec = c.recorrenciaId && S.dados.recorrencias[c.recorrenciaId];
  const corpo = '<form id="f-conta" style="display:flex;flex-direction:column;gap:12px">' +
    (rec ? '<p class="mudo">Conta de ' + esc(C.nomeMes(c.competencia || String(c.vencimento).slice(0, 7))) + ' de "' + esc(rec.descricao) + '". O que mudar aqui vale só para este mês.</p>' : '') +
    '<label class="campo"><span>Descrição</span><input class="entrada" name="descricao" required value="' + esc(c.descricao) + '" placeholder="Ex.: Conserto da batedeira"></label>' +
    campoCategoriaSaida(c.categoria) +
    '<div class="linha-campos"><label class="campo"><span>Valor</span><span class="com-prefixo"><i>R$</i><input class="entrada num" name="valor" inputmode="decimal" required value="' + inNum(c.valor) + '"></span></label>' +
    '<label class="campo"><span>Vencimento</span><input class="entrada" type="date" name="vencimento" required value="' + esc(c.vencimento) + '"></label></div>' +
    '<label class="campo"><span>Observação</span><input class="entrada" name="obs" value="' + esc(c.obs || '') + '" placeholder="Opcional"></label>' +
    '<div class="rodape-folha">' + (orig ? '<button type="button" class="btn perigo" data-excluir>' + I.lixo + 'Excluir</button>' : '') + '<span style="flex:1"></span><button type="button" class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit">Salvar conta</button></div></form>';
  abrirFolha(orig ? 'Editar conta' : 'Nova conta', corpo, function (d) {
    const f = $('#f-conta', d);
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const v = C.lerNum(f.valor.value);
      if (!f.descricao.value.trim()) { f.descricao.focus(); return; }
      if (!(v > 0)) { toast('Informe o valor.'); return; }
      Object.assign(c, { descricao: f.descricao.value.trim(), categoria: fonteCanonica(f.categoria.value, 'saida') || 'Outras saídas', valor: C.round2(v), vencimento: f.vencimento.value, obs: f.obs.value.trim() });
      gravarRegistro('contasPagar', c); d.close(); toast(orig ? 'Conta salva.' : 'Conta cadastrada.'); render(false);
    });
    const ex = $('[data-excluir]', d);
    if (ex) ex.onclick = async function () {
      if (C.statusConta(orig, S.dados.lancamentos, hoje()).status === 'paga') { toast('Esta conta está paga. Desfaça o pagamento antes de excluir.'); return; }
      d.close();
      if (await confirmar('Excluir conta?', 'Excluir <b>' + esc(orig.descricao) + '</b>.' + (orig.recorrenciaId ? ' Ela não volta a ser criada; os próximos meses continuam normais.' : ''), 'Excluir conta', true)) { excluirRegistro('contasPagar', orig.id); toast('Conta excluída.'); render(false); }
    };
  });
}
export function folhaPagarConta(id) {
  const c = S.dados.contasPagar[id]; if (!c) return;
  const rec = c.recorrenciaId && S.dados.recorrencias[c.recorrenciaId];
  const corpo = '<form id="f-pagar" style="display:flex;flex-direction:column;gap:12px"><p><b>' + esc(c.descricao) + '</b>, vence ' + dataDia(c.vencimento) + '</p>' +
    '<div class="linha-campos"><label class="campo"><span>Valor pago</span><span class="com-prefixo"><i>R$</i><input class="entrada num" name="valor" inputmode="decimal" required value="' + inNum(c.valor) + '"></span>' + (rec && rec.variavel ? '<small>Esta conta varia todo mês: confira o valor.</small>' : '') + '</label>' +
    '<label class="campo"><span>Data do pagamento</span><input class="entrada" type="date" name="data" required value="' + hoje() + '"></label></div>' +
    '<label class="campo"><span>Forma</span><select class="entrada" name="forma">' + Object.keys(C.FORMAS_LANCAMENTO).map(k => '<option value="' + k + '"' + (k === 'boleto' ? ' selected' : '') + '>' + C.FORMAS_LANCAMENTO[k] + '</option>').join('') + '</select></label>' +
    '<p class="mudo">A saída vai para o Movimento do Caixa, na categoria "' + esc(c.categoria) + '".</p>' +
    '<div class="rodape-folha"><button type="button" class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit">Registrar pagamento</button></div></form>';
  abrirFolha('Pagar conta', corpo, function (d) {
    const f = $('#f-pagar', d);
    f.valor.select();
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const v = C.lerNum(f.valor.value);
      if (!(v > 0)) { toast('Informe o valor pago.'); return; }
      const l = { id: uid(), tipo: 'saida', data: f.data.value || hoje(), valor: C.round2(v), categoria: c.categoria, descricao: c.descricao, forma: f.forma.value, obs: '', itensCompra: [], contaId: c.id };
      gravarRegistro('lancamentos', l);
      const nc = clone(c); nc.lancamentoId = l.id; gravarRegistro('contasPagar', nc);
      d.close(); toast('Conta paga. A saída está no Movimento.'); render(false);
    });
  });
}
export function folhaRecorrente(id) {
  const orig = id ? S.dados.recorrencias[id] : null;
  const r = orig ? clone(orig) : { id: uid(), descricao: '', categoria: C.FONTE_CONTAS_FIXAS, valor: null, dia: 10, inicio: hoje().slice(0, 7), ativa: true, variavel: false };
  const corpo = '<form id="f-rec" style="display:flex;flex-direction:column;gap:12px">' +
    '<label class="campo"><span>Descrição</span><input class="entrada" name="descricao" required value="' + esc(r.descricao) + '" placeholder="Ex.: Aluguel"></label>' +
    campoCategoriaSaida(r.categoria) +
    '<div class="linha-campos"><label class="campo"><span>Valor ' + (orig ? '' : 'de cada mês') + '</span><span class="com-prefixo"><i>R$</i><input class="entrada num" name="valor" inputmode="decimal" required value="' + inNum(r.valor) + '"></span></label>' +
    '<label class="campo"><span>Vence todo dia</span><input class="entrada num" name="dia" inputmode="numeric" required value="' + (r.dia || '') + '"></label></div>' +
    '<label class="chave"><span class="rot">O valor muda todo mês<small>Luz, água, gás: ao pagar, o app pede para conferir o valor</small></span><input type="checkbox" name="variavel"' + (r.variavel ? ' checked' : '') + '></label>' +
    (!orig ? '<p class="aviso" id="aviso-rec" hidden></p>' : '') +
    (!orig ? '<label class="campo"><span>Começa</span><select class="entrada" name="inicio"><option value="' + hoje().slice(0, 7) + '">Neste mês (' + esc(C.nomeMes(hoje().slice(0, 7))) + ')</option><option value="' + C.somarMeses(hoje().slice(0, 7), 1) + '">No mês que vem</option></select></label>' : '') +
    (orig && r.ativa === false ? '<div class="aviso">' + I.alerta + '<div class="txt">Encerrada' + (r.fim ? ' em ' + esc(C.nomeMes(r.fim)) : '') + '. <button type="button" class="link-btn" data-reativar>Reativar</button></div></div>' : '') +
    '<div class="rodape-folha">' + (orig && r.ativa !== false ? '<button type="button" class="btn perigo" data-encerrar>Encerrar</button>' : '') + '<span style="flex:1"></span><button type="button" class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit">Salvar</button></div></form>';
  abrirFolha(orig ? 'Conta de todo mês' : 'Nova conta de todo mês', corpo, function (d) {
    const f = $('#f-rec', d);
    const aviso = $('#aviso-rec', d);
    function conferirDia() {
      if (!aviso) return;
      const dia = Math.round(C.lerNum(f.dia.value)), diaHoje = Number(hoje().slice(8));
      const passou = f.inicio.value === hoje().slice(0, 7) && dia >= 1 && dia < diaHoje;
      aviso.hidden = !passou;
      if (passou) aviso.textContent = 'O dia ' + dia + ' deste mês já passou: a conta de ' + C.nomeMes(hoje().slice(0, 7)).split(' ')[0] + ' vai aparecer como vencida. Se ela já foi paga, escolha "No mês que vem" ou marque como paga depois.';
    }
    if (aviso) { f.addEventListener('input', conferirDia); f.addEventListener('change', conferirDia); conferirDia(); }
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const v = C.lerNum(f.valor.value), dia = Math.round(C.lerNum(f.dia.value));
      if (!f.descricao.value.trim()) { f.descricao.focus(); return; }
      if (!(v > 0)) { toast('Informe o valor.'); return; }
      if (!(dia >= 1 && dia <= 31)) { toast('O dia do vencimento vai de 1 a 31.'); return; }
      Object.assign(r, { descricao: f.descricao.value.trim(), categoria: fonteCanonica(f.categoria.value, 'saida') || C.FONTE_CONTAS_FIXAS, valor: C.round2(v), dia: dia, variavel: f.variavel.checked });
      if (!orig) r.inicio = f.inicio.value;
      gravarRegistro('recorrencias', r);
      // a conta deste mês, se ainda não foi paga, acompanha a mudança
      const doMes = S.dados.contasPagar['rec:' + r.id + ':' + hoje().slice(0, 7)];
      if (orig && doMes && !doMes.excluidoEm && C.statusConta(doMes, S.dados.lancamentos, hoje()).status !== 'paga') {
        const nc = clone(doMes); Object.assign(nc, { descricao: r.descricao, categoria: r.categoria, valor: r.valor, vencimento: C.vencimentoNoMes(nc.competencia, r.dia) }); gravarRegistro('contasPagar', nc);
      }
      gerarContasRecorrentes(true);
      d.close(); toast(orig ? 'Conta de todo mês salva.' : 'Pronto: a conta de cada mês vai aparecer sozinha.'); render(false);
    });
    const enc = $('[data-encerrar]', d);
    if (enc) enc.onclick = async function () {
      d.close();
      if (!await confirmar('Encerrar esta conta?', 'O app para de criar <b>' + esc(orig.descricao) + '</b> a partir do mês que vem. As contas já criadas continuam.', 'Encerrar', true)) return;
      const nr = clone(orig); nr.ativa = false; nr.fim = hoje().slice(0, 7); gravarRegistro('recorrencias', nr); toast('Conta encerrada.'); render(false);
    };
    const re = $('[data-reativar]', d);
    if (re) re.onclick = function () { const nr = clone(orig); nr.ativa = true; delete nr.fim; gravarRegistro('recorrencias', nr); gerarContasRecorrentes(true); d.close(); toast('Reativada.'); render(false); };
  });
}
// ---------- Início: contas perto do vencimento ----------
export function blocoContasInicio() {
  const hj = hoje();
  const lst = lista('contasPagar').map(c => ({ c: c, st: C.statusConta(c, S.dados.lancamentos, hj) }))
    .filter(x => x.st.status === 'vencida' || x.st.status === 'hoje' || (x.st.status === 'aberta' && x.st.dias <= 3))
    .sort((a, b) => String(a.c.vencimento).localeCompare(String(b.c.vencimento)));
  if (!lst.length) return '';
  return '<section class="bloco"><div class="cab-bloco"><h2>Contas a pagar</h2><a class="link-btn" href="#/contas">Ver todas</a></div><div class="lista">' +
    lst.slice(0, 6).map(x => '<a class="item" href="#/contas"><div class="principal"><div class="nome">' + esc(x.c.descricao) + '</div><div class="det">vence ' + dataDia(x.c.vencimento) + '</div></div><div class="valor">' + C.brl(x.c.valor) + '</div><div class="chips">' + chipConta(x.st) + '</div></a>').join('') + '</div></section>';
}

// Ações dos botões desta parte (data-acao="...")
export const ACOES_CONTAS = {
  'nova-conta': function () { folhaConta(null); },
  'editar-conta': function (el) { folhaConta(el.dataset.id); },
  'pagar-conta': function (el) { folhaPagarConta(el.dataset.id); },
  'desfazer-conta': async function (el) {
    const c = S.dados.contasPagar[el.dataset.id]; if (!c) return;
    if (!await confirmar('Desfazer pagamento?', 'A conta volta a ficar em aberto e a saída de ' + C.brl((S.dados.lancamentos[c.lancamentoId] || {}).valor) + ' sai do Movimento.', 'Desfazer pagamento', true)) return;
    if (c.lancamentoId && S.dados.lancamentos[c.lancamentoId]) excluirRegistro('lancamentos', c.lancamentoId);
    const nc = clone(c); nc.lancamentoId = ''; gravarRegistro('contasPagar', nc); toast('Pagamento desfeito.'); render(false);
  },
  'nova-recorrente': function () { folhaRecorrente(null); },
  'editar-recorrente': function (el) { folhaRecorrente(el.dataset.id); }
};
