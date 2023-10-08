const cacheName = "tool-box-cache";
const precachedResources = [
  "/tool-box/", 
  "/tool-box/index.html", 
  "/tool-box/index.js", 
  "/tool-box/index.css", 
  "/tool-box/sw.js",
  "/tool-box/translate.js",
  "/tool-box/manifest.json",
  "/tool-box/tools_icon_large.json",
];

async function precache() {
  const cache = await caches.open(cacheName);
  // key: request; value: resource;
  return cache.addAll(precachedResources);
}

self.addEventListener("install", (event) => {
  console.log("install");
  // 安装网页之前先预缓存网页内容
  event.waitUntil(precache());
});

async function cacheFirst(request) {
  // 取出缓存
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  event.respondWith(cacheFirst(event.request));
});