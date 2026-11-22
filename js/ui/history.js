/**
 * Lịch sử làm bài: thống kê, biểu đồ cột 10 lần gần nhất, chủ đề mạnh/yếu,
 * bộ sưu tập huy hiệu, danh sách bài (lọc theo chủ đề / thời gian).
 */
import { getHistory, getBadges, getStats } from '../storage.js';
import { TOPICS, MIXED_ID, levelName, MODES } from '../topics.js';
import { BADGES } from '../badges.js';
import { topBar, esc, fmtDate, fmtDuration, fmtScore } from './dom.js';
import { topicsLabel } from './result.js';

const filter = { topic: 'all', range: 'all' }; // ghi nhớ trong phiên

const RANGES = [
  { id: 'all', name: 'Tất cả' },
  { id: '7', name: '7 ngày' },
  { id: '30', name: '30 ngày' },
];

function applyFilter(list) {
  const now = Date.now();
  return list.filter((h) => {
    if (filter.range !== 'all' && now - h.finishedAt > +filter.range * 86400000) return false;
    if (filter.topic === 'all') return true;
    if (filter.topic === MIXED_ID) return h.topics.length > 1;
    return h.topics.includes(filter.topic);
  });
}

/** Tỉ lệ đúng theo chủ đề (dựa trên chi tiết từng câu). */
function topicAccuracy(list) {
  const acc = {};
  for (const h of list) {
    for (const q of h.questions || []) {
      acc[q.topic] ??= { ok: 0, all: 0 };
      acc[q.topic].all++;
      if (q.isCorrect) acc[q.topic].ok++;
    }
  }
  return TOPICS.filter((t) => acc[t.id]?.all).map((t) => ({ topic: t, pct: Math.round((acc[t.id].ok / acc[t.id].all) * 100), n: acc[t.id].all }));
}

