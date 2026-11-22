/**
 * Màn hình kết quả + Xem lại bài.
 * Hiệu ứng theo điểm: ≥ 90% pháo hoa · 60–<90% "Hoàn thành tốt" · < 60% "Thử thách thất bại".
 */
import { celebrateWin, celebrateGood, failChallenge, badgePopup } from '../effects.js';
import { getBadge } from '../badges.js';
import { topicName, levelName, MODES } from '../topics.js';
import { renderVisual, renderBig } from '../visuals.js';
import { mascot } from '../mascot.js';
import { topBar, esc, fmtDuration, fmtDate, fmtScore } from './dom.js';
import { newQuizState } from './quiz.js';

export function topicsLabel(topics) {
  return topics.length > 1 ? `Tổng hợp (${topics.length} chủ đề)` : topicName(topics[0]);
}

export function render(root, { go, params }) {
  const { entry, newBadges = [], config, questions } = params;
  const pct = entry.scorePct;
  const tier = pct >= 90 ? 'win' : pct >= 60 ? 'good' : 'fail';
  const wrongQs = questions.filter((_, i) => !entry.questions[i].isCorrect);
  const title = { win: 'Xuất sắc!', good: 'Hoàn thành tốt!', fail: 'Cố lên nào!' }[tier];
  const sub = {
    win: 'Bé làm bài thật giỏi!',
    good: 'Bé làm tốt lắm, cố gắng thêm chút nữa nhé!',
    fail: 'Không sao đâu! Mình cùng thử lại nhé.',
  }[tier];

  root.innerHTML = `
  <div class="screen result tier-${tier}">
    ${topBar({ back: 'home', title: 'Kết quả' })}
    <main class="result-main">
      <section class="result-hero">
        ${tier === 'win' ? '<div class="trophy">🏆</div>' : mascot(tier === 'good' ? 'happy' : 'sad', 'result-mascot')}
        <div>
          <h2 class="result-title">${title}</h2>
          <div class="result-stars">${[0, 1, 2].map((i) => `<span class="${i < entry.stars ? 'on' : 'off'}">★</span>`).join('')}</div>
          <p class="result-sub">${sub}</p>
        </div>
      </section>
      <section class="score-tiles">
        <div class="tile tile-score"><b>${fmtScore(entry.score10)}</b><span>điểm</span></div>
        <div class="tile tile-pct"><b>${pct}%</b><span>tỉ lệ đúng</span></div>
        <div class="tile tile-ok"><b>✓ ${entry.correct}</b><span>câu đúng</span></div>
        <div class="tile tile-bad"><b>✗ ${entry.total - entry.correct}</b><span>câu sai</span></div>
        <div class="tile tile-time"><b>⏱ ${fmtDuration(entry.durationMs)}</b><span>thời gian</span></div>
      </section>
      ${newBadges.length ? `<section class="new-badges"><h3>Huy hiệu mới</h3><div>${newBadges.map((id) => getBadge(id)).filter(Boolean).map((b) => `<span class="badge-chip">${b.icon} ${esc(b.name)}</span>`).join('')}</div></section>` : ''}
      <section class="result-actions">
        ${tier === 'fail' ? '<button class="btn btn-big btn-orange" data-act="retry">🔄 Thử lại</button>' : ''}
        <button class="btn btn-big btn-blue" data-act="review">📋 Xem lại bài</button>
        ${tier !== 'fail' ? '<button class="btn btn-big btn-teal" data-act="retry">🔄 Làm lại đề này</button>' : ''}
        ${wrongQs.length ? `<button class="btn btn-big btn-red" data-act="retry-wrong">❗ Làm lại ${wrongQs.length} câu sai</button>` : ''}
        <button class="btn btn-big btn-green" data-act="new">✨ Làm đề mới</button>
        <button class="btn btn-big btn-gray" data-act="home">🏠 Về trang chủ</button>
      </section>
    </main>
  </div>`;

  const clean = (qs) => qs.map(({ userAnswer, isCorrect, ...q }) => q);
  const actions = {
    home: () => go('home'),
    review: () => go('review', { entry, back: 'result', resultParams: params }),
    retry: () => go('quiz', { state: newQuizState({ ...config, kind: 'retry' }, clean(questions)) }),
    'retry-wrong': () => go('quiz', { state: newQuizState({ ...config, count: wrongQs.length, kind: 'retry-wrong' }, clean(wrongQs)) }),
    new: () => go('quiz', { config: { topics: config.topics, count: config.count, level: config.level, mode: config.mode } }),
  };
  root.querySelector('.result').addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    actions[act]?.();
  });

  // Hiệu ứng chỉ chạy lần đầu vào màn hình (không chạy lại khi quay về từ "Xem lại bài")
  if (!params.effectsShown) {
    params.effectsShown = true;
    (async () => {
      let action = null;
      if (tier === 'win') await celebrateWin();
      else if (tier === 'good') await celebrateGood(entry.stars);
      else action = await failChallenge();
      if (action === 'retry') return actions.retry();
      for (const id of newBadges.filter((b) => !b.startsWith('streak') || entry.mode === 'test')) {
        const b = getBadge(id);
        if (b && root.querySelector('.result')) await badgePopup(b);
      }
    })();
  }
}

/** Xem lại bài: từng câu, đáp án bé chọn, đáp án đúng (xanh/đỏ + ✓ ✗). */
export function renderReview(root, { go, params }) {
  const { entry } = params;
  const qs = entry.questions || [];
  root.innerHTML = `
  <div class="screen review">
    ${topBar({ back: 'back', title: 'Xem lại bài' })}
    <main class="review-main">
      <div class="review-head">
        <div><b>${esc(topicsLabel(entry.topics))}</b> · ${levelName(entry.level)} · ${MODES[entry.mode]?.name || ''}</div>
        <div>${fmtDate(entry.finishedAt)} · ${fmtScore(entry.score10)} điểm · ✓ ${entry.correct}/${entry.total} · ⏱ ${fmtDuration(entry.durationMs)}</div>
      </div>
      ${qs.length ? '' : '<p class="empty">Bài này đã cũ nên không còn lưu chi tiết từng câu.</p>'}
      <ol class="review-list">
        ${qs.map((q, i) => `
          <li class="rv-item ${q.isCorrect ? 'ok' : 'bad'}">
            <div class="rv-num">${q.isCorrect ? '✓' : '✗'} Câu ${i + 1}</div>
            <div class="rv-text">${esc(q.text)}</div>
            ${renderBig(q.big)}
            ${q.visual ? `<div class="rv-visual">${renderVisual(q.visual)}</div>` : ''}
            <div class="rv-answers">
              <span class="rv-user ${q.isCorrect ? 'ok' : 'bad'}">Bé chọn: <b>${q.userAnswer == null ? '(chưa làm)' : esc(q.userAnswer) + (q.unit ? ' ' + esc(q.unit) : '')}</b> ${q.isCorrect ? '✓' : '✗'}</span>
              ${q.isCorrect ? '' : `<span class="rv-right">Đáp án đúng: <b>${esc(q.answer)}${q.unit ? ' ' + esc(q.unit) : ''}</b> ✓</span>`}
            </div>
            ${q.isCorrect ? '' : `<div class="rv-explain">💡 ${esc(q.explain)}</div>`}
          </li>`).join('')}
      </ol>
    </main>
  </div>`;
  root.querySelector('.review').addEventListener('click', (e) => {
    if (e.target.closest('[data-act="back"]')) {
      if (params.back === 'result') go('result', params.resultParams);
      else go('history');
    }
  });
}
