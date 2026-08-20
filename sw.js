const CACHE = 'woodtool-github-v2';

const STATIC_ASSETS = [
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(keys => {
        return Promise.all(
          keys
            .filter(key => key !== CACHE)
            .map(key => caches.delete(key))
        );
      }),
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const request = event.request;
  const url = new URL(request.url);

  // HTML：優先抓 GitHub 最新版本
  // 沒網路時才使用快取
  if (
    request.mode === 'navigate' ||
    request.headers.get('accept')?.includes('text/html')
  ) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then(response => {
          const copy = response.clone();

          caches.open(CACHE).then(cache => {
            cache.put('./index.html', copy);
          });

          return response;
        })
        .catch(() => {
          return caches.match('./index.html');
        })
    );

    return;
  }

  // Supabase / API 資料不進 Service Worker 快取
  if (
    url.hostname.includes('supabase.co') ||
    url.pathname.includes('/rest/v1/')
  ) {
    event.respondWith(fetch(request));
    return;
  }

  // 圖示、manifest 等靜態檔案使用快取
  event.respondWith(
    caches.match(request).then(cached => {
      const networkFetch = fetch(request)
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();

            caches.open(CACHE).then(cache => {
              cache.put(request, copy);
            });
          }

          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
