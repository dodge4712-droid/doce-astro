// Motor de cálculo do Espaço Nave: ponto único de entrada.
// Uso: import * as C from './motor/index.js' e depois C.calcularReceita(...).

export { UNIDADES, normUn, unidadesDaFamilia, paraBase, mesmaFamilia } from './unidades.js';
export { numOk, lerNum, brl, num, pct } from './numeros.js';
export { CONFIG_PADRAO, mesclarConfig, totalFixos, fixosPorHora, valorHora } from './config.js';
export { markupParaMargem, margemParaMarkup, calcularReceita, calcularVariacao, alvoDaReceita, receitasQueDependemDe } from './receitas.js';
export { dataISO, paraData, somarDias, diasEntre, round2 } from './datas.js';
export { FORMAS_PAGAMENTO, STATUS_PEDIDO, taxaFormaPct, calcularPedido, necessidades, qtdLegivel, maoObraItemPedido, fixosItemPedido } from './pedidos.js';
export { telefoneWhats, dataFalada, horaFalada, textoWhats } from './whatsapp.js';
export { FORMAS_LANCAMENTO, FONTE_PEDIDOS, ORIGENS_PADRAO, CATEGORIAS_PADRAO, movimentos, filtrarMovimentos, resumoCaixa, periodoPreset, agruparPeriodo, csvMovimentos, FONTE_PROLABORE, FONTE_CONTAS_FIXAS } from './caixa.js';
export { MOTIVOS_ESTOQUE, STATUS_COM_BAIXA, chaveIng, chaveVitrine, saldosEstoque, baixaDoPedido, assinaturaItensPedido, acaoBaixaPedido, comprasComEstoque, situacaoEstoque, producaoPorDia } from './estoque.js';
export { mesDe, somarMeses, limitesMes, nomeMes, mediaContasFixas, statusConta, vencimentoNoMes, contasRecorrentesAGerar, aReceber, textoCobranca, resumoReserva, proLaboreDesejado } from './financeiro.js';
export { produtosVendidos, pontoEquilibrio, resumoMes, variacaoPct, projecaoMes, csvRelatorio } from './relatorios.js';
export { proLaboreDisponivel } from './prolabore.js';
export { lerCSV, lerDataBR, interpretarCompras, modeloCSVCompras } from './importacao.js';
export { semAcento } from './texto.js';
export { custoIngrediente, variacaoPreco, aplicarCompra, removerCompra } from './ingredientes.js';
export { contasFixasCobertas } from './contas-fixas.js';
export { LIMITES_CARDAPIO, TEMAS_CARDAPIO, cardapioPadrao, normalizarCardapio, itemDaReceita, adicionarAoCardapio, totalItensCardapio, cardapioParaImagem } from './cardapio.js';
export { STORIES, CORES_CARDAPIO, FONTES_CARDAPIO, quebrarLinhas, linhasEquilibradas, paginasCardapio } from './cardapio-imagem.js';
