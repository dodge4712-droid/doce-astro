// Motor: Receitas: custo por lote, markup, margem e opções de venda.
// Funções puras: não tocam na tela, na rede nem no armazenamento.
import { fixosPorHora, mesclarConfig, taxaCartaoPct, valorHora } from './config.js';
import { custoIngrediente } from './ingredientes.js';
import { numOk } from './numeros.js';
import { UNIDADES, mesmaFamilia, normUn, paraBase } from './unidades.js';

// ---------- Markup x margem ----------
export function markupParaMargem(k) { return numOk(k) && k > -1 ? k / (1 + k) : null; }
export function margemParaMarkup(m) { return numOk(m) && m < 1 ? m / (1 - m) : null; }
// ---------- Receita ----------
// ctx: { ingredientes: {id: ing}, receitas: {id: rec}, config }
export function calcularReceita(rec, ctx, pilha) {
  pilha = pilha || [];
  const cfg = mesclarConfig(ctx.config);
  const avisos = [];
  const itens = [];
  let custoIng = 0;
  let temCiclo = false;
  let maoObraSub = 0, fixosSub = 0;

  if (pilha.indexOf(rec.id) >= 0) {
    return { erroCiclo: true, avisos: ['Receita usa a si mesma em cadeia.'] };
  }
  const novaPilha = pilha.concat([rec.id]);

  (rec.itens || []).forEach(function (it) {
    const qtdBase = paraBase(it.qtd, it.unidade);
    let custo = null, nome = '(removido)', aviso = null;
    if (it.tipo === 'rec') {
      const sub = ctx.receitas[it.refId];
      if (!sub || sub.excluidoEm) { aviso = 'Receita não encontrada'; }
      else {
        nome = sub.nome || 'Receita sem nome';
        if (novaPilha.indexOf(sub.id) >= 0) { aviso = 'Ciclo: esta receita já está na cadeia'; temCiclo = true; }
        else {
          const r = calcularReceita(sub, ctx, novaPilha);
          if (r.erroCiclo || r.temCiclo) { aviso = 'Ciclo entre receitas'; temCiclo = true; }
          else if (!numOk(r.custoPorBase)) aviso = 'Receita base sem rendimento ou custo';
          else if (!mesmaFamilia(it.unidade, sub.rendimento && sub.rendimento.unidade)) aviso = 'Unidade diferente do rendimento da receita base';
          else if (!numOk(qtdBase)) aviso = 'Informe a quantidade';
          else {
            const porBase = it.modo === 'preco' ? r.precoInternoPorBase : r.custoPorBase;
            if (!numOk(porBase)) aviso = 'Receita base sem preço de venda calculável';
            else { custo = porBase * qtdBase; if (numOk(r.maoObraPorBase)) maoObraSub += r.maoObraPorBase * qtdBase; if (numOk(r.fixosPorBase)) fixosSub += r.fixosPorBase * qtdBase; }
          }
        }
      }
    } else {
      const ing = ctx.ingredientes[it.refId];
      if (!ing || ing.excluidoEm) { aviso = 'Ingrediente não encontrado'; }
      else {
        nome = ing.nome;
        const c = custoIngrediente(ing);
        if (!c) aviso = 'Ingrediente sem preço ou embalagem';
        else if (!mesmaFamilia(it.unidade, ing.unidade)) aviso = 'Unidade incompatível com o ingrediente';
        else if (!numOk(qtdBase)) aviso = 'Informe a quantidade';
        else custo = c.porBase * qtdBase;
      }
    }
    if (aviso) avisos.push(nome + ': ' + aviso);
    if (numOk(custo)) custoIng += custo;
    itens.push({ nome: nome, custo: custo, aviso: aviso });
  });

  const perda = numOk(rec.perdaPct) ? rec.perdaPct / 100 : 0;
  let perdaValor = 0;
  if (perda >= 1) avisos.push('Perda precisa ser menor que 100%.');
  else if (perda > 0) perdaValor = custoIng / (1 - perda) - custoIng;

  const diretos = (rec.custosDiretos || []).reduce((s, c) => s + (numOk(c.valor) ? c.valor : 0), 0);
  const horas = numOk(rec.tempoMin) ? rec.tempoMin / 60 : 0;
  const incluir = Object.assign({ fixos: true, maoObra: true }, rec.incluir || {});

  let fixos = 0, maoObra = 0;
  const fh = fixosPorHora(cfg), vh = valorHora(cfg);
  if (incluir.fixos && horas > 0) {
    if (numOk(fh)) fixos = fh * horas; else avisos.push('Defina as horas produzidas por mês para ratear os custos fixos.');
  }
  if (incluir.maoObra && horas > 0) {
    if (numOk(vh)) maoObra = vh * horas; else avisos.push('Defina o valor da sua hora nas configurações.');
  }
  if (!(horas > 0)) avisos.push('Sem tempo de produção: custos fixos e mão de obra ficam de fora.');

  const custoLote = custoIng + perdaValor + diretos + fixos + maoObra;
  const maoObraEmbutida = maoObra + (perda > 0 && perda < 1 ? maoObraSub / (1 - perda) : maoObraSub);
  // parte das contas fixas embutida no preço: a própria e a das receitas usadas dentro desta
  const fixosEmbutidos = fixos + (perda > 0 && perda < 1 ? fixosSub / (1 - perda) : fixosSub);

  const rend = rec.rendimento || {};
  const rendBase = paraBase(rend.qtd, rend.unidade);
  const unBase = normUn(rend.unidade) ? UNIDADES[normUn(rend.unidade)].base : null;
  let custoPorBase = null;
  if (numOk(rendBase) && rendBase > 0) custoPorBase = custoLote / rendBase;
  else avisos.push('Informe o rendimento para calcular o custo por unidade.');

  const maoObraPorBase = numOk(rendBase) && rendBase > 0 ? maoObraEmbutida / rendBase : null;
  const fixosPorBase = numOk(rendBase) && rendBase > 0 ? fixosEmbutidos / rendBase : null;
  const custoVariavelPorBase = numOk(rendBase) && rendBase > 0 ? (custoIng + perdaValor + diretos) / rendBase : null;
  const margem = margemDaReceita(rec, cfg);
  const precoInternoPorBase = numOk(custoPorBase) && numOk(margem) && margem < 1 ? custoPorBase / (1 - margem) : null;

  const vars = (rec.variacoes && rec.variacoes.length ? rec.variacoes : []).map(function (v) {
    return calcularVariacao(v, { fixosPorBase: fixosPorBase, maoObraPorBase: maoObraPorBase, custoVariavelPorBase: custoVariavelPorBase, custoPorBase: custoPorBase, unBase: unBase, rendUn: rend.unidade, alvo: alvoDaReceita(rec, cfg), taxas: rec.taxas || {}, cfg: cfg });
  });

  return {
    itens: itens, custoIngredientes: custoIng, perdaValor: perdaValor, diretos: diretos,
    fixos: fixos, maoObra: maoObra, custoLote: custoLote, horas: horas,
    rendimentoBase: rendBase, unidadeBase: unBase, custoPorBase: custoPorBase, custoVariavelPorBase: custoVariavelPorBase,
    maoObraEmbutida: maoObraEmbutida, maoObraPorBase: maoObraPorBase, fixosEmbutidos: fixosEmbutidos, fixosPorBase: fixosPorBase,
    margem: margem, markup: margemParaMarkup(margem), temCiclo: temCiclo,
    precoInternoPorBase: precoInternoPorBase, variacoes: vars, avisos: avisos
  };
}
// Alvo de lucro: no modo markup o lucro é % do custo; no modo margem, % do preço.
export function alvoDaReceita(rec, cfg) {
  const p = rec.precificacao || {};
  const v = numOk(p.valor) ? p.valor / 100 : (cfg.margemPadrao || 0) / 100;
  return { modo: p.modo === 'markup' ? 'markup' : 'margem', valor: v };
}
export function margemDaReceita(rec, cfg) {
  const p = rec.precificacao || {};
  const v = numOk(p.valor) ? p.valor / 100 : (cfg.margemPadrao || 0) / 100;
  if (p.modo === 'markup') return markupParaMargem(v);
  return v;
}
export function calcularVariacao(v, o) {
  const r = { id: v.id, nome: v.nome, aviso: null };
  const qBase = paraBase(v.qtd, v.unidade || o.rendUn);
  if (!numOk(o.custoPorBase)) { r.aviso = 'Falta o custo por unidade da receita'; return r; }
  if (!numOk(qBase) || qBase <= 0) { r.aviso = 'Informe quanto da receita esta opção usa'; return r; }
  if (!mesmaFamilia(v.unidade || o.rendUn, o.rendUn)) { r.aviso = 'Unidade diferente do rendimento'; return r; }
  const emb = numOk(v.embalagem) ? v.embalagem : 0;
  r.custo = o.custoPorBase * qBase + emb;
  r.custoVariavel = numOk(o.custoVariavelPorBase) ? o.custoVariavelPorBase * qBase + emb : null;
  r.maoObra = numOk(o.maoObraPorBase) ? o.maoObraPorBase * qBase : null;
  r.fixos = numOk(o.fixosPorBase) ? o.fixosPorBase * qBase : null;
  const t = o.taxas || {};
  const tPct = (taxaCartaoPct(o.cfg, t.cartao) + (t.app ? (o.cfg.taxas.app || 0) : 0)) / 100;
  const tFix = t.entrega ? (o.cfg.taxas.entrega || 0) : 0;
  r.taxasPct = tPct; r.taxasFixas = tFix;
  const a = o.alvo || { modo: 'margem', valor: null };
  if (!numOk(a.valor)) r.aviso = 'Defina a margem ou o markup';
  else if (a.modo === 'markup') {
    if (tPct >= 1) r.aviso = 'Taxas passam de 100% do preço.';
    else r.precoSugerido = (r.custo * (1 + a.valor) + tFix) / (1 - tPct);
  } else {
    const den = 1 - a.valor - tPct;
    if (den <= 0) r.aviso = 'Margem + taxas passam de 100%: não existe preço que feche essa conta.';
    else r.precoSugerido = (r.custo + tFix) / den;
  }
  const pr = numOk(v.precoPraticado) && v.precoPraticado > 0 ? v.precoPraticado : null;
  r.precoPraticado = pr;
  r.preco = pr || r.precoSugerido || null;
  if (numOk(r.preco)) {
    r.taxasValor = r.preco * tPct + tFix;
    r.lucro = r.preco - r.taxasValor - r.custo;
    r.margemReal = r.preco > 0 ? r.lucro / r.preco : null;
    r.markupReal = r.custo > 0 ? r.lucro / r.custo : null;
    r.prejuizo = r.lucro < 0;
  }
  return r;
}
// Receitas que usam (direta ou indiretamente) a receita alvo — para evitar ciclos no seletor
export function receitasQueDependemDe(alvoId, receitas) {
  const dep = new Set([alvoId]);
  let mudou = true;
  while (mudou) {
    mudou = false;
    Object.values(receitas).forEach(function (r) {
      if (dep.has(r.id) || r.excluidoEm) return;
      if ((r.itens || []).some(it => it.tipo === 'rec' && dep.has(it.refId))) { dep.add(r.id); mudou = true; }
    });
  }
  return dep;
}
