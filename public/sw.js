// Service worker mínimo de Carrao — resiliencia ante red intermitente.
// Excepción consciente a "JS al mínimo": corre fuera del hilo principal y solo
// añade un fallback offline; no precachea nada al instalar (peso cero al inicio).
//
// Estrategia: NETWORK-FIRST. Siempre intenta la red (la info de emergencia debe
// ser fresca); si la red falla, sirve la última copia cacheada. Así no se sirve
// nada viejo cuando hay señal, pero la página sigue respondiendo si se cae.

const CACHE = "carrao-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // solo same-origin
  if (url.pathname.startsWith("/api/refresh")) return; // nunca cachear el cron

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.ok) cache.put(req, fresh.clone());
        return fresh;
      } catch {
        const cached = await cache.match(req);
        if (cached) return cached;
        // Navegación sin red y sin esa página cacheada: cae a la home cacheada.
        if (req.mode === "navigate") {
          const home = await cache.match("/");
          if (home) return home;
        }
        throw new Error("offline y sin caché");
      }
    })()
  );
});
