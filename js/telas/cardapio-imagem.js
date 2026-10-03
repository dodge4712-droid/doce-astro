// Desenho do cardápio em imagem (canvas): fontes, logo, páginas de Stories e arquivos JPG.
import * as C from '../motor/index.js';

const { largura: W, altura: H } = C.STORIES;
let logoPromessa = null;
const tingidos = {};

// Espera as fontes da marca (no máximo 2,5 s: sem internet, o desenho usa as fontes de reserva)
export async function prepararDesenho() {
  const F = C.FONTES_CARDAPIO;
  const fontes = [F.titulo(104), F.recado, F.categoria, F.nome, F.consulta, F.descricao, F.opcao, F.preco, F.rodape, F.pagina];
  const espera = new Promise(r => setTimeout(r, 2500));
  const carregar = document.fonts && document.fonts.load ? Promise.all(fontes.map(f => document.fonts.load(f).catch(() => null))) : Promise.resolve();
  await Promise.race([carregar, espera]);
  if (!logoPromessa) {
    logoPromessa = new Promise(function (res) {
      const img = new Image();
      img.onload = () => res(img); img.onerror = () => res(null);
      img.src = 'icons/logo-selo.png';
    });
  }
  return { logo: await logoPromessa };
}
export function medidor(ctx) { return function (texto, fonte) { ctx.font = fonte; return ctx.measureText(texto).width; }; }
// Monta as páginas do cardápio (o motor decide onde fica cada coisa; aqui só se mede o texto)
export function paginas(opc) {
  const ctx = document.createElement('canvas').getContext('2d');
  return C.paginasCardapio(opc, medidor(ctx));
}

// O selo da marca na cor do tema (o arquivo é só o desenho; a cor vem daqui)
function logoTingido(img, cor, tam) {
  const k = cor + '|' + tam;
  if (!tingidos[k]) {
    const c = document.createElement('canvas'); c.width = tam; c.height = tam;
    const x = c.getContext('2d');
    x.drawImage(img, 0, 0, tam, tam);
    x.globalCompositeOperation = 'source-in'; x.fillStyle = cor; x.fillRect(0, 0, tam, tam);
    tingidos[k] = c;
  }
  return tingidos[k];
}
function caminhoArredondado(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function estrela(ctx, x, y, r) {
  const k = r * 0.26;
  ctx.beginPath();
  ctx.moveTo(x, y - r); ctx.lineTo(x + k, y - k); ctx.lineTo(x + r, y); ctx.lineTo(x + k, y + k);
  ctx.lineTo(x, y + r); ctx.lineTo(x - k, y + k); ctx.lineTo(x - r, y); ctx.lineTo(x - k, y - k); ctx.closePath();
}
const BALAO = 'M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5z';
const DESENHO = {
  fundo(ctx, o) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, o.cores[0]); g.addColorStop(1, o.cores[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const yb = o.y || 330, b = ctx.createRadialGradient(W / 2, yb, 0, W / 2, yb, 760); b.addColorStop(0, o.brilho); b.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = b; ctx.fillRect(0, 0, W, H);
  },
  moldura(ctx, o) { caminhoArredondado(ctx, 30, 30, W - 60, H - 60, 42); ctx.strokeStyle = o.cor; ctx.lineWidth = 2; ctx.stroke(); },
  estrela(ctx, o) { ctx.save(); ctx.globalAlpha = o.alfa; estrela(ctx, o.x, o.y, o.r); ctx.fillStyle = o.cor; ctx.fill(); ctx.restore(); },
  logo(ctx, o, rec) {
    if (rec.logo) { ctx.drawImage(logoTingido(rec.logo, o.cor, Math.round(o.tam)), o.x - o.tam / 2, o.y - o.tam / 2); return; }
    ctx.beginPath(); ctx.arc(o.x, o.y, o.tam / 2 - 4, 0, Math.PI * 2); ctx.strokeStyle = o.cor; ctx.lineWidth = 4; ctx.stroke();
    estrela(ctx, o.x, o.y, o.tam * 0.3); ctx.fillStyle = o.cor; ctx.fill();
  },
  texto(ctx, o) {
    ctx.font = o.fonte; ctx.fillStyle = o.cor; ctx.textAlign = o.alinhar || 'left'; ctx.textBaseline = 'alphabetic';
    if ('letterSpacing' in ctx) ctx.letterSpacing = (o.espaco || 0) + 'px';
    ctx.fillText(o.texto, o.x, o.y);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  },
  linha(ctx, o) { ctx.beginPath(); ctx.moveTo(o.x1, o.y1); ctx.lineTo(o.x2, o.y2); ctx.strokeStyle = o.cor; ctx.lineWidth = o.largura || 2; ctx.lineCap = 'round'; ctx.stroke(); },
  pontilhado(ctx, o) {
    if (o.x2 - o.x1 < 14) return;
    ctx.fillStyle = o.cor;
    for (let x = o.x1; x <= o.x2; x += 12) { ctx.beginPath(); ctx.arc(x, o.y, 2.2, 0, Math.PI * 2); ctx.fill(); }
  },
  painel(ctx, o) {
    ctx.save(); ctx.shadowColor = o.sombra; ctx.shadowBlur = 48; ctx.shadowOffsetY = 18;
    caminhoArredondado(ctx, o.x, o.y, o.w, o.h, o.raio); ctx.fillStyle = o.cor; ctx.fill(); ctx.restore();
    if (o.borda) { caminhoArredondado(ctx, o.x, o.y, o.w, o.h, o.raio); ctx.strokeStyle = o.borda; ctx.lineWidth = 2; ctx.stroke(); }
  },
  icone(ctx, o) {
    ctx.save(); ctx.translate(o.x, o.y); ctx.scale(o.tam / 24, o.tam / 24);
    ctx.strokeStyle = o.cor; ctx.fillStyle = o.cor; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (o.nome === 'whats') {
      ctx.stroke(new Path2D(BALAO));
      ctx.beginPath(); ctx.arc(8.6, 11.6, 1.2, 0, Math.PI * 2); ctx.arc(12.2, 11.6, 1.2, 0, Math.PI * 2); ctx.arc(15.8, 11.6, 1.2, 0, Math.PI * 2); ctx.fill();
    } else {
      caminhoArredondado(ctx, 3, 3, 18, 18, 5.5); ctx.stroke();
      ctx.beginPath(); ctx.arc(12, 12, 4.3, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(17.4, 6.6, 1.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
};
export function desenharPagina(canvas, pagina, rec) {
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  pagina.ops.forEach(o => DESENHO[o.t](ctx, o, rec));
}
// Cada página vira um arquivo JPG
export async function arquivosJPG(opc, rec) {
  const pgs = paginas(opc);
  const arqs = [];
  for (let i = 0; i < pgs.length; i++) {
    const cv = document.createElement('canvas');
    desenharPagina(cv, pgs[i], rec);
    const blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', 0.92));
    arqs.push(new File([blob], 'cardapio-doce-astro' + (pgs.length > 1 ? '-' + (i + 1) : '') + '.jpg', { type: 'image/jpeg' }));
  }
  return arqs;
}
