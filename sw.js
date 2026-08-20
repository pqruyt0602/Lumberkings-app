// Lumberkings PWA service worker - network-first for app shell
const CACHE_NAME='lumberkings-pwa-v2';
const STATIC_ASSETS=['./manifest.webmanifest','./icons/icon-192.png'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache=>cache.addAll(STATIC_ASSETS).catch(()=>{}))
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const names=await caches.keys();
    await Promise.all(
      names
        .filter(n=>n!==CACHE_NAME)
        .map(n=>caches.delete(n))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  const req=event.request;

  if(req.method!=='GET') return;

  const url=new URL(req.url);

  // 版本檢查一定走網路，不吃快取
  if(url.searchParams.has('__version_check')){
    event.respondWith(
      fetch(req,{cache:'no-store'})
    );
    return;
  }

  // HTML 頁面：優先讀最新版網路
  // 只有離線時才退回快取
  if(
    req.mode==='navigate' ||
    req.destination==='document'
  ){
    event.respondWith((async()=>{
      try{
        const fresh=await fetch(req,{
          cache:'no-store'
        });

        const cache=await caches.open(CACHE_NAME);

        cache.put(
          req,
          fresh.clone()
        ).catch(()=>{});

        return fresh;

      }catch(e){

        const cached=await caches.match(
          req,
          {ignoreSearch:true}
        );

        if(cached) return cached;

        return new Response(
          '目前離線，請稍後再試。',
          {
            status:503,
            headers:{
              'Content-Type':'text/plain; charset=utf-8'
            }
          }
        );
      }
    })());

    return;
  }

  // 同網站的圖片、manifest 等靜態檔案
  // 先使用快取，同時背景抓新版
  if(url.origin===self.location.origin){

    event.respondWith((async()=>{

      const cached=await caches.match(
        req,
        {ignoreSearch:true}
      );

      const network=fetch(req)
        .then(async fresh=>{

          const cache=await caches.open(
            CACHE_NAME
          );

          cache.put(
            req,
            fresh.clone()
          ).catch(()=>{});

          return fresh;

        })
        .catch(()=>null);

      return (
        cached ||
        await network ||
        new Response('',{status:504})
      );

    })());
  }
});
