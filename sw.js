/* Espaço Nave — service worker: abre o app sem internet */
const VERSAO = 'espaco-nave-v5.1.0';
const CASCA = ['./', './index.html', './app.js', './calc.js', './manifest.webmanifest', './icons/logo-selo.png', './icons/logo-estrela.png', './icons/favicon-64.png', './icons/apple-touch-icon.png', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(CASCA)).then(() => self.skipWaiting()));
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
