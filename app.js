/* Espaço Nave — Doce Astro | Etapa 1: base, ingredientes, receitas e ajustes */
(function () {
  'use strict';
  const C = window.Calc;
  const VERSAO = '2.0.0';
  const TABELAS_LOCAIS = ['ingredientes', 'receitas', 'config', 'clientes', 'pedidos'];
  function dadosVazios() { const d = {}; TABELAS_LOCAIS.forEach(t => { d[t] = {}; }); return d; }

  // ================= Ícones =================
  const I = {
    emblema: '<span class="selo-vazio" aria-hidden="true"><span class="logo-estrela"></span></span>',
    inicio: p('M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'),
    receitas: p('M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9 8h6M9 12h6M9 16h3'),
    ingredientes: p('M8 3h8M9 3v3.5a5 5 0 0 1-1.6 3.6A6.5 6.5 0 0 0 5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4a6.5 6.5 0 0 0-2.4-4.9A5 5 0 0 1 15 6.5V3M6 15h12'),
    ajustes: p('M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z'),
    mais: p('M12 5v14M5 12h14'),
    busca: p('M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3'),
    lixo: p('M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6'),
    copiar: p('M9 9h11v11H9zM5 15H4V4h11v1'),
    fechar: p('M18 6 6 18M6 6l12 12'),
    alerta: p('M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z'),
    ok: p('M20 6 9 17l-5-5'),
    nuvem: p('M17.5 19a4.5 4.5 0 1 0-1.4-8.8A6 6 0 0 0 4.5 12.5 3.5 3.5 0 0 0 6 19z'),
    semNuvem: p('M3 3l18 18M17.5 19H6a3.5 3.5 0 0 1-1.2-6.8M8.5 6.3A6 6 0 0 1 16.1 10.2a4.5 4.5 0 0 1 4.2 7.3'),
    girar: p('M21 12a9 9 0 1 1-2.6-6.4M21 3v6h-6'),
    celular: p('M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM11 18h2'),
    sobe: p('M12 19V5M5 12l7-7 7 7'),
    desce: p('M12 5v14M19 12l-7 7-7-7'),
    voltar: p('M15 18l-6-6 6-6'),
    seta: p('M9 18l6-6-6-6'),
    baixar: p('M12 3v12M7 10l5 5 5-5M5 21h14'),
    enviar: p('M12 21V9M7 14l5-5 5 5M5 3h14'),
    receitaDentro: p('M4 7h16M4 12h10M4 17h7M17 14l3 3-3 3'),
    pedidos: p('M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1zM8 6H6a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-2M9 12l2 2 4-4'),
    clientes: p('M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM21 20v-1a4 4 0 0 0-3-3.9M15.5 4.2a3.5 3.5 0 0 1 0 6.6'),
    mensagem: p('M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5z')
  };
  function p(d) { return '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>'; }

  // ================= Utilidades =================
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  function esc(s) { return String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function uid() { return (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10)); }
  function agoraISO() { return new Date().toISOString(); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function inNum(v) { return C.numOk(v) ? String(Math.round(v * 10000) / 10000).replace('.', ',') : ''; }
  function dataBR(iso) { if (!iso) return '—'; const d = new Date(iso); return isNaN(d) ? '—' : d.toLocaleDateString('pt-BR'); }
  function dataHoraBR(iso) { if (!iso) return '—'; const d = new Date(iso); return isNaN(d) ? '—' : d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); }
  function normBusca(s) { return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
  function rotUn(u) { const n = C.normUn(u); return n ? C.UNIDADES[n].rotulo : (u || ''); }
  function porBaseTxt(ing) { const c = C.custoIngrediente(ing); return c ? C.brl(c.porBase, 4) + '/' + c.base : '—'; }

  // ================= Armazenamento local =================
  const Local = (function () {
    let db = null;
    function abrir() {
      return new Promise(function (res) {
        if (!('indexedDB' in window)) return res(null);
        try {
          const r = indexedDB.open('espaco-nave', 1);
          r.onupgradeneeded = () => r.result.createObjectStore('kv');
          r.onsuccess = () => { db = r.result; res(db); };
          r.onerror = () => res(null);
        } catch (e) { res(null); }
      });
    }
    function ler(k) {
      return new Promise(function (res) {
        if (!db) { try { const v = localStorage.getItem('en:' + k); return res(v ? JSON.parse(v) : null); } catch (e) { return res(null); } }
        try {
          const t = db.transaction('kv').objectStore('kv').get(k);
          t.onsuccess = () => res(t.result === undefined ? null : t.result);
          t.onerror = () => res(null);
        } catch (e) { res(null); }
      });
    }
    function gravar(k, v) {
      return new Promise(function (res) {
        if (!db) { try { localStorage.setItem('en:' + k, JSON.stringify(v)); } catch (e) { /* cheio */ } return res(); }
        try {
          const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k);
          t.oncomplete = () => res(); t.onerror = () => res();
        } catch (e) { res(); }
      });
    }
    return { abrir, ler, gravar };
  })();

  // ================= Estado =================
  const S = {
    dados: dadosVazios(),
    fila: [],
    meta: { modo: null, url: '', pin: '', ultimaSync: '', conflitos: [], tema: 'auto', fonte: 1 },
    sync: { estado: 'demo', msg: '', rodando: false },
    rota: '', editor: null
  };
  let timerSalvar = null;
  // Diário de segurança: cada alteração vai na hora (de forma síncrona) para o
  // localStorage; o banco principal (IndexedDB) é gravado logo depois. Se o app
  // fechar no meio, o diário é reaplicado ao abrir.
  function lsLer(k) { try { const v = localStorage.getItem('en:' + k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function lsGravar(k, v) { try { localStorage.setItem('en:' + k, JSON.stringify(v)); } catch (e) { /* cheio */ } }
  function anotarDiario(entrada) { const d = lsLer('diario') || []; d.push(entrada); lsGravar('diario', d); }
  function gravarJa() {
    clearTimeout(timerSalvar); timerSalvar = null;
    const n = (lsLer('diario') || []).length;
    return Promise.all([Local.gravar('dados', S.dados), Local.gravar('fila', S.fila), Local.gravar('meta', S.meta)]).then(function () {
      const d = lsLer('diario') || []; lsGravar('diario', d.slice(n));
    });
  }
  function salvarLocal() {
    S.meta.salvoEm = Date.now();
    lsGravar('meta', S.meta);
    clearTimeout(timerSalvar);
    timerSalvar = setTimeout(gravarJa, 150);
  }
  function reaplicarDiario() {
    const d = lsLer('diario') || [];
    d.forEach(function (x) {
      if (!S.dados[x.tabela]) S.dados[x.tabela] = {};
      const loc = S.dados[x.tabela][x.rec.id];
      if (!loc || String(loc.atualizadoEm || '') <= String(x.rec.atualizadoEm || '')) S.dados[x.tabela][x.rec.id] = x.rec;
      if (!x.naFila) return;
      const pend = S.fila.find(m => m.tabela === x.tabela && m.rec.id === x.rec.id);
      if (pend) { if (String(pend.rec.atualizadoEm) < String(x.rec.atualizadoEm)) pend.rec = x.rec; }
      else S.fila.push({ tabela: x.tabela, base: x.base, rec: x.rec });
    });
    return d.length;
  }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden' && timerSalvar) gravarJa(); });
  window.addEventListener('pagehide', function () { if (timerSalvar) gravarJa(); });
  function lista(t) { return Object.values(S.dados[t] || {}).filter(r => !r.excluidoEm); }
  function cfg() { return C.mesclarConfig(S.dados.config.geral); }
  function ctxCalc(extra) {
    const receitas = Object.assign({}, S.dados.receitas);
    if (extra) receitas[extra.id] = extra;
    return { ingredientes: S.dados.ingredientes, receitas: receitas, config: S.dados.config.geral };
  }

  function gravarRegistro(tabela, rec) {
    const ant = S.dados[tabela][rec.id];
    const agora = agoraISO();
    rec.atualizadoEm = agora;
    if (!rec.criadoEm) rec.criadoEm = ant && ant.criadoEm || agora;
    S.dados[tabela][rec.id] = rec;
    const pend = S.fila.find(m => m.tabela === tabela && m.rec.id === rec.id);
    const base = pend ? pend.base : (ant ? ant.atualizadoEm : null);
    if (pend) pend.rec = clone(rec);
    else S.fila.push({ tabela: tabela, base: base, rec: clone(rec) });
    anotarDiario({ tabela: tabela, rec: clone(rec), base: base, naFila: true });
    salvarLocal();
    agendarSync(1500);
    atualizarPilula();
  }
  function excluirRegistro(tabela, id) {
    const r = S.dados[tabela][id]; if (!r) return;
    const c = clone(r); c.excluidoEm = agoraISO();
    gravarRegistro(tabela, c);
  }

  // ================= Sincronização =================
  let timerSync = null;
  function agendarSync(ms) { clearTimeout(timerSync); timerSync = setTimeout(sincronizar, ms || 0); }

  async function chamar(corpo) {
    const r = await fetch(S.meta.url, {
      method: 'POST', redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(corpo)
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }

  const ERROS = {
    pin: 'PIN incorreto. Confira em Ajustes.',
    bloqueado: 'Muitas tentativas com PIN errado. Aguarde 10 minutos.',
    sem_pin: 'A planilha ainda não tem PIN. Rode a função "instalar" no Apps Script.',
    servidor: 'A planilha respondeu com erro.',
    formato: 'Resposta inválida da planilha.'
  };

  async function sincronizar() {
    if (S.meta.modo !== 'planilha' || !S.meta.url) { S.sync.estado = 'demo'; atualizarPilula(); return; }
    if (S.sync.rodando) { agendarSync(3000); return; }
    if (!navigator.onLine) { S.sync.estado = 'offline'; atualizarPilula(); return; }
    S.sync.rodando = true; S.sync.estado = 'enviando'; atualizarPilula();
    const enviados = S.fila.map(m => ({ tabela: m.tabela, id: m.rec.id, em: m.rec.atualizadoEm }));
    try {
      const resp = await chamar({ acao: 'sync', pin: S.meta.pin, desde: S.meta.ultimaSync, mudancas: S.fila.map(clone) });
      if (!resp || !resp.ok) {
        S.sync.estado = resp && resp.erro === 'pin' ? 'pin' : 'erro';
        S.sync.msg = ERROS[resp && resp.erro] || 'Não foi possível sincronizar.';
      } else {
        // tira da fila o que foi enviado e não mudou depois
        S.fila = S.fila.filter(m => !enviados.some(e => e.tabela === m.tabela && e.id === m.rec.id && e.em === m.rec.atualizadoEm));
        const pendentes = new Set(S.fila.map(m => m.tabela + ':' + m.rec.id));
        let mudouAlgo = false;
        (resp.registros || []).forEach(function (x) {
          if (!S.dados[x.tabela]) S.dados[x.tabela] = {};
          if (pendentes.has(x.tabela + ':' + x.rec.id)) return;
          const loc = S.dados[x.tabela][x.rec.id];
          if (!loc || loc.atualizadoEm !== x.rec.atualizadoEm) { S.dados[x.tabela][x.rec.id] = x.rec; mudouAlgo = true; }
        });
        (resp.conflitos || []).forEach(function (c) {
          if (c.vencedora) { S.dados[c.tabela][c.id] = c.vencedora; mudouAlgo = true; }
          if (c.perdida) S.meta.conflitos.push({ id: uid(), tabela: c.tabela, regId: c.id, em: agoraISO(), perdida: c.perdida, vencedora: c.vencedora });
        });
        S.meta.ultimaSync = resp.agora;
        S.sync.estado = 'ok'; S.sync.msg = '';
        salvarLocal();
        if ((resp.conflitos || []).length) toast((resp.conflitos.length === 1 ? 'Um registro foi alterado em dois aparelhos.' : resp.conflitos.length + ' registros foram alterados em dois aparelhos.') + ' Confira a versão que ficou de fora.', 'Ver', () => ir('#/ajustes'));
        if (mudouAlgo && !(S.editor && S.editor.sujo)) { S.editor = null; render(false); }
        if (S.fila.length) agendarSync(1000);
      }
    } catch (e) {
      S.sync.estado = navigator.onLine ? 'erro' : 'offline';
      S.sync.msg = navigator.onLine ? 'Não foi possível falar com a planilha. Confira o endereço em Ajustes.' : '';
    } finally {
      S.sync.rodando = false; atualizarPilula();
    }
  }

  function textoSync() {
    const n = S.fila.length;
    const pend = n === 1 ? '1 alteração aguardando envio' : n + ' alterações aguardando envio';
    switch (S.sync.estado) {
      case 'demo': return { e: 'demo', t: 'Só neste aparelho', i: I.celular };
      case 'enviando': return { e: 'enviando', t: 'Sincronizando', i: I.girar };
      case 'offline': return { e: 'offline', t: n ? 'Sem internet: ' + pend : 'Sem internet', i: I.semNuvem };
      case 'erro': return { e: 'erro', t: 'Erro ao sincronizar', i: I.alerta };
      case 'pin': return { e: 'pin', t: 'PIN incorreto', i: I.alerta };
      default: return n ? { e: 'pendente', t: pend, i: I.nuvem } : { e: 'ok', t: 'Sincronizado', i: I.nuvem };
    }
  }
  function atualizarPilula() {
    const el = $('#pilula-sync'); if (!el) return;
    const s = textoSync();
    el.dataset.estado = s.e; el.innerHTML = s.i + '<span>' + esc(s.t) + '</span>';
    if (typeof atualizarEstadoAjustes === 'function') atualizarEstadoAjustes();
    el.title = S.sync.msg || s.t;
  }

  // ================= Configuração inicial =================
  // A lista de ingredientes NÃO fica aqui (o código do site é público).
  // Ela é gravada pela planilha na instalação, ou importada no modo de teste.
  function garantirConfig() {
    if (S.dados.config.geral) return false;
    gravarRegistro('config', C.mesclarConfig(null));
    return true;
  }
  function pendenteConversao(ing) { return /pendente:\s*converter em receita/i.test(ing.obs || ''); }

  // ================= Tema =================
  function aplicarTema() {
    document.documentElement.dataset.theme = S.meta.tema || 'auto';
    document.documentElement.style.setProperty('--fs', String(S.meta.fonte || 1));
    const escuro = S.meta.tema === 'dark' || (S.meta.tema !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
    const m = $('meta[name="theme-color"]'); if (m) m.content = escuro ? '#1A0A02' : '#401900';
  }

  // ================= Toast =================
  function toast(msg, rotuloAcao, fn, ms) {
    const box = $('#toasts');
    const el = document.createElement('div'); el.className = 'toast';
    el.innerHTML = '<span class="txt">' + esc(msg) + '</span>' + (rotuloAcao ? '<button type="button">' + esc(rotuloAcao) + '</button>' : '');
    if (rotuloAcao) el.querySelector('button').onclick = function () { el.remove(); fn && fn(); };
    box.appendChild(el);
    setTimeout(() => el.remove(), ms || (rotuloAcao ? 8000 : 4000));
  }

  // ================= Folha (modal) =================
  function abrirFolha(titulo, corpoHTML, aoMontar) {
    const d = document.createElement('dialog'); d.className = 'folha';
    d.innerHTML = '<div class="cab-folha"><h2>' + esc(titulo) + '</h2><button type="button" class="btn-icone" data-fechar aria-label="Fechar">' + I.fechar + '</button></div><div class="corpo-folha">' + corpoHTML + '</div>';
    document.body.appendChild(d);
    d.addEventListener('close', () => d.remove());
    d.addEventListener('click', function (e) { if (e.target === d || e.target.closest('[data-fechar]')) d.close(); });
    d.showModal();
    if (aoMontar) aoMontar(d);
    return d;
  }
  function confirmar(titulo, texto, rotuloOk, perigo) {
    return new Promise(function (res) {
      let r = false;
      const d = abrirFolha(titulo, '<p>' + texto + '</p><div class="rodape-folha"><button type="button" class="btn sec" data-fechar>Cancelar</button><button type="button" class="btn' + (perigo ? ' perigo' : '') + '" data-ok>' + esc(rotuloOk) + '</button></div>');
      d.querySelector('[data-ok]').onclick = () => { r = true; d.close(); };
      d.addEventListener('close', () => res(r));
    });
  }

  // ================= Navegação =================
  const NAV = [
    { h: '#/inicio', t: 'Início', i: I.inicio },
    { h: '#/pedidos', t: 'Pedidos', i: I.pedidos },
    { h: '#/receitas', t: 'Receitas', i: I.receitas },
    { h: '#/clientes', t: 'Clientes', i: I.clientes },
    { h: '#/ajustes', t: 'Ajustes', i: I.ajustes }
  ];
  function ir(h) { location.hash = h; }
  let ignorarHash = false, hashAnterior = '';
  window.addEventListener('hashchange', async function () {
    if (ignorarHash) { ignorarHash = false; return; }
    if (S.editor && S.editor.sujo) {
      const alvo = location.hash;
      ignorarHash = true; location.hash = hashAnterior;
      const ok = await confirmar('Sair sem salvar?', 'As alterações ainda não foram salvas.', 'Descartar alterações', true);
      if (!ok) return;
      S.editor = null; ignorarHash = false; location.hash = alvo; return;
    }
    render(true);
  });
  window.addEventListener('beforeunload', function (e) { if (S.editor && S.editor.sujo) { e.preventDefault(); e.returnValue = ''; } });

  function secaoAtiva(h) {
    const r = h.split('?')[0];
    if (r.startsWith('#/receita') || r === '#/ingredientes') return '#/receitas';
    if (r.startsWith('#/pedido') || ['#/agenda', '#/producao', '#/compras'].includes(r)) return '#/pedidos';
    if (r.startsWith('#/cliente')) return '#/clientes';
    return NAV.some(n => n.h === r) ? r : '#/inicio';
  }

  function casca(conteudo) {
    const ativa = secaoAtiva(location.hash || '#/inicio');
    const links = NAV.map(n => '<a href="' + n.h + '"' + (n.h === ativa ? ' aria-current="page"' : '') + '>' + n.i + '<span>' + n.t + '</span></a>').join('');
    return '<div class="app">' +
      '<aside class="lateral"><a class="marca-lat" href="#/inicio"><span class="logo-selo" role="img" aria-label="Doce Astro, doces artesanais"></span></a>' +
      '<nav aria-label="Seções">' + links + '</nav>' +
      '<div class="rodape-lat">Espaço Nave ' + VERSAO + '<br>Estoque, caixa e relatórios chegam nas próximas etapas.</div></aside>' +
      '<div class="principal-col"><header class="topo"><a class="marca" href="#/inicio"><span class="emblema"><span class="logo-estrela"></span></span><b>Doce Astro</b></a><span class="espaco"></span>' +
      '<button type="button" class="pilula-sync" id="pilula-sync" data-acao="pilula"></button>' +
      '<a class="btn-icone" href="#/ajustes" aria-label="Ajustes">' + I.ajustes + '</a></header>' +
      '<main class="conteudo" id="conteudo">' + conteudo + '</main></div>' +
      '<nav class="nav-baixo" aria-label="Seções">' + links + '</nav></div>';
  }

  function render(trocouRota) {
    const h = location.hash || '#/inicio';
    const mudou = trocouRota || h !== S.rota;
    // Ao trocar de tela (inclusive pelo botão Voltar), nenhuma janela fica aberta por cima
    if (h !== S.rota) $$('dialog.folha[open]').forEach(d => d.close());
    const y = window.scrollY;
    const raiz = $('#raiz');
    if (!S.meta.modo) { raiz.innerHTML = telaBoasVindas(); S.rota = h; return; }
    let html;
    const [caminho, busca] = h.replace(/^#\//, '').split('?');
    const partes = caminho.split('/');
    const q = new URLSearchParams(busca || '');
    const tipoEditor = { receita: 'receita', pedido: 'pedido' }[partes[0]];
    if (!S.editor || S.editor.tipo !== tipoEditor) S.editor = null;
    switch (partes[0]) {
      case 'receitas': html = telaReceitas(); break;
      case 'receita': html = telaEditorReceita(decodeURIComponent(partes[1] || 'nova')); break;
      case 'ingredientes': html = telaIngredientes(); break;
      case 'pedidos': html = telaPedidos(q); break;
      case 'pedido': html = telaEditorPedido(decodeURIComponent(partes[1] || 'novo'), q); break;
      case 'agenda': html = telaAgenda(); break;
      case 'producao': html = telaProducao(); break;
      case 'compras':
        if (q.get('de') && q.get('ate')) S.compras = Object.assign(S.compras || { orc: false }, { de: q.get('de'), ate: q.get('ate') });
        html = telaCompras(); break;
      case 'clientes': html = telaClientes(); break;
      case 'cliente': html = telaCliente(decodeURIComponent(partes[1] || '')); break;
      case 'ajustes': html = telaAjustes(); break;
      default: html = telaInicio();
    }
    raiz.innerHTML = casca(html);
    atualizarPilula();
    hashAnterior = h; S.rota = h;
    if (mudou) window.scrollTo(0, 0); else window.scrollTo(0, y);
    if (partes[0] === 'receita') montarEditor();
    if (partes[0] === 'ingredientes') montarFiltroIngredientes();
    if (partes[0] === 'receitas') montarFiltroReceitas();
    if (partes[0] === 'pedido') montarEditorPedido();
    if (partes[0] === 'pedidos') montarFiltroPedidos();
    if (partes[0] === 'clientes') montarFiltroClientes();
  }

  // ================= Boas-vindas =================
  function telaBoasVindas() {
    return '<div class="boas-vindas"><div class="bv-caixa">' +
      '<div class="bv-hero"><span class="logo-selo" role="img" aria-label="Doce Astro, doces artesanais"></span>' +
      '<p class="frase">Espaço Nave: pedidos, receitas e preços da doceria num lugar só.</p></div>' +
      '<div class="grade">' +
      '<form class="bloco" id="form-conectar"><h2>Conectar à planilha</h2><p class="explica">Os dados ficam na sua Planilha do Google e aparecem iguais no celular e no computador. O guia de instalação explica como conseguir o endereço.</p>' +
      '<label class="campo"><span>Endereço do app da planilha</span><input class="entrada" name="url" inputmode="url" autocomplete="off" placeholder="https://script.google.com/macros/s/…/exec" required></label>' +
      '<label class="campo" style="margin-top:10px"><span>PIN da doceria</span><input class="entrada" name="pin" type="password" autocomplete="off" required minlength="6"></label>' +
      '<p class="mudo" id="msg-conectar" style="margin-top:8px;min-height:1.5em" role="status"></p>' +
      '<button class="btn" type="submit">Conectar</button></form>' +
      '<div class="bloco"><h2>Testar sem planilha</h2><p class="explica">Os dados ficam só neste aparelho. Dá para conectar depois em Ajustes, e o que você cadastrar agora vai junto para a planilha.</p>' +
      '<button class="btn sec" type="button" data-acao="modo-demo">Começar a testar</button></div>' +
      '</div></div></div>';
  }

  async function conectar(url, pin, msgEl) {
    url = String(url || '').trim();
    if (!/^https:\/\/script\.google(usercontent)?\.com\//.test(url)) { msgEl.textContent = 'O endereço deve começar com https://script.google.com/ e terminar em /exec.'; return false; }
    msgEl.textContent = 'Conectando…';
    const antes = { url: S.meta.url, pin: S.meta.pin };
    S.meta.url = url; S.meta.pin = String(pin || '');
    try {
      const r = await chamar({ acao: 'ping', pin: S.meta.pin });
      if (!r.ok) { msgEl.textContent = ERROS[r.erro] || 'A planilha recusou a conexão.'; S.meta.url = antes.url; S.meta.pin = antes.pin; return false; }
    } catch (e) {
      msgEl.textContent = 'Não foi possível acessar esse endereço. Confira se a implantação está como "Qualquer pessoa".';
      S.meta.url = antes.url; S.meta.pin = antes.pin; return false;
    }
    S.meta.modo = 'planilha'; S.meta.ultimaSync = '';
    salvarLocal();
    await sincronizar();
    if (garantirConfig()) await sincronizar();
    return true;
  }

  // ================= Início =================
  function analisarReceitas() {
    const ctx = ctxCalc();
    const cf = cfg();
    const alerta = (cf.margemAlerta || 0) / 100;
    const res = { prejuizo: [], margemBaixa: [], incompletas: [] };
    lista('receitas').forEach(function (r) {
      const c = C.calcularReceita(r, ctx);
      if (c.avisos.some(a => /rendimento|Informe|não encontrad|incompat|Ciclo/i.test(a))) res.incompletas.push(r);
      (c.variacoes || []).forEach(function (v) {
        if (v.prejuizo) res.prejuizo.push({ r: r, v: v });
        else if (C.numOk(v.margemReal) && v.margemReal < alerta) res.margemBaixa.push({ r: r, v: v });
      });
    });
    return res;
  }

  function telaInicio() {
    const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    const nRec = lista('receitas').length, nIng = lista('ingredientes').length;
    const a = analisarReceitas();
    const cf = cfg();
    const pend = lista('ingredientes').filter(i => i.obs);
    const altas = lista('ingredientes').map(i => ({ i: i, v: C.variacaoPreco(i, 90) })).filter(x => x.v && x.v.variacao > 0.05).sort((x, y) => y.v.variacao - x.v.variacao).slice(0, 5);
    let h = '<div class="cab-pagina"><div class="titulos"><h1>Início</h1><p class="sub">' + esc(hoje.charAt(0).toUpperCase() + hoje.slice(1)) + '</p></div><div class="acoes"><a class="btn" href="#/pedido/novo">' + I.mais + 'Novo pedido</a></div></div>';

    if (S.meta.conflitos.length) {
      h += '<div class="aviso neg" style="margin-bottom:16px">' + I.alerta + '<div class="txt"><b>' + (S.meta.conflitos.length === 1 ? 'Um registro foi alterado em dois aparelhos ao mesmo tempo.' : S.meta.conflitos.length + ' registros foram alterados em dois aparelhos ao mesmo tempo.') + '</b> Ficou a versão mais recente. <a href="#/ajustes#conflitos">Ver a versão que ficou de fora</a></div></div>';
    }

    h += blocosPedidosInicio();

    if (!nRec) {
      h += '<div class="bloco vazio">' + I.emblema + '<h2>Cadastre sua primeira receita</h2><p>Com a receita cadastrada, o app calcula o custo de cada doce, sugere o preço e avisa quando algum produto dá prejuízo.</p><a class="btn" href="#/receita/nova">' + I.mais + 'Nova receita</a></div>';
    }

    h += '<div class="stats"><a class="stat" href="#/receitas" style="text-decoration:none"><div class="n">' + nRec + '</div><div class="r">receitas cadastradas</div></a>' +
      '<a class="stat" href="#/ingredientes" style="text-decoration:none"><div class="n">' + nIng + '</div><div class="r">ingredientes na biblioteca</div></a>' +
      '<a class="stat" href="#/ajustes" style="text-decoration:none"><div class="n">' + (C.numOk(C.fixosPorHora(cf)) && C.totalFixos(cf) > 0 ? C.brl(C.fixosPorHora(cf)) : '—') + '</div><div class="r">de custo fixo por hora produzida</div></a></div>';

    if (a.prejuizo.length) {
      h += '<section class="bloco"><h2>Vendendo abaixo do custo</h2><p class="explica">O preço praticado destas opções não cobre o custo. Cada venda tira dinheiro do caixa.</p><div class="lista">' +
        a.prejuizo.map(x => '<a class="item" href="#/receita/' + encodeURIComponent(x.r.id) + '"><div class="principal"><div class="nome">' + esc(x.r.nome) + '</div><div class="det">' + esc(x.v.nome || 'Opção') + '</div></div><div class="valor" style="color:var(--neg)">' + I.desce + ' ' + C.brl(x.v.lucro) + '<small>por venda</small></div></a>').join('') + '</div></section>';
    }
    if (a.margemBaixa.length) {
      h += '<section class="bloco"><h2>Margem abaixo de ' + C.num(cf.margemAlerta, 1) + '%</h2><p class="explica">Dão lucro, mas menos do que o mínimo que você definiu em Ajustes.</p><div class="lista">' +
        a.margemBaixa.map(x => '<a class="item" href="#/receita/' + encodeURIComponent(x.r.id) + '"><div class="principal"><div class="nome">' + esc(x.r.nome) + '</div><div class="det">' + esc(x.v.nome || 'Opção') + '</div></div><span class="chip alerta">margem ' + C.pct(x.v.margemReal) + '</span></a>').join('') + '</div></section>';
    }
    if (a.incompletas.length) {
      h += '<section class="bloco"><h2>Receitas com dados faltando</h2><div class="lista">' +
        a.incompletas.map(r => '<a class="item" href="#/receita/' + encodeURIComponent(r.id) + '"><div class="principal"><div class="nome">' + esc(r.nome || 'Receita sem nome') + '</div><div class="det">Falta rendimento, quantidade ou ingrediente</div></div>' + I.seta + '</a>').join('') + '</div></section>';
    }
    if (altas.length) {
      h += '<section class="bloco"><h2>Ingredientes que subiram de preço</h2><p class="explica">Nos últimos 90 dias. As receitas já foram recalculadas com o preço novo.</p><div class="lista">' +
        altas.map(x => '<button type="button" class="item" data-acao="editar-ing" data-id="' + esc(x.i.id) + '"><div class="principal"><div class="nome">' + esc(x.i.nome) + '</div><div class="det">desde ' + dataBR(x.v.desde) + '</div></div><span class="chip neg">' + I.sobe + ' ' + C.pct(x.v.variacao) + '</span></button>').join('') + '</div></section>';
    }
    if (pend.length) {
      h += '<section class="bloco"><h2>Pendências na biblioteca</h2><div class="lista">' +
        pend.map(i => '<button type="button" class="item" data-acao="editar-ing" data-id="' + esc(i.id) + '"><div class="principal"><div class="nome">' + esc(i.nome) + '</div><div class="det">' + esc(i.obs) + '</div></div>' + I.seta + '</button>').join('') + '</div></section>';
    }
    if (C.totalFixos(cf) === 0) {
      h += '<div class="aviso">' + I.alerta + '<div class="txt">Os custos fixos do mês ainda estão em branco, então o preço das receitas não inclui aluguel, luz e gás. <a href="#/ajustes#fixos">Preencher em Ajustes</a></div></div>';
    }
    return h;
  }

  // ================= Ingredientes =================
  function usosDoIngrediente(id) {
    return lista('receitas').filter(r => (r.itens || []).some(it => it.tipo !== 'rec' && it.refId === id));
  }
  function telaIngredientes() {
    const ings = lista('ingredientes').sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    let h = '<div class="cab-pagina"><div class="titulos"><h1>Ingredientes</h1><p class="sub">Cadastre uma vez e use em todas as receitas. Quando o preço muda, as receitas se atualizam.</p></div>' +
      '<div class="acoes"><button type="button" class="btn" data-acao="novo-ing">' + I.mais + 'Novo ingrediente</button></div></div>' + abas(ABAS_REC, '#/ingredientes');
    if (!ings.length) {
      return h + '<div class="bloco vazio">' + I.emblema + '<h2>Nenhum ingrediente ainda</h2><p>' + (S.meta.modo === 'planilha' ? 'Comece pelo que você mais compra: leite condensado, chocolate, creme de leite.' : 'Importe o arquivo ingredientes-iniciais.json, que veio no pacote, para testar com a sua lista de 30 ingredientes. Ou cadastre um por um.') + '</p><div class="acoes" style="justify-content:center">' + (S.meta.modo !== 'planilha' ? '<label class="btn" style="cursor:pointer">' + I.enviar + 'Importar lista<input type="file" accept="application/json,.json" id="importar" hidden></label>' : '') + '<button type="button" class="btn' + (S.meta.modo !== 'planilha' ? ' sec' : '') + '" data-acao="novo-ing">' + I.mais + 'Cadastrar ingrediente</button></div></div>';
    }
    h += '<div class="linha-campos" style="margin-bottom:14px"><label class="busca"><span class="sr">Buscar ingrediente</span>' + I.busca + '<input class="entrada" id="busca-ing" type="search" placeholder="Buscar ingrediente"></label></div>';
    h += '<div class="lista" id="lista-ing">' + ings.map(function (i) {
      const v = C.variacaoPreco(i, 90);
      const usos = usosDoIngrediente(i.id).length;
      let chips = '';
      if (pendenteConversao(i)) chips += '<span class="chip alerta">' + I.receitaDentro + 'converter em receita</span>';
      else if (i.obs) chips += '<span class="chip alerta">' + I.alerta + esc(i.obs) + '</span>';
      if (v && Math.abs(v.variacao) >= 0.01) chips += '<span class="chip ' + (v.variacao > 0 ? 'neg' : 'pos') + '">' + (v.variacao > 0 ? I.sobe + 'subiu ' : I.desce + 'caiu ') + C.pct(Math.abs(v.variacao)) + ' em 90 dias</span>';
      if (!C.custoIngrediente(i)) chips += '<span class="chip neg">' + I.alerta + 'sem preço ou embalagem</span>';
      return '<button type="button" class="item" data-acao="editar-ing" data-id="' + esc(i.id) + '" data-busca="' + esc(normBusca(i.nome + ' ' + (i.marca || ''))) + '">' +
        '<div class="principal"><div class="nome">' + esc(i.nome) + '</div><div class="det">' + C.num(i.qtdEmbalagem) + ' ' + rotUn(i.unidade) + ' por ' + C.brl(i.valorPago) + (usos ? ', usado em ' + usos + (usos === 1 ? ' receita' : ' receitas') : '') + '</div></div>' +
        '<div class="valor">' + porBaseTxt(i) + '</div><div class="chips">' + chips + '</div></button>';
    }).join('') + '</div><p class="mudo" id="sem-res-ing" hidden style="padding:16px">Nenhum ingrediente com esse nome. <button type="button" class="link-btn" data-acao="novo-ing">Cadastrar novo</button></p>';
    return h;
  }
  function montarFiltroIngredientes() {
    const b = $('#busca-ing'); if (!b) return;
    b.addEventListener('input', function () {
      const q = normBusca(b.value); let n = 0;
      $$('#lista-ing .item').forEach(el => { const v = !q || el.dataset.busca.includes(q); el.hidden = !v; if (v) n++; });
      $('#sem-res-ing').hidden = n > 0;
    });
  }

  function folhaIngrediente(id, aoSalvar) {
    const orig = id ? S.dados.ingredientes[id] : null;
    const ing = orig ? clone(orig) : { id: uid(), nome: '', marca: '', unidade: 'g', qtdEmbalagem: null, valorPago: null, fornecedor: '', obs: '', historico: [] };
    const unis = Object.keys(C.UNIDADES).map(u => '<option value="' + u + '"' + (C.normUn(ing.unidade) === u ? ' selected' : '') + '>' + C.UNIDADES[u].rotulo + '</option>').join('');
    const usos = orig ? usosDoIngrediente(orig.id) : [];
    const hist = (ing.historico || []).slice().reverse().slice(0, 6);
    const corpo = '<form id="f-ing" class="corpo-form" style="display:flex;flex-direction:column;gap:12px">' +
      (pendenteConversao(ing) ? '<div class="aviso">' + I.receitaDentro + '<div class="txt">Este item é uma receita sua. Convertendo, o custo passa a se atualizar sozinho quando os ingredientes mudam de preço.<br><button type="button" class="link-btn" data-conv>Converter em receita</button></div></div>' : '') +
      '<label class="campo"><span>Nome</span><input class="entrada" name="nome" required value="' + esc(ing.nome) + '" placeholder="Ex.: Leite condensado"></label>' +
      '<div class="linha-campos"><label class="campo"><span>Unidade de compra</span><select class="entrada" name="unidade">' + unis + '</select></label>' +
      '<label class="campo"><span>Quantidade na embalagem</span><input class="entrada num" name="qtdEmbalagem" inputmode="decimal" required value="' + inNum(ing.qtdEmbalagem) + '" placeholder="395"></label></div>' +
      '<label class="campo"><span>Valor pago</span><span class="com-prefixo"><i>R$</i><input class="entrada num" name="valorPago" inputmode="decimal" required value="' + inNum(ing.valorPago) + '" placeholder="0,00"></span></label>' +
      '<p class="mudo" id="custo-ing" role="status"></p>' +
      '<div class="linha-campos"><label class="campo"><span>Marca</span><input class="entrada" name="marca" value="' + esc(ing.marca) + '"></label>' +
      '<label class="campo"><span>Fornecedor</span><input class="entrada" name="fornecedor" value="' + esc(ing.fornecedor) + '"></label></div>' +
      '<label class="campo"><span>Observação</span><input class="entrada" name="obs" value="' + esc(ing.obs) + '"></label>' +
      (hist.length > 1 ? '<div><h3>Histórico de preço</h3>' + sparkline(ing.historico) + '<ul class="historico">' + hist.map(x => '<li><span>' + dataBR(x.data) + '</span><span>' + C.num(x.qtdEmbalagem) + ' ' + rotUn(x.unidade) + ' por ' + C.brl(x.valorPago) + '</span></li>').join('') + '</ul></div>' : '') +
      (usos.length ? '<p class="mudo">Usado em: ' + usos.map(r => esc(r.nome)).join(', ') + '</p>' : '') +
      '<div class="rodape-folha">' + (orig ? '<button type="button" class="btn perigo" data-excluir>' + I.lixo + 'Excluir</button>' : '') + '<span style="flex:1"></span><button type="button" class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit">Salvar ingrediente</button></div></form>';
    abrirFolha(orig ? 'Editar ingrediente' : 'Novo ingrediente', corpo, function (d) {
      const f = $('#f-ing', d);
      function mostrarCusto() {
        const t = { unidade: f.unidade.value, qtdEmbalagem: C.lerNum(f.qtdEmbalagem.value), valorPago: C.lerNum(f.valorPago.value) };
        const c = C.custoIngrediente(t);
        $('#custo-ing', d).textContent = c ? 'Custo: ' + C.brl(c.porBase, 4) + ' por ' + c.base : 'Preencha quantidade e valor para ver o custo por unidade.';
      }
      f.addEventListener('input', mostrarCusto); mostrarCusto();
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        const q = C.lerNum(f.qtdEmbalagem.value), v = C.lerNum(f.valorPago.value);
        if (!f.nome.value.trim()) { f.nome.focus(); return; }
        if (!(q > 0)) { toast('A quantidade na embalagem precisa ser maior que zero.'); f.qtdEmbalagem.focus(); return; }
        if (!(v >= 0)) { toast('Informe o valor pago.'); f.valorPago.focus(); return; }
        const novo = Object.assign(ing, { nome: f.nome.value.trim(), unidade: f.unidade.value, qtdEmbalagem: q, valorPago: v, marca: f.marca.value.trim(), fornecedor: f.fornecedor.value.trim(), obs: f.obs.value.trim() });
        const mudouPreco = !orig || orig.valorPago !== v || orig.qtdEmbalagem !== q || C.normUn(orig.unidade) !== C.normUn(novo.unidade);
        if (orig && C.UNIDADES[C.normUn(orig.unidade)].familia !== C.UNIDADES[novo.unidade].familia && usos.length) {
          toast('Não dá para trocar de ' + C.UNIDADES[C.normUn(orig.unidade)].familia + ' para ' + C.UNIDADES[novo.unidade].familia + ': o ingrediente já é usado em receitas.');
          return;
        }
        if (mudouPreco) {
          const c = C.custoIngrediente(novo);
          novo.historico = (novo.historico || []).concat([{ data: agoraISO(), valorPago: v, qtdEmbalagem: q, unidade: novo.unidade, porBase: c ? c.porBase : null }]);
        }
        gravarRegistro('ingredientes', novo);
        d.close();
        if (orig && mudouPreco) avisarRecalculo(novo.id);
        else toast(orig ? 'Ingrediente salvo.' : 'Ingrediente cadastrado.');
        if (aoSalvar) aoSalvar(novo); else render(false);
      });
      const ex = $('[data-excluir]', d);
      if (ex) ex.onclick = async function () {
        if (usos.length) { toast('Este ingrediente está em ' + usos.length + (usos.length === 1 ? ' receita' : ' receitas') + '. Tire-o das receitas antes de excluir.'); return; }
        d.close();
        if (await confirmar('Excluir ingrediente?', 'Excluir <b>' + esc(orig.nome) + '</b> da biblioteca.', 'Excluir', true)) {
          excluirRegistro('ingredientes', orig.id); toast('Ingrediente excluído.'); render(false);
        }
      };
      const cv = $('[data-conv]', d);
      if (cv) cv.onclick = function () { d.close(); converterEmReceita(orig); };
    });
  }

  function sparkline(hist) {
    const pts = (hist || []).filter(x => C.numOk(x.porBase));
    if (pts.length < 2) return '';
    const vals = pts.map(x => x.porBase), mn = Math.min(...vals), mx = Math.max(...vals), amp = mx - mn || 1;
    const w = 300, hgt = 48;
    const d = pts.map((x, i) => (i ? 'L' : 'M') + (i / (pts.length - 1) * (w - 8) + 4).toFixed(1) + ' ' + (hgt - 6 - (x.porBase - mn) / amp * (hgt - 12)).toFixed(1)).join(' ');
    return '<svg class="spark" viewBox="0 0 ' + w + ' ' + hgt + '" preserveAspectRatio="none" role="img" aria-label="Evolução do preço"><path d="' + d + '" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>';
  }

  function receitasAfetadas(ingId) {
    const diretas = new Set(usosDoIngrediente(ingId).map(r => r.id));
    diretas.forEach(id => C.receitasQueDependemDe(id, S.dados.receitas).forEach(x => diretas.add(x)));
    return Array.from(diretas).map(id => S.dados.receitas[id]).filter(r => r && !r.excluidoEm);
  }
  function avisarRecalculo(ingId) {
    const afet = receitasAfetadas(ingId);
    if (!afet.length) { toast('Preço atualizado.'); return; }
    const ctx = ctxCalc(); const alerta = (cfg().margemAlerta || 0) / 100;
    const ruins = afet.filter(r => (C.calcularReceita(r, ctx).variacoes || []).some(v => v.prejuizo || (C.numOk(v.margemReal) && v.margemReal < alerta)));
    const base = 'Preço atualizado. ' + (afet.length === 1 ? '1 receita recalculada' : afet.length + ' receitas recalculadas');
    if (ruins.length) toast(base + '; ' + ruins.length + ' ficou com margem abaixo do mínimo.', 'Ver', () => ir('#/inicio'));
    else toast(base + '.');
  }

  function converterEmReceita(ing) {
    const corpo = '<p>Vai ser criada a receita <b>' + esc(ing.nome) + '</b>, e ela substitui o ingrediente nas receitas que o usam. Nessas receitas, ela deve entrar:</p>' +
      '<button type="button" class="opcao-grande" data-modo="custo"><b>Pelo custo</b><span>Só o que custa produzir. O lucro fica todo no produto final.</span></button>' +
      '<button type="button" class="opcao-grande" data-modo="preco"><b>Pelo preço de venda</b><span>Com o lucro desta receita embutido, como se você comprasse de si mesma.</span></button>';
    abrirFolha('Converter em receita', corpo, function (d) {
      $$('[data-modo]', d).forEach(b => b.onclick = function () {
        const modo = b.dataset.modo;
        const rec = novaReceitaBase(); rec.nome = ing.nome; rec.rendimento = { qtd: null, unidade: 'un' };
        gravarRegistro('receitas', rec);
        const unidadeFamilia = C.UNIDADES[C.normUn(ing.unidade)].familia;
        lista('receitas').forEach(function (r) {
          let mudou = false;
          const c = clone(r);
          (c.itens || []).forEach(function (it) {
            if (it.tipo !== 'rec' && it.refId === ing.id) {
              it.tipo = 'rec'; it.refId = rec.id; it.modo = modo;
              if (unidadeFamilia !== 'unidade') { it.unidade = 'un'; }
              mudou = true;
            }
          });
          if (mudou) gravarRegistro('receitas', c);
        });
        const ingC = clone(ing); ingC.excluidoEm = agoraISO(); gravarRegistro('ingredientes', ingC);
        d.close();
        toast('Receita criada. Preencha ingredientes e rendimento para o custo aparecer.');
        ir('#/receita/' + encodeURIComponent(rec.id));
      });
    });
  }

  // ================= Receitas =================
  function novaReceitaBase() {
    const cf = cfg();
    return {
      id: uid(), nome: '', categoria: '', tempoMin: null, perdaPct: null,
      rendimento: { qtd: null, unidade: 'un' }, itens: [], custosDiretos: [],
      incluir: { fixos: true, maoObra: true },
      precificacao: { modo: 'margem', valor: cf.margemPadrao },
      taxas: { cartao: 'nenhum', app: false, entrega: false },
      variacoes: [{ id: uid(), nome: 'Unidade', qtd: 1, unidade: 'un', embalagem: null, precoPraticado: null }],
      obs: ''
    };
  }

  function telaReceitas() {
    const recs = lista('receitas').sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));
    let h = '<div class="cab-pagina"><div class="titulos"><h1>Receitas</h1><p class="sub">Custo, preço sugerido e lucro de cada doce.</p></div><div class="acoes"><a class="btn" href="#/receita/nova">' + I.mais + 'Nova receita</a></div></div>' + abas(ABAS_REC, '#/receitas');
    if (!recs.length) {
      return h + '<div class="bloco vazio">' + I.emblema + '<h2>Nenhuma receita ainda</h2><p>Cadastre a receita com os ingredientes e quanto ela rende. O app calcula o resto.</p><a class="btn" href="#/receita/nova">' + I.mais + 'Nova receita</a></div>';
    }
    const cats = Array.from(new Set(recs.map(r => r.categoria).filter(Boolean))).sort();
    h += '<div class="linha-campos" style="margin-bottom:14px"><label class="busca"><span class="sr">Buscar receita</span>' + I.busca + '<input class="entrada" id="busca-rec" type="search" placeholder="Buscar receita"></label>' +
      (cats.length ? '<label class="campo" style="flex:0 1 220px"><span class="sr">Categoria</span><select class="entrada" id="cat-rec"><option value="">Todas as categorias</option>' + cats.map(c => '<option>' + esc(c) + '</option>').join('') + '</select></label>' : '') + '</div>';
    const ctx = ctxCalc(); const alerta = (cfg().margemAlerta || 0) / 100;
    h += '<div class="lista" id="lista-rec">' + recs.map(function (r) {
      const c = C.calcularReceita(r, ctx);
      const v = (c.variacoes || [])[0];
      let chips = '';
      if (r.categoria) chips += '<span class="chip">' + esc(r.categoria) + '</span>';
      const temPrej = (c.variacoes || []).some(x => x.prejuizo);
      if (temPrej) chips += '<span class="chip neg">' + I.desce + 'abaixo do custo</span>';
      else if (v && C.numOk(v.margemReal)) chips += '<span class="chip ' + (v.margemReal < alerta ? 'alerta' : 'pos') + '">margem ' + C.pct(v.margemReal) + '</span>';
      if (c.avisos.length) chips += '<span class="chip alerta">' + I.alerta + (c.avisos.length === 1 ? '1 aviso' : c.avisos.length + ' avisos') + '</span>';
      const rend = r.rendimento && C.numOk(r.rendimento.qtd) ? 'rende ' + C.num(r.rendimento.qtd) + ' ' + rotUn(r.rendimento.unidade) : 'sem rendimento';
      return '<a class="item" href="#/receita/' + encodeURIComponent(r.id) + '" data-busca="' + esc(normBusca(r.nome)) + '" data-cat="' + esc(r.categoria || '') + '">' +
        '<div class="principal"><div class="nome">' + esc(r.nome || 'Receita sem nome') + '</div><div class="det">' + rend + (C.numOk(c.custoPorBase) ? ', custo ' + C.brl(c.custoPorBase, c.custoPorBase < 1 ? 4 : 2) + '/' + c.unidadeBase : '') + '</div></div>' +
        '<div class="valor">' + (v && C.numOk(v.preco) ? C.brl(v.preco) + '<small>' + esc(v.nome || '') + '</small>' : '—') + '</div><div class="chips">' + chips + '</div></a>';
    }).join('') + '</div><p class="mudo" id="sem-res-rec" hidden style="padding:16px">Nenhuma receita encontrada.</p>';
    return h;
  }
  function montarFiltroReceitas() {
    const b = $('#busca-rec'), c = $('#cat-rec'); if (!b) return;
    function f() {
      const q = normBusca(b.value), cat = c ? c.value : ''; let n = 0;
      $$('#lista-rec .item').forEach(el => { const v = (!q || el.dataset.busca.includes(q)) && (!cat || el.dataset.cat === cat); el.hidden = !v; if (v) n++; });
      $('#sem-res-rec').hidden = n > 0;
    }
    b.addEventListener('input', f); if (c) c.addEventListener('change', f);
  }

  // ---------- Editor de receita ----------
  function telaEditorReceita(id) {
    if (!S.editor || S.editor.tipo !== 'receita' || S.editor.idRota !== id) {
      let d;
      if (id === 'nova') d = novaReceitaBase();
      else if (S.dados.receitas[id] && !S.dados.receitas[id].excluidoEm) d = clone(S.dados.receitas[id]);
      else return '<div class="bloco vazio">' + I.emblema + '<h2>Receita não encontrada</h2><p>Ela pode ter sido excluída em outro aparelho.</p><a class="btn" href="#/receitas">Ver receitas</a></div>';
      S.editor = { tipo: 'receita', idRota: id, nova: id === 'nova', d: d, sujo: false };
    }
    return htmlEditor();
  }

  function opcoesUn(unidadeRef, atual) {
    const fam = C.unidadesDaFamilia(unidadeRef);
    const lst = fam.length ? fam : Object.keys(C.UNIDADES);
    return lst.map(u => '<option value="' + u + '"' + (C.normUn(atual) === u ? ' selected' : '') + '>' + C.UNIDADES[u].rotulo + '</option>').join('');
  }

  function htmlEditor() {
    const e = S.editor, r = e.d, cf = cfg();
    const cats = Array.from(new Set(lista('receitas').map(x => x.categoria).filter(Boolean)));
    const tH = C.numOk(r.tempoMin) ? Math.floor(r.tempoMin / 60) : null, tM = C.numOk(r.tempoMin) ? r.tempoMin % 60 : null;
    const pc = r.precificacao || {};
    const vMarkup = pc.modo === 'markup' ? pc.valor : (C.numOk(pc.valor) ? C.margemParaMarkup(pc.valor / 100) * 100 : null);
    const vMargem = pc.modo === 'markup' ? (C.numOk(pc.valor) ? C.markupParaMargem(pc.valor / 100) * 100 : null) : pc.valor;
    const fh = C.fixosPorHora(cf), vh = C.valorHora(cf);
    const t = r.taxas || {};

    let h = '<div class="cab-pagina"><div class="titulos"><a href="#/receitas" class="link-btn" style="display:inline-flex;align-items:center;gap:4px;text-decoration:none">' + I.voltar + 'Receitas</a><h1>' + esc(r.nome || (e.nova ? 'Nova receita' : 'Receita sem nome')) + '</h1></div></div>';
    h += '<div class="editor"><div class="form-rec">';

    // Básico
    h += '<section class="bloco"><h2>Receita</h2><div class="grade">' +
      '<label class="campo"><span>Nome</span><input class="entrada" data-c="nome" value="' + esc(r.nome) + '" placeholder="Ex.: Brigadeiro gourmet"></label>' +
      '<label class="campo"><span>Categoria</span><input class="entrada" data-c="categoria" list="dl-cats" value="' + esc(r.categoria) + '" placeholder="Ex.: Brigadeiros"><datalist id="dl-cats">' + cats.map(c => '<option value="' + esc(c) + '">').join('') + '</datalist></label></div>' +
      '<div class="grade" style="margin-top:12px">' +
      '<div class="campo"><span>Rendimento</span><div class="linha-campos" style="flex-wrap:nowrap"><input class="entrada num" data-c="rendimento.qtd" data-n inputmode="decimal" value="' + inNum(r.rendimento.qtd) + '" placeholder="40" aria-label="Quantidade que a receita rende"><select class="entrada" data-c="rendimento.unidade" data-estrut style="flex:0 0 96px" aria-label="Unidade do rendimento">' + opcoesUn(null, r.rendimento.unidade) + '</select></div><small>Quanto sai de uma receita: unidades, gramas ou ml.</small></div>' +
      '<div class="campo"><span>Tempo de produção</span><div class="linha-campos" style="flex-wrap:nowrap"><span class="com-prefixo"><input class="entrada num" data-c="_th" data-n inputmode="numeric" value="' + (tH === null ? '' : tH) + '" aria-label="Horas"><i class="dir">h</i></span><span class="com-prefixo"><input class="entrada num" data-c="_tm" data-n inputmode="numeric" value="' + (tM === null ? '' : tM) + '" aria-label="Minutos"><i class="dir">min</i></span></div><small>Usado para mão de obra e custos fixos.</small></div>' +
      '<label class="campo"><span>Perda</span><span class="com-prefixo"><input class="entrada num" data-c="perdaPct" data-n inputmode="decimal" value="' + inNum(r.perdaPct) + '" placeholder="0"><i class="dir">%</i></span><small>O que fica na panela ou quebra. Aumenta o custo dos ingredientes.</small></label>' +
      '</div></section>';

    // Ingredientes
    h += '<section class="bloco"><h2>Ingredientes</h2><div class="linhas-edit">' +
      (r.itens.length ? r.itens.map(function (it, i) {
        let nome, unRef, tag = '';
        if (it.tipo === 'rec') {
          const sub = S.dados.receitas[it.refId];
          nome = sub ? sub.nome || 'Receita sem nome' : '(receita removida)';
          unRef = sub && sub.rendimento ? sub.rendimento.unidade : it.unidade;
          tag = '<span class="chip">' + I.receitaDentro + 'receita, ' + (it.modo === 'preco' ? 'pelo preço' : 'pelo custo') + '</span>';
        } else {
          const ing = S.dados.ingredientes[it.refId];
          nome = ing ? ing.nome : '(ingrediente removido)'; unRef = ing ? ing.unidade : it.unidade;
        }
        return '<div class="linha-edit"><div class="nome-it"><span>' + esc(nome) + '</span>' + tag + '<span class="custo-it" data-custo-item="' + i + '"></span></div>' +
          '<div class="qtd"><input class="entrada num" data-c="itens.' + i + '.qtd" data-n inputmode="decimal" value="' + inNum(it.qtd) + '" aria-label="Quantidade de ' + esc(nome) + '" placeholder="Qtd"><select class="entrada" data-c="itens.' + i + '.unidade" aria-label="Unidade">' + opcoesUn(unRef, it.unidade) + '</select></div>' +
          '<div class="acoes">' + (it.tipo === 'rec' ? '<button type="button" class="btn sec fino" data-acao="alternar-modo" data-i="' + i + '">Trocar para ' + (it.modo === 'preco' ? 'custo' : 'preço') + '</button>' : '') + '<button type="button" class="btn-icone" data-acao="rem-item" data-i="' + i + '" aria-label="Remover ' + esc(nome) + '">' + I.lixo + '</button></div>' +
          '<div class="aviso-it" data-aviso-item="' + i + '"></div></div>';
      }).join('') : '<p class="mudo">Nenhum ingrediente na receita.</p>') +
      '</div><button type="button" class="btn sec" style="margin-top:12px" data-acao="add-item">' + I.mais + 'Adicionar ingrediente ou receita</button></section>';

    // Custos diretos
    h += '<section class="bloco"><h2>Outros custos da receita</h2><p class="explica">Coisas gastas a cada receita que não são ingrediente: forminhas, fitas, etiquetas. A embalagem de venda (caixa, pote) vai em cada opção de venda, lá embaixo.</p><div class="linhas-edit">' +
      (r.custosDiretos || []).map((c, i) => '<div class="linha-edit" style="grid-template-columns:1fr 150px auto"><input class="entrada" data-c="custosDiretos.' + i + '.desc" value="' + esc(c.desc) + '" placeholder="Ex.: forminhas nº 4" aria-label="Descrição"><span class="com-prefixo"><i>R$</i><input class="entrada num" data-c="custosDiretos.' + i + '.valor" data-n inputmode="decimal" value="' + inNum(c.valor) + '" aria-label="Valor"></span><button type="button" class="btn-icone" data-acao="rem-direto" data-i="' + i + '" aria-label="Remover custo">' + I.lixo + '</button></div>').join('') +
      '</div><button type="button" class="btn sec" style="margin-top:12px" data-acao="add-direto">' + I.mais + 'Adicionar custo</button></section>';

    // Incluir
    h += '<section class="bloco"><h2>Tempo e custos da doceria</h2>' +
      '<label class="chave"><span class="rot">Custos fixos rateados<small>' + (C.numOk(fh) && C.totalFixos(cf) > 0 ? C.brl(fh) + ' por hora de produção (aluguel, luz, gás…)' : 'Custos fixos ainda não preenchidos em Ajustes') + '</small></span><input type="checkbox" data-c="incluir.fixos" data-b' + (r.incluir && r.incluir.fixos === false ? '' : ' checked') + '></label>' +
      '<label class="chave"><span class="rot">Mão de obra<small>' + (C.numOk(vh) ? C.brl(vh) + ' por hora' : 'Valor da hora não definido em Ajustes') + '</small></span><input type="checkbox" data-c="incluir.maoObra" data-b' + (r.incluir && r.incluir.maoObra === false ? '' : ' checked') + '></label>' +
      '<a class="link-btn" href="#/ajustes#fixos">Mudar valores em Ajustes</a></section>';

    // Preço
    h += '<section class="bloco"><h2>Lucro desejado</h2><p class="explica">Digite em um dos campos; o outro mostra o equivalente. Vale o último que você digitou.</p><div class="grade">' +
      '<label class="campo"><span>Markup' + (pc.modo === 'markup' ? ' (definido por você)' : '') + '</span><span class="com-prefixo"><input class="entrada num" id="in-markup" data-preco="markup" inputmode="decimal" value="' + (C.numOk(vMarkup) ? inNum(Math.round(vMarkup * 10) / 10) : '') + '"><i class="dir">%</i></span><small>Quanto soma em cima do custo.</small></label>' +
      '<label class="campo"><span>Margem' + (pc.modo !== 'markup' ? ' (definida por você)' : '') + '</span><span class="com-prefixo"><input class="entrada num" id="in-margem" data-preco="margem" inputmode="decimal" value="' + (C.numOk(vMargem) ? inNum(Math.round(vMargem * 10) / 10) : '') + '"><i class="dir">%</i></span><small>Quanto do preço vira lucro.</small></label></div>' +
      '<details class="ajuda"><summary>Qual a diferença entre markup e margem?</summary><div><p>Markup é quanto se soma em cima do custo. Margem é quanto do preço final vira lucro.</p><p>Um doce que custa R$ 1,00 e é vendido a R$ 2,00 tem markup de 100% e margem de 50%. É a mesma venda; muda só a conta.</p><p>Com taxas de cartão ou aplicativo, o app ajusta o preço para que você receba o markup ou a margem que digitou, depois de descontadas as taxas.</p></div></details></section>';

    // Taxas
    const tx = cf.taxas;
    h += '<section class="bloco"><h2>Taxas no preço</h2><p class="explica">Opcionais. Ligue as que costumam incidir na venda deste produto.</p>' +
      '<label class="campo"><span>Cartão</span><select class="entrada" data-c="taxas.cartao">' +
      [['nenhum', 'Sem taxa de cartão'], ['debito', 'Débito (' + C.num(tx.debito) + '%)'], ['credito', 'Crédito à vista (' + C.num(tx.credito) + '%)'], ['parcelado', 'Crédito parcelado (' + C.num(tx.parcelado) + '%)']].map(o => '<option value="' + o[0] + '"' + ((t.cartao || 'nenhum') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select></label>' +
      '<label class="chave"><span class="rot">Aplicativo de entrega<small>' + C.num(tx.app) + '% do preço</small></span><input type="checkbox" data-c="taxas.app" data-b' + (t.app ? ' checked' : '') + '></label>' +
      '<label class="chave"><span class="rot">Taxa de entrega<small>' + C.brl(tx.entrega) + ' por venda, embutida no preço</small></span><input type="checkbox" data-c="taxas.entrega" data-b' + (t.entrega ? ' checked' : '') + '></label></section>';

    // Variações
    h += '<section class="bloco"><h2>Opções de venda</h2><p class="explica">Como este doce é vendido: unidade, caixa com 4, cento, bolo de 1 kg. Cada opção usa uma parte do rendimento e pode ter embalagem própria.</p><div class="linhas-edit">' +
      (r.variacoes || []).map((v, i) => '<div class="linha-edit linha-var">' +
        '<label class="campo"><span>Nome</span><input class="entrada" data-c="variacoes.' + i + '.nome" value="' + esc(v.nome) + '" placeholder="Ex.: Caixa com 4"></label>' +
        '<div class="campo"><span>Usa da receita</span><div class="qtd" style="display:flex;gap:8px"><input class="entrada num" data-c="variacoes.' + i + '.qtd" data-n inputmode="decimal" value="' + inNum(v.qtd) + '" aria-label="Quantidade usada"><select class="entrada" data-c="variacoes.' + i + '.unidade" style="flex:0 0 84px" aria-label="Unidade">' + opcoesUn(r.rendimento.unidade, v.unidade || r.rendimento.unidade) + '</select></div></div>' +
        '<label class="campo"><span>Embalagem</span><span class="com-prefixo"><i>R$</i><input class="entrada num" data-c="variacoes.' + i + '.embalagem" data-n inputmode="decimal" value="' + inNum(v.embalagem) + '" placeholder="0,00"></span></label>' +
        '<label class="campo"><span>Preço que você cobra</span><span class="com-prefixo"><i>R$</i><input class="entrada num" data-c="variacoes.' + i + '.precoPraticado" data-n inputmode="decimal" value="' + inNum(v.precoPraticado) + '" placeholder="sugerido"></span></label>' +
        '<div class="res" data-var-res="' + i + '"></div>' +
        '<div class="acoes" style="grid-column:1/-1;justify-content:flex-end"><button type="button" class="btn perigo fino" data-acao="rem-var" data-i="' + i + '">' + I.lixo + 'Remover opção</button></div></div>').join('') +
      '</div><button type="button" class="btn sec" style="margin-top:12px" data-acao="add-var">' + I.mais + 'Adicionar opção de venda</button></section>';

    h += '<section class="bloco"><h2>Anotações</h2><label class="campo"><span class="sr">Anotações</span><textarea class="entrada" data-c="obs" placeholder="Modo de preparo, dicas, fornecedor…">' + esc(r.obs) + '</textarea></label></section>';

    h += '<div class="barra-salvar"><span class="estado" id="estado-ed">' + (e.sujo ? 'Alterações não salvas' : (e.nova ? 'Receita nova' : 'Tudo salvo')) + '</span>' +
      (!e.nova ? '<button type="button" class="btn perigo fino" data-acao="excluir-rec" aria-label="Excluir receita" title="Excluir receita">' + I.lixo + '<span>Excluir</span></button><button type="button" class="btn sec fino" data-acao="duplicar-rec" aria-label="Duplicar receita" title="Duplicar receita">' + I.copiar + '<span>Duplicar</span></button>' : '') +
      '<button type="button" class="btn" data-acao="salvar-rec">Salvar receita</button></div>';

    h += '</div><aside class="painel"><div class="bloco" id="resumo" aria-live="polite"></div></aside></div>';
    return h;
  }

  function lerCaminho(o, cam) { return cam.split('.').reduce((a, k) => (a === undefined || a === null ? undefined : a[k]), o); }
  function gravarCaminho(o, cam, v) {
    const ks = cam.split('.'); let a = o;
    for (let i = 0; i < ks.length - 1; i++) { if (a[ks[i]] === undefined || a[ks[i]] === null) a[ks[i]] = {}; a = a[ks[i]]; }
    a[ks[ks.length - 1]] = v;
  }

  function montarEditor() {
    const cont = $('.form-rec'); if (!cont || !S.editor) return;
    cont.addEventListener('input', aoEditar);
    cont.addEventListener('change', aoEditar);
    recalcular();
  }
  function marcarSujo() {
    if (!S.editor) return;
    S.editor.sujo = true;
  }
  function aoEditar(ev) {
    const el = ev.target; const d = S.editor && S.editor.d; if (!d) return;
    if (el.dataset.preco) {
      if (ev.type !== 'input') return;
      const v = C.lerNum(el.value);
      d.precificacao = { modo: el.dataset.preco, valor: v };
      const outro = el.dataset.preco === 'markup' ? $('#in-margem') : $('#in-markup');
      const eq = !C.numOk(v) ? null : el.dataset.preco === 'markup' ? C.markupParaMargem(v / 100) : C.margemParaMarkup(v / 100);
      outro.value = C.numOk(eq) ? inNum(Math.round(eq * 1000) / 10) : '';
      marcarSujo(); recalcular(); return;
    }
    const cam = el.dataset.c; if (!cam) return;
    if (el.tagName === 'SELECT' || el.type === 'checkbox') { if (ev.type !== 'change') return; }
    else if (ev.type !== 'input') return;
    let v;
    if (el.hasAttribute('data-b')) v = el.checked;
    else if (el.hasAttribute('data-n')) v = C.lerNum(el.value);
    else v = el.value;
    if (cam === '_th' || cam === '_tm') {
      const hh = C.lerNum($('[data-c="_th"]').value), mm = C.lerNum($('[data-c="_tm"]').value);
      d.tempoMin = (hh === null && mm === null) ? null : Math.round((hh || 0) * 60 + (mm || 0));
    } else gravarCaminho(d, cam, v);
    if (cam === 'nome') { const t = $('.cab-pagina h1'); if (t) t.textContent = v || 'Nova receita'; }
    marcarSujo();
    if (cam === 'rendimento.unidade') {
      // opções de venda acompanham a nova família de unidade
      (d.variacoes || []).forEach(x => { if (!C.mesmaFamilia(x.unidade, v)) x.unidade = v; });
      render(false); return;
    }
    recalcular();
  }

  function recalcular() {
    const e = S.editor; if (!e) return;
    const r = e.d;
    const c = C.calcularReceita(r, ctxCalc(r));
    (c.itens || []).forEach(function (it, i) {
      const ce = $('[data-custo-item="' + i + '"]'), ae = $('[data-aviso-item="' + i + '"]');
      if (ce) ce.textContent = C.numOk(it.custo) ? C.brl(it.custo) : '';
      if (ae) ae.textContent = it.aviso || '';
    });
    (c.variacoes || []).forEach(function (v, i) {
      const el = $('[data-var-res="' + i + '"]'); if (!el) return;
      if (v.aviso && !C.numOk(v.preco)) { el.innerHTML = '<div class="aviso">' + I.alerta + '<div class="txt">' + esc(v.aviso) + '</div></div>'; return; }
      el.innerHTML = '<dl class="resultados">' +
        '<div><dt>Custo</dt><dd>' + C.brl(v.custo) + '</dd></div>' +
        '<div><dt>Preço sugerido</dt><dd>' + C.brl(v.precoSugerido) + '</dd></div>' +
        (v.taxasValor > 0 ? '<div><dt>Taxas</dt><dd>' + C.brl(v.taxasValor) + '</dd></div>' : '') +
        '<div class="' + (v.prejuizo ? 'neg' : 'pos') + '"><dt>' + (v.prejuizo ? 'Prejuízo' : 'Lucro') + '</dt><dd>' + (v.prejuizo ? I.desce : I.sobe) + ' ' + C.brl(Math.abs(v.lucro)) + '</dd></div>' +
        '<div><dt>Margem real</dt><dd>' + C.pct(v.margemReal) + '</dd></div>' +
        '<div><dt>Markup real</dt><dd>' + C.pct(v.markupReal) + '</dd></div></dl>' +
        (v.prejuizo ? '<div class="aviso neg" style="margin-top:8px">' + I.alerta + '<div class="txt">O preço cobrado não cobre o custo desta opção.</div></div>' : '') +
        (v.aviso ? '<div class="aviso" style="margin-top:8px">' + I.alerta + '<div class="txt">' + esc(v.aviso) + '</div></div>' : '');
    });
    const est = $('#estado-ed');
    if (est) est.innerHTML = (C.numOk(c.custoPorBase) ? '<b style="color:var(--ink)">' + C.brl(c.custoPorBase, c.custoPorBase < 1 ? 4 : 2) + '</b> por ' + esc(c.unidadeBase) + '<br>' : '') + (e.sujo ? 'Alterações não salvas' : (e.nova ? 'Receita nova' : 'Tudo salvo'));
    const res = $('#resumo'); if (!res) return;
    const partes = [
      ['Ingredientes', c.custoIngredientes, '#E2A65A'],
      ['Perda', c.perdaValor, '#C98B6B'],
      ['Outros custos', c.diretos, '#F3C9BD'],
      ['Custos fixos', c.fixos, '#9FC7A8'],
      ['Mão de obra', c.maoObra, '#FEF0ED']
    ];
    const tot = c.custoLote || 0;
    const rend = r.rendimento || {};
    res.innerHTML = '<h2>Custo da receita</h2><ul class="decomp">' +
      partes.map(x => '<li><span><i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:' + x[2] + ';margin-right:8px"></i>' + x[0] + '</span><span>' + C.brl(x[1]) + '</span></li>').join('') +
      '<li class="total"><span>Custo total</span><span>' + C.brl(tot) + '</span></li></ul>' +
      (tot > 0 ? '<div class="barra" aria-hidden="true">' + partes.map(x => x[1] > 0 ? '<i style="width:' + (x[1] / tot * 100).toFixed(2) + '%;background:' + x[2] + '"></i>' : '').join('') + '</div>' : '') +
      '<div class="destaque-un"><div class="r">Custo por ' + (c.unidadeBase || 'unidade') + '</div><div class="v">' + (C.numOk(c.custoPorBase) ? C.brl(c.custoPorBase, c.custoPorBase < 1 ? 4 : 2) : '—') + '</div>' +
      '<div class="r">' + (C.numOk(rend.qtd) ? 'Receita rende ' + C.num(rend.qtd) + ' ' + rotUn(rend.unidade) : 'Informe o rendimento') + (c.horas > 0 ? ', ' + C.num(c.horas, 2) + ' h de produção' : '') + '</div></div>' +
      (c.avisos.length ? '<div class="avisos-painel"><b>Para o cálculo ficar completo:</b><ul>' + Array.from(new Set(c.avisos)).map(a => '<li>' + esc(a) + '</li>').join('') + '</ul></div>' : '');
  }

  function folhaEscolherItem() {
    const e = S.editor; const atual = e.d;
    const bloqueadas = C.receitasQueDependemDe(atual.id, S.dados.receitas);
    const ings = lista('ingredientes').sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    const recs = lista('receitas').filter(r => !bloqueadas.has(r.id)).sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));
    const corpo = '<label class="busca"><span class="sr">Buscar</span>' + I.busca + '<input class="entrada" id="busca-it" type="search" placeholder="Buscar ingrediente ou receita" autofocus></label>' +
      '<div class="lista" id="lista-it">' +
      ings.map(i => '<button type="button" class="item" data-tipo="ing" data-id="' + esc(i.id) + '" data-busca="' + esc(normBusca(i.nome)) + '"><div class="principal"><div class="nome">' + esc(i.nome) + '</div><div class="det">' + porBaseTxt(i) + '</div></div></button>').join('') +
      (recs.length ? '<p class="mudo" data-sep style="margin-top:8px">Receitas</p>' + recs.map(r => '<button type="button" class="item" data-tipo="rec" data-id="' + esc(r.id) + '" data-busca="' + esc(normBusca(r.nome)) + '"><div class="principal"><div class="nome">' + I.receitaDentro + ' ' + esc(r.nome || 'Receita sem nome') + '</div><div class="det">rende ' + (r.rendimento && C.numOk(r.rendimento.qtd) ? C.num(r.rendimento.qtd) + ' ' + rotUn(r.rendimento.unidade) : '—') + '</div></div></button>').join('') : '') +
      '</div><p class="mudo" id="sem-it" hidden>Nada encontrado.</p><button type="button" class="btn sec" data-novo-ing>' + I.mais + 'Cadastrar ingrediente novo</button>';
    abrirFolha('Adicionar à receita', corpo, function (d) {
      const b = $('#busca-it', d);
      b.addEventListener('input', function () {
        const q = normBusca(b.value); let n = 0;
        $$('#lista-it .item', d).forEach(el => { const v = !q || el.dataset.busca.includes(q); el.hidden = !v; if (v) n++; });
        const sep = $('[data-sep]', d); if (sep) sep.hidden = !!q;
        $('#sem-it', d).hidden = n > 0;
      });
      $('[data-novo-ing]', d).onclick = function () { d.close(); folhaIngrediente(null, function (ing) { adicionarItem({ tipo: 'ing', refId: ing.id, qtd: null, unidade: C.UNIDADES[ing.unidade].base }); }); };
      $$('#lista-it .item', d).forEach(el => el.onclick = function () {
        if (el.dataset.tipo === 'ing') {
          const ing = S.dados.ingredientes[el.dataset.id];
          d.close(); adicionarItem({ tipo: 'ing', refId: ing.id, qtd: null, unidade: C.UNIDADES[C.normUn(ing.unidade)].base });
        } else {
          const sub = S.dados.receitas[el.dataset.id];
          d.close();
          escolherModo(sub.nome, function (modo) { adicionarItem({ tipo: 'rec', refId: sub.id, qtd: null, unidade: C.normUn(sub.rendimento && sub.rendimento.unidade) || 'un', modo: modo }); });
        }
      });
    });
  }
  function escolherModo(nome, fn) {
    const corpo = '<p>Como <b>' + esc(nome || 'esta receita') + '</b> deve entrar no custo?</p>' +
      '<button type="button" class="opcao-grande" data-modo="custo"><b>Pelo custo, sem lucro</b><span>Entra só o que custa produzir. O lucro fica todo no produto final.</span></button>' +
      '<button type="button" class="opcao-grande" data-modo="preco"><b>Pelo preço de venda, com lucro</b><span>Entra com o lucro desta receita embutido, como se você comprasse de si mesma.</span></button>';
    abrirFolha('Receita dentro de receita', corpo, function (d) {
      $$('[data-modo]', d).forEach(b => b.onclick = () => { d.close(); fn(b.dataset.modo); });
    });
  }
  function adicionarItem(it) {
    S.editor.d.itens.push(it); marcarSujo(); render(false);
    setTimeout(function () { const el = $('[data-c="itens.' + (S.editor.d.itens.length - 1) + '.qtd"]'); if (el) el.focus(); }, 50);
  }

  function validarReceita(r) {
    if (!String(r.nome || '').trim()) return 'Dê um nome para a receita.';
    const nomeIgual = lista('receitas').find(x => x.id !== r.id && normBusca(x.nome) === normBusca(r.nome));
    if (nomeIgual) return 'Já existe uma receita com esse nome.';
    if (C.numOk(r.perdaPct) && (r.perdaPct < 0 || r.perdaPct >= 100)) return 'A perda precisa ficar entre 0 e 99%.';
    return null;
  }
  function salvarReceita() {
    const e = S.editor; const r = e.d;
    const erro = validarReceita(r);
    if (erro) { toast(erro); return false; }
    r.nome = r.nome.trim();
    gravarRegistro('receitas', clone(r));
    const eraNova = e.nova;
    S.editor = { tipo: 'receita', idRota: r.id, nova: false, d: clone(r), sujo: false };
    toast('Receita salva.');
    if (eraNova) { ignorarHash = true; location.hash = '#/receita/' + encodeURIComponent(r.id); }
    render(false);
    return true;
  }

  // ================= Etapa 2: pedidos, clientes, agenda, produção e compras =================
  const ATIVOS = ['orcamento', 'confirmado', 'producao', 'pronto'];
  const ABAS_PED = [['#/pedidos', 'Pedidos'], ['#/agenda', 'Agenda'], ['#/producao', 'Produção'], ['#/compras', 'Compras']];
  const ABAS_REC = [['#/receitas', 'Receitas'], ['#/ingredientes', 'Ingredientes']];
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  function hoje() { return C.dataISO(); }
  function dataDia(iso) { const d = C.paraData(iso); return d ? iso.split('-').reverse().join('/') : '—'; }
  function dataCurta(iso) {
    const d = C.paraData(iso); if (!d) return 'sem data';
    const dif = C.diasEntre(hoje(), iso);
    const dm = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
    if (dif === 0) return 'hoje, ' + dm;
    if (dif === 1) return 'amanhã, ' + dm;
    if (dif === -1) return 'ontem, ' + dm;
    return ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'][d.getDay()] + ', ' + dm;
  }
  function aniversarioTxt(a) { if (!a) return ''; const [m, d] = a.split('-'); return d + ' de ' + MESES[Number(m) - 1]; }
  function nomeCliente(p) { const c = p.clienteId && S.dados.clientes[p.clienteId]; return (c && c.nome) || p.clienteNome || 'Sem cliente'; }
  function calcPed(p) { return C.calcularPedido(p, ctxCalc()); }
  function quandoTxt(p) { return (p.tipoEntrega === 'entrega' ? 'Entrega ' : 'Retirada ') + dataCurta(p.dataEntrega) + (p.horaEntrega ? ' às ' + C.horaFalada(p.horaEntrega) : ''); }
  function rotForma(f) { return C.FORMAS_PAGAMENTO[f] ? C.FORMAS_PAGAMENTO[f].rotulo : ''; }
  function abas(lst, ativo) { return '<nav class="abas" aria-label="Partes desta seção">' + lst.map(a => '<a href="' + a[0] + '"' + (a[0] === ativo ? ' aria-current="page"' : '') + '>' + a[1] + '</a>').join('') + '</nav>'; }
  function cab(titulo, sub, acoes) {
    return '<div class="cab-pagina"><div class="titulos"><h1>' + titulo + '</h1>' + (sub ? '<p class="sub">' + sub + '</p>' : '') + '</div>' + (acoes ? '<div class="acoes">' + acoes + '</div>' : '') + '</div>';
  }
  function chipStatus(s) {
    const cls = { orcamento: 'tracejado', producao: 'alerta', pronto: 'pos', entregue: 'mudo', cancelado: 'neg' }[s] || '';
    return '<span class="chip ' + cls + '">' + esc(C.STATUS_PEDIDO[s] ? C.STATUS_PEDIDO[s].rotulo : s) + '</span>';
  }
  function chipPagamento(c, p) {
    if (p.status === 'cancelado' || p.status === 'orcamento') return '';
    if (c.situacao === 'pago') return '<span class="chip pos">' + I.ok + 'pago</span>';
    if (c.situacao === 'parcial') return '<span class="chip alerta">pago em parte</span>';
    if (c.situacao === 'excedente') return '<span class="chip alerta">pago a mais</span>';
    return '<span class="chip">nada pago</span>';
  }
  function ordemData(a, b) { return String(a.dataEntrega || '9').localeCompare(String(b.dataEntrega || '9')) || String(a.horaEntrega || '99').localeCompare(String(b.horaEntrega || '99')); }
  function cardPedido(p) {
    const c = calcPed(p);
    const atrasado = ['confirmado', 'producao', 'pronto'].includes(p.status) && p.dataEntrega && p.dataEntrega < hoje();
    const its = p.itens || [];
    const resumo = its.slice(0, 2).map(it => C.num(it.qtd) + 'x ' + (it.nome || 'Item')).join(', ') + (its.length > 2 ? ' e mais ' + (its.length - 2) : '');
    return '<a class="item" href="#/pedido/' + encodeURIComponent(p.id) + '" data-busca="' + esc(normBusca(nomeCliente(p))) + '">' +
      '<div class="principal"><div class="nome">' + esc(nomeCliente(p)) + '</div><div class="det">' + esc(quandoTxt(p)) + '</div><div class="det">' + esc(resumo) + '</div></div>' +
      '<div class="valor">' + C.brl(c.total) + (c.restante > 0.004 && !['cancelado', 'orcamento'].includes(p.status) ? '<small>falta ' + C.brl(c.restante) + '</small>' : '') + '</div>' +
      '<div class="chips">' + chipStatus(p.status) + (atrasado ? '<span class="chip neg">' + I.alerta + 'data já passou</span>' : '') + chipPagamento(c, p) + '</div></a>';
  }
  function listaAgrupada(peds) {
    let h = '', ultimo = null;
    peds.forEach(function (p) {
      if (p.dataEntrega !== ultimo) { ultimo = p.dataEntrega; h += '<h3 class="grupo-data">' + esc(dataCurta(p.dataEntrega)) + '</h3>'; }
      h += cardPedido(p);
    });
    return h;
  }
  async function copiarTexto(txt) {
    try { await navigator.clipboard.writeText(txt); toast('Texto copiado.'); return; } catch (e) { /* tenta o jeito antigo */ }
    const t = document.createElement('textarea'); t.value = txt; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); toast('Texto copiado.'); } catch (e) { toast('Não foi possível copiar. Selecione o texto e copie à mão.'); }
    t.remove();
  }

  // ---------- Lista de pedidos ----------
  const FILTROS_PED = [
    ['ativos', 'Em aberto', p => ATIVOS.includes(p.status)],
    ['orcamento', 'Orçamentos', p => p.status === 'orcamento'],
    ['receber', 'A receber', p => !['cancelado', 'orcamento'].includes(p.status) && calcPed(p).restante > 0.004],
    ['entregues', 'Entregues', p => p.status === 'entregue'],
    ['cancelados', 'Cancelados', p => p.status === 'cancelado'],
    ['todos', 'Todos', () => true]
  ];
  function telaPedidos(q) {
    const f = FILTROS_PED.find(x => x[0] === q.get('f')) || FILTROS_PED[0];
    const todos = lista('pedidos');
    let h = cab('Pedidos', 'Encomendas, orçamentos e o que falta receber.', '<a class="btn" href="#/pedido/novo">' + I.mais + 'Novo pedido</a>') + abas(ABAS_PED, '#/pedidos');
    if (!todos.length) {
      return h + '<div class="bloco vazio">' + I.emblema + '<h2>Nenhum pedido ainda</h2><p>Registre orçamentos e encomendas. O app monta a agenda, a lista de produção e a lista de compras a partir deles.</p><a class="btn" href="#/pedido/novo">' + I.mais + 'Novo pedido</a></div>';
    }
    const futuros = ['ativos', 'orcamento', 'receber'].includes(f[0]);
    const lst = todos.filter(f[2]).sort(futuros ? ordemData : (a, b) => ordemData(b, a));
    h += '<div class="seg rolavel" role="group" aria-label="Filtrar pedidos" style="margin-bottom:12px">' + FILTROS_PED.map(x => '<a href="#/pedidos?f=' + x[0] + '" aria-pressed="' + (x === f) + '">' + x[1] + '</a>').join('') + '</div>';
    h += '<div class="linha-campos" style="margin-bottom:14px"><label class="busca"><span class="sr">Buscar por cliente</span>' + I.busca + '<input class="entrada" id="busca-ped" type="search" placeholder="Buscar por cliente"></label></div>';
    if (!lst.length) return h + '<p class="mudo" style="padding:16px 4px">Nenhum pedido neste filtro.</p>';
    if (f[0] === 'receber') {
      const tot = lst.reduce((s, p) => s + calcPed(p).restante, 0);
      h += '<div class="aviso" style="margin-bottom:12px">' + I.alerta + '<div class="txt">Falta receber <b>' + C.brl(tot) + '</b> em ' + lst.length + (lst.length === 1 ? ' pedido.' : ' pedidos.') + '</div></div>';
    }
    h += '<div class="lista" id="lista-ped">' + (futuros ? listaAgrupada(lst) : lst.map(cardPedido).join('')) + '</div><p class="mudo" id="sem-res-ped" hidden style="padding:16px">Nenhum pedido desse cliente neste filtro.</p>';
    return h;
  }
  function montarFiltroPedidos() {
    const b = $('#busca-ped'); if (!b) return;
    b.addEventListener('input', function () {
      const q = normBusca(b.value); let n = 0;
      $$('#lista-ped .item').forEach(el => { const v = !q || el.dataset.busca.includes(q); el.hidden = !v; if (v) n++; });
      $$('#lista-ped .grupo-data').forEach(g => { let el = g.nextElementSibling, vis = false; while (el && !el.classList.contains('grupo-data')) { if (!el.hidden) vis = true; el = el.nextElementSibling; } g.hidden = !vis; });
      $('#sem-res-ped').hidden = n > 0;
    });
  }

  // ---------- Editor de pedido ----------
  function novoPedidoBase(q) {
    const cf = cfg();
    const p = {
      id: uid(), clienteId: '', clienteNome: '', status: 'orcamento', tipoEntrega: 'retirada',
      dataEntrega: '', horaEntrega: '', endereco: '', taxaEntrega: cf.taxas.entrega,
      itens: [], desconto: null, formaPagamento: 'pix', pagamentos: [], obs: '', historicoStatus: []
    };
    const cli = q && q.get('cliente') && S.dados.clientes[q.get('cliente')];
    if (cli && !cli.excluidoEm) { p.clienteId = cli.id; p.clienteNome = cli.nome; p.endereco = cli.endereco || ''; }
    if (q && /^\d{4}-\d{2}-\d{2}$/.test(q.get('data') || '')) p.dataEntrega = q.get('data');
    return p;
  }
  function telaEditorPedido(id, q) {
    if (!S.editor || S.editor.tipo !== 'pedido' || S.editor.idRota !== id) {
      let d;
      if (id === 'novo') d = novoPedidoBase(q);
      else if (S.dados.pedidos[id] && !S.dados.pedidos[id].excluidoEm) d = clone(S.dados.pedidos[id]);
      else return '<div class="bloco vazio">' + I.emblema + '<h2>Pedido não encontrado</h2><p>Ele pode ter sido excluído em outro aparelho.</p><a class="btn" href="#/pedidos">Ver pedidos</a></div>';
      d.itens = d.itens || []; d.pagamentos = d.pagamentos || [];
      S.editor = { tipo: 'pedido', idRota: id, nova: id === 'novo', d: d, sujo: false };
    }
    return htmlEditorPedido();
  }
  function htmlEditorPedido() {
    const e = S.editor, p = e.d;
    const cli = p.clienteId ? S.dados.clientes[p.clienteId] : null;
    let h = '<div class="cab-pagina"><div class="titulos"><a href="#/pedidos" class="link-btn voltar">' + I.voltar + 'Pedidos</a><h1>' + (e.nova ? 'Novo pedido' : 'Pedido de ' + esc(nomeCliente(p))) + '</h1>' +
      (!e.nova ? '<p class="sub">Registrado em ' + dataHoraBR(p.criadoEm) + '</p>' : '') + '</div></div>';
    h += '<div class="editor"><div class="form-ped">';

    h += '<section class="bloco"><h2>Cliente</h2>' + (cli
      ? '<div class="linha-cliente"><div class="principal"><div class="nome">' + esc(cli.nome) + '</div><div class="det">' + esc(cli.telefone || 'sem telefone') + '</div>' + (cli.obs ? '<div class="aviso" style="margin-top:8px">' + I.alerta + '<div class="txt">' + esc(cli.obs) + '</div></div>' : '') + '</div><div class="acoes"><a class="btn sec fino" href="#/cliente/' + encodeURIComponent(cli.id) + '">Ver ficha</a><button type="button" class="btn sec fino" data-acao="escolher-cliente">Trocar</button></div></div>'
      : '<button type="button" class="btn" data-acao="escolher-cliente">' + I.clientes + 'Escolher cliente</button>') + '</section>';

    h += '<section class="bloco"><h2>Situação</h2>' + (p.status === 'cancelado'
      ? '<div class="aviso neg">' + I.alerta + '<div class="txt">Pedido cancelado. Ele não entra na agenda, na produção nem nas compras. <button type="button" class="link-btn" data-acao="reabrir-ped">Reabrir pedido</button></div></div>'
      : '<div class="seg rolavel" role="group" aria-label="Situação do pedido">' + ['orcamento', 'confirmado', 'producao', 'pronto', 'entregue'].map(s => '<button type="button" data-acao="status-ped" data-v="' + s + '" aria-pressed="' + (p.status === s) + '">' + C.STATUS_PEDIDO[s].rotulo + '</button>').join('') + '</div>') + '</section>';

    h += '<section class="bloco"><h2>Retirada ou entrega</h2><div class="seg" role="group" aria-label="Como o cliente recebe"><button type="button" data-acao="tipo-ent" data-v="retirada" aria-pressed="' + (p.tipoEntrega !== 'entrega') + '">Retirada</button><button type="button" data-acao="tipo-ent" data-v="entrega" aria-pressed="' + (p.tipoEntrega === 'entrega') + '">Entrega</button></div>' +
      '<div class="grade" style="margin-top:14px"><label class="campo"><span>Data</span><input class="entrada" type="date" data-c="dataEntrega" value="' + esc(p.dataEntrega || '') + '"></label>' +
      '<label class="campo"><span>Horário</span><input class="entrada" type="time" data-c="horaEntrega" value="' + esc(p.horaEntrega || '') + '"></label>' +
      (p.tipoEntrega === 'entrega' ? '<label class="campo"><span>Endereço</span><input class="entrada" data-c="endereco" value="' + esc(p.endereco || '') + '" placeholder="Rua, número, bairro"></label>' +
        '<label class="campo"><span>Taxa de entrega</span><span class="com-prefixo"><i>R$</i><input class="entrada num" data-c="taxaEntrega" data-n inputmode="decimal" value="' + inNum(p.taxaEntrega) + '"></span><small>Cobrada do cliente. Não conta como lucro.</small></label>' : '') + '</div></section>';

    h += '<section class="bloco"><h2>Produtos</h2><div class="linhas-edit">' + (p.itens.length ? p.itens.map(function (it, i) {
      return '<div class="linha-edit linha-ped">' +
        (it.tipo === 'avulso'
          ? '<label class="campo nome-av"><span>Item avulso</span><input class="entrada" data-c="itens.' + i + '.nome" value="' + esc(it.nome || '') + '" placeholder="Ex.: vela, topo de bolo"></label>'
          : '<div class="nome-it"><span>' + esc(it.nome) + '</span></div>') +
        '<label class="campo"><span>Quantidade</span><input class="entrada num" data-c="itens.' + i + '.qtd" data-n inputmode="decimal" value="' + inNum(it.qtd) + '"></label>' +
        '<label class="campo"><span>Preço unitário</span><span class="com-prefixo"><i>R$</i><input class="entrada num" data-c="itens.' + i + '.precoUnit" data-n inputmode="decimal" value="' + inNum(it.precoUnit) + '"></span></label>' +
        (it.tipo === 'avulso' ? '<label class="campo"><span>Custo unitário</span><span class="com-prefixo"><i>R$</i><input class="entrada num" data-c="itens.' + i + '.custoUnit" data-n inputmode="decimal" value="' + inNum(it.custoUnit) + '" placeholder="opcional"></span></label>' : '') +
        '<div class="tot-it"><span class="mudo">Total</span><b data-ped-item="' + i + '"></b></div>' +
        '<button type="button" class="btn-icone" data-acao="rem-item-ped" data-i="' + i + '" aria-label="Remover ' + esc(it.nome || 'item') + '">' + I.lixo + '</button></div>';
    }).join('') : '<p class="mudo">Nenhum produto ainda.</p>') +
      '</div><div class="acoes" style="margin-top:12px"><button type="button" class="btn sec" data-acao="add-produto">' + I.mais + 'Adicionar produto</button><button type="button" class="btn sec" data-acao="add-avulso">' + I.mais + 'Item avulso</button></div>' +
      '<div class="grade" style="margin-top:14px"><label class="campo"><span>Desconto</span><span class="com-prefixo"><i>R$</i><input class="entrada num" data-c="desconto" data-n inputmode="decimal" value="' + inNum(p.desconto) + '" placeholder="0,00"></span></label></div></section>';

    h += '<section class="bloco"><h2>Pagamento</h2><label class="campo"><span>Forma combinada</span><select class="entrada" data-c="formaPagamento">' +
      Object.keys(C.FORMAS_PAGAMENTO).map(k => '<option value="' + k + '"' + (p.formaPagamento === k ? ' selected' : '') + '>' + C.FORMAS_PAGAMENTO[k].rotulo + '</option>').join('') +
      '</select><small>Cartão e aplicativo têm taxa; ela sai do lucro estimado.</small></label>' +
      '<h3 style="margin-top:18px">Recebido</h3>' + (p.pagamentos.length
        ? '<ul class="historico">' + p.pagamentos.map((x, i) => '<li><span>' + dataDia(x.data) + ', ' + esc(rotForma(x.forma)) + (x.obs ? ' (' + esc(x.obs) + ')' : '') + '</span><span><b>' + C.brl(x.valor) + '</b><button type="button" class="link-btn mini" data-acao="rem-pag" data-i="' + i + '" aria-label="Remover pagamento de ' + C.brl(x.valor) + '">remover</button></span></li>').join('') + '</ul>'
        : '<p class="mudo">Nada recebido ainda.</p>') +
      '<div class="acoes" style="margin-top:12px" id="botoes-pag"></div></section>';

    h += '<section class="bloco"><h2>Observações</h2><label class="campo"><span class="sr">Observações</span><textarea class="entrada" data-c="obs" placeholder="Tema da festa, cores, sem lactose, mensagem no cartão…">' + esc(p.obs || '') + '</textarea></label></section>';

    h += '<div class="barra-salvar"><span class="estado" id="estado-ped"></span>' +
      (!e.nova ? '<button type="button" class="btn perigo fino" data-acao="excluir-ped" aria-label="Excluir pedido" title="Excluir pedido">' + I.lixo + '<span>Excluir</span></button>' : '') +
      (!e.nova && p.status !== 'cancelado' ? '<button type="button" class="btn sec fino" data-acao="cancelar-ped" aria-label="Cancelar pedido" title="Cancelar pedido">' + I.fechar + '<span>Cancelar pedido</span></button>' : '') +
      '<button type="button" class="btn" data-acao="salvar-ped">Salvar pedido</button></div>';
    h += '</div><aside class="painel"><div class="bloco" id="resumo-ped" aria-live="polite"></div></aside></div>';
    return h;
  }
  function montarEditorPedido() {
    const cont = $('.form-ped'); if (!cont || !S.editor) return;
    cont.addEventListener('input', aoEditarPedido);
    cont.addEventListener('change', aoEditarPedido);
    recalcPedido();
  }
  function aoEditarPedido(ev) {
    const el = ev.target, e = S.editor; if (!e || e.tipo !== 'pedido') return;
    const cam = el.dataset.c; if (!cam) return;
    const porChange = el.tagName === 'SELECT' || el.type === 'date' || el.type === 'time';
    if (porChange ? ev.type !== 'change' : ev.type !== 'input') return;
    gravarCaminho(e.d, cam, el.hasAttribute('data-n') ? C.lerNum(el.value) : el.value);
    marcarSujo(); recalcPedido();
  }
  function recalcPedido() {
    const e = S.editor; if (!e || e.tipo !== 'pedido') return;
    const p = e.d, c = calcPed(p);
    c.itens.forEach((it, i) => { const el = $('[data-ped-item="' + i + '"]'); if (el) el.textContent = C.brl(it.total); });
    const est = $('#estado-ped');
    if (est) est.innerHTML = '<b style="color:var(--ink)">' + C.brl(c.total) + '</b>' + (c.restante > 0.004 ? ', falta ' + C.brl(c.restante) : '') + '<br>' + (e.sujo ? 'Alterações não salvas' : (e.nova ? 'Pedido novo' : 'Tudo salvo'));
    const bp = $('#botoes-pag');
    if (bp) bp.innerHTML = (c.pago < 0.005 && c.sinalSugerido > 0 && c.restante > 0.004 ? '<button type="button" class="btn sec" data-acao="pagar" data-v="sinal">Registrar sinal de ' + C.brl(c.sinalSugerido) + '</button>' : '') +
      (c.restante > 0.004 ? '<button type="button" class="btn sec" data-acao="pagar" data-v="restante">Registrar pagamento</button>' : '');
    const res = $('#resumo-ped'); if (!res) return;
    const li = (r, v) => '<li><span>' + r + '</span><span>' + v + '</span></li>';
    res.innerHTML = '<h2>Resumo</h2><ul class="decomp">' + li('Produtos', C.brl(c.subtotal)) +
      (c.taxaEntrega ? li('Entrega', C.brl(c.taxaEntrega)) : '') + (c.desconto ? li('Desconto', '-' + C.brl(c.desconto)) : '') +
      '<li class="total"><span>Total</span><span>' + C.brl(c.total) + '</span></li>' + li('Recebido', C.brl(c.pago)) +
      '<li class="total"><span>' + (c.restante < -0.004 ? 'Pago a mais' : 'Falta receber') + '</span><span>' + C.brl(Math.abs(c.restante)) + '</span></li></ul>' +
      '<div class="destaque-un"><div class="r">Lucro estimado</div><div class="v">' + (C.numOk(c.lucro) ? C.brl(c.lucro) : '—') + '</div><div class="r">' +
      (C.numOk(c.lucro) ? 'Custo dos produtos ' + C.brl(c.custo) + (c.taxaPagamento > 0 ? ', taxa ' + C.brl(c.taxaPagamento) : '') + (C.numOk(c.margem) ? ', margem ' + C.pct(c.margem) : '')
        : (p.itens.length ? 'Algum produto está sem custo. Em itens avulsos, informe o custo unitário.' : 'Adicione produtos para ver o lucro.')) + '</div></div>' +
      '<div class="acoes" style="margin-top:16px"><button type="button" class="btn fino" data-acao="whats-ped">' + I.mensagem + 'Mensagem para WhatsApp</button></div>';
  }
  function validarPedido(p) {
    if (!p.clienteId) return 'Escolha o cliente do pedido.';
    if (!p.dataEntrega) return 'Informe a data de ' + (p.tipoEntrega === 'entrega' ? 'entrega.' : 'retirada.');
    if (!p.itens.length) return 'Adicione pelo menos um produto.';
    if (p.itens.some(it => !(it.qtd > 0))) return 'Todo produto precisa de quantidade maior que zero.';
    if (p.itens.some(it => it.tipo === 'avulso' && !String(it.nome || '').trim())) return 'Dê um nome ao item avulso.';
    return null;
  }
  function salvarPedido(msg) {
    const e = S.editor, p = e.d;
    const erro = validarPedido(p);
    if (erro) { toast(erro); return false; }
    const c = calcPed(p);
    const cli = S.dados.clientes[p.clienteId];
    if (cli) p.clienteNome = cli.nome;
    p.itens.forEach((it, i) => { if (it.tipo === 'rec' && C.numOk(c.itens[i].custoUnit)) it.custoUnit = c.itens[i].custoUnit; });
    // Resumo em colunas simples: aparece legível na planilha e servirá aos relatórios.
    p.total = c.total; p.pago = c.pago; p.restante = c.restante; p.lucroEstimado = c.lucro; p.situacaoPagamento = c.situacao;
    const orig = S.dados.pedidos[p.id];
    if (!orig || orig.status !== p.status) (p.historicoStatus = p.historicoStatus || []).push({ status: p.status, em: agoraISO() });
    gravarRegistro('pedidos', clone(p));
    const eraNovo = e.nova;
    S.editor = { tipo: 'pedido', idRota: p.id, nova: false, d: clone(p), sujo: false };
    toast(msg || (eraNovo ? 'Pedido criado.' : 'Pedido salvo.'));
    if (eraNovo) { ignorarHash = true; location.hash = '#/pedido/' + encodeURIComponent(p.id); }
    render(false);
    return true;
  }
  function folhaProduto() {
    const ctx = ctxCalc();
    const ops = [];
    lista('receitas').sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR')).forEach(function (r) {
      const c = C.calcularReceita(r, ctx);
      (c.variacoes || []).forEach(v => ops.push({ r: r, v: v }));
    });
    if (!ops.length) {
      abrirFolha('Adicionar produto', '<p>Ainda não há receitas com opções de venda. Cadastre uma receita e as formas de vender (unidade, caixa, cento) para escolher aqui.</p><div class="rodape-folha"><a class="btn" href="#/receita/nova" data-fechar>Nova receita</a></div>');
      return;
    }
    const corpo = '<label class="busca"><span class="sr">Buscar produto</span>' + I.busca + '<input class="entrada" id="busca-prod" type="search" placeholder="Buscar produto"></label><div class="lista" id="lista-prod">' +
      ops.map((o, i) => '<button type="button" class="item" data-i="' + i + '" data-busca="' + esc(normBusca(o.r.nome + ' ' + o.v.nome)) + '"><div class="principal"><div class="nome">' + esc(o.r.nome) + '</div><div class="det">' + esc(o.v.nome || 'Opção') + '</div></div><div class="valor">' + (C.numOk(o.v.preco) ? C.brl(o.v.preco) : '<small>sem preço</small>') + '</div></button>').join('') +
      '</div><p class="mudo" id="sem-prod" hidden>Nada encontrado.</p>';
    abrirFolha('Adicionar produto', corpo, function (d) {
      const b = $('#busca-prod', d);
      b.addEventListener('input', function () {
        const q = normBusca(b.value); let n = 0;
        $$('#lista-prod .item', d).forEach(el => { const v = !q || el.dataset.busca.includes(q); el.hidden = !v; if (v) n++; });
        $('#sem-prod', d).hidden = n > 0;
      });
      $$('#lista-prod .item', d).forEach(el => el.onclick = function () {
        const o = ops[+el.dataset.i];
        const p = S.editor.d;
        const ja = p.itens.findIndex(it => it.tipo === 'rec' && it.receitaId === o.r.id && it.variacaoId === o.v.id);
        if (ja >= 0) { p.itens[ja].qtd = (p.itens[ja].qtd || 0) + 1; toast('Quantidade aumentada: o produto já estava no pedido.'); }
        else p.itens.push({ id: uid(), tipo: 'rec', receitaId: o.r.id, variacaoId: o.v.id, nome: o.r.nome + ' (' + (o.v.nome || 'opção') + ')', qtd: 1, precoUnit: C.numOk(o.v.preco) ? C.round2(o.v.preco) : null, custoUnit: C.numOk(o.v.custo) ? o.v.custo : null });
        d.close(); marcarSujo(); render(false);
        const idx = ja >= 0 ? ja : p.itens.length - 1;
        setTimeout(() => { const el2 = $('[data-c="itens.' + idx + '.qtd"]'); if (el2) el2.focus(); }, 50);
      });
    });
  }
  function folhaPagamento(tipo) {
    const p = S.editor.d, c = calcPed(p);
    const valor = tipo === 'sinal' ? c.sinalSugerido : Math.max(0, c.restante);
    const corpo = '<form id="f-pag" style="display:flex;flex-direction:column;gap:12px">' +
      '<label class="campo"><span>Valor recebido</span><span class="com-prefixo"><i>R$</i><input class="entrada num" name="valor" inputmode="decimal" required value="' + inNum(C.round2(valor)) + '"></span>' + (tipo === 'sinal' ? '<small>Sinal padrão de ' + C.num(cfg().sinalPadraoPct) + '%. Pode mudar o valor.</small>' : '<small>Falta ' + C.brl(c.restante) + '.</small>') + '</label>' +
      '<div class="linha-campos"><label class="campo"><span>Data</span><input class="entrada" type="date" name="data" required value="' + hoje() + '"></label>' +
      '<label class="campo"><span>Forma</span><select class="entrada" name="forma">' + Object.keys(C.FORMAS_PAGAMENTO).map(k => '<option value="' + k + '"' + ((p.formaPagamento || 'pix') === k ? ' selected' : '') + '>' + C.FORMAS_PAGAMENTO[k].rotulo + '</option>').join('') + '</select></label></div>' +
      '<label class="campo"><span>Observação</span><input class="entrada" name="obs" placeholder="Opcional"></label>' +
      '<div class="rodape-folha"><button type="button" class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit">Registrar ' + (tipo === 'sinal' ? 'sinal' : 'pagamento') + '</button></div></form>';
    abrirFolha(tipo === 'sinal' ? 'Registrar sinal' : 'Registrar pagamento', corpo, function (d) {
      $('#f-pag', d).addEventListener('submit', function (ev) {
        ev.preventDefault(); const f = ev.target;
        const v = C.lerNum(f.valor.value);
        if (!(v > 0)) { toast('Informe um valor maior que zero.'); return; }
        p.pagamentos.push({ id: uid(), data: f.data.value || hoje(), valor: C.round2(v), forma: f.forma.value, obs: f.obs.value.trim(), tipo: tipo });
        let msg = 'Pagamento registrado.';
        if (tipo === 'sinal' && p.status === 'orcamento') { p.status = 'confirmado'; msg = 'Sinal registrado e pedido confirmado.'; }
        d.close(); marcarSujo();
        if (!salvarPedido(msg)) render(false);
      });
    });
  }
  function folhaWhats(p) {
    const cli = S.dados.clientes[p.clienteId] || {};
    const tel = C.telefoneWhats(cli.telefone);
    const pw = Object.assign({}, p, { clienteNome: cli.nome || p.clienteNome });
    const tipos = [['orcamento', 'Orçamento'], ['confirmacao', 'Confirmação'], ['lembrete', 'Lembrete'], ['recibo', 'Recibo']];
    let atual = p.status === 'orcamento' ? 'orcamento' : ['confirmado', 'producao'].includes(p.status) ? 'confirmacao' : p.status === 'pronto' ? 'lembrete' : 'recibo';
    const corpo = '<div class="seg rolavel" role="group" aria-label="Tipo de mensagem">' + tipos.map(t => '<button type="button" data-tipo="' + t[0] + '" aria-pressed="' + (t[0] === atual) + '">' + t[1] + '</button>').join('') + '</div>' +
      (!tel ? '<div class="aviso">' + I.alerta + '<div class="txt">' + (cli.telefone ? 'O telefone do cliente não parece ter DDD.' : 'Cliente sem telefone.') + ' O WhatsApp vai pedir para você escolher o contato.</div></div>' : '') +
      '<label class="campo"><span>Texto (pode editar antes de enviar)</span><textarea class="entrada" id="txt-whats" rows="12"></textarea></label>' +
      (S.editor && S.editor.sujo ? '<p class="mudo">O texto usa o que está na tela, inclusive o que ainda não foi salvo.</p>' : '') +
      '<div class="rodape-folha"><button type="button" class="btn sec" id="copiar-whats">' + I.copiar + 'Copiar texto</button><a class="btn" id="abrir-whats" target="_blank" rel="noopener">' + I.mensagem + 'Abrir no WhatsApp</a></div>';
    abrirFolha('Mensagem para WhatsApp', corpo, function (d) {
      const ta = $('#txt-whats', d), a = $('#abrir-whats', d);
      function link() { a.href = 'https://wa.me/' + tel + '?text=' + encodeURIComponent(ta.value); }
      function gerar() { ta.value = C.textoWhats(atual, pw, calcPed(pw), S.dados.config.geral, { hoje: hoje() }); link(); }
      $$('[data-tipo]', d).forEach(b => b.onclick = function () { atual = b.dataset.tipo; $$('[data-tipo]', d).forEach(x => x.setAttribute('aria-pressed', String(x === b))); gerar(); });
      ta.addEventListener('input', link);
      $('#copiar-whats', d).onclick = () => copiarTexto(ta.value);
      gerar();
    });
  }

  // ---------- Clientes ----------
  function statsCliente(id) {
    const ps = lista('pedidos').filter(p => p.clienteId === id && p.status !== 'cancelado').sort((a, b) => ordemData(b, a));
    const feitos = ps.filter(p => p.status !== 'orcamento');
    let total = 0, receber = 0;
    feitos.forEach(p => { const c = calcPed(p); total += c.total; if (p.status === 'entregue') receber += Math.max(0, c.restante); });
    const ultimo = feitos.map(p => p.dataEntrega).filter(Boolean).sort().slice(-1)[0] || null;
    return { pedidos: ps, n: feitos.length, total: total, ticket: feitos.length ? total / feitos.length : null, ultimo: ultimo, receber: receber };
  }
  function aniversarioNoMes(c, mes) { return !!(c.aniversario && c.aniversario.slice(0, 2) === mes); }
  function telaClientes() {
    const cls = lista('clientes').sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));
    let h = cab('Clientes', 'Contatos, preferências e histórico de compras.', '<button type="button" class="btn" data-acao="novo-cliente">' + I.mais + 'Novo cliente</button>');
    if (!cls.length) return h + '<div class="bloco vazio">' + I.emblema + '<h2>Nenhum cliente ainda</h2><p>Cadastre nome e WhatsApp. O histórico de pedidos de cada cliente se monta sozinho.</p><button type="button" class="btn" data-acao="novo-cliente">' + I.mais + 'Cadastrar cliente</button></div>';
    const mes = hoje().slice(5, 7);
    h += '<div class="linha-campos" style="margin-bottom:14px"><label class="busca"><span class="sr">Buscar cliente</span>' + I.busca + '<input class="entrada" id="busca-cli" type="search" placeholder="Buscar por nome ou telefone"></label></div><div class="lista" id="lista-cli">' +
      cls.map(function (c) {
        const s = statsCliente(c.id);
        return '<a class="item" href="#/cliente/' + encodeURIComponent(c.id) + '" data-busca="' + esc(normBusca(c.nome + ' ' + (c.telefone || '') + ' ' + String(c.telefone || '').replace(/\D/g, ''))) + '"><div class="principal"><div class="nome">' + esc(c.nome) + '</div><div class="det">' + esc(c.telefone || 'sem telefone') + '</div></div>' +
          '<div class="valor">' + (s.n ? C.brl(s.total) + '<small>' + s.n + (s.n === 1 ? ' pedido' : ' pedidos') + '</small>' : '<small>sem pedidos</small>') + '</div>' +
          '<div class="chips">' + (aniversarioNoMes(c, mes) ? '<span class="chip alerta">aniversário em ' + esc(aniversarioTxt(c.aniversario)) + '</span>' : '') + (s.receber > 0.004 ? '<span class="chip neg">deve ' + C.brl(s.receber) + '</span>' : '') + '</div></a>';
      }).join('') + '</div><p class="mudo" id="sem-res-cli" hidden style="padding:16px">Ninguém com esse nome. <button type="button" class="link-btn" data-acao="novo-cliente">Cadastrar novo</button></p>';
    return h;
  }
  function montarFiltroClientes() {
    const b = $('#busca-cli'); if (!b) return;
    b.addEventListener('input', function () {
      const q = normBusca(b.value); let n = 0;
      $$('#lista-cli .item').forEach(el => { const v = !q || el.dataset.busca.includes(q); el.hidden = !v; if (v) n++; });
      $('#sem-res-cli').hidden = n > 0;
    });
  }
  function telaCliente(id) {
    const c = S.dados.clientes[id];
    if (!c || c.excluidoEm) return '<div class="bloco vazio">' + I.emblema + '<h2>Cliente não encontrado</h2><p>Pode ter sido excluído em outro aparelho.</p><a class="btn" href="#/clientes">Ver clientes</a></div>';
    const s = statsCliente(id);
    const tel = C.telefoneWhats(c.telefone);
    let h = '<div class="cab-pagina"><div class="titulos"><a href="#/clientes" class="link-btn voltar">' + I.voltar + 'Clientes</a><h1>' + esc(c.nome) + '</h1></div><div class="acoes">' +
      (tel ? '<a class="btn sec" href="https://wa.me/' + tel + '" target="_blank" rel="noopener">' + I.mensagem + 'WhatsApp</a>' : '') +
      '<button type="button" class="btn sec" data-acao="editar-cliente" data-id="' + esc(id) + '">Editar</button><a class="btn" href="#/pedido/novo?cliente=' + encodeURIComponent(id) + '">' + I.mais + 'Novo pedido</a></div></div>';
    h += '<div class="stats"><div class="stat"><div class="n">' + s.n + '</div><div class="r">' + (s.n === 1 ? 'pedido feito' : 'pedidos feitos') + '</div></div>' +
      '<div class="stat"><div class="n">' + C.brl(s.total) + '</div><div class="r">no total</div></div>' +
      '<div class="stat"><div class="n">' + (C.numOk(s.ticket) ? C.brl(s.ticket) : '—') + '</div><div class="r">por pedido, em média</div></div>' +
      '<div class="stat"><div class="n">' + (s.ultimo ? dataDia(s.ultimo) : '—') + '</div><div class="r">último pedido</div></div></div>';
    if (s.receber > 0.004) h += '<div class="aviso neg" style="margin-bottom:16px">' + I.alerta + '<div class="txt">Falta receber <b>' + C.brl(s.receber) + '</b> de pedidos já entregues.</div></div>';
    h += '<section class="bloco"><h2>Dados</h2><dl class="dados-cli">' +
      '<div><dt>Telefone</dt><dd>' + esc(c.telefone || '—') + '</dd></div><div><dt>Endereço</dt><dd>' + esc(c.endereco || '—') + '</dd></div>' +
      '<div><dt>Aniversário</dt><dd>' + esc(aniversarioTxt(c.aniversario) || '—') + '</dd></div><div><dt>Preferências e restrições</dt><dd>' + esc(c.obs || '—') + '</dd></div></dl></section>';
    h += '<section class="bloco"><h2>Pedidos</h2>' + (s.pedidos.length ? '<div class="lista">' + s.pedidos.map(cardPedido).join('') + '</div>' : '<p class="mudo">Nenhum pedido ainda.</p>') + '</section>';
    return h;
  }
  function folhaCliente(id, aoSalvar) {
    const orig = id ? S.dados.clientes[id] : null;
    const c = orig ? clone(orig) : { id: uid(), nome: '', telefone: '', endereco: '', aniversario: '', obs: '' };
    const [am, ad] = c.aniversario ? c.aniversario.split('-') : ['', ''];
    const corpo = '<form id="f-cli" style="display:flex;flex-direction:column;gap:12px">' +
      '<label class="campo"><span>Nome</span><input class="entrada" name="nome" required value="' + esc(c.nome) + '" autocomplete="off"></label>' +
      '<label class="campo"><span>WhatsApp</span><input class="entrada" name="telefone" type="tel" inputmode="tel" value="' + esc(c.telefone) + '" placeholder="(11) 90000-0000"></label>' +
      '<label class="campo"><span>Endereço</span><input class="entrada" name="endereco" value="' + esc(c.endereco) + '" placeholder="Para entregas"></label>' +
      '<div class="campo"><span>Aniversário</span><div class="linha-campos" style="flex-wrap:nowrap"><select class="entrada" name="dia" aria-label="Dia"><option value="">Dia</option>' + Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map(d => '<option' + (d === ad ? ' selected' : '') + '>' + d + '</option>').join('') + '</select>' +
      '<select class="entrada" name="mes" aria-label="Mês"><option value="">Mês</option>' + MESES.map((m, i) => { const v = String(i + 1).padStart(2, '0'); return '<option value="' + v + '"' + (v === am ? ' selected' : '') + '>' + m + '</option>'; }).join('') + '</select></div><small>Opcional. Aparece no Início no mês do aniversário.</small></div>' +
      '<label class="campo"><span>Preferências e restrições</span><textarea class="entrada" name="obs" placeholder="Ex.: alergia a amendoim, prefere meio amargo">' + esc(c.obs) + '</textarea><small>Aparece em destaque nos pedidos deste cliente.</small></label>' +
      '<div class="rodape-folha">' + (orig ? '<button type="button" class="btn perigo" data-excluir>' + I.lixo + 'Excluir</button>' : '') + '<span style="flex:1"></span><button type="button" class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit">Salvar cliente</button></div></form>';
    abrirFolha(orig ? 'Editar cliente' : 'Novo cliente', corpo, function (d) {
      const f = $('#f-cli', d);
      f.nome.focus();
      f.addEventListener('submit', function (ev) {
        ev.preventDefault();
        const nome = f.nome.value.trim();
        if (!nome) { f.nome.focus(); return; }
        if ((f.dia.value && !f.mes.value) || (!f.dia.value && f.mes.value)) { toast('Escolha o dia e o mês do aniversário, ou deixe os dois em branco.'); return; }
        const novo = Object.assign(c, { nome: nome, telefone: f.telefone.value.trim(), endereco: f.endereco.value.trim(), aniversario: f.dia.value ? f.mes.value + '-' + f.dia.value : '', obs: f.obs.value.trim() });
        gravarRegistro('clientes', novo);
        d.close();
        toast(orig ? 'Cliente salvo.' : 'Cliente cadastrado.');
        if (aoSalvar) aoSalvar(novo); else render(false);
      });
      const ex = $('[data-excluir]', d);
      if (ex) ex.onclick = async function () {
        const n = lista('pedidos').filter(p => p.clienteId === orig.id).length;
        if (n) { toast('Este cliente tem ' + n + (n === 1 ? ' pedido' : ' pedidos') + ' e não pode ser excluído, para não perder o histórico.'); return; }
        d.close();
        if (await confirmar('Excluir cliente?', 'Excluir <b>' + esc(orig.nome) + '</b>.', 'Excluir cliente', true)) { excluirRegistro('clientes', orig.id); toast('Cliente excluído.'); ir('#/clientes'); }
      };
    });
  }
  function folhaEscolherCliente(fn) {
    const cls = lista('clientes').sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));
    const corpo = '<label class="busca"><span class="sr">Buscar cliente</span>' + I.busca + '<input class="entrada" id="busca-ec" type="search" placeholder="Buscar por nome ou telefone"></label>' +
      '<div class="lista" id="lista-ec">' + cls.map(c => '<button type="button" class="item" data-id="' + esc(c.id) + '" data-busca="' + esc(normBusca(c.nome + ' ' + String(c.telefone || '').replace(/\D/g, ''))) + '"><div class="principal"><div class="nome">' + esc(c.nome) + '</div><div class="det">' + esc(c.telefone || 'sem telefone') + '</div></div></button>').join('') + '</div>' +
      '<p class="mudo" id="sem-ec"' + (cls.length ? ' hidden' : '') + '>' + (cls.length ? 'Ninguém com esse nome.' : 'Nenhum cliente cadastrado ainda.') + '</p><button type="button" class="btn sec" data-novo>' + I.mais + 'Cadastrar cliente novo</button>';
    abrirFolha('Escolher cliente', corpo, function (d) {
      const b = $('#busca-ec', d);
      b.addEventListener('input', function () {
        const q = normBusca(b.value); let n = 0;
        $$('#lista-ec .item', d).forEach(el => { const v = !q || el.dataset.busca.includes(q.replace(/\D/g, '') || q) || el.dataset.busca.includes(q); el.hidden = !v; if (v) n++; });
        $('#sem-ec', d).hidden = n > 0;
      });
      $$('#lista-ec .item', d).forEach(el => el.onclick = () => { d.close(); fn(S.dados.clientes[el.dataset.id]); });
      $('[data-novo]', d).onclick = () => { d.close(); folhaCliente(null, fn); };
    });
  }

  // ---------- Agenda ----------
  function telaAgenda() {
    const A = S.agenda || (S.agenda = { mes: hoje().slice(0, 7), dia: hoje() });
    const [y, m] = A.mes.split('-').map(Number);
    const vazios = new Date(y, m - 1, 1).getDay(), nDias = new Date(y, m, 0).getDate();
    const porDia = {};
    lista('pedidos').filter(p => p.status !== 'cancelado' && p.dataEntrega && p.dataEntrega.slice(0, 7) === A.mes).forEach(p => { (porDia[p.dataEntrega] = porDia[p.dataEntrega] || []).push(p); });
    let h = cab('Agenda', 'Entregas e retiradas por dia.', '<a class="btn" href="#/pedido/novo?data=' + A.dia + '">' + I.mais + 'Novo pedido neste dia</a>') + abas(ABAS_PED, '#/agenda');
    h += '<section class="bloco"><div class="cal-cab"><button type="button" class="btn-icone" data-acao="agenda-mes" data-v="-1" aria-label="Mês anterior">' + I.voltar + '</button><h2>' + MESES[m - 1].charAt(0).toUpperCase() + MESES[m - 1].slice(1) + ' de ' + y + '</h2><button type="button" class="btn-icone" data-acao="agenda-mes" data-v="1" aria-label="Próximo mês">' + I.seta + '</button></div>' +
      '<div class="cal" role="grid"><div class="cal-sem" aria-hidden="true">' + ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(x => '<span>' + x + '</span>').join('') + '</div><div class="cal-dias">' +
      '<span></span>'.repeat(vazios) + Array.from({ length: nDias }, function (_, i) {
        const iso = A.mes + '-' + String(i + 1).padStart(2, '0');
        const n = (porDia[iso] || []).length;
        return '<button type="button" class="cal-dia' + (iso === hoje() ? ' hoje' : '') + (iso === A.dia ? ' sel' : '') + '" data-acao="agenda-dia" data-v="' + iso + '" aria-pressed="' + (iso === A.dia) + '" aria-label="' + (i + 1) + ' de ' + MESES[m - 1] + (n ? ', ' + n + (n === 1 ? ' pedido' : ' pedidos') : '') + '"><span>' + (i + 1) + '</span>' + (n ? '<i>' + n + '</i>' : '') + '</button>';
      }).join('') + '</div></div>' +
      (A.mes !== hoje().slice(0, 7) || A.dia !== hoje() ? '<button type="button" class="link-btn" data-acao="agenda-hoje">Voltar para hoje</button>' : '') + '</section>';
    const doDia = lista('pedidos').filter(p => p.dataEntrega === A.dia && p.status !== 'cancelado').sort(ordemData);
    h += '<section class="bloco"><h2>' + esc(dataCurta(A.dia).charAt(0).toUpperCase() + dataCurta(A.dia).slice(1)) + '</h2>' +
      (doDia.length ? '<div class="lista">' + doDia.map(cardPedido).join('') + '</div>' : '<p class="mudo">Nenhum pedido para este dia.</p>') + '</section>';
    return h;
  }

  // ---------- Produção ----------
  function textoProducao(dia, linhas) {
    return 'Produção de ' + dataDia(dia) + '\n\n' + linhas.map(l => (l.feito ? '[x] ' : '[ ] ') + l.nome + ': ' + l.qtd + (l.lotes ? ' (' + l.lotes + ')' : '')).join('\n');
  }
  function telaProducao() {
    const dia = S.prodDia || (S.prodDia = hoje());
    const doDia = lista('pedidos').filter(p => p.dataEntrega === dia && p.status !== 'cancelado');
    const peds = doDia.filter(p => ['confirmado', 'producao'].includes(p.status)).sort(ordemData);
    const orc = doDia.filter(p => p.status === 'orcamento').length;
    const prontos = doDia.filter(p => ['pronto', 'entregue'].includes(p.status)).length;
    const feito = S.meta.producaoFeita || {};
    let h = cab('Produção', 'O que fazer para os pedidos do dia, já somando receitas usadas dentro de outras.') + abas(ABAS_PED, '#/producao');
    h += '<div class="linha-campos" style="margin-bottom:16px;align-items:flex-end"><label class="campo" style="flex:0 1 200px"><span>Dia</span><input class="entrada" type="date" id="prod-dia" value="' + dia + '"></label>' +
      '<div class="acoes"><button type="button" class="btn sec fino" data-acao="prod-dia" data-v="0" aria-pressed="' + (dia === hoje()) + '">Hoje</button><button type="button" class="btn sec fino" data-acao="prod-dia" data-v="1" aria-pressed="' + (dia === C.somarDias(hoje(), 1)) + '">Amanhã</button></div></div>';
    if (!peds.length) {
      return h + '<div class="bloco vazio">' + I.emblema + '<h2>Nada para produzir ' + esc(dataCurta(dia)) + '</h2><p>' +
        (prontos ? prontos + (prontos === 1 ? ' pedido deste dia já está pronto ou entregue. ' : ' pedidos deste dia já estão prontos ou entregues. ') : '') +
        (orc ? orc + (orc === 1 ? ' orçamento ainda não foi confirmado.' : ' orçamentos ainda não foram confirmados.') : 'A lista usa pedidos confirmados ou em produção.') + '</p><a class="btn sec" href="#/agenda">Ver agenda</a></div>';
    }
    const nx = C.necessidades(peds, ctxCalc());
    const linhas = Object.values(nx.producao).map(function (x) {
      const r = S.dados.receitas[x.receitaId] || {};
      const lotes = x.rendBase ? x.qtdBase / x.rendBase : null;
      return { id: x.receitaId, nome: r.nome || 'Receita', direto: x.direto > 0, qtd: C.qtdLegivel(x.qtdBase, x.unidadeBase || 'un'),
        lotes: C.numOk(lotes) ? C.num(lotes, 2) + (lotes === 1 ? ' receita' : ' receitas') : '', feito: !!feito[dia + ':' + x.receitaId] };
    }).sort((a, b) => (a.direto === b.direto ? a.nome.localeCompare(b.nome, 'pt-BR') : a.direto ? 1 : -1));
    S.textoCopia = textoProducao(dia, linhas);
    const nConf = peds.filter(p => p.status === 'confirmado').length;
    h += '<section class="bloco"><h2>Fazer</h2><p class="explica">As receitas de base (recheios, massas) aparecem primeiro, porque entram nas outras.</p><div class="lista-check">' +
      linhas.map(l => '<label class="linha-check' + (l.feito ? ' feito' : '') + '"><input type="checkbox" data-prod="' + esc(dia + ':' + l.id) + '"' + (l.feito ? ' checked' : '') + '><span class="principal"><b>' + esc(l.nome) + '</b><small>' + (l.direto ? '' : 'base para outras receitas') + '</small></span><span class="valor">' + esc(l.qtd) + '<small>' + esc(l.lotes) + '</small></span></label>').join('') + '</div>' +
      (nx.avisos.length ? '<div class="aviso" style="margin-top:12px">' + I.alerta + '<div class="txt"><ul>' + nx.avisos.map(a => '<li>' + esc(a) + '</li>').join('') + '</ul></div></div>' : '') +
      '<div class="acoes" style="margin-top:14px">' + (nConf ? '<button type="button" class="btn" data-acao="prod-iniciar">Marcar ' + (nConf === 1 ? 'o pedido' : 'os ' + nConf + ' pedidos') + ' como em produção</button>' : '') +
      '<button type="button" class="btn sec" data-acao="copiar-lista">' + I.copiar + 'Copiar lista</button><a class="btn sec" href="#/compras?de=' + dia + '&ate=' + dia + '">Ver ingredientes do dia</a></div></section>';
    h += '<section class="bloco"><h2>Pedidos do dia</h2>' + (orc ? '<p class="explica">' + orc + (orc === 1 ? ' orçamento deste dia não entra na conta' : ' orçamentos deste dia não entram na conta') + ' até ser confirmado.</p>' : '') + '<div class="lista">' + peds.map(cardPedido).join('') + '</div></section>';
    return h;
  }

  // ---------- Compras ----------
  function telaCompras() {
    const F = S.compras || (S.compras = { de: hoje(), ate: C.somarDias(hoje(), 6), orc: false });
    const sts = F.orc ? ['orcamento', 'confirmado', 'producao'] : ['confirmado', 'producao'];
    const peds = lista('pedidos').filter(p => sts.includes(p.status) && p.dataEntrega && p.dataEntrega >= F.de && p.dataEntrega <= F.ate);
    const nx = C.necessidades(peds, ctxCalc());
    let h = cab('Lista de compras', 'Ingredientes para os pedidos do período, com receitas dentro de receitas já desmontadas e a perda de cada uma.') + abas(ABAS_PED, '#/compras');
    h += '<section class="bloco"><div class="linha-campos"><label class="campo"><span>De</span><input class="entrada" type="date" data-compras="de" value="' + F.de + '"></label><label class="campo"><span>Até</span><input class="entrada" type="date" data-compras="ate" value="' + F.ate + '"></label></div>' +
      '<div class="acoes" style="margin-top:10px"><button type="button" class="btn sec fino" data-acao="compras-periodo" data-v="7">Próximos 7 dias</button><button type="button" class="btn sec fino" data-acao="compras-periodo" data-v="1">Só amanhã</button></div>' +
      '<label class="chave" style="margin-top:6px"><span class="rot">Incluir orçamentos<small>Para já ter noção, antes de o cliente confirmar</small></span><input type="checkbox" data-compras="orc"' + (F.orc ? ' checked' : '') + '></label></section>';
    if (F.ate < F.de) return h + '<div class="aviso neg">' + I.alerta + '<div class="txt">A data final vem antes da inicial.</div></div>';
    const linhas = Object.values(nx.compras).map(c => ({ c: c, ing: S.dados.ingredientes[c.ingredienteId] })).filter(x => x.ing)
      .sort((a, b) => a.ing.nome.localeCompare(b.ing.nome, 'pt-BR'));
    if (!peds.length || !linhas.length) {
      return h + '<div class="bloco vazio">' + I.emblema + '<h2>Nada a comprar no período</h2><p>' + (peds.length ? 'Os pedidos do período não têm receitas com ingredientes calculáveis.' : 'Não há pedidos ' + (F.orc ? '' : 'confirmados ') + 'entre ' + dataDia(F.de) + ' e ' + dataDia(F.ate) + '.') + '</p></div>' +
        (nx.avisos.length ? '<div class="aviso">' + I.alerta + '<div class="txt"><ul>' + nx.avisos.map(a => '<li>' + esc(a) + '</li>').join('') + '</ul></div></div>' : '');
    }
    const total = linhas.reduce((s, x) => s + (x.c.custoEmbalagens || 0), 0);
    S.textoCopia = 'Lista de compras (' + dataDia(F.de) + (F.ate !== F.de ? ' a ' + dataDia(F.ate) : '') + ')\n\n' + linhas.map(x => '- ' + x.ing.nome + ': ' + (x.c.embalagens ? x.c.embalagens + ' × ' + C.num(x.ing.qtdEmbalagem) + ' ' + rotUn(x.ing.unidade) + ' (usa ' + C.qtdLegivel(x.c.qtdBase, x.c.base) + ')' : C.qtdLegivel(x.c.qtdBase, x.c.base))).join('\n') + '\n\nEstimativa: ' + C.brl(total);
    h += '<section class="bloco"><h2>' + linhas.length + (linhas.length === 1 ? ' ingrediente' : ' ingredientes') + ' para ' + peds.length + (peds.length === 1 ? ' pedido' : ' pedidos') + '</h2>' +
      '<p class="explica">"Usa" é o que as receitas consomem. "Comprar" arredonda para embalagens inteiras. Ainda não desconta o que você tem em casa; isso chega com o estoque, na próxima etapa.</p>' +
      '<div class="tabela-compras" role="table"><div class="tc-cab" role="row"><span role="columnheader">Ingrediente</span><span role="columnheader">Usa</span><span role="columnheader">Comprar</span><span role="columnheader">Custo</span></div>' +
      linhas.map(x => '<div class="tc-lin" role="row"><span role="cell"><b>' + esc(x.ing.nome) + '</b></span><span role="cell" data-r="Usa">' + C.qtdLegivel(x.c.qtdBase, x.c.base) + '</span><span role="cell" data-r="Comprar">' + (x.c.embalagens ? x.c.embalagens + ' × ' + C.num(x.ing.qtdEmbalagem) + ' ' + rotUn(x.ing.unidade) : '—') + '</span><span role="cell" data-r="Custo">' + C.brl(x.c.custoEmbalagens) + '</span></div>').join('') +
      '<div class="tc-lin tc-total" role="row"><span role="cell"><b>Total estimado</b></span><span role="cell"></span><span role="cell"></span><span role="cell"><b>' + C.brl(total) + '</b></span></div></div>' +
      (nx.avisos.length ? '<div class="aviso" style="margin-top:12px">' + I.alerta + '<div class="txt"><ul>' + nx.avisos.map(a => '<li>' + esc(a) + '</li>').join('') + '</ul></div></div>' : '') +
      '<div class="acoes" style="margin-top:14px"><button type="button" class="btn sec" data-acao="copiar-lista">' + I.copiar + 'Copiar lista</button><a class="btn sec" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(S.textoCopia) + '">' + I.mensagem + 'Enviar no WhatsApp</a></div></section>';
    return h;
  }

  // ---------- Início: blocos de pedidos ----------
  function blocosPedidosInicio() {
    const hj = hoje();
    const peds = lista('pedidos').filter(p => p.status !== 'cancelado');
    const deHoje = peds.filter(p => p.dataEntrega === hj).sort(ordemData);
    const amanha = peds.filter(p => p.dataEntrega === C.somarDias(hj, 1) && p.status !== 'entregue').length;
    const passados = peds.filter(p => ['confirmado', 'producao', 'pronto'].includes(p.status) && p.dataEntrega && p.dataEntrega < hj).sort(ordemData);
    const orcs = peds.filter(p => p.status === 'orcamento' && (!p.dataEntrega || p.dataEntrega >= hj)).sort(ordemData);
    const receber = peds.filter(p => p.status === 'entregue').map(p => ({ p: p, c: calcPed(p) })).filter(x => x.c.restante > 0.004);
    const mes = hj.slice(5, 7);
    const aniv = lista('clientes').filter(c => aniversarioNoMes(c, mes)).sort((a, b) => a.aniversario.localeCompare(b.aniversario));
    let h = '<section class="bloco"><div class="cab-bloco"><h2>Hoje</h2><a class="link-btn" href="#/agenda">Ver agenda</a></div>' +
      (deHoje.length ? '<div class="lista">' + deHoje.map(cardPedido).join('') + '</div>' : '<p class="mudo">Nenhuma entrega ou retirada hoje.</p>') +
      (amanha ? '<p class="mudo" style="margin-top:10px">Amanhã: ' + amanha + (amanha === 1 ? ' pedido. ' : ' pedidos. ') + '<a href="#/producao" data-acao="prod-dia" data-v="1">Ver produção de amanhã</a></p>' : '') + '</section>';
    if (passados.length) h += '<section class="bloco"><h2>Data já passou</h2><p class="explica">Pedidos com data anterior a hoje que ainda não foram marcados como entregues.</p><div class="lista">' + passados.map(cardPedido).join('') + '</div></section>';
    if (orcs.length) h += '<section class="bloco"><h2>Orçamentos aguardando resposta</h2><div class="lista">' + orcs.slice(0, 5).map(cardPedido).join('') + '</div>' + (orcs.length > 5 ? '<a class="link-btn" href="#/pedidos?f=orcamento">Ver todos os ' + orcs.length + '</a>' : '') + '</section>';
    if (receber.length) {
      const tot = receber.reduce((s, x) => s + x.c.restante, 0);
      h += '<section class="bloco"><h2>A receber: ' + C.brl(tot) + '</h2><p class="explica">Pedidos entregues que ainda não foram pagos por inteiro.</p><div class="lista">' + receber.map(x => cardPedido(x.p)).join('') + '</div></section>';
    }
    if (aniv.length) h += '<section class="bloco"><h2>Aniversariantes de ' + MESES[Number(mes) - 1] + '</h2><div class="lista">' + aniv.map(c => '<a class="item" href="#/cliente/' + encodeURIComponent(c.id) + '"><div class="principal"><div class="nome">' + esc(c.nome) + '</div><div class="det">' + esc(aniversarioTxt(c.aniversario)) + '</div></div>' + I.seta + '</a>').join('') + '</div></section>';
    return h;
  }

  // ---------- Ações ----------
  function statusRapido(v) {
    const p = S.editor.d;
    const antes = p.status; p.status = v; marcarSujo();
    const c = calcPed(p);
    if (S.editor.nova) { render(false); return; }
    const msg = 'Marcado como ' + C.STATUS_PEDIDO[v].rotulo.toLowerCase() + '.' + (v === 'entregue' && c.restante > 0.004 ? ' Falta receber ' + C.brl(c.restante) + '.' : '');
    if (!salvarPedido(msg)) { p.status = antes; render(false); }
  }
  const ACOES_PED = {
    'novo-cliente': function () { folhaCliente(null, c => ir('#/cliente/' + encodeURIComponent(c.id))); },
    'editar-cliente': function (el) { folhaCliente(el.dataset.id); },
    'escolher-cliente': function () {
      folhaEscolherCliente(function (cli) {
        const p = S.editor.d;
        p.clienteId = cli.id; p.clienteNome = cli.nome;
        if (!p.endereco && cli.endereco) p.endereco = cli.endereco;
        marcarSujo(); render(false);
      });
    },
    'status-ped': function (el) { statusRapido(el.dataset.v); },
    'reabrir-ped': function () { statusRapido('confirmado'); },
    'cancelar-ped': async function () {
      if (!await confirmar('Cancelar pedido?', 'O pedido sai da agenda, da produção e das compras. Os pagamentos registrados continuam nele.', 'Cancelar pedido', true)) return;
      statusRapido('cancelado');
    },
    'excluir-ped': async function () {
      const p = S.editor.d;
      if (!await confirmar('Excluir pedido?', 'O pedido de <b>' + esc(nomeCliente(p)) + '</b> some da lista e do histórico do cliente. Para manter o registro, prefira cancelar.', 'Excluir pedido', true)) return;
      excluirRegistro('pedidos', p.id); S.editor = null; toast('Pedido excluído.'); ir('#/pedidos');
    },
    'tipo-ent': function (el) {
      const p = S.editor.d; p.tipoEntrega = el.dataset.v;
      if (p.tipoEntrega === 'entrega') {
        if (!C.numOk(p.taxaEntrega)) p.taxaEntrega = cfg().taxas.entrega;
        const cli = S.dados.clientes[p.clienteId];
        if (!p.endereco && cli && cli.endereco) p.endereco = cli.endereco;
      }
      marcarSujo(); render(false);
    },
    'add-produto': folhaProduto,
    'add-avulso': function () {
      S.editor.d.itens.push({ id: uid(), tipo: 'avulso', nome: '', qtd: 1, precoUnit: null, custoUnit: null });
      marcarSujo(); render(false);
      setTimeout(() => { const el = $('[data-c="itens.' + (S.editor.d.itens.length - 1) + '.nome"]'); if (el) el.focus(); }, 50);
    },
    'rem-item-ped': function (el) { S.editor.d.itens.splice(+el.dataset.i, 1); marcarSujo(); render(false); },
    pagar: function (el) { folhaPagamento(el.dataset.v); },
    'rem-pag': async function (el) {
      const x = S.editor.d.pagamentos[+el.dataset.i];
      if (!await confirmar('Remover pagamento?', 'Remover o registro de ' + C.brl(x.valor) + ' de ' + dataDia(x.data) + '.', 'Remover', true)) return;
      S.editor.d.pagamentos.splice(+el.dataset.i, 1); marcarSujo();
      if (!salvarPedido('Pagamento removido.')) render(false);
    },
    'salvar-ped': function () { salvarPedido(); },
    'whats-ped': function () { folhaWhats(S.editor.d); },
    'agenda-dia': function (el) { S.agenda.dia = el.dataset.v; render(false); },
    'agenda-mes': function (el) {
      const [y, m] = S.agenda.mes.split('-').map(Number);
      const d = new Date(y, m - 1 + Number(el.dataset.v), 1);
      S.agenda.mes = C.dataISO(d).slice(0, 7);
      S.agenda.dia = S.agenda.mes === hoje().slice(0, 7) ? hoje() : S.agenda.mes + '-01';
      render(false);
    },
    'agenda-hoje': function () { S.agenda = { mes: hoje().slice(0, 7), dia: hoje() }; render(false); },
    'prod-dia': function (el) { S.prodDia = C.somarDias(hoje(), Number(el.dataset.v)); if (location.hash !== '#/producao') ir('#/producao'); else render(false); },
    'prod-iniciar': function () {
      const dia = S.prodDia;
      const ps = lista('pedidos').filter(p => p.dataEntrega === dia && p.status === 'confirmado');
      ps.forEach(function (p) { const c = clone(p); c.status = 'producao'; (c.historicoStatus = c.historicoStatus || []).push({ status: 'producao', em: agoraISO() }); gravarRegistro('pedidos', c); });
      toast(ps.length === 1 ? '1 pedido em produção.' : ps.length + ' pedidos em produção.'); render(false);
    },
    'copiar-lista': function () { if (S.textoCopia) copiarTexto(S.textoCopia); },
    'compras-periodo': function (el) {
      const n = Number(el.dataset.v);
      S.compras = Object.assign(S.compras || {}, n === 1 ? { de: C.somarDias(hoje(), 1), ate: C.somarDias(hoje(), 1) } : { de: hoje(), ate: C.somarDias(hoje(), n - 1) });
      render(false);
    }
  };
  document.addEventListener('change', function (e) {
    const t = e.target;
    if (t.dataset && t.dataset.prod !== undefined) {
      S.meta.producaoFeita = S.meta.producaoFeita || {};
      if (t.checked) S.meta.producaoFeita[t.dataset.prod] = true; else delete S.meta.producaoFeita[t.dataset.prod];
      // guarda só as duas últimas semanas
      const limite = C.somarDias(hoje(), -14);
      Object.keys(S.meta.producaoFeita).forEach(k => { if (k.slice(0, 10) < limite) delete S.meta.producaoFeita[k]; });
      salvarLocal();
      t.closest('.linha-check').classList.toggle('feito', t.checked);
      return;
    }
    if (t.id === 'prod-dia' && t.value) { S.prodDia = t.value; render(false); return; }
    if (t.dataset && t.dataset.compras) {
      S.compras = S.compras || {};
      if (t.dataset.compras === 'orc') S.compras.orc = t.checked; else if (t.value) S.compras[t.dataset.compras] = t.value;
      render(false);
    }
  });

  // ================= Ajustes =================
  function telaAjustes() {
    const cf = cfg();
    const modo = S.meta.modo;
    const s = textoSync();
    let h = '<div class="cab-pagina"><div class="titulos"><h1>Ajustes</h1><p class="sub">Valores usados no cálculo dos preços, aparência e sincronização.</p></div></div>';

    // Sincronização
    h += '<section class="bloco" id="sync"><h2>Sincronização</h2>';
    if (modo === 'planilha') {
      h += '<p class="explica">Conectado à planilha. Última sincronização: ' + (S.meta.ultimaSync ? dataHoraBR(S.meta.ultimaSync) : 'ainda não') + '.</p>' +
        '<div class="aviso ' + (s.e === 'ok' ? 'pos' : s.e === 'erro' || s.e === 'pin' ? 'neg' : '') + '" style="margin-bottom:12px">' + s.i + '<div class="txt"><b>' + esc(s.t) + '</b>' + (S.sync.msg ? '<br>' + esc(S.sync.msg) : '') + '</div></div>' +
        '<div class="acoes"><button type="button" class="btn" data-acao="sync-agora">' + I.girar + 'Sincronizar agora</button><button type="button" class="btn sec" data-acao="trocar-pin">Trocar PIN</button><button type="button" class="btn sec" data-acao="editar-conexao">Mudar endereço ou PIN deste aparelho</button><button type="button" class="btn perigo" data-acao="esquecer">Esquecer este aparelho</button></div>';
    } else {
      h += '<p class="explica">Os dados estão só neste aparelho. Ao conectar, tudo o que você já cadastrou é enviado para a planilha.</p>' +
        '<form id="form-conectar"><div class="grade"><label class="campo"><span>Endereço do app da planilha</span><input class="entrada" name="url" inputmode="url" autocomplete="off" placeholder="https://script.google.com/macros/s/…/exec" required></label>' +
        '<label class="campo"><span>PIN da doceria</span><input class="entrada" name="pin" type="password" autocomplete="off" required minlength="6"></label></div>' +
        '<p class="mudo" id="msg-conectar" style="margin:8px 0;min-height:1.5em" role="status"></p><div class="acoes"><button class="btn" type="submit">Conectar à planilha</button><button type="button" class="btn perigo" data-acao="apagar-teste">Apagar dados deste aparelho</button></div></form>';
    }
    if (S.meta.conflitos.length) {
      h += '<hr class="separa"><h3 id="conflitos">Versões que ficaram de fora</h3><p class="explica" style="margin-top:6px">Estes registros foram alterados em dois aparelhos ao mesmo tempo. Ficou a alteração mais recente; aqui está a outra, caso precise dela.</p><div class="lista">' +
        S.meta.conflitos.map(c => '<div class="item"><div class="principal"><div class="nome">' + esc((c.perdida && c.perdida.nome) || c.regId) + '</div><div class="det">' + esc(c.tabela) + ', ' + dataHoraBR(c.em) + '</div></div><div class="acoes"><button type="button" class="btn sec fino" data-acao="ver-conflito" data-id="' + c.id + '">Ver versão</button><button type="button" class="btn fino" data-acao="restaurar-conflito" data-id="' + c.id + '">Restaurar esta versão</button><button type="button" class="btn perigo fino" data-acao="dispensar-conflito" data-id="' + c.id + '">Dispensar</button></div></div>').join('') + '</div>';
    }
    h += '</section>';

    // Custos fixos
    h += '<h2 class="titulo-grupo">Ajustes da doceria</h2><p class="mudo" style="margin:-4px 0 10px">Custos fixos, mão de obra, preços e taxas e dados da doceria valem para todos os aparelhos. Na planilha, ficam na aba Ajustes.</p>' +
      '<div id="estado-ajustes" class="aviso" role="status" style="margin-bottom:16px"></div>';
    h += '<section class="bloco" id="fixos"><h2>Custos fixos do mês</h2><p class="explica">Contas que chegam todo mês, vendendo ou não. O total é dividido pelas horas de produção e entra no custo de cada receita conforme o tempo dela. Quando o módulo de caixa chegar, estes valores virão das despesas lançadas.</p><div class="linhas-edit">' +
      cf.custosFixos.map((c, i) => '<div class="linha-edit" style="grid-template-columns:1fr 150px auto"><input class="entrada" data-cfg="custosFixos.' + i + '.nome" value="' + esc(c.nome) + '" aria-label="Nome do custo"><span class="com-prefixo"><i>R$</i><input class="entrada num" data-cfg="custosFixos.' + i + '.valor" data-n inputmode="decimal" value="' + inNum(c.valor) + '" aria-label="Valor de ' + esc(c.nome) + '"></span><button type="button" class="btn-icone" data-acao="rem-fixo" data-i="' + i + '" aria-label="Remover ' + esc(c.nome) + '">' + I.lixo + '</button></div>').join('') +
      '</div><button type="button" class="btn sec" style="margin-top:12px" data-acao="add-fixo">' + I.mais + 'Adicionar custo fixo</button>' +
      '<div class="grade" style="margin-top:16px"><label class="campo"><span>Horas de produção por mês</span><span class="com-prefixo"><input class="entrada num" data-cfg="horasMes" data-n inputmode="decimal" value="' + inNum(cf.horasMes) + '"><i class="dir">h</i></span><small>Ex.: 5 dias por semana, 6 horas por dia: cerca de 120 h.</small></label>' +
      '<div class="campo"><span>Resultado</span><p style="font-weight:700;padding-top:10px">' + C.brl(C.totalFixos(cf)) + ' por mês, ' + (C.numOk(C.fixosPorHora(cf)) ? C.brl(C.fixosPorHora(cf)) + ' por hora' : 'defina as horas') + '</p></div></div></section>';

    // Mão de obra
    const mo = cf.maoObra;
    h += '<section class="bloco"><h2>Mão de obra</h2><p class="explica">Seu trabalho também é custo. Sem ele, o preço parece bom, mas você trabalha de graça.</p>' +
      '<div class="seg" role="group" aria-label="Como definir a mão de obra"><button type="button" data-acao="modo-mo" data-v="hora" aria-pressed="' + (mo.modo !== 'salario') + '">Valor da hora</button><button type="button" data-acao="modo-mo" data-v="salario" aria-pressed="' + (mo.modo === 'salario') + '">Salário desejado</button></div>' +
      '<div class="grade" style="margin-top:14px">' +
      (mo.modo === 'salario'
        ? '<label class="campo"><span>Quanto quer tirar por mês</span><span class="com-prefixo"><i>R$</i><input class="entrada num" data-cfg="maoObra.salario" data-n inputmode="decimal" value="' + inNum(mo.salario) + '"></span></label><label class="campo"><span>Horas trabalhadas por mês</span><span class="com-prefixo"><input class="entrada num" data-cfg="maoObra.horasTrabalhadas" data-n inputmode="decimal" value="' + inNum(mo.horasTrabalhadas) + '"><i class="dir">h</i></span></label>'
        : '<label class="campo"><span>Valor da sua hora</span><span class="com-prefixo"><i>R$</i><input class="entrada num" data-cfg="maoObra.valorHora" data-n inputmode="decimal" value="' + inNum(mo.valorHora) + '"></span></label>') +
      '<div class="campo"><span>Resultado</span><p style="font-weight:700;padding-top:10px">' + (C.numOk(C.valorHora(cf)) ? C.brl(C.valorHora(cf)) + ' por hora' : 'preencha os campos') + '</p></div></div></section>';

    // Preços e taxas
    const t = cf.taxas;
    h += '<section class="bloco"><h2>Preços e taxas</h2><div class="grade">' +
      campoPct('Margem padrão das receitas novas', 'margemPadrao', cf.margemPadrao) +
      campoPct('Avisar quando a margem ficar abaixo de', 'margemAlerta', cf.margemAlerta) +
      campoPct('Sinal padrão dos pedidos', 'sinalPadraoPct', cf.sinalPadraoPct) +
      campoPct('Cartão de débito', 'taxas.debito', t.debito) +
      campoPct('Crédito à vista', 'taxas.credito', t.credito) +
      campoPct('Crédito parcelado', 'taxas.parcelado', t.parcelado) +
      campoPct('Aplicativo de entrega', 'taxas.app', t.app) +
      '<label class="campo"><span>Taxa de entrega padrão</span><span class="com-prefixo"><i>R$</i><input class="entrada num" data-cfg="taxas.entrega" data-n inputmode="decimal" value="' + inNum(t.entrega) + '"></span></label>' +
      '</div></section>';

    // Doceria
    const dc = cf.doceria;
    h += '<section class="bloco"><h2>Dados da doceria</h2><p class="explica">Aparecem nos orçamentos e comprovantes para WhatsApp (próxima etapa).</p><div class="grade">' +
      ['nome:Nome', 'instagram:Instagram', 'telefone:Telefone', 'email:E-mail'].map(x => { const [k, r] = x.split(':'); return '<label class="campo"><span>' + r + '</span><input class="entrada" data-cfg="doceria.' + k + '" value="' + esc(dc[k]) + '"></label>'; }).join('') + '</div></section>';

    // Aparência
    h += '<h2 class="titulo-grupo">Só neste aparelho</h2><section class="bloco"><h2>Aparência</h2><div class="campo"><span>Tema</span><div class="seg" role="group" aria-label="Tema">' +
      [['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Escuro']].map(o => '<button type="button" data-acao="tema" data-v="' + o[0] + '" aria-pressed="' + ((S.meta.tema || 'auto') === o[0]) + '">' + o[1] + '</button>').join('') + '</div></div>' +
      '<label class="campo" style="margin-top:14px"><span>Tamanho do texto: ' + Math.round((S.meta.fonte || 1) * 100) + '%</span><input type="range" min="0.85" max="1.3" step="0.05" value="' + (S.meta.fonte || 1) + '" id="fonte"></label></section>';

    // Backup
    h += '<section class="bloco"><h2>Backup</h2><p class="explica">A planilha já guarda tudo. O backup em arquivo é uma segurança extra, e também serve para levar os dados do modo de teste para outro lugar.</p><div class="acoes"><button type="button" class="btn sec" data-acao="exportar">' + I.baixar + 'Exportar backup (.json)</button><label class="btn sec" style="cursor:pointer">' + I.enviar + 'Importar backup<input type="file" accept="application/json,.json" id="importar" hidden></label></div></section>';

    h += '<p class="mudo" style="text-align:center;margin-top:8px">Espaço Nave ' + VERSAO + '</p>';
    return h;
  }
  function campoPct(rot, cam, v) {
    return '<label class="campo"><span>' + rot + '</span><span class="com-prefixo"><input class="entrada num" data-cfg="' + cam + '" data-n inputmode="decimal" value="' + inNum(v) + '"><i class="dir">%</i></span></label>';
  }
  // Cada ajuste entra na fila de envio (e no diário de segurança) no mesmo instante,
  // para não se perder se o app fechar e não ser sobrescrito por uma sincronização.
  function editarConfig(el) {
    const c = clone(cfg());
    gravarCaminho(c, el.dataset.cfg, el.hasAttribute('data-n') ? C.lerNum(el.value) : el.value);
    gravarRegistro('config', c);
  }
  function textoEstadoAjustes() {
    if (S.meta.modo !== 'planilha') return { cls: '', t: 'Modo de teste: estes ajustes ficam só neste aparelho até você conectar a planilha.' };
    const pend = S.fila.some(m => m.tabela === 'config');
    if (pend && S.sync.estado === 'offline') return { cls: '', t: 'Sem internet: as alterações serão enviadas para a planilha quando a conexão voltar.' };
    if (pend) return { cls: '', t: 'Enviando alterações para a planilha…' };
    if (S.sync.estado === 'erro' || S.sync.estado === 'pin') return { cls: 'neg', t: 'Não foi possível falar com a planilha. Veja a sincronização acima.' };
    const em = S.dados.config.geral && S.dados.config.geral.atualizadoEm;
    return { cls: 'pos', t: 'Salvo na planilha' + (em ? ' (última alteração em ' + dataHoraBR(em) + ')' : '') + '. Vale para todos os aparelhos.' };
  }
  function atualizarEstadoAjustes() {
    const el = $('#estado-ajustes'); if (!el) return;
    const e = textoEstadoAjustes();
    el.className = 'aviso ' + e.cls; el.innerHTML = (e.cls === 'pos' ? I.ok : I.nuvem) + '<div class="txt">' + esc(e.t) + '</div>';
  }

  // ================= Backup =================
  function exportar() {
    const blob = new Blob([JSON.stringify({ app: 'espaco-nave', versao: 1, exportadoEm: agoraISO(), dados: S.dados }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'espaco-nave-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast('Backup exportado.');
  }
  async function importar(arq) {
    let j;
    try { j = JSON.parse(await arq.text()); } catch (e) { toast('Arquivo inválido: não é um backup do Espaço Nave.'); return; }
    if (!j || j.app !== 'espaco-nave' || !j.dados) { toast('Arquivo inválido: não é um backup do Espaço Nave.'); return; }
    const tabs = TABELAS_LOCAIS.filter(t => j.dados[t] && typeof j.dados[t] === 'object');
    const nomes = { ingredientes: 'ingredientes', receitas: 'receitas', config: 'configurações', clientes: 'clientes', pedidos: 'pedidos' };
    const partes = tabs.map(t => t === 'config' ? 'as configurações' : Object.values(j.dados[t]).filter(r => r && !r.excluidoEm).length + ' ' + nomes[t]);
    const ok = await confirmar('Substituir os dados?', 'O arquivo traz ' + partes.join(', ') + '. Isso vai substituir ' + tabs.map(t => nomes[t]).join(' e ') + ' que estão no app' + (S.meta.modo === 'planilha' ? ' e na planilha' : '') + '; o que não estiver no arquivo será excluído.', 'Substituir dados', true);
    if (!ok) return;
    tabs.forEach(function (t) {
      const novo = j.dados[t];
      Object.values(novo).forEach(r => { if (r && r.id) gravarRegistro(t, clone(r)); });
      Object.keys(S.dados[t]).forEach(id => { if (!novo[id] && !S.dados[t][id].excluidoEm) excluirRegistro(t, id); });
    });
    toast('Backup importado.'); render(false);
  }

  // ================= Ações (cliques) =================
  const ACOES = {
    'modo-demo': function () { S.meta.modo = 'demo'; garantirConfig(); salvarLocal(); location.hash = '#/inicio'; render(true); toast('Modo de teste: os dados ficam só neste aparelho.'); },
    pilula: function () { if (S.meta.modo === 'planilha') sincronizar(); ir('#/ajustes'); },
    'sync-agora': function () { sincronizar().then(() => render(false)); },
    'novo-ing': function () { folhaIngrediente(null); },
    'editar-ing': function (el) { folhaIngrediente(el.dataset.id); },
    'add-item': folhaEscolherItem,
    'rem-item': function (el) { S.editor.d.itens.splice(+el.dataset.i, 1); marcarSujo(); render(false); },
    'alternar-modo': function (el) { const it = S.editor.d.itens[+el.dataset.i]; it.modo = it.modo === 'preco' ? 'custo' : 'preco'; marcarSujo(); render(false); },
    'add-direto': function () { S.editor.d.custosDiretos = S.editor.d.custosDiretos || []; S.editor.d.custosDiretos.push({ desc: '', valor: null }); marcarSujo(); render(false); },
    'rem-direto': function (el) { S.editor.d.custosDiretos.splice(+el.dataset.i, 1); marcarSujo(); render(false); },
    'add-var': function () {
      const r = S.editor.d; r.variacoes = r.variacoes || [];
      r.variacoes.push({ id: uid(), nome: '', qtd: null, unidade: C.normUn(r.rendimento.unidade) || 'un', embalagem: null, precoPraticado: null });
      marcarSujo(); render(false);
    },
    'rem-var': function (el) { S.editor.d.variacoes.splice(+el.dataset.i, 1); marcarSujo(); render(false); },
    'salvar-rec': salvarReceita,
    'duplicar-rec': function () {
      if (S.editor.sujo && !salvarReceita()) return;
      const c = clone(S.editor.d); c.id = uid(); c.nome = c.nome + ' (cópia)'; delete c.criadoEm; delete c.atualizadoEm;
      (c.variacoes || []).forEach(v => { v.id = uid(); });
      S.editor = { tipo: 'receita', idRota: 'nova', nova: true, d: c, sujo: true };
      ignorarHash = true; location.hash = '#/receita/nova'; render(true);
      toast('Cópia criada. Ajuste e salve.');
    },
    'excluir-rec': async function () {
      const r = S.editor.d;
      const usam = lista('receitas').filter(x => x.id !== r.id && (x.itens || []).some(it => it.tipo === 'rec' && it.refId === r.id));
      if (usam.length) { toast('Esta receita é usada em: ' + usam.map(x => x.nome).join(', ') + '. Tire-a de lá antes de excluir.'); return; }
      const emPedidos = lista('pedidos').filter(p => ['orcamento', 'confirmado', 'producao', 'pronto'].includes(p.status) && (p.itens || []).some(it => it.tipo === 'rec' && it.receitaId === r.id));
      if (emPedidos.length) { toast('Esta receita está em ' + emPedidos.length + (emPedidos.length === 1 ? ' pedido em aberto' : ' pedidos em aberto') + '. Conclua ou tire dos pedidos antes de excluir.'); return; }
      if (await confirmar('Excluir receita?', 'Excluir <b>' + esc(r.nome) + '</b>. As outras receitas não são afetadas.', 'Excluir receita', true)) {
        excluirRegistro('receitas', r.id); S.editor = null; toast('Receita excluída.'); ir('#/receitas');
      }
    },
    'add-fixo': function () { const c = cfg(); c.custosFixos.push({ nome: 'Novo custo', valor: null }); gravarRegistro('config', c); render(false); },
    'rem-fixo': function (el) { const c = cfg(); c.custosFixos.splice(+el.dataset.i, 1); gravarRegistro('config', c); render(false); },
    'modo-mo': function (el) { const c = cfg(); c.maoObra.modo = el.dataset.v; gravarRegistro('config', c); render(false); },
    tema: function (el) { S.meta.tema = el.dataset.v; aplicarTema(); salvarLocal(); render(false); },
    exportar: exportar,
    'trocar-pin': function () {
      abrirFolha('Trocar PIN da doceria', '<p class="mudo">O PIN novo vale para todos os aparelhos. Nos outros, será preciso digitá-lo de novo em Ajustes.</p><form id="f-pin" style="display:flex;flex-direction:column;gap:12px"><label class="campo"><span>PIN novo</span><input class="entrada" name="p1" type="password" minlength="6" required autocomplete="new-password"></label><label class="campo"><span>Repita o PIN novo</span><input class="entrada" name="p2" type="password" minlength="6" required autocomplete="new-password"></label><p class="mudo" id="msg-pin" role="status"></p><div class="rodape-folha"><button type="button" class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit">Trocar PIN</button></div></form>', function (d) {
        $('#f-pin', d).addEventListener('submit', async function (e) {
          e.preventDefault(); const f = e.target;
          if (f.p1.value !== f.p2.value) { $('#msg-pin', d).textContent = 'Os dois campos estão diferentes.'; return; }
          try {
            const r = await chamar({ acao: 'trocarPin', pin: S.meta.pin, novoPin: f.p1.value });
            if (!r.ok) { $('#msg-pin', d).textContent = r.erro === 'pin_curto' ? 'Use pelo menos 6 caracteres.' : (ERROS[r.erro] || 'Não foi possível trocar.'); return; }
            S.meta.pin = f.p1.value; salvarLocal(); d.close(); toast('PIN trocado.');
          } catch (err) { $('#msg-pin', d).textContent = 'Sem conexão com a planilha. Tente com internet.'; }
        });
      });
    },
    'editar-conexao': function () {
      abrirFolha('Conexão deste aparelho', '<form id="form-conectar" style="display:flex;flex-direction:column;gap:12px"><label class="campo"><span>Endereço do app da planilha</span><input class="entrada" name="url" value="' + esc(S.meta.url) + '" required></label><label class="campo"><span>PIN da doceria</span><input class="entrada" name="pin" type="password" required minlength="6"></label><p class="mudo" id="msg-conectar" role="status"></p><div class="rodape-folha"><button type="button" class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit">Conectar</button></div></form>');
    },
    esquecer: async function () {
      const pend = S.fila.length;
      const txt = 'O app volta para a tela inicial e apaga a cópia local. Os dados continuam na planilha.' + (pend ? ' <b>Atenção: ' + pend + ' alterações ainda não foram enviadas e serão perdidas.</b>' : '');
      if (!await confirmar('Esquecer este aparelho?', txt, 'Esquecer aparelho', true)) return;
      S.dados = dadosVazios(); S.fila = []; lsGravar('diario', []);
      S.meta = { modo: null, url: '', pin: '', ultimaSync: '', conflitos: [], tema: S.meta.tema, fonte: S.meta.fonte };
      salvarLocal(); await gravarJa(); location.hash = '#/inicio'; render(true);
    },
    'apagar-teste': async function () {
      if (!await confirmar('Apagar dados deste aparelho?', 'Apaga tudo o que foi cadastrado no modo de teste. Não dá para desfazer.', 'Apagar dados', true)) return;
      S.dados = dadosVazios(); S.fila = []; lsGravar('diario', []);
      S.meta.modo = null; salvarLocal(); await gravarJa(); location.hash = '#/inicio'; render(true);
    },
    'ver-conflito': function (el) {
      const c = S.meta.conflitos.find(x => x.id === el.dataset.id); if (!c) return;
      abrirFolha('Versão que ficou de fora', '<p class="mudo">Alterada em ' + dataHoraBR(c.perdida && c.perdida.atualizadoEm) + '. A versão que ficou valendo é de ' + dataHoraBR(c.vencedora && c.vencedora.atualizadoEm) + '.</p>' + resumoDiferencas(c.perdida, c.vencedora));
    },
    'restaurar-conflito': async function (el) {
      const c = S.meta.conflitos.find(x => x.id === el.dataset.id); if (!c) return;
      if (!await confirmar('Restaurar esta versão?', 'A versão que ficou de fora volta a valer em todos os aparelhos.', 'Restaurar')) return;
      const r = clone(c.perdida); delete r.excluidoEm;
      gravarRegistro(c.tabela, r);
      S.meta.conflitos = S.meta.conflitos.filter(x => x.id !== c.id); salvarLocal(); toast('Versão restaurada.'); render(false);
    },
    'dispensar-conflito': function (el) { S.meta.conflitos = S.meta.conflitos.filter(x => x.id !== el.dataset.id); salvarLocal(); render(false); }
  };
  Object.assign(ACOES, ACOES_PED);
  function resumoDiferencas(a, b) {
    a = a || {}; b = b || {};
    const ks = Array.from(new Set(Object.keys(a).concat(Object.keys(b)))).filter(k => !/Em$|^id$|^historico$/.test(k));
    const dif = ks.filter(k => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
    if (!dif.length) return '<p>As duas versões têm o mesmo conteúdo.</p>';
    const f = v => typeof v === 'object' ? JSON.stringify(v, null, 1) : String(v === null || v === undefined ? '—' : v);
    return dif.map(k => '<div><h3>' + esc(k) + '</h3><p class="mudo">Ficou de fora:</p><pre class="versao">' + esc(f(a[k])) + '</pre><p class="mudo">Valendo:</p><pre class="versao">' + esc(f(b[k])) + '</pre></div>').join('');
  }

  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-acao]');
    if (!el) return;
    const fn = ACOES[el.dataset.acao];
    if (fn) { e.preventDefault(); fn(el, e); }
  });
  document.addEventListener('submit', async function (e) {
    if (e.target.id !== 'form-conectar') return;
    e.preventDefault();
    const f = e.target, msg = $('#msg-conectar', f.closest('dialog') || document);
    const btn = f.querySelector('[type=submit]'); btn.disabled = true;
    const ok = await conectar(f.url.value, f.pin.value, msg);
    btn.disabled = false;
    if (ok) { const d = f.closest('dialog'); if (d) d.close(); location.hash = '#/inicio'; render(true); toast('Conectado à planilha.'); }
  });
  document.addEventListener('input', function (e) {
    if (e.target.dataset && e.target.dataset.cfg) editarConfig(e.target);
    if (e.target.id === 'fonte') { S.meta.fonte = Number(e.target.value); aplicarTema(); salvarLocal(); e.target.previousElementSibling.textContent = 'Tamanho do texto: ' + Math.round(S.meta.fonte * 100) + '%'; }
  });
  document.addEventListener('change', function (e) {
    if (e.target.dataset && e.target.dataset.cfg) { editarConfig(e.target); setTimeout(() => { if (!document.activeElement || !document.activeElement.dataset.cfg) render(false); }, 700); }
    if (e.target.id === 'importar' && e.target.files[0]) importar(e.target.files[0]);
  });

  // ================= Início do app =================
  async function iniciar() {
    await Local.abrir();
    const [d, f, m] = await Promise.all([Local.ler('dados'), Local.ler('fila'), Local.ler('meta')]);
    if (d) { S.dados = Object.assign(dadosVazios(), d); }
    if (Array.isArray(f)) S.fila = f;
    if (m) S.meta = Object.assign(S.meta, m);
    const mRapida = lsLer('meta');
    if (mRapida && (mRapida.salvoEm || 0) > (S.meta.salvoEm || 0)) S.meta = Object.assign(S.meta, mRapida);
    if (reaplicarDiario()) gravarJa();
    if (!Array.isArray(S.meta.conflitos)) S.meta.conflitos = [];
    S.sync.estado = S.meta.modo === 'planilha' ? 'ok' : 'demo';
    aplicarTema();
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', aplicarTema);
    render(true);
    if (S.meta.modo === 'planilha') sincronizar();
    window.addEventListener('online', () => sincronizar());
    window.addEventListener('offline', () => { if (S.meta.modo === 'planilha') { S.sync.estado = 'offline'; atualizarPilula(); } });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') sincronizar(); });
    setInterval(() => { if (document.visibilityState === 'visible') sincronizar(); }, 60000);
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }
  // Exposto para testes automatizados
  window.__EN = { S: S, C: C, gravarRegistro: gravarRegistro, sincronizar: sincronizar, render: render };
  iniciar();
})();