function barChart(list) {
  const last = list.slice(0, 10).reverse();
  if (!last.length) return '';
  const W = 600, H = 220, pad = 34, bw = Math.min(44, (W - pad * 2) / last.length - 12);
  const step = (W - pad * 2) / last.length;
  let s = `<svg viewBox="0 0 ${W} ${H}" class="bar-chart" role="img" aria-label="Điểm 10 lần gần nhất">`;
  for (const v of [0, 5, 10]) {
    const y = H - 30 - (v / 10) * (H - 60);
    s += `<line x1="${pad}" y1="${y}" x2="${W - 8}" y2="${y}" class="grid"/><text x="${pad - 8}" y="${y + 6}" class="axis" text-anchor="end">${v}</text>`;
  }
  last.forEach((h, i) => {
    const v = h.score10 ?? h.scorePct / 10;
    const bh = Math.max(4, (v / 10) * (H - 60));
    const x = pad + i * step + (step - bw) / 2;
    const y = H - 30 - bh;
    const tier = h.scorePct >= 90 ? 'win' : h.scorePct >= 60 ? 'good' : 'fail';
    s += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="6" class="bar ${tier}"/>`;
    s += `<text x="${x + bw / 2}" y="${y - 8}" class="val" text-anchor="middle">${fmtScore(v)}</text>`;
    s += `<text x="${x + bw / 2}" y="${H - 8}" class="axis" text-anchor="middle">${new Date(h.finishedAt).getDate()}/${new Date(h.finishedAt).getMonth() + 1}</text>`;
  });
  return s + '</svg>';
}

export function render(root, { go }) {
  function paint() {
    const all = getHistory();
    const list = applyFilter(all);
    const badges = getBadges();
    const avg = list.length ? Math.round((list.reduce((s, h) => s + (h.score10 ?? h.scorePct / 10), 0) / list.length) * 10) / 10 : 0;
    const acc = topicAccuracy(list);
    const best = acc.length ? acc.reduce((a, b) => (b.pct > a.pct ? b : a)) : null;
    const worst = acc.length > 1 ? acc.reduce((a, b) => (b.pct < a.pct ? b : a)) : null;

    const chip = (key, id, name) => `<button class="chip ${filter[key] === id ? 'on' : ''}" data-f="${key}" data-v="${id}">${esc(name)}</button>`;

    root.innerHTML = `
    <div class="screen history">
      ${topBar({ back: 'home', title: 'Lịch sử làm bài' })}
      <main class="history-main">
        <section class="filters">
          <div class="chips">${chip('topic', 'all', 'Tất cả chủ đề')}${TOPICS.map((t) => chip('topic', t.id, `${t.icon} ${t.name}`)).join('')}${chip('topic', MIXED_ID, '🧩 Tổng hợp')}</div>
          <div class="chips">${RANGES.map((r) => chip('range', r.id, r.name)).join('')}</div>
        </section>

        <section class="stat-tiles">
          <div class="tile"><b>${list.length}</b><span>bài đã làm</span></div>
          <div class="tile"><b>${fmtScore(avg)}</b><span>điểm trung bình</span></div>
          <div class="tile"><b>⭐ ${getStats().totalStars}</b><span>tổng số sao</span></div>
        </section>

        ${list.length ? `<section class="panel"><h2>📊 Điểm 10 lần gần nhất</h2>${barChart(list)}</section>` : ''}

        ${acc.length ? `<section class="panel"><h2>💪 Tỉ lệ đúng theo chủ đề</h2>
          <div class="acc-list">${acc.map((a) => `
            <div class="acc-row">
              <span class="acc-name">${a.topic.icon} ${esc(a.topic.name)}
                ${best && a.topic.id === best.topic.id && a.pct >= 70 ? '<em class="tag strong">Giỏi nhất</em>' : ''}
                ${worst && a.topic.id === worst.topic.id && a.pct < 80 ? '<em class="tag weak">Cần luyện thêm</em>' : ''}</span>
              <span class="acc-bar"><span style="width:${a.pct}%;background:${a.topic.color}"></span></span>
              <span class="acc-pct">${a.pct}%</span>
            </div>`).join('')}</div></section>` : ''}

        <section class="panel"><h2>🏅 Bộ sưu tập huy hiệu</h2>
          <div class="badge-grid">${BADGES.map((b) => {
            const got = badges.find((x) => x.id === b.id);
            return `<div class="badge ${got ? 'got' : 'locked'}" title="${esc(b.desc)}">
              <span class="b-ico">${got ? b.icon : '🔒'}</span><span class="b-name">${esc(b.name)}</span>
              <span class="b-desc">${got ? (got.count > 1 ? `× ${got.count}` : 'Đã đạt') : esc(b.desc)}</span></div>`;
          }).join('')}</div></section>

        <section class="panel"><h2>📒 Các bài đã làm</h2>
          ${list.length ? `<ul class="h-list">${list.map((h) => `
            <li><button class="h-item tier-${h.scorePct >= 90 ? 'win' : h.scorePct >= 60 ? 'good' : 'fail'}" data-id="${esc(h.id)}">
              <span class="h-score">${fmtScore(h.score10 ?? h.scorePct / 10)}<small>điểm</small></span>
              <span class="h-info"><b>${esc(topicsLabel(h.topics))}</b>
                <small>${fmtDate(h.finishedAt)} · ${levelName(h.level)} · ${MODES[h.mode]?.name || ''} · ${h.correct}/${h.total} câu · ⏱ ${fmtDuration(h.durationMs)}</small></span>
              <span class="h-stars">${'★'.repeat(h.stars || 0)}${'☆'.repeat(3 - (h.stars || 0))}</span>
            </button></li>`).join('')}</ul>` : `<p class="empty">${all.length ? 'Không có bài nào khớp bộ lọc.' : 'Bé chưa làm bài nào. Bấm “Bắt đầu học” nhé!'}</p>`}
        </section>
      </main>
    </div>`;
  }

  root.onclick = (e) => {
    const f = e.target.closest('[data-f]');
    if (f) {
      filter[f.dataset.f] = f.dataset.v;
      const y = root.querySelector('.history-main')?.scrollTop || 0;
      paint();
      root.querySelector('.history-main').scrollTop = y;
      return;
    }
    const item = e.target.closest('[data-id]');
    if (item) {
      const entry = getHistory().find((h) => h.id === item.dataset.id);
      if (entry) go('review', { entry, back: 'history' });
      return;
    }
    if (e.target.closest('[data-act="home"]')) go('home');
  };
  paint();
  return () => (root.onclick = null);
}
