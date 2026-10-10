/* Espaço Nave — service worker: abre o app sem internet.
   A versão e a lista CASCA são geradas por ferramentas/atualizar-cache.js: não edite à mão. */
const VERSAO = 'espaco-nave-v6.2.3';
const CASCA = [
  './',
  './css/01-tokens.css',
  './css/02-base.css',
  './css/03-estrutura.css',
  './css/04-componentes.css',
  './css/05-caixa.css',
  './css/06-estoque.css',
  './css/07-logo.css',
  './css/08-loja.css',
  './css/09-financeiro.css',
  './css/10-importar-compras.css',
  './css/11-aviso-versao.css',
  './css/12-vitrine.css',
  './css/13-cardapio.css',
  './css/99-ajustes-finais.css',
  './icons/apple-touch-icon.png',
  './icons/favicon-64.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/logo-estrela.png',
  './icons/logo-selo.png',
  './index.html',
  './js/app.js',
  './js/motor/caixa.js',
  './js/motor/cardapio-imagem.js',
  './js/motor/cardapio.js',
  './js/motor/config.js',
  './js/motor/contas-fixas.js',
  './js/motor/datas.js',
  './js/motor/estoque.js',
  './js/motor/financeiro.js',
  './js/motor/importacao.js',
  './js/motor/index.js',
  './js/motor/ingredientes.js',
  './js/motor/numeros.js',
  './js/motor/pedidos.js',
  './js/motor/pix.js',
  './js/motor/prolabore.js',
  './js/motor/receitas.js',
  './js/motor/relatorios.js',
  './js/motor/texto.js',
  './js/motor/unidades.js',
  './js/motor/whatsapp.js',
  './js/nucleo/acoes.js',
  './js/nucleo/armazenamento.js',
  './js/nucleo/atualizacao.js',
  './js/nucleo/estado.js',
  './js/nucleo/ganchos.js',
  './js/nucleo/icones.js',
  './js/nucleo/interface.js',
  './js/nucleo/registros.js',
  './js/nucleo/rotas.js',
  './js/nucleo/sincronizacao.js',
  './js/nucleo/util.js',
  './js/servicos/caixa.js',
  './js/servicos/cardapio.js',
  './js/servicos/estoque.js',
  './js/servicos/financeiro.js',
  './js/servicos/pedidos.js',
  './js/telas/agenda.js',
  './js/telas/ajustes.js',
  './js/telas/boas-vindas.js',
  './js/telas/caixa.js',
  './js/telas/cardapio-imagem.js',
  './js/telas/cardapio.js',
  './js/telas/clientes.js',
  './js/telas/compras.js',
  './js/telas/contas.js',
  './js/telas/estoque.js',
  './js/telas/importar-compras.js',
  './js/telas/ingredientes.js',
  './js/telas/inicio.js',
  './js/telas/lancamento.js',
  './js/telas/pedidos.js',
  './js/telas/producao.js',
  './js/telas/prolabore.js',
  './js/telas/receber.js',
  './js/telas/receitas.js',
  './js/telas/relatorios.js',
  './js/telas/vitrine.js',
  './manifest.webmanifest'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(CASCA.map(u => new Request(u, { cache: 'reload' })))  /* não aproveita cópia antiga guardada pelo navegador */).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Planilha: sempre pela rede (o app cuida do modo offline)
  if (/script\.google(usercontent)?\.com$/.test(url.hostname)) return;
  // Fontes: guardadas na primeira vez
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.open(VERSAO).then(c => c.match(req).then(r => r || fetch(req).then(resp => { c.put(req, resp.clone()); return resp; }).catch(() => r))));
    return;
  }
  if (url.origin !== location.origin) return;
  // App: responde com o que está guardado e atualiza em segundo plano
  e.respondWith(caches.open(VERSAO).then(c => c.match(req, { ignoreSearch: true }).then(guardado => {
    const rede = fetch(req).then(resp => { if (resp.ok) c.put(req, resp.clone()); return resp; })
      .catch(() => guardado || (req.mode === 'navigate' ? c.match('./index.html') : undefined));
    return guardado || rede;
  })));
});
