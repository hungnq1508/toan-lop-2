/**
 * Điểm khởi động ứng dụng: nạp dữ liệu, điều hướng giữa các màn hình,
 * xử lý nút âm thanh chung, chặn phóng to, đăng ký service worker (PWA).
 */
import { loadTopics } from './topics.js';
import { getSettings, saveSettings, requestPersistence } from './storage.js';
import { unlock, play } from './sound.js';
import { stopSpeaking } from './speech.js';
import * as home from './ui/home.js';
import * as setup from './ui/setup.js';
import * as quiz from './ui/quiz.js';
import * as result from './ui/result.js';
import * as history from './ui/history.js';
import * as settings from './ui/settings.js';
import * as piggy from './ui/piggy.js';
import { soundToggle } from './ui/dom.js';

const root = document.getElementById('app');

const SCREENS = {
  home: home.render,
  setup: setup.render,
  quiz: quiz.render,
  result: result.render,
  review: result.renderReview,
  history: history.render,
  gate: settings.renderGate,
  settings: settings.renderSettings,
  piggy: piggy.render,
};

let cleanup = null;
let current = null;

/** Chuyển màn hình. */
export function go(name, params = {}) {
  try {
    cleanup?.();
  } catch (e) {
    console.warn(e);
  }
  cleanup = null;
  stopSpeaking();
  document.querySelectorAll('.modal').forEach((m) => m.remove());
  current = name;
  root.dataset.screen = name;
  const fn = SCREENS[name] || SCREENS.home;
  const ret = fn(root, { go, params });
  cleanup = typeof ret === 'function' ? ret : null;
  root.scrollTop = 0;
  window.scrollTo(0, 0);
}

/* ---------- Nút bật/tắt âm thanh (có ở mọi màn hình) ---------- */
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act="toggle-sound"]');
  if (!b) return;
  const on = !getSettings().sound;
  saveSettings({ sound: on });
  document.querySelectorAll('.sound-toggle').forEach((el) => (el.outerHTML = soundToggle()));
  if (on) {
    unlock();
    play('tap');
  }
});

/* ---------- iOS: mở khoá âm thanh ở lần chạm đầu tiên ---------- */
const firstTouch = () => {
  unlock();
  document.removeEventListener('pointerdown', firstTouch, true);
};
document.addEventListener('pointerdown', firstTouch, true);

/* ---------- Chặn phóng to bằng chụm ngón / chạm đúp (Safari iOS) ---------- */
['gesturestart', 'gesturechange', 'gestureend'].forEach((ev) => document.addEventListener(ev, (e) => e.preventDefault(), { passive: false }));
// Chạm đúp để phóng to đã được tắt bằng CSS `touch-action: manipulation`
// (không chặn touchend vì sẽ làm mất lần bấm nhanh liên tiếp trên bàn phím số).
document.addEventListener('contextmenu', (e) => {
  if (!e.target.closest('input, textarea')) e.preventDefault();
});

/* ---------- PWA: service worker để chạy ngoại tuyến ---------- */
// Khi phát triển trên máy (localhost) bỏ qua service worker để luôn thấy mã mới;
// thêm "?sw" vào địa chỉ để thử chế độ ngoại tuyến trên máy.
const isDev = ['localhost', '127.0.0.1'].includes(location.hostname) && !location.search.includes('sw');
if ('serviceWorker' in navigator && location.protocol !== 'file:' && !isDev) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch((e) => console.warn('SW lỗi', e));
  });
}

/* ---------- Khởi động ---------- */
async function boot() {
  requestPersistence();
  try {
    await loadTopics();
  } catch (e) {
    console.error(e);
    root.innerHTML = '<div class="boot-error">Không tải được dữ liệu câu hỏi. Hãy kiểm tra kết nối mạng rồi mở lại nhé.</div>';
    return;
  }
  document.documentElement.classList.add('ready');
  go('home');
}
boot();

// Dùng khi gỡ lỗi trên máy tính
window.__app = { go, get screen() { return current; } };
