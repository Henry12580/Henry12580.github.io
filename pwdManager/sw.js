const cacheName = "AppCache-v1";
const precachedResources = [
  "/pwdManager/", 
  "/pwdManager/index.html", 
  "/pwdManager/sw.js",
  "/pwdManager/manifest.json",
  "/pwdManager/account.png",
  "/pwdManager/vite.svg",
  "/pwdManager/assets/index.aef3fe97.js",
  "/pwdManager/assets/index.ff1e14a0.css",
  "/pwdManager/assets/background.b08d1747.jpg",
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