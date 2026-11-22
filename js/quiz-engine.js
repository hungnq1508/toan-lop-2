/**
 * Lõi tạo đề & chấm điểm. Không phụ thuộc giao diện.
 */
import { TOPICS, getTopic } from './topics.js';
import { shuffle } from './generators/utils.js';

/** Khoá để nhận biết câu trùng nhau. */
function keyOf(q) {
  return `${q.text}|${q.big || ''}|${JSON.stringify(q.visual || '')}|${q.answer}`;
}

/**
 * Tạo danh sách câu hỏi.
 * @param {string[]} topicIds  các chủ đề (Tổng hợp = nhiều chủ đề)
 * @param {number} count       số câu (10 / 20)
 * @param {1|2|3} level        mức độ
 */
export function generateQuestions(topicIds, count, level) {
  const topics = topicIds.map(getTopic).filter(Boolean);
  if (!topics.length) throw new Error('Chưa chọn chủ đề');
  // Chia đều số câu cho các chủ đề, phần dư rơi ngẫu nhiên
  const plan = [];
  const order = shuffle(topics);
  for (let i = 0; i < count; i++) plan.push(order[i % order.length]);

  const seen = new Set();
  const list = [];
  for (const topic of plan) {
    let qn;
    for (let tries = 0; tries < 40; tries++) {
      qn = topic.generate(level);
      if (!seen.has(keyOf(qn))) break;
    }
    seen.add(keyOf(qn));
    list.push({ ...qn, topic: topic.id, level });
  }
  // Trộn để các chủ đề xen kẽ (Tổng hợp), giữ thứ tự nếu chỉ 1 chủ đề
  return topics.length > 1 ? shuffle(list) : list;
}

/** So sánh câu trả lời (bỏ khoảng trắng, số 0 đứng đầu). */
export function isCorrect(question, userAnswer) {
  if (userAnswer === null || userAnswer === undefined || userAnswer === '') return false;
  const norm = (s) => String(s).trim().replace(/^0+(?=\d)/, '');
  return norm(question.answer) === norm(userAnswer);
}

/** Số sao theo phần trăm. */
export function starsFor(pct) {
  if (pct >= 90) return 3;
  if (pct >= 75) return 2;
  if (pct >= 60) return 1;
  return 0;
}

/** Tính kết quả từ câu hỏi + câu trả lời. */
export function grade(questions, answers) {
  let correct = 0;
  let streak = 0;
  let maxStreak = 0;
  const detail = questions.map((qn, i) => {
    const ok = isCorrect(qn, answers[i]);
    if (ok) {
      correct++;
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else streak = 0;
    return { ...qn, userAnswer: answers[i] ?? null, isCorrect: ok };
  });
  const total = questions.length;
  const scorePct = total ? Math.round((correct / total) * 100) : 0;
  return { total, correct, scorePct, score10: Math.round((correct / total) * 100) / 10, maxStreak, detail };
}

export { TOPICS };
