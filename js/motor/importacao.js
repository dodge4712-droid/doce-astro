// Motor: Importar compras de CSV.
// Funções puras: não tocam na tela, na rede nem no armazenamento.
import { dataISO, round2 } from './datas.js';
import { lerNum, num, numOk } from './numeros.js';
import { celulaCSV, semAcento } from './texto.js';
import { UNIDADES, mesmaFamilia, normUn } from './unidades.js';

// ---------- Importar compras (CSV) ----------
// Lê CSV com ";" ou "," (detecta pelo cabeçalho), aspas e quebra de linha dentro de aspas.
export function lerCSV(texto) {
  let t = String(texto || '').replace(/^\ufeff/, '');
  const primeira = t.split(/\r?\n/)[0] || '';
  const sep = (primeira.match(/;/g) || []).length >= (primeira.match(/,/g) || []).length ? ';' : ',';
  const linhas = []; let campo = '', linha = [], aspas = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (aspas) {
      if (ch === '"') { if (t[i + 1] === '"') { campo += '"'; i++; } else aspas = false; }
      else campo += ch;
    } else if (ch === '"') aspas = true;
    else if (ch === sep) { linha.push(campo); campo = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && t[i + 1] === '\n') i++;
      linha.push(campo); linhas.push(linha); linha = []; campo = '';
    } else campo += ch;
  }
  if (campo !== '' || linha.length) { linha.push(campo); linhas.push(linha); }
  return { sep: sep, linhas: linhas };
}
export function lerDataBR(v) {
  const s = String(v || '').trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return valida(+m[1], +m[2], +m[3]);
  m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2}|\d{4})$/);
  if (m) return valida(m[3].length === 2 ? 2000 + +m[3] : +m[3], +m[2], +m[1]);
  return null;
  function valida(y, mo, d) { const dt = new Date(y, mo - 1, d); return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d ? dataISO(dt) : null; }
}
export const FORMAS_TEXTO = { pix: 'pix', dinheiro: 'dinheiro', especie: 'dinheiro', debito: 'debito', 'cartao de debito': 'debito', credito: 'credito', 'cartao de credito': 'credito', cartao: 'credito',
  boleto: 'boleto', transferencia: 'boleto', ted: 'boleto', 'boleto ou transferencia': 'boleto', app: 'app', aplicativo: 'app', 'aplicativo de entrega': 'app' };
export const COLUNAS_COMPRA = [
  ['data', ['data']], ['descricao', ['local', 'descricao', 'loja', 'mercado', 'fornecedor']], ['ingrediente', ['ingrediente', 'produto', 'item']],
  ['embalagens', ['embalagens', 'quantidade', 'qtd']], ['tamanho', ['tamanho']], ['unidade', ['unidade', 'un']],
  ['valor', ['valor', 'preco', 'total']], ['forma', ['forma', 'pagamento']], ['validade', ['validade', 'vencimento']]];
