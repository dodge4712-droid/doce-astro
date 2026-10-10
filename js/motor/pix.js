// Motor: Pix: o código do Pix (BR Code estático, padrão do Banco Central) e o QR code dele.
// Funções puras: não tocam na tela, na rede nem no armazenamento.
import { semAcento } from './texto.js';

export const TIPOS_CHAVE_PIX = { celular: 'Celular', cpf: 'CPF ou CNPJ', email: 'E-mail', aleatoria: 'Chave aleatória' };

// A chave no formato que o Pix exige, ou null se não for válida para o tipo
export function chavePix(tipo, chave) {
  const s = String(chave || '').trim(), dig = s.replace(/\D/g, '');
  if (tipo === 'cpf') return dig.length === 11 || dig.length === 14 ? dig : null;
  if (tipo === 'celular') {
    if (dig.length === 10 || dig.length === 11) return '+55' + dig;
    return (dig.length === 12 || dig.length === 13) && dig.startsWith('55') ? '+' + dig : null;
  }
  if (tipo === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 77 ? s.toLowerCase() : null;
  if (tipo === 'aleatoria') return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s) ? s.toLowerCase() : null;
  return null;
}
// Nome e cidade vão sem acento, em maiúsculas e no tamanho máximo do padrão
function textoPix(s, n) { return semAcento(s).toUpperCase().replace(/[^A-Z0-9 ]/g, '').replace(/\s+/g, ' ').trim().slice(0, n); }
function campo(id, v) { return id + String(v.length).padStart(2, '0') + v; }
function crc16(s) {
  let crc = 0xFFFF;
  for (let i = 0; i < s.length; i++) {
    crc ^= s.charCodeAt(i) << 8;
    for (let k = 0; k < 8; k++) crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}
// Código "copia e cola" de um Pix sem valor fixo (quem paga digita o valor). null se faltar algo.
export function codigoPix(o) {
  const chave = chavePix(o.tipo, o.chave), nome = textoPix(o.nome, 25), cidade = textoPix(o.cidade, 15);
  if (!chave || !nome || !cidade) return null;
  const p = campo('00', '01') + campo('26', campo('00', 'br.gov.bcb.pix') + campo('01', chave)) +
    campo('52', '0000') + campo('53', '986') + campo('58', 'BR') + campo('59', nome) + campo('60', cidade) +
    campo('62', campo('05', '***')) + '6304';
  return p + crc16(p);
}

// ---------- QR code (modo byte, correção M, versões 1 a 10: cabe qualquer código Pix estático) ----------
// Segue o algoritmo de referência de Nayuki (QR Code generator library, licença MIT).
const ECC_M = [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26];
const BLOCOS_M = [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5];
function modulosDados(v) {
  let r = (16 * v + 128) * v + 64;
  if (v >= 2) { const n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; if (v >= 7) r -= 36; }
  return r;
}
function bytesDados(v) { return Math.floor(modulosDados(v) / 8) - ECC_M[v] * BLOCOS_M[v]; }
function mult(x, y) {
  let z = 0;
  for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; }
  return z;
}
function divisorRS(grau) {
  const r = new Array(grau).fill(0); r[grau - 1] = 1;
  let raiz = 1;
  for (let i = 0; i < grau; i++) {
    for (let j = 0; j < grau; j++) { r[j] = mult(r[j], raiz); if (j + 1 < grau) r[j] ^= r[j + 1]; }
    raiz = mult(raiz, 2);
  }
  return r;
}
function restoRS(dados, div) {
  const r = div.map(() => 0);
  dados.forEach(function (b) { const f = b ^ r.shift(); r.push(0); div.forEach((c, i) => { r[i] ^= mult(c, f); }); });
  return r;
}
function bit(x, i) { return ((x >>> i) & 1) !== 0; }
const MASCARAS = [
  (x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, x => x % 3 === 0, (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => x * y % 2 + x * y % 3 === 0,
  (x, y) => (x * y % 2 + x * y % 3) % 2 === 0, (x, y) => ((x + y) % 2 + x * y % 3) % 2 === 0
];
function penalidade(m) {
  const n = m.length, linhas = [];
  for (let i = 0; i < n; i++) { linhas.push(m[i]); linhas.push(m.map(l => l[i])); }
  let p = 0, escuros = 0;
  linhas.forEach(function (l) {
    for (let i = 0, run = 1; i < n; i++, run++) {
      if (i === n - 1 || l[i] !== l[i + 1]) { if (run >= 5) p += run - 2; run = 0; }
    }
    const s = '0000' + l.map(Number).join('') + '0000';
    ['10111010000', '00001011101'].forEach(function (pad) { for (let k = s.indexOf(pad); k >= 0; k = s.indexOf(pad, k + 1)) p += 40; });
  });
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (m[y][x]) escuros++;
    if (x < n - 1 && y < n - 1 && m[y][x] === m[y][x + 1] && m[y][x] === m[y + 1][x] && m[y][x] === m[y + 1][x + 1]) p += 3;
  }
  return p + (Math.ceil(Math.abs(escuros * 20 - n * n * 10) / (n * n)) - 1) * 10;
}
// Matriz de módulos (true = escuro), sem a margem branca. null se o texto não couber.
export function qrCode(texto) {
  const bytes = Array.from(new TextEncoder().encode(texto));
  let v = 1;
  while (v <= 10 && 4 + (v < 10 ? 8 : 16) + bytes.length * 8 > bytesDados(v) * 8) v++;
  if (v > 10) return null;

  // Dados: modo byte, tamanho, bytes, terminador e enchimento
  const bits = [], por = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
  const cap = bytesDados(v) * 8;
  por(4, 4); por(bytes.length, v < 10 ? 8 : 16); bytes.forEach(b => por(b, 8));
  por(0, Math.min(4, cap - bits.length)); por(0, (8 - bits.length % 8) % 8);
  for (let p = 0xEC; bits.length < cap; p ^= 0xEC ^ 0x11) por(p, 8);
  const dados = [];
  for (let i = 0; i < bits.length; i += 8) dados.push(bits.slice(i, i + 8).reduce((a, b) => a * 2 + b, 0));

  // Blocos com correção de erro, intercalados
  const nb = BLOCOS_M[v], ecc = ECC_M[v], brutos = Math.floor(modulosDados(v) / 8);
  const curtos = nb - brutos % nb, tamCurto = Math.floor(brutos / nb), div = divisorRS(ecc), blocos = [];
  for (let i = 0, k = 0; i < nb; i++) {
    const d = dados.slice(k, k += tamCurto - ecc + (i < curtos ? 0 : 1)), e = restoRS(d, div);
    if (i < curtos) d.push(0);
    blocos.push(d.concat(e));
  }
  const cw = [];
  for (let i = 0; i < blocos[0].length; i++) blocos.forEach((b, j) => { if (i !== tamCurto - ecc || j >= curtos) cw.push(b[i]); });

  // Padrões fixos
  const n = v * 4 + 17;
  const m = Array.from({ length: n }, () => new Array(n).fill(false));
  const fixo = Array.from({ length: n }, () => new Array(n).fill(false));
  const pos = (x, y, escuro) => { m[y][x] = escuro; fixo[y][x] = true; };
  for (let i = 0; i < n; i++) { pos(6, i, i % 2 === 0); pos(i, 6, i % 2 === 0); }
  [[3, 3], [n - 4, 3], [3, n - 4]].forEach(function ([cx, cy]) {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const d = Math.max(Math.abs(dx), Math.abs(dy)), x = cx + dx, y = cy + dy;
      if (x >= 0 && x < n && y >= 0 && y < n) pos(x, y, d !== 2 && d !== 4);
    }
  });
  if (v >= 2) {
    const na = Math.floor(v / 7) + 2, passo = Math.ceil((v * 4 + 4) / (na * 2 - 2)) * 2, al = [6];
    for (let p = n - 7; al.length < na; p -= passo) al.splice(1, 0, p);
    al.forEach((ax, i) => al.forEach(function (ay, j) {
      if ((i === 0 && j === 0) || (i === 0 && j === na - 1) || (i === na - 1 && j === 0)) return;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) pos(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }));
  }
  function formato(mascara) {
    const d = mascara; // correção M = 00
    let r = d;
    for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
    const b = ((d << 10) | r) ^ 0x5412;
    for (let i = 0; i <= 5; i++) pos(8, i, bit(b, i));
    pos(8, 7, bit(b, 6)); pos(8, 8, bit(b, 7)); pos(7, 8, bit(b, 8));
    for (let i = 9; i < 15; i++) pos(14 - i, 8, bit(b, i));
    for (let i = 0; i < 8; i++) pos(n - 1 - i, 8, bit(b, i));
    for (let i = 8; i < 15; i++) pos(8, n - 15 + i, bit(b, i));
    pos(8, n - 8, true);
  }
  formato(0);
  if (v >= 7) {
    let r = v;
    for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1F25);
    const b = (v << 12) | r;
    for (let i = 0; i < 18; i++) { const a = n - 11 + i % 3, c = Math.floor(i / 3); pos(a, c, bit(b, i)); pos(c, a, bit(b, i)); }
  }

  // Dados em zigue-zague, de baixo para cima, duas colunas por vez
  let i = 0;
  for (let dir = n - 1; dir >= 1; dir -= 2) {
    if (dir === 6) dir = 5;
    for (let vert = 0; vert < n; vert++) for (let j = 0; j < 2; j++) {
      const x = dir - j, y = ((dir + 1) & 2) === 0 ? n - 1 - vert : vert;
      if (!fixo[y][x] && i < cw.length * 8) { m[y][x] = bit(cw[i >>> 3], 7 - (i & 7)); i++; }
    }
  }

  // Escolhe a máscara que deixa o código mais fácil de ler
  let melhor = null, menor = Infinity;
  MASCARAS.forEach(function (f, k) {
    formato(k);
    const t = m.map((l, y) => l.map((e, x) => fixo[y][x] ? e : e !== f(x, y)));
    const p = penalidade(t);
    if (p < menor) { menor = p; melhor = t; }
  });
  return melhor;
}
