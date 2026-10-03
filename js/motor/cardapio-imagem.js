// Motor: Cardápio em imagem (Stories, 1080 × 1920): onde cada coisa fica em cada página.
// Funções puras: recebem uma função que mede texto e devolvem a lista do que desenhar. Quem desenha é a tela.
import { brl } from './numeros.js';

export const STORIES = { largura: 1080, altura: 1920 };
const W = 1080, H = 1920;
// Painel dos itens: margem lateral e recheio. Tudo fica entre 150 e 1770 de altura: acima e abaixo disso
// o Instagram mostra o nome do perfil e a barra de resposta.
const PX = 60, PW = W - 2 * PX, PAD = 56, CX = PX + PAD, CW = PW - 2 * PAD;

export const CORES_CARDAPIO = {
  chocolate: {
    fundo: ['#4B1F03', '#2A1000'], brilho: 'rgba(247,195,3,0.13)', moldura: 'rgba(247,195,3,0.45)', estrela: '#F7C303',
    logo: '#F7C303', titulo: '#FEF0ED', recado: '#E6C9BD', ornamento: '#F7C303',
    painel: '#FEF0ED', painelBorda: null, sombra: 'rgba(0,0,0,0.35)',
    categoria: '#401900', linhaCat: '#B8742A', nome: '#401900', descricao: '#7D5646', opcao: '#5E3520',
    preco: '#401900', pontos: '#D9B3A6', separador: '#EFD2C8', pagina: '#9C7A6C', rodape: '#FEF0ED', icone: '#F7C303'
  },
  creme: {
    fundo: ['#FEF0ED', '#F8DCD2'], brilho: 'rgba(247,195,3,0.16)', moldura: 'rgba(184,116,42,0.45)', estrela: '#B8742A',
    logo: '#401900', titulo: '#401900', recado: '#7D5646', ornamento: '#B8742A',
    painel: '#FFFFFF', painelBorda: '#EFD2C8', sombra: 'rgba(64,25,0,0.16)',
    categoria: '#401900', linhaCat: '#B8742A', nome: '#401900', descricao: '#7D5646', opcao: '#5E3520',
    preco: '#401900', pontos: '#D9B3A6', separador: '#F3DED6', pagina: '#9C7A6C', rodape: '#401900', icone: '#B8742A'
  }
};
const SERIF = '"Playfair Display", Georgia, serif', SANS = 'Montserrat, Arial, sans-serif';
export const FONTES_CARDAPIO = {
  titulo: n => '600 ' + n + 'px ' + SERIF,
  recado: 'italic 400 36px ' + SERIF,
  categoria: '600 48px ' + SERIF,
  nome: '700 36px ' + SANS,
  consulta: 'italic 500 30px ' + SANS,
  descricao: '400 28px ' + SANS,
  opcao: '500 30px ' + SANS,
  preco: '700 32px ' + SANS,
  rodape: '600 31px ' + SANS,
  pagina: '600 24px ' + SANS
};
const F = FONTES_CARDAPIO;
// Estrelinhas de enfeite (x, y, raio, opacidade): sempre no mesmo lugar
const ESTRELAS = [[132, 150, 13, 0.7], [948, 196, 9, 0.55], [300, 96, 6, 0.4], [822, 108, 7, 0.45], [78, 560, 7, 0.35], [1004, 690, 10, 0.45],
  [72, 1150, 8, 0.3], [1010, 1290, 6, 0.35], [150, 1740, 12, 0.55], [934, 1790, 15, 0.65], [548, 1858, 7, 0.4], [372, 1806, 5, 0.35], [742, 1720, 6, 0.4]];

// Quebra o texto em linhas que cabem na largura. Com limite de linhas, a última termina em "…".
export function quebrarLinhas(texto, fonte, largura, medir, maxLinhas) {
  const palavras = String(texto || '').split(/\s+/).filter(Boolean);
  const linhas = [];
  let atual = '';
  palavras.forEach(function (p) {
    // palavra maior que a linha: corta em pedaços
    while (medir(p, fonte) > largura && p.length > 1) {
      let k = p.length - 1;
      while (k > 1 && medir(p.slice(0, k), fonte) > largura) k--;
      if (atual) { linhas.push(atual); atual = ''; }
      linhas.push(p.slice(0, k)); p = p.slice(k);
    }
    const teste = atual ? atual + ' ' + p : p;
    if (medir(teste, fonte) <= largura) atual = teste; else { linhas.push(atual); atual = p; }
  });
  if (atual) linhas.push(atual);
  if (maxLinhas && linhas.length > maxLinhas) {
    const corte = linhas.slice(0, maxLinhas);
    let ult = corte[maxLinhas - 1] + '…';
    while (medir(ult, fonte) > largura && ult.length > 1) ult = ult.slice(0, -2) + '…';
    corte[maxLinhas - 1] = ult;
    return corte;
  }
  return linhas;
}

