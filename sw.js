const CACHE_NAME='sl-identity-build-0-2';
const ASSETS=['./','./index.html','./profile.json','./contact.vcf','./manifest.json','./css/styles.css','./js/app.js','./assets/logo/aunde-logo.png','./assets/patterns/technical-textile.svg','./assets/icons/icons.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