export function mapearColunas(cab) {
  const idx = {}, usadas = {};
  COLUNAS_COMPRA.forEach(function ([chave, palavras]) {
    for (let i = 0; i < cab.length; i++) {
      if (usadas[i]) continue;
      const c = semAcento(cab[i]);
      if (palavras.some(p => c === p || c.startsWith(p + ' ') || c.startsWith(p))) { idx[chave] = i; usadas[i] = true; break; }
    }
  });
  return idx;
}
export function hashTexto(s) { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(36); }
// padroes: { data, descricao, forma }  resolucoes: { nomeSemAcento: 'novo' | 'outro' | ingredienteId }
export function interpretarCompras(csv, ingredientes, padroes, resolucoes) {
  padroes = padroes || {}; resolucoes = resolucoes || {};
  const res = { grupos: [], erros: [], ignoradas: 0, exemplos: 0, naoEncontrados: [], semCabecalho: false, colunas: null };
  const L = csv.linhas || [];
  if (!L.length) { res.semCabecalho = true; return res; }
  const col = mapearColunas(L[0]);
  res.colunas = col;
  if (!('ingrediente' in col) || !('valor' in col)) { res.semCabecalho = true; return res; }
  const porNome = {};
  Object.values(ingredientes || {}).forEach(i => { if (!i.excluidoEm) porNome[semAcento(i.nome)] = i; });
  const numBR = t => /^\d{1,3}(\.\d{3})+$/.test(String(t).trim()) ? Number(String(t).trim().replace(/\./g, '')) : lerNum(t);
  const cel = (r, k) => k in col ? String(r[col[k]] === undefined ? '' : r[col[k]]).trim() : '';
  const grupos = {}, faltando = {};
  for (let n = 1; n < L.length; n++) {
    const r = L[n], linha = n + 1;
    if (r.every(c => String(c).trim() === '')) { res.ignoradas++; continue; }
    const nome = cel(r, 'ingrediente'), vTxt = cel(r, 'valor'), eTxt = cel(r, 'embalagens');
    if (vTxt === '' && eTxt === '') { res.ignoradas++; continue; } // linha do modelo não preenchida
    const desc = cel(r, 'descricao') || padroes.descricao || 'Compra importada';
    if (/^exemplo/i.test(semAcento(desc))) { res.exemplos++; continue; }
    const erros = [];
    const dataTxt = cel(r, 'data');
    const data = dataTxt ? lerDataBR(dataTxt) : (padroes.data || null);
    if (!data) erros.push(dataTxt ? 'data "' + dataTxt + '" não reconhecida (use dd/mm/aaaa)' : 'sem data');
    const valor = numBR(vTxt);
    if (!(numOk(valor) && valor >= 0)) erros.push('valor pago "' + vTxt + '" inválido');
    const formaTxt = semAcento(cel(r, 'forma'));
    const forma = formaTxt ? FORMAS_TEXTO[formaTxt] : (padroes.forma || 'pix');
    if (!forma) erros.push('forma de pagamento "' + cel(r, 'forma') + '" não reconhecida');
    const valTxt = cel(r, 'validade');
    const validade = valTxt ? lerDataBR(valTxt) : '';
    if (valTxt && !validade) erros.push('validade "' + valTxt + '" não reconhecida');
    let item = null, outro = false;
    if (!nome) outro = true;
    else {
      const k = semAcento(nome);
      let ing = porNome[k];
      const decisao = resolucoes[k];
      if (!ing && decisao && decisao !== 'novo' && decisao !== 'outro') ing = ingredientes[decisao];
      if (!ing && decisao === 'outro') { outro = true; if (!porNome[k]) { faltando[k] = faltando[k] || { nome: nome, linhas: [], unidade: null }; faltando[k].linhas.push(linha); } }
      if (!outro) {
        const emb = eTxt === '' ? 1 : numBR(eTxt);
        const tamTxt = cel(r, 'tamanho'), unTxt = cel(r, 'unidade');
        const un = normUn(unTxt) || (ing ? normUn(ing.unidade) : null);
        const tam = tamTxt === '' ? (ing ? ing.qtdEmbalagem : null) : numBR(tamTxt);
        if (!(numOk(emb) && emb > 0)) erros.push('embalagens "' + eTxt + '" inválido');
        if (!(numOk(tam) && tam > 0)) erros.push('tamanho da embalagem ' + (tamTxt ? '"' + tamTxt + '" inválido' : 'em branco'));
        if (!un) erros.push(unTxt ? 'unidade "' + unTxt + '" não reconhecida (use g, kg, ml, L, un ou dúzia)' : 'sem unidade');
        if (ing && un && !mesmaFamilia(un, ing.unidade)) erros.push('unidade ' + unTxt + ' não combina com ' + ing.nome + ' (' + UNIDADES[normUn(ing.unidade)].rotulo + ')');
        if (!porNome[k]) { faltando[k] = faltando[k] || { nome: nome, linhas: [], unidade: un }; faltando[k].linhas.push(linha); }
        if (!ing && !decisao) erros.push('"' + nome + '" não está na biblioteca');
        item = { linha: linha, nome: ing ? ing.nome : nome, ingredienteId: ing ? ing.id : null, novo: !ing && decisao === 'novo', embalagens: emb, qtdEmbalagem: tam, unidade: un, valor: valor, validade: validade || '' };
      }
    }
    const k = [data, semAcento(desc), forma].join('|');
    const g = grupos[k] || (grupos[k] = { data: data, descricao: desc, forma: forma, itens: [], outros: 0, erros: [], linhas: [], brutas: [] });
    g.linhas.push(linha);
    const nb = t => { const x = numBR(t); return numOk(x) ? x.toFixed(4) : semAcento(t); };
    g.brutas.push([semAcento(nome), nb(eTxt), nb(cel(r, 'tamanho')), semAcento(cel(r, 'unidade')), nb(vTxt), semAcento(valTxt)].join('~'));
    erros.forEach(e => { g.erros.push({ linha: linha, msg: e }); res.erros.push({ linha: linha, msg: e }); });
    if (!erros.length) { if (outro) g.outros += valor; else g.itens.push(item); }
  }
  res.naoEncontrados = Object.keys(faltando).map(k => Object.assign({ chave: k }, faltando[k]));
  Object.values(grupos).forEach(function (g) {
    // mesmo ingrediente duas vezes na mesma compra: junta se a embalagem é igual
    const junt = {};
    g.itens.forEach(function (it) {
      const kk = (it.ingredienteId || 'novo:' + semAcento(it.nome));
      const x = junt[kk];
      if (!x) { junt[kk] = Object.assign({}, it); return; }
      if (x.qtdEmbalagem === it.qtdEmbalagem && x.unidade === it.unidade) { x.embalagens += it.embalagens; x.valor += it.valor; if (it.validade && (!x.validade || it.validade < x.validade)) x.validade = it.validade; }
      else { const e = { linha: it.linha, msg: it.nome + ' aparece com embalagens diferentes na mesma compra: use descrições diferentes para separar' }; g.erros.push(e); res.erros.push(e); }
    });
    g.itens = Object.values(junt).map(it => Object.assign(it, { valor: round2(it.valor) }));
    g.outros = round2(g.outros);
    g.total = round2(g.itens.reduce((s, it) => s + it.valor, 0) + g.outros);
    if (!(g.total > 0) && !g.erros.length) g.erros.push({ linha: g.linhas[0], msg: 'compra sem valor' });
    const assinatura = [g.data, semAcento(g.descricao), g.forma].concat(g.brutas.slice().sort()).join('|');
    g.id = 'imp-' + hashTexto(assinatura) + hashTexto(assinatura.split('').reverse().join(''));
    g.ok = !g.erros.length;
  });
  res.grupos = Object.values(grupos).sort((a, b) => String(a.data).localeCompare(String(b.data)) || a.descricao.localeCompare(b.descricao));
  return res;
}
export function modeloCSVCompras(ingredientes, hoje) {
  const c = celulaCSV;
  const L = ['Data;Local ou descrição;Ingrediente;Embalagens;Tamanho da embalagem;Unidade;Valor pago no item;Forma de pagamento;Validade'];
  const d = hoje ? hoje.split('-').reverse().join('/') : '';
  L.push([d, 'EXEMPLO (apague esta linha)', 'Leite condensado', '4', '395', 'g', '27,96', 'Pix', ''].join(';'));
  Object.values(ingredientes || {}).filter(i => !i.excluidoEm).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    .forEach(i => L.push(['', '', c(i.nome), '', num(i.qtdEmbalagem, 4).replace(/\./g, ''), UNIDADES[normUn(i.unidade)] ? UNIDADES[normUn(i.unidade)].rotulo : i.unidade, '', '', ''].join(';')));
  return '\ufeff' + L.join('\r\n');
}