// Como quebrarLinhas, mas com as linhas do mesmo tamanho (sem uma palavra sozinha na última linha)
export function linhasEquilibradas(texto, fonte, largura, medir, maxLinhas) {
  const base = quebrarLinhas(texto, fonte, largura, medir, maxLinhas);
  if (base.length < 2 || base.length === maxLinhas && /…$/.test(base[base.length - 1])) return base;
  let melhor = base, nota = Infinity;
  for (let w = largura; w >= largura * 0.55; w -= 20) {
    const l = quebrarLinhas(texto, fonte, w, medir);
    if (l.length !== base.length) break;
    const larg = l.map(x => medir(x, fonte)), d = Math.max(...larg) - Math.min(...larg);
    if (d < nota) { nota = d; melhor = l; }
  }
  return melhor;
}

// Mede cada item e devolve os blocos na ordem: categoria, itens, categoria, itens…
// Item com uma opção só, sem nome (ou só com nome, sem preço): ela vai na linha do nome.
// Nos outros casos, cada opção é uma linha "nome ..... preço"; opção sem preço fica em itálico.
function medirBlocos(categorias, medir) {
  const blocos = [];
  categorias.forEach(function (cat) {
    blocos.push({ tipo: 'categoria', nome: cat.nome || 'Outros' });
    cat.itens.forEach(function (it) {
      const unica = it.opcoes.length === 1 ? it.opcoes[0] : null;
      const naLinha = !unica ? null : !unica.nome && unica.preco !== null ? { texto: brl(unica.preco), fonte: F.preco } : unica.nome && unica.preco === null ? { texto: unica.nome, fonte: F.consulta } : null;
      const soPreco = naLinha ? naLinha.texto : '', fontePreco = naLinha ? naLinha.fonte : F.preco;
      const largNome = soPreco ? CW - medir(soPreco, fontePreco) - 36 : CW;
      const nome = quebrarLinhas(it.nome, F.nome, largNome, medir, 2);
      const desc = quebrarLinhas(it.descricao, F.descricao, CW, medir, 3);
      const opcoes = soPreco ? [] : it.opcoes.map(o => ({ nome: quebrarLinhas(o.nome || '', o.preco !== null ? F.opcao : F.consulta, CW - 210, medir, 1)[0] || '', preco: o.preco !== null ? brl(o.preco) : '' }));
      const h = 22 + nome.length * 46 + (desc.length ? 4 + desc.length * 38 : 0) + (opcoes.length ? 8 + opcoes.length * 46 : 0) + 22;
      blocos.push({ tipo: 'item', nome, soPreco, fontePreco, desc, opcoes, h });
    });
  });
  return blocos;
}
const ALT_CAT = 64, ESPACO_CAT = 30, TOPO_CAB = 150, FIM_UTIL = 1770;

// Cabeçalho: completo na primeira página, compacto nas seguintes. dy desloca tudo para baixo.
function cabecalho(ops, cores, titulo, recado, primeira, medir, dy) {
  const topo = TOPO_CAB + dy, tam = primeira ? 200 : 130;
  ops.push({ t: 'logo', x: W / 2, y: topo + tam / 2, tam: tam, cor: cores.logo });
  // título: diminui até caber; se ainda não couber, vai em duas linhas
  let n = primeira ? 96 : 66;
  const menor = primeira ? 64 : 52;
  while (n > menor && medir(titulo, F.titulo(n)) > 900) n -= 4;
  const linhas = medir(titulo, F.titulo(n)) > 900 ? linhasEquilibradas(titulo, F.titulo(n), 900, medir, 2) : [titulo];
  let yTit = topo + tam + (primeira ? 102 : 72) - (linhas.length - 1) * Math.round(n * 0.3);
  linhas.forEach(function (l, i) {
    if (i) yTit += Math.round(n * 1.12);
    ops.push({ t: 'texto', x: W / 2, y: yTit, texto: l, fonte: F.titulo(n), cor: cores.titulo, alinhar: 'center' });
  });
  const yOrn = yTit + (primeira ? 48 : 36);
  ops.push({ t: 'linha', x1: 330, y1: yOrn, x2: 506, y2: yOrn, cor: cores.ornamento, largura: 2 });
  ops.push({ t: 'linha', x1: 574, y1: yOrn, x2: 750, y2: yOrn, cor: cores.ornamento, largura: 2 });
  ops.push({ t: 'estrela', x: W / 2, y: yOrn, r: 14, cor: cores.ornamento, alfa: 1 });
  let fim = yOrn + 16;
  if (primeira && recado) {
    linhasEquilibradas(recado, F.recado, 860, medir, 3).forEach(function (l, i) {
      const y = yOrn + 64 + i * 48;
      ops.push({ t: 'texto', x: W / 2, y: y, texto: l, fonte: F.recado, cor: cores.recado, alinhar: 'center' });
      fim = y + 14;
    });
  }
  return fim;
}

