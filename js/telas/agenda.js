// Tela Agenda: calendário do mês com os pedidos de cada dia.
import * as C from '../motor/index.js';
import { S, lista } from '../nucleo/estado.js';
import { I, p } from '../nucleo/icones.js';
import { abas, cab } from '../nucleo/interface.js';
import { render } from '../nucleo/rotas.js';
import { MESES, dataCurta, esc, hoje } from '../nucleo/util.js';
import { ABAS_PED, cardPedido, ordemData } from './pedidos.js';

// ---------- Agenda ----------
export function telaAgenda() {
  const A = S.agenda || (S.agenda = { mes: hoje().slice(0, 7), dia: hoje() });
  const [y, m] = A.mes.split('-').map(Number);
  const vazios = new Date(y, m - 1, 1).getDay(), nDias = new Date(y, m, 0).getDate();
  const porDia = {};
  lista('pedidos').filter(p => p.status !== 'cancelado' && p.dataEntrega && p.dataEntrega.slice(0, 7) === A.mes).forEach(p => { (porDia[p.dataEntrega] = porDia[p.dataEntrega] || []).push(p); });
  let h = cab('Agenda', 'Entregas e retiradas por dia.', '<a class="btn" href="#/pedido/novo?data=' + A.dia + '">' + I.mais + 'Novo pedido neste dia</a>') + abas(ABAS_PED, '#/agenda');
  h += '<section class="bloco"><div class="cal-cab"><button type="button" class="btn-icone" data-acao="agenda-mes" data-v="-1" aria-label="Mês anterior">' + I.voltar + '</button><h2>' + MESES[m - 1].charAt(0).toUpperCase() + MESES[m - 1].slice(1) + ' de ' + y + '</h2><button type="button" class="btn-icone" data-acao="agenda-mes" data-v="1" aria-label="Próximo mês">' + I.seta + '</button></div>' +
    '<div class="cal" role="group" aria-label="Dias de ' + MESES[m - 1] + '"><div class="cal-sem" aria-hidden="true">' + ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(x => '<span>' + x + '</span>').join('') + '</div><div class="cal-dias">' +
    '<span></span>'.repeat(vazios) + Array.from({ length: nDias }, function (_, i) {
      const iso = A.mes + '-' + String(i + 1).padStart(2, '0');
      const n = (porDia[iso] || []).length;
      return '<button type="button" class="cal-dia' + (iso === hoje() ? ' hoje' : '') + (iso === A.dia ? ' sel' : '') + '" data-acao="agenda-dia" data-v="' + iso + '" aria-pressed="' + (iso === A.dia) + '" aria-label="' + (i + 1) + ' de ' + MESES[m - 1] + (n ? ', ' + n + (n === 1 ? ' pedido' : ' pedidos') : '') + '"><span>' + (i + 1) + '</span>' + (n ? '<i>' + n + '</i>' : '') + '</button>';
    }).join('') + '</div></div>' +
    (A.mes !== hoje().slice(0, 7) || A.dia !== hoje() ? '<button type="button" class="link-btn" data-acao="agenda-hoje">Voltar para hoje</button>' : '') + '</section>';
  const doDia = lista('pedidos').filter(p => p.dataEntrega === A.dia && p.status !== 'cancelado').sort(ordemData);
  h += '<section class="bloco"><h2>' + esc(dataCurta(A.dia).charAt(0).toUpperCase() + dataCurta(A.dia).slice(1)) + '</h2>' +
    (doDia.length ? '<div class="lista">' + doDia.map(cardPedido).join('') + '</div>' : '<p class="mudo">Nenhum pedido para este dia.</p>') + '</section>';
  return h;
}

// Ações dos botões desta parte (data-acao="...")
export const ACOES_AGENDA = {
  'agenda-dia': function (el) { S.agenda.dia = el.dataset.v; render(false); },
  'agenda-mes': function (el) {
    const [y, m] = S.agenda.mes.split('-').map(Number);
    const d = new Date(y, m - 1 + Number(el.dataset.v), 1);
    S.agenda.mes = C.dataISO(d).slice(0, 7);
    S.agenda.dia = S.agenda.mes === hoje().slice(0, 7) ? hoje() : S.agenda.mes + '-01';
    render(false);
  },
  'agenda-hoje': function () { S.agenda = { mes: hoje().slice(0, 7), dia: hoje() }; render(false); }
};
