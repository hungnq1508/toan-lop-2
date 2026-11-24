/**
 * Màn hình "Ống heo" – bé xem số tiền thưởng đã tích được (chỉ xem, không có nút đặt lại).
 * Bố mẹ trao thưởng / đặt lại trong Cài đặt (sau cổng phụ huynh).
 */
import { getHistoryItem } from '../storage.js';
import { BONUS_TABLE, getBonusSummary, formatVnd } from '../bonus.js';
import { LEVELS, levelName } from '../topics.js';
import { topBar, esc, fmtDate, fmtScore } from './dom.js';
import { topicsLabel } from './result.js';

/** Bảng mức thưởng đơn giản (dùng chung cho Ống heo và Cài đặt). */
export function bonusTableHtml() {
  return `<table class="bonus-table">
    <thead><tr><th></th>${LEVELS.map((l) => `<th>${l.icon} ${esc(l.name)}</th>`).join('')}</tr></thead>
    <tbody>${Object.keys(BONUS_TABLE).map((n) => `<tr><th>${n} câu</th>${LEVELS.map((l) => `<td>${formatVnd(BONUS_TABLE[n][l.id] || 0)}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>`;
}

/** Danh sách các lần bố mẹ đã trao thưởng. */
export function payoutListHtml(payouts) {
  if (!payouts.length) return '<p class="empty">Chưa có lần trao thưởng nào.</p>';
  return `<ul class="payout-list">${payouts.map((p) => `
    <li><span class="po-date">${fmtDate(p.at)}</span><b class="po-amount">${formatVnd(p.amount)}</b>${p.note ? `<span class="po-note">${esc(p.note)}</span>` : ''}</li>`).join('')}</ul>`;
}

export function render(root, { go }) {
  const { balance, lifetimePaid, recentEarns, payouts } = getBonusSummary();
  const empty = balance === 0 && !recentEarns.length && !payouts.length;

  root.innerHTML = `
  <div class="screen piggy">
    ${topBar({ back: 'home', title: 'Ống heo của bé' })}
    <main class="piggy-main">
      <section class="piggy-hero ${empty ? 'is-empty' : ''}">
        <div class="piggy-pig" aria-hidden="true">🐷</div>
        <div class="piggy-balance" aria-label="Số dư">${formatVnd(balance)}</div>
        <p class="piggy-sub">Tổng đã nhận từ trước tới nay: <b>${formatVnd(lifetimePaid)}</b></p>
      </section>

      ${empty ? `<section class="panel piggy-empty">
          <p class="piggy-tip">Làm bài <b>📝 Kiểm tra</b> đạt từ <b>9 điểm</b> để bỏ tiền vào ống heo nhé!</p>
          ${bonusTableHtml()}
        </section>` : `
      <section class="panel"><h2>💰 Lần thưởng gần đây</h2>
        ${recentEarns.length ? `<ul class="h-list">${recentEarns.map((t) => {
          const has = !!getHistoryItem(t.historyId);
          return `<li><button class="h-item earn-item" data-id="${esc(t.historyId)}" ${has ? '' : 'disabled'}>
            <span class="earn-amount">+${formatVnd(t.amount)}</span>
            <span class="h-info"><b>${esc(topicsLabel(t.topics || []))}</b>
              <small>${fmtDate(t.at)} · ${levelName(t.level)} · ${t.count} câu · ${fmtScore(t.score10 ?? '')} điểm</small></span>
          </button></li>`;
        }).join('')}</ul>` : '<p class="empty">Ống heo vừa được đặt lại. Làm bài Kiểm tra đạt từ 9 điểm để bỏ tiền vào nhé!</p>'}
      </section>
      <details class="panel payout-panel">
        <summary><h2>🎁 Các lần bố mẹ đã trao thưởng</h2></summary>
        ${payoutListHtml(payouts)}
      </details>
      <section class="panel"><h2>📋 Mức thưởng</h2>${bonusTableHtml()}</section>`}
    </main>
  </div>`;

  root.onclick = (e) => {
    if (e.target.closest('[data-act="home"]')) return go('home');
    const item = e.target.closest('[data-id]');
    if (item && !item.disabled) {
      const entry = getHistoryItem(item.dataset.id);
      if (entry) go('review', { entry, back: 'piggy' });
    }
  };
  return () => (root.onclick = null);
}
