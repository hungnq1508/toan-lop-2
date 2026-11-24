/** Màn hình chính: lời chào, linh vật, 3 nút lớn. */
import { getSettings, getInProgress, getHistory, getStats } from '../storage.js';
import { mascot } from '../mascot.js';
import { topBar, esc } from './dom.js';
import { topicName } from '../topics.js';
import { bonusEnabled, getBonusSummary, formatVnd } from '../bonus.js';

const BACKUP_REMIND_DAYS = 30;

export function render(root, { go }) {
  const s = getSettings();
  const ip = getInProgress();
  const history = getHistory();
  const stars = getStats().totalStars;
  const showPiggy = bonusEnabled();
  const needBackup =
    history.length > 0 && (!s.lastBackupAt || Date.now() - s.lastBackupAt > BACKUP_REMIND_DAYS * 86400000);
  const hour = new Date().getHours();
  const hello = hour < 11 ? 'Chào buổi sáng' : hour < 14 ? 'Chào buổi trưa' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  root.innerHTML = `
  <div class="screen home">
    ${topBar({ middle: `<div class="home-totals"><div class="star-total" aria-label="Tổng số sao">⭐ ${stars}</div>${showPiggy ? `<button class="piggy-chip" data-act="piggy" aria-label="Ống heo: ${formatVnd(getBonusSummary().balance)}">🐷 ${formatVnd(getBonusSummary().balance)}</button>` : ''}</div>` })}
    <main class="home-main">
      <div class="home-hero">
        ${mascot('happy', 'home-mascot bounce')}
        <div class="bubble">
          <h1 class="greet">${hello}${s.childName ? `, <span class="name">${esc(s.childName)}</span>` : ''}!</h1>
          <p class="sub">Hôm nay mình cùng học Toán nhé!</p>
        </div>
      </div>
      ${ip ? `<button class="resume-card" data-act="resume">
          <span class="resume-ico">⏯️</span>
          <span><b>Làm tiếp bài dở</b><small>${esc(ip.config.topics.length > 1 ? 'Tổng hợp' : topicName(ip.config.topics[0]))} · câu ${Math.min(ip.current + 1, ip.questions.length)}/${ip.questions.length}</small></span>
        </button>` : ''}
      <nav class="home-actions">
        <button class="btn btn-huge btn-green" data-act="start"><span class="ico">▶️</span>Bắt đầu học</button>
        <button class="btn btn-huge btn-blue" data-act="history"><span class="ico">📒</span>Lịch sử</button>
        <button class="btn btn-huge btn-purple" data-act="settings"><span class="ico">⚙️</span>Cài đặt${needBackup ? '<span class="dot-alert" title="Nhắc phụ huynh sao lưu">!</span>' : ''}</button>
      </nav>
      ${needBackup ? '<p class="parent-note">👨‍👩‍👧 Nhắc phụ huynh: đã lâu chưa sao lưu lịch sử (Cài đặt → Sao lưu).</p>' : ''}
    </main>
  </div>`;

  root.querySelector('.home').addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'start') go('setup');
    else if (act === 'history') go('history');
    else if (act === 'settings') go('gate');
    else if (act === 'resume') go('quiz', { resume: true });
    else if (act === 'piggy') go('piggy');
  });
}
