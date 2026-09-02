const CACHE='confesionario-sr-v1';
const ASSETS=['./','./index.html','./style.css','./app.js','./manifest.webmanifest','./img/pantalla-1.png','./img/pantalla-2.png','./img/pantalla-3.png','./img/pantalla-4.png','./img/pantalla-5.png','./img/pantalla-6.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(x=>{const copy=x.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return x}).catch(()=>caches.match('./index.html'))))});
