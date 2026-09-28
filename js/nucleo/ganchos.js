// Ganchos: o núcleo avisa que algo aconteceu, sem depender de telas nem serviços.

// Cada gancho é uma lista de funções chamadas quando o núcleo avisa.
export const GANCHOS = {
  registroGravado: [],       // um registro foi gravado no aparelho (nucleo/registros.js)
  antesDeDesenhar: [],       // a tela vai ser desenhada (nucleo/rotas.js)
  depoisDeSincronizar: [],   // a sincronização com a planilha terminou bem (nucleo/sincronizacao.js)
  dadosMudaram: [],          // chegaram dados novos de outro aparelho (nucleo/sincronizacao.js)
  estadoDaSincronizacao: []  // o estado da sincronização mudou (pílula no topo)
};

// Inscreve uma função para rodar quando o núcleo avisar (ver app.js)
export function aoAcontecer(nome, fn) {
  if (!GANCHOS[nome]) throw new Error('Gancho desconhecido: ' + nome);
  GANCHOS[nome].push(fn);
}

// O núcleo avisa que algo aconteceu
export function disparar(nome) {
  GANCHOS[nome].forEach(fn => fn());
}
