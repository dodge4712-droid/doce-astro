// Serviço do cardápio: lê e grava o cardápio (registro config/cardapio, sincronizado como os outros ajustes).
import * as C from '../motor/index.js';
import { S } from '../nucleo/estado.js';
import { gravarRegistro } from '../nucleo/registros.js';
import { clone } from '../nucleo/util.js';

export function lerCardapio() {
  const g = S.dados.config.cardapio;
  return C.normalizarCardapio(g && !g.excluidoEm ? clone(g) : null);
}
// Aplica uma mudança e grava. "mudar" recebe uma cópia do cardápio e pode alterá-la ou devolver outra.
export function mudarCardapio(mudar) {
  const c = lerCardapio();
  const novo = C.normalizarCardapio(mudar(c) || c);
  gravarRegistro('config', novo);
  return novo;
}
