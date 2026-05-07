// Bro7Vision Service Worker — network-first, sin caché agresiva
const CACHE = 'bro7-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  // Solo interceptamos recursos del mismo origen (shell HTML/CSS/JS)
  // Los videos y audios externos pasan directo sin caché
  if (!e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
