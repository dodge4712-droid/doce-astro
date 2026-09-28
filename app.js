/* Espaço Nave — Doce Astro | Etapa 1: base, ingredientes, receitas e ajustes */
(function () {
  'use strict';
  const C = window.Calc;
  const VERSAO = '5.5.0';
  const TABELAS_LOCAIS = ['ingredientes', 'receitas', 'config', 'clientes', 'pedidos', 'lancamentos', 'estoque', 'contasPagar', 'recorrencias'];
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
    loja: p('M4 10v10h16V10M3 4h18l-1.5 6a3 3 0 0 1-5.5.8 3 3 0 0 1-5 0A3 3 0 0 1 4.5 10zM9.5 20v-5h5v5'),
    caixa: p('M3 7a2 2 0 0 1 2-2h13v4M3 7v11a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2zM16 14h.01'),
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
  // As anotações do diário e do meta vão para o localStorage uma vez só, ao fim da
  // operação em andamento (microtarefa): numa alteração isolada, isso acontece antes de
  // qualquer outro evento; numa operação em lote (importar, restaurar backup), evita
  // regravar o diário inteiro a cada registro.
  let diarioPendente = [], metaSuja = false, descargaAgendada = false;
  const LIMITE_DIARIO = 400; // acima disso, grava direto no banco do aparelho (mais rápido que o diário)
  function descarregar() {
    descargaAgendada = false;
    if (diarioPendente.length) {
      if (diarioPendente.length <= LIMITE_DIARIO) { const d = lsLer('diario') || []; lsGravar('diario', d.concat(diarioPendente)); }
      else { clearTimeout(timerSalvar); timerSalvar = setTimeout(gravarJa, 0); }
      diarioPendente = [];
    }
    if (metaSuja) { metaSuja = false; lsGravar('meta', S.meta); }
  }
  function agendarDescarga() { if (!descargaAgendada) { descargaAgendada = true; queueMicrotask(descarregar); } }
  function anotarDiario(entrada) { diarioPendente.push(entrada); agendarDescarga(); }
  function gravarJa() {
    clearTimeout(timerSalvar); timerSalvar = null;
    if (diarioPendente.length) diarioPendente = []; // o banco do aparelho vai receber tudo agora
    const n = (lsLer('diario') || []).length;
    return Promise.all([Local.gravar('dados', S.dados), Local.gravar('fila', S.fila), Local.gravar('meta', S.meta)]).then(function () {
      const d = lsLer('diario') || []; lsGravar('diario', d.slice(n));
    });
  }
  function salvarLocal() {
    S.meta.salvoEm = Date.now();
    metaSuja = true; agendarDescarga();
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
  function cfg() { return C.mesclarConfig(configEfetiva()); }
  function ctxCalc(extra) {
    const receitas = Object.assign({}, S.dados.receitas);
    if (extra) receitas[extra.id] = extra;
    return { ingredientes: S.dados.ingredientes, receitas: receitas, config: configEfetiva() };
  }

  let filaIdx = null, filaArr = null;
  function naFila(tabela, id) {
    if (filaArr !== S.fila) { filaIdx = new Map(); S.fila.forEach(m => filaIdx.set(m.tabela + '\u0001' + m.rec.id, m)); filaArr = S.fila; }
    return filaIdx.get(tabela + '\u0001' + id);
  }
  function gravarRegistro(tabela, rec) {
    if (tabela === 'config') delete rec.mediaContasFixas; // valor calculado, não é guardado
    S.versao = (S.versao || 0) + 1;
    const ant = S.dados[tabela][rec.id];
    const agora = agoraISO();
    rec.atualizadoEm = agora;
    if (!rec.criadoEm) rec.criadoEm = ant && ant.criadoEm || agora;
    S.dados[tabela][rec.id] = rec;
    const pend = naFila(tabela, rec.id);
    const base = pend ? pend.base : (ant ? ant.atualizadoEm : null);
    if (pend) pend.rec = clone(rec);
    else { const m = { tabela: tabela, base: base, rec: clone(rec) }; S.fila.push(m); filaIdx.set(tabela + '\u0001' + rec.id, m); }
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
        const semData = r => { const x = Object.assign({}, r || {}); delete x.atualizadoEm; delete x.criadoEm; return JSON.stringify(x, Object.keys(x).sort()); };
        resp.conflitos = (resp.conflitos || []).filter(function (c) {
          if (c.vencedora) { S.dados[c.tabela][c.id] = c.vencedora; mudouAlgo = true; }
          return !(c.perdida && c.vencedora && semData(c.perdida) === semData(c.vencedora)); // mesma coisa criada nos dois aparelhos: não é conflito
        });
        resp.conflitos.forEach(function (c) {
          if (c.perdida) S.meta.conflitos.push({ id: uid(), tabela: c.tabela, regId: c.id, em: agoraISO(), perdida: c.perdida, vencedora: c.vencedora });
        });
        S.meta.ultimaSync = resp.agora;
        S.sync.estado = 'ok'; S.sync.msg = ''; S.syncOkNestaSessao = true;
        if (mudouAlgo) S.versao = (S.versao || 0) + 1;
        gerarContasRecorrentes();
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
    while (box.children.length >= 3) box.firstElementChild.remove(); // no máximo 3 avisos na tela
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
    { h: '#/pedidos', t: 'Loja', i: I.loja },
    { h: '#/caixa', t: 'Caixa', i: I.caixa },
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
    if (/^#\/lancamento\/[^?]*\?(.*&)?(compra=1|de=compras)/.test(h)) return '#/pedidos'; // compra aberta pela Loja
    const r = h.split('?')[0].replace(/^(#\/[^#]*)#.*$/, '$1');
    if (r.startsWith('#/receita') || r === '#/ingredientes') return '#/receitas';
    if (r.startsWith('#/pedido') || ['#/agenda', '#/producao', '#/compras', '#/importar-compras', '#/estoque', '#/contagem'].includes(r)) return '#/pedidos';
    if (r.startsWith('#/cliente')) return '#/clientes';
    if (r === '#/caixa' || r.startsWith('#/lancamento') || ['#/contas', '#/receber', '#/reserva', '#/prolabore', '#/relatorios'].includes(r)) return '#/caixa';
    return NAV.some(n => n.h === r) ? r : '#/inicio';
  }

  function casca(conteudo) {
    const ativa = secaoAtiva(location.hash || '#/inicio');
    const links = NAV.map(n => '<a href="' + n.h + '"' + (n.h === ativa ? ' aria-current="page"' : '') + '>' + n.i + '<span>' + n.t + '</span></a>').join('');
    return '<div class="app">' +
      '<aside class="lateral"><a class="marca-lat" href="#/inicio"><span class="logo-selo" role="img" aria-label="Doce Astro, doces artesanais"></span></a>' +
      '<nav aria-label="Seções">' + links + '</nav>' +
      '<div class="rodape-lat">Espaço Nave ' + VERSAO + '</div></aside>' +
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
    const [caminhoAncora, busca] = h.replace(/^#\//, '').split('?');
    const [caminho, ancora] = caminhoAncora.split('#');
    const partes = caminho.split('/');
    const q = new URLSearchParams(busca || '');
    gerarContasRecorrentes();
    const tipoEditor = { receita: 'receita', pedido: 'pedido', lancamento: 'lancamento', contagem: 'contagem' }[partes[0]];
    if (!S.editor || S.editor.tipo !== tipoEditor) S.editor = null;
    switch (partes[0]) {
      case 'receitas': html = telaReceitas(); break;
      case 'receita': html = telaEditorReceita(decodeURIComponent(partes[1] || 'nova')); break;
      case 'ingredientes': html = telaIngredientes(); break;
      case 'pedidos': html = telaPedidos(q); break;
      case 'pedido': html = telaEditorPedido(decodeURIComponent(partes[1] || 'novo'), q); break;
      case 'agenda': html = telaAgenda(); break;
      case 'producao': html = telaProducao(); break;
      case 'importar-compras': html = telaImportarCompras(); break;
      case 'compras':
        if (q.get('v') === 'feitas') { html = telaComprasFeitas(); break; }
        if (q.get('de') && q.get('ate')) S.compras = Object.assign(S.compras || { orc: false }, { de: q.get('de'), ate: q.get('ate') });
        html = telaCompras(); break;
      case 'caixa': html = telaCaixa(); break;
      case 'contas': html = telaContas(); break;
      case 'receber': html = telaReceber(); break;
      case 'reserva': case 'prolabore': html = telaProLabore(); break;
      case 'relatorios': html = telaRelatorios(); break;
      case 'estoque': html = telaEstoque(q); break;
      case 'contagem': html = telaContagem(); break;
      case 'lancamento': html = telaEditorLancamento(decodeURIComponent(partes[1] || 'novo'), q); break;
      case 'clientes': html = telaClientes(); break;
      case 'cliente': html = telaCliente(decodeURIComponent(partes[1] || '')); break;
      case 'ajustes': html = telaAjustes(); break;
      default: html = telaInicio();
    }
    raiz.innerHTML = casca(html);
    atualizarPilula();
    hashAnterior = h; S.rota = h;
    if (mudou) window.scrollTo(0, 0); else window.scrollTo(0, y);
    if (ancora && mudou) { const alvo = document.getElementById(ancora); if (alvo) setTimeout(() => alvo.scrollIntoView({ block: 'start' }), 0); }
    const abaAtual = $('.abas a[aria-current="page"]');
    if (abaAtual && abaAtual.parentElement.scrollWidth > abaAtual.parentElement.clientWidth) abaAtual.scrollIntoView({ inline: 'nearest', block: 'nearest' });
    if (partes[0] === 'receita') montarEditor();
    if (partes[0] === 'ingredientes') montarFiltroIngredientes();
    if (partes[0] === 'receitas') montarFiltroReceitas();
    if (partes[0] === 'pedido') montarEditorPedido();
    if (partes[0] === 'pedidos') montarFiltroPedidos();
    if (partes[0] === 'clientes') montarFiltroClientes();
    if (partes[0] === 'lancamento') montarEditorLancamento();
    if (partes[0] === 'estoque') montarFiltroEstoque();
    if (partes[0] === 'contagem') montarContagem();
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
    h += blocoContasInicio();
    h += blocoEstoqueInicio();

    if (!nRec) {
      h += '<div class="bloco vazio">' + I.emblema + '<h2>Cadastre sua primeira receita</h2><p>Com a receita cadastrada, o app calcula o custo de cada doce, sugere o preço e avisa quando algum produto dá prejuízo.</p><a class="btn" href="#/receita/nova">' + I.mais + 'Nova receita</a></div>';
    }

    h += '<div class="stats"><a class="stat" href="#/receitas" style="text-decoration:none"><div class="n">' + nRec + '</div><div class="r">receitas cadastradas</div></a>' +
      (function () { const d = calcProLabore().disponivel; return '<a class="stat" href="#/prolabore" style="text-decoration:none"><div class="n' + (d < 0 ? ' neg-txt' : '') + '">' + (d < 0 ? '−' : '') + C.brl(Math.abs(d)) + '</div><div class="r">de pró-labore disponível</div></a>'; })() +
      (function () {
        const pm = C.periodoPreset('mes', C.dataISO()), rm = C.resumoCaixa(C.filtrarMovimentos(movsTodos(), pm));
        return '<a class="stat" href="#/caixa" style="text-decoration:none"><div class="n ' + (rm.saldo < 0 ? 'neg-txt' : '') + '">' + (rm.saldo < 0 ? '−' : '') + C.brl(Math.abs(rm.saldo)) + '</div><div class="r">de saldo no caixa este mês</div></a>' +
          (C.numOk(cfg().metaFaturamento) && cfg().metaFaturamento > 0 ? '<a class="stat" href="#/relatorios" style="text-decoration:none"><div class="n">' + C.pct(Math.max(0, rm.entradas) / cfg().metaFaturamento, 0) + '</div><div class="r">da meta de ' + C.brl(cfg().metaFaturamento) + ' recebidos</div></a>' : '');
      })() + '</div>';

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
      (hist.length > 1 ? '<div><h3>Histórico de preço</h3>' + sparkline(ing.historico) + '<ul class="historico">' + hist.map(x => '<li><span>' + dataBR(x.data) + (x.compra ? ' <span class="chip mudo">compra</span>' : '') + '</span><span>' + C.num(x.qtdEmbalagem) + ' ' + rotUn(x.unidade) + ' por ' + C.brl(x.valorPago) + '</span></li>').join('') + '</ul></div>' : '') +
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
      (function () {
        const lst = cats.slice().sort((x, y) => x.localeCompare(y, 'pt-BR'));
        const nova = !!e.catNova || (r.categoria && lst.indexOf(r.categoria) < 0);
        return '<div class="campo"><label for="sel-cat"><span>Categoria</span></label><select class="entrada" id="sel-cat" data-cat-sel>' +
          '<option value=""' + (!r.categoria && !nova ? ' selected' : '') + '>Sem categoria</option>' +
          lst.map(c => '<option' + (c === r.categoria && !nova ? ' selected' : '') + '>' + esc(c) + '</option>').join('') +
          '<option value="__nova__"' + (nova ? ' selected' : '') + '>+ Criar nova categoria…</option></select>' +
          '<input class="entrada" data-c="categoria" id="nova-cat" aria-label="Nome da nova categoria" placeholder="Nome da nova categoria" value="' + (nova ? esc(r.categoria) : '') + '"' + (nova ? '' : ' hidden') + ' style="margin-top:8px"></div>';
      })() + '</div>' +
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
    if (el.hasAttribute('data-cat-sel')) {
      if (ev.type !== 'change') return;
      const campo = $('#nova-cat');
      if (el.value === '__nova__') { S.editor.catNova = true; d.categoria = ''; campo.value = ''; campo.hidden = false; campo.focus(); }
      else { S.editor.catNova = false; d.categoria = el.value; campo.hidden = true; campo.value = ''; }
      marcarSujo(); return;
    }
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
    // categoria escrita com outra grafia vira a que já existe ("brigadeiros" → "Brigadeiros")
    const catExist = lista('receitas').map(x => x.categoria).filter(Boolean).find(c => C.semAcento(c) === C.semAcento(r.categoria));
    r.categoria = catExist || String(r.categoria || '').trim();
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
  const ABAS_PED = [['#/pedidos', 'Pedidos'], ['#/agenda', 'Agenda'], ['#/producao', 'Produção'], ['#/compras', 'Compras'], ['#/estoque', 'Estoque']];
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
    h += '<div class="seg rolavel" role="group" aria-label="Filtrar pedidos" style="margin-bottom:12px">' + FILTROS_PED.map(x => '<a href="#/pedidos?f=' + x[0] + '"' + (x === f ? ' aria-current="true"' : '') + '>' + x[1] + '</a>').join('') + '</div>';
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
    // parte do pró-labore em cada item: acompanha a receita até a entrega; depois fica congelada
    const ctxPl = ctxCalc();
    p.itens.forEach(function (it) {
      if (it.tipo !== 'rec') return;
      if (p.status !== 'entregue' || !C.numOk(it.maoObraUnit)) it.maoObraUnit = C.maoObraItemPedido(Object.assign({}, it, { maoObraUnit: null }), ctxPl);
    });
    // Resumo em colunas simples: aparece legível na planilha e servirá aos relatórios.
    p.total = c.total; p.pago = c.pago; p.restante = c.restante; p.lucroEstimado = c.lucro; p.situacaoPagamento = c.situacao;
    const orig = S.dados.pedidos[p.id];
    aplicarBaixaEstoquePedido(orig, p);
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
      '<div class="cal" role="group" aria-label="Dias de ' + MESES[m - 1] + '"><div class="cal-sem" aria-hidden="true">' + ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(x => '<span>' + x + '</span>').join('') + '</div><div class="cal-dias">' +
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

  // ---------- Produção (um ou vários dias) ----------
  const PRESETS_PROD = [['hoje', 'Hoje', 0, 0], ['amanha', 'Amanhã', 1, 1], ['3dias', 'Próximos 3 dias', 0, 2], ['7dias', 'Próximos 7 dias', 0, 6]];
  function faixaProd() { if (!S.prod) S.prod = { preset: 'hoje', de: hoje(), ate: hoje() }; return S.prod; }
  function rotuloFaixa(de, ate) { return de === ate ? dataCurta(de) : dataCurta(de) + ' até ' + dataCurta(ate); }
  function textoProducao(de, ate, linhas) {
    return 'Produção ' + (de === ate ? 'de ' + dataDia(de) : 'de ' + dataDia(de) + ' a ' + dataDia(ate)) + '\n\n' +
      linhas.map(l => (l.feito ? '[x] ' : '[ ] ') + l.nome + ': ' + l.qtd + (l.lotes ? ' (' + l.lotes + ')' : '') + (l.porDia ? '\n    ' + l.porDia.join('; ') : '')).join('\n');
  }
  function telaProducao() {
    const P = faixaProd(), umDia = P.de === P.ate;
    let h = cab('Produção', 'O que fazer para os pedidos do período, já somando receitas usadas dentro de outras.') + abas(ABAS_PED, '#/producao');
    h += '<section class="bloco"><div class="seg" role="group" aria-label="Período da produção">' + PRESETS_PROD.map(p => '<button type="button" data-acao="prod-preset" data-v="' + p[0] + '" aria-pressed="' + (P.preset === p[0]) + '">' + p[1] + '</button>').join('') + '</div>' +
      '<div class="linha-campos" style="margin-top:12px"><label class="campo"><span>De</span><input class="entrada" type="date" data-prodfaixa="de" value="' + P.de + '"></label><label class="campo"><span>Até</span><input class="entrada" type="date" data-prodfaixa="ate" value="' + P.ate + '"></label></div></section>';
    if (P.ate < P.de) return h + '<div class="aviso neg">' + I.alerta + '<div class="txt">A data final vem antes da inicial.</div></div>';
    const naFaixa = lista('pedidos').filter(p => p.dataEntrega && p.dataEntrega >= P.de && p.dataEntrega <= P.ate && p.status !== 'cancelado');
    const peds = naFaixa.filter(p => ['confirmado', 'producao'].includes(p.status)).sort(ordemData);
    const orc = naFaixa.filter(p => p.status === 'orcamento').length;
    const prontos = naFaixa.filter(p => ['pronto', 'entregue'].includes(p.status)).length;
    const feito = S.meta.producaoFeita || {};
    const chaveFeito = umDia ? P.de : P.de + '..' + P.ate;
    if (!peds.length) {
      return h + '<div class="bloco vazio">' + I.emblema + '<h2>Nada para produzir</h2><p class="faixa-prod">' + esc((t => t.charAt(0).toUpperCase() + t.slice(1))(rotuloFaixa(P.de, P.ate))) + '</p><p>' +
        (prontos ? prontos + (prontos === 1 ? ' pedido do período já está pronto ou entregue. ' : ' pedidos do período já estão prontos ou entregues. ') : '') +
        (orc ? orc + (orc === 1 ? ' orçamento ainda não foi confirmado.' : ' orçamentos ainda não foram confirmados.') : 'A lista usa pedidos confirmados ou em produção.') + '</p><a class="btn sec" href="#/agenda">Ver agenda</a></div>';
    }
    const ctx = ctxCalc();
    const nx = C.necessidades(peds, ctx);
    const pd = umDia ? null : C.producaoPorDia(peds, ctx);
    const linhas = Object.values(nx.producao).map(function (x) {
      const r = S.dados.receitas[x.receitaId] || {};
      const lotes = x.rendBase ? x.qtdBase / x.rendBase : null;
      const ub = x.unidadeBase || 'un';
      return { id: x.receitaId, nome: r.nome || 'Receita', direto: x.direto > 0, qtd: C.qtdLegivel(x.qtdBase, ub),
        lotes: C.numOk(lotes) ? C.num(lotes, 2) + (lotes === 1 ? ' receita' : ' receitas') : '', feito: !!feito[chaveFeito + ':' + x.receitaId],
        porDia: pd && pd[x.receitaId] ? pd[x.receitaId].map(d => dataCurta(d.dia) + ': ' + C.qtdLegivel(d.qtdBase, ub)) : null };
    }).sort((a, b) => (a.direto === b.direto ? a.nome.localeCompare(b.nome, 'pt-BR') : a.direto ? 1 : -1));
    S.textoCopia = textoProducao(P.de, P.ate, linhas);
    const nConf = peds.filter(p => p.status === 'confirmado').length;
    const faixaTxt = rotuloFaixa(P.de, P.ate);
    h += '<section class="bloco"><h2>O que fazer</h2><p class="faixa-prod">' + esc(faixaTxt.charAt(0).toUpperCase() + faixaTxt.slice(1)) + '</p><p class="explica">As receitas de base (recheios, massas) aparecem primeiro, porque entram nas outras.' + (umDia ? '' : ' Embaixo de cada uma, quanto é para cada dia.') + '</p><div class="lista-check">' +
      linhas.map(l => '<label class="linha-check' + (l.feito ? ' feito' : '') + '"><input type="checkbox" data-prod="' + esc(chaveFeito + ':' + l.id) + '"' + (l.feito ? ' checked' : '') + '><span class="principal"><b>' + esc(l.nome) + '</b><small>' + (l.direto ? '' : 'base para outras receitas') + '</small>' +
        (l.porDia ? '<small class="por-dia">' + l.porDia.map(esc).join('<br>') + '</small>' : '') + '</span><span class="valor">' + esc(l.qtd) + '<small>' + esc(l.lotes) + '</small></span></label>').join('') + '</div>' +
      (nx.avisos.length ? '<div class="aviso" style="margin-top:12px">' + I.alerta + '<div class="txt"><ul>' + nx.avisos.map(a => '<li>' + esc(a) + '</li>').join('') + '</ul></div></div>' : '') +
      '<div class="acoes" style="margin-top:14px">' + (nConf ? '<button type="button" class="btn" data-acao="prod-iniciar">' + (nConf === 1 ? 'Colocar o pedido confirmado em produção' : 'Colocar os ' + nConf + ' pedidos confirmados em produção') + '</button>' : '') +
      '<button type="button" class="btn sec" data-acao="copiar-lista">' + I.copiar + 'Copiar lista</button><a class="btn sec" href="#/compras?de=' + P.de + '&ate=' + P.ate + '">Ver ingredientes</a></div>' +
      (nConf && modoEstoque() === 'completo' ? '<p class="mudo" style="margin-top:8px">Ao entrar em produção, os ingredientes saem do estoque.</p>' : '') + '</section>';
    h += '<section class="bloco"><h2>Pedidos do período</h2>' + (orc ? '<p class="explica">' + orc + (orc === 1 ? ' orçamento do período não entra na conta' : ' orçamentos do período não entram na conta') + ' até ser confirmado.</p>' : '') + '<div class="lista">' + (umDia ? peds.map(cardPedido).join('') : listaAgrupada(peds)) + '</div></section>';
    return h;
  }

  // ---------- Compras ----------
  function telaCompras() {
    const F = S.compras || (S.compras = { de: hoje(), ate: C.somarDias(hoje(), 6), orc: false });
    const sts = F.orc ? ['orcamento', 'confirmado', 'producao'] : ['confirmado', 'producao'];
    const peds = lista('pedidos').filter(p => sts.includes(p.status) && p.dataEntrega && p.dataEntrega >= F.de && p.dataEntrega <= F.ate);
    const nx = C.necessidades(peds, ctxCalc());
    const comEstoque = modoEstoque() !== 'desligado';
    let h = cab('Lista de compras', 'Ingredientes para os pedidos do período, com receitas dentro de receitas já desmontadas e a perda de cada uma.') + abas(ABAS_PED, '#/compras') + segCompras('lista');
    h += '<section class="bloco"><div class="linha-campos"><label class="campo"><span>De</span><input class="entrada" type="date" data-compras="de" value="' + F.de + '"></label><label class="campo"><span>Até</span><input class="entrada" type="date" data-compras="ate" value="' + F.ate + '"></label></div>' +
      '<div class="acoes" style="margin-top:10px"><button type="button" class="btn sec fino" data-acao="compras-periodo" data-v="7">Próximos 7 dias</button><button type="button" class="btn sec fino" data-acao="compras-periodo" data-v="1">Só amanhã</button></div>' +
      '<label class="chave" style="margin-top:6px"><span class="rot">Incluir orçamentos<small>Para já ter noção, antes de o cliente confirmar</small></span><input type="checkbox" data-compras="orc"' + (F.orc ? ' checked' : '') + '></label></section>';
    if (F.ate < F.de) return h + '<div class="aviso neg">' + I.alerta + '<div class="txt">A data final vem antes da inicial.</div></div>';
    const base = comEstoque ? C.comprasComEstoque(nx.compras, saldos(), S.dados.ingredientes) : Object.values(nx.compras).map(c => Object.assign({}, c, { tem: 0, falta: c.qtdBase, embalagensFalta: c.embalagens, custoFalta: c.custoEmbalagens }));
    const linhas = base.map(c => ({ c: c, ing: S.dados.ingredientes[c.ingredienteId] })).filter(x => x.ing)
      .sort((a, b) => ((b.c.embalagensFalta > 0) - (a.c.embalagensFalta > 0)) || a.ing.nome.localeCompare(b.ing.nome, 'pt-BR'));
    if (!peds.length || !linhas.length) {
      return h + '<div class="bloco vazio">' + I.emblema + '<h2>Nada a comprar no período</h2><p>' + (peds.length ? 'Os pedidos do período não têm receitas com ingredientes calculáveis.' : 'Não há pedidos ' + (F.orc ? '' : 'confirmados ') + 'entre ' + dataDia(F.de) + ' e ' + dataDia(F.ate) + '.') + '</p></div>' +
        (nx.avisos.length ? '<div class="aviso">' + I.alerta + '<div class="txt"><ul>' + nx.avisos.map(a => '<li>' + esc(a) + '</li>').join('') + '</ul></div></div>' : '');
    }
    const comprar = linhas.filter(x => x.c.embalagensFalta > 0);
    const total = comprar.reduce((s, x) => s + (x.c.custoFalta || 0), 0);
    const embTxt = x => x.c.embalagensFalta + ' × ' + C.num(x.ing.qtdEmbalagem) + ' ' + rotUn(x.ing.unidade);
    S.textoCopia = 'Lista de compras (' + dataDia(F.de) + (F.ate !== F.de ? ' a ' + dataDia(F.ate) : '') + ')\n\n' +
      (comprar.length ? comprar.map(x => '- ' + x.ing.nome + ': ' + embTxt(x)).join('\n') : 'Nada a comprar: o estoque cobre tudo.') + '\n\nEstimativa: ' + C.brl(total);
    h += '<section class="bloco"><h2>' + (comprar.length ? comprar.length + (comprar.length === 1 ? ' ingrediente a comprar' : ' ingredientes a comprar') : 'O estoque cobre tudo') + ' para ' + peds.length + (peds.length === 1 ? ' pedido' : ' pedidos') + '</h2>' +
      '<p class="explica">"Usa" é o que as receitas consomem.' + (comEstoque ? ' "Tem" vem do Estoque; "Comprar" é só o que falta, arredondado para embalagens inteiras.' : ' "Comprar" arredonda para embalagens inteiras. Ligue o Estoque em Ajustes para descontar o que você já tem.') + '</p>' +
      '<div class="tabela-compras' + (comEstoque ? ' com-estoque' : '') + '" role="table"><div class="tc-cab" role="row"><span role="columnheader">Ingrediente</span><span role="columnheader">Usa</span>' + (comEstoque ? '<span role="columnheader">Tem</span>' : '') + '<span role="columnheader">Comprar</span><span role="columnheader">Custo</span></div>' +
      linhas.map(x => '<div class="tc-lin' + (x.c.embalagensFalta > 0 ? '' : ' tc-ok') + '" role="row"><span role="cell"><b>' + esc(x.ing.nome) + '</b></span><span role="cell" data-r="Usa">' + C.qtdLegivel(x.c.qtdBase, x.c.base) + '</span>' +
        (comEstoque ? '<span role="cell" data-r="Tem">' + C.qtdLegivel(x.c.tem, x.c.base) + '</span>' : '') +
        '<span role="cell" data-r="Comprar">' + (x.c.embalagensFalta > 0 ? embTxt(x) : (comEstoque ? 'já tem' : '—')) + '</span><span role="cell" data-r="Custo">' + (x.c.embalagensFalta > 0 ? C.brl(x.c.custoFalta) : '—') + '</span></div>').join('') +
      '<div class="tc-lin tc-total" role="row"><span role="cell"><b>Total estimado</b></span><span role="cell"></span>' + (comEstoque ? '<span role="cell"></span>' : '') + '<span role="cell"></span><span role="cell"><b>' + C.brl(total) + '</b></span></div></div>' +
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
      const devolveu = removerMovsRef('vendaped:' + p.id);
      excluirRegistro('pedidos', p.id); S.editor = null; toast('Pedido excluído.' + (devolveu ? ' As unidades voltaram para a vitrine.' : '')); ir('#/pedidos');
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
    'prod-dia': function (el) { const n = Number(el.dataset.v), d = C.somarDias(hoje(), n); S.prod = { preset: n === 1 ? 'amanha' : n === 0 ? 'hoje' : 'personalizado', de: d, ate: d }; if (location.hash !== '#/producao') ir('#/producao'); else render(false); },
    'prod-preset': function (el) { const p = PRESETS_PROD.find(x => x[0] === el.dataset.v); S.prod = { preset: p[0], de: C.somarDias(hoje(), p[2]), ate: C.somarDias(hoje(), p[3]) }; render(false); },
    'prod-iniciar': function () {
      const P = faixaProd();
      const ps = lista('pedidos').filter(p => p.dataEntrega >= P.de && p.dataEntrega <= P.ate && p.status === 'confirmado');
      ps.forEach(function (p) { const c = clone(p); c.status = 'producao'; (c.historicoStatus = c.historicoStatus || []).push({ status: 'producao', em: agoraISO() }); aplicarBaixaEstoquePedido(p, c); gravarRegistro('pedidos', c); });
      toast((ps.length === 1 ? '1 pedido em produção.' : ps.length + ' pedidos em produção.') + (modoEstoque() === 'completo' ? ' Ingredientes descontados do estoque.' : '')); render(false);
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
    if (t.dataset && t.dataset.prodfaixa && t.value) { const P = faixaProd(); P[t.dataset.prodfaixa] = t.value; P.preset = 'personalizado'; render(false); return; }
    if (t.dataset && t.dataset.compras) {
      S.compras = S.compras || {};
      if (t.dataset.compras === 'orc') S.compras.orc = t.checked; else if (t.value) S.compras[t.dataset.compras] = t.value;
      render(false);
    }
  });

  // ================= Caixa: entradas e saídas =================
  const PRESETS_CX = [['hoje', 'Hoje'], ['7dias', '7 dias'], ['mes', 'Este mês'], ['mesPassado', 'Mês passado'], ['ano', 'Este ano']];
  function filtroCaixa() {
    if (!S.caixa) { const p = C.periodoPreset('mes', hoje()); S.caixa = { preset: 'mes', de: p.de, ate: p.ate, tipo: 'todos', fontes: [], busca: '' }; }
    return S.caixa;
  }
  function movsTodos() { return C.movimentos(lista('pedidos'), lista('lancamentos'), nomeCliente); }
  function fontesConhecidas(tipo) {
    const base = tipo === 'saida' ? C.CATEGORIAS_PADRAO : C.ORIGENS_PADRAO;
    const usadas = lista('lancamentos').filter(l => (l.tipo === 'saida') === (tipo === 'saida')).map(l => l.categoria).filter(Boolean);
    const vistos = {}, out = [];
    base.concat(usadas).forEach(f => { const k = C.semAcento(f); if (!vistos[k] && k !== C.semAcento(C.FONTE_PEDIDOS)) { vistos[k] = 1; out.push(f); } });
    return out;
  }
  function fonteCanonica(nome, tipo) {
    const k = C.semAcento(nome);
    return fontesConhecidas(tipo).find(f => C.semAcento(f) === k) || String(nome || '').trim();
  }
  function formaTxt(f) { return C.FORMAS_LANCAMENTO[f] || ''; }

  function telaCaixa() {
    const F = filtroCaixa();
    const todos = movsTodos();
    let h = cab('Caixa', 'Tudo o que entrou e saiu. Os pagamentos registrados nos pedidos entram sozinhos.',
      '<a class="btn sec" href="#/lancamento/novo?tipo=entrada">' + I.mais + 'Nova entrada</a><a class="btn" href="#/lancamento/novo?tipo=saida">' + I.mais + 'Nova saída</a>') + abas(ABAS_CX, '#/caixa');
    if (!todos.length) {
      return h + '<div class="bloco vazio">' + I.emblema + '<h2>Nenhum movimento ainda</h2><p>Registre as saídas (compras, contas) e as entradas de fora dos pedidos, como vendas de balcão. Os sinais e pagamentos dos pedidos aparecem aqui sozinhos.</p><div class="acoes" style="justify-content:center"><a class="btn" href="#/lancamento/novo?tipo=saida">' + I.mais + 'Registrar uma saída</a><a class="btn sec" href="#/lancamento/novo?tipo=entrada">' + I.mais + 'Registrar uma entrada</a></div></div>';
    }
    const noPeriodo = C.filtrarMovimentos(todos, { de: F.de, ate: F.ate });
    const semFonte = C.filtrarMovimentos(noPeriodo, { tipo: F.tipo, busca: F.busca });
    const lst = C.filtrarMovimentos(semFonte, { fontes: F.fontes });
    const r = C.resumoCaixa(lst), rf = C.resumoCaixa(semFonte);
    S.movsFiltrados = lst;
    const sel = f => F.fontes.some(x => C.semAcento(x) === C.semAcento(f));
    const chip = f => '<button type="button" class="chip-filtro" data-acao="cx-fonte" data-v="' + esc(f) + '" aria-pressed="' + sel(f) + '">' + (sel(f) ? I.ok : '') + esc(f) + '</button>';
    const fontesDe = tipo => { const nomes = Object.keys(rf.porFonte[tipo]); F.fontes.forEach(f => { if (!nomes.some(n => C.semAcento(n) === C.semAcento(f)) && (tipo === 'saida' ? fontesConhecidas('saida') : fontesConhecidas('entrada').concat([C.FONTE_PEDIDOS])).some(n => C.semAcento(n) === C.semAcento(f))) nomes.push(f); }); return nomes.sort((a, b) => a.localeCompare(b, 'pt-BR')); };
    const fe = F.tipo !== 'saida' ? fontesDe('entrada') : [], fs = F.tipo !== 'entrada' ? fontesDe('saida') : [];
    const filtrosAtivos = F.tipo !== 'todos' || F.fontes.length || F.busca;

    const nAtivos = (F.tipo !== 'todos' ? 1 : 0) + F.fontes.length + (F.busca ? 1 : 0);
    h += '<section class="bloco filtros-cx"><h2 class="sr">Período</h2><div class="seg" role="group" aria-label="Período">' +
      PRESETS_CX.map(p => '<button type="button" data-acao="cx-preset" data-v="' + p[0] + '" aria-pressed="' + (F.preset === p[0]) + '">' + p[1] + '</button>').join('') + '</div>' +
      '<div class="linha-campos" style="margin-top:12px"><label class="campo"><span>De</span><input class="entrada" type="date" data-cx="de" value="' + F.de + '"></label><label class="campo"><span>Até</span><input class="entrada" type="date" data-cx="ate" value="' + F.ate + '"></label></div></section>';
    if (F.ate < F.de) return h + '<div class="aviso neg">' + I.alerta + '<div class="txt">A data final vem antes da inicial.</div></div>';

    h += '<div class="stats stats-cx"><div class="stat"><div class="r">Entradas</div><div class="n pos-txt">' + C.brl(r.entradas) + '</div></div>' +
      '<div class="stat"><div class="r">Saídas</div><div class="n neg-txt">' + C.brl(r.saidas) + '</div>' + (r.retiradas > 0 ? '<small class="mudo">inclui ' + C.brl(r.retiradas) + ' de pró-labore</small>' : '') + '</div>' +
      '<div class="stat"><div class="r">Saldo ' + (r.saldo < 0 ? '(negativo)' : '') + '</div><div class="n ' + (r.saldo < 0 ? 'neg-txt' : 'pos-txt') + '">' + (r.saldo < 0 ? '−' : '') + C.brl(Math.abs(r.saldo)) + '</div></div></div>';

    h += '<details class="bloco mais-filtros"' + (nAtivos || F.maisAberto ? ' open' : '') + '><summary><span>Filtrar por tipo, origem ou categoria</span>' + (nAtivos ? '<span class="chip alerta">' + nAtivos + (nAtivos === 1 ? ' filtro ativo' : ' filtros ativos') + '</span>' : '') + '</summary>' +
      '<div class="seg" role="group" aria-label="Tipo de movimento" style="margin-top:6px">' + [['todos', 'Tudo'], ['entrada', 'Entradas'], ['saida', 'Saídas']].map(t => '<button type="button" data-acao="cx-tipo" data-v="' + t[0] + '" aria-pressed="' + (F.tipo === t[0]) + '">' + t[1] + '</button>').join('') + '</div>' +
      (fe.length ? '<div class="grupo-fontes"><span class="rot-fontes">Origem das entradas</span><div class="chips-filtro">' + fe.map(chip).join('') + '</div></div>' : '') +
      (fs.length ? '<div class="grupo-fontes"><span class="rot-fontes">Categoria das saídas</span><div class="chips-filtro">' + fs.map(chip).join('') + '</div></div>' : '') +
      '<div class="linha-campos" style="margin-top:14px"><label class="busca"><span class="sr">Buscar na descrição</span>' + I.busca + '<input class="entrada" id="busca-cx" type="search" placeholder="Buscar na descrição" value="' + esc(F.busca) + '"></label></div>' +
      (filtrosAtivos ? '<button type="button" class="link-btn" data-acao="cx-limpar">Limpar filtros (mantém o período)</button>' : '') + '</details>';
    if (!lst.length) return h + '<p class="mudo" style="padding:8px 4px 24px">Nenhum movimento com esses filtros.</p>';

    h += graficoCaixa(lst, F.de, F.ate);
    h += '<div class="grade-fontes">' + blocoPorFonte('Entradas por origem', rf.porFonte.entrada, 'entrada', sel) + blocoPorFonte('Saídas por categoria', rf.porFonte.saida, 'saida', sel) + '</div>';

    const LIM = 300;
    let lista_ = '', ultimo = null;
    lst.slice(0, LIM).forEach(function (m) {
      if (m.data !== ultimo) { ultimo = m.data; lista_ += '<h3 class="grupo-data">' + esc(dataCurta(m.data)) + '</h3>'; }
      const ent = m.tipo === 'entrada';
      const href = m.automatico ? '#/pedido/' + encodeURIComponent(m.pedidoId) : '#/lancamento/' + encodeURIComponent(m.lancamentoId);
      lista_ += '<a class="item mov" href="' + href + '"><div class="principal"><div class="nome">' + esc(m.descricao) + '</div><div class="det">' + esc(m.fonte) +
        (m.forma ? ', ' + esc(formaTxt(m.forma)) : '') + (m.nItensCompra ? ', ' + m.nItensCompra + (m.nItensCompra === 1 ? ' ingrediente' : ' ingredientes') : '') + (m.pedidoCancelado ? ', pedido cancelado' : '') + '</div></div>' +
        '<div class="valor ' + (ent ? 'pos-txt' : 'neg-txt') + '"><span class="sr">' + (ent ? 'Entrada de' : 'Saída de') + '</span>' + (ent ? '+ ' : '− ') + C.brl(m.valor) + '</div></a>';
    });
    h += '<section class="bloco"><div class="cab-bloco"><h2>' + lst.length + (lst.length === 1 ? ' movimento' : ' movimentos') + '</h2><button type="button" class="btn sec fino" data-acao="cx-csv">' + I.baixar + 'Exportar planilha (CSV)</button></div>' +
      '<div class="lista">' + lista_ + '</div>' + (lst.length > LIM ? '<p class="mudo" style="margin-top:10px">Mostrando os ' + LIM + ' mais recentes. Use os filtros ou exporte para ver todos.</p>' : '') + '</section>';
    return h;
  }
  function graficoCaixa(lst, de, ate) {
    const g = C.agruparPeriodo(lst, de, ate);
    const B = g.baldes; if (!B.length) return '';
    S.grafBaldes = B;
    const max = Math.max(0.01, ...B.map(b => Math.max(b.entradas, b.saidas)));
    const passo = Math.ceil(B.length / 7);
    const nomeBalde = { dia: 'dia', semana: 'semana', mes: 'mês' }[g.modo];
    const cols = B.map(function (b, i) {
      const he = b.entradas / max * 100, hs = b.saidas / max * 100;
      return '<button type="button" class="graf-col" data-acao="cx-barra" data-i="' + i + '" title="' + esc(b.rotulo + ': entradas ' + C.brl(b.entradas) + ', saídas ' + C.brl(b.saidas)) + '" aria-label="' + esc(b.rotulo + ': entradas ' + C.brl(b.entradas) + ', saídas ' + C.brl(b.saidas)) + '">' +
        '<span class="graf-barras"><i class="b-ent" style="height:' + he.toFixed(2) + '%"></i><i class="b-sai" style="height:' + hs.toFixed(2) + '%"></i></span>' +
        '<span class="graf-rot">' + (i % passo === 0 ? esc(g.modo === 'semana' ? b.rotulo : b.rotulo) : '') + '</span></button>';
    }).join('');
    return '<section class="bloco"><div class="cab-bloco"><h2>Movimento por ' + nomeBalde + '</h2><div class="legenda"><span><i class="b-ent"></i>Entradas</span><span><i class="b-sai"></i>Saídas</span></div></div>' +
      '<div class="graf">' + cols + '</div><p class="mudo" id="graf-info" role="status">Toque numa barra para ver os valores ' + (g.modo === 'dia' ? 'do dia' : g.modo === 'semana' ? 'da semana (começa no domingo)' : 'do mês') + '.</p></section>';
  }
  function blocoPorFonte(titulo, mapa, tipo, sel) {
    const itens = Object.entries(mapa).sort((a, b) => b[1] - a[1]);
    if (!itens.length) return '';
    const total = itens.reduce((s, x) => s + x[1], 0), max = itens[0][1] || 1;
    return '<section class="bloco"><h2>' + titulo + '</h2><div class="por-fonte">' + itens.map(([f, v]) => '<button type="button" class="linha-fonte" data-acao="cx-fonte" data-v="' + esc(f) + '" aria-pressed="' + sel(f) + '"><span class="nome-f">' + (sel(f) ? I.ok : '') + esc(f) + '</span><span class="val-f">' + C.brl(v) + ' <small>' + C.pct(total ? v / total : 0, 0) + '</small></span><span class="barra-f"><i class="' + (tipo === 'entrada' ? 'b-ent' : 'b-sai') + '" style="width:' + (v / max * 100).toFixed(2) + '%"></i></span></button>').join('') +
      '</div><p class="mudo" style="margin-top:8px">Toque numa linha para filtrar por ela.</p></section>';
  }

  // ---------- Editor de lançamento ----------
  function novoLancamento(q) {
    if (q && q.get('compra')) {
      return { id: uid(), tipo: 'saida', data: hoje(), valor: null, descricao: '', categoria: fonteCanonica('Ingredientes', 'saida'), forma: 'pix', obs: '',
        itensCompra: [{ id: uid(), ingredienteId: '', embalagens: 1, qtdEmbalagem: null, unidade: 'g', valor: null }], outros: null };
    }
    return { id: uid(), tipo: q && q.get('tipo') === 'saida' ? 'saida' : 'entrada', data: hoje(), valor: null, descricao: '', categoria: (q && q.get('categoria')) || '', forma: 'pix', obs: '', itensCompra: [], outros: null };
  }
  function telaEditorLancamento(id, q) {
    if (!S.editor || S.editor.tipo !== 'lancamento' || S.editor.idRota !== id) {
      let d;
      if (id === 'novo') d = novoLancamento(q);
      else if (S.dados.lancamentos[id] && !S.dados.lancamentos[id].excluidoEm) d = clone(S.dados.lancamentos[id]);
      else return '<div class="bloco vazio">' + I.emblema + '<h2>Lançamento não encontrado</h2><p>Ele pode ter sido excluído em outro aparelho.</p><a class="btn" href="#/caixa">Ver caixa</a></div>';
      d.itensCompra = d.itensCompra || [];
      const deCompras = !!(q && (q.get('compra') || q.get('de') === 'compras'));
      S.editor = { tipo: 'lancamento', idRota: id, nova: id === 'novo', d: d, sujo: false, compra: deCompras, voltar: deCompras ? '#/compras?v=feitas' : '#/caixa' };
    }
    return htmlEditorLancamento();
  }
  function totalLancamento(l) {
    if (l.tipo === 'saida' && l.itensCompra.length) return C.round2(l.itensCompra.reduce((s, it) => s + (C.numOk(it.valor) ? it.valor : 0), 0) + (C.numOk(l.outros) ? l.outros : 0));
    return C.numOk(l.valor) ? l.valor : null;
  }
  function htmlEditorLancamento() {
    const e = S.editor, l = e.d, ent = l.tipo === 'entrada';
    const ings = lista('ingredientes').sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    const titulo = e.compra ? (e.nova ? 'Nova compra' : 'Compra') : (e.nova ? (ent ? 'Nova entrada' : 'Nova saída') : (ent ? 'Entrada' : 'Saída'));
    let h = '<div class="cab-pagina"><div class="titulos"><a href="' + e.voltar + '" class="link-btn voltar">' + I.voltar + (e.compra ? 'Compras feitas' : 'Caixa') + '</a><h1>' + titulo + '</h1>' +
      (e.compra && e.nova ? '<p class="sub">Marque os ingredientes comprados: o preço e o histórico de cada um se atualizam, e a compra entra no Caixa como saída.</p>' : '') + '</div></div>';
    h += '<div class="form-lanc">';
    h += '<section class="bloco">' + (e.nova && !l.itensCompra.length ? '<div class="seg" role="group" aria-label="Tipo"><button type="button" data-acao="lanc-tipo" data-v="entrada" aria-pressed="' + ent + '">Entrada</button><button type="button" data-acao="lanc-tipo" data-v="saida" aria-pressed="' + !ent + '">Saída</button></div>' : '') +
      '<div class="grade" style="margin-top:14px"><label class="campo"><span>Data</span><input class="entrada" type="date" data-c="data" value="' + esc(l.data) + '"></label>' +
      '<label class="campo"><span>' + (ent ? 'Origem' : 'Categoria') + '</span><input class="entrada" data-c="categoria" list="dl-fontes" value="' + esc(l.categoria) + '" placeholder="' + (ent ? 'Ex.: Venda de balcão' : 'Ex.: Embalagens') + '" autocomplete="off"><datalist id="dl-fontes">' + fontesConhecidas(l.tipo).map(f => '<option value="' + esc(f) + '">').join('') + '</datalist><small>Escolha da lista ou escreva uma nova.</small></label>' +
      '<label class="campo"><span>Descrição</span><input class="entrada" data-c="descricao" value="' + esc(l.descricao) + '" placeholder="' + (ent ? 'Ex.: 20 brigadeiros no balcão' : 'Ex.: Compra no atacado') + '"></label>' +
      '<label class="campo"><span>Forma de pagamento</span><select class="entrada" data-c="forma">' + Object.keys(C.FORMAS_LANCAMENTO).map(k => '<option value="' + k + '"' + (l.forma === k ? ' selected' : '') + '>' + C.FORMAS_LANCAMENTO[k] + '</option>').join('') + '</select></label></div></section>';

    if (!ent) {
      h += '<section class="bloco"><h2>Ingredientes comprados</h2><p class="explica">Opcional. Cada ingrediente marcado aqui tem o preço e o histórico atualizados na biblioteca, na data desta compra, e as receitas são recalculadas.</p><div class="linhas-edit">' +
        l.itensCompra.map(function (it, i) {
          const ing = S.dados.ingredientes[it.ingredienteId];
          return '<div class="linha-edit linha-compra">' +
            '<label class="campo nome-av"><span>Ingrediente</span><select class="entrada" data-c="itensCompra.' + i + '.ingredienteId"><option value="">Escolha…</option><option value="__novo__">+ Cadastrar ingrediente novo…</option>' + ings.map(x => '<option value="' + esc(x.id) + '"' + (x.id === it.ingredienteId ? ' selected' : '') + '>' + esc(x.nome) + '</option>').join('') + (ing && ing.excluidoEm ? '<option value="' + esc(ing.id) + '" selected>' + esc(ing.nome) + ' (excluído)</option>' : '') + '</select></label>' +
            '<label class="campo"><span>Embalagens</span><input class="entrada num" data-c="itensCompra.' + i + '.embalagens" data-n inputmode="decimal" value="' + inNum(it.embalagens) + '"></label>' +
            '<div class="campo"><span>Tamanho de cada</span><div class="qtd" style="display:flex;gap:6px"><input class="entrada num" data-c="itensCompra.' + i + '.qtdEmbalagem" data-n inputmode="decimal" value="' + inNum(it.qtdEmbalagem) + '" aria-label="Tamanho da embalagem"><select class="entrada" data-c="itensCompra.' + i + '.unidade" style="flex:0 0 78px" aria-label="Unidade">' + opcoesUn(ing ? ing.unidade : null, it.unidade) + '</select></div></div>' +
            (modoEstoque() === 'completo' ? '<label class="campo"><span>Validade</span><input class="entrada" type="date" data-c="itensCompra.' + i + '.validade" value="' + esc(it.validade || '') + '"></label>' : '') +
            '<label class="campo"><span>Valor pago no item</span><span class="com-prefixo"><i>R$</i><input class="entrada num" data-c="itensCompra.' + i + '.valor" data-n inputmode="decimal" value="' + inNum(it.valor) + '"></span></label>' +
            '<p class="info-compra" data-compra-info="' + i + '"></p>' +
            '<button type="button" class="btn-icone" data-acao="rem-compra" data-i="' + i + '" aria-label="Remover ingrediente da compra">' + I.lixo + '</button></div>';
        }).join('') + '</div><button type="button" class="btn sec" style="margin-top:12px" data-acao="add-compra">' + I.mais + 'Adicionar ingrediente comprado</button>' +
        (l.itensCompra.length ? '<div class="grade" style="margin-top:14px"><label class="campo"><span>Outros itens da mesma compra</span><span class="com-prefixo"><i>R$</i><input class="entrada num" data-c="outros" data-n inputmode="decimal" value="' + inNum(l.outros) + '" placeholder="0,00"></span><small>O que não está na biblioteca: guardanapos, produtos de limpeza…</small></label></div>' : '') + '</section>';
    }
    h += '<section class="bloco"><h2>Valor</h2>' + (!ent && l.itensCompra.length
      ? '<p class="total-lanc" id="total-lanc"></p><small class="mudo">Soma dos ingredientes e dos outros itens.</small>'
      : '<label class="campo"><span class="sr">Valor</span><span class="com-prefixo" style="max-width:260px"><i>R$</i><input class="entrada num" data-c="valor" data-n inputmode="decimal" value="' + inNum(l.valor) + '" placeholder="0,00"></span></label>') +
      '<label class="campo" style="margin-top:14px"><span>Observações</span><textarea class="entrada" data-c="obs" placeholder="Opcional">' + esc(l.obs || '') + '</textarea></label></section>';
    h += '<div class="barra-salvar"><span class="estado" id="estado-lanc"></span>' +
      (!e.nova ? '<button type="button" class="btn perigo fino" data-acao="excluir-lanc" aria-label="Excluir lançamento" title="Excluir lançamento">' + I.lixo + '<span>Excluir</span></button>' : '') +
      '<button type="button" class="btn" data-acao="salvar-lanc">Salvar ' + (e.compra ? 'compra' : ent ? 'entrada' : 'saída') + '</button></div></div>';
    return h;
  }
  function montarEditorLancamento() {
    const cont = $('.form-lanc'); if (!cont) return;
    cont.addEventListener('input', aoEditarLanc); cont.addEventListener('change', aoEditarLanc);
    recalcLanc();
  }
  function aoEditarLanc(ev) {
    const el = ev.target, e = S.editor; if (!e || e.tipo !== 'lancamento') return;
    const cam = el.dataset.c; if (!cam) return;
    const porChange = el.tagName === 'SELECT' || el.type === 'date';
    if (porChange ? ev.type !== 'change' : ev.type !== 'input') return;
    gravarCaminho(e.d, cam, el.hasAttribute('data-n') ? C.lerNum(el.value) : el.value);
    marcarSujo();
    const m = cam.match(/^itensCompra\.(\d+)\.ingredienteId$/);
    if (m && el.value === '__novo__') {
      const idx = +m[1], it = e.d.itensCompra[idx];
      it.ingredienteId = ''; render(false);
      folhaIngrediente(null, function (ing) {
        const ed = S.editor; if (!ed || ed.tipo !== 'lancamento') return;
        const alvo = ed.d.itensCompra[idx]; if (!alvo) return;
        alvo.ingredienteId = ing.id; alvo.qtdEmbalagem = ing.qtdEmbalagem; alvo.unidade = C.normUn(ing.unidade);
        marcarSujo(); render(false);
        setTimeout(() => { const v = $('[data-c="itensCompra.' + idx + '.valor"]'); if (v) v.focus(); }, 50);
      });
      return;
    }
    if (m) {
      const it = e.d.itensCompra[+m[1]], ing = S.dados.ingredientes[it.ingredienteId];
      if (ing) { it.qtdEmbalagem = ing.qtdEmbalagem; it.unidade = C.normUn(ing.unidade); }
      render(false); return;
    }
    recalcLanc();
  }
  function recalcLanc() {
    const e = S.editor; if (!e || e.tipo !== 'lancamento') return;
    const l = e.d;
    l.itensCompra.forEach(function (it, i) {
      const el = $('[data-compra-info="' + i + '"]'); if (!el) return;
      const ing = S.dados.ingredientes[it.ingredienteId];
      if (!ing) { el.textContent = ''; return; }
      const r = C.aplicarCompra(ing, it, l.data || hoje(), l.id + ':' + it.id);
      if (!r) { el.className = 'info-compra'; el.textContent = 'Preencha embalagens, tamanho e valor para ver o preço.'; return; }
      const novo = C.custoIngrediente(r.ing), emb = it.valor / it.embalagens;
      el.className = 'info-compra' + (r.variacao > 0.004 ? ' neg-txt' : r.variacao < -0.004 ? ' pos-txt' : '');
      el.textContent = C.brl(emb) + ' por ' + C.num(it.qtdEmbalagem) + ' ' + rotUn(it.unidade) + ' (' + C.brl(novo.porBase, 4) + '/' + novo.base + ')' +
        (r.precoAtualMudou ? (C.numOk(r.variacao) && Math.abs(r.variacao) >= 0.005 ? '. Antes: ' + porBaseTxt(ing) + ' (' + (r.variacao > 0 ? 'subiu ' : 'caiu ') + C.pct(Math.abs(r.variacao)) + ')' : '. Mesmo preço de antes.') : '. Há uma compra mais recente; o preço atual não muda.');
    });
    const tot = totalLancamento(l);
    const t = $('#total-lanc'); if (t) t.textContent = C.brl(tot || 0);
    const est = $('#estado-lanc');
    if (est) est.innerHTML = '<b style="color:var(--ink)">' + (C.numOk(tot) ? (l.tipo === 'entrada' ? '+ ' : '− ') + C.brl(tot) : 'Sem valor') + '</b><br>' + (e.sujo ? 'Alterações não salvas' : (e.nova ? (e.compra ? 'Nova compra' : 'Novo lançamento') : 'Tudo salvo'));
  }
  function validarLancamento(l) {
    if (!l.data) return 'Informe a data.';
    if (l.tipo === 'saida' && l.itensCompra.length) {
      for (const it of l.itensCompra) {
        const ing = S.dados.ingredientes[it.ingredienteId];
        if (!ing) return 'Escolha o ingrediente em todas as linhas da compra.';
        if (!(it.embalagens > 0)) return ing.nome + ': informe quantas embalagens.';
        if (!(it.qtdEmbalagem > 0)) return ing.nome + ': informe o tamanho da embalagem.';
        if (!(C.numOk(it.valor) && it.valor >= 0)) return ing.nome + ': informe o valor pago.';
        if (!C.mesmaFamilia(it.unidade, ing.unidade)) return ing.nome + ': a unidade não combina com a do ingrediente.';
      }
      const ids = l.itensCompra.map(it => it.ingredienteId);
      if (new Set(ids).size !== ids.length) return 'O mesmo ingrediente aparece duas vezes. Junte numa linha só.';
    }
    const tot = totalLancamento(l);
    if (!(tot > 0)) return 'Informe um valor maior que zero.';
    return null;
  }
  function salvarLancamento() {
    const e = S.editor, l = e.d;
    const erro = validarLancamento(l);
    if (erro) { toast(erro); return false; }
    if (l.tipo === 'entrada') { l.itensCompra = []; l.outros = null; }
    l.valor = totalLancamento(l);
    l.categoria = fonteCanonica(l.categoria, l.tipo) || (l.tipo === 'saida' ? (l.itensCompra.length ? 'Ingredientes' : 'Outras saídas') : 'Outras entradas');
    l.descricao = String(l.descricao || '').trim() || l.categoria;
    // Preços dos ingredientes: tira os pontos de itens removidos, aplica os atuais
    const orig = S.dados.lancamentos[l.id];
    const trabalho = {}, mudancas = [];
    const pegar = id => trabalho[id] || S.dados.ingredientes[id];
    const chavesNovas = new Set(l.itensCompra.map(it => l.id + ':' + it.id));
    ((orig && orig.itensCompra) || []).forEach(function (it) {
      const ch = l.id + ':' + it.id, novoIt = l.itensCompra.find(x => x.id === it.id);
      if (!chavesNovas.has(ch) || (novoIt && novoIt.ingredienteId !== it.ingredienteId)) {
        const ing = pegar(it.ingredienteId); if (!ing) return;
        const r = C.removerCompra(ing, ch); if (r) trabalho[ing.id] = r;
      }
    });
    l.itensCompra.forEach(function (it) {
      const ing = pegar(it.ingredienteId);
      const r = C.aplicarCompra(ing, it, l.data, l.id + ':' + it.id);
      trabalho[ing.id] = r.ing;
      if (r.precoAtualMudou && C.numOk(r.variacao) && Math.abs(r.variacao) >= 0.005) mudancas.push(ing.nome + ' (' + (r.variacao > 0 ? '+' : '−') + C.pct(Math.abs(r.variacao)) + ')');
    });
    Object.values(trabalho).forEach(ing => gravarRegistro('ingredientes', ing));
    gravarRegistro('lancamentos', clone(l));
    aplicarEstoqueCompra(l);
    const eraNovo = e.nova, destino = e.voltar || '#/caixa', eraCompra = e.compra;
    S.editor = null;
    let msg = eraCompra ? (eraNovo ? 'Compra registrada.' : 'Compra salva.') : (l.tipo === 'entrada' ? 'Entrada ' : 'Saída ') + (eraNovo ? 'registrada.' : 'salva.');
    if (mudancas.length) msg += ' Preço atualizado: ' + mudancas.join(', ') + '.';
    const alerta = (cfg().margemAlerta || 0) / 100, ctx = ctxCalc();
    const ruins = new Set();
    Object.keys(trabalho).forEach(id => receitasAfetadas(id).forEach(r => { if ((C.calcularReceita(r, ctx).variacoes || []).some(v => v.prejuizo || (C.numOk(v.margemReal) && v.margemReal < alerta))) ruins.add(r.id); }));
    if (ruins.size) toast(msg + ' ' + (ruins.size === 1 ? '1 receita ficou' : ruins.size + ' receitas ficaram') + ' com margem abaixo do mínimo.', 'Ver', () => ir('#/inicio'));
    else toast(msg);
    ir(destino);
    return true;
  }

  const ACOES_CAIXA = {
    'cx-preset': function (el) { const F = filtroCaixa(), p = C.periodoPreset(el.dataset.v, hoje()); F.preset = el.dataset.v; F.de = p.de; F.ate = p.ate; render(false); },
    'cx-tipo': function (el) { filtroCaixa().tipo = el.dataset.v; render(false); },
    'cx-fonte': function (el) {
      const F = filtroCaixa(), v = el.dataset.v, k = C.semAcento(v);
      F.fontes = F.fontes.some(x => C.semAcento(x) === k) ? F.fontes.filter(x => C.semAcento(x) !== k) : F.fontes.concat([v]);
      render(false);
    },
    'cx-limpar': function () { const F = filtroCaixa(); F.tipo = 'todos'; F.fontes = []; F.busca = ''; render(false); },
    'cx-barra': function (el) {
      const b = (S.grafBaldes || [])[+el.dataset.i]; if (!b) return;
      $$('.graf-col.sel').forEach(x => x.classList.remove('sel')); el.classList.add('sel');
      const info = $('#graf-info');
      if (info) info.innerHTML = '<b>' + esc(b.rotulo) + ':</b> entradas <span class="pos-txt">' + C.brl(b.entradas) + '</span>, saídas <span class="neg-txt">' + C.brl(b.saidas) + '</span>, saldo ' + (b.entradas - b.saidas < 0 ? '−' : '') + C.brl(Math.abs(b.entradas - b.saidas));
    },
    'cx-csv': function () {
      const F = filtroCaixa();
      const blob = new Blob([C.csvMovimentos(S.movsFiltrados || [])], { type: 'text/csv;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'caixa-' + F.de + '-a-' + F.ate + '.csv';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      toast('Planilha exportada. Abre no Excel ou no Google Planilhas.');
    },
    'lanc-tipo': function (el) { const l = S.editor.d; l.tipo = el.dataset.v; l.categoria = ''; marcarSujo(); render(false); },
    'add-compra': function () {
      const l = S.editor.d;
      l.itensCompra.push({ id: uid(), ingredienteId: '', embalagens: 1, qtdEmbalagem: null, unidade: 'g', valor: null });
      if (!l.categoria) l.categoria = 'Ingredientes';
      marcarSujo(); render(false);
      setTimeout(() => { const s = $('[data-c="itensCompra.' + (l.itensCompra.length - 1) + '.ingredienteId"]'); if (s) s.focus(); }, 50);
    },
    'rem-compra': function (el) { S.editor.d.itensCompra.splice(+el.dataset.i, 1); marcarSujo(); render(false); },
    'salvar-lanc': async function () {
      const l = S.editor && S.editor.d; if (!l) return;
      if (validarLancamento(l)) { salvarLancamento(); return; } // mostra o erro de validação
      if (!(await conferirRetiradaNoLancamento(l))) return;
      salvarLancamento();
    },
    'excluir-lanc': async function () {
      const l = S.editor.d, orig = S.dados.lancamentos[l.id];
      const temCompra = orig && (orig.itensCompra || []).length;
      if (!await confirmar('Excluir lançamento?', 'Excluir <b>' + esc(orig ? orig.descricao : '') + '</b> de ' + C.brl(orig ? orig.valor : 0) + '.' + (temCompra ? ' Os ingredientes desta compra voltam ao preço anterior.' : ''), 'Excluir', true)) return;
      (orig.itensCompra || []).forEach(function (it) {
        const ing = S.dados.ingredientes[it.ingredienteId]; if (!ing) return;
        const r = C.removerCompra(ing, orig.id + ':' + it.id); if (r) gravarRegistro('ingredientes', r);
      });
      aplicarEstoqueCompra(orig, true); removerMovsRef('venda:' + orig.id);
      const destino = (S.editor && S.editor.voltar) || '#/caixa';
      excluirRegistro('lancamentos', orig.id); S.editor = null; ir(destino); toast('Lançamento excluído.' + (orig.vitrine ? ' A quantidade volta para a vitrine.' : ''));
    }
  };
  document.addEventListener('toggle', function (e) {
    if (e.target.classList && e.target.classList.contains('mais-filtros')) filtroCaixa().maisAberto = e.target.open;
  }, true);
  let timerBuscaCx = null;
  document.addEventListener('input', function (e) {
    if (e.target.id !== 'busca-cx') return;
    filtroCaixa().busca = e.target.value;
    clearTimeout(timerBuscaCx);
    timerBuscaCx = setTimeout(function () { render(false); const b = $('#busca-cx'); if (b) { b.focus(); b.setSelectionRange(b.value.length, b.value.length); } }, 350);
  });
  document.addEventListener('change', function (e) {
    const t = e.target;
    if (t.dataset && t.dataset.cx && t.value) { const F = filtroCaixa(); F[t.dataset.cx] = t.value; F.preset = 'personalizado'; render(false); }
  });

  // ================= Estoque =================
  function modoEstoque() { return cfg().estoqueModo || 'manual'; }
  function movsEstoque() { return lista('estoque'); }
  function saldos() { return C.saldosEstoque(movsEstoque()); }
  function nomeVitrine(item) {
    const [, rid, vid] = item.split(':');
    const r = S.dados.receitas[rid], v = r && (r.variacoes || []).find(x => x.id === vid);
    return r ? (r.nome || 'Receita') + ' (' + (v ? v.nome || 'opção' : 'opção removida') + ')' : 'Produto removido';
  }
  function registrarMov(item, qtd, motivo, extra) {
    if (!C.numOk(qtd) || Math.abs(qtd) < 1e-9) return null;
    const ing = item.startsWith('ing:') ? S.dados.ingredientes[item.slice(4)] : null;
    const m = Object.assign({ id: uid(), item: item, nome: ing ? ing.nome : nomeVitrine(item), qtd: Math.round(qtd * 10000) / 10000, motivo: motivo, data: hoje(), ref: '', validade: '', obs: '' }, extra || {});
    gravarRegistro('estoque', m);
    return m;
  }
  function removerMovsRef(ref) {
    let n = 0;
    movsEstoque().filter(m => m.ref === ref).forEach(m => { excluirRegistro('estoque', m.id); n++; });
    return n;
  }
  // Pedido: desconta os ingredientes quando entra em produção (modo completo)
  function aplicarBaixaEstoquePedido(orig, p) {
    const temBaixa = !!(orig && orig.baixaEstoque);
    if (modoEstoque() !== 'completo' && !temBaixa) return;
    const assin = C.assinaturaItensPedido(p);
    const acao = C.acaoBaixaPedido(orig ? orig.status : null, p.status, temBaixa, temBaixa && orig.baixaEstoque.assinatura !== assin);
    const ref = 'ped:' + p.id;
    if (acao === 'remover' || acao === 'atualizar') { removerMovsRef(ref); delete p.baixaEstoque; }
    if (acao === 'criar' || acao === 'atualizar') {
      const bx = C.baixaDoPedido(p, ctxCalc());
      Object.keys(bx).forEach(id => registrarMov(C.chaveIng(id), -bx[id], 'producao', { ref: ref, obs: 'Pedido de ' + nomeCliente(p), data: hoje() }));
      p.baixaEstoque = { assinatura: assin, em: agoraISO() };
    }
  }
  // Caixa: compra de ingredientes soma ao estoque (modo completo)
  function aplicarEstoqueCompra(l, excluindo) {
    const ref = 'compra:' + l.id;
    const tinha = movsEstoque().some(m => m.ref === ref);
    if (tinha) removerMovsRef(ref);
    if (excluindo || modoEstoque() !== 'completo' || l.tipo !== 'saida') return;
    (l.itensCompra || []).forEach(function (it) {
      const qb = C.paraBase(it.qtdEmbalagem, it.unidade) * it.embalagens;
      if (qb > 0) registrarMov(C.chaveIng(it.ingredienteId), qb, 'compra', { ref: ref, data: l.data, validade: it.validade || '', obs: l.descricao || '' });
    });
  }
  function unidadesContagem(ing) {
    const base = C.UNIDADES[C.normUn(ing.unidade)].base;
    const emb = C.paraBase(ing.qtdEmbalagem, ing.unidade);
    const ops = [];
    if (emb > 0) ops.push({ v: 'emb', r: 'embalagens de ' + C.num(ing.qtdEmbalagem) + ' ' + rotUn(ing.unidade), f: emb });
    C.unidadesDaFamilia(base).forEach(u => ops.push({ v: u, r: C.UNIDADES[u].rotulo, f: C.UNIDADES[u].fator }));
    return ops;
  }
  function qtdIngTxt(ing, qb) {
    const base = C.UNIDADES[C.normUn(ing.unidade)].base, emb = C.paraBase(ing.qtdEmbalagem, ing.unidade);
    return C.qtdLegivel(qb, base) + (emb > 0 && qb > 0 && base !== 'un' ? ' (' + C.num(qb / emb, 1) + (qb / emb === 1 ? ' embalagem' : ' embalagens') + ')' : '');
  }
  function chipValidade(st) {
    if (!st.validade) return '';
    if (st.vencido) return '<span class="chip neg">' + I.alerta + 'venceu em ' + dataDia(st.validade) + '</span>';
    if (st.venceLogo) return '<span class="chip alerta">' + I.alerta + (st.diasParaVencer === 0 ? 'vence hoje' : st.diasParaVencer === 1 ? 'vence amanhã' : 'vence em ' + st.diasParaVencer + ' dias') + '</span>';
    return '<span class="chip mudo">validade ' + dataDia(st.validade) + '</span>';
  }

  function telaEstoque(q) {
    const modo = modoEstoque(), v = q.get('v') === 'vitrine' ? 'vitrine' : 'ingredientes';
    let h = cab('Estoque', modo === 'completo' ? 'Modo completo: compras lançadas no Caixa somam e pedidos em produção descontam sozinhos.' : modo === 'manual' ? 'Modo manual: você lança entradas, perdas e contagens; o app avisa o que está acabando.' : '',
      modo === 'desligado' ? '' : (v === 'ingredientes' ? '<a class="btn" href="#/contagem">Contar estoque</a>' : '<button type="button" class="btn" data-acao="vitrine-add">' + I.mais + 'Colocar na vitrine</button>')) + abas(ABAS_PED, '#/estoque');
    if (modo === 'desligado') return h + '<div class="bloco vazio">' + I.emblema + '<h2>Estoque desligado</h2><p>Ligue em Ajustes para acompanhar quanto tem de cada ingrediente, validades e a vitrine de pronta-entrega. Com ele ligado, a lista de compras desconta o que você já tem.</p><a class="btn" href="#/ajustes#estoque">Ir para Ajustes</a></div>';
    h += '<div class="seg" role="group" aria-label="Tipo de estoque" style="margin-bottom:14px"><a href="#/estoque"' + (v === 'ingredientes' ? ' aria-current="true"' : '') + '>Ingredientes</a><a href="#/estoque?v=vitrine"' + (v === 'vitrine' ? ' aria-current="true"' : '') + '>Vitrine</a></div>';
    const sd = saldos(), cf = cfg(), hj = hoje();
    if (v === 'vitrine') {
      const itens = Object.values(sd).filter(x => x.item.startsWith('vit:') && Math.abs(x.qtd) > 1e-9).sort((a, b) => nomeVitrine(a.item).localeCompare(nomeVitrine(b.item), 'pt-BR'));
      if (!itens.length) return h + '<div class="bloco vazio">' + I.emblema + '<h2>Vitrine vazia</h2><p>Registre os doces prontos para pronta-entrega. Ao vender por aqui, a entrada vai sozinha para o Caixa.' + (modo === 'completo' ? ' No modo completo, colocar na vitrine também desconta os ingredientes usados.' : '') + '</p><button type="button" class="btn" data-acao="vitrine-add">' + I.mais + 'Colocar na vitrine</button></div>';
      return h + '<div class="lista">' + itens.map(function (x) {
        const st = C.situacaoEstoque(x, 0, hj, cf.diasAlertaValidade);
        return '<div class="item"><div class="principal"><button type="button" class="nome link-nome" data-acao="vitrine-editar" data-v="' + esc(x.item) + '">' + esc(nomeVitrine(x.item)) + '</button><div class="det">' + (st.negativo ? 'Estoque negativo: confira a contagem' : C.num(x.qtd) + (x.qtd === 1 ? ' unidade' : ' unidades')) + '</div></div>' +
          '<div class="acoes"><button type="button" class="btn fino" data-acao="vitrine-vender" data-v="' + esc(x.item) + '"' + (x.qtd > 0 ? '' : ' disabled') + '>Vender</button><button type="button" class="btn sec fino" data-acao="vitrine-perda" data-v="' + esc(x.item) + '">Perda</button><button type="button" class="btn sec fino" data-acao="vitrine-editar" data-v="' + esc(x.item) + '">Editar</button></div>' +
          '<div class="chips">' + chipValidade(st) + (st.negativo ? '<span class="chip neg">negativo</span>' : '') + '</div></div>';
      }).join('') + '</div>';
    }
    const ings = lista('ingredientes').sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    const f = q.get('f') || 'todos';
    const linhas = ings.map(function (ing) {
      const x = sd[C.chaveIng(ing.id)];
      return { ing: ing, x: x, st: C.situacaoEstoque(x, ing.estoqueMinimo, hj, cf.diasAlertaValidade) };
    });
    const nMin = linhas.filter(l => l.st.abaixoMinimo || l.st.negativo).length, nVal = linhas.filter(l => l.st.vencido || l.st.venceLogo).length;
    const semRegistro = linhas.every(l => !l.x);
    if (semRegistro) h += '<div class="aviso" style="margin-bottom:14px">' + I.alerta + '<div class="txt">Nada contado ainda. Comece por <a href="#/contagem">Contar estoque</a>: informe quanto tem de cada ingrediente hoje' + (modo === 'completo' ? '; daí em diante, compras e produção atualizam sozinhas.' : '.') + '</div></div>';
    h += '<div class="seg rolavel" role="group" aria-label="Filtrar" style="margin-bottom:12px"><a href="#/estoque"' + (f === 'todos' ? ' aria-current="true"' : '') + '>Todos</a><a href="#/estoque?f=minimo"' + (f === 'minimo' ? ' aria-current="true"' : '') + '>Acabando (' + nMin + ')</a><a href="#/estoque?f=validade"' + (f === 'validade' ? ' aria-current="true"' : '') + '>Validade (' + nVal + ')</a></div>';
    h += '<div class="linha-campos" style="margin-bottom:12px"><label class="busca"><span class="sr">Buscar ingrediente</span>' + I.busca + '<input class="entrada" id="busca-est" type="search" placeholder="Buscar ingrediente"></label></div>';
    const peso = l => (l.st.negativo || l.st.abaixoMinimo || l.st.vencido || l.st.venceLogo) ? 0 : l.x ? 1 : 2;
    linhas.sort((x, y) => peso(x) - peso(y) || x.ing.nome.localeCompare(y.ing.nome, 'pt-BR'));
    const vis = linhas.filter(l => f === 'minimo' ? (l.st.abaixoMinimo || l.st.negativo) : f === 'validade' ? (l.st.vencido || l.st.venceLogo) : true);
    if (!vis.length) return h + '<p class="mudo" style="padding:12px 4px">Nada aqui. ' + (f === 'minimo' ? 'Nenhum ingrediente abaixo do mínimo.' : 'Nenhuma validade próxima.') + '</p>';
    h += '<div class="lista" id="lista-est">' + vis.map(function (l) {
      const ing = l.ing, st = l.st;
      return '<button type="button" class="item" data-acao="estoque-item" data-id="' + esc(ing.id) + '" data-busca="' + esc(normBusca(ing.nome)) + '"><div class="principal"><div class="nome">' + esc(ing.nome) + '</div><div class="det">' +
        (l.x ? (st.negativo ? 'Negativo: ' + qtdIngTxt(ing, st.qtd) : qtdIngTxt(ing, Math.max(0, st.qtd))) : 'não contado') + (C.numOk(ing.estoqueMinimo) && ing.estoqueMinimo > 0 ? ', mínimo ' + C.qtdLegivel(ing.estoqueMinimo, C.UNIDADES[C.normUn(ing.unidade)].base) : '') + '</div></div>' + I.seta +
        '<div class="chips">' + (st.negativo ? '<span class="chip neg">' + I.alerta + 'negativo: conte de novo</span>' : st.abaixoMinimo ? '<span class="chip alerta">' + I.alerta + 'abaixo do mínimo</span>' : '') + chipValidade(st) + '</div></button>';
    }).join('') + '</div><p class="mudo" id="sem-res-est" hidden style="padding:16px">Nenhum ingrediente com esse nome.</p>';
    return h;
  }
  function montarFiltroEstoque() {
    const b = $('#busca-est'); if (!b) return;
    b.addEventListener('input', function () {
      const q = normBusca(b.value); let n = 0;
      $$('#lista-est .item').forEach(el => { const v = !q || el.dataset.busca.includes(q); el.hidden = !v; if (v) n++; });
      $('#sem-res-est').hidden = n > 0;
    });
  }
  function folhaItemEstoque(id, acaoInicial) {
    const ing = S.dados.ingredientes[id]; if (!ing) return;
    const item = C.chaveIng(id), sd = saldos()[item], base = C.UNIDADES[C.normUn(ing.unidade)].base;
    const st = C.situacaoEstoque(sd, ing.estoqueMinimo, hoje(), cfg().diasAlertaValidade);
    const hist = movsEstoque().filter(m => m.item === item).sort((a, b) => String(b.data).localeCompare(String(a.data)) || String(b.criadoEm || '').localeCompare(String(a.criadoEm || ''))).slice(0, 8);
    const uns = unidadesContagem(ing);
    let acao = acaoInicial || 'ajuste';
    const corpo = '<div class="stats" style="margin:0"><div class="stat"><div class="r">Tem agora</div><div class="n' + (st.negativo ? ' neg-txt' : '') + '">' + (sd ? C.qtdLegivel(st.qtd, base) : '—') + '</div></div><div class="stat"><div class="r">Validade</div><div class="n" style="font-size:18px">' + (st.validade ? dataDia(st.validade) : '—') + '</div></div></div>' +
      '<div class="seg" role="group" aria-label="O que registrar">' + [['ajuste', 'Contagem'], ['entrada', 'Entrada'], ['perda', 'Perda']].map(a => '<button type="button" data-ac="' + a[0] + '" aria-pressed="' + (a[0] === acao) + '">' + a[1] + '</button>').join('') + '</div>' +
      '<form id="f-est" style="display:flex;flex-direction:column;gap:12px"><p class="mudo" id="exp-est"></p>' +
      '<div class="campo"><span id="rot-qtd">Quanto tem agora</span><div class="linha-campos" style="flex-wrap:nowrap"><input class="entrada num" name="qtd" inputmode="decimal" required aria-labelledby="rot-qtd"><select class="entrada" name="un" style="flex:0 1 auto" aria-label="Unidade">' + uns.map(u => '<option value="' + u.v + '">' + esc(u.r) + '</option>').join('') + '</select></div></div>' +
      '<label class="campo" id="campo-val"><span>Validade (opcional)</span><input class="entrada" type="date" name="validade"></label>' +
      '<label class="campo"><span>Observação</span><input class="entrada" name="obs" placeholder="Opcional"></label>' +
      '<div class="rodape-folha"><button type="button" class="btn sec" data-fechar>Fechar</button><button class="btn" type="submit" id="btn-est">Registrar</button></div></form>' +
      '<hr class="separa"><label class="campo"><span>Estoque mínimo</span><div class="linha-campos" style="flex-wrap:nowrap"><input class="entrada num" id="min-est" inputmode="decimal" value="' + inNum(ing.estoqueMinimo) + '" placeholder="sem mínimo"><span class="mudo" style="flex:0 0 auto;align-self:center">' + base + '</span><button type="button" class="btn sec fino" id="salvar-min" style="flex:0 0 auto">Salvar mínimo</button></div><small>Abaixo disso, o app avisa no Início e aqui no Estoque.</small></label>' +
      htmlHistorico(hist, q => C.qtdLegivel(q, base));
    abrirFolha(ing.nome, corpo, function (d) {
      const f = $('#f-est', d);
      function ajustar() {
        $$('[data-ac]', d).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.ac === acao)));
        $('#rot-qtd', d).textContent = acao === 'ajuste' ? 'Quanto tem agora' : acao === 'entrada' ? 'Quanto entrou' : 'Quanto foi perdido ou descartado';
        $('#exp-est', d).textContent = acao === 'ajuste' ? 'Conte o que tem de fato. O app registra a diferença em relação ao que ele calculava.' : acao === 'entrada' ? 'Use para o que chegou sem ser lançado como compra no Caixa (doação, sobra de outra receita).' : 'Venceu, estragou, caiu no chão.';
        $('#campo-val', d).hidden = acao === 'perda';
        $('#btn-est', d).textContent = acao === 'ajuste' ? 'Registrar contagem' : acao === 'entrada' ? 'Registrar entrada' : 'Registrar perda';
      }
      $$('[data-ac]', d).forEach(b => b.onclick = () => { acao = b.dataset.ac; ajustar(); });
      ajustar();
      f.addEventListener('submit', function (ev) {
        ev.preventDefault();
        const n = C.lerNum(f.qtd.value);
        if (!C.numOk(n) || n < 0 || (acao !== 'ajuste' && n === 0)) { toast('Informe uma quantidade válida.'); return; }
        const fator = uns.find(u => u.v === f.un.value).f, qb = n * fator;
        const atual = sd ? sd.qtd : 0;
        const delta = acao === 'ajuste' ? qb - atual : acao === 'entrada' ? qb : -qb;
        if (acao === 'ajuste' && Math.abs(delta) < 1e-9 && !f.validade.value) { d.close(); toast('Contagem confere com o estoque.'); return; }
        const m = { item: item, nome: ing.nome, motivo: acao, validade: acao === 'perda' ? '' : f.validade.value, obs: f.obs.value.trim() };
        if (Math.abs(delta) < 1e-9) gravarRegistro('estoque', Object.assign({ id: uid(), qtd: 0, data: hoje(), ref: '' }, m));
        else registrarMov(item, delta, acao, m);
        d.close(); toast(acao === 'ajuste' ? 'Contagem registrada.' : acao === 'entrada' ? 'Entrada registrada.' : 'Perda registrada.'); render(false);
      });
      ligarDesfazer(d);
      $('#salvar-min', d).onclick = function () {
        const v = C.lerNum($('#min-est', d).value);
        const c = clone(S.dados.ingredientes[id]); c.estoqueMinimo = C.numOk(v) && v > 0 ? v : null;
        gravarRegistro('ingredientes', c); toast('Mínimo salvo.'); d.close(); render(false);
      };
    });
  }
  function telaContagem() {
    if (modoEstoque() === 'desligado') { location.hash = '#/estoque'; return ''; }
    if (!S.editor || S.editor.tipo !== 'contagem') S.editor = { tipo: 'contagem', sujo: false };
    const ings = lista('ingredientes').sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    const sd = saldos();
    let h = '<div class="cab-pagina"><div class="titulos"><a href="#/estoque" class="link-btn voltar">' + I.voltar + 'Estoque</a><h1>Contar estoque</h1><p class="sub">Preencha só o que contou. Linhas em branco ficam como estão.</p></div></div>';
    h += '<section class="bloco"><div class="grade" style="margin-bottom:10px"><label class="campo"><span>Data da contagem</span><input class="entrada" type="date" id="data-cont" value="' + hoje() + '"></label></div><div class="lista-contagem">' + ings.map(function (ing) {
      const x = sd[C.chaveIng(ing.id)];
      return '<div class="linha-contagem" data-id="' + esc(ing.id) + '"><div class="principal"><b>' + esc(ing.nome) + '</b><small>' + (x ? 'No app: ' + qtdIngTxt(ing, x.qtd) : 'Não contado') + '</small></div>' +
        '<div class="linha-campos" style="flex-wrap:nowrap"><input class="entrada num" data-cont-qtd inputmode="decimal" placeholder="—" aria-label="Quanto tem de ' + esc(ing.nome) + '"><select class="entrada" data-cont-un aria-label="Unidade">' + unidadesContagem(ing).map(u => '<option value="' + u.v + '">' + esc(u.v === 'emb' ? 'embal. (' + C.num(ing.qtdEmbalagem) + ' ' + rotUn(ing.unidade) + ')' : u.r) + '</option>').join('') + '</select></div></div>';
    }).join('') + '</div></section>';
    h += '<div class="barra-salvar"><span class="estado" id="estado-cont">Nada preenchido</span><button type="button" class="btn" data-acao="salvar-contagem">Salvar contagem</button></div>';
    return h;
  }
  function montarContagem() {
    const cont = $('.lista-contagem'); if (!cont) return;
    cont.addEventListener('input', function () {
      const n = $$('[data-cont-qtd]').filter(i => i.value.trim() !== '').length;
      $('#estado-cont').textContent = n ? n + (n === 1 ? ' ingrediente preenchido' : ' ingredientes preenchidos') : 'Nada preenchido';
      if (S.editor && S.editor.tipo === 'contagem') S.editor.sujo = n > 0;
    });
  }

  // ---------- Registros do estoque: histórico com "desfazer" ----------
  function podeDesfazer(m) { return !m.ref && ['ajuste', 'entrada', 'perda', 'vitrine'].indexOf(m.motivo) >= 0; }
  function ondeDesfazer(m) {
    const r = String(m.ref || '');
    if (r.startsWith('compra:')) return 'para desfazer, exclua a compra no Caixa';
    if (r.startsWith('ped:')) return 'volta sozinho se o pedido voltar para confirmado';
    if (r.startsWith('vit:')) return 'para desfazer, desfaça o registro da vitrine';
    if (r.startsWith('venda:')) return 'para desfazer, exclua a venda no Caixa';
    if (r.startsWith('vendaped:')) return 'para desfazer, exclua o pedido do fiado';
    return '';
  }
  function htmlHistorico(movs, fmt) {
    if (!movs.length) return '';
    return '<div><h3>Últimos registros</h3><ul class="historico hist-estoque">' + movs.map(function (m) {
      const qtd = Math.abs(m.qtd) < 1e-9 ? (m.validade ? 'validade ' + dataDia(m.validade) : 'confere') : (m.qtd > 0 ? '+' : '−') + fmt(Math.abs(m.qtd));
      const origem = !podeDesfazer(m) ? ondeDesfazer(m) : '';
      return '<li><span>' + dataDia(m.data) + ', ' + esc(C.MOTIVOS_ESTOQUE[m.motivo] || m.motivo) + (m.obs ? ' <small class="mudo">' + esc(m.obs) + '</small>' : '') + (origem ? '<small class="mudo hist-origem">' + esc(origem) + '</small>' : '') + '</span>' +
        '<span class="hist-dir"><b class="' + (m.qtd < 0 ? 'neg-txt' : m.qtd > 0 ? 'pos-txt' : '') + '">' + qtd + '</b>' + (podeDesfazer(m) ? '<button type="button" class="link-btn mini" data-desfazer="' + esc(m.id) + '" aria-label="Desfazer este registro">desfazer</button>' : '') + '</span></li>';
    }).join('') + '</ul></div>';
  }
  function ligarDesfazer(d, depois) {
    $$('[data-desfazer]', d).forEach(b => b.onclick = async function () {
      const m = S.dados.estoque[b.dataset.desfazer]; if (!m) return;
      const baixa = movsEstoque().filter(x => x.ref === 'vit:' + m.id);
      d.close();
      const ok = await confirmar('Desfazer registro?', 'Desfazer "' + esc(C.MOTIVOS_ESTOQUE[m.motivo] || m.motivo) + '" de ' + dataDia(m.data) + '.' + (baixa.length ? ' Os ingredientes descontados ao fazer esses doces voltam para o estoque.' : ''), 'Desfazer', true);
      if (ok) { excluirRegistro('estoque', m.id); removerMovsRef('vit:' + m.id); toast('Registro desfeito.'); render(false); }
      if (depois) depois();
    });
  }
  // Colocar na vitrine (no modo completo, desconta os ingredientes usados)
  function colocarNaVitrine(chave, n, validade, obs) {
    const [, rid, vid] = chave.split(':');
    const m = registrarMov(chave, n, 'vitrine', { validade: validade || '', obs: obs || '' });
    if (modoEstoque() === 'completo' && m) {
      const bx = C.baixaDoPedido({ itens: [{ tipo: 'rec', receitaId: rid, variacaoId: vid, qtd: n }] }, ctxCalc());
      Object.keys(bx).forEach(id => registrarMov(C.chaveIng(id), -bx[id], 'producao', { ref: 'vit:' + m.id, obs: 'Vitrine: ' + nomeVitrine(chave) }));
    }
    return m;
  }
  function folhaItemVitrine(item, acaoInicial) {
    const sd = saldos()[item], st = C.situacaoEstoque(sd, 0, hoje(), cfg().diasAlertaValidade);
    const hist = movsEstoque().filter(m => m.item === item).sort((a, b) => String(b.data).localeCompare(String(a.data)) || String(b.criadoEm || '').localeCompare(String(a.criadoEm || ''))).slice(0, 10);
    let acao = acaoInicial || 'ajuste';
    const un = q => C.num(q) + (q === 1 ? ' un' : ' un');
    const corpo = '<div class="stats" style="margin:0"><div class="stat"><div class="r">Na vitrine</div><div class="n' + (st.negativo ? ' neg-txt' : '') + '">' + (sd ? C.num(st.qtd) : '0') + '</div></div><div class="stat"><div class="r">Validade</div><div class="n" style="font-size:18px">' + (st.validade ? dataDia(st.validade) : '—') + '</div></div></div>' +
      '<div class="seg" role="group" aria-label="O que registrar">' + [['ajuste', 'Contagem'], ['vitrine', 'Colocar mais'], ['perda', 'Perda']].map(x => '<button type="button" data-ac="' + x[0] + '" aria-pressed="' + (x[0] === acao) + '">' + x[1] + '</button>').join('') + '</div>' +
      '<form id="f-itvit" style="display:flex;flex-direction:column;gap:12px"><p class="mudo" id="exp-itvit"></p>' +
      '<label class="campo"><span id="rot-itvit">Quantas tem agora</span><input class="entrada num" name="qtd" inputmode="decimal" required></label>' +
      '<label class="campo" id="val-itvit"><span>Validade</span><input class="entrada" type="date" name="validade" value="' + esc(st.validade || '') + '"><small id="dica-val"></small></label>' +
      '<label class="campo"><span>Observação</span><input class="entrada" name="obs" placeholder="Opcional"></label>' +
      '<div class="rodape-folha"><button type="button" class="btn sec" data-fechar>Fechar</button><button class="btn" type="submit" id="btn-itvit">Registrar</button></div></form>' +
      htmlHistorico(hist, un);
    abrirFolha(nomeVitrine(item), corpo, function (d) {
      const f = $('#f-itvit', d);
      function ajustar() {
        $$('[data-ac]', d).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.ac === acao)));
        $('#rot-itvit', d).textContent = acao === 'ajuste' ? 'Quantas tem agora' : acao === 'vitrine' ? 'Quantas colocou' : 'Quantas perdeu';
        $('#exp-itvit', d).textContent = acao === 'ajuste' ? 'Conte o que está na vitrine. Use também para mudar a validade (mantenha a quantidade) ou para zerar o item.' :
          acao === 'vitrine' ? 'Unidades novas que você fez para a vitrine.' + (modoEstoque() === 'completo' ? ' Os ingredientes usados saem do estoque.' : '') : 'Venceu, quebrou, foi para degustação.';
        $('#val-itvit', d).hidden = acao === 'perda';
        $('#dica-val', d).textContent = acao === 'ajuste' ? 'A validade do que está na vitrine agora.' : acao === 'vitrine' ? 'A validade destas unidades novas.' : '';
        if (acao === 'ajuste' && f.qtd.value === '' && sd) f.qtd.value = inNum(Math.max(0, st.qtd));
        if (acao !== 'ajuste' && sd && f.qtd.value === inNum(Math.max(0, st.qtd))) f.qtd.value = '';
        $('#btn-itvit', d).textContent = acao === 'ajuste' ? 'Registrar contagem' : acao === 'vitrine' ? 'Colocar na vitrine' : 'Registrar perda';
      }
      $$('[data-ac]', d).forEach(b => b.onclick = () => { acao = b.dataset.ac; ajustar(); });
      ajustar();
      f.addEventListener('submit', function (ev) {
        ev.preventDefault();
        const n = C.lerNum(f.qtd.value), atual = sd ? sd.qtd : 0;
        if (!C.numOk(n) || n < 0 || (acao !== 'ajuste' && n === 0)) { toast('Informe uma quantidade válida.'); return; }
        const validade = acao === 'perda' ? '' : f.validade.value, obs = f.obs.value.trim();
        if (acao === 'ajuste') {
          const delta = n - atual, mudouValidade = validade && validade !== (st.validade || '');
          if (Math.abs(delta) < 1e-9 && !mudouValidade) { d.close(); toast('A contagem confere com a vitrine.'); return; }
          if (Math.abs(delta) < 1e-9) gravarRegistro('estoque', { id: uid(), item: item, nome: nomeVitrine(item), qtd: 0, motivo: 'ajuste', data: hoje(), ref: '', validade: validade, obs: obs });
          else registrarMov(item, delta, 'ajuste', { validade: validade, obs: obs });
          toast(Math.abs(delta) < 1e-9 ? 'Validade atualizada.' : n === 0 ? 'Item zerado na vitrine.' : 'Contagem registrada.');
        } else if (acao === 'vitrine') { colocarNaVitrine(item, n, validade, obs); toast('Colocado na vitrine.'); }
        else { registrarMov(item, -n, 'perda', { obs: obs }); toast('Perda registrada.'); }
        d.close(); render(false);
      });
      ligarDesfazer(d);
    });
  }
  function folhaVitrine(modo, item) {
    const ctx = ctxCalc();
    const titulo = { add: 'Colocar na vitrine', vender: 'Vender da vitrine', perda: 'Perda na vitrine' }[modo];
    let prodSel = '';
    const ops = [];
    if (modo === 'add') {
      lista('receitas').sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR')).forEach(r => (C.calcularReceita(r, ctx).variacoes || []).forEach(v => ops.push({ r: r, v: v })));
      if (!ops.length) { abrirFolha(titulo, '<p>Cadastre uma receita com opções de venda para colocar na vitrine.</p>'); return; }
      prodSel = '<label class="campo"><span>Produto</span><select class="entrada" name="prod">' + ops.map((o, i) => '<option value="' + i + '">' + esc(o.r.nome + ' (' + (o.v.nome || 'opção') + ')') + '</option>').join('') + '</select></label>';
    }
    const sd = item ? saldos()[item] : null;
    let preco = null;
    if (modo === 'vender') {
      const [, rid, vid] = item.split(':'); const r = S.dados.receitas[rid];
      const v = r && (C.calcularReceita(r, ctx).variacoes || []).find(x => x.id === vid);
      preco = v && C.numOk(v.preco) ? C.round2(v.preco) : null;
    }
    const corpo = '<form id="f-vit" style="display:flex;flex-direction:column;gap:12px">' + (item ? '<p><b>' + esc(nomeVitrine(item)) + '</b>' + (sd ? ', ' + C.num(sd.qtd) + ' na vitrine' : '') + '</p>' : '') + prodSel +
      '<label class="campo"><span>Quantidade</span><input class="entrada num" name="qtd" inputmode="decimal" required value="1"></label>' +
      (modo === 'add' ? '<label class="campo"><span>Validade (opcional)</span><input class="entrada" type="date" name="validade"></label>' + (modoEstoque() === 'completo' ? '<p class="mudo">No modo completo, os ingredientes usados saem do estoque.</p>' : '') : '') +
      (modo === 'vender' ? '<div class="linha-campos"><label class="campo"><span>Preço unitário</span><span class="com-prefixo"><i>R$</i><input class="entrada num" name="preco" inputmode="decimal" required value="' + inNum(preco) + '"></span></label><label class="campo"><span>Forma</span><select class="entrada" name="forma">' + Object.keys(C.FORMAS_LANCAMENTO).map(k => '<option value="' + k + '">' + C.FORMAS_LANCAMENTO[k] + '</option>').join('') + '<option value="__fiado__">Fiado (paga depois)</option></select></label></div>' +
        '<label class="campo" id="campo-cli-vit" hidden><span>Cliente</span><select class="entrada" name="cliente"><option value="">Escolha…</option>' + lista('clientes').sort((x, y) => x.nome.localeCompare(y.nome, 'pt-BR')).map(c => '<option value="' + esc(c.id) + '">' + esc(c.nome) + '</option>').join('') + '</select><small>O valor fica em Caixa → A receber até ela pagar.</small></label>' +
        '<p class="mudo" id="tot-vit"></p><p class="mudo" id="nota-vit">A venda entra no Caixa como "Venda de balcão".</p>' : '') +
      '<div class="rodape-folha"><button type="button" class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit">' + { add: 'Colocar na vitrine', vender: 'Registrar venda', perda: 'Registrar perda' }[modo] + '</button></div></form>';
    abrirFolha(titulo, corpo, function (d) {
      const f = $('#f-vit', d);
      function tot() { const t = $('#tot-vit', d); if (t) t.textContent = 'Total: ' + C.brl((C.lerNum(f.qtd.value) || 0) * (C.lerNum(f.preco.value) || 0)); }
      if (modo === 'vender') {
        f.addEventListener('input', tot); tot();
        f.forma.addEventListener('change', function () { const fi = f.forma.value === '__fiado__'; $('#campo-cli-vit', d).hidden = !fi; $('#nota-vit', d).hidden = fi; });
      }
      f.addEventListener('submit', function (ev) {
        ev.preventDefault();
        const n = C.lerNum(f.qtd.value);
        if (!(n > 0)) { toast('Informe a quantidade.'); return; }
        if (modo === 'add') {
          const o = ops[+f.prod.value], chave = C.chaveVitrine(o.r.id, o.v.id);
          colocarNaVitrine(chave, n, f.validade.value, '');
          toast('Colocado na vitrine.');
        } else if (modo === 'vender') {
          const pu = C.lerNum(f.preco.value);
          if (!(pu > 0)) { toast('Informe o preço.'); return; }
          if (f.forma.value === '__fiado__') {
            const cli = S.dados.clientes[f.cliente.value];
            if (!cli) { toast('Escolha o cliente do fiado.'); return; }
            const [, rid, vid] = item.split(':');
            const ped = { id: uid(), clienteId: cli.id, clienteNome: cli.nome, status: 'entregue', tipoEntrega: 'retirada', dataEntrega: hoje(), horaEntrega: '', endereco: '', taxaEntrega: null,
              itens: [{ id: uid(), tipo: 'rec', receitaId: rid, variacaoId: vid, nome: nomeVitrine(item), qtd: n, precoUnit: pu, maoObraUnit: C.maoObraItemPedido({ tipo: 'rec', receitaId: rid, variacaoId: vid }, ctxCalc()) }], desconto: null, formaPagamento: 'pix', pagamentos: [],
              obs: 'Venda da vitrine no fiado', historicoStatus: [{ status: 'entregue', em: agoraISO() }] };
            const cp = calcPed(ped); ped.total = cp.total; ped.pago = 0; ped.restante = cp.total; ped.situacaoPagamento = 'pendente';
            gravarRegistro('pedidos', ped);
            registrarMov(item, -n, 'venda', { ref: 'vendaped:' + ped.id, obs: 'Fiado: ' + cli.nome });
            d.close(); toast('Fiado registrado: ' + C.brl(cp.total) + ' em A receber.'); render(false); return;
          }
          const l = { id: uid(), tipo: 'entrada', data: hoje(), valor: C.round2(n * pu), categoria: fonteCanonica('Venda de balcão', 'entrada'), descricao: C.num(n) + 'x ' + nomeVitrine(item) + ' (vitrine)', forma: f.forma.value, obs: '', itensCompra: [], vitrine: { item: item, qtd: n, maoObraUnit: C.maoObraItemPedido({ tipo: 'rec', receitaId: item.split(':')[1], variacaoId: item.split(':')[2] }, ctx) } };
          gravarRegistro('lancamentos', l);
          registrarMov(item, -n, 'venda', { ref: 'venda:' + l.id });
          toast('Venda registrada: ' + C.brl(l.valor) + ' no Caixa.');
        } else {
          registrarMov(item, -n, 'perda', {});
          toast('Perda registrada.');
        }
        d.close(); render(false);
      });
    });
  }

  // ---------- Início: avisos do estoque ----------
  function blocoEstoqueInicio() {
    if (modoEstoque() === 'desligado') return '';
    const sd = saldos(), cf = cfg(), hj = hoje();
    const baixos = [], validade = [];
    lista('ingredientes').forEach(function (ing) {
      const x = sd[C.chaveIng(ing.id)]; if (!x) return;
      const st = C.situacaoEstoque(x, ing.estoqueMinimo, hj, cf.diasAlertaValidade);
      if (st.abaixoMinimo || st.negativo) baixos.push({ nome: ing.nome, id: ing.id, st: st, txt: st.negativo ? 'negativo' : qtdIngTxt(ing, st.qtd) });
      if (st.vencido || st.venceLogo) validade.push({ nome: ing.nome, id: ing.id, st: st });
    });
    Object.values(sd).filter(x => x.item.startsWith('vit:') && x.qtd > 0).forEach(function (x) {
      const st = C.situacaoEstoque(x, 0, hj, cf.diasAlertaValidade);
      if (st.vencido || st.venceLogo) validade.push({ nome: nomeVitrine(x.item) + ' (vitrine)', vit: true, st: st });
    });
    if (!baixos.length && !validade.length) return '';
    let h = '<section class="bloco"><div class="cab-bloco"><h2>Estoque</h2><a class="link-btn" href="#/estoque">Ver estoque</a></div><div class="lista">';
    validade.sort((a, b) => a.st.diasParaVencer - b.st.diasParaVencer).forEach(v => { h += '<a class="item" href="' + (v.vit ? '#/estoque?v=vitrine' : '#/estoque?f=validade') + '"><div class="principal"><div class="nome">' + esc(v.nome) + '</div></div>' + chipValidade(v.st) + '</a>'; });
    baixos.slice(0, 6).forEach(b => { h += '<a class="item" href="#/estoque?f=minimo"><div class="principal"><div class="nome">' + esc(b.nome) + '</div><div class="det">Tem ' + esc(b.txt) + '</div></div><span class="chip ' + (b.st.negativo ? 'neg' : 'alerta') + '">' + (b.st.negativo ? 'negativo' : 'abaixo do mínimo') + '</span></a>'; });
    h += '</div>' + (baixos.length > 6 ? '<a class="link-btn" href="#/estoque?f=minimo">Ver todos os ' + baixos.length + ' abaixo do mínimo</a>' : '') + '</section>';
    return h;
  }

  const ACOES_ESTOQUE = {
    'estoque-item': function (el) { folhaItemEstoque(el.dataset.id); },
    'vitrine-add': function () { folhaVitrine('add'); },
    'vitrine-vender': function (el) { folhaVitrine('vender', el.dataset.v); },
    'vitrine-perda': function (el) { folhaVitrine('perda', el.dataset.v); },
    'vitrine-editar': function (el) { folhaItemVitrine(el.dataset.v); },
    'salvar-contagem': function () {
      const data = ($('#data-cont') || {}).value || hoje();
      const sd = saldos(); let n = 0;
      $$('.linha-contagem').forEach(function (row) {
        const v = row.querySelector('[data-cont-qtd]').value.trim(); if (v === '') return;
        const qtd = C.lerNum(v); if (!C.numOk(qtd) || qtd < 0) return;
        const ing = S.dados.ingredientes[row.dataset.id];
        const u = unidadesContagem(ing).find(x => x.v === row.querySelector('[data-cont-un]').value);
        const item = C.chaveIng(ing.id), atual = sd[item] ? sd[item].qtd : 0;
        const delta = qtd * u.f - atual;
        if (Math.abs(delta) > 1e-9) registrarMov(item, delta, 'ajuste', { data: data, obs: 'Contagem geral' });
        else if (!sd[item]) gravarRegistro('estoque', { id: uid(), item: item, nome: ing.nome, qtd: 0, motivo: 'ajuste', data: data, ref: '', validade: '', obs: 'Contagem geral' });
        n++;
      });
      if (!n) { toast('Preencha pelo menos um ingrediente.'); return; }
      S.editor = null;
      toast(n === 1 ? '1 ingrediente contado.' : n + ' ingredientes contados.'); ir('#/estoque');
    },
    'modo-estoque': function (el) { const c = clone(cfg()); c.estoqueModo = el.dataset.v; gravarRegistro('config', c); render(false); }
  };

  // ================= Financeiro =================
  const ABAS_CX = [['#/caixa', 'Movimento'], ['#/contas', 'A pagar'], ['#/receber', 'A receber'], ['#/prolabore', 'Pró-labore'], ['#/relatorios', 'Relatórios']];
  let memoMedia = { chave: '', v: null };
  function mediaContas() {
    const chave = (S.versao || 0) + '|' + hoje();
    if (memoMedia.chave !== chave) memoMedia = { chave: chave, v: C.mediaContasFixas(lista('lancamentos'), hoje()) };
    return memoMedia.v;
  }
  function configEfetiva() { return Object.assign({}, S.dados.config.geral || {}, { mediaContasFixas: mediaContas().media }); }
  function varChip(v, inverter) {
    if (!C.numOk(v) || Math.abs(v) < 0.005) return '<span class="chip mudo">igual ao mês anterior</span>';
    const bom = inverter ? v < 0 : v > 0;
    return '<span class="chip ' + (inverter === 'neutro' ? '' : bom ? 'pos' : 'neg') + '">' + (v > 0 ? I.sobe : I.desce) + C.pct(Math.abs(v), 0) + ' vs mês anterior</span>';
  }

  // ---------- Recorrentes: cria a conta do mês ----------
  let memoRec = '';
  function gerarContasRecorrentes(forcar) {
    if (!S.meta.modo) return;
    // Com planilha, só gera depois de sincronizar nesta sessão (para não duplicar uma conta já paga em outro aparelho)
    if (S.meta.modo === 'planilha' && !S.syncOkNestaSessao) return;
    const chave = hoje() + '|' + (S.versao || 0);
    if (!forcar && memoRec === chave) return;
    const novas = C.contasRecorrentesAGerar(lista('recorrencias'), S.dados.contasPagar, hoje());
    novas.forEach(c => gravarRegistro('contasPagar', c));
    memoRec = hoje() + '|' + (S.versao || 0);
  }

  // ---------- Contas a pagar ----------
  function chipConta(st) {
    if (st.status === 'paga') return '<span class="chip pos">' + I.ok + 'paga em ' + dataDia(st.pagaEm) + '</span>';
    if (st.status === 'vencida') return '<span class="chip neg">' + I.alerta + (st.dias === -1 ? 'venceu ontem' : 'venceu há ' + (-st.dias) + ' dias') + '</span>';
    if (st.status === 'hoje') return '<span class="chip alerta">' + I.alerta + 'vence hoje</span>';
    return '<span class="chip ' + (st.dias <= 3 ? 'alerta' : 'mudo') + '">' + (st.dias === 1 ? 'vence amanhã' : 'vence em ' + st.dias + ' dias') + '</span>';
  }
  function cardConta(x) {
    const c = x.c, st = x.st, paga = st.status === 'paga';
    return '<div class="item conta"><div class="principal"><div class="nome">' + esc(c.descricao || 'Conta') + '</div><div class="det">' + esc(c.categoria || '') + ', vence ' + dataDia(c.vencimento) + (c.recorrenciaId ? ', todo mês' : '') + '</div></div>' +
      '<div class="valor">' + C.brl(paga ? st.valorPago : c.valor) + '</div>' +
      '<div class="chips">' + chipConta(st) + '</div>' +
      '<div class="acoes acoes-conta">' + (paga ? '<button type="button" class="btn sec fino" data-acao="desfazer-conta" data-id="' + esc(c.id) + '">Desfazer pagamento</button>' : '<button type="button" class="btn fino" data-acao="pagar-conta" data-id="' + esc(c.id) + '">Pagar</button>') +
      '<button type="button" class="btn sec fino" data-acao="editar-conta" data-id="' + esc(c.id) + '">Editar</button></div></div>';
  }
  function telaContas() {
    gerarContasRecorrentes();
    const hj = hoje(), L = S.dados.lancamentos;
    const contas = lista('contasPagar').map(c => ({ c: c, st: C.statusConta(c, L, hj) }));
    const recs = lista('recorrencias').sort((a, b) => (a.dia || 0) - (b.dia || 0));
    let h = cab('Contas a pagar', 'As recorrentes (aluguel, luz, internet) aparecem sozinhas todo mês. Ao pagar, a saída vai para o Movimento.',
      '<button type="button" class="btn sec" data-acao="nova-recorrente">' + I.mais + 'Conta de todo mês</button><button type="button" class="btn" data-acao="nova-conta">' + I.mais + 'Nova conta</button>') + abas(ABAS_CX, '#/contas');
    if (!contas.length && !recs.length) return h + '<div class="bloco vazio">' + I.emblema + '<h2>Nenhuma conta ainda</h2><p>Cadastre as contas de todo mês uma vez só; o app cria a conta de cada mês e avisa perto do vencimento.</p><div class="acoes" style="justify-content:center"><button type="button" class="btn" data-acao="nova-recorrente">' + I.mais + 'Conta de todo mês</button><button type="button" class="btn sec" data-acao="nova-conta">' + I.mais + 'Conta avulsa</button></div></div>';
    const abertas = contas.filter(x => x.st.status !== 'paga').sort((a, b) => String(a.c.vencimento).localeCompare(String(b.c.vencimento)));
    const vencidas = abertas.filter(x => x.st.status === 'vencida');
    const semana = abertas.filter(x => x.st.status === 'hoje' || (x.st.dias > 0 && x.st.dias <= 7));
    const depois = abertas.filter(x => x.st.dias > 7);
    const pagas = contas.filter(x => x.st.status === 'paga' && x.st.pagaEm >= C.somarDias(hj, -45)).sort((a, b) => String(b.st.pagaEm).localeCompare(String(a.st.pagaEm)));
    const soma = lst => lst.reduce((s, x) => s + (x.c.valor || 0), 0);
    const mesAtual = hj.slice(0, 7), doMes = abertas.filter(x => String(x.c.vencimento).slice(0, 7) === mesAtual);
    h += '<div class="stats stats-cx"><div class="stat"><div class="r">Vencidas</div><div class="n' + (vencidas.length ? ' neg-txt' : '') + '">' + C.brl(soma(vencidas)) + '</div></div>' +
      '<div class="stat"><div class="r">Próximos 7 dias</div><div class="n">' + C.brl(soma(semana)) + '</div></div>' +
      '<div class="stat"><div class="r">Em aberto em ' + C.nomeMes(mesAtual).split(' ')[0] + '</div><div class="n">' + C.brl(soma(doMes)) + '</div></div></div>';
    const bloco = (t, lst, extra) => lst.length ? '<section class="bloco"><h2>' + t + '</h2>' + (extra || '') + '<div class="lista">' + lst.map(cardConta).join('') + '</div></section>' : '';
    h += bloco('Vencidas', vencidas) + bloco('Vencem nos próximos 7 dias', semana) + bloco('Mais adiante', depois);
    if (!abertas.length) h += '<div class="aviso pos" style="margin-bottom:16px">' + I.ok + '<div class="txt">Nenhuma conta em aberto.</div></div>';
    h += bloco('Pagas nos últimos 45 dias', pagas);
    h += '<details class="bloco mais-filtros"' + (recs.length && !contas.length ? ' open' : '') + '><summary><span>Contas de todo mês (' + recs.filter(r => r.ativa !== false).length + ' ativas)</span></summary>' +
      (recs.length ? '<div class="lista">' + recs.map(r => '<button type="button" class="item" data-acao="editar-recorrente" data-id="' + esc(r.id) + '"><div class="principal"><div class="nome">' + esc(r.descricao) + '</div><div class="det">' + esc(r.categoria || '') + ', todo dia ' + r.dia + (r.ativa === false ? ', encerrada' : '') + '</div></div><div class="valor">' + C.brl(r.valor) + '</div></button>').join('') + '</div>' : '<p class="mudo">Nenhuma ainda.</p>') +
      '<button type="button" class="btn sec" style="margin-top:12px" data-acao="nova-recorrente">' + I.mais + 'Conta de todo mês</button></details>';
    return h;
  }
  function campoCategoriaSaida(valor) {
    return '<label class="campo"><span>Categoria</span><input class="entrada" name="categoria" list="dl-cat-conta" value="' + esc(valor || '') + '" placeholder="Ex.: Contas fixas" autocomplete="off"><datalist id="dl-cat-conta">' + fontesConhecidas('saida').map(f => '<option value="' + esc(f) + '">').join('') + '</datalist><small>As de "Contas fixas" entram na média dos custos fixos.</small></label>';
  }
  function folhaConta(id) {
    const orig = id ? S.dados.contasPagar[id] : null;
    const c = orig ? clone(orig) : { id: uid(), descricao: '', categoria: C.FONTE_CONTAS_FIXAS, valor: null, vencimento: hoje(), lancamentoId: '', obs: '' };
    const rec = c.recorrenciaId && S.dados.recorrencias[c.recorrenciaId];
    const corpo = '<form id="f-conta" style="display:flex;flex-direction:column;gap:12px">' +
      (rec ? '<p class="mudo">Conta de ' + esc(C.nomeMes(c.competencia || String(c.vencimento).slice(0, 7))) + ' de "' + esc(rec.descricao) + '". O que mudar aqui vale só para este mês.</p>' : '') +
      '<label class="campo"><span>Descrição</span><input class="entrada" name="descricao" required value="' + esc(c.descricao) + '" placeholder="Ex.: Conserto da batedeira"></label>' +
      campoCategoriaSaida(c.categoria) +
      '<div class="linha-campos"><label class="campo"><span>Valor</span><span class="com-prefixo"><i>R$</i><input class="entrada num" name="valor" inputmode="decimal" required value="' + inNum(c.valor) + '"></span></label>' +
      '<label class="campo"><span>Vencimento</span><input class="entrada" type="date" name="vencimento" required value="' + esc(c.vencimento) + '"></label></div>' +
      '<label class="campo"><span>Observação</span><input class="entrada" name="obs" value="' + esc(c.obs || '') + '" placeholder="Opcional"></label>' +
      '<div class="rodape-folha">' + (orig ? '<button type="button" class="btn perigo" data-excluir>' + I.lixo + 'Excluir</button>' : '') + '<span style="flex:1"></span><button type="button" class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit">Salvar conta</button></div></form>';
    abrirFolha(orig ? 'Editar conta' : 'Nova conta', corpo, function (d) {
      const f = $('#f-conta', d);
      f.addEventListener('submit', function (ev) {
        ev.preventDefault();
        const v = C.lerNum(f.valor.value);
        if (!f.descricao.value.trim()) { f.descricao.focus(); return; }
        if (!(v > 0)) { toast('Informe o valor.'); return; }
        Object.assign(c, { descricao: f.descricao.value.trim(), categoria: fonteCanonica(f.categoria.value, 'saida') || 'Outras saídas', valor: C.round2(v), vencimento: f.vencimento.value, obs: f.obs.value.trim() });
        gravarRegistro('contasPagar', c); d.close(); toast(orig ? 'Conta salva.' : 'Conta cadastrada.'); render(false);
      });
      const ex = $('[data-excluir]', d);
      if (ex) ex.onclick = async function () {
        if (C.statusConta(orig, S.dados.lancamentos, hoje()).status === 'paga') { toast('Esta conta está paga. Desfaça o pagamento antes de excluir.'); return; }
        d.close();
        if (await confirmar('Excluir conta?', 'Excluir <b>' + esc(orig.descricao) + '</b>.' + (orig.recorrenciaId ? ' Ela não volta a ser criada; os próximos meses continuam normais.' : ''), 'Excluir conta', true)) { excluirRegistro('contasPagar', orig.id); toast('Conta excluída.'); render(false); }
      };
    });
  }
  function folhaPagarConta(id) {
    const c = S.dados.contasPagar[id]; if (!c) return;
    const rec = c.recorrenciaId && S.dados.recorrencias[c.recorrenciaId];
    const corpo = '<form id="f-pagar" style="display:flex;flex-direction:column;gap:12px"><p><b>' + esc(c.descricao) + '</b>, vence ' + dataDia(c.vencimento) + '</p>' +
      '<div class="linha-campos"><label class="campo"><span>Valor pago</span><span class="com-prefixo"><i>R$</i><input class="entrada num" name="valor" inputmode="decimal" required value="' + inNum(c.valor) + '"></span>' + (rec && rec.variavel ? '<small>Esta conta varia todo mês: confira o valor.</small>' : '') + '</label>' +
      '<label class="campo"><span>Data do pagamento</span><input class="entrada" type="date" name="data" required value="' + hoje() + '"></label></div>' +
      '<label class="campo"><span>Forma</span><select class="entrada" name="forma">' + Object.keys(C.FORMAS_LANCAMENTO).map(k => '<option value="' + k + '"' + (k === 'boleto' ? ' selected' : '') + '>' + C.FORMAS_LANCAMENTO[k] + '</option>').join('') + '</select></label>' +
      '<p class="mudo">A saída vai para o Movimento do Caixa, na categoria "' + esc(c.categoria) + '".</p>' +
      '<div class="rodape-folha"><button type="button" class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit">Registrar pagamento</button></div></form>';
    abrirFolha('Pagar conta', corpo, function (d) {
      const f = $('#f-pagar', d);
      f.valor.select();
      f.addEventListener('submit', function (ev) {
        ev.preventDefault();
        const v = C.lerNum(f.valor.value);
        if (!(v > 0)) { toast('Informe o valor pago.'); return; }
        const l = { id: uid(), tipo: 'saida', data: f.data.value || hoje(), valor: C.round2(v), categoria: c.categoria, descricao: c.descricao, forma: f.forma.value, obs: '', itensCompra: [], contaId: c.id };
        gravarRegistro('lancamentos', l);
        const nc = clone(c); nc.lancamentoId = l.id; gravarRegistro('contasPagar', nc);
        d.close(); toast('Conta paga. A saída está no Movimento.'); render(false);
      });
    });
  }
  function folhaRecorrente(id) {
    const orig = id ? S.dados.recorrencias[id] : null;
    const r = orig ? clone(orig) : { id: uid(), descricao: '', categoria: C.FONTE_CONTAS_FIXAS, valor: null, dia: 10, inicio: hoje().slice(0, 7), ativa: true, variavel: false };
    const corpo = '<form id="f-rec" style="display:flex;flex-direction:column;gap:12px">' +
      '<label class="campo"><span>Descrição</span><input class="entrada" name="descricao" required value="' + esc(r.descricao) + '" placeholder="Ex.: Aluguel"></label>' +
      campoCategoriaSaida(r.categoria) +
      '<div class="linha-campos"><label class="campo"><span>Valor ' + (orig ? '' : 'de cada mês') + '</span><span class="com-prefixo"><i>R$</i><input class="entrada num" name="valor" inputmode="decimal" required value="' + inNum(r.valor) + '"></span></label>' +
      '<label class="campo"><span>Vence todo dia</span><input class="entrada num" name="dia" inputmode="numeric" required value="' + (r.dia || '') + '"></label></div>' +
      '<label class="chave"><span class="rot">O valor muda todo mês<small>Luz, água, gás: ao pagar, o app pede para conferir o valor</small></span><input type="checkbox" name="variavel"' + (r.variavel ? ' checked' : '') + '></label>' +
      (!orig ? '<p class="aviso" id="aviso-rec" hidden></p>' : '') +
      (!orig ? '<label class="campo"><span>Começa</span><select class="entrada" name="inicio"><option value="' + hoje().slice(0, 7) + '">Neste mês (' + esc(C.nomeMes(hoje().slice(0, 7))) + ')</option><option value="' + C.somarMeses(hoje().slice(0, 7), 1) + '">No mês que vem</option></select></label>' : '') +
      (orig && r.ativa === false ? '<div class="aviso">' + I.alerta + '<div class="txt">Encerrada' + (r.fim ? ' em ' + esc(C.nomeMes(r.fim)) : '') + '. <button type="button" class="link-btn" data-reativar>Reativar</button></div></div>' : '') +
      '<div class="rodape-folha">' + (orig && r.ativa !== false ? '<button type="button" class="btn perigo" data-encerrar>Encerrar</button>' : '') + '<span style="flex:1"></span><button type="button" class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit">Salvar</button></div></form>';
    abrirFolha(orig ? 'Conta de todo mês' : 'Nova conta de todo mês', corpo, function (d) {
      const f = $('#f-rec', d);
      const aviso = $('#aviso-rec', d);
      function conferirDia() {
        if (!aviso) return;
        const dia = Math.round(C.lerNum(f.dia.value)), diaHoje = Number(hoje().slice(8));
        const passou = f.inicio.value === hoje().slice(0, 7) && dia >= 1 && dia < diaHoje;
        aviso.hidden = !passou;
        if (passou) aviso.textContent = 'O dia ' + dia + ' deste mês já passou: a conta de ' + C.nomeMes(hoje().slice(0, 7)).split(' ')[0] + ' vai aparecer como vencida. Se ela já foi paga, escolha "No mês que vem" ou marque como paga depois.';
      }
      if (aviso) { f.addEventListener('input', conferirDia); f.addEventListener('change', conferirDia); conferirDia(); }
      f.addEventListener('submit', function (ev) {
        ev.preventDefault();
        const v = C.lerNum(f.valor.value), dia = Math.round(C.lerNum(f.dia.value));
        if (!f.descricao.value.trim()) { f.descricao.focus(); return; }
        if (!(v > 0)) { toast('Informe o valor.'); return; }
        if (!(dia >= 1 && dia <= 31)) { toast('O dia do vencimento vai de 1 a 31.'); return; }
        Object.assign(r, { descricao: f.descricao.value.trim(), categoria: fonteCanonica(f.categoria.value, 'saida') || C.FONTE_CONTAS_FIXAS, valor: C.round2(v), dia: dia, variavel: f.variavel.checked });
        if (!orig) r.inicio = f.inicio.value;
        gravarRegistro('recorrencias', r);
        // a conta deste mês, se ainda não foi paga, acompanha a mudança
        const doMes = S.dados.contasPagar['rec:' + r.id + ':' + hoje().slice(0, 7)];
        if (orig && doMes && !doMes.excluidoEm && C.statusConta(doMes, S.dados.lancamentos, hoje()).status !== 'paga') {
          const nc = clone(doMes); Object.assign(nc, { descricao: r.descricao, categoria: r.categoria, valor: r.valor, vencimento: C.vencimentoNoMes(nc.competencia, r.dia) }); gravarRegistro('contasPagar', nc);
        }
        gerarContasRecorrentes(true);
        d.close(); toast(orig ? 'Conta de todo mês salva.' : 'Pronto: a conta de cada mês vai aparecer sozinha.'); render(false);
      });
      const enc = $('[data-encerrar]', d);
      if (enc) enc.onclick = async function () {
        d.close();
        if (!await confirmar('Encerrar esta conta?', 'O app para de criar <b>' + esc(orig.descricao) + '</b> a partir do mês que vem. As contas já criadas continuam.', 'Encerrar', true)) return;
        const nr = clone(orig); nr.ativa = false; nr.fim = hoje().slice(0, 7); gravarRegistro('recorrencias', nr); toast('Conta encerrada.'); render(false);
      };
      const re = $('[data-reativar]', d);
      if (re) re.onclick = function () { const nr = clone(orig); nr.ativa = true; delete nr.fim; gravarRegistro('recorrencias', nr); gerarContasRecorrentes(true); d.close(); toast('Reativada.'); render(false); };
    });
  }

  // ---------- A receber (fiado) ----------
  function telaReceber() {
    const ar = C.aReceber(lista('pedidos'), ctxCalc(), nomeCliente);
    S.gruposReceber = ar.grupos;
    let h = cab('A receber', 'Fiado e valores em aberto dos pedidos, por cliente. Ao registrar o pagamento no pedido, ele entra no Movimento.') + abas(ABAS_CX, '#/receber');
    h += '<div class="stats stats-cx" style="grid-template-columns:repeat(2,minmax(0,1fr))"><div class="stat"><div class="r">Entregue, falta pagar</div><div class="n' + (ar.entregue > 0 ? ' neg-txt' : '') + '">' + C.brl(ar.entregue) + '</div></div>' +
      '<div class="stat" style="grid-column:auto"><div class="r">De pedidos ainda não entregues</div><div class="n">' + C.brl(ar.aberto) + '</div></div></div>';
    if (!ar.grupos.length) return h + '<div class="bloco vazio">' + I.emblema + '<h2>Ninguém devendo</h2><p>Quando um pedido é entregue sem o pagamento completo, ou uma venda da vitrine fica no fiado, aparece aqui.</p></div>';
    h += ar.grupos.map(function (g, i) {
      const cli = g.clienteId && S.dados.clientes[g.clienteId];
      return '<section class="bloco"><div class="cab-bloco"><h2>' + esc(g.nome) + '</h2><b class="' + (g.entregue > 0 ? 'neg-txt' : '') + '">' + C.brl(g.total) + '</b></div>' +
        (g.entregue > 0 && g.entregue < g.total ? '<p class="mudo" style="margin:-4px 0 8px">' + C.brl(g.entregue) + ' de pedidos já entregues</p>' : '') +
        '<div class="lista">' + g.itens.map(it => '<a class="item" href="#/pedido/' + encodeURIComponent(it.pedidoId) + '"><div class="principal"><div class="nome">Pedido de ' + esc(dataCurta(it.data)) + '</div><div class="det">' + esc(it.resumo) + '</div></div><div class="valor">falta ' + C.brl(it.restante) + '<small>de ' + C.brl(it.total) + '</small></div><div class="chips">' + chipStatus(it.status) + '</div></a>').join('') + '</div>' +
        '<div class="acoes" style="margin-top:12px">' + (g.entregue > 0 ? '<button type="button" class="btn fino" data-acao="cobrar" data-i="' + i + '">' + I.mensagem + 'Cobrar no WhatsApp</button>' : '') + (cli ? '<a class="btn sec fino" href="#/cliente/' + encodeURIComponent(cli.id) + '">Ver cliente</a>' : '') + '</div></section>';
    }).join('');
    return h;
  }
  function folhaCobranca(g) {
    const cli = g.clienteId && S.dados.clientes[g.clienteId];
    const tel = C.telefoneWhats(cli && cli.telefone);
    const corpo = (!tel ? '<div class="aviso">' + I.alerta + '<div class="txt">Cliente sem telefone com DDD. O WhatsApp vai pedir para escolher o contato.</div></div>' : '') +
      '<label class="campo"><span>Texto (pode editar antes de enviar)</span><textarea class="entrada" id="txt-cob" rows="11"></textarea></label>' +
      '<div class="rodape-folha"><button type="button" class="btn sec" id="copiar-cob">' + I.copiar + 'Copiar texto</button><a class="btn" id="abrir-cob" target="_blank" rel="noopener">' + I.mensagem + 'Abrir no WhatsApp</a></div>';
    abrirFolha('Cobrar ' + String(g.nome || '').split(' ')[0], corpo, function (d) {
      const ta = $('#txt-cob', d), a = $('#abrir-cob', d);
      ta.value = C.textoCobranca(g, configEfetiva(), hoje());
      const link = () => { a.href = 'https://wa.me/' + tel + '?text=' + encodeURIComponent(ta.value); };
      ta.addEventListener('input', link); link();
      $('#copiar-cob', d).onclick = () => copiarTexto(ta.value);
    });
  }

  // ---------- Pró-labore e reserva ----------
  function calcProLabore() { return C.proLaboreDisponivel(lista('pedidos'), lista('lancamentos'), ctxCalc(), nomeCliente); }
  function dinheiroNoCaixa() {
    const saldo = C.resumoCaixa(movsTodos()).saldo;
    const res = C.resumoReserva(lista('lancamentos'), configEfetiva(), hoje().slice(0, 7), 0).saldo;
    return C.round2(saldo - res);
  }
  function telaProLabore() {
    const mes = hoje().slice(0, 7), cf = cfg();
    const lim = C.limitesMes(mes);
    const pl = calcProLabore();
    const neg = pl.disponivel < -0.004;
    const caixa = dinheiroNoCaixa();
    let h = cab('Pró-labore e reserva', 'Quanto do seu trabalho as vendas já pagaram, o que você retirou e o que guardar.') + abas(ABAS_CX, '#/prolabore');
    h += '<section class="bloco"><h2>Pró-labore</h2>' +
      '<div class="destaque-reserva destaque-pl"><div class="r">Disponível para retirar</div><div class="v ' + (neg ? 'neg-txt' : 'pos-txt') + '">' + (neg ? '−' : '') + C.brl(Math.abs(pl.disponivel)) + '</div>' +
      (neg ? '<div class="r neg-txt">Você retirou ' + C.brl(-pl.disponivel) + ' a mais do que as vendas liberaram até agora.</div>' : '') + '</div>' +
      '<dl class="resultados" style="margin-top:12px"><div><dt>Liberado pelas vendas</dt><dd>' + C.brl(pl.liberado) + '</dd></div>' +
      (pl.estimado > 0 ? '<div><dt>Estimado (vendas sem produto)</dt><dd>' + C.brl(pl.estimado) + '</dd></div>' : '') +
      '<div><dt>Já retirado</dt><dd>' + C.brl(pl.retirado) + '</dd></div><div><dt>A liberar</dt><dd>' + C.brl(pl.aLiberar) + '</dd></div></dl>' +
      '<p class="mudo" style="margin-top:8px">"A liberar" é a sua parte em pedidos ainda não entregues ou não pagos. Entra no disponível quando o pedido for entregue e pago.</p>' +
      (pl.disponivel > 0.004 && caixa < pl.disponivel ? '<div class="aviso" style="margin-top:12px">' + I.alerta + '<div class="txt">O caixa tem ' + C.brl(Math.max(0, caixa)) + ' agora, sem contar a reserva. Parte do pró-labore liberado pode estar em ingredientes, estoque ou contas já pagas.</div></div>' : '') +
      '<div class="acoes" style="margin-top:14px"><button type="button" class="btn" data-acao="retirar">' + I.mais + 'Registrar retirada</button></div>' +
      '<details class="ajuda"><summary>Como é calculado?</summary><div>' +
      '<p>Cada preço já traz uma parte para o seu trabalho: a mão de obra da receita (valor da hora × tempo de produção, incluindo o das receitas usadas dentro de outras). Essa parte é liberada quando o pedido é entregue, na proporção do que foi pago. Nas vendas da vitrine, na hora da venda.</p>' +
      (pl.porProduto.length ? '<ul class="historico" style="margin-top:8px">' + pl.porProduto.slice(0, 10).map(x => '<li><span>' + esc(x.nome) + ' <small class="mudo">' + C.brl(x.maoObraUnit) + (C.numOk(x.pct) ? ' (' + C.pct(x.pct, 0) + ' do preço)' : '') + ' × ' + C.num(x.qtd) + '</small></span><b>' + C.brl(x.liberado) + '</b></li>').join('') + '</ul>' : '<p class="mudo">Ainda não há vendas entregues com produto.</p>') +
      (pl.receitaAvulsa > 0 ? '<p style="margin-top:8px">Vendas lançadas no Caixa sem produto (balcão, iFood): ' + C.brl(pl.receitaAvulsa) + ' × ' + C.pct(pl.pctMedio, 1) + ' = ' + C.brl(pl.estimado) + '. A porcentagem é a média ' + (pl.pctOrigem === 'vendas' ? 'das vendas com produto' : pl.pctOrigem === 'receitas' ? 'das receitas cadastradas' : '(sem dados ainda)') + '. "Outras entradas" não contam como venda.</p>' : '') +
      '<p style="margin-top:8px">O valor da hora fica guardado em cada venda: mudar o valor em Ajustes vale para as próximas vendas, não muda o que já foi vendido.</p></div></details></section>';
    const plDesejado = C.proLaboreDesejado(configEfetiva());
    const retMes = pl.retiradas.filter(l => l.data >= lim.de && l.data <= lim.ate);
    const totMes = retMes.reduce((s, l) => s + l.valor, 0);
    h += '<section class="bloco"><div class="cab-bloco"><h2>Retiradas</h2><span class="mudo">em ' + esc(C.nomeMes(mes).split(' ')[0]) + ': <b>' + C.brl(totMes) + '</b></span></div>' +
      (C.numOk(plDesejado) && plDesejado > 0 ? '<div class="meta-barra"><i style="width:' + Math.min(100, totMes / plDesejado * 100).toFixed(1) + '%"></i></div><small class="mudo">' + C.pct(totMes / plDesejado, 0) + ' do salário desejado de ' + C.brl(plDesejado) + ' (Ajustes → Mão de obra)</small>' : '') +
      (pl.retiradas.length ? '<div class="lista" style="margin-top:12px">' + pl.retiradas.slice(0, 20).map(l => '<a class="item" href="#/lancamento/' + encodeURIComponent(l.id) + '"><div class="principal"><div class="nome">' + esc(dataCurta(l.data)) + '</div><div class="det">' + esc(l.descricao && l.descricao !== C.FONTE_PROLABORE ? l.descricao : 'Pró-labore') + (l.forma ? ', ' + esc(formaTxt(l.forma)) : '') + '</div></div><div class="valor">' + C.brl(l.valor) + '</div></a>').join('') + '</div>' + (pl.retiradas.length > 20 ? '<p class="mudo" style="margin-top:8px">Mostrando as 20 mais recentes. Todas estão no Movimento, categoria Pró-labore.</p>' : '')
        : '<p class="mudo" style="margin-top:8px">Nenhuma retirada registrada ainda.</p>') + '</section>';
    h += telaReservaBloco(mes, cf);
    return h;
  }
  function folhaRetirada() {
    const pl = calcProLabore(), disp = pl.disponivel;
    const corpo = '<div class="destaque-reserva"><div class="r">Disponível agora</div><div class="v ' + (disp < 0 ? 'neg-txt' : 'pos-txt') + '">' + (disp < 0 ? '−' : '') + C.brl(Math.abs(disp)) + '</div></div>' +
      '<form id="f-ret" style="display:flex;flex-direction:column;gap:12px"><div class="linha-campos"><label class="campo"><span>Valor da retirada</span><span class="com-prefixo"><i>R$</i><input class="entrada num" name="valor" inputmode="decimal" required></span></label>' +
      '<label class="campo"><span>Data</span><input class="entrada" type="date" name="data" value="' + hoje() + '"></label></div>' +
      '<label class="campo"><span>Forma</span><select class="entrada" name="forma">' + Object.keys(C.FORMAS_LANCAMENTO).map(k => '<option value="' + k + '"' + (k === 'pix' ? ' selected' : '') + '>' + C.FORMAS_LANCAMENTO[k] + '</option>').join('') + '</select></label>' +
      '<label class="campo"><span>Observação</span><input class="entrada" name="obs" placeholder="Opcional"></label>' +
      '<div class="aviso neg" id="aviso-ret" hidden></div>' +
      '<div class="rodape-folha"><button type="button" class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit">Registrar retirada</button></div></form>';
    abrirFolha('Retirada de pró-labore', corpo, function (d) {
      const f = $('#f-ret', d), av = $('#aviso-ret', d);
      f.valor.focus();
      function conferir() {
        const v = C.lerNum(f.valor.value);
        const passa = v > 0 && v > disp + 0.004;
        av.hidden = !passa;
        if (passa) av.innerHTML = I.alerta + '<div class="txt">Passa ' + C.brl(v - Math.max(0, disp)) + ' do disponível. Esse valor sairia do dinheiro da doceria (ingredientes, contas, reserva), não do que as vendas já pagaram pelo seu trabalho.</div>';
      }
      f.addEventListener('input', conferir);
      f.addEventListener('submit', async function (ev) {
        ev.preventDefault();
        const v = C.lerNum(f.valor.value);
        if (!(v > 0)) { toast('Informe o valor.'); return; }
        if (v > disp + 0.004) {
          const ok = await confirmar('Retirar mais do que o disponível?', 'O disponível é ' + (disp < 0 ? '−' : '') + C.brl(Math.abs(disp)) + '. Retirando ' + C.brl(v) + ', você fica ' + C.brl(v - disp) + ' acima do que as vendas liberaram até agora.', 'Retirar mesmo assim', true);
          if (!ok) return;
        }
        gravarRegistro('lancamentos', { id: uid(), tipo: 'saida', data: f.data.value || hoje(), valor: C.round2(v), categoria: C.FONTE_PROLABORE, descricao: f.obs.value.trim() || C.FONTE_PROLABORE, forma: f.forma.value, obs: '', itensCompra: [] });
        d.close();
        const novo = calcProLabore().disponivel;
        toast('Retirada registrada. Disponível agora: ' + (novo < 0 ? '−' : '') + C.brl(Math.abs(novo)) + '.');
        render(false);
      });
    });
  }
  // Retirada lançada pelo Movimento: mesmo aviso
  async function conferirRetiradaNoLancamento(l) {
    if (l.tipo !== 'saida' || C.semAcento(fonteCanonica(l.categoria, 'saida')) !== C.semAcento(C.FONTE_PROLABORE)) return true;
    const orig = S.dados.lancamentos[l.id];
    const jaContava = orig && !orig.excluidoEm && C.semAcento(orig.categoria) === C.semAcento(C.FONTE_PROLABORE) ? orig.valor : 0;
    const disp = calcProLabore().disponivel + jaContava, v = totalLancamento(l);
    if (v <= jaContava + 0.004) return true; // editar sem aumentar o valor não pede confirmação
    if (!(v > disp + 0.004)) return true;
    return confirmar('Retirar mais do que o disponível?', 'O pró-labore disponível é ' + (disp < 0 ? '−' : '') + C.brl(Math.abs(disp)) + '. Com esta retirada de ' + C.brl(v) + ', você fica ' + C.brl(v - disp) + ' acima do que as vendas liberaram.', 'Salvar mesmo assim', true);
  }
  function telaReservaBloco(mes, cf) {
    const lim = C.limitesMes(mes);
    const rm = C.resumoCaixa(C.filtrarMovimentos(movsTodos(), lim));
    const rv = C.resumoReserva(lista('lancamentos'), configEfetiva(), mes, rm.entradas);
    let h = '';
    h += '<section class="bloco" id="reserva"><h2>Reserva</h2><p class="explica">O app não mexe no seu dinheiro: ele calcula quanto separar. Quando transferir para a poupança ou guardar o valor, registre aqui.</p>' +
      '<div class="destaque-reserva"><div class="r">Guardado até hoje</div><div class="v">' + C.brl(rv.saldo) + '</div>' +
      (rv.meta ? '<div class="meta-barra" role="progressbar" aria-label="Quanto da meta da reserva já foi guardado" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(Math.min(100, rv.saldo / rv.meta * 100)) + '"><i style="width:' + Math.min(100, Math.max(0, rv.saldo / rv.meta * 100)).toFixed(1) + '%"></i></div><div class="r">' + C.pct(Math.max(0, rv.saldo) / rv.meta, 0) + ' da meta de ' + C.brl(rv.meta) + '</div>' : '') + '</div>' +
      '<h3 style="margin-top:18px">Em ' + esc(C.nomeMes(mes).split(' ')[0]) + '</h3><dl class="resultados" style="margin-top:8px"><div><dt>Entradas do mês</dt><dd>' + C.brl(rm.entradas) + '</dd></div><div><dt>Separar (' + C.num(rv.pct) + '%)</dt><dd>' + C.brl(rv.sugeridoMes) + '</dd></div><div><dt>Já guardado</dt><dd>' + C.brl(rv.guardadoMes) + '</dd></div><div class="' + (rv.faltaGuardar > 0 ? 'neg' : 'pos') + '"><dt>Falta guardar</dt><dd>' + C.brl(rv.faltaGuardar) + '</dd></div></dl>' +
      '<div class="acoes" style="margin-top:14px">' + (rv.faltaGuardar > 0 ? '<button type="button" class="btn" data-acao="reserva-mov" data-v="guardar">Guardei ' + C.brl(rv.faltaGuardar) + '</button>' : '<button type="button" class="btn sec" data-acao="reserva-mov" data-v="guardar">' + I.mais + 'Guardar um valor</button>') + '<button type="button" class="btn sec" data-acao="reserva-mov" data-v="usar">Usar da reserva</button></div>' +
      '<div class="grade" style="margin-top:16px"><label class="campo"><span>Separar de cada entrada</span><span class="com-prefixo"><input class="entrada num" data-cfg="reservaPct" data-n inputmode="decimal" value="' + inNum(cf.reservaPct) + '"><i class="dir">%</i></span></label>' +
      '<label class="campo"><span>Meta da reserva (opcional)</span><span class="com-prefixo"><i>R$</i><input class="entrada num" data-cfg="reservaMeta" data-n inputmode="decimal" value="' + inNum(cf.reservaMeta) + '" placeholder="sem meta"></span></label></div>' +
      (rv.historico.length ? '<h3 style="margin-top:18px">Histórico</h3><ul class="historico">' + rv.historico.slice(0, 12).map(l => '<li><span>' + dataDia(l.data) + ', ' + (l.valor > 0 ? 'guardado' : 'usado') + (l.descricao && l.descricao !== 'Reserva' ? ' <small class="mudo">' + esc(l.descricao) + '</small>' : '') + '</span><span><b class="' + (l.valor > 0 ? 'pos-txt' : 'neg-txt') + '">' + (l.valor > 0 ? '+' : '−') + C.brl(Math.abs(l.valor)) + '</b><button type="button" class="link-btn mini" data-acao="reserva-rem" data-id="' + esc(l.id) + '" aria-label="Remover registro">remover</button></span></li>').join('') + '</ul>' : '') + '</section>';
    return h;
  }
  function folhaReserva(tipo) {
    const mes = hoje().slice(0, 7);
    const rm = C.resumoCaixa(C.filtrarMovimentos(movsTodos(), C.limitesMes(mes)));
    const rv = C.resumoReserva(lista('lancamentos'), configEfetiva(), mes, rm.entradas);
    const guardar = tipo === 'guardar';
    const corpo = '<form id="f-res" style="display:flex;flex-direction:column;gap:12px"><div class="linha-campos"><label class="campo"><span>Valor</span><span class="com-prefixo"><i>R$</i><input class="entrada num" name="valor" inputmode="decimal" required value="' + (guardar && rv.faltaGuardar > 0 ? inNum(rv.faltaGuardar) : '') + '"></span></label><label class="campo"><span>Data</span><input class="entrada" type="date" name="data" value="' + hoje() + '"></label></div>' +
      '<label class="campo"><span>' + (guardar ? 'Onde guardou (opcional)' : 'Para quê (opcional)') + '</span><input class="entrada" name="obs" placeholder="' + (guardar ? 'Ex.: poupança' : 'Ex.: forno novo') + '"></label>' +
      (!guardar ? '<p class="mudo">Disponível na reserva: ' + C.brl(rv.saldo) + '.</p>' : '') +
      '<div class="rodape-folha"><button type="button" class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit">' + (guardar ? 'Registrar que guardei' : 'Registrar uso') + '</button></div></form>';
    abrirFolha(guardar ? 'Guardar na reserva' : 'Usar da reserva', corpo, function (d) {
      const f = $('#f-res', d);
      f.addEventListener('submit', function (ev) {
        ev.preventDefault();
        const v = C.lerNum(f.valor.value);
        if (!(v > 0)) { toast('Informe o valor.'); return; }
        if (!guardar && v > rv.saldo + 0.004 && !confirm('O valor passa do que está na reserva (' + C.brl(rv.saldo) + '). Registrar mesmo assim?')) return;
        gravarRegistro('lancamentos', { id: uid(), tipo: 'reserva', data: f.data.value || hoje(), valor: C.round2(guardar ? v : -v), categoria: 'Reserva', descricao: f.obs.value.trim() || 'Reserva', forma: '', obs: '', itensCompra: [] });
        d.close(); toast(guardar ? 'Registrado na reserva.' : 'Uso da reserva registrado.'); render(false);
      });
    });
  }

  // ---------- Relatórios ----------
  function telaRelatorios() {
    const mes = S.relMes || (S.relMes = hoje().slice(0, 7));
    const nMeses = S.relN || 6;
    const ctx = ctxCalc(), cf = cfg();
    const dados = { pedidos: lista('pedidos'), lancamentos: lista('lancamentos'), nome: nomeCliente };
    const at = C.resumoMes(mes, dados, ctx), an = C.resumoMes(C.somarMeses(mes, -1), dados, ctx);
    const lim = C.limitesMes(mes), mesCorrente = mes === hoje().slice(0, 7);
    const prods = C.produtosVendidos(dados.pedidos, dados.lancamentos, ctx, lim.de, lim.ate);
    S.relRanking = prods;
    let h = cab('Relatórios', 'Como a doceria foi no mês, comparado com o anterior.') + abas(ABAS_CX, '#/relatorios');
    h += '<div class="cal-cab" style="margin-bottom:14px"><button type="button" class="btn-icone" data-acao="rel-mes" data-v="-1" aria-label="Mês anterior">' + I.voltar + '</button><h2>' + esc(C.nomeMes(mes).charAt(0).toUpperCase() + C.nomeMes(mes).slice(1)) + '</h2><button type="button" class="btn-icone" data-acao="rel-mes" data-v="1" aria-label="Próximo mês"' + (mesCorrente ? ' disabled' : '') + '>' + I.seta + '</button></div>';
    if (mesCorrente) h += '<p class="mudo" style="margin:-6px 0 14px;text-align:center">Mês em andamento: os números ainda vão mudar.</p>';
    const card = (rot, v, vAnt, inverter, extra) => '<div class="stat"><div class="r">' + rot + '</div><div class="n' + (v < 0 ? ' neg-txt' : '') + '">' + (v < 0 ? '−' : '') + C.brl(Math.abs(v)) + '</div>' + (extra || '') + varChip(C.variacaoPct(v, vAnt), inverter) + '</div>';
    h += '<div class="stats stats-rel">' + card('Recebido', at.recebido, an.recebido) + card('Despesas', at.despesas, an.despesas, true, '<small class="mudo">sem o pró-labore</small>') + card('Lucro da doceria', at.lucro, an.lucro, false, '<small class="mudo">recebido − despesas</small>') +
      card('Pró-labore', at.retiradas, an.retiradas, 'neutro') + card('Guardado na reserva', at.guardado, an.guardado) +
      '<div class="stat"><div class="r">Pedidos entregues</div><div class="n">' + at.pedidosEntregues + '</div>' + (at.ticketMedio ? '<small class="mudo">' + C.brl(at.ticketMedio) + ' por pedido, em média</small>' : '') + varChip(C.variacaoPct(at.pedidosEntregues, an.pedidosEntregues)) + '</div></div>';

    // Metas
    const metaF = C.numOk(cf.metaFaturamento) && cf.metaFaturamento > 0 ? cf.metaFaturamento : null, metaL = C.numOk(cf.metaLucro) && cf.metaLucro > 0 ? cf.metaLucro : null;
    const barraMeta = function (rot, feito, meta) {
      const proj = mesCorrente ? C.projecaoMes(feito, mes, hoje()) : null;
      const p = Math.max(0, feito / meta);
      return '<div class="linha-meta"><div class="cab-bloco" style="margin:0"><b>' + rot + '</b><span>' + C.brl(feito) + ' de ' + C.brl(meta) + '</span></div><div class="meta-barra"><i style="width:' + Math.min(100, p * 100).toFixed(1) + '%"></i></div>' +
        '<small class="mudo">' + C.pct(p, 0) + ' da meta' + (C.numOk(proj) ? '. No ritmo atual, fecha o mês em ' + C.brl(proj) + (proj >= meta ? ' (bate a meta)' : ' (faltariam ' + C.brl(meta - proj) + ')') : '') + '</small></div>';
    };
    h += '<section class="bloco"><div class="cab-bloco"><h2>Metas do mês</h2><button type="button" class="btn sec fino" data-acao="definir-metas">' + (metaF || metaL ? 'Mudar metas' : 'Definir metas') + '</button></div>' +
      (metaF || metaL ? (metaF ? barraMeta('Recebido', at.recebido, metaF) : '') + (metaL ? barraMeta('Lucro da doceria', at.lucro, metaL) : '') : '<p class="mudo">Defina quanto quer receber e lucrar por mês; o app mostra o progresso e se o ritmo atual chega lá.</p>') + '</section>';

    // Ponto de equilíbrio
    let base = prods, rotBase = 'deste mês';
    if (!prods.some(p => p.receita > 0)) { const l3 = { de: C.limitesMes(C.somarMeses(mes, -3)).de, ate: C.limitesMes(C.somarMeses(mes, -1)).ate }; base = C.produtosVendidos(dados.pedidos, dados.lancamentos, ctx, l3.de, l3.ate); rotBase = 'dos 3 meses anteriores'; }
    const vendas = base.reduce((s, p) => s + p.receita, 0), cv = base.reduce((s, p) => s + p.custoVariavel, 0);
    const fixos = C.totalFixos(cf), pl = C.proLaboreDesejado(configEfetiva()) || 0;
    const pe = C.pontoEquilibrio(fixos, pl, vendas, cv);
    const vendidoMes = prods.reduce((s, p) => s + p.receita, 0);
    h += '<section class="bloco"><h2>Ponto de equilíbrio</h2>' + (pe.valor
      ? '<p>Para pagar as contas fixas (' + C.brl(fixos) + ') e o seu pró-labore (' + C.brl(pl) + '), a doceria precisa vender cerca de <b>' + C.brl(pe.valor) + ' por mês</b>.</p>' +
        '<div class="meta-barra" style="margin-top:12px"><i style="width:' + Math.min(100, vendidoMes / pe.valor * 100).toFixed(1) + '%"></i></div><small class="mudo">Vendido neste mês: ' + C.brl(vendidoMes) + ' (' + C.pct(vendidoMes / pe.valor, 0) + ')</small>' +
        '<details class="ajuda"><summary>Como é feita essa conta?</summary><div><p>De cada R$ 100 vendidos ' + rotBase + ', cerca de ' + C.brl(pe.margemContribuicao * 100) + ' sobram depois de ingredientes, perdas e embalagens. É a margem de contribuição (' + C.pct(pe.margemContribuicao, 0) + ').</p><p>Dividindo o que precisa ser coberto todo mês (' + C.brl(pe.custosACobrir) + ') por essa margem, chega-se ao valor de vendas que empata as contas. As contas fixas vêm de Ajustes → Custos fixos (' + (cf.custosFixosFonte === 'contas' && C.numOk(cf.mediaContasFixas) ? 'média das contas pagas' : 'valores preenchidos à mão') + ').</p></div></details>'
      : '') + (pe.valor && !(fixos > 0) && C.numOk(mediaContas().media) ? '<div class="aviso" style="margin-top:12px">' + I.alerta + '<div class="txt">Os custos fixos preenchidos à mão estão em R$ 0,00. Pelas contas pagas, a média é ' + C.brl(mediaContas().media) + ' por mês. <a href="#/ajustes#fixos">Escolher em Ajustes</a></div></div>' : '') + (pe.valor ? '' : '<p class="mudo">' + (!(fixos > 0) && !(pl > 0) ? 'Preencha os custos fixos e o pró-labore em Ajustes para calcular.' : 'Precisa de vendas entregues (pedidos ou vitrine) para calcular a margem.') + '</p>') + '</section>';

    // Mais vendidos e mais lucrativos
    const topQ = prods.slice().sort((a, b) => b.qtd - a.qtd).slice(0, 8), topL = prods.filter(p => C.numOk(p.lucro)).sort((a, b) => b.lucro - a.lucro).slice(0, 8);
    const ranking = (t, lst, val, fmt, cls) => { const mx = Math.max(0.01, ...lst.map(val)); return '<section class="bloco"><h2>' + t + '</h2>' + (lst.length ? '<div class="por-fonte">' + lst.map(p => '<div class="linha-fonte" style="cursor:default"><span class="nome-f">' + esc(p.nome) + '</span><span class="val-f">' + fmt(p) + '</span><span class="barra-f"><i class="' + cls + '" style="width:' + (Math.max(0, val(p)) / mx * 100).toFixed(1) + '%"></i></span></div>').join('') + '</div>' : '<p class="mudo">Nenhuma venda entregue neste mês.</p>') + '</section>'; };
    h += '<div class="grade-fontes">' + ranking('Mais vendidos', topQ, p => p.qtd, p => C.num(p.qtd) + ' <small>' + C.brl(p.receita) + '</small>', 'b-ouro') +
      ranking('Mais lucrativos', topL, p => p.lucro, p => C.brl(p.lucro) + ' <small>' + C.num(p.qtd) + ' vendidos</small>', 'b-ent') + '</div>';

    // Comparação entre meses
    const serie = []; for (let i = nMeses - 1; i >= 0; i--) serie.push(C.resumoMes(C.somarMeses(mes, -i), dados, ctx));
    S.relSerie = serie;
    const mx = Math.max(0.01, ...serie.map(r => Math.max(r.recebido, r.despesas)));
    h += '<section class="bloco"><div class="cab-bloco"><h2>Comparação entre meses</h2><div class="seg" role="group" aria-label="Quantos meses"><button type="button" data-acao="rel-n" data-v="6" aria-pressed="' + (nMeses === 6) + '">6 meses</button><button type="button" data-acao="rel-n" data-v="12" aria-pressed="' + (nMeses === 12) + '">12 meses</button></div></div>' +
      '<div class="legenda" style="margin:6px 0"><span><i class="b-ent"></i>Recebido</span><span><i class="b-sai"></i>Despesas</span></div>' +
      '<div class="graf graf-meses">' + serie.map(r => '<div class="graf-col" title="' + esc(C.nomeMes(r.mes) + ': recebido ' + C.brl(r.recebido) + ', despesas ' + C.brl(r.despesas) + ', lucro ' + C.brl(r.lucro)) + '"><span class="graf-barras"><i class="b-ent" style="height:' + (r.recebido / mx * 100).toFixed(1) + '%"></i><i class="b-sai" style="height:' + (r.despesas / mx * 100).toFixed(1) + '%"></i></span><span class="graf-rot">' + esc(C.nomeMes(r.mes, true).split('/')[0]) + '</span></div>').join('') + '</div>' +
      '<div class="tabela-rola" tabindex="0" role="region" aria-label="Tabela dos meses (role para o lado)"><table class="tabela-meses"><thead><tr><th scope="col">Mês</th><th scope="col">Recebido</th><th scope="col">Despesas</th><th scope="col">Lucro</th><th scope="col">Pró-labore</th><th scope="col">Pedidos</th></tr></thead><tbody>' +
      serie.slice().reverse().map(r => '<tr' + (r.mes === mes ? ' class="atual"' : '') + '><th scope="row">' + esc(C.nomeMes(r.mes, true)) + '</th><td>' + C.brl(r.recebido) + '</td><td>' + C.brl(r.despesas) + '</td><td class="' + (r.lucro < 0 ? 'neg-txt' : '') + '">' + (r.lucro < 0 ? '−' : '') + C.brl(Math.abs(r.lucro)) + '</td><td>' + C.brl(r.retiradas) + '</td><td>' + r.pedidosEntregues + '</td></tr>').join('') + '</tbody></table></div>' +
      '<div class="acoes" style="margin-top:14px"><button type="button" class="btn sec" data-acao="rel-csv">' + I.baixar + 'Exportar relatório (CSV)</button></div></section>';
    return h;
  }
  function folhaMetas() {
    const cf = cfg();
    const corpo = '<form id="f-metas" style="display:flex;flex-direction:column;gap:12px"><p class="mudo">Valem para todos os meses até você mudar.</p>' +
      '<label class="campo"><span>Receber por mês</span><span class="com-prefixo"><i>R$</i><input class="entrada num" name="fat" inputmode="decimal" value="' + inNum(cf.metaFaturamento) + '" placeholder="sem meta"></span></label>' +
      '<label class="campo"><span>Lucro da doceria por mês</span><span class="com-prefixo"><i>R$</i><input class="entrada num" name="luc" inputmode="decimal" value="' + inNum(cf.metaLucro) + '" placeholder="sem meta"></span><small>Recebido menos despesas, antes do pró-labore.</small></label>' +
      '<div class="rodape-folha"><button type="button" class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit">Salvar metas</button></div></form>';
    abrirFolha('Metas do mês', corpo, function (d) {
      $('#f-metas', d).addEventListener('submit', function (ev) {
        ev.preventDefault(); const f = ev.target;
        const c = clone(cfg()); const a = C.lerNum(f.fat.value), b = C.lerNum(f.luc.value);
        c.metaFaturamento = a > 0 ? a : null; c.metaLucro = b > 0 ? b : null;
        gravarRegistro('config', c); d.close(); toast('Metas salvas.'); render(false);
      });
    });
  }

  // ---------- Início: contas perto do vencimento ----------
  function blocoContasInicio() {
    const hj = hoje();
    const lst = lista('contasPagar').map(c => ({ c: c, st: C.statusConta(c, S.dados.lancamentos, hj) }))
      .filter(x => x.st.status === 'vencida' || x.st.status === 'hoje' || (x.st.status === 'aberta' && x.st.dias <= 3))
      .sort((a, b) => String(a.c.vencimento).localeCompare(String(b.c.vencimento)));
    if (!lst.length) return '';
    return '<section class="bloco"><div class="cab-bloco"><h2>Contas a pagar</h2><a class="link-btn" href="#/contas">Ver todas</a></div><div class="lista">' +
      lst.slice(0, 6).map(x => '<a class="item" href="#/contas"><div class="principal"><div class="nome">' + esc(x.c.descricao) + '</div><div class="det">vence ' + dataDia(x.c.vencimento) + '</div></div><div class="valor">' + C.brl(x.c.valor) + '</div><div class="chips">' + chipConta(x.st) + '</div></a>').join('') + '</div></section>';
  }

  const ACOES_FIN = {
    'nova-conta': function () { folhaConta(null); },
    'editar-conta': function (el) { folhaConta(el.dataset.id); },
    'pagar-conta': function (el) { folhaPagarConta(el.dataset.id); },
    'desfazer-conta': async function (el) {
      const c = S.dados.contasPagar[el.dataset.id]; if (!c) return;
      if (!await confirmar('Desfazer pagamento?', 'A conta volta a ficar em aberto e a saída de ' + C.brl((S.dados.lancamentos[c.lancamentoId] || {}).valor) + ' sai do Movimento.', 'Desfazer pagamento', true)) return;
      if (c.lancamentoId && S.dados.lancamentos[c.lancamentoId]) excluirRegistro('lancamentos', c.lancamentoId);
      const nc = clone(c); nc.lancamentoId = ''; gravarRegistro('contasPagar', nc); toast('Pagamento desfeito.'); render(false);
    },
    'nova-recorrente': function () { folhaRecorrente(null); },
    'editar-recorrente': function (el) { folhaRecorrente(el.dataset.id); },
    cobrar: function (el) { const g = (S.gruposReceber || [])[+el.dataset.i]; if (g) folhaCobranca(g); },
    'reserva-mov': function (el) { folhaReserva(el.dataset.v); },
    retirar: folhaRetirada,
    'reserva-rem': async function (el) {
      const l = S.dados.lancamentos[el.dataset.id]; if (!l) return;
      if (!await confirmar('Remover registro?', 'Remover ' + (l.valor > 0 ? 'o depósito' : 'o uso') + ' de ' + C.brl(Math.abs(l.valor)) + ' de ' + dataDia(l.data) + '.', 'Remover', true)) return;
      excluirRegistro('lancamentos', l.id); toast('Registro removido.'); render(false);
    },
    'rel-mes': function (el) { const n = C.somarMeses(S.relMes || hoje().slice(0, 7), Number(el.dataset.v)); if (n > hoje().slice(0, 7)) return; S.relMes = n; render(false); },
    'rel-n': function (el) { S.relN = Number(el.dataset.v); render(false); },
    'rel-csv': function () {
      const blob = new Blob([C.csvRelatorio(S.relSerie || [], (S.relRanking || []).slice().sort((a, b) => b.receita - a.receita))], { type: 'text/csv;charset=utf-8' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'relatorio-' + (S.relMes || hoje().slice(0, 7)) + '.csv';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      toast('Relatório exportado.');
    },
    'definir-metas': folhaMetas,
    'fonte-fixos': function (el) { const c = clone(cfg()); c.custosFixosFonte = el.dataset.v; gravarRegistro('config', c); render(false); }
  };

  // ================= Importar compras de um arquivo CSV =================
  function jaImportada(g) { const l = S.dados.lancamentos[g.id]; return !!(l && !l.excluidoEm); }
  function segCompras(ativa) {
    return '<div class="seg" role="group" aria-label="Parte da aba Compras" style="margin-bottom:14px"><a href="#/compras"' + (ativa === 'lista' ? ' aria-current="true"' : '') + '>Lista de compras</a><a href="#/compras?v=feitas"' + (ativa === 'feitas' ? ' aria-current="true"' : '') + '>Compras feitas</a></div>';
  }
  function comprasRegistradas() {
    return lista('lancamentos').filter(l => l.tipo === 'saida' && ((l.itensCompra || []).length || C.semAcento(l.categoria) === 'ingredientes'))
      .sort((a, b) => String(b.data).localeCompare(String(a.data)) || String(b.atualizadoEm || '').localeCompare(String(a.atualizadoEm || '')));
  }
  function telaComprasFeitas() {
    let h = cab('Compras feitas', 'Registre o que comprou: à mão ou por uma planilha do Excel. O preço dos ingredientes se atualiza sozinho.',
      '<a class="btn" href="#/lancamento/novo?compra=1">' + I.mais + 'Nova compra</a>') + abas(ABAS_PED, '#/compras') + segCompras('feitas');
    h += blocoImportarCompras();
    const todas = comprasRegistradas(), mes = hoje().slice(0, 7);
    const doMes = todas.filter(l => String(l.data).slice(0, 7) === mes), totMes = doMes.reduce((s, l) => s + (l.valor || 0), 0);
    const recentes = todas.filter(l => l.data >= C.somarDias(hoje(), -60));
    if (!todas.length) return h + '<div class="bloco vazio">' + I.emblema + '<h2>Nenhuma compra registrada</h2><p>Registre as compras de ingredientes para o app manter os preços atualizados e, no modo completo, o estoque.</p><a class="btn" href="#/lancamento/novo?compra=1">' + I.mais + 'Registrar a primeira compra</a></div>';
    h += '<div class="stats stats-cx" style="grid-template-columns:repeat(2,minmax(0,1fr))"><div class="stat"><div class="r">Compras em ' + esc(C.nomeMes(mes).split(' ')[0]) + '</div><div class="n">' + C.brl(totMes) + '</div></div><div class="stat" style="grid-column:auto"><div class="r">Quantidade</div><div class="n">' + doMes.length + '</div></div></div>';
    h += '<section class="bloco"><div class="cab-bloco"><h2>Últimos 60 dias</h2><button type="button" class="link-btn" data-acao="compras-no-caixa">Ver todas no Caixa</button></div>' +
      (recentes.length ? '<div class="lista">' + recentes.map(function (l) {
        const its = (l.itensCompra || []).map(it => (S.dados.ingredientes[it.ingredienteId] || {}).nome).filter(Boolean);
        return '<a class="item" href="#/lancamento/' + encodeURIComponent(l.id) + '?de=compras"><div class="principal"><div class="nome">' + esc(l.descricao || 'Compra') + '</div><div class="det">' + esc(dataCurta(l.data)) + (l.forma ? ', ' + esc(formaTxt(l.forma)) : '') + '</div>' +
          (its.length ? '<div class="det">' + esc(its.slice(0, 3).join(', ') + (its.length > 3 ? ' e mais ' + (its.length - 3) : '')) + '</div>' : '') + '</div>' +
          '<div class="valor">' + C.brl(l.valor) + '</div>' + (l.importado ? '<div class="chips"><span class="chip mudo">importada do Excel</span></div>' : '') + '</a>';
      }).join('') + '</div>' : '<p class="mudo">Nenhuma compra nos últimos 60 dias.</p>') + '</section>';
    return h;
  }
  function blocoImportarCompras() {
    return '<section class="bloco barra-import"><div class="txt-import"><b>Muitas compras de uma vez?</b><small>Baixe o modelo, preencha no Excel ou no Google Planilhas e importe aqui.</small></div>' +
      '<div class="acoes"><button type="button" class="btn sec fino" data-acao="modelo-compras">' + I.baixar + 'Baixar modelo</button><label class="btn fino" style="cursor:pointer">' + I.enviar + 'Importar compras<input type="file" accept=".csv,text/csv,text/plain" id="arq-compras" hidden></label></div></section>';
  }
  async function lerArquivoTexto(arq) {
    const buf = await arq.arrayBuffer();
    try { return new TextDecoder('utf-8', { fatal: true }).decode(buf); }
    catch (e) { return new TextDecoder('windows-1252').decode(buf); } // CSV salvo pelo Excel em português
  }
  function telaImportarCompras() {
    const im = S.importacao;
    let h = '<div class="cab-pagina"><div class="titulos"><a href="#/compras?v=feitas" class="link-btn voltar">' + I.voltar + 'Compras feitas</a><h1>Importar compras</h1>' + (im ? '<p class="sub">' + esc(im.nome) + '</p>' : '') + '</div></div>';
    if (!im) return h + '<div class="bloco vazio">' + I.emblema + '<h2>Nenhum arquivo aberto</h2><p>Volte para Compras feitas e escolha o arquivo.</p><a class="btn" href="#/compras?v=feitas">Ir para Compras feitas</a></div>';
    const res = C.interpretarCompras(im.csv, S.dados.ingredientes, im.padroes, im.resolucoes);
    if (res.semCabecalho) return h + '<div class="aviso neg">' + I.alerta + '<div class="txt">Não encontrei as colunas de ingrediente e valor neste arquivo. Use o modelo: ele já vem com as colunas certas.<br><button type="button" class="link-btn" data-acao="modelo-compras">Baixar modelo</button></div></div>';
    const novas = res.grupos.filter(g => g.ok && !jaImportada(g)), ja = res.grupos.filter(g => g.ok && jaImportada(g)), erradas = res.grupos.filter(g => !g.ok);
    const total = novas.reduce((s, g) => s + g.total, 0), nItens = novas.reduce((s, g) => s + g.itens.length, 0);
    h += '<div class="stats stats-cx"><div class="stat"><div class="r">Compras a importar</div><div class="n">' + novas.length + '</div></div><div class="stat"><div class="r">Total</div><div class="n">' + C.brl(total) + '</div></div><div class="stat"><div class="r">Ingredientes com preço atualizado</div><div class="n">' + nItens + '</div></div></div>';
    const info = [];
    if (res.ignoradas) info.push(res.ignoradas + (res.ignoradas === 1 ? ' linha sem quantidade e valor foi ignorada' : ' linhas sem quantidade e valor foram ignoradas') + ' (normal no modelo).');
    if (res.exemplos) info.push('A linha de exemplo foi ignorada.');
    if (ja.length) info.push(ja.length + (ja.length === 1 ? ' compra já tinha sido importada e não entra de novo.' : ' compras já tinham sido importadas e não entram de novo.'));
    if (info.length) h += '<p class="mudo" style="margin:-4px 0 14px">' + info.map(esc).join(' ') + '</p>';
    h += '<section class="bloco"><h2>Para células em branco</h2><p class="explica">Valem só para linhas sem data, sem local ou sem forma de pagamento. Preencher no arquivo evita importar em dobro depois.</p><div class="grade">' +
      '<label class="campo"><span>Data</span><input class="entrada" type="date" data-imp="data" value="' + esc(im.padroes.data) + '"></label>' +
      '<label class="campo"><span>Local ou descrição</span><input class="entrada" data-imp="descricao" value="' + esc(im.padroes.descricao) + '" placeholder="Compra importada"></label>' +
      '<label class="campo"><span>Forma de pagamento</span><select class="entrada" data-imp="forma">' + Object.keys(C.FORMAS_LANCAMENTO).map(k => '<option value="' + k + '"' + (im.padroes.forma === k ? ' selected' : '') + '>' + C.FORMAS_LANCAMENTO[k] + '</option>').join('') + '</select></label></div></section>';
    if (res.naoEncontrados.length) {
      const ings = lista('ingredientes').sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      h += '<section class="bloco"><h2>Fora da biblioteca</h2><p class="explica">Estes nomes não batem com nenhum ingrediente. Escolha o que fazer com cada um.</p><div class="lista-contagem">' +
        res.naoEncontrados.map(function (x) {
          const dec = im.resolucoes[x.chave] || 'novo';
          const compat = ings.filter(i => !x.unidade || C.mesmaFamilia(i.unidade, x.unidade));
          return '<div class="linha-contagem"><div class="principal"><b>' + esc(x.nome) + '</b><small>' + (x.linhas.length === 1 ? 'linha ' : 'linhas ') + x.linhas.join(', ') + '</small></div>' +
            '<select class="entrada" data-imp-res="' + esc(x.chave) + '" aria-label="O que fazer com ' + esc(x.nome) + '"><option value="novo"' + (dec === 'novo' ? ' selected' : '') + '>Criar ingrediente novo</option><option value="outro"' + (dec === 'outro' ? ' selected' : '') + '>Contar como outro item</option>' +
            (compat.length ? '<optgroup label="É o mesmo que…">' + compat.map(i => '<option value="' + esc(i.id) + '"' + (dec === i.id ? ' selected' : '') + '>' + esc(i.nome) + '</option>').join('') + '</optgroup>' : '') + '</select></div>';
        }).join('') + '</div><p class="mudo" style="margin-top:8px">"Contar como outro item" entra no valor da compra, mas não cria ingrediente nem atualiza preço.</p></section>';
    }
    if (res.erros.length) {
      h += '<section class="bloco"><div class="aviso neg">' + I.alerta + '<div class="txt"><b>' + (erradas.length === 1 ? '1 compra tem erro e não será importada.' : erradas.length + ' compras têm erro e não serão importadas.') + '</b> Corrija no arquivo e importe de novo; as compras certas deste arquivo não entram em dobro.<ul>' +
        res.erros.slice(0, 30).map(e => '<li>Linha ' + e.linha + ': ' + esc(e.msg) + '</li>').join('') + (res.erros.length > 30 ? '<li>e mais ' + (res.erros.length - 30) + '</li>' : '') + '</ul></div></div></section>';
    }
    if (res.grupos.length) {
      const trabalho = {};
      h += '<section class="bloco"><h2>Compras no arquivo</h2><div class="lista">' + res.grupos.map(function (g) {
        const st = !g.ok ? '<span class="chip neg">com erro</span>' : jaImportada(g) ? '<span class="chip mudo">já importada</span>' : '<span class="chip pos">' + I.ok + 'vai importar</span>';
        const linhas = g.itens.map(function (it) {
          let prev = '';
          if (g.ok && !jaImportada(g) && it.ingredienteId) {
            const ing = trabalho[it.ingredienteId] || S.dados.ingredientes[it.ingredienteId];
            const r = C.aplicarCompra(ing, it, g.data, 'prev:' + g.id + ':' + it.linha);
            if (r) { trabalho[it.ingredienteId] = r.ing; prev = !r.precoAtualMudou ? 'compra antiga: só entra no histórico' : C.numOk(r.variacao) && Math.abs(r.variacao) >= 0.005 ? (r.variacao > 0 ? 'preço sobe ' : 'preço cai ') + C.pct(Math.abs(r.variacao)) : 'mesmo preço'; }
          }
          return '<li><span>' + esc(it.nome) + (it.novo ? ' <span class="chip alerta">novo</span>' : '') + ' <small class="mudo">' + C.num(it.embalagens) + ' × ' + C.num(it.qtdEmbalagem) + ' ' + rotUn(it.unidade) + (prev ? ', ' + prev : '') + '</small></span><b>' + C.brl(it.valor) + '</b></li>';
        }).join('') + (g.outros > 0 ? '<li><span>Outros itens</span><b>' + C.brl(g.outros) + '</b></li>' : '');
        return '<div class="item compra-imp"><div class="principal"><div class="nome">' + esc(g.descricao) + '</div><div class="det">' + (g.data ? esc(dataCurta(g.data)) : 'sem data') + (g.forma ? ', ' + esc(formaTxt(g.forma)) : '') + '</div></div><div class="valor">' + C.brl(g.total || 0) + '</div><div class="chips">' + st + '</div>' +
          (linhas ? '<ul class="historico" style="width:100%">' + linhas + '</ul>' : '') + '</div>';
      }).join('') + '</div></section>';
    } else h += '<p class="mudo" style="padding:8px 4px 20px">Nenhuma compra preenchida no arquivo.</p>';
    h += '<div class="barra-salvar"><span class="estado">' + (novas.length ? '<b style="color:var(--ink)">' + C.brl(total) + '</b><br>' + novas.length + (novas.length === 1 ? ' compra' : ' compras') : 'Nada para importar') + '</span>' +
      '<button type="button" class="btn sec fino" data-acao="importar-cancelar">Cancelar</button><button type="button" class="btn" data-acao="importar-compras-ok"' + (novas.length ? '' : ' disabled') + '>Importar ' + (novas.length === 1 ? '1 compra' : novas.length + ' compras') + '</button></div>';
    return h;
  }
  function executarImportacao() {
    const im = S.importacao; if (!im) return;
    const res = C.interpretarCompras(im.csv, S.dados.ingredientes, im.padroes, im.resolucoes);
    const grupos = res.grupos.filter(g => g.ok && !jaImportada(g));
    if (!grupos.length) { toast('Nada para importar.'); return; }
    // guarda as escolhas "outro item" e "é o mesmo que" para a próxima importação
    S.meta.decisoesImport = S.meta.decisoesImport || {};
    Object.keys(im.resolucoes).forEach(k => { if (im.resolucoes[k] !== 'novo') S.meta.decisoesImport[k] = im.resolucoes[k]; });
    salvarLocal();
    const trabalho = {}, criados = {}, antes = {};
    const pegar = id => trabalho[id] || S.dados.ingredientes[id];
    grupos.forEach(function (g) {
      const l = { id: g.id, tipo: 'saida', data: g.data, valor: g.total, categoria: fonteCanonica('Ingredientes', 'saida'), descricao: g.descricao, forma: g.forma, obs: 'Importado de ' + im.nome, itensCompra: [], outros: g.outros || null, importado: im.nome };
      g.itens.forEach(function (it) {
        let ingId = it.ingredienteId;
        if (!ingId && it.novo) {
          const k = C.semAcento(it.nome);
          if (!criados[k]) {
            const novo = { id: uid(), nome: it.nome, unidade: it.unidade, qtdEmbalagem: it.qtdEmbalagem, valorPago: C.round2(it.valor / it.embalagens), marca: '', fornecedor: '', obs: 'Criado na importação de compras', historico: [] };
            trabalho[novo.id] = novo; criados[k] = novo.id;
          }
          ingId = criados[k];
        }
        if (!ingId) return;
        if (S.dados.ingredientes[ingId] && !(ingId in antes)) antes[ingId] = C.custoIngrediente(S.dados.ingredientes[ingId]);
        const item = { id: uid(), ingredienteId: ingId, embalagens: it.embalagens, qtdEmbalagem: it.qtdEmbalagem, unidade: it.unidade, valor: it.valor, validade: it.validade || '' };
        const r = C.aplicarCompra(pegar(ingId), item, g.data, l.id + ':' + item.id);
        if (r) trabalho[ingId] = r.ing;
        l.itensCompra.push(item);
      });
      gravarRegistro('lancamentos', l);
      aplicarEstoqueCompra(l);
    });
    Object.values(trabalho).forEach(ing => gravarRegistro('ingredientes', ing));
    const mud = Object.keys(antes).map(function (id) {
      const a = antes[id], d = C.custoIngrediente(S.dados.ingredientes[id]);
      return a && d && a.porBase > 0 ? { nome: S.dados.ingredientes[id].nome, v: d.porBase / a.porBase - 1 } : null;
    }).filter(x => x && Math.abs(x.v) >= 0.005).sort((a, b) => Math.abs(b.v) - Math.abs(a.v));
    const nNovos = Object.keys(criados).length;
    const total = grupos.reduce((s, g) => s + g.total, 0);
    S.importacao = null;
    toast((grupos.length === 1 ? '1 compra importada' : grupos.length + ' compras importadas') + ' (' + C.brl(total) + ').' +
      (nNovos ? ' ' + (nNovos === 1 ? '1 ingrediente novo.' : nNovos + ' ingredientes novos.') : '') +
      (mud.length ? ' Preços: ' + mud.slice(0, 3).map(x => x.nome + ' ' + (x.v > 0 ? '+' : '−') + C.pct(Math.abs(x.v))).join(', ') + (mud.length > 3 ? ' e mais ' + (mud.length - 3) : '') + '.' : ''), 'Ver no Caixa', () => ir('#/caixa'), 10000);
    ir('#/compras?v=feitas');
  }
  const ACOES_IMPORT = {
    'modelo-compras': function () {
      const blob = new Blob([C.modeloCSVCompras(S.dados.ingredientes, hoje())], { type: 'text/csv;charset=utf-8' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'modelo-compras-doce-astro.csv';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      toast('Modelo baixado. Preencha as linhas do que comprou; as outras podem ficar em branco.');
    },
    'importar-compras-ok': executarImportacao,
    'importar-cancelar': function () { S.importacao = null; ir('#/compras?v=feitas'); },
    'compras-no-caixa': function () {
      const p = C.periodoPreset('ano', hoje());
      S.caixa = { preset: 'ano', de: p.de, ate: p.ate, tipo: 'saida', fontes: [fonteCanonica('Ingredientes', 'saida')], busca: '', maisAberto: true };
      ir('#/caixa');
    }
  };
  document.addEventListener('change', async function (e) {
    const t = e.target;
    if (t.id === 'arq-compras' && t.files && t.files[0]) {
      const arq = t.files[0]; t.value = '';
      let texto;
      try { texto = await lerArquivoTexto(arq); } catch (err) { toast('Não foi possível ler o arquivo.'); return; }
      const csv = C.lerCSV(texto);
      const im = { nome: arq.name, csv: csv, padroes: { data: hoje(), descricao: '', forma: 'pix' }, resolucoes: {} };
      const lembradas = S.meta.decisoesImport || {};
      C.interpretarCompras(csv, S.dados.ingredientes, im.padroes, {}).naoEncontrados.forEach(x => {
        const d = lembradas[x.chave];
        im.resolucoes[x.chave] = d && (d === 'novo' || d === 'outro' || (S.dados.ingredientes[d] && !S.dados.ingredientes[d].excluidoEm)) ? d : 'novo';
      });
      S.importacao = im;
      if (location.hash === '#/importar-compras') render(false); else ir('#/importar-compras');
      return;
    }
    if (t.dataset && t.dataset.imp && S.importacao) { S.importacao.padroes[t.dataset.imp] = t.value; render(false); return; }
    if (t.dataset && t.dataset.impRes !== undefined && S.importacao) { S.importacao.resolucoes[t.dataset.impRes] = t.value; render(false); }
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
    h += '<h2 class="titulo-grupo">Ajustes da doceria</h2><p class="mudo" style="margin:-4px 0 10px">Estes ajustes valem para todos os aparelhos. Custos fixos, mão de obra, preços e taxas e dados da doceria aparecem por extenso na aba Ajustes da planilha.</p>' +
      '<div id="estado-ajustes" class="aviso" role="status" style="margin-bottom:16px"></div>';
    h += '<section class="bloco" id="fixos"><h2>Custos fixos do mês</h2><p class="explica">Contas que chegam todo mês, vendendo ou não. O total é dividido pelas horas de produção e entra no custo de cada receita conforme o tempo dela.</p>' + (function () {
        const mc = mediaContas(), manual = (cf.custosFixos || []).reduce((s, c) => s + (C.numOk(c.valor) ? c.valor : 0), 0), fonte = cf.custosFixosFonte === 'contas' ? 'contas' : 'manual';
        return '<div class="fontes-fixos" role="group" aria-label="Qual valor usar no preço">' +
          '<button type="button" class="opcao-fixos" data-acao="fonte-fixos" data-v="manual" aria-pressed="' + (fonte === 'manual') + '"><span class="r">Preenchido à mão</span><span class="v">' + C.brl(manual) + '</span><small>a lista abaixo</small></button>' +
          '<button type="button" class="opcao-fixos" data-acao="fonte-fixos" data-v="contas" aria-pressed="' + (fonte === 'contas') + '"><span class="r">Pelas contas pagas</span><span class="v">' + (C.numOk(mc.media) ? C.brl(mc.media) : '—') + '</span><small>' + (mc.considerados ? 'média de ' + (mc.considerados === 1 ? '1 mês' : mc.considerados + ' meses') + ' (' + mc.meses.filter(m => m.total > 0).map(m => C.nomeMes(m.mes, true)).join(', ') + ')' : 'sem "Contas fixas" pagas nos últimos 3 meses') + '</small></button></div>' +
          '<p class="mudo" style="margin:8px 0 14px">Toque para escolher qual entra no preço das receitas. Em uso: <b>' + (fonte === 'contas' ? (C.numOk(mc.media) ? 'contas pagas' : 'à mão (ainda não há contas pagas para a média)') : 'à mão') + '</b>.</p>' +
          (mc.itens.length ? '<details class="ajuda" style="margin-bottom:14px"><summary>Ver a média por conta</summary><div><ul class="historico">' + mc.itens.map(i => '<li><span>' + esc(i.descricao) + '</span><span>' + C.brl(i.media) + '</span></li>').join('') + '</ul><p class="mudo" style="margin-top:8px">Vem das saídas da categoria "Contas fixas" nos 3 meses completos anteriores.</p></div></details>' : '');
      })() + '<div class="linhas-edit"><div class="linhas-edit">' +
      cf.custosFixos.map((c, i) => '<div class="linha-edit" style="grid-template-columns:1fr 150px auto"><input class="entrada" data-cfg="custosFixos.' + i + '.nome" value="' + esc(c.nome) + '" aria-label="Nome do custo"><span class="com-prefixo"><i>R$</i><input class="entrada num" data-cfg="custosFixos.' + i + '.valor" data-n inputmode="decimal" value="' + inNum(c.valor) + '" aria-label="Valor de ' + esc(c.nome) + '"></span><button type="button" class="btn-icone" data-acao="rem-fixo" data-i="' + i + '" aria-label="Remover ' + esc(c.nome) + '">' + I.lixo + '</button></div>').join('') +
      '</div><button type="button" class="btn sec" style="margin-top:12px" data-acao="add-fixo">' + I.mais + 'Adicionar custo fixo</button>' +
      '<div class="grade" style="margin-top:16px"><label class="campo"><span>Horas de produção por mês</span><span class="com-prefixo"><input class="entrada num" data-cfg="horasMes" data-n inputmode="decimal" value="' + inNum(cf.horasMes) + '"><i class="dir">h</i></span><small>Ex.: 5 dias por semana, 6 horas por dia: cerca de 120 h.</small></label>' +
      '<div class="campo"><span>Resultado usado no preço</span><p style="font-weight:700;padding-top:10px">' + C.brl(C.totalFixos(cf)) + ' por mês, ' + (C.numOk(C.fixosPorHora(cf)) ? C.brl(C.fixosPorHora(cf)) + ' por hora' : 'defina as horas') + '</p></div></div></section>';

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
    const me = cf.estoqueModo || 'manual';
    h += '<section class="bloco" id="estoque"><h2>Estoque</h2><div class="seg" role="group" aria-label="Modo do estoque">' +
      [['completo', 'Completo'], ['manual', 'Só manual'], ['desligado', 'Desligado']].map(o => '<button type="button" data-acao="modo-estoque" data-v="' + o[0] + '" aria-pressed="' + (me === o[0]) + '">' + o[1] + '</button>').join('') + '</div>' +
      '<p class="explica" style="margin:10px 0 0">' + (me === 'completo' ? 'Compras lançadas no Caixa somam ao estoque, pedidos que entram em produção descontam os ingredientes e a vitrine desconta o que for feito para ela. Você ainda pode contar e corrigir quando quiser.' : me === 'manual' ? 'Você registra entradas, perdas e contagens na aba Estoque. O app avisa o que está abaixo do mínimo ou perto de vencer, e a lista de compras desconta o que você tem.' : 'A aba Estoque fica desativada e a lista de compras não desconta nada.') + '</p>' +
      (me !== 'desligado' ? '<div class="grade" style="margin-top:14px"><label class="campo"><span>Avisar sobre validade com antecedência de</span><span class="com-prefixo"><input class="entrada num" data-cfg="diasAlertaValidade" data-n inputmode="numeric" value="' + inNum(cf.diasAlertaValidade) + '"><i class="dir">dias</i></span></label></div>' : '') + '</section>';
    h += '<section class="bloco"><h2>Dados da doceria</h2><p class="explica">Aparecem nos orçamentos e comprovantes para WhatsApp (próxima etapa).</p><div class="grade">' +
      ['nome:Nome', 'instagram:Instagram', 'telefone:Telefone', 'email:E-mail'].map(x => { const [k, r] = x.split(':'); return '<label class="campo"><span>' + r + '</span><input class="entrada" data-cfg="doceria.' + k + '" value="' + esc(dc[k]) + '"></label>'; }).join('') + '</div></section>';

    // Aparência
    h += '<h2 class="titulo-grupo">Só neste aparelho</h2><section class="bloco"><h2>Aparência</h2><div class="campo"><span>Tema</span><div class="seg" role="group" aria-label="Tema">' +
      [['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Escuro']].map(o => '<button type="button" data-acao="tema" data-v="' + o[0] + '" aria-pressed="' + ((S.meta.tema || 'auto') === o[0]) + '">' + o[1] + '</button>').join('') + '</div></div>' +
      '<label class="campo" style="margin-top:14px"><span>Tamanho do texto: ' + Math.round((S.meta.fonte || 1) * 100) + '%</span><input type="range" min="0.85" max="1.3" step="0.05" value="' + (S.meta.fonte || 1) + '" id="fonte"></label></section>';

    // Backup
    h += '<section class="bloco"><h2>Backup</h2><p class="explica">A planilha já guarda tudo. O backup em arquivo é uma segurança extra, e também serve para levar os dados do modo de teste para outro lugar.</p><div class="acoes"><button type="button" class="btn sec" data-acao="exportar">' + I.baixar + 'Exportar backup (.json)</button><label class="btn sec" style="cursor:pointer">' + I.enviar + 'Importar backup<input type="file" accept="application/json,.json" id="importar" hidden></label></div></section>';

    h += '<p class="mudo" style="text-align:center;margin-top:8px">Espaço Nave ' + VERSAO + '<br><button type="button" class="link-btn" data-acao="procurar-atualizacao">Procurar atualização</button></p>';
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
    const nomes = { ingredientes: 'ingredientes', receitas: 'receitas', config: 'configurações', clientes: 'clientes', pedidos: 'pedidos', lancamentos: 'lançamentos do caixa', estoque: 'registros de estoque' };
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
  Object.assign(ACOES, ACOES_PED, ACOES_CAIXA, ACOES_ESTOQUE, ACOES_FIN, ACOES_IMPORT);
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
      // Versão nova: o service worker baixa em segundo plano; quando assume, o app oferece recarregar.
      const tinhaControle = !!navigator.serviceWorker.controller;
      let avisou = false;
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (!tinhaControle || avisou) return; // primeira instalação não é atualização
        avisou = true; avisoAtualizacao();
      });
      navigator.serviceWorker.register('sw.js').then(function (reg) {
        S.swReg = reg;
        document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
        setInterval(() => reg.update().catch(() => {}), 30 * 60 * 1000);
      }).catch(() => {});
    }
  }
  function avisoAtualizacao() {
    if ($('#aviso-versao')) return;
    const el = document.createElement('div');
    el.id = 'aviso-versao'; el.className = 'aviso-versao'; el.setAttribute('role', 'status');
    el.innerHTML = '<span>' + I.girar + 'Nova versão do app pronta.</span><button type="button" class="btn fino">Atualizar agora</button>';
    el.querySelector('button').onclick = async function () {
      if (S.editor && S.editor.sujo && !await confirmar('Atualizar agora?', 'As alterações desta tela ainda não foram salvas e seriam perdidas.', 'Atualizar mesmo assim', true)) return;
      el.querySelector('button').disabled = true;
      try { await gravarJa(); } catch (e) { /* segue */ }
      location.reload();
    };
    document.body.appendChild(el);
    document.body.classList.add('com-aviso-versao');
  }
  ACOES['procurar-atualizacao'] = function () {
    const reg = S.swReg;
    if (!reg) { toast('Neste modo de abertura o app não se atualiza sozinho. Abra pelo endereço do site.'); return; }
    toast('Procurando atualização…');
    reg.update().then(function () {
      if (reg.installing || reg.waiting) toast('Baixando a versão nova. O aviso para atualizar aparece em instantes.');
      else toast('Você já está na versão mais recente (' + VERSAO + ').');
    }).catch(() => toast('Sem conexão para procurar atualização agora.'));
  };
  // Exposto para testes automatizados
  window.__EN = { S: S, C: C, gravarRegistro: gravarRegistro, sincronizar: sincronizar, render: render };
  iniciar();
})();
