const CACHE='vocab-v13';
const FILES=['./','./index.html','./dict.js','./sentences.js','./quotes.js','./hwocr.js','./hwocr-worker.js','./hwmodel.bin','./manifest.json','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.origin!==location.origin)return; /* 翻譯服務等外部網址不攔截、不快取 */
  if(u.pathname.endsWith('.cfg'))return; /* 設定檔一律走網路，由 App 自己快取 */
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{
    const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return res;
  }).catch(()=>caches.match('./index.html'))));
});
