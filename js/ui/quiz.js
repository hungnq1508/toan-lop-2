/**
 * Màn hình làm bài.
 *  - Luyện tập: trả lời → biết đúng/sai ngay, sai thì xem đáp án + giải thích rồi sang câu tiếp.
 *  - Kiểm tra: làm hết đề, được quay lại sửa, có lưới chọn câu, bấm Nộp bài mới chấm.
 * Bài dở được lưu sau mỗi thao tác để làm tiếp.
 */
import { generateQuestions, grade, isCorrect, starsFor } from '../quiz-engine.js';
import { getTopic, MIXED, topicName } from '../topics.js';
import { getSettings, saveInProgress, getInProgress, clearInProgress, addHistory, addStars, awardBadge } from '../storage.js';
import { renderVisual, renderBig } from '../visuals.js';
import { play } from '../sound.js';
import { speak, stopSpeaking, questionSpeech, speechSupported } from '../speech.js';
import { flyStar, shake, toast, badgePopup, PRAISES, CHEERS, randomOf } from '../effects.js';
import { streakBadgeFor, getBadge, evaluateBadges } from '../badges.js';
import { creditBonus } from '../bonus.js';
import { createKeypad } from './keypad.js';
import { soundToggle, confirmDialog, esc, fmtDuration } from './dom.js';

