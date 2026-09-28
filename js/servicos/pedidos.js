// Serviço de pedidos: cálculo e nome do cliente.
import * as C from '../motor/index.js';
import { S, ctxCalc } from '../nucleo/estado.js';
import { p } from '../nucleo/icones.js';

// ================= Etapa 2: pedidos, clientes, agenda, produção e compras =================
export const ATIVOS = ['orcamento', 'confirmado', 'producao', 'pronto'];
export function nomeCliente(p) { const c = p.clienteId && S.dados.clientes[p.clienteId]; return (c && c.nome) || p.clienteNome || 'Sem cliente'; }
export function calcPed(p) { return C.calcularPedido(p, ctxCalc()); }
