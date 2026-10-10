// Motor: Cardápio: itens, preços e descrições do cardápio em imagem (uma cópia própria, separada das receitas).
// Funções puras: não tocam na tela, na rede nem no armazenamento.
import { round2 } from './datas.js';
import { numOk } from './numeros.js';
import { TIPOS_CHAVE_PIX } from './pix.js';
import { calcularReceita } from './receitas.js';

export const LIMITES_CARDAPIO = { titulo: 40, recado: 120, categoria: 40, nome: 60, descricao: 120, opcao: 40, opcoes: 6, itens: 80, pixChave: 77, pixCidade: 15 };
export const TEMAS_CARDAPIO = { chocolate: 'Chocolate', creme: 'Creme' };

// Texto de uma linha só, com tamanho limitado
function curto(s, n) { return String(s === null || s === undefined ? '' : s).replace(/\s+/g, ' ').trim().slice(0, n); }
function preco(v) { return numOk(v) && v > 0 ? round2(v) : null; }

export function cardapioPadrao() {
  return { id: 'cardapio', titulo: 'Cardápio', recado: '', tema: 'chocolate', rodape: true, pixTipo: 'celular', pixChave: '', pixCidade: '', categorias: [] };
}
// Deixa o cardápio no formato certo, com os limites de tamanho (o que vem da planilha ou de outro aparelho também passa aqui)
export function normalizarCardapio(c) {
  const p = cardapioPadrao(), L = LIMITES_CARDAPIO;
  if (!c || typeof c !== 'object') return p;
  let n = 0;
  return {
    id: 'cardapio',
    titulo: curto(c.titulo === undefined ? p.titulo : c.titulo, L.titulo),
    recado: curto(c.recado, L.recado),
    tema: TEMAS_CARDAPIO[c.tema] ? c.tema : p.tema,
    rodape: c.rodape !== false,
    pixTipo: TIPOS_CHAVE_PIX[c.pixTipo] ? c.pixTipo : p.pixTipo,
    pixChave: curto(c.pixChave, L.pixChave),
    pixCidade: curto(c.pixCidade, L.pixCidade),
    categorias: (Array.isArray(c.categorias) ? c.categorias : []).filter(x => x && typeof x === 'object').map(function (cat, i) {
      return {
        id: String(cat.id || 'cat' + i), nome: curto(cat.nome, L.categoria),
        itens: (Array.isArray(cat.itens) ? cat.itens : []).filter(x => x && typeof x === 'object' && n++ < L.itens).map(function (it, j) {
          return {
            id: String(it.id || 'it' + i + '-' + j), nome: curto(it.nome, L.nome), descricao: curto(it.descricao, L.descricao),
            visivel: it.visivel !== false, receitaId: it.receitaId ? String(it.receitaId) : '',
            opcoes: (Array.isArray(it.opcoes) ? it.opcoes : []).filter(o => o && typeof o === 'object').slice(0, L.opcoes)
              .map((o, k) => ({ id: String(o.id || 'op' + k), nome: curto(o.nome, L.opcao), preco: preco(o.preco) }))
          };
        })
      };
    })
  };
}
// Um item novo a partir de uma receita: nome e opções de venda, com o "Preço que você cobra"
// (ou o sugerido, se não houver). Depois de criado, não acompanha mais a receita.
export function itemDaReceita(r, ctx, novoId) {
  const calc = calcularReceita(r, ctx);
  return {
    id: novoId(), nome: curto(r.nome, LIMITES_CARDAPIO.nome), descricao: '', visivel: true, receitaId: r.id,
    opcoes: (r.variacoes || []).slice(0, LIMITES_CARDAPIO.opcoes).map(function (v, i) {
      const cv = (calc.variacoes || [])[i] || {};
      return { id: novoId(), nome: curto(v.nome, LIMITES_CARDAPIO.opcao), preco: preco(numOk(v.precoPraticado) && v.precoPraticado > 0 ? v.precoPraticado : cv.precoSugerido) };
    })
  };
}
// Põe o item na categoria com esse nome (cria a categoria se não existir). Devolve o cardápio novo.
export function adicionarAoCardapio(c, item, nomeCategoria, novoId) {
  const r = normalizarCardapio(c);
  const nome = curto(nomeCategoria, LIMITES_CARDAPIO.categoria);
  let cat = r.categorias.find(x => x.nome.toLowerCase() === nome.toLowerCase());
  if (!cat) { cat = { id: novoId(), nome: nome, itens: [] }; r.categorias.push(cat); }
  cat.itens.push(item);
  return normalizarCardapio(r);
}
export function totalItensCardapio(c) { return (c.categorias || []).reduce((s, x) => s + x.itens.length, 0); }
// O que vai para a imagem: só itens ligados e com nome; categorias sem item ficam de fora
export function cardapioParaImagem(c) {
  return normalizarCardapio(c).categorias.map(cat => ({
    nome: cat.nome,
    itens: cat.itens.filter(it => it.visivel && it.nome).map(it => ({ nome: it.nome, descricao: it.descricao, opcoes: it.opcoes.filter(o => o.nome || o.preco !== null) }))
  })).filter(cat => cat.itens.length);
}