/** Tạo trạng thái bài mới. */
export function newQuizState(config, questions = null) {
  const qs = questions || generateQuestions(config.topics, config.count, config.level);
  return {
    id: `q${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    config,
    questions: qs,
    answers: Array(qs.length).fill(null),
    current: 0,
    startedAt: Date.now(),
    elapsedMs: 0,
    streak: 0,
    streakBadges: [],
  };
}

export function render(root, { go, params = {} }) {
  let state;
  if (params.resume) state = getInProgress();
  else if (params.state) state = params.state;
  else state = newQuizState(params.config);
  if (!state) return go('home');

  const settings = getSettings();
  const practice = state.config.mode === 'practice';
  const total = state.questions.length;
  let segmentStart = performance.now();
  let keypad = null;
  let locked = false; // đang hiện phản hồi (Luyện tập)
  let advanceTimer = null;
  let timerInterval = null;
  let finished = false;

  const elapsed = () => state.elapsedMs + (performance.now() - segmentStart);
  function persist() {
    state.elapsedMs = elapsed();
    segmentStart = performance.now();
    saveInProgress(state);
  }
  persist();

  // Tạm dừng đồng hồ khi chuyển ứng dụng
  const onVis = () => {
    if (document.hidden) persist();
    else segmentStart = performance.now();
  };
  document.addEventListener('visibilitychange', onVis);

  /* ---------- Khung màn hình ---------- */
  const topic = state.config.topics.length > 1 ? MIXED : getTopic(state.config.topics[0]);
  root.innerHTML = `
  <div class="screen quiz ${practice ? 'mode-practice' : 'mode-test'}" style="--c:${topic?.color || '#2563eb'}">
    <header class="topbar quiz-top">
      <button class="icon-btn" data-act="exit" aria-label="Thoát">✕</button>
      <div class="progress-wrap">
        <div class="q-count"></div>
        <div class="path" role="progressbar" aria-valuemin="1" aria-valuemax="${total}"></div>
      </div>
      <div class="topbar-right">
        ${settings.timer ? '<div class="timer" aria-label="Thời gian">⏱ <span>00:00</span></div>' : ''}
        ${!practice ? '<button class="icon-btn" data-act="grid" aria-label="Danh sách câu">▦</button>' : ''}
        ${settings.voice && speechSupported() ? '<button class="icon-btn speak-btn" data-act="speak" aria-label="Nghe đọc đề">🗣️</button>' : ''}
        ${soundToggle()}
      </div>
    </header>
    <main class="quiz-main">
      <section class="q-card"></section>
      <section class="answer-area"></section>
    </main>
    <div class="feedback" hidden></div>
    ${!practice ? `<footer class="quiz-nav">
      <button class="btn btn-gray nav-prev" data-act="prev">◀ Câu trước</button>
      <button class="btn btn-orange nav-submit" data-act="submit">📨 Nộp bài</button>
      <button class="btn btn-blue nav-next" data-act="next">Câu sau ▶</button>
    </footer>` : ''}
  </div>`;

  const screen = root.querySelector('.quiz');
  const card = screen.querySelector('.q-card');
  const area = screen.querySelector('.answer-area');
  const feedback = screen.querySelector('.feedback');
  const pathEl = screen.querySelector('.path');
  const countEl = screen.querySelector('.q-count');

  if (settings.timer) {
    const tEl = screen.querySelector('.timer span');
    const tick = () => (tEl.textContent = fmtDuration(elapsed()));
    tick();
    timerInterval = setInterval(tick, 1000);
  }

  /* ---------- Thanh tiến độ dạng đường đi ngôi sao ---------- */
  function paintPath() {
    countEl.textContent = `Câu ${state.current + 1}/${total}`;
    pathEl.setAttribute('aria-valuenow', state.current + 1);
    pathEl.innerHTML = state.questions
      .map((qn, i) => {
        const a = state.answers[i];
        let cls = 'p-dot';
        let label = '';
        if (practice && a !== null) {
          const ok = isCorrect(qn, a);
          cls += ok ? ' p-ok' : ' p-bad';
          label = ok ? '★' : '✗';
        } else if (!practice && a !== null) {
          cls += ' p-done';
          label = '●';
        }
        if (i === state.current) cls += ' p-cur';
        return `<span class="${cls}" data-i="${i}">${label}</span>`;
      })
      .join('');
  }

  /* ---------- Vẽ một câu hỏi ---------- */
  function paintQuestion() {
    clearTimeout(advanceTimer);
    stopSpeaking();
    keypad?.destroy();
    keypad = null;
    locked = false;
    feedback.hidden = true;
    feedback.innerHTML = '';
    const qn = state.questions[state.current];
    const tp = getTopic(qn.topic);
    const userAns = state.answers[state.current];
    const isLongText = qn.text.length > 90;
    card.className = `q-card ${qn.visual ? 'has-visual' : ''} ${isLongText ? 'long' : ''}`;
    card.innerHTML = `
      ${state.config.topics.length > 1 && tp ? `<div class="q-topic">${tp.icon} ${esc(tp.name)}</div>` : ''}
      <div class="q-text">${esc(qn.text)}</div>
      ${renderBig(qn.big)}
      ${renderVisual(qn.visual)}`;

    area.className = `answer-area type-${qn.type}`;
    if (qn.type === 'input') {
      screen.classList.add('with-keypad');
      keypad = createKeypad(area, {
        unit: qn.unit,
        maxLen: 3,
        initial: !practice && userAns ? userAns : '',
        onSubmit: (v) => answer(v, null),
      });
    } else {
      screen.classList.remove('with-keypad');
      const long = qn.choices.some((c) => c.length > 16);
      const cls = qn.type === 'compare' ? 'compare' : qn.type === 'truefalse' ? 'tf' : `n${qn.choices.length}${long ? ' long' : ''}`;
      area.innerHTML = `<div class="choices ${cls}">${qn.choices
        .map((c) => {
          const label = qn.type === 'truefalse' ? (c === 'Đúng' ? '👍 Đúng' : '👎 Sai') : esc(c);
          return `<button class="choice ${!practice && userAns === c ? 'selected' : ''}" data-choice="${esc(c)}"><span class="mark"></span><span class="ct">${label}</span></button>`;
        })
        .join('')}</div>`;
    }
    paintPath();
    if (!practice) {
      screen.querySelector('.nav-prev').disabled = state.current === 0;
      screen.querySelector('.nav-next').disabled = state.current === total - 1;
    }
  }

  /* ---------- Trả lời ---------- */
  function answer(value, btn) {
    if (locked || finished) return;
    const i = state.current;
    const qn = state.questions[i];
    state.answers[i] = value;

    if (!practice) {
      // Kiểm tra: chỉ ghi nhận, tự sang câu sau
      play('tap');
      area.querySelectorAll('.choice').forEach((b) => b.classList.toggle('selected', b === btn));
      if (keypad) keypad.setState('selected');
      persist();
      paintPath();
      if (i < total - 1) advanceTimer = setTimeout(() => go_to(i + 1), 450);
      else toast('Bé làm hết rồi! Kiểm tra lại hoặc bấm Nộp bài nhé.', 'info', 2200);
      return;
    }

    // Luyện tập: chấm ngay
    locked = true;
    const ok = isCorrect(qn, value);
    const correctBtn = area.querySelector(`.choice[data-choice="${CSS.escape(qn.answer)}"]`);
    area.querySelectorAll('.choice').forEach((b) => (b.disabled = true));
    keypad?.lock();
    if (ok) {
      state.streak++;
      (btn || correctBtn)?.classList.add('correct');
      keypad?.setState('correct');
      play('correct');
      flyStar(btn || area.querySelector('.kp-display'), pathEl.querySelector(`[data-i="${i}"]`));
      const praise = randomOf(PRAISES);
      showFeedback(true, praise, qn);
    } else {
      state.streak = 0;
      btn?.classList.add('wrong');
      correctBtn?.classList.add('correct', 'reveal');
      keypad?.setState('wrong');
      keypad?.showAnswer(qn.answer);
      shake(btn || area.querySelector('.kp-display'));
      play('wrong');
      showFeedback(false, randomOf(CHEERS), qn);
    }
    // Điền đáp án đúng vào ô trống của biểu thức
    const bigEl = card.querySelector('.q-big');
    if (bigEl && qn.big) {
      bigEl.outerHTML = renderBig(qn.big, qn.answer);
      card.querySelector('.q-big .slot')?.classList.add('filled');
    }
    persist();
    paintPath();

    // Huy hiệu chuỗi 5 câu đúng
    const badgeId = ok ? streakBadgeFor(state.streak) : null;
    if (badgeId) {
      awardBadge(badgeId);
      state.streakBadges.push(badgeId);
      persist();
      clearTimeout(advanceTimer);
      // Chỉ tự sang câu sau nếu bé chưa tự bấm "Tiếp tục"
      setTimeout(() => badgePopup(getBadge(badgeId)).then(() => state.current === i && next()), 500);
    }
  }

  function showFeedback(ok, msg, qn) {
    feedback.hidden = false;
    feedback.className = `feedback ${ok ? 'fb-ok' : 'fb-bad'}`;
    feedback.innerHTML = ok
      ? `<div class="fb-msg"><span class="fb-ico">✓</span>${esc(msg)}</div>
         <button class="btn btn-green fb-next" data-act="continue">Tiếp tục ➜</button>`
      : `<div class="fb-msg"><span class="fb-ico">💪</span><div><b>${esc(msg)}</b>
           <div class="fb-answer">Đáp án đúng: <strong>${esc(qn.answer)}${qn.unit ? ' ' + esc(qn.unit) : ''}</strong></div>
           <div class="fb-explain">${esc(qn.explain)}</div></div></div>
         <button class="btn btn-blue fb-next" data-act="continue">Tiếp tục ➜</button>`;
    if (ok) advanceTimer = setTimeout(() => next(), 1500);
  }

  function next() {
    clearTimeout(advanceTimer);
    if (finished) return;
    if (state.current >= total - 1) return finish();
    go_to(state.current + 1);
  }

  function go_to(i) {
    if (i < 0 || i >= total) return;
    state.current = i;
    persist();
    paintQuestion();
  }

  /* ---------- Lưới câu hỏi (Kiểm tra) ---------- */
  function showGrid() {
    const el = document.createElement('div');
    el.className = 'modal';
    const left = state.answers.filter((a) => a === null).length;
    el.innerHTML = `<div class="modal-card grid-card">
      <h2>Danh sách câu</h2>
      <p class="grid-legend"><span class="g-done">✓</span> đã làm · <span class="g-todo">?</span> chưa làm${left ? ` · còn ${left} câu` : ''}</p>
      <div class="q-grid">${state.questions
        .map((_, i) => `<button class="${state.answers[i] !== null ? 'done' : 'todo'} ${i === state.current ? 'cur' : ''}" data-go="${i}">${i + 1}</button>`)
        .join('')}</div>
      <div class="modal-actions"><button class="btn btn-gray" data-go="close">Đóng</button><button class="btn btn-orange" data-go="submit">📨 Nộp bài</button></div>
    </div>`;
    document.body.appendChild(el);
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-go]');
      if (!b && e.target !== el) return;
      el.remove();
      if (!b || b.dataset.go === 'close') return;
      if (b.dataset.go === 'submit') submit();
      else go_to(+b.dataset.go);
    });
  }

  async function submit() {
    const left = state.answers.filter((a) => a === null).length;
    if (left > 0) {
      const ok = await confirmDialog({
        title: `Còn ${left} câu chưa làm`,
        text: 'Bé có chắc muốn nộp bài không?',
        ok: 'Nộp bài',
        cancel: 'Làm tiếp',
        icon: '📝',
      });
      if (!ok) {
        const first = state.answers.findIndex((a) => a === null);
        if (first >= 0) go_to(first);
        return;
      }
    }
    finish();
  }

  /* ---------- Kết thúc bài ---------- */
  function finish() {
    if (finished) return;
    finished = true;
    persist();
    const r = grade(state.questions, state.answers);
    const stars = starsFor(r.scorePct);
    const entry = {
      id: state.id,
      startedAt: state.startedAt,
      finishedAt: Date.now(),
      durationMs: Math.round(state.elapsedMs),
      topics: state.config.topics,
      level: state.config.level,
      mode: state.config.mode,
      kind: state.config.kind || 'normal',
      total: r.total,
      correct: r.correct,
      scorePct: r.scorePct,
      score10: r.score10,
      stars,
      maxStreak: r.maxStreak,
      questions: r.detail.map(({ topic, type, text, big, visual, choices, answer, userAnswer, isCorrect: ok, explain, unit }) => ({
        topic, type, text, big, visual, choices, answer, userAnswer, isCorrect: ok, explain, unit,
      })),
    };
    addHistory(entry);
    addStars(stars);
    const bonus = creditBonus(entry); // tiền thưởng ống heo (0 nếu không đạt / đã cộng)
    clearInProgress();
    const newBadges = evaluateBadges(entry, state.streakBadges);
    go('result', { entry, newBadges, bonus, config: state.config, questions: state.questions });
  }

  /* ---------- Sự kiện ---------- */
  async function exit() {
    stopSpeaking();
    const ok = await confirmDialog({
      title: 'Bé muốn dừng lại?',
      text: 'Bài làm sẽ được lưu để lần sau làm tiếp.',
      ok: 'Dừng lại',
      cancel: 'Làm tiếp',
      icon: '⏸️',
    });
    if (ok) {
      persist();
      go('home');
    }
  }

  screen.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || b.disabled) return;
    const act = b.dataset.act;
    if (b.dataset.choice !== undefined) return answer(b.dataset.choice, b);
    if (act === 'exit') exit();
    else if (act === 'speak') speak(questionSpeech(state.questions[state.current]));
    else if (act === 'continue') next();
    else if (act === 'prev') go_to(state.current - 1);
    else if (act === 'next') go_to(state.current + 1);
    else if (act === 'grid') showGrid();
    else if (act === 'submit') submit();
  });
  // Bấm vào chấm trên đường đi để chuyển câu (Kiểm tra)
  pathEl.addEventListener('click', (e) => {
    const d = e.target.closest('[data-i]');
    if (d && !practice) go_to(+d.dataset.i);
  });

  // Tiếp tục đúng câu đang làm dở (Luyện tập: nếu câu hiện tại đã trả lời thì sang câu sau)
  if (practice && state.answers[state.current] !== null) {
    if (state.current >= total - 1) {
      finish();
      return () => {};
    }
    state.current++;
    persist();
  }
  paintQuestion();

  return () => {
    clearTimeout(advanceTimer);
    clearInterval(timerInterval);
    document.removeEventListener('visibilitychange', onVis);
    keypad?.destroy();
    stopSpeaking();
    if (!finished) persist();
  };
}

export { topicName };
