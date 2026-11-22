/**
 * Tạo bài kiểm tra – 3 bước, mỗi bước một màn hình:
 *   1. Chọn chủ đề (chọn nhiều) hoặc "Tổng hợp"
 *   2. Chọn số câu (10/20) và mức độ (Dễ/Vừa/Khó)
 *   3. Chọn hình thức (Luyện tập/Kiểm tra) → bắt đầu
 */
import { getSettings, getInProgress } from '../storage.js';
import { TOPICS, LEVELS, MODES, MIXED } from '../topics.js';
import { topBar, confirmDialog, esc } from './dom.js';
import { play, unlock } from '../sound.js';

// Ghi nhớ lựa chọn lần trước trong phiên làm việc
const last = { topics: [], mixed: false, count: 10, level: 1 };

export function render(root, { go }) {
  unlock(); // iOS: mở khoá âm thanh ngay sau lần chạm "Bắt đầu học"
  const enabled = TOPICS.filter((t) => getSettings().enabledTopics.includes(t.id));
  const cfg = { ...last, topics: last.topics.filter((id) => enabled.some((t) => t.id === id)) };
  let step = 1;

  function paint() {
    const steps = `<div class="steps" aria-label="Bước ${step}/3">${[1, 2, 3].map((i) => `<span class="${i === step ? 'on' : i < step ? 'done' : ''}">${i}</span>`).join('')}</div>`;
    let body = '';
    if (step === 1) {
      body = `
        <h2 class="step-title">Bé muốn học gì?</h2>
        <div class="topic-grid">
          ${enabled.map((t) => `<button class="topic-card ${!cfg.mixed && cfg.topics.includes(t.id) ? 'selected' : ''}" data-topic="${t.id}" style="--c:${t.color}" aria-pressed="${cfg.topics.includes(t.id)}">
              <span class="tc-ico">${t.icon}</span><span class="tc-name">${esc(t.name)}</span><span class="tc-check">✓</span></button>`).join('')}
          ${enabled.length > 1 ? `<button class="topic-card mixed ${cfg.mixed ? 'selected' : ''}" data-topic="mixed" style="--c:${MIXED.color}">
              <span class="tc-ico">${MIXED.icon}</span><span class="tc-name">Tổng hợp<small>Trộn tất cả chủ đề</small></span><span class="tc-check">✓</span></button>` : ''}
        </div>
        ${enabled.length === 0 ? '<p class="empty">Chưa có chủ đề nào được bật. Nhờ bố mẹ vào Cài đặt nhé!</p>' : ''}
        <div class="step-actions"><button class="btn btn-big btn-green" data-act="next" ${cfg.mixed || cfg.topics.length ? '' : 'disabled'}>Tiếp theo ➜</button></div>`;
    } else if (step === 2) {
      body = `
        <h2 class="step-title">Làm bao nhiêu câu?</h2>
        <div class="choice-row">
          ${[10, 20].map((n) => `<button class="pick-card ${cfg.count === n ? 'selected' : ''}" data-count="${n}"><b>${n}</b><span>câu</span></button>`).join('')}
        </div>
        <h2 class="step-title">Mức độ</h2>
        <div class="choice-row">
          ${LEVELS.map((l) => `<button class="pick-card level-${l.id} ${cfg.level === l.id ? 'selected' : ''}" data-level="${l.id}"><b>${l.icon}</b><span>${l.name}</span></button>`).join('')}
        </div>
        <div class="step-actions"><button class="btn btn-big btn-green" data-act="next">Tiếp theo ➜</button></div>`;
    } else {
      body = `
        <h2 class="step-title">Bé muốn làm bài thế nào?</h2>
        <div class="mode-grid">
          <button class="mode-card practice" data-mode="practice">
            <span class="mc-ico">${MODES.practice.icon}</span><b>${MODES.practice.name}</b>
            <span>Biết đúng sai ngay sau mỗi câu</span></button>
          <button class="mode-card test" data-mode="test">
            <span class="mc-ico">${MODES.test.icon}</span><b>${MODES.test.name}</b>
            <span>Làm hết bài rồi bấm Nộp bài</span></button>
        </div>`;
    }
    root.innerHTML = `<div class="screen setup">${topBar({ back: 'back', middle: steps })}<main class="setup-main">${body}</main></div>`;
  }

  async function start(mode) {
    if (getInProgress()) {
      const ok = await confirmDialog({
        title: 'Bé đang có bài làm dở',
        text: 'Nếu làm bài mới, bài dở sẽ bị bỏ. Bé có muốn làm bài mới không?',
        ok: 'Làm bài mới',
        cancel: 'Không',
      });
      if (!ok) return;
    }
    Object.assign(last, cfg);
    const topics = cfg.mixed ? enabled.map((t) => t.id) : cfg.topics;
    go('quiz', { config: { topics, count: cfg.count, level: cfg.level, mode } });
  }

  root.onclick = (e) => {
    const t = e.target.closest('button');
    if (!t || t.disabled) return;
    if (t.dataset.act === 'back') {
      if (step === 1) go('home');
      else {
        step--;
        paint();
      }
      return;
    }
    if (t.dataset.act === 'next') {
      play('tap');
      step++;
      paint();
      return;
    }
    if (t.dataset.topic) {
      play('tap');
      const id = t.dataset.topic;
      if (id === 'mixed') {
        cfg.mixed = !cfg.mixed;
        if (cfg.mixed) cfg.topics = [];
      } else {
        cfg.mixed = false;
        cfg.topics = cfg.topics.includes(id) ? cfg.topics.filter((x) => x !== id) : [...cfg.topics, id];
      }
      paint();
      return;
    }
    if (t.dataset.count) {
      play('tap');
      cfg.count = +t.dataset.count;
      paint();
      return;
    }
    if (t.dataset.level) {
      play('tap');
      cfg.level = +t.dataset.level;
      paint();
      return;
    }
    if (t.dataset.mode) {
      play('tap');
      start(t.dataset.mode);
    }
  };

  paint();
  return () => (root.onclick = null);
}
