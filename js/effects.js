/**
 * Hiệu ứng: sao bay, rung nút, huy hiệu, pháo hoa, "Hoàn thành tốt", "Thử thách thất bại".
 * Mọi hiệu ứng toàn màn hình ≤ 4 giây và bấm bất kỳ đâu để bỏ qua.
 */
import confetti from './lib/confetti.module.js';
import { play } from './sound.js';
import { mascot } from './mascot.js';
import { esc } from './visuals.js';
import { formatVnd } from './bonus.js';

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const PRAISES = ['Giỏi quá!', 'Tuyệt vời!', 'Đúng rồi!', 'Xuất sắc!', 'Bé giỏi lắm!', 'Hoan hô!', 'Chính xác!', 'Siêu quá!'];
export const CHEERS = ['Cố lên nào!', 'Không sao đâu!', 'Suýt đúng rồi!', 'Bé làm được mà!', 'Mình cùng xem lại nhé!'];
export const randomOf = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Ngôi sao bay từ phần tử `from` lên phần tử `to`. */
export function flyStar(from, to) {
  if (!from) return;
  const a = from.getBoundingClientRect();
  const b = to ? to.getBoundingClientRect() : { left: a.left, top: -40, width: 0, height: 0 };
  const star = document.createElement('div');
  star.className = 'fly-star';
  star.textContent = '⭐';
  star.style.left = `${a.left + a.width / 2 - 24}px`;
  star.style.top = `${a.top + a.height / 2 - 24}px`;
  document.body.appendChild(star);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const anim = star.animate(
    [
      { transform: 'translate(0,0) scale(0.6) rotate(0deg)', opacity: 1 },
      { transform: `translate(${dx * 0.4}px, ${dy * 0.4 - 80}px) scale(1.6) rotate(180deg)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.5) rotate(360deg)`, opacity: 0.2 },
    ],
    { duration: reduceMotion() ? 10 : 900, easing: 'cubic-bezier(.3,.7,.4,1)' },
  );
  anim.onfinish = () => star.remove();
}

/** Rung nhẹ một phần tử (trả lời sai). */
export function shake(el) {
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth; // khởi động lại animation
  el.classList.add('shake');
}

/** Lời khen/động viên nổi lên giữa màn hình. */
export function toast(text, kind = 'good', ms = 1300) {
  const t = document.createElement('div');
  t.className = `toast toast-${kind}`;
  t.textContent = text;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('out'), ms - 300);
  setTimeout(() => t.remove(), ms);
}

/**
 * Lớp phủ toàn màn hình. Tự đóng sau `ms`, hoặc khi bấm bất kỳ đâu.
 * Trả về Promise khi đóng; giá trị là data-action của nút được bấm (nếu có).
 */
function overlay(html, { ms = 4000, cls = '' } = {}) {
  return new Promise((resolve) => {
    const el = document.createElement('div');
    el.className = `fx-overlay ${cls}`;
    el.innerHTML = `<div class="fx-card">${html}<div class="fx-skip">Chạm để tiếp tục</div></div>`;
    document.body.appendChild(el);
    let done = false;
    const close = (action = null) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      el.classList.add('out');
      setTimeout(() => el.remove(), 250);
      resolve(action);
    };
    const timer = setTimeout(() => close(), ms);
    el.addEventListener('pointerup', (e) => {
      const btn = e.target.closest('[data-action]');
      close(btn ? btn.dataset.action : null);
    });
  });
}

/** Huy hiệu mới. */
export function badgePopup(badge) {
  play('streak');
  return overlay(
    `<div class="fx-badge">${badge.icon}</div><div class="fx-title">Huy hiệu mới!</div><div class="fx-sub">${esc(badge.name)}</div>`,
    { ms: 2200, cls: 'fx-small' },
  );
}

/** Tiền thưởng: đồng xu rơi vào ống heo + "leng keng" (≤ 3 giây, chạm để bỏ qua). */
export function piggyPopup(amount, balance) {
  play('coin');
  const coins = reduceMotion() ? '' : [0, 1, 2].map((i) => `<span class="fx-coin" style="animation-delay:${i * 0.3}s">🪙</span>`).join('');
  return overlay(
    `<div class="fx-piggy-wrap">${coins}<div class="fx-piggy">🐷</div></div>
     <div class="fx-title">Bé được thưởng ${formatVnd(amount)}!</div>
     <div class="fx-sub">Ống heo đang có <b>${formatVnd(balance)}</b></div>`,
    { ms: 3000, cls: 'fx-small fx-bonus' },
  );
}

/* ---------- Pháo hoa ---------- */
let confettiCanvas = null;
let shoot = null;
function getConfetti() {
  if (!shoot) {
    confettiCanvas = document.createElement('canvas');
    confettiCanvas.className = 'confetti-canvas';
    document.body.appendChild(confettiCanvas);
    shoot = confetti.create(confettiCanvas, { resize: true, useWorker: false });
  }
  return shoot;
}

export function fireworks(duration = 3500) {
  if (reduceMotion()) return;
  const fire = getConfetti();
  const end = Date.now() + duration;
  const colors = ['#ef4444', '#f59e0b', '#facc15', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
  (function burst() {
    if (Date.now() > end) return;
    fire({
      particleCount: 60,
      startVelocity: 38,
      spread: 360,
      ticks: 70,
      gravity: 0.9,
      scalar: 1.1,
      colors,
      origin: { x: 0.15 + Math.random() * 0.7, y: 0.15 + Math.random() * 0.35 },
    });
    setTimeout(burst, 380);
  })();
  fire({ particleCount: 120, spread: 100, origin: { x: 0.5, y: 0.8 }, colors });
}

export function stopFireworks() {
  shoot?.reset();
}

const starsHtml = (n, total = 3) =>
  `<div class="fx-stars">${Array.from({ length: total }, (_, i) => `<span class="${i < n ? 'on' : 'off'}" style="animation-delay:${0.3 + i * 0.25}s">★</span>`).join('')}</div>`;

/** Kết quả ≥ 90%: pháo hoa + nhạc chiến thắng + cúp vàng + 3 sao. */
export async function celebrateWin() {
  play('win');
  fireworks(3500);
  await overlay(
    `<div class="fx-trophy">🏆</div><div class="fx-title">Xuất sắc!</div>${starsHtml(3)}<div class="fx-sub">Bé nhận được Cúp vàng!</div>`,
    { cls: 'fx-win' },
  );
  stopFireworks();
}

/** 60% – < 90%: "Hoàn thành tốt!" + 1–2 sao. */
export function celebrateGood(stars) {
  play('good');
  return overlay(
    `${mascot('happy', 'fx-mascot bounce')}<div class="fx-title">Hoàn thành tốt!</div>${starsHtml(stars)}<div class="fx-sub">Cố gắng thêm chút nữa để được 3 sao nhé!</div>`,
    { ms: 3500, cls: 'fx-good' },
  );
}

/** < 60%: "Thử thách thất bại" – linh vật buồn/ngã, vui nhộn, không chê trách. */
export function failChallenge() {
  play('fail');
  return overlay(
    `${mascot('sad', 'fx-mascot fall')}<div class="fx-title">Ôi không! Thử thách thất bại</div>
     <div class="fx-sub">${randomOf(['Không sao đâu, mình cùng thử lại nhé!', 'Lần sau bé sẽ làm tốt hơn!', 'Cú Tròn tin bé làm được!'])}</div>
     <button class="btn btn-big btn-orange" data-action="retry">🔄 Thử lại</button>`,
    { ms: 4000, cls: 'fx-fail' },
  );
}
