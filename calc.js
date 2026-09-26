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
  function calcularPedido(p, ctx) {
    const cfg = mesclarConfig(ctx.config);
    let subtotal = 0, custo = 0, custoCompleto = true;
    const itens = (p.itens || []).map(function (it) {
      const q = numOk(it.qtd) ? it.qtd : 0, pu = numOk(it.precoUnit) ? it.precoUnit : 0;
      const cu = custoItemPedido(it, ctx);
      subtotal += q * pu;
      if (numOk(cu)) custo += cu * q; else if (q > 0) custoCompleto = false;
      return { id: it.id, total: q * pu, custoUnit: cu, custo: numOk(cu) ? cu * q : null };
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

  const API = {
    UNIDADES, normUn, unidadesDaFamilia, paraBase, mesmaFamilia,
    numOk, lerNum, brl, num, pct,
    CONFIG_PADRAO, mesclarConfig, totalFixos, fixosPorHora, valorHora,
    markupParaMargem, margemParaMarkup, custoIngrediente,
    calcularReceita, calcularVariacao, alvoDaReceita, receitasQueDependemDe, variacaoPreco,
    dataISO, paraData, somarDias, diasEntre, round2, FORMAS_PAGAMENTO, STATUS_PEDIDO, taxaFormaPct,
    calcularPedido, necessidades, qtdLegivel, telefoneWhats, dataFalada, horaFalada, textoWhats
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else raiz.Calc = API;
})(typeof window !== 'undefined' ? window : globalThis);
