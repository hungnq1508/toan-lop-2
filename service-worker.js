/**
 * Service worker – cho phép chạy KHÔNG CẦN MẠNG sau lần tải đầu.
 *
 * ⚠️ MỖI LẦN CẬP NHẬT MÃ NGUỒN: tăng CACHE_VERSION để iPad nhận bản mới.
 * Thêm file mới (js, json, ảnh, âm thanh…) thì thêm vào PRECACHE
 * (chạy `npm test` để kiểm tra danh sách không thiếu/thừa file).
 */
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `toan-lop-2-${CACHE_VERSION}`;

const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/app.js',
  './js/storage.js',
  './js/sound.js',
  './js/speech.js',
  './js/effects.js',
  './js/badges.js',
  './js/mascot.js',
  './js/visuals.js',
  './js/topics.js',
  './js/quiz-engine.js',
  './js/lib/confetti.module.js',
  './js/generators/utils.js',
  './js/generators/numbers.js',
  './js/generators/terms.js',
  './js/generators/add-sub-20.js',
  './js/generators/add-sub-100.js',
  './js/generators/geometry.js',
  './js/generators/statistics.js',
  './js/generators/word-problems.js',
  './js/ui/dom.js',
  './js/ui/keypad.js',
  './js/ui/home.js',
  './js/ui/setup.js',
  './js/ui/quiz.js',
  './js/ui/result.js',
  './js/ui/history.js',
  './js/ui/settings.js',
  './data/questions/geometry.json',
  './data/questions/statistics.json',
  './assets/fonts/nunito-latin-400-normal.woff2',
  './assets/fonts/nunito-latin-700-normal.woff2',
  './assets/fonts/nunito-latin-900-normal.woff2',
  './assets/fonts/nunito-latin-ext-400-normal.woff2',
  './assets/fonts/nunito-latin-ext-700-normal.woff2',
  './assets/fonts/nunito-latin-ext-900-normal.woff2',
  './assets/fonts/nunito-vietnamese-400-normal.woff2',
  './assets/fonts/nunito-vietnamese-700-normal.woff2',
  './assets/fonts/nunito-vietnamese-900-normal.woff2',
  './assets/icons/icon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-512-maskable.png',
  './assets/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      // cache: 'reload' để luôn lấy bản mới nhất từ máy chủ khi cài bản mới
      .then((cache) => cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('toan-lop-2-') && k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Ưu tiên bộ nhớ đệm (chạy offline, mở nhanh); không có thì lấy từ mạng rồi lưu lại.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then((cached) => cached || fetch(req)),
    );
    return;
  }

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(
      (cached) =>
        cached ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          }
          return res;
        }),
    ),
  );
});
