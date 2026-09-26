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


  // ---------- Caixa: entradas e saídas ----------
  const FORMAS_LANCAMENTO = {
    pix: 'Pix', dinheiro: 'Dinheiro', debito: 'Cartão de débito', credito: 'Cartão de crédito',
    app: 'Aplicativo de entrega', boleto: 'Boleto ou transferência'
  };
  const FONTE_PEDIDOS = 'Pedidos';
  const ORIGENS_PADRAO = ['Venda de balcão', 'iFood / aplicativo', 'Encomenda fora do app', 'Outras entradas'];
  const CATEGORIAS_PADRAO = ['Ingredientes', 'Embalagens', 'Contas fixas', 'Equipamentos e utensílios', 'Entrega e transporte', 'Taxas e tarifas', 'Marketing', 'Outras saídas'];

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
      if (l.excluidoEm || !numOk(l.valor) || !l.data) return;
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
    const r = { entradas: 0, saidas: 0, saldo: 0, n: lst.length, porFonte: { entrada: {}, saida: {} } };
    lst.forEach(function (m) {
      if (m.tipo === 'entrada') r.entradas += m.valor; else r.saidas += m.valor;
      const pf = r.porFonte[m.tipo];
      pf[m.fonte] = (pf[m.fonte] || 0) + m.valor;
    });
    r.entradas = round2(r.entradas); r.saidas = round2(r.saidas); r.saldo = round2(r.entradas - r.saidas);
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
    const ponto = { data: data + 'T12:00:00', valorPago: precoEmb, qtdEmbalagem: it.qtdEmbalagem, unidade: un, porBase: precoEmb / tamBase, compra: chave };
    const h = (novo.historico || []).filter(x => x.compra !== chave);
    h.push(ponto);
    h.sort((a, b) => String(a.data).localeCompare(String(b.data)));
    novo.historico = h;
    const antes = custoIngrediente(ing);
    recalcularPrecoAtual(novo);
    const depois = custoIngrediente(novo);
    return { ing: novo, precoAtualMudou: h[h.length - 1] === ponto, variacao: antes && depois && antes.porBase > 0 ? depois.porBase / antes.porBase - 1 : null };
  }
  function removerCompra(ing, chave) {
    if (!(ing.historico || []).some(x => x.compra === chave)) return null;
    const novo = JSON.parse(JSON.stringify(ing));
    novo.historico = novo.historico.filter(x => x.compra !== chave);
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
    MOTIVOS_ESTOQUE, STATUS_COM_BAIXA, chaveIng, chaveVitrine, saldosEstoque, baixaDoPedido, assinaturaItensPedido,
    acaoBaixaPedido, comprasComEstoque, situacaoEstoque, producaoPorDia
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else raiz.Calc = API;
})(typeof window !== 'undefined' ? window : globalThis);
