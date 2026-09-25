/* Espaço Nave — motor de cálculo (sem dependência de tela; testável em Node) */
(function (raiz) {
  'use strict';

  // ---------- Unidades ----------
  const UNIDADES = {
    g:     { familia: 'massa',   fator: 1,    base: 'g',  rotulo: 'g' },
    kg:    { familia: 'massa',   fator: 1000, base: 'g',  rotulo: 'kg' },
    ml:    { familia: 'volume',  fator: 1,    base: 'ml', rotulo: 'ml' },
    L:     { familia: 'volume',  fator: 1000, base: 'ml', rotulo: 'L' },
    un:    { familia: 'unidade', fator: 1,    base: 'un', rotulo: 'un' },
    duzia: { familia: 'unidade', fator: 12,   base: 'un', rotulo: 'dúzia' }
  };
  const ALIAS = { unidade: 'un', unidades: 'un', 'dúzia': 'duzia', l: 'L', KG: 'kg', G: 'g' };

  function normUn(u) {
    if (!u) return null;
    if (UNIDADES[u]) return u;
    return ALIAS[u] || ALIAS[String(u).toLowerCase()] || null;
  }
  function unidadesDaFamilia(u) {
    const n = normUn(u); if (!n) return [];
    const f = UNIDADES[n].familia;
    return Object.keys(UNIDADES).filter(k => UNIDADES[k].familia === f);
  }
  function paraBase(qtd, u) {
    const n = normUn(u);
    if (!n || !numOk(qtd)) return null;
    return qtd * UNIDADES[n].fator;
  }
  function mesmaFamilia(a, b) {
    const x = normUn(a), y = normUn(b);
    return !!(x && y && UNIDADES[x].familia === UNIDADES[y].familia);
  }

  // ---------- Números ----------
  function numOk(v) { return typeof v === 'number' && isFinite(v); }
  function lerNum(v) {
    if (numOk(v)) return v;
    if (v === null || v === undefined) return null;
    let s = String(v).trim().replace(/\s|R\$/g, '');
    if (!s) return null;
    if (s.indexOf(',') >= 0) s = s.replace(/\./g, '').replace(',', '.');
    const n = Number(s);
    return isFinite(n) ? n : null;
  }
  const fmtMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  function brl(v, casas) {
    if (!numOk(v)) return '—';
    if (casas && casas !== 2) {
      return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
    }
    return fmtMoeda.format(v);
  }
  function num(v, casas) {
    if (!numOk(v)) return '—';
    const c = casas === undefined ? 2 : casas;
    return v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: c });
  }
  function pct(v, casas) {
    if (!numOk(v)) return '—';
    return (v * 100).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: casas === undefined ? 1 : casas }) + '%';
  }

  // ---------- Configuração ----------
  const CONFIG_PADRAO = {
    id: 'geral',
    custosFixos: [
      { nome: 'Aluguel', valor: null },
      { nome: 'Energia', valor: null },
      { nome: 'Gás', valor: null },
      { nome: 'Água', valor: null },
      { nome: 'Internet/Telefone', valor: null },
      { nome: 'MEI', valor: null }
    ],
    horasMes: 120,
    maoObra: { modo: 'hora', valorHora: 15, salario: null, horasTrabalhadas: 120 },
    taxas: { debito: 1.99, credito: 4.98, parcelado: 9.9, app: 23, entrega: 8 },
    margemPadrao: 40,
    margemAlerta: 25,
    doceria: { nome: 'Doce Astro', instagram: '@doce.astro', telefone: '(11) 91220-9162', email: 'doceastro@gmail.com' }
  };

  function mesclarConfig(c) {
    const p = JSON.parse(JSON.stringify(CONFIG_PADRAO));
    if (!c) return p;
    const r = Object.assign(p, c);
    r.maoObra = Object.assign({}, CONFIG_PADRAO.maoObra, c.maoObra || {});
    r.taxas = Object.assign({}, CONFIG_PADRAO.taxas, c.taxas || {});
    r.doceria = Object.assign({}, CONFIG_PADRAO.doceria, c.doceria || {});
    if (!Array.isArray(r.custosFixos)) r.custosFixos = [];
    return r;
  }
  function totalFixos(cfg) {
    return (cfg.custosFixos || []).reduce((s, c) => s + (numOk(c.valor) ? c.valor : 0), 0);
  }
  function fixosPorHora(cfg) {
    const t = totalFixos(cfg);
    return numOk(cfg.horasMes) && cfg.horasMes > 0 ? t / cfg.horasMes : null;
  }
  function valorHora(cfg) {
    const m = cfg.maoObra || {};
    if (m.modo === 'salario') {
      return numOk(m.salario) && numOk(m.horasTrabalhadas) && m.horasTrabalhadas > 0 ? m.salario / m.horasTrabalhadas : null;
    }
    return numOk(m.valorHora) ? m.valorHora : null;
  }
  function taxaCartaoPct(cfg, tipo) {
    const t = cfg.taxas || {};
    if (tipo === 'debito') return t.debito || 0;
    if (tipo === 'credito') return t.credito || 0;
    if (tipo === 'parcelado') return t.parcelado || 0;
    return 0;
  }

  // ---------- Markup x margem ----------
  function markupParaMargem(k) { return numOk(k) && k > -1 ? k / (1 + k) : null; }
  function margemParaMarkup(m) { return numOk(m) && m < 1 ? m / (1 - m) : null; }

  // ---------- Ingrediente ----------
  function custoIngrediente(ing) {
    if (!ing) return null;
    const u = normUn(ing.unidade);
    const qBase = paraBase(ing.qtdEmbalagem, u);
    if (!u || !numOk(qBase) || qBase <= 0 || !numOk(ing.valorPago)) return null;
    return { porBase: ing.valorPago / qBase, base: UNIDADES[u].base };
  }

  // ---------- Receita ----------
  // ctx: { ingredientes: {id: ing}, receitas: {id: rec}, config }
  function calcularReceita(rec, ctx, pilha) {
    pilha = pilha || [];
    const cfg = mesclarConfig(ctx.config);
    const avisos = [];
    const itens = [];
    let custoIng = 0;
    let temCiclo = false;

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
              else custo = porBase * qtdBase;
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

    const rend = rec.rendimento || {};
    const rendBase = paraBase(rend.qtd, rend.unidade);
    const unBase = normUn(rend.unidade) ? UNIDADES[normUn(rend.unidade)].base : null;
    let custoPorBase = null;
    if (numOk(rendBase) && rendBase > 0) custoPorBase = custoLote / rendBase;
    else avisos.push('Informe o rendimento para calcular o custo por unidade.');

    const margem = margemDaReceita(rec, cfg);
    const precoInternoPorBase = numOk(custoPorBase) && numOk(margem) && margem < 1 ? custoPorBase / (1 - margem) : null;

    const vars = (rec.variacoes && rec.variacoes.length ? rec.variacoes : []).map(function (v) {
      return calcularVariacao(v, { custoPorBase: custoPorBase, unBase: unBase, rendUn: rend.unidade, alvo: alvoDaReceita(rec, cfg), taxas: rec.taxas || {}, cfg: cfg });
    });

    return {
      itens: itens, custoIngredientes: custoIng, perdaValor: perdaValor, diretos: diretos,
      fixos: fixos, maoObra: maoObra, custoLote: custoLote, horas: horas,
      rendimentoBase: rendBase, unidadeBase: unBase, custoPorBase: custoPorBase,
      margem: margem, markup: margemParaMarkup(margem), temCiclo: temCiclo,
      precoInternoPorBase: precoInternoPorBase, variacoes: vars, avisos: avisos
    };
  }

  // Alvo de lucro: no modo markup o lucro é % do custo; no modo margem, % do preço.
  function alvoDaReceita(rec, cfg) {
    const p = rec.precificacao || {};
    const v = numOk(p.valor) ? p.valor / 100 : (cfg.margemPadrao || 0) / 100;
    return { modo: p.modo === 'markup' ? 'markup' : 'margem', valor: v };
  }
  function margemDaReceita(rec, cfg) {
    const p = rec.precificacao || {};
    const v = numOk(p.valor) ? p.valor / 100 : (cfg.margemPadrao || 0) / 100;
    if (p.modo === 'markup') return markupParaMargem(v);
    return v;
  }

  function calcularVariacao(v, o) {
    const r = { id: v.id, nome: v.nome, aviso: null };
    const qBase = paraBase(v.qtd, v.unidade || o.rendUn);
    if (!numOk(o.custoPorBase)) { r.aviso = 'Falta o custo por unidade da receita'; return r; }
    if (!numOk(qBase) || qBase <= 0) { r.aviso = 'Informe quanto da receita esta opção usa'; return r; }
    if (!mesmaFamilia(v.unidade || o.rendUn, o.rendUn)) { r.aviso = 'Unidade diferente do rendimento'; return r; }
    const emb = numOk(v.embalagem) ? v.embalagem : 0;
    r.custo = o.custoPorBase * qBase + emb;
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
  function receitasQueDependemDe(alvoId, receitas) {
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

  function variacaoPreco(ing, dias) {
    const h = (ing.historico || []).filter(x => numOk(x.porBase))
      .slice().sort((a, b) => String(a.data).localeCompare(String(b.data)));
    const atual = custoIngrediente(ing);
    if (!atual || h.length < 2) return null;
    const limite = Date.now() - (dias || 90) * 864e5;
    let ref = null;
    for (let i = 0; i < h.length - 1; i++) {
      if (new Date(h[i].data).getTime() >= limite) { ref = h[i]; break; }
      ref = h[i]; // último ponto antes da janela serve de referência
    }
    if (!ref || !(ref.porBase > 0)) return null;
    return { de: ref.porBase, para: atual.porBase, variacao: atual.porBase / ref.porBase - 1, desde: ref.data };
  }

  const API = {
    UNIDADES, normUn, unidadesDaFamilia, paraBase, mesmaFamilia,
    numOk, lerNum, brl, num, pct,
    CONFIG_PADRAO, mesclarConfig, totalFixos, fixosPorHora, valorHora,
    markupParaMargem, margemParaMarkup, custoIngrediente,
    calcularReceita, calcularVariacao, alvoDaReceita, receitasQueDependemDe, variacaoPreco
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else raiz.Calc = API;
})(typeof window !== 'undefined' ? window : globalThis);
