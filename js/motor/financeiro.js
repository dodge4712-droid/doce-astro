// Motor: Contas a pagar, a receber, reserva.
// Funções puras: não tocam na tela, na rede nem no armazenamento.
import { FONTE_CONTAS_FIXAS } from './caixa.js';
import { mesclarConfig } from './config.js';
import { dataISO, diasEntre, round2 } from './datas.js';
import { brl, num, numOk, pct } from './numeros.js';
import { calcularPedido } from './pedidos.js';
import { semAcento } from './texto.js';

// ---------- Financeiro ----------
export function mesDe(iso) { return String(iso || '').slice(0, 7); }
export function somarMeses(mes, n) { const [y, m] = mes.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); }
export function limitesMes(mes) { const [y, m] = mes.split('-').map(Number); return { de: mes + '-01', ate: dataISO(new Date(y, m, 0)) }; }
export function nomeMes(mes, curto) {
  const [y, m] = mes.split('-').map(Number);
  const n = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'][m - 1];
  return curto ? n.slice(0, 3) + '/' + String(y).slice(2) : n + ' de ' + y;
}
// Média das "Contas fixas" pagas nos últimos 3 meses completos (só meses com lançamento)
export function mediaContasFixas(lancamentos, hoje) {
  const atual = mesDe(hoje), meses = [somarMeses(atual, -3), somarMeses(atual, -2), somarMeses(atual, -1)];
  const tot = {}; meses.forEach(m => { tot[m] = 0; });
  const itens = {};
  (lancamentos || []).forEach(function (l) {
    if (l.excluidoEm || l.tipo !== 'saida' || !numOk(l.valor) || semAcento(l.categoria) !== semAcento(FONTE_CONTAS_FIXAS)) return;
    const m = mesDe(l.data); if (!(m in tot)) return;
    tot[m] += l.valor;
    const k = (l.descricao || 'Sem descrição').trim(); itens[k] = (itens[k] || 0) + l.valor;
  });
  const com = meses.filter(m => tot[m] > 0);
  if (!com.length) return { media: null, meses: meses.map(m => ({ mes: m, total: 0 })), considerados: 0, itens: [] };
  return {
    media: round2(com.reduce((s, m) => s + tot[m], 0) / com.length), considerados: com.length,
    meses: meses.map(m => ({ mes: m, total: round2(tot[m]) })),
    itens: Object.keys(itens).map(k => ({ descricao: k, media: round2(itens[k] / com.length) })).sort((a, b) => b.media - a.media)
  };
}
// Contas a pagar: "paga" quando o lançamento ligado a ela existe no Caixa
export function statusConta(c, lancamentos, hoje) {
  const l = c.lancamentoId && lancamentos[c.lancamentoId];
  if (l && !l.excluidoEm) return { status: 'paga', pagaEm: l.data, valorPago: l.valor };
  const d = diasEntre(hoje, c.vencimento);
  return { status: d < 0 ? 'vencida' : d === 0 ? 'hoje' : 'aberta', dias: d };
}
export function vencimentoNoMes(mes, dia) {
  const ultimo = Number(limitesMes(mes).ate.slice(8));
  return mes + '-' + String(Math.min(Math.max(1, dia || 1), ultimo)).padStart(2, '0');
}
// Recorrentes: cria a conta de cada mês (do início até o mês atual, no máximo 3 meses para trás).
// O id é fixo por recorrência e mês, então dois aparelhos nunca criam a mesma conta duas vezes.
export function contasRecorrentesAGerar(recorrencias, contasExistentes, hoje) {
  const atual = mesDe(hoje), novas = [];
  (recorrencias || []).forEach(function (r) {
    if (r.excluidoEm || r.ativa === false || !r.inicio) return;
    let m = r.inicio > somarMeses(atual, -2) ? r.inicio : somarMeses(atual, -2);
    while (m <= atual && (!r.fim || m <= r.fim)) {
      const id = 'rec:' + r.id + ':' + m;
      if (!contasExistentes[id]) novas.push({ id: id, descricao: r.descricao, categoria: r.categoria || FONTE_CONTAS_FIXAS, valor: r.valor, vencimento: vencimentoNoMes(m, r.dia), recorrenciaId: r.id, competencia: m, lancamentoId: '', obs: '' });
      m = somarMeses(m, 1);
    }
  });
  return novas;
}
// A receber (fiado): o que falta pagar em pedidos, por cliente
export function aReceber(pedidos, ctx, nomeDoPedido) {
  const grupos = {};
  let entregue = 0, aberto = 0;
  (pedidos || []).forEach(function (p) {
    if (p.excluidoEm || ['cancelado', 'orcamento'].indexOf(p.status) >= 0) return;
    const c = calcularPedido(p, ctx);
    if (!(c.restante > 0.004)) return;
    const k = p.clienteId || ('nome:' + (p.clienteNome || ''));
    const g = grupos[k] || (grupos[k] = { clienteId: p.clienteId, nome: nomeDoPedido ? nomeDoPedido(p) : p.clienteNome, total: 0, entregue: 0, itens: [] });
    g.total += c.restante;
    if (p.status === 'entregue') { g.entregue += c.restante; entregue += c.restante; } else aberto += c.restante;
    g.itens.push({ pedidoId: p.id, data: p.dataEntrega, status: p.status, total: c.total, restante: c.restante, resumo: (p.itens || []).map(it => num(it.qtd) + 'x ' + (it.nome || 'Item')).join(', ') });
  });
  const lst = Object.values(grupos).map(g => Object.assign(g, { total: round2(g.total), entregue: round2(g.entregue), itens: g.itens.sort((a, b) => String(a.data).localeCompare(String(b.data))) }))
    .sort((a, b) => b.entregue - a.entregue || b.total - a.total);
  return { grupos: lst, entregue: round2(entregue), aberto: round2(aberto) };
}
export function textoCobranca(grupo, cfg, hoje) {
  const c = mesclarConfig(cfg), nome = String(grupo.nome || '').trim().split(/\s+/)[0];
  const its = grupo.itens.filter(i => i.status === 'entregue');
  const lista = (its.length ? its : grupo.itens).map(i => '• Pedido de ' + (i.data ? i.data.split('-').reverse().slice(0, 2).join('/') : '') + ': falta ' + brl(i.restante)).join('\n');
  const total = its.length ? grupo.entregue : grupo.total;
  return 'Olá' + (nome ? ', ' + nome : '') + ', tudo bem? Passando para lembrar do valor em aberto:\n\n' + lista + '\n\n*Total: ' + brl(total) + '*\n\nPode ser por Pix ou como preferir. Qualquer dúvida, é só chamar!\n\n' + (c.doceria.nome || 'Doce Astro') + (c.doceria.instagram ? '\n' + c.doceria.instagram : '');
}
// Reserva: depósitos (+) e resgates (−) ficam em lançamentos do tipo "reserva"
export function resumoReserva(lancamentos, cfg, mes, entradasMes) {
  const c = mesclarConfig(cfg);
  let saldo = 0, guardadoMes = 0;
  const hist = [];
  (lancamentos || []).forEach(function (l) {
    if (l.excluidoEm || l.tipo !== 'reserva' || !numOk(l.valor)) return;
    saldo += l.valor; hist.push(l);
    if (mesDe(l.data) === mes && l.valor > 0) guardadoMes += l.valor;
  });
  const pct = numOk(c.reservaPct) ? c.reservaPct : 0;
  const sugerido = round2((entradasMes || 0) * pct / 100);
  return { saldo: round2(saldo), pct: pct, sugeridoMes: sugerido, guardadoMes: round2(guardadoMes), faltaGuardar: round2(Math.max(0, sugerido - guardadoMes)),
    meta: numOk(c.reservaMeta) && c.reservaMeta > 0 ? c.reservaMeta : null, historico: hist.sort((a, b) => String(b.data).localeCompare(String(a.data))) };
}
export function proLaboreDesejado(cfg) {
  const c = mesclarConfig(cfg), m = c.maoObra || {};
  if (m.modo === 'salario') return numOk(m.salario) ? m.salario : null;
  return numOk(m.valorHora) && numOk(m.horasTrabalhadas) ? m.valorHora * m.horasTrabalhadas : null;
}
