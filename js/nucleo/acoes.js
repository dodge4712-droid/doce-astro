// Registro de ações dos botões (data-acao).

// Todas as ações dos botões (data-acao). Cada tela registra as suas no arranque (app.js).
export const ACOES = {};

// Junta as ações de uma parte do app ao registro geral.
// Um nome repetido seria sobrescrito em silêncio: por isso é recusado.
export function registrarAcoes(parte, mapa) {
  Object.keys(mapa).forEach(function (nome) {
    if (ACOES[nome]) throw new Error('Ação "' + nome + '" registrada duas vezes (a segunda vinha de ' + parte + ')');
    ACOES[nome] = mapa[nome];
  });
}

// Eventos globais desta parte (registrados uma vez, no arranque)
export function eventosAcoes() {
  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-acao]');
    if (!el) return;
    const fn = ACOES[el.dataset.acao];
    if (fn) { e.preventDefault(); fn(el, e); }
  });
}
