// Motor: Textos prontos para WhatsApp.
// Funções puras: não tocam na tela, na rede nem no armazenamento.
import { mesclarConfig } from './config.js';
import { diasEntre, paraData } from './datas.js';
import { brl, num, numOk } from './numeros.js';

// ---------- WhatsApp ----------
export function telefoneWhats(tel) {
  let d = String(tel || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.length === 10 || d.length === 11) d = '55' + d;
  return d.length >= 12 && d.length <= 13 ? d : '';
}
export const DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
export function dataFalada(iso, hoje) {
  const d = paraData(iso); if (!d) return '';
  const dd = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
  const dif = hoje ? diasEntre(hoje, iso) : null;
  if (dif === 0) return 'hoje (' + dd + ')';
  if (dif === 1) return 'amanhã (' + dd + ')';
  return DIAS[d.getDay()] + ', ' + dd;
}
export function horaFalada(h) {
  if (!h) return '';
  const [hh, mm] = h.split(':');
  return Number(hh) + 'h' + (mm && mm !== '00' ? mm : '');
}
export const COMO_PAGOU = { pix: 'no Pix', dinheiro: 'em dinheiro', debito: 'no cartão de débito', credito: 'no cartão de crédito', app: 'pelo aplicativo' };
export function textoWhats(tipo, p, calc, cfg, opc) {
  opc = opc || {};
  const c = mesclarConfig(cfg);
  const nome = String(p.clienteNome || '').trim().split(/\s+/)[0];
  const quando = dataFalada(p.dataEntrega, opc.hoje) + (p.horaEntrega ? ', às ' + horaFalada(p.horaEntrega) : '');
  const ondeTxt = p.tipoEntrega === 'entrega' ? 'Entrega ' + quando + (p.endereco ? '\nEndereço: ' + p.endereco : '') : 'Retirada ' + quando;
  const itens = (p.itens || []).filter(it => numOk(it.qtd) && it.qtd > 0)
    .map(it => '• ' + num(it.qtd) + 'x ' + (it.nome || 'Item') + ': ' + brl(it.qtd * (it.precoUnit || 0))).join('\n');
  const contas = [];
  if (calc.taxaEntrega > 0) contas.push('Taxa de entrega: ' + brl(calc.taxaEntrega));
  if (calc.desconto > 0) contas.push('Desconto: -' + brl(calc.desconto));
  contas.push('*Total: ' + brl(calc.total) + '*');
  const assinatura = '\n\n' + (c.doceria.nome || 'Doce Astro') + (c.doceria.instagram ? '\n' + c.doceria.instagram : '');
  const ola = 'Olá' + (nome ? ', ' + nome : '') + '!';
  const saldo = calc.restante > 0.004 ? 'Falta ' + brl(calc.restante) + ', para pagar ' + (p.tipoEntrega === 'entrega' ? 'na entrega' : 'na retirada') + '.' : 'Pedido quitado.';
  if (tipo === 'orcamento') {
    return ola + ' Segue o orçamento:\n\n' + itens + '\n\n' + contas.join('\n') + '\n\n' + ondeTxt +
      (calc.sinalSugerido > 0 && calc.pago < 0.005 ? '\n\nPara confirmar, o sinal é de ' + brl(calc.sinalSugerido) + ' (' + num(c.sinalPadraoPct) + '%).' : '') +
      '\n\nQualquer dúvida, é só chamar.' + assinatura;
  }
  if (tipo === 'confirmacao') {
    return ola + ' Seu pedido está confirmado.\n\n' + itens + '\n\n' + contas.join('\n') +
      (calc.pago > 0.004 ? '\nRecebido: ' + brl(calc.pago) : '') + '\n' + saldo + '\n\n' + ondeTxt + '\n\nObrigada pela preferência!' + assinatura;
  }
  if (tipo === 'lembrete') {
    return ola + ' Passando para lembrar do seu pedido: ' + (p.tipoEntrega === 'entrega' ? 'entrega ' : 'retirada ') + quando + '.' +
      (p.tipoEntrega === 'entrega' && p.endereco ? '\nEndereço: ' + p.endereco : '') +
      (calc.restante > 0.004 ? '\n\nFalta ' + brl(calc.restante) + ' para quitar.' : '') + assinatura;
  }
  // recibo
  const ult = (p.pagamentos || []).slice(-1)[0];
  return ola + (ult ? ' Recebemos ' + brl(ult.valor) + (ult.forma && COMO_PAGOU[ult.forma] ? ' ' + COMO_PAGOU[ult.forma] : '') + ' em ' + (ult.data ? ult.data.split('-').reverse().join('/') : '') + '.' : '') +
    '\n\nPedido: ' + brl(calc.total) + '\nPago até agora: ' + brl(calc.pago) + '\n' + saldo + '\n\nObrigada!' + assinatura;
}
