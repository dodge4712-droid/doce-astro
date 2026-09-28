// Vitrine: colocar, vender (à vista ou fiado), perda e editar.
import * as C from '../motor/index.js';
import { S, cfg, ctxCalc, lista } from '../nucleo/estado.js';
import { abrirFolha, toast } from '../nucleo/interface.js';
import { gravarRegistro } from '../nucleo/registros.js';
import { render } from '../nucleo/rotas.js';
import { $, $$, agoraISO, dataDia, esc, hoje, inNum, uid } from '../nucleo/util.js';
import { fonteCanonica } from '../servicos/caixa.js';
import { colocarNaVitrine, modoEstoque, movsEstoque, nomeVitrine, registrarMov, saldos } from '../servicos/estoque.js';
import { calcPed } from '../servicos/pedidos.js';
import { htmlHistorico, ligarDesfazer } from './estoque.js';

export function folhaItemVitrine(item, acaoInicial) {
  const sd = saldos()[item], st = C.situacaoEstoque(sd, 0, hoje(), cfg().diasAlertaValidade);
  const hist = movsEstoque().filter(m => m.item === item).sort((a, b) => String(b.data).localeCompare(String(a.data)) || String(b.criadoEm || '').localeCompare(String(a.criadoEm || ''))).slice(0, 10);
  let acao = acaoInicial || 'ajuste';
  const un = q => C.num(q) + (q === 1 ? ' un' : ' un');
  const corpo = '<div class="stats" style="margin:0"><div class="stat"><div class="r">Na vitrine</div><div class="n' + (st.negativo ? ' neg-txt' : '') + '">' + (sd ? C.num(st.qtd) : '0') + '</div></div><div class="stat"><div class="r">Validade</div><div class="n" style="font-size:18px">' + (st.validade ? dataDia(st.validade) : '—') + '</div></div></div>' +
    '<div class="seg" role="group" aria-label="O que registrar">' + [['ajuste', 'Contagem'], ['vitrine', 'Colocar mais'], ['perda', 'Perda']].map(x => '<button type="button" data-ac="' + x[0] + '" aria-pressed="' + (x[0] === acao) + '">' + x[1] + '</button>').join('') + '</div>' +
    '<form id="f-itvit" style="display:flex;flex-direction:column;gap:12px"><p class="mudo" id="exp-itvit"></p>' +
    '<label class="campo"><span id="rot-itvit">Quantas tem agora</span><input class="entrada num" name="qtd" inputmode="decimal" required></label>' +
    '<label class="campo" id="val-itvit"><span>Validade</span><input class="entrada" type="date" name="validade" value="' + esc(st.validade || '') + '"><small id="dica-val"></small></label>' +
    '<label class="campo"><span>Observação</span><input class="entrada" name="obs" placeholder="Opcional"></label>' +
    '<div class="rodape-folha"><button type="button" class="btn sec" data-fechar>Fechar</button><button class="btn" type="submit" id="btn-itvit">Registrar</button></div></form>' +
    htmlHistorico(hist, un);
  abrirFolha(nomeVitrine(item), corpo, function (d) {
    const f = $('#f-itvit', d);
    function ajustar() {
      $$('[data-ac]', d).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.ac === acao)));
      $('#rot-itvit', d).textContent = acao === 'ajuste' ? 'Quantas tem agora' : acao === 'vitrine' ? 'Quantas colocou' : 'Quantas perdeu';
      $('#exp-itvit', d).textContent = acao === 'ajuste' ? 'Conte o que está na vitrine. Use também para mudar a validade (mantenha a quantidade) ou para zerar o item.' :
        acao === 'vitrine' ? 'Unidades novas que você fez para a vitrine.' + (modoEstoque() === 'completo' ? ' Os ingredientes usados saem do estoque.' : '') : 'Venceu, quebrou, foi para degustação.';
      $('#val-itvit', d).hidden = acao === 'perda';
      $('#dica-val', d).textContent = acao === 'ajuste' ? 'A validade do que está na vitrine agora.' : acao === 'vitrine' ? 'A validade destas unidades novas.' : '';
      if (acao === 'ajuste' && f.qtd.value === '' && sd) f.qtd.value = inNum(Math.max(0, st.qtd));
      if (acao !== 'ajuste' && sd && f.qtd.value === inNum(Math.max(0, st.qtd))) f.qtd.value = '';
      $('#btn-itvit', d).textContent = acao === 'ajuste' ? 'Registrar contagem' : acao === 'vitrine' ? 'Colocar na vitrine' : 'Registrar perda';
    }
    $$('[data-ac]', d).forEach(b => b.onclick = () => { acao = b.dataset.ac; ajustar(); });
    ajustar();
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const n = C.lerNum(f.qtd.value), atual = sd ? sd.qtd : 0;
      if (!C.numOk(n) || n < 0 || (acao !== 'ajuste' && n === 0)) { toast('Informe uma quantidade válida.'); return; }
      const validade = acao === 'perda' ? '' : f.validade.value, obs = f.obs.value.trim();
      if (acao === 'ajuste') {
        const delta = n - atual, mudouValidade = validade && validade !== (st.validade || '');
        if (Math.abs(delta) < 1e-9 && !mudouValidade) { d.close(); toast('A contagem confere com a vitrine.'); return; }
        if (Math.abs(delta) < 1e-9) gravarRegistro('estoque', { id: uid(), item: item, nome: nomeVitrine(item), qtd: 0, motivo: 'ajuste', data: hoje(), ref: '', validade: validade, obs: obs });
        else registrarMov(item, delta, 'ajuste', { validade: validade, obs: obs });
        toast(Math.abs(delta) < 1e-9 ? 'Validade atualizada.' : n === 0 ? 'Item zerado na vitrine.' : 'Contagem registrada.');
      } else if (acao === 'vitrine') { colocarNaVitrine(item, n, validade, obs); toast('Colocado na vitrine.'); }
      else { registrarMov(item, -n, 'perda', { obs: obs }); toast('Perda registrada.'); }
      d.close(); render(false);
    });
    ligarDesfazer(d);
  });
}
export function folhaVitrine(modo, item) {
  const ctx = ctxCalc();
  const titulo = { add: 'Colocar na vitrine', vender: 'Vender da vitrine', perda: 'Perda na vitrine' }[modo];
  let prodSel = '';
  const ops = [];
  if (modo === 'add') {
    lista('receitas').sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR')).forEach(r => (C.calcularReceita(r, ctx).variacoes || []).forEach(v => ops.push({ r: r, v: v })));
    if (!ops.length) { abrirFolha(titulo, '<p>Cadastre uma receita com opções de venda para colocar na vitrine.</p>'); return; }
    prodSel = '<label class="campo"><span>Produto</span><select class="entrada" name="prod">' + ops.map((o, i) => '<option value="' + i + '">' + esc(o.r.nome + ' (' + (o.v.nome || 'opção') + ')') + '</option>').join('') + '</select></label>';
  }
  const sd = item ? saldos()[item] : null;
  let preco = null;
  if (modo === 'vender') {
    const [, rid, vid] = item.split(':'); const r = S.dados.receitas[rid];
    const v = r && (C.calcularReceita(r, ctx).variacoes || []).find(x => x.id === vid);
    preco = v && C.numOk(v.preco) ? C.round2(v.preco) : null;
  }
  const corpo = '<form id="f-vit" style="display:flex;flex-direction:column;gap:12px">' + (item ? '<p><b>' + esc(nomeVitrine(item)) + '</b>' + (sd ? ', ' + C.num(sd.qtd) + ' na vitrine' : '') + '</p>' : '') + prodSel +
    '<label class="campo"><span>Quantidade</span><input class="entrada num" name="qtd" inputmode="decimal" required value="1"></label>' +
    (modo === 'add' ? '<label class="campo"><span>Validade (opcional)</span><input class="entrada" type="date" name="validade"></label>' + (modoEstoque() === 'completo' ? '<p class="mudo">No modo completo, os ingredientes usados saem do estoque.</p>' : '') : '') +
    (modo === 'vender' ? '<div class="linha-campos"><label class="campo"><span>Preço unitário</span><span class="com-prefixo"><i>R$</i><input class="entrada num" name="preco" inputmode="decimal" required value="' + inNum(preco) + '"></span></label><label class="campo"><span>Forma</span><select class="entrada" name="forma">' + Object.keys(C.FORMAS_LANCAMENTO).map(k => '<option value="' + k + '">' + C.FORMAS_LANCAMENTO[k] + '</option>').join('') + '<option value="__fiado__">Fiado (paga depois)</option></select></label></div>' +
      '<label class="campo" id="campo-cli-vit" hidden><span>Cliente</span><select class="entrada" name="cliente"><option value="">Escolha…</option>' + lista('clientes').sort((x, y) => x.nome.localeCompare(y.nome, 'pt-BR')).map(c => '<option value="' + esc(c.id) + '">' + esc(c.nome) + '</option>').join('') + '</select><small>O valor fica em Caixa → A receber até ela pagar.</small></label>' +
      '<p class="mudo" id="tot-vit"></p><p class="mudo" id="nota-vit">A venda entra no Caixa como "Venda de balcão".</p>' : '') +
    '<div class="rodape-folha"><button type="button" class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit">' + { add: 'Colocar na vitrine', vender: 'Registrar venda', perda: 'Registrar perda' }[modo] + '</button></div></form>';
  abrirFolha(titulo, corpo, function (d) {
    const f = $('#f-vit', d);
    function tot() { const t = $('#tot-vit', d); if (t) t.textContent = 'Total: ' + C.brl((C.lerNum(f.qtd.value) || 0) * (C.lerNum(f.preco.value) || 0)); }
    if (modo === 'vender') {
      f.addEventListener('input', tot); tot();
      f.forma.addEventListener('change', function () { const fi = f.forma.value === '__fiado__'; $('#campo-cli-vit', d).hidden = !fi; $('#nota-vit', d).hidden = fi; });
    }
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const n = C.lerNum(f.qtd.value);
      if (!(n > 0)) { toast('Informe a quantidade.'); return; }
      if (modo === 'add') {
        const o = ops[+f.prod.value], chave = C.chaveVitrine(o.r.id, o.v.id);
        colocarNaVitrine(chave, n, f.validade.value, '');
        toast('Colocado na vitrine.');
      } else if (modo === 'vender') {
        const pu = C.lerNum(f.preco.value);
        if (!(pu > 0)) { toast('Informe o preço.'); return; }
        if (f.forma.value === '__fiado__') {
          const cli = S.dados.clientes[f.cliente.value];
          if (!cli) { toast('Escolha o cliente do fiado.'); return; }
          const [, rid, vid] = item.split(':');
          const ped = { id: uid(), clienteId: cli.id, clienteNome: cli.nome, status: 'entregue', tipoEntrega: 'retirada', dataEntrega: hoje(), horaEntrega: '', endereco: '', taxaEntrega: null,
            itens: [{ id: uid(), tipo: 'rec', receitaId: rid, variacaoId: vid, nome: nomeVitrine(item), qtd: n, precoUnit: pu, maoObraUnit: C.maoObraItemPedido({ tipo: 'rec', receitaId: rid, variacaoId: vid }, ctxCalc()) }], desconto: null, formaPagamento: 'pix', pagamentos: [],
            obs: 'Venda da vitrine no fiado', origem: 'vitrine', historicoStatus: [{ status: 'entregue', em: agoraISO() }] };
          const cp = calcPed(ped); ped.total = cp.total; ped.pago = 0; ped.restante = cp.total; ped.situacaoPagamento = 'pendente';
          gravarRegistro('pedidos', ped);
          registrarMov(item, -n, 'venda', { ref: 'vendaped:' + ped.id, obs: 'Fiado: ' + cli.nome });
          d.close(); toast('Fiado registrado: ' + C.brl(cp.total) + ' em A receber.'); render(false); return;
        }
        const l = { id: uid(), tipo: 'entrada', data: hoje(), valor: C.round2(n * pu), categoria: fonteCanonica('Venda de balcão', 'entrada'), descricao: C.num(n) + 'x ' + nomeVitrine(item) + ' (vitrine)', forma: f.forma.value, obs: '', itensCompra: [], vitrine: { item: item, qtd: n, maoObraUnit: C.maoObraItemPedido({ tipo: 'rec', receitaId: item.split(':')[1], variacaoId: item.split(':')[2] }, ctx) } };
        gravarRegistro('lancamentos', l);
        registrarMov(item, -n, 'venda', { ref: 'venda:' + l.id });
        toast('Venda registrada: ' + C.brl(l.valor) + ' no Caixa.');
      } else {
        registrarMov(item, -n, 'perda', {});
        toast('Perda registrada.');
      }
      d.close(); render(false);
    });
  });
}

// Ações dos botões desta parte (data-acao="...")
export const ACOES_VITRINE = {
  'vitrine-add': function () { folhaVitrine('add'); },
  'vitrine-vender': function (el) { folhaVitrine('vender', el.dataset.v); },
  'vitrine-perda': function (el) { folhaVitrine('perda', el.dataset.v); },
  'vitrine-editar': function (el) { folhaItemVitrine(el.dataset.v); }
};
