const CACHE='woodtool-github-v17';

const ASSETS=[
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache=>cache.addAll(ASSETS))
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    Promise.all([
      caches.keys().then(keys=>
        Promise.all(
          keys
            .filter(key=>key!==CACHE)
            .map(key=>caches.delete(key))
        )
      ),
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;

  const request=event.request;

  // HTML / 頁面導覽：優先抓最新版
  if(
    request.mode==='navigate' ||
    request.destination==='document'
  ){
    event.respondWith(
      fetch(request,{cache:'no-store'})
        .then(response=>{
          const copy=response.clone();

          caches
            .open(CACHE)
            .then(cache=>cache.put('./index.html',copy));

          return response;
        })
        .catch(()=>caches.match('./index.html'))
    );

    return;
  }

  // 其他靜態資源：快取優先
  event.respondWith(
    caches.match(request).then(cached=>{
      if(cached) return cached;

      return fetch(request).then(response=>{
        const copy=response.clone();

        caches
          .open(CACHE)
          .then(cache=>cache.put(request,copy));

        return response;
      });
    })
  );
});
