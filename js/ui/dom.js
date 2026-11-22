/**
 * Tiện ích giao diện dùng chung: thanh trên cùng, hộp xác nhận, định dạng.
 */
import { getSettings } from '../storage.js';
import { esc } from '../visuals.js';

export { esc };

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Nút bật/tắt âm thanh – có ở mọi màn hình. */
export function soundToggle() {
  const on = getSettings().sound;
  return `<button class="icon-btn sound-toggle" data-act="toggle-sound" aria-label="${on ? 'Tắt' : 'Bật'} âm thanh" aria-pressed="${on}">${on ? '🔊' : '🔇'}</button>`;
}

/**
 * Thanh trên cùng.
 * @param back   data-act của nút quay lại (null = không có)
 */
export function topBar({ back = null, title = '', middle = '', right = '' } = {}) {
  return `<header class="topbar">
    ${back ? `<button class="icon-btn" data-act="${back}" aria-label="Quay lại">⬅</button>` : '<span class="icon-spacer"></span>'}
    ${middle || `<h1 class="topbar-title">${esc(title)}</h1>`}
    <div class="topbar-right">${right}${soundToggle()}</div>
  </header>`;
}

/**
 * Hộp xác nhận nút to (thay cho window.confirm).
 * @returns {Promise<boolean>}
 */
export function confirmDialog({ title, text = '', ok = 'Đồng ý', cancel = 'Không', danger = false, icon = '🤔' }) {
  return new Promise((resolve) => {
    const el = document.createElement('div');
    el.className = 'modal';
    el.innerHTML = `<div class="modal-card" role="dialog" aria-modal="true">
      <div class="modal-icon">${icon}</div>
      <h2>${esc(title)}</h2>${text ? `<p>${esc(text)}</p>` : ''}
      <div class="modal-actions">
        ${cancel ? `<button class="btn btn-gray" data-r="0">${esc(cancel)}</button>` : ''}
        <button class="btn ${danger ? 'btn-red' : 'btn-green'}" data-r="1">${esc(ok)}</button>
      </div></div>`;
    document.body.appendChild(el);
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-r]');
      if (!b) return;
      el.remove();
      resolve(b.dataset.r === '1');
    });
  });
}

/** Thông báo đơn giản một nút. */
export const alertDialog = (title, text = '', icon = 'ℹ️') => confirmDialog({ title, text, ok: 'Đã hiểu', cancel: null, icon });

/* ---------- Định dạng ---------- */
export function fmtDuration(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function fmtDate(ts) {
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** 8.5 → "8,5" (dấu phẩy thập phân kiểu Việt Nam). */
export const fmtScore = (n) => String(n).replace('.', ',');
