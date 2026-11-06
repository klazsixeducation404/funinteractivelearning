/* GERAK: pekerja perkhidmatan (service worker) untuk kegunaan luar talian.
   Hak cipta (c) 2026 ameermustaqeem@klazsixedu. */
const VERSI = 'gerak-1793939323';
const TERAS = ['./', './index.html', './tentang.html', './manifest.webmanifest', './ikon-192.png', './ikon-512.png'];
const LUAR = 'gerak-luar-v1';                       // perpustakaan dan model AI dari CDN (jarang berubah)
const DOMAIN_LUAR = /(^|\.)(cdn\.jsdelivr\.net|storage\.googleapis\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSI).then(c => Promise.all(TERAS.map(u => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n.startsWith('gerak-') && n !== VERSI && n !== LUAR).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    // halaman sendiri: rangkaian dahulu (sentiasa versi terkini), simpanan jika luar talian
    e.respondWith(fetch(r).then(res => { if (res.ok) { const s = res.clone(); caches.open(VERSI).then(c => c.put(r, s)); } return res; })
      .catch(() => caches.match(r, { ignoreSearch: true }).then(x => x || caches.match('./index.html'))));
    return;
  }
  if (DOMAIN_LUAR.test(u.hostname)) {
    // model AI, fon dan perpustakaan: simpanan dahulu (muat turun sekali sahaja)
    e.respondWith(caches.open(LUAR).then(c => c.match(r).then(x => x || fetch(r).then(res => { if (res.ok || res.type === 'opaque') c.put(r, res.clone()); return res; }))));
  }
});
self.addEventListener('message', e => { if (e.data === 'versi' && e.source) e.source.postMessage({ versi: VERSI }); });
