/**
 * DANH MỤC CHỦ ĐỀ
 * ------------------------------------------------------------------
 * Mỗi chủ đề là một module độc lập trong js/generators/ với dạng:
 *   export default {
 *     id, order, name, icon, color,
 *     load?: async () => {},        // (tuỳ chọn) nạp dữ liệu JSON
 *     generate(level) { return question; }   // level: 1 Dễ, 2 Vừa, 3 Khó
 *   }
 *
 * THÊM CHỦ ĐỀ MỚI (ví dụ "Phép nhân"): tạo js/generators/multiplication.js
 * theo mẫu trên, rồi thêm 1 dòng import + 1 phần tử vào mảng TOPICS bên dưới
 * (và thêm file vào danh sách PRECACHE trong service-worker.js).
 * Không cần sửa phần lõi (engine, giao diện, lưu trữ).
 */
import numbers from './generators/numbers.js';
import terms from './generators/terms.js';
import addSub20 from './generators/add-sub-20.js';
import addSub100 from './generators/add-sub-100.js';
import geometry from './generators/geometry.js';
import statistics from './generators/statistics.js';
import wordProblems from './generators/word-problems.js';

export const TOPICS = [numbers, terms, addSub20, addSub100, geometry, statistics, wordProblems]
  .sort((a, b) => a.order - b.order);

export const LEVELS = [
  { id: 1, name: 'Dễ', icon: '🌱' },
  { id: 2, name: 'Vừa', icon: '🌿' },
  { id: 3, name: 'Khó', icon: '🌳' },
];

export const MODES = {
  practice: { id: 'practice', name: 'Luyện tập', icon: '🎯' },
  test: { id: 'test', name: 'Kiểm tra', icon: '📝' },
};

export const MIXED_ID = 'tong-hop';
export const MIXED = { id: MIXED_ID, name: 'Tổng hợp', icon: '🧩', color: '#475569' };

export function getTopic(id) {
  return TOPICS.find((t) => t.id === id);
}

export function topicName(id) {
  return id === MIXED_ID ? MIXED.name : getTopic(id)?.name || id;
}

export function levelName(id) {
  return LEVELS.find((l) => l.id === id)?.name || '';
}

/** Nạp dữ liệu cho các chủ đề cần (gọi 1 lần khi khởi động). */
export async function loadTopics() {
  await Promise.all(TOPICS.map((t) => (t.load ? t.load() : null)));
}
