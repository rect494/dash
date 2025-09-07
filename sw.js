// 簡易 Service Worker
self.addEventListener("install", event => {
  console.log("Service Worker: installed");
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  console.log("Service Worker: activated");
});
