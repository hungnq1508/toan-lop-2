/**
 * Huy hiệu (tạo động lực). Mỗi huy hiệu có điều kiện kiểm tra sau mỗi bài.
 * Huy hiệu "chuỗi đúng" còn được trao ngay trong lúc làm bài (chế độ Luyện tập).
 */
import { getHistory, getBadges, awardBadge } from './storage.js';
import { TOPICS, MIXED_ID } from './topics.js';

export const BADGES = [
  { id: 'first-quiz', icon: '🎒', name: 'Bài đầu tiên', desc: 'Hoàn thành bài đầu tiên' },
  { id: 'streak-5', icon: '🔥', name: 'Chuỗi 5 câu đúng', desc: 'Đúng liên tiếp 5 câu' },
  { id: 'streak-10', icon: '⚡', name: 'Chuỗi 10 câu đúng', desc: 'Đúng liên tiếp 10 câu' },
  { id: 'gold-cup', icon: '🏆', name: 'Cúp vàng', desc: 'Đạt từ 90% trở lên' },
  { id: 'perfect', icon: '💯', name: 'Điểm 10 tròn', desc: 'Đúng tất cả các câu' },
  { id: 'hard-hero', icon: '🦸', name: 'Dũng sĩ mức Khó', desc: 'Đạt từ 90% ở mức Khó' },
  { id: 'mixed-master', icon: '🧩', name: 'Vua ôn tập', desc: 'Đạt từ 80% ở bài Tổng hợp' },
  { id: 'never-give-up', icon: '💪', name: 'Không bỏ cuộc', desc: 'Làm lại các câu sai' },
  { id: 'explorer', icon: '🗺️', name: 'Nhà thám hiểm', desc: 'Làm bài ở cả 7 chủ đề' },
  { id: 'quiz-10', icon: '📚', name: 'Chăm chỉ', desc: 'Hoàn thành 10 bài' },
  { id: 'quiz-50', icon: '🎓', name: 'Siêu chăm chỉ', desc: 'Hoàn thành 50 bài' },
];

export const getBadge = (id) => BADGES.find((b) => b.id === id);

/** Huy hiệu chuỗi đúng ứng với độ dài chuỗi (5, 10, 15, 20…), hoặc null. */
export function streakBadgeFor(streak) {
  if (streak < 5 || streak % 5 !== 0) return null;
  return streak % 10 === 0 ? 'streak-10' : 'streak-5';
}

/**
 * Kiểm tra & trao huy hiệu sau khi lưu một bài vào lịch sử.
 * @param entry bài vừa làm
 * @param {string[]} alreadyGiven huy hiệu đã trao trong lúc làm (tránh trao 2 lần)
 * @returns {string[]} id các huy hiệu vừa nhận
 */
export function evaluateBadges(entry, alreadyGiven = []) {
  const got = [];
  const give = (id) => {
    awardBadge(id);
    got.push(id);
  };
  const owned = new Set(getBadges().map((b) => b.id));
  const history = getHistory();

  if (!owned.has('first-quiz')) give('first-quiz');
  // Chuỗi đúng (chế độ Kiểm tra: tính sau khi nộp bài)
  if (entry.mode === 'test') {
    if (entry.maxStreak >= 10 && !alreadyGiven.includes('streak-10')) give('streak-10');
    else if (entry.maxStreak >= 5 && !alreadyGiven.includes('streak-5')) give('streak-5');
  }
  if (entry.scorePct >= 90) give('gold-cup');
  if (entry.correct === entry.total) give('perfect');
  if (entry.scorePct >= 90 && entry.level === 3) give('hard-hero');
  if (entry.topics.length > 1 && entry.scorePct >= 80) give('mixed-master');
  if (entry.kind === 'retry-wrong') give('never-give-up');
  if (!owned.has('explorer')) {
    const done = new Set(history.flatMap((h) => h.topics));
    if (TOPICS.every((t) => done.has(t.id))) give('explorer');
  }
  if (history.length === 10) give('quiz-10');
  if (history.length === 50) give('quiz-50');
  return got;
}

export { MIXED_ID };