function desenharItem(ops, b, y, cores, ultimo, medir) {
  let yb = y + 22 + 36;
  b.nome.forEach(function (l, i) {
    ops.push({ t: 'texto', x: CX, y: yb, texto: l, fonte: F.nome, cor: cores.nome, alinhar: 'left' });
    if (i === 0 && b.soPreco) {
      const consulta = b.fontePreco === F.consulta;
      ops.push({ t: 'texto', x: CX + CW, y: yb, texto: b.soPreco, fonte: b.fontePreco, cor: consulta ? cores.linhaCat : cores.preco, alinhar: 'right' });
      if (b.nome.length === 1) ops.push({ t: 'pontilhado', x1: CX + medir(l, F.nome) + 18, x2: CX + CW - medir(b.soPreco, b.fontePreco) - 18, y: yb - 8, cor: cores.pontos });
    }
    yb += 46;
  });
  yb -= 46;
  if (b.desc.length) {
    yb += 4;
    b.desc.forEach(function (l) { yb += 38; ops.push({ t: 'texto', x: CX, y: yb, texto: l, fonte: F.descricao, cor: cores.descricao, alinhar: 'left' }); });
  }
  if (b.opcoes.length) {
    yb += 8;
    b.opcoes.forEach(function (o) {
      yb += 46;
      ops.push({ t: 'texto', x: CX, y: yb, texto: o.nome, fonte: o.preco ? F.opcao : F.consulta, cor: o.preco ? cores.opcao : cores.linhaCat, alinhar: 'left' });
      if (o.preco) {
        ops.push({ t: 'texto', x: CX + CW, y: yb, texto: o.preco, fonte: F.preco, cor: cores.preco, alinhar: 'right' });
        ops.push({ t: 'pontilhado', x1: CX + (o.nome ? medir(o.nome, F.opcao) + 18 : 0), x2: CX + CW - medir(o.preco, F.preco) - 18, y: yb - 8, cor: cores.pontos });
      }
    });
  }
  if (!ultimo) ops.push({ t: 'linha', x1: CX, y1: y + b.h, x2: CX + CW, y2: y + b.h, cor: cores.separador, largura: 2 });
}

// Distribui os blocos em páginas, sem passar de "teto" por página. O título da categoria nunca fica
// sozinho no pé: vai junto com o primeiro item, e repete no topo da página seguinte.
function distribuir(blocos, caps, teto) {
  const paginas = [];
  let pg = null, catAtual = null;
  const nova = () => { const cap = Math.min(teto, caps[Math.min(paginas.length, 1)]); pg = { itens: [], usado: 0, cap: cap }; paginas.push(pg); };
  nova();
  blocos.forEach(function (b, i) {
    if (b.tipo === 'categoria') { catAtual = b; return; }
    const primeiroDaCat = blocos[i - 1] && blocos[i - 1].tipo === 'categoria';
    const precisaCab = primeiroDaCat || !pg.itens.length;
    const h = b.h + (precisaCab ? ALT_CAT + (pg.itens.length ? ESPACO_CAT : 0) : 0);
    if (pg.usado + h > pg.cap && pg.itens.length) nova();
    if (primeiroDaCat || !pg.itens.length) {
      const extra = pg.itens.length ? ESPACO_CAT : 0;
      pg.itens.push({ tipo: 'categoria', nome: catAtual.nome, h: ALT_CAT + extra, extra: extra }); pg.usado += ALT_CAT + extra;
    }
    pg.itens.push(b); pg.usado += b.h;
  });
  return paginas;
}

