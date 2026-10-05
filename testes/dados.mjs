// Dados de exemplo usados pelos testes do motor. Contas feitas à mão nos comentários.
export const CONFIG = {
  custosFixos: [{ nome: 'Aluguel', valor: 1200 }], horasMes: 120, // 10 por hora
  maoObra: { modo: 'hora', valorHora: 15, horasTrabalhadas: 120 },
  margemPadrao: 40
};
export const INGREDIENTES = {
  farinha: { id: 'farinha', nome: 'Farinha', unidade: 'kg', qtdEmbalagem: 1, valorPago: 10 }, // 0,01 por g
  acucar: { id: 'acucar', nome: 'Açúcar', unidade: 'g', qtdEmbalagem: 1000, valorPago: 5 }    // 0,005 por g
};
// Lote: 500 g farinha (5) + 200 g açúcar (1) + 2 de diretos + 1 h (10 fixos + 15 mão de obra) = 33; rende 10 un.
export function receitaBolo() {
  return {
    id: 'bolo', nome: 'Bolo',
    itens: [{ tipo: 'ing', refId: 'farinha', qtd: 500, unidade: 'g' }, { tipo: 'ing', refId: 'acucar', qtd: 200, unidade: 'g' }],
    custosDiretos: [{ nome: 'Gás', valor: 2 }], tempoMin: 60,
    rendimento: { qtd: 10, unidade: 'un' },
    variacoes: [{ id: 'fatia', nome: 'Fatia', qtd: 1, unidade: 'un', embalagem: 0.5 }]
  };
}
export function ctx(receitas) {
  const r = {};
  (receitas || [receitaBolo()]).forEach(x => { r[x.id] = x; });
  return { ingredientes: INGREDIENTES, receitas: r, config: CONFIG };
}
export function perto(a, b, msg) {
  if (!(Math.abs(a - b) < 1e-9)) throw new Error((msg || 'valor') + ': esperado ' + b + ', veio ' + a);
}
