/**
 * Tiền thưởng "Ống heo" (không phụ thuộc giao diện).
 *
 * Quy tắc (requirement/20261124_tien-thuong-bai-kiem-tra.md, mục 3):
 *   Một bài được thưởng khi: hình thức Kiểm tra · điểm ≥ 9 · đề mới (kind 'normal')
 *   · 10 hoặc 20 câu · tính năng đang bật · chưa từng được thưởng (theo entry.id).
 *
 * Số dư KHÔNG lưu riêng mà luôn tính từ sổ giao dịch (bonus.ledger):
 *   - Số dư = tổng `earn` có `at` sau lần `payout` gần nhất.
 *   - Tổng đã nhận = tổng mọi `payout`.
 */
import { getBonus, saveBonus, getSettings } from './storage.js';

/**
 * BẢNG MỨC THƯỞNG (đồng): số câu → mức độ (1 Dễ, 2 Vừa, 3 Khó) → số tiền.
 * Muốn đổi mức thưởng chỉ cần sửa tại đây (mọi giá trị là bội số 1.000đ, tối đa 10.000đ).
 * Khoản đã cộng được chốt lúc nộp bài nên đổi bảng không làm thay đổi số dư cũ.
 */
export const BONUS_TABLE = Object.freeze({
  10: Object.freeze({ 1: 1000, 2: 2000, 3: 3000 }),
  20: Object.freeze({ 1: 2000, 2: 4000, 3: 6000 }),
});

/** Số tiền thưởng tối đa nếu đạt (theo số câu + mức độ); 0 nếu không có trong bảng. */
export function rewardFor(count, level) {
  return BONUS_TABLE[count]?.[level] || 0;
}

export const bonusEnabled = () => getSettings().bonusEnabled !== false;

/** Bài có thuộc diện xét thưởng không (ĐK1, ĐK3, ĐK4, ĐK5) – chưa xét điểm. */
export function isBonusEligible(entry, { enabled = bonusEnabled() } = {}) {
  if (!enabled || !entry) return false;
  if (entry.mode !== 'test') return false;
  if ((entry.kind || 'normal') !== 'normal') return false;
  return rewardFor(entry.total, entry.level) > 0;
}

/** Điểm ≥ 9/10, so sánh số nguyên để tránh sai số làm tròn (ĐK2). */
export const passesScore = (entry) => entry.correct * 10 >= 9 * entry.total;

/**
 * Số tiền bài này được thưởng theo mục 3.1–3.2 (0 nếu không đạt).
 * Không xét ĐK6 (đã thưởng chưa) – việc đó do creditBonus() đảm bảo.
 */
export function bonusFor(entry, opts = {}) {
  if (!isBonusEligible(entry, opts) || !passesScore(entry)) return 0;
  return rewardFor(entry.total, entry.level);
}

const earnId = (historyId) => `earn-${historyId}`;

/**
 * Thời điểm cho giao dịch mới: luôn sau mọi giao dịch đã có (kể cả khi cùng mili-giây
 * hoặc đồng hồ máy bị chỉnh lùi) để thứ tự nhận/trao thưởng – và do đó số dư – luôn đúng.
 */
const nextAt = (ledger) => ledger.reduce((m, t) => Math.max(m, t.at + 1), Date.now());

/**
 * Cộng thưởng cho một bài vừa nộp. Idempotent theo entry.id.
 * @returns {number} số tiền vừa cộng (0 nếu không đạt hoặc đã cộng trước đó)
 */
export function creditBonus(entry, opts = {}) {
  const amount = bonusFor(entry, opts);
  if (!amount) return 0;
  const bonus = getBonus();
  const id = earnId(entry.id);
  if (bonus.ledger.some((t) => t.id === id)) return 0;
  bonus.ledger.push({
    id,
    type: 'earn',
    at: nextAt(bonus.ledger),
    amount,
    historyId: entry.id,
    count: entry.total,
    level: entry.level,
    topics: [...(entry.topics || [])],
    score10: entry.score10,
  });
  saveBonus(bonus);
  return amount;
}

/** Tóm tắt từ một sổ giao dịch (hàm thuần, dùng cho cả kiểm thử). */
export function summarize(ledger) {
  const sorted = [...ledger].sort((a, b) => a.at - b.at);
  const payouts = sorted.filter((t) => t.type === 'payout');
  const lastAt = payouts.length ? payouts[payouts.length - 1].at : -Infinity;
  const recentEarns = sorted.filter((t) => t.type === 'earn' && t.at > lastAt).reverse();
  return {
    balance: recentEarns.reduce((s, t) => s + t.amount, 0),
    lifetimePaid: payouts.reduce((s, t) => s + t.amount, 0),
    recentEarns,
    payouts: payouts.reverse(),
  };
}

/** @returns {{balance:number, lifetimePaid:number, recentEarns:object[], payouts:object[]}} */
export const getBonusSummary = () => summarize(getBonus().ledger);

/** Bản đồ historyId → số tiền đã thưởng (để gắn nhãn trong Lịch sử / Xem lại bài). */
export function earnedByHistory() {
  const map = new Map();
  for (const t of getBonus().ledger) if (t.type === 'earn') map.set(t.historyId, t.amount);
  return map;
}

/**
 * Bố mẹ trao thưởng: ghi giao dịch payout bằng toàn bộ số dư, số dư về 0.
 * @returns {object|null} giao dịch vừa ghi, null nếu số dư = 0
 */
export function payout(note = '') {
  const { balance } = getBonusSummary();
  if (balance <= 0) return null;
  const bonus = getBonus();
  const at = nextAt(bonus.ledger);
  const tx = { id: `payout-${at}`, type: 'payout', at, amount: balance, note: String(note || '').trim().slice(0, 50) };
  bonus.ledger.push(tx);
  saveBonus(bonus);
  return tx;
}

/** 12000 → "12.000đ" (giống nhau trên Safari và Chrome). */
export function formatVnd(n) {
  const v = Math.round(Number(n) || 0);
  const sign = v < 0 ? '-' : '';
  return `${sign}${String(Math.abs(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}đ`;
}
