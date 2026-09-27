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
    sinalPadraoPct: 50,
    estoqueModo: 'manual',
    custosFixosFonte: 'manual',
    reservaPct: 10,
    reservaMeta: null,
    metaFaturamento: null,
    metaLucro: null,
    diasAlertaValidade: 3,
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
    if (cfg.custosFixosFonte === 'contas' && numOk(cfg.mediaContasFixas)) return cfg.mediaContasFixas;
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
    let maoObraSub = 0;

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
              else { custo = porBase * qtdBase; if (numOk(r.maoObraPorBase)) maoObraSub += r.maoObraPorBase * qtdBase; }
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

    const rend = rec.rendimento || {};
    const rendBase = paraBase(rend.qtd, rend.unidade);
    const unBase = normUn(rend.unidade) ? UNIDADES[normUn(rend.unidade)].base : null;
    let custoPorBase = null;
    if (numOk(rendBase) && rendBase > 0) custoPorBase = custoLote / rendBase;
    else avisos.push('Informe o rendimento para calcular o custo por unidade.');

    const maoObraPorBase = numOk(rendBase) && rendBase > 0 ? maoObraEmbutida / rendBase : null;
    const custoVariavelPorBase = numOk(rendBase) && rendBase > 0 ? (custoIng + perdaValor + diretos) / rendBase : null;
    const margem = margemDaReceita(rec, cfg);
    const precoInternoPorBase = numOk(custoPorBase) && numOk(margem) && margem < 1 ? custoPorBase / (1 - margem) : null;

    const vars = (rec.variacoes && rec.variacoes.length ? rec.variacoes : []).map(function (v) {
      return calcularVariacao(v, { maoObraPorBase: maoObraPorBase, custoVariavelPorBase: custoVariavelPorBase, custoPorBase: custoPorBase, unBase: unBase, rendUn: rend.unidade, alvo: alvoDaReceita(rec, cfg), taxas: rec.taxas || {}, cfg: cfg });
    });

    return {
      itens: itens, custoIngredientes: custoIng, perdaValor: perdaValor, diretos: diretos,
      fixos: fixos, maoObra: maoObra, custoLote: custoLote, horas: horas,
      rendimentoBase: rendBase, unidadeBase: unBase, custoPorBase: custoPorBase, custoVariavelPorBase: custoVariavelPorBase,
      maoObraEmbutida: maoObraEmbutida, maoObraPorBase: maoObraPorBase,
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
    r.custoVariavel = numOk(o.custoVariavelPorBase) ? o.custoVariavelPorBase * qBase + emb : null;
    r.maoObra = numOk(o.maoObraPorBase) ? o.maoObraPorBase * qBase : null;
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
    const h = ordenarHistorico((ing.historico || []).filter(x => numOk(x.porBase)).slice());
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


  // ---------- Datas (sempre no fuso do aparelho, formato AAAA-MM-DD) ----------
  function dataISO(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function paraData(iso) { const p = String(iso || '').split('-').map(Number); return p.length === 3 && p[0] ? new Date(p[0], p[1] - 1, p[2]) : null; }
  function somarDias(iso, n) { const d = paraData(iso); if (!d) return null; d.setDate(d.getDate() + n); return dataISO(d); }
  function diasEntre(a, b) { const x = paraData(a), y = paraData(b); return x && y ? Math.round((y - x) / 864e5) : null; }
  function round2(v) { return Math.round((v + Number.EPSILON) * 100) / 100; }

  // ---------- Pedidos ----------
  const FORMAS_PAGAMENTO = {
    pix: { rotulo: 'Pix', taxa: null },
    dinheiro: { rotulo: 'Dinheiro', taxa: null },
    debito: { rotulo: 'Cartão de débito', taxa: 'debito' },
    credito: { rotulo: 'Cartão de crédito', taxa: 'credito' },
    app: { rotulo: 'Aplicativo de entrega', taxa: 'app' }
  };
  const STATUS_PEDIDO = {
    orcamento: { rotulo: 'Orçamento', ordem: 0 },
    confirmado: { rotulo: 'Confirmado', ordem: 1 },
    producao: { rotulo: 'Em produção', ordem: 2 },
    pronto: { rotulo: 'Pronto', ordem: 3 },
    entregue: { rotulo: 'Entregue', ordem: 4 },
    cancelado: { rotulo: 'Cancelado', ordem: 5 }
  };
  function taxaFormaPct(cfg, forma) {
    const f = FORMAS_PAGAMENTO[forma];
    return f && f.taxa ? (cfg.taxas[f.taxa] || 0) : 0;
  }
  function custoItemPedido(it, ctx) {
    if (it.tipo === 'avulso') return numOk(it.custoUnit) ? it.custoUnit : null;
    const rec = ctx.receitas[it.receitaId];
    if (!rec || rec.excluidoEm) return numOk(it.custoUnit) ? it.custoUnit : null;
    const r = calcularReceita(rec, ctx);
    const v = (r.variacoes || []).find(x => x.id === it.variacaoId);
    return v && numOk(v.custo) ? v.custo : (numOk(it.custoUnit) ? it.custoUnit : null);
  }
  function maoObraItemPedido(it, ctx) {
    if (it.tipo !== 'rec') return 0;
    if (numOk(it.maoObraUnit)) return it.maoObraUnit;
    const rec = ctx.receitas[it.receitaId];
    if (!rec || rec.excluidoEm) return 0;
    const v = (calcularReceita(rec, ctx).variacoes || []).find(x => x.id === it.variacaoId);
    return v && numOk(v.maoObra) ? v.maoObra : 0;
  }
  function calcularPedido(p, ctx) {
    const cfg = mesclarConfig(ctx.config);
    let subtotal = 0, custo = 0, custoCompleto = true;
    const itens = (p.itens || []).map(function (it) {
      const q = numOk(it.qtd) ? it.qtd : 0, pu = numOk(it.precoUnit) ? it.precoUnit : 0;
      const cu = custoItemPedido(it, ctx);
      subtotal += q * pu;
      if (numOk(cu)) custo += cu * q; else if (q > 0) custoCompleto = false;
      return { id: it.id, total: q * pu, custoUnit: cu, custo: numOk(cu) ? cu * q : null, maoObraUnit: maoObraItemPedido(it, ctx) };
    });
    const taxaEntrega = p.tipoEntrega === 'entrega' && numOk(p.taxaEntrega) ? p.taxaEntrega : 0;
    const desconto = numOk(p.desconto) ? p.desconto : 0;
    const total = round2(Math.max(0, subtotal + taxaEntrega - desconto));
    const pago = round2((p.pagamentos || []).reduce((s, x) => s + (numOk(x.valor) ? x.valor : 0), 0));
    const restante = round2(total - pago);
    const taxaPagamento = total * taxaFormaPct(cfg, p.formaPagamento) / 100;
    // A taxa de entrega é repasse (motoboy/combustível): não conta como lucro dos doces.
    const lucro = custoCompleto && itens.length ? total - taxaEntrega - custo - taxaPagamento : null;
    let situacao = 'pendente';
    if (total > 0 && restante <= 0.004) situacao = restante < -0.004 ? 'excedente' : 'pago';
    else if (pago > 0.004) situacao = 'parcial';
    return {
      itens: itens, subtotal: round2(subtotal), taxaEntrega: taxaEntrega, desconto: desconto, total: total,
      pago: pago, restante: restante, custo: custoCompleto ? custo : null, taxaPagamento: taxaPagamento,
      lucro: lucro, margem: numOk(lucro) && total - taxaEntrega > 0 ? lucro / (total - taxaEntrega) : null,
      situacao: situacao, sinalSugerido: round2(total * (cfg.sinalPadraoPct || 0) / 100)
    };
  }

  // Quanto produzir e quanto comprar para um conjunto de pedidos.
  // Desmonta receita dentro de receita e aplica a perda de cada uma.
  function necessidades(pedidos, ctx) {
    const producao = {}, compras = {}, avisos = [];
    function expandir(recId, qtdBase, pilha, direto) {
      const rec = ctx.receitas[recId];
      if (!rec || rec.excluidoEm) { avisos.push('Uma receita usada nos pedidos foi excluída.'); return; }
      if (pilha.indexOf(recId) >= 0) { avisos.push((rec.nome || 'Receita') + ': receitas usam uma à outra em ciclo.'); return; }
      const p = producao[recId] || (producao[recId] = { receitaId: recId, qtdBase: 0, direto: 0 });
      p.qtdBase += qtdBase; if (direto) p.direto += qtdBase;
      const rend = rec.rendimento || {};
      const rendBase = paraBase(rend.qtd, rend.unidade);
      if (!(rendBase > 0)) { avisos.push((rec.nome || 'Receita') + ': sem rendimento, os ingredientes dela ficaram de fora.'); return; }
      p.rendBase = rendBase; p.unidadeBase = UNIDADES[normUn(rend.unidade)].base;
      const perda = numOk(rec.perdaPct) && rec.perdaPct > 0 && rec.perdaPct < 100 ? rec.perdaPct / 100 : 0;
      const fator = qtdBase / rendBase / (1 - perda);
      (rec.itens || []).forEach(function (it) {
        const q = paraBase(it.qtd, it.unidade);
        if (!numOk(q)) return;
        if (it.tipo === 'rec') expandir(it.refId, q * fator, pilha.concat([recId]), false);
        else {
          const c = compras[it.refId] || (compras[it.refId] = { ingredienteId: it.refId, qtdBase: 0 });
          c.qtdBase += q * fator;
        }
      });
    }
    (pedidos || []).forEach(function (pd) {
      (pd.itens || []).forEach(function (it) {
        if (it.tipo !== 'rec' || !numOk(it.qtd) || it.qtd <= 0) return;
        const rec = ctx.receitas[it.receitaId];
        if (!rec || rec.excluidoEm) { avisos.push((it.nome || 'Item') + ': a receita foi excluída.'); return; }
        const v = (rec.variacoes || []).find(x => x.id === it.variacaoId);
        if (!v) { avisos.push((it.nome || rec.nome) + ': a opção de venda não existe mais na receita.'); return; }
        const qb = paraBase(v.qtd, v.unidade || (rec.rendimento && rec.rendimento.unidade));
        if (!numOk(qb)) { avisos.push((it.nome || rec.nome) + ': a opção de venda não diz quanto usa da receita.'); return; }
        expandir(rec.id, qb * it.qtd, [], true);
      });
    });
    Object.values(compras).forEach(function (c) {
      const ing = ctx.ingredientes[c.ingredienteId];
      if (!ing) return;
      const emb = paraBase(ing.qtdEmbalagem, ing.unidade);
      c.base = UNIDADES[normUn(ing.unidade)] ? UNIDADES[normUn(ing.unidade)].base : null;
      if (emb > 0) { c.embalagens = Math.ceil(c.qtdBase / emb - 1e-9); c.custoEmbalagens = c.embalagens * (ing.valorPago || 0); }
      const ci = custoIngrediente(ing);
      c.custoProporcional = ci ? ci.porBase * c.qtdBase : null;
    });
    return { producao: producao, compras: compras, avisos: Array.from(new Set(avisos)) };
  }

  function qtdLegivel(qtdBase, base) {
    if (!numOk(qtdBase)) return '—';
    if (base === 'g' && qtdBase >= 1000) return num(qtdBase / 1000, 2) + ' kg';
    if (base === 'ml' && qtdBase >= 1000) return num(qtdBase / 1000, 2) + ' L';
    if (base === 'un') return num(qtdBase, 1) + ' un';
    return num(qtdBase, 0) + ' ' + (base || '');
  }

  // ---------- WhatsApp ----------
  function telefoneWhats(tel) {
    let d = String(tel || '').replace(/\D/g, '');
    if (!d) return '';
    if (d.length === 10 || d.length === 11) d = '55' + d;
    return d.length >= 12 && d.length <= 13 ? d : '';
  }
  const DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  function dataFalada(iso, hoje) {
    const d = paraData(iso); if (!d) return '';
    const dd = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
    const dif = hoje ? diasEntre(hoje, iso) : null;
    if (dif === 0) return 'hoje (' + dd + ')';
    if (dif === 1) return 'amanhã (' + dd + ')';
    return DIAS[d.getDay()] + ', ' + dd;
  }
  function horaFalada(h) {
    if (!h) return '';
    const [hh, mm] = h.split(':');
    return Number(hh) + 'h' + (mm && mm !== '00' ? mm : '');
  }
  const COMO_PAGOU = { pix: 'no Pix', dinheiro: 'em dinheiro', debito: 'no cartão de débito', credito: 'no cartão de crédito', app: 'pelo aplicativo' };
  function textoWhats(tipo, p, calc, cfg, opc) {
    opc = opc || {};
    const c = mesclarConfig(cfg);
    const nome = String(p.clienteNome || '').trim().split(/\s+/)[0];
    const quando = dataFalada(p.dataEntrega, opc.hoje) + (p.horaEntrega ? ', às ' + horaFalada(p.horaEntrega) : '');
    const ondeTxt = p.tipoEntrega === 'entrega' ? 'Entrega ' + quando + (p.endereco ? '\nEndereço: ' + p.endereco : '') : 'Retirada ' + quando;
    const itens = (p.itens || []).filter(it => numOk(it.qtd) && it.qtd > 0)
      .map(it => '• ' + num(it.qtd) + 'x ' + (it.nome || 'Item') + ': ' + brl(it.qtd * (it.precoUnit || 0))).join('\n');
    const contas = [];
    if (calc.taxaEntrega > 0) contas.push('Taxa de entrega: ' + brl(calc.taxaEntrega));
    if (calc.desconto > 0) contas.push('Desconto: -' + brl(calc.desconto));
    contas.push('*Total: ' + brl(calc.total) + '*');
    const assinatura = '\n\n' + (c.doceria.nome || 'Doce Astro') + (c.doceria.instagram ? '\n' + c.doceria.instagram : '');
    const ola = 'Olá' + (nome ? ', ' + nome : '') + '!';
    const saldo = calc.restante > 0.004 ? 'Falta ' + brl(calc.restante) + ', para pagar ' + (p.tipoEntrega === 'entrega' ? 'na entrega' : 'na retirada') + '.' : 'Pedido quitado.';
    if (tipo === 'orcamento') {
      return ola + ' Segue o orçamento:\n\n' + itens + '\n\n' + contas.join('\n') + '\n\n' + ondeTxt +
        (calc.sinalSugerido > 0 && calc.pago < 0.005 ? '\n\nPara confirmar, o sinal é de ' + brl(calc.sinalSugerido) + ' (' + num(c.sinalPadraoPct) + '%).' : '') +
        '\n\nQualquer dúvida, é só chamar.' + assinatura;
    }
    if (tipo === 'confirmacao') {
      return ola + ' Seu pedido está confirmado.\n\n' + itens + '\n\n' + contas.join('\n') +
        (calc.pago > 0.004 ? '\nRecebido: ' + brl(calc.pago) : '') + '\n' + saldo + '\n\n' + ondeTxt + '\n\nObrigada pela preferência!' + assinatura;
    }
    if (tipo === 'lembrete') {
      return ola + ' Passando para lembrar do seu pedido: ' + (p.tipoEntrega === 'entrega' ? 'entrega ' : 'retirada ') + quando + '.' +
        (p.tipoEntrega === 'entrega' && p.endereco ? '\nEndereço: ' + p.endereco : '') +
        (calc.restante > 0.004 ? '\n\nFalta ' + brl(calc.restante) + ' para quitar.' : '') + assinatura;
    }
    // recibo
    const ult = (p.pagamentos || []).slice(-1)[0];
    return ola + (ult ? ' Recebemos ' + brl(ult.valor) + (ult.forma && COMO_PAGOU[ult.forma] ? ' ' + COMO_PAGOU[ult.forma] : '') + ' em ' + (ult.data ? ult.data.split('-').reverse().join('/') : '') + '.' : '') +
      '\n\nPedido: ' + brl(calc.total) + '\nPago até agora: ' + brl(calc.pago) + '\n' + saldo + '\n\nObrigada!' + assinatura;
  }


  // ---------- Caixa: entradas e saídas ----------
  const FORMAS_LANCAMENTO = {
    pix: 'Pix', dinheiro: 'Dinheiro', debito: 'Cartão de débito', credito: 'Cartão de crédito',
    app: 'Aplicativo de entrega', boleto: 'Boleto ou transferência'
  };
  const FONTE_PEDIDOS = 'Pedidos';
  const ORIGENS_PADRAO = ['Venda de balcão', 'iFood / aplicativo', 'Encomenda fora do app', 'Outras entradas'];
  const FONTE_PROLABORE = 'Pró-labore';
  const FONTE_CONTAS_FIXAS = 'Contas fixas';
  const CATEGORIAS_PADRAO = ['Ingredientes', 'Embalagens', 'Contas fixas', 'Equipamentos e utensílios', 'Entrega e transporte', 'Taxas e tarifas', 'Marketing', 'Pró-labore', 'Outras saídas'];

  // Junta os pagamentos dos pedidos (entradas automáticas) com os lançamentos feitos à mão.
  function movimentos(pedidos, lancamentos, nomeDoPedido) {
    const lst = [];
    (pedidos || []).forEach(function (p) {
      if (p.excluidoEm) return;
      (p.pagamentos || []).forEach(function (pg) {
        if (!numOk(pg.valor) || !pg.data) return;
        lst.push({
          id: 'pg:' + p.id + ':' + (pg.id || pg.data), tipo: 'entrada', data: pg.data, valor: pg.valor,
          descricao: (pg.tipo === 'sinal' ? 'Sinal' : 'Pagamento') + ' do pedido de ' + (nomeDoPedido ? nomeDoPedido(p) : (p.clienteNome || 'cliente')),
          fonte: FONTE_PEDIDOS, forma: pg.forma || '', pedidoId: p.id, pedidoCancelado: p.status === 'cancelado', automatico: true
        });
      });
    });
    (lancamentos || []).forEach(function (l) {
      if (l.excluidoEm || !numOk(l.valor) || !l.data || l.tipo === 'reserva') return;
      lst.push({
        id: l.id, tipo: l.tipo === 'saida' ? 'saida' : 'entrada', data: l.data, valor: l.valor,
        descricao: l.descricao || l.categoria || '', fonte: l.categoria || (l.tipo === 'saida' ? 'Outras saídas' : 'Outras entradas'),
        forma: l.forma || '', lancamentoId: l.id, nItensCompra: (l.itensCompra || []).length
      });
    });
    return lst.sort((a, b) => String(b.data).localeCompare(String(a.data)) || String(a.descricao).localeCompare(String(b.descricao)));
  }
  function semAcento(s) { return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); }
  // filtro: { de, ate, tipo: 'todos'|'entrada'|'saida', fontes: [], busca }
  function filtrarMovimentos(lst, f) {
    f = f || {};
    const fontes = (f.fontes || []).map(semAcento);
    const q = semAcento(f.busca);
    return lst.filter(m =>
      (!f.de || m.data >= f.de) && (!f.ate || m.data <= f.ate) &&
      (!f.tipo || f.tipo === 'todos' || m.tipo === f.tipo) &&
      (!fontes.length || fontes.indexOf(semAcento(m.fonte)) >= 0) &&
      (!q || semAcento(m.descricao + ' ' + m.fonte).indexOf(q) >= 0));
  }
  function resumoCaixa(lst) {
    const r = { entradas: 0, saidas: 0, retiradas: 0, despesas: 0, saldo: 0, n: lst.length, porFonte: { entrada: {}, saida: {} } };
    lst.forEach(function (m) {
      if (m.tipo === 'entrada') r.entradas += m.valor; else { r.saidas += m.valor; if (semAcento(m.fonte) === semAcento(FONTE_PROLABORE)) r.retiradas += m.valor; }
      const pf = r.porFonte[m.tipo];
      pf[m.fonte] = (pf[m.fonte] || 0) + m.valor;
    });
    r.entradas = round2(r.entradas); r.saidas = round2(r.saidas); r.retiradas = round2(r.retiradas);
    r.despesas = round2(r.saidas - r.retiradas); r.saldo = round2(r.entradas - r.saidas); r.lucro = round2(r.entradas - r.despesas);
    return r;
  }
  function periodoPreset(preset, hoje) {
    const [y, m] = hoje.split('-').map(Number);
    const fimMes = (yy, mm) => dataISO(new Date(yy, mm, 0));
    switch (preset) {
      case 'hoje': return { de: hoje, ate: hoje };
      case '7dias': return { de: somarDias(hoje, -6), ate: hoje };
      case '30dias': return { de: somarDias(hoje, -29), ate: hoje };
      case 'mesPassado': { const d = new Date(y, m - 2, 1); return { de: dataISO(d), ate: fimMes(d.getFullYear(), d.getMonth() + 1) }; }
      case 'ano': return { de: y + '-01-01', ate: y + '-12-31' };
      default: return { de: hoje.slice(0, 8) + '01', ate: fimMes(y, m) }; // mês atual
    }
  }
  // Agrupa por dia (até 31 dias), semana (até ~6 meses) ou mês, para o gráfico.
  function agruparPeriodo(lst, de, ate) {
    const dias = diasEntre(de, ate) + 1;
    const modo = dias <= 31 ? 'dia' : dias <= 186 ? 'semana' : 'mes';
    const baldes = [], idx = {};
    function chave(iso) {
      if (modo === 'dia') return iso;
      if (modo === 'mes') return iso.slice(0, 7);
      const d = paraData(iso); d.setDate(d.getDate() - d.getDay()); return dataISO(d); // semana começa no domingo
    }
    let cur = de;
    while (cur <= ate) {
      const k = chave(cur);
      if (!(k in idx)) {
        idx[k] = baldes.length;
        const d = paraData(cur);
        const rot = modo === 'mes' ? ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][d.getMonth()] + (de.slice(0, 4) !== ate.slice(0, 4) ? '/' + String(d.getFullYear()).slice(2) : '')
          : String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
        baldes.push({ chave: k, rotulo: rot, entradas: 0, saidas: 0 });
      }
      cur = somarDias(cur, 1);
    }
    lst.forEach(function (m) {
      if (m.data < de || m.data > ate) return;
      const b = baldes[idx[chave(m.data)]]; if (!b) return;
      if (m.tipo === 'entrada') b.entradas += m.valor; else b.saidas += m.valor;
    });
    return { modo: modo, baldes: baldes };
  }
  function csvMovimentos(lst) {
    const c = v => { const s = String(v === null || v === undefined ? '' : v); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const linhas = [['Data', 'Tipo', 'Fonte', 'Descrição', 'Forma de pagamento', 'Valor'].join(';')];
    lst.slice().sort((a, b) => String(a.data).localeCompare(String(b.data))).forEach(function (m) {
      linhas.push([m.data.split('-').reverse().join('/'), m.tipo === 'entrada' ? 'Entrada' : 'Saída', c(m.fonte), c(m.descricao),
        c(FORMAS_LANCAMENTO[m.forma] || m.forma || ''), ((m.tipo === 'saida' ? -1 : 1) * m.valor).toFixed(2).replace('.', ',')].join(';'));
    });
    return '\ufeff' + linhas.join('\r\n');
  }

  // Compra de ingrediente: grava o ponto no histórico (na data da compra) e
  // o preço atual passa a ser o do ponto mais recente. Reeditar a mesma compra
  // substitui o ponto dela em vez de acrescentar outro.
  // Momento de cada ponto do histórico (aceita "AAAA-MM-DD", horário local ou ISO com fuso)
  function momento(x) { const t = new Date(String(x && x.data || '')).getTime(); return isFinite(t) ? t : 0; }
  function ordenarHistorico(h) { return h.sort((a, b) => momento(a) - momento(b)); }
  // Compra com data de hoje vale a partir de agora; de outro dia, a partir do fim daquele dia.
  function momentoDaCompra(data) {
    const agora = new Date();
    return data === dataISO(agora) ? agora.toISOString() : new Date(data + 'T23:59:59').toISOString();
  }
  function recalcularPrecoAtual(ing) {
    const h = ing.historico || [];
    const ult = h[h.length - 1];
    if (ult && numOk(ult.valorPago) && numOk(ult.qtdEmbalagem) && ult.unidade) {
      ing.valorPago = ult.valorPago; ing.qtdEmbalagem = ult.qtdEmbalagem; ing.unidade = ult.unidade;
    }
    return ing;
  }
  function aplicarCompra(ing, it, data, chave) {
    const un = normUn(it.unidade || ing.unidade);
    const tamBase = paraBase(it.qtdEmbalagem, un);
    if (!(it.embalagens > 0) || !(tamBase > 0) || !(numOk(it.valor) && it.valor >= 0) || !mesmaFamilia(un, ing.unidade)) return null;
    const novo = JSON.parse(JSON.stringify(ing));
    const precoEmb = Math.round(it.valor / it.embalagens * 10000) / 10000;
    const ponto = { data: momentoDaCompra(data), valorPago: precoEmb, qtdEmbalagem: it.qtdEmbalagem, unidade: un, porBase: precoEmb / tamBase, compra: chave };
    const h = (novo.historico || []).filter(x => x.compra !== chave);
    h.push(ponto);
    ordenarHistorico(h);
    novo.historico = h;
    const antes = custoIngrediente(ing);
    recalcularPrecoAtual(novo);
    const depois = custoIngrediente(novo);
    return { ing: novo, precoAtualMudou: h[h.length - 1] === ponto, variacao: antes && depois && antes.porBase > 0 ? depois.porBase / antes.porBase - 1 : null };
  }
  function removerCompra(ing, chave) {
    if (!(ing.historico || []).some(x => x.compra === chave)) return null;
    const novo = JSON.parse(JSON.stringify(ing));
    novo.historico = ordenarHistorico(novo.historico.filter(x => x.compra !== chave));
    return recalcularPrecoAtual(novo);
  }


  // ---------- Estoque ----------
  // Cada entrada, uso, contagem ou perda é um registro próprio (não se sobrescrevem
  // entre aparelhos). A quantidade de um item é a soma dos registros dele.
  const MOTIVOS_ESTOQUE = {
    compra: 'Compra', producao: 'Usado na produção', ajuste: 'Contagem', entrada: 'Entrada',
    perda: 'Perda ou descarte', venda: 'Venda', vitrine: 'Feito para a vitrine'
  };
  const STATUS_COM_BAIXA = ['producao', 'pronto', 'entregue'];
  function chaveIng(id) { return 'ing:' + id; }
  function chaveVitrine(receitaId, variacaoId) { return 'vit:' + receitaId + ':' + variacaoId; }
  // Validade: a mais próxima entre os lotes que entraram desde a última vez que o
  // item zerou. Uma contagem com validade substitui as anteriores.
  function saldosEstoque(movs) {
    const s = {};
    (movs || []).filter(m => !m.excluidoEm && numOk(m.qtd) && m.item)
      .sort((a, b) => String(a.data).localeCompare(String(b.data)) || String(a.criadoEm || '').localeCompare(String(b.criadoEm || '')))
      .forEach(function (m) {
        const x = s[m.item] || (s[m.item] = { item: m.item, qtd: 0, validades: [], ultimaData: null, n: 0 });
        x.qtd += m.qtd; x.n++; x.ultimaData = m.data;
        if (x.qtd <= 1e-9) x.validades = [];
        else if (m.motivo === 'ajuste' && m.validade) x.validades = [m.validade];
        else if (m.qtd > 0 && m.validade) x.validades.push(m.validade);
      });
    Object.values(s).forEach(function (x) {
      x.qtd = Math.round(x.qtd * 1e6) / 1e6;
      x.validade = x.qtd > 0 && x.validades.length ? x.validades.slice().sort()[0] : null;
      delete x.validades;
    });
    return s;
  }
  // Quanto de cada ingrediente um pedido consome (base: g, ml ou un)
  function baixaDoPedido(p, ctx) {
    const nx = necessidades([p], ctx), out = {};
    Object.values(nx.compras).forEach(c => { if (c.qtdBase > 0) out[c.ingredienteId] = c.qtdBase; });
    return out;
  }
  function assinaturaItensPedido(p) {
    return (p.itens || []).filter(it => it.tipo === 'rec').map(it => it.receitaId + '|' + it.variacaoId + '|' + it.qtd).sort().join(';');
  }
  // O que fazer com a baixa de estoque de um pedido ao salvar
  function acaoBaixaPedido(statusAntes, statusDepois, temBaixa, assinaturaMudou) {
    const dentro = s => STATUS_COM_BAIXA.indexOf(s) >= 0;
    if (statusDepois === 'cancelado') return 'nada';            // o que já foi usado continua usado
    if (dentro(statusDepois)) {
      if (temBaixa) return assinaturaMudou ? 'atualizar' : 'nada';
      return dentro(statusAntes) ? 'nada' : 'criar';             // pedidos antigos não descontam retroativamente
    }
    return temBaixa ? 'remover' : 'nada';                        // voltou para orçamento ou confirmado
  }
  // Lista de compras descontando o que já tem
  function comprasComEstoque(compras, saldos, ingredientes) {
    return Object.values(compras).map(function (c) {
      const ing = ingredientes[c.ingredienteId];
      const tem = Math.max(0, (saldos[chaveIng(c.ingredienteId)] || {}).qtd || 0);
      const falta = Math.max(0, c.qtdBase - tem);
      const emb = ing ? paraBase(ing.qtdEmbalagem, ing.unidade) : null;
      const r = Object.assign({}, c, { tem: tem, falta: falta });
      r.embalagensFalta = emb > 0 ? Math.ceil(falta / emb - 1e-9) : null;
      r.custoFalta = emb > 0 ? r.embalagensFalta * (ing.valorPago || 0) : null;
      return r;
    });
  }
  function situacaoEstoque(saldo, minimo, hoje, diasAlerta) {
    const q = saldo ? saldo.qtd : 0;
    const r = { qtd: q, negativo: q < -1e-9, abaixoMinimo: numOk(minimo) && minimo > 0 && q < minimo, validade: saldo ? saldo.validade : null };
    if (r.validade && hoje) {
      const d = diasEntre(hoje, r.validade);
      r.diasParaVencer = d; r.vencido = d < 0; r.venceLogo = d >= 0 && d <= (diasAlerta || 0);
    }
    return r;
  }
  // Produção em vários dias: quanto de cada receita, dia a dia
  function producaoPorDia(pedidos, ctx) {
    const porDia = {};
    (pedidos || []).forEach(p => { (porDia[p.dataEntrega] = porDia[p.dataEntrega] || []).push(p); });
    const out = {};
    Object.keys(porDia).sort().forEach(function (dia) {
      const nx = necessidades(porDia[dia], ctx);
      Object.values(nx.producao).forEach(x => { (out[x.receitaId] = out[x.receitaId] || []).push({ dia: dia, qtdBase: x.qtdBase }); });
    });
    return out;
  }


  // ---------- Financeiro ----------
  function mesDe(iso) { return String(iso || '').slice(0, 7); }
  function somarMeses(mes, n) { const [y, m] = mes.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); }
  function limitesMes(mes) { const [y, m] = mes.split('-').map(Number); return { de: mes + '-01', ate: dataISO(new Date(y, m, 0)) }; }
  function nomeMes(mes, curto) {
    const [y, m] = mes.split('-').map(Number);
    const n = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'][m - 1];
    return curto ? n.slice(0, 3) + '/' + String(y).slice(2) : n + ' de ' + y;
  }
  // Média das "Contas fixas" pagas nos últimos 3 meses completos (só meses com lançamento)
  function mediaContasFixas(lancamentos, hoje) {
    const atual = mesDe(hoje), meses = [somarMeses(atual, -3), somarMeses(atual, -2), somarMeses(atual, -1)];
    const tot = {}; meses.forEach(m => { tot[m] = 0; });
    const itens = {};
    (lancamentos || []).forEach(function (l) {
      if (l.excluidoEm || l.tipo !== 'saida' || !numOk(l.valor) || semAcento(l.categoria) !== semAcento(FONTE_CONTAS_FIXAS)) return;
      const m = mesDe(l.data); if (!(m in tot)) return;
      tot[m] += l.valor;
      const k = (l.descricao || 'Sem descrição').trim(); itens[k] = (itens[k] || 0) + l.valor;
    });
    const com = meses.filter(m => tot[m] > 0);
    if (!com.length) return { media: null, meses: meses.map(m => ({ mes: m, total: 0 })), considerados: 0, itens: [] };
    return {
      media: round2(com.reduce((s, m) => s + tot[m], 0) / com.length), considerados: com.length,
      meses: meses.map(m => ({ mes: m, total: round2(tot[m]) })),
      itens: Object.keys(itens).map(k => ({ descricao: k, media: round2(itens[k] / com.length) })).sort((a, b) => b.media - a.media)
    };
  }
  // Contas a pagar: "paga" quando o lançamento ligado a ela existe no Caixa
  function statusConta(c, lancamentos, hoje) {
    const l = c.lancamentoId && lancamentos[c.lancamentoId];
    if (l && !l.excluidoEm) return { status: 'paga', pagaEm: l.data, valorPago: l.valor };
    const d = diasEntre(hoje, c.vencimento);
    return { status: d < 0 ? 'vencida' : d === 0 ? 'hoje' : 'aberta', dias: d };
  }
  function vencimentoNoMes(mes, dia) {
    const ultimo = Number(limitesMes(mes).ate.slice(8));
    return mes + '-' + String(Math.min(Math.max(1, dia || 1), ultimo)).padStart(2, '0');
  }
  // Recorrentes: cria a conta de cada mês (do início até o mês atual, no máximo 3 meses para trás).
  // O id é fixo por recorrência e mês, então dois aparelhos nunca criam a mesma conta duas vezes.
  function contasRecorrentesAGerar(recorrencias, contasExistentes, hoje) {
    const atual = mesDe(hoje), novas = [];
    (recorrencias || []).forEach(function (r) {
      if (r.excluidoEm || r.ativa === false || !r.inicio) return;
      let m = r.inicio > somarMeses(atual, -2) ? r.inicio : somarMeses(atual, -2);
      while (m <= atual && (!r.fim || m <= r.fim)) {
        const id = 'rec:' + r.id + ':' + m;
        if (!contasExistentes[id]) novas.push({ id: id, descricao: r.descricao, categoria: r.categoria || FONTE_CONTAS_FIXAS, valor: r.valor, vencimento: vencimentoNoMes(m, r.dia), recorrenciaId: r.id, competencia: m, lancamentoId: '', obs: '' });
        m = somarMeses(m, 1);
      }
    });
    return novas;
  }
  // A receber (fiado): o que falta pagar em pedidos, por cliente
  function aReceber(pedidos, ctx, nomeDoPedido) {
    const grupos = {};
    let entregue = 0, aberto = 0;
    (pedidos || []).forEach(function (p) {
      if (p.excluidoEm || ['cancelado', 'orcamento'].indexOf(p.status) >= 0) return;
      const c = calcularPedido(p, ctx);
      if (!(c.restante > 0.004)) return;
      const k = p.clienteId || ('nome:' + (p.clienteNome || ''));
      const g = grupos[k] || (grupos[k] = { clienteId: p.clienteId, nome: nomeDoPedido ? nomeDoPedido(p) : p.clienteNome, total: 0, entregue: 0, itens: [] });
      g.total += c.restante;
      if (p.status === 'entregue') { g.entregue += c.restante; entregue += c.restante; } else aberto += c.restante;
      g.itens.push({ pedidoId: p.id, data: p.dataEntrega, status: p.status, total: c.total, restante: c.restante, resumo: (p.itens || []).map(it => num(it.qtd) + 'x ' + (it.nome || 'Item')).join(', ') });
    });
    const lst = Object.values(grupos).map(g => Object.assign(g, { total: round2(g.total), entregue: round2(g.entregue), itens: g.itens.sort((a, b) => String(a.data).localeCompare(String(b.data))) }))
      .sort((a, b) => b.entregue - a.entregue || b.total - a.total);
    return { grupos: lst, entregue: round2(entregue), aberto: round2(aberto) };
  }
  function textoCobranca(grupo, cfg, hoje) {
    const c = mesclarConfig(cfg), nome = String(grupo.nome || '').trim().split(/\s+/)[0];
    const its = grupo.itens.filter(i => i.status === 'entregue');
    const lista = (its.length ? its : grupo.itens).map(i => '• Pedido de ' + (i.data ? i.data.split('-').reverse().slice(0, 2).join('/') : '') + ': falta ' + brl(i.restante)).join('\n');
    const total = its.length ? grupo.entregue : grupo.total;
    return 'Olá' + (nome ? ', ' + nome : '') + ', tudo bem? Passando para lembrar do valor em aberto:\n\n' + lista + '\n\n*Total: ' + brl(total) + '*\n\nPode ser por Pix ou como preferir. Qualquer dúvida, é só chamar!\n\n' + (c.doceria.nome || 'Doce Astro') + (c.doceria.instagram ? '\n' + c.doceria.instagram : '');
  }
  // Reserva: depósitos (+) e resgates (−) ficam em lançamentos do tipo "reserva"
  function resumoReserva(lancamentos, cfg, mes, entradasMes) {
    const c = mesclarConfig(cfg);
    let saldo = 0, guardadoMes = 0;
    const hist = [];
    (lancamentos || []).forEach(function (l) {
      if (l.excluidoEm || l.tipo !== 'reserva' || !numOk(l.valor)) return;
      saldo += l.valor; hist.push(l);
      if (mesDe(l.data) === mes && l.valor > 0) guardadoMes += l.valor;
    });
    const pct = numOk(c.reservaPct) ? c.reservaPct : 0;
    const sugerido = round2((entradasMes || 0) * pct / 100);
    return { saldo: round2(saldo), pct: pct, sugeridoMes: sugerido, guardadoMes: round2(guardadoMes), faltaGuardar: round2(Math.max(0, sugerido - guardadoMes)),
      meta: numOk(c.reservaMeta) && c.reservaMeta > 0 ? c.reservaMeta : null, historico: hist.sort((a, b) => String(b.data).localeCompare(String(a.data))) };
  }
  function proLaboreDesejado(cfg) {
    const c = mesclarConfig(cfg), m = c.maoObra || {};
    if (m.modo === 'salario') return numOk(m.salario) ? m.salario : null;
    return numOk(m.valorHora) && numOk(m.horasTrabalhadas) ? m.valorHora * m.horasTrabalhadas : null;
  }

  // ---------- Relatórios ----------
  // Produtos vendidos no período: pedidos entregues (pela data de entrega) e vendas da vitrine
  function produtosVendidos(pedidos, lancamentos, ctx, de, ate) {
    const mapa = {};
    function soma(chave, nome, qtd, receita, custoUnit, custoVarUnit) {
      const x = mapa[chave] || (mapa[chave] = { chave: chave, nome: nome, qtd: 0, receita: 0, custo: 0, custoVariavel: 0, custoCompleto: true });
      x.qtd += qtd; x.receita += receita;
      if (numOk(custoUnit)) x.custo += custoUnit * qtd; else x.custoCompleto = false;
      x.custoVariavel += (numOk(custoVarUnit) ? custoVarUnit : (numOk(custoUnit) ? custoUnit : 0)) * qtd;
    }
    const varDe = {};
    function variacao(rid, vid) {
      const k = rid + ':' + vid;
      if (!(k in varDe)) { const r = ctx.receitas[rid]; varDe[k] = r ? (calcularReceita(r, ctx).variacoes || []).find(v => v.id === vid) || null : null; }
      return varDe[k];
    }
    (pedidos || []).forEach(function (p) {
      if (p.excluidoEm || p.status !== 'entregue' || !p.dataEntrega || p.dataEntrega < de || p.dataEntrega > ate) return;
      (p.itens || []).forEach(function (it) {
        if (!numOk(it.qtd) || it.qtd <= 0) return;
        const pu = numOk(it.precoUnit) ? it.precoUnit : 0;
        if (it.tipo === 'rec') {
          const v = variacao(it.receitaId, it.variacaoId);
          soma('rec:' + it.receitaId + ':' + it.variacaoId, it.nome || 'Produto', it.qtd, it.qtd * pu, numOk(it.custoUnit) ? it.custoUnit : v && v.custo, v && v.custoVariavel);
        } else soma('avulso:' + semAcento(it.nome), it.nome || 'Item avulso', it.qtd, it.qtd * pu, it.custoUnit, it.custoUnit);
      });
    });
    (lancamentos || []).forEach(function (l) {
      if (l.excluidoEm || l.tipo !== 'entrada' || !l.vitrine || !l.data || l.data < de || l.data > ate) return;
      const [, rid, vid] = String(l.vitrine.item).split(':');
      const v = variacao(rid, vid), r = ctx.receitas[rid];
      soma('rec:' + rid + ':' + vid, r ? (r.nome || 'Receita') + ' (' + ((r.variacoes || []).find(x => x.id === vid) || {}).nome + ')' : 'Produto', l.vitrine.qtd, l.valor, v && v.custo, v && v.custoVariavel);
    });
    return Object.values(mapa).map(x => Object.assign(x, { receita: round2(x.receita), lucro: x.custoCompleto ? round2(x.receita - x.custo) : null }));
  }
  function pontoEquilibrio(fixosMes, proLabore, vendas, custoVariavel) {
    const mc = vendas > 0 ? (vendas - custoVariavel) / vendas : null;
    const alvo = (fixosMes || 0) + (proLabore || 0);
    return { margemContribuicao: mc, custosACobrir: round2(alvo), valor: numOk(mc) && mc > 0 ? round2(alvo / mc) : null };
  }
  function resumoMes(mes, dados, ctx) {
    const lim = limitesMes(mes);
    const movs = filtrarMovimentos(movimentos(dados.pedidos, dados.lancamentos, dados.nome), lim);
    const cx = resumoCaixa(movs);
    const entregues = (dados.pedidos || []).filter(p => !p.excluidoEm && p.status === 'entregue' && p.dataEntrega >= lim.de && p.dataEntrega <= lim.ate);
    const vendido = round2(entregues.reduce((s, p) => s + calcularPedido(p, ctx).total, 0));
    const guardado = round2((dados.lancamentos || []).filter(l => !l.excluidoEm && l.tipo === 'reserva' && l.valor > 0 && mesDe(l.data) === mes).reduce((s, l) => s + l.valor, 0));
    return { mes: mes, recebido: cx.entradas, despesas: cx.despesas, lucro: cx.lucro, retiradas: cx.retiradas, saldo: cx.saldo, guardado: guardado,
      pedidosEntregues: entregues.length, vendido: vendido, ticketMedio: entregues.length ? round2(vendido / entregues.length) : null, porFonte: cx.porFonte };
  }
  function variacaoPct(atual, anterior) { return numOk(atual) && numOk(anterior) && Math.abs(anterior) > 0.004 ? (atual - anterior) / Math.abs(anterior) : null; }
  function projecaoMes(valorAteHoje, mes, hoje) {
    const lim = limitesMes(mes), dias = Number(lim.ate.slice(8));
    if (hoje < lim.de) return null;
    if (hoje > lim.ate) return valorAteHoje;
    const passados = Number(hoje.slice(8));
    return round2(valorAteHoje / passados * dias);
  }
  function csvRelatorio(serie, ranking) {
    const d = v => numOk(v) ? v.toFixed(2).replace('.', ',') : '';
    const c = v => { const s = String(v === null || v === undefined ? '' : v); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const L = ['Mês;Recebido;Despesas;Lucro;Pró-labore;Guardado na reserva;Pedidos entregues;Vendido em pedidos;Ticket médio'];
    serie.forEach(r => L.push([nomeMes(r.mes), d(r.recebido), d(r.despesas), d(r.lucro), d(r.retiradas), d(r.guardado), r.pedidosEntregues, d(r.vendido), d(r.ticketMedio)].join(';')));
    if (ranking && ranking.length) {
      L.push(''); L.push('Produto;Quantidade;Vendido;Lucro estimado');
      ranking.forEach(p => L.push([c(p.nome), String(p.qtd).replace('.', ','), d(p.receita), d(p.lucro)].join(';')));
    }
    return '\ufeff' + L.join('\r\n');
  }


  // ---------- Pró-labore disponível ----------
  // Cada preço já traz a parte do seu trabalho (a mão de obra da receita).
  // Disponível = parte liberada pelas vendas − retiradas registradas.
  const ORIGENS_NAO_VENDA = ['outras entradas'];
  function proLaboreDisponivel(pedidos, lancamentos, ctx, nomeDoPedido) {
    const prod = {};
    let liberado = 0, aLiberar = 0, receitaIdent = 0, moIdent = 0;
    function porProduto(chave, nome, qtd, preco, moUnit, lib) {
      const x = prod[chave] || (prod[chave] = { nome: nome, qtd: 0, receita: 0, maoObraUnit: moUnit, liberado: 0 });
      x.qtd += qtd; x.receita += preco * qtd; x.liberado += lib; x.maoObraUnit = moUnit;
    }
    (pedidos || []).forEach(function (p) {
      if (p.excluidoEm || ['cancelado', 'orcamento'].indexOf(p.status) >= 0) return;
      const c = calcularPedido(p, ctx);
      const mo = (p.itens || []).reduce((s, it, i) => s + (numOk(it.qtd) ? it.qtd : 0) * (c.itens[i].maoObraUnit || 0), 0);
      if (p.status !== 'entregue') { aLiberar += mo; return; }
      const frac = c.total > 0 ? Math.min(1, Math.max(0, c.pago / c.total)) : 0;
      liberado += mo * frac; aLiberar += mo * (1 - frac);
      (p.itens || []).forEach(function (it, i) {
        if (!numOk(it.qtd) || it.qtd <= 0) return;
        const pu = numOk(it.precoUnit) ? it.precoUnit : 0, mu = c.itens[i].maoObraUnit || 0;
        receitaIdent += it.qtd * pu * frac; moIdent += it.qtd * mu * frac;
        if (it.tipo === 'rec') porProduto('rec:' + it.receitaId + ':' + it.variacaoId, it.nome || 'Produto', it.qtd, pu, mu, it.qtd * mu * frac);
      });
    });
    let receitaAvulsa = 0;
    const retiradas = [];
    (lancamentos || []).forEach(function (l) {
      if (l.excluidoEm || !numOk(l.valor)) return;
      if (l.tipo === 'saida' && semAcento(l.categoria) === semAcento(FONTE_PROLABORE)) { retiradas.push(l); return; }
      if (l.tipo !== 'entrada') return;
      if (l.vitrine) {
        const [, rid, vid] = String(l.vitrine.item).split(':');
        const mu = numOk(l.vitrine.maoObraUnit) ? l.vitrine.maoObraUnit : maoObraItemPedido({ tipo: 'rec', receitaId: rid, variacaoId: vid }, ctx);
        const lib = mu * l.vitrine.qtd;
        liberado += lib; receitaIdent += l.valor; moIdent += lib;
        const r = ctx.receitas[rid], v = r && (r.variacoes || []).find(x => x.id === vid);
        porProduto('rec:' + rid + ':' + vid, r ? (r.nome || 'Receita') + ' (' + (v ? v.nome : 'opção') + ')' : 'Produto', l.vitrine.qtd, l.valor / l.vitrine.qtd, mu, lib);
        return;
      }
      if (ORIGENS_NAO_VENDA.indexOf(semAcento(l.categoria)) >= 0 || l.contaId) return;
      receitaAvulsa += l.valor;
    });
    // Porcentagem média: das vendas com produto; sem elas, a média das receitas cadastradas
    let pctMedio = receitaIdent > 0 ? moIdent / receitaIdent : null, pctOrigem = 'vendas';
    if (pctMedio === null) {
      let mo = 0, pr = 0;
      Object.values(ctx.receitas || {}).forEach(function (r) {
        if (r.excluidoEm) return;
        (calcularReceita(r, ctx).variacoes || []).forEach(v => { if (numOk(v.maoObra) && numOk(v.preco) && v.preco > 0) { mo += v.maoObra; pr += v.preco; } });
      });
      pctMedio = pr > 0 ? mo / pr : 0; pctOrigem = pr > 0 ? 'receitas' : 'nenhuma';
    }
    const estimado = receitaAvulsa * pctMedio;
    const retirado = retiradas.reduce((s, l) => s + l.valor, 0);
    const lista = Object.values(prod).map(x => Object.assign(x, { receita: round2(x.receita), liberado: round2(x.liberado), pct: x.receita > 0 && x.qtd > 0 ? x.maoObraUnit / (x.receita / x.qtd) : null }))
      .sort((a, b) => b.liberado - a.liberado);
    return {
      liberado: round2(liberado), estimado: round2(estimado), receitaAvulsa: round2(receitaAvulsa), pctMedio: pctMedio, pctOrigem: pctOrigem,
      aLiberar: round2(aLiberar), retirado: round2(retirado), disponivel: round2(liberado + estimado - retirado),
      porProduto: lista, retiradas: retiradas.sort((a, b) => String(b.data).localeCompare(String(a.data)))
    };
  }

  const API = {
    UNIDADES, normUn, unidadesDaFamilia, paraBase, mesmaFamilia,
    numOk, lerNum, brl, num, pct,
    CONFIG_PADRAO, mesclarConfig, totalFixos, fixosPorHora, valorHora,
    markupParaMargem, margemParaMarkup, custoIngrediente,
    calcularReceita, calcularVariacao, alvoDaReceita, receitasQueDependemDe, variacaoPreco,
    dataISO, paraData, somarDias, diasEntre, round2, FORMAS_PAGAMENTO, STATUS_PEDIDO, taxaFormaPct,
    calcularPedido, necessidades, qtdLegivel, telefoneWhats, dataFalada, horaFalada, textoWhats,
    FORMAS_LANCAMENTO, FONTE_PEDIDOS, ORIGENS_PADRAO, CATEGORIAS_PADRAO, movimentos, filtrarMovimentos, resumoCaixa,
    periodoPreset, agruparPeriodo, csvMovimentos, aplicarCompra, removerCompra, semAcento,
    FONTE_PROLABORE, FONTE_CONTAS_FIXAS, maoObraItemPedido, proLaboreDisponivel, mesDe, somarMeses, limitesMes, nomeMes, mediaContasFixas, statusConta, vencimentoNoMes,
    contasRecorrentesAGerar, aReceber, textoCobranca, resumoReserva, proLaboreDesejado, produtosVendidos, pontoEquilibrio,
    resumoMes, variacaoPct, projecaoMes, csvRelatorio,
    MOTIVOS_ESTOQUE, STATUS_COM_BAIXA, chaveIng, chaveVitrine, saldosEstoque, baixaDoPedido, assinaturaItensPedido,
    acaoBaixaPedido, comprasComEstoque, situacaoEstoque, producaoPorDia
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else raiz.Calc = API;
})(typeof window !== 'undefined' ? window : globalThis);
