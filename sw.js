// Flying Gorilla service worker. The game page is NETWORK-FIRST (a new version arrives on the next open when online;
// the cached copy is used offline). Icons/manifest: cache, refreshed in the background. Old caches are removed on activate.
const CACHE = 'flying-gorilla-7f3d5f643c';
const PRECACHE = ["./", "index.html", "manifest.webmanifest", "favicon.ico", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-192.png", "icons/icon-maskable-512.png", "icons/apple-touch-icon.png", "icons/icon-32.png"];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('flying-gorilla-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
const isPage = (req, url) => req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
self.addEventListener('fetch', e => { const req = e.request; const url = new URL(req.url); if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (isPage(req, url)) { e.respondWith(fetch(req, { cache: 'no-store' }).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('index.html', copy)); } return res; })
      .catch(() => caches.match('index.html').then(r => r || caches.match('./')))); return; }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => { const net = fetch(req).then(res => { if (res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; });
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; } return net; }).catch(() => Response.error())); });