// O cardápio inteiro em páginas de Stories. "categorias" vem de cardapioParaImagem();
// doceria: { telefone, instagram } (rodapé); medir(texto, fonte) → largura em pixels.
export function paginasCardapio(opc, medir) {
  const cores = CORES_CARDAPIO[opc.tema] || CORES_CARDAPIO.chocolate;
  const titulo = opc.titulo || 'Cardápio';
  const blocos = medirBlocos(opc.categorias || [], medir);
  const d = opc.doceria || {};
  const rodape = opc.rodape !== false && (d.telefone || d.instagram) ? { telefone: d.telefone || '', instagram: d.instagram || '' } : null;
  const altRodape = rodape ? 104 : 0;
  // espaço para os itens: da primeira página (cabeçalho completo) e das seguintes (compacto)
  const fimCab = [true, false].map(p => cabecalho([], cores, titulo, opc.recado, p, medir, 0));
  const caps = fimCab.map(f => FIM_UTIL - altRodape - (f + 40) - 2 * PAD);

  // 1. quantas páginas são precisas; depois, o menor teto que mantém esse número (páginas equilibradas)
  let paginas = distribuir(blocos, caps, Infinity);
  if (paginas.length > 1) {
    let lo = 0, hi = Math.max(caps[0], caps[1]);
    while (hi - lo > 8) { const meio = (lo + hi) / 2; if (distribuir(blocos, caps, meio).length <= paginas.length) hi = meio; else lo = meio; }
    paginas = distribuir(blocos, caps, hi);
  }

  // 2. desenha cada página, com o conjunto centralizado na altura útil
  return paginas.map(function (p, n) {
    const primeira = n === 0;
    const altPainel = (p.itens.length ? p.usado : 120) + 2 * PAD;
    const total = (fimCab[primeira ? 0 : 1] - TOPO_CAB) + 40 + altPainel + altRodape;
    const dy = Math.max(0, (FIM_UTIL - TOPO_CAB - total) / 2);
    const ops = [{ t: 'fundo', cores: cores.fundo, brilho: cores.brilho, y: 330 + dy }, { t: 'moldura', cor: cores.moldura }];
    ESTRELAS.forEach(e => ops.push({ t: 'estrela', x: e[0], y: e[1], r: e[2], cor: cores.estrela, alfa: e[3] }));
    const topo = cabecalho(ops, cores, titulo, opc.recado, primeira, medir, dy) + 40;
    ops.push({ t: 'painel', x: PX, y: topo, w: PW, h: altPainel, raio: 44, cor: cores.painel, borda: cores.painelBorda, sombra: cores.sombra });
    let y = topo + PAD;
    if (!p.itens.length) ops.push({ t: 'texto', x: W / 2, y: y + 70, texto: 'Ligue os itens que entram no cardápio.', fonte: F.descricao, cor: cores.descricao, alinhar: 'center' });
    p.itens.forEach(function (b, i) {
      if (b.tipo === 'categoria') {
        const yb = y + b.extra + 48;
        ops.push({ t: 'texto', x: CX, y: yb, texto: b.nome, fonte: F.categoria, cor: cores.categoria, alinhar: 'left' });
        const fimTxt = CX + medir(b.nome, F.categoria) + 24;
        if (fimTxt < CX + CW - 20) ops.push({ t: 'linha', x1: fimTxt, y1: yb - 14, x2: CX + CW, y2: yb - 14, cor: cores.linhaCat, largura: 3 });
      } else {
        const prox = p.itens[i + 1];
        desenharItem(ops, b, y, cores, !prox || prox.tipo === 'categoria', medir);
      }
      y += b.h;
    });
    if (paginas.length > 1) ops.push({ t: 'texto', x: PX + PW - 34, y: topo + altPainel - 24, texto: (n + 1) + '/' + paginas.length, fonte: F.pagina, cor: cores.pagina, alinhar: 'right' });
    if (rodape) {
      const yR = topo + altPainel + 78;
      const partes = [];
      if (rodape.telefone) partes.push({ icone: 'whats', texto: rodape.telefone });
      if (rodape.instagram) partes.push({ icone: 'insta', texto: rodape.instagram });
      const larg = partes.map(x => 46 + medir(x.texto, F.rodape));
      const tot = larg.reduce((s, x) => s + x, 0) + (partes.length - 1) * 56;
      let x = (W - tot) / 2;
      partes.forEach(function (pt, k) {
        ops.push({ t: 'icone', nome: pt.icone, x: x, y: yR - 31, tam: 34, cor: cores.icone });
        ops.push({ t: 'texto', x: x + 46, y: yR, texto: pt.texto, fonte: F.rodape, cor: cores.rodape, alinhar: 'left' });
        x += larg[k] + 56;
      });
    }
    return { ops: ops };
  });
}
