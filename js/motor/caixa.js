// Motor: Caixa: entradas, saídas, filtros, períodos e CSV.
// Funções puras: não tocam na tela, na rede nem no armazenamento.
import { dataISO, diasEntre, paraData, round2, somarDias } from './datas.js';
import { numOk } from './numeros.js';
import { celulaCSV, semAcento } from './texto.js';

// ---------- Caixa: entradas e saídas ----------
export const FORMAS_LANCAMENTO = {
  pix: 'Pix', dinheiro: 'Dinheiro', debito: 'Cartão de débito', credito: 'Cartão de crédito',
  app: 'Aplicativo de entrega', boleto: 'Boleto ou transferência'
};
export const FONTE_PEDIDOS = 'Pedidos';
export const ORIGENS_PADRAO = ['Venda de balcão', 'iFood / aplicativo', 'Encomenda fora do app', 'Outras entradas'];
export const FONTE_PROLABORE = 'Pró-labore';
export const FONTE_CONTAS_FIXAS = 'Contas fixas';
export const CATEGORIAS_PADRAO = ['Ingredientes', 'Embalagens', 'Contas fixas', 'Equipamentos e utensílios', 'Entrega e transporte', 'Taxas e tarifas', 'Marketing', 'Pró-labore', 'Outras saídas'];
// Junta os pagamentos dos pedidos (entradas automáticas) com os lançamentos feitos à mão.
export function movimentos(pedidos, lancamentos, nomeDoPedido) {
  const lst = [];
  (pedidos || []).forEach(function (p) {
    if (p.excluidoEm) return;
    (p.pagamentos || []).forEach(function (pg) {
      if (!numOk(pg.valor) || !pg.data) return;
      lst.push({
        id: 'pg:' + p.id + ':' + (pg.id || pg.data), tipo: 'entrada', data: pg.data, valor: pg.valor,
        descricao: (pg.tipo === 'sinal' ? 'Sinal' : 'Pagamento') + ' do pedido de ' + (nomeDoPedido ? nomeDoPedido(p) : (p.clienteNome || 'cliente')),
        fonte: FONTE_PEDIDOS, forma: pg.forma || '', pedidoId: p.id, pedidoCancelado: p.status === 'cancelado', automatico: true
      });
    });
  });
  (lancamentos || []).forEach(function (l) {
    if (l.excluidoEm || !numOk(l.valor) || !l.data || l.tipo === 'reserva') return;
    lst.push({
      id: l.id, tipo: l.tipo === 'saida' ? 'saida' : 'entrada', data: l.data, valor: l.valor,
      descricao: l.descricao || l.categoria || '', fonte: l.categoria || (l.tipo === 'saida' ? 'Outras saídas' : 'Outras entradas'),
      forma: l.forma || '', lancamentoId: l.id, nItensCompra: (l.itensCompra || []).length
    });
  });
  return lst.sort((a, b) => String(b.data).localeCompare(String(a.data)) || String(a.descricao).localeCompare(String(b.descricao)));
}
// filtro: { de, ate, tipo: 'todos'|'entrada'|'saida', fontes: [], busca }
export function filtrarMovimentos(lst, f) {
  f = f || {};
  const fontes = (f.fontes || []).map(semAcento);
  const q = semAcento(f.busca);
  return lst.filter(m =>
    (!f.de || m.data >= f.de) && (!f.ate || m.data <= f.ate) &&
    (!f.tipo || f.tipo === 'todos' || m.tipo === f.tipo) &&
    (!fontes.length || fontes.indexOf(semAcento(m.fonte)) >= 0) &&
    (!q || semAcento(m.descricao + ' ' + m.fonte).indexOf(q) >= 0));
}
export function resumoCaixa(lst) {
  const r = { entradas: 0, saidas: 0, retiradas: 0, despesas: 0, saldo: 0, n: lst.length, porFonte: { entrada: {}, saida: {} } };
  lst.forEach(function (m) {
    if (m.tipo === 'entrada') r.entradas += m.valor; else { r.saidas += m.valor; if (semAcento(m.fonte) === semAcento(FONTE_PROLABORE)) r.retiradas += m.valor; }
    const pf = r.porFonte[m.tipo];
    pf[m.fonte] = (pf[m.fonte] || 0) + m.valor;
  });
  r.entradas = round2(r.entradas); r.saidas = round2(r.saidas); r.retiradas = round2(r.retiradas);
  r.despesas = round2(r.saidas - r.retiradas); r.saldo = round2(r.entradas - r.saidas); r.lucro = round2(r.entradas - r.despesas);
  return r;
}
export function periodoPreset(preset, hoje) {
  const [y, m] = hoje.split('-').map(Number);
  const fimMes = (yy, mm) => dataISO(new Date(yy, mm, 0));
  switch (preset) {
    case 'hoje': return { de: hoje, ate: hoje };
    case '7dias': return { de: somarDias(hoje, -6), ate: hoje };
    case '30dias': return { de: somarDias(hoje, -29), ate: hoje };
    case 'mesPassado': { const d = new Date(y, m - 2, 1); return { de: dataISO(d), ate: fimMes(d.getFullYear(), d.getMonth() + 1) }; }
    case 'ano': return { de: y + '-01-01', ate: y + '-12-31' };
    default: return { de: hoje.slice(0, 8) + '01', ate: fimMes(y, m) }; // mês atual
  }
}
// Agrupa por dia (até 31 dias), semana (até ~6 meses) ou mês, para o gráfico.
export function agruparPeriodo(lst, de, ate) {
  const dias = diasEntre(de, ate) + 1;
  const modo = dias <= 31 ? 'dia' : dias <= 186 ? 'semana' : 'mes';
  const baldes = [], idx = {};
  function chave(iso) {
    if (modo === 'dia') return iso;
    if (modo === 'mes') return iso.slice(0, 7);
    const d = paraData(iso); d.setDate(d.getDate() - d.getDay()); return dataISO(d); // semana começa no domingo
  }
  let cur = de;
  while (cur <= ate) {
    const k = chave(cur);
    if (!(k in idx)) {
      idx[k] = baldes.length;
      const d = paraData(cur);
      const rot = modo === 'mes' ? ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][d.getMonth()] + (de.slice(0, 4) !== ate.slice(0, 4) ? '/' + String(d.getFullYear()).slice(2) : '')
        : String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
      baldes.push({ chave: k, rotulo: rot, entradas: 0, saidas: 0 });
    }
    cur = somarDias(cur, 1);
  }
  lst.forEach(function (m) {
    if (m.data < de || m.data > ate) return;
    const b = baldes[idx[chave(m.data)]]; if (!b) return;
    if (m.tipo === 'entrada') b.entradas += m.valor; else b.saidas += m.valor;
  });
  return { modo: modo, baldes: baldes };
}
export function csvMovimentos(lst) {
  const c = celulaCSV;
  const linhas = [['Data', 'Tipo', 'Fonte', 'Descrição', 'Forma de pagamento', 'Valor'].join(';')];
  lst.slice().sort((a, b) => String(a.data).localeCompare(String(b.data))).forEach(function (m) {
    linhas.push([c(m.data.split('-').reverse().join('/')), m.tipo === 'entrada' ? 'Entrada' : 'Saída', c(m.fonte), c(m.descricao),
      c(FORMAS_LANCAMENTO[m.forma] || m.forma || ''), c(((m.tipo === 'saida' ? -1 : 1) * m.valor).toFixed(2).replace('.', ','))].join(';'));
  });
  return '\ufeff' + linhas.join('\r\n');
}
