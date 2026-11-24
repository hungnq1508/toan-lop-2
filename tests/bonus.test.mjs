/**
 * Kiểm thử tiền thưởng "Ống heo" (requirement/20261124_tien-thuong-bai-kiem-tra.md, mục 7).
 * Trong Node không có localStorage → storage.js tự dùng bộ nhớ tạm.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { BONUS_TABLE, bonusFor, creditBonus, payout, getBonusSummary, summarize, formatVnd } from '../js/bonus.js';
import { getBonus, saveBonus, exportData, importData, saveSettings, clearHistory, DATA_VERSION } from '../js/storage.js';

let seq = 0;
const mk = (over = {}) => ({
  id: `t${++seq}`,
  mode: 'test',
  kind: 'normal',
  total: 10,
  correct: 10,
  level: 2,
  topics: ['so-den-100'],
  score10: 10,
  finishedAt: Date.now(),
  scorePct: 100,
  ...over,
});
const on = { enabled: true };
const reset = () => saveBonus({ ledger: [] });

test('bonusFor: đúng 6 mức trong bảng', () => {
  const expect = { 10: [1000, 2000, 3000], 20: [2000, 4000, 6000] };
  for (const total of [10, 20]) {
    for (const level of [1, 2, 3]) {
      assert.equal(bonusFor(mk({ total, correct: total, level }), on), expect[total][level - 1]);
    }
  }
});

test('bonusFor: trả 0 khi không đủ điều kiện', () => {
  assert.equal(bonusFor(mk({ mode: 'practice' }), on), 0, 'Luyện tập');
  assert.equal(bonusFor(mk({ total: 20, correct: 17 }), on), 0, '8,5 điểm (17/20)');
  assert.equal(bonusFor(mk({ kind: 'retry' }), on), 0, 'Làm lại đề này');
  assert.equal(bonusFor(mk({ kind: 'retry-wrong', total: 4, correct: 4 }), on), 0, 'Làm lại câu sai');
  assert.equal(bonusFor(mk({ kind: 'retry-wrong' }), on), 0, 'Làm lại câu sai đủ 10 câu');
  assert.equal(bonusFor(mk({ total: 15, correct: 15 }), on), 0, 'Số câu khác 10/20');
  assert.equal(bonusFor(mk(), { enabled: false }), 0, 'Tính năng tắt');
  assert.equal(bonusFor(mk({ kind: undefined }), on), 2000, 'Bài cũ không có kind = đề mới');
});

test('bonusFor: biên 9/10, 18/20 được thưởng; 8/10, 17/20 không', () => {
  assert.equal(bonusFor(mk({ total: 10, correct: 9 }), on), 2000);
  assert.equal(bonusFor(mk({ total: 20, correct: 18, level: 3 }), on), 6000);
  assert.equal(bonusFor(mk({ total: 10, correct: 8 }), on), 0);
  assert.equal(bonusFor(mk({ total: 20, correct: 17, level: 3 }), on), 0);
});

test('BONUS_TABLE: số nguyên, bội số 1.000, ≤ 10.000', () => {
  for (const row of Object.values(BONUS_TABLE)) {
    for (const v of Object.values(row)) {
      assert.ok(Number.isInteger(v) && v > 0 && v % 1000 === 0 && v <= 10000, `giá trị ${v}`);
    }
  }
});

test('creditBonus: gọi 2 lần cùng một bài → chỉ cộng 1 lần', () => {
  reset();
  const e = mk({ level: 3 });
  assert.equal(creditBonus(e, on), 3000);
  assert.equal(creditBonus(e, on), 0);
  assert.equal(getBonus().ledger.length, 1);
  assert.equal(getBonusSummary().balance, 3000);
  assert.equal(creditBonus(mk({ mode: 'practice' }), on), 0);
  assert.equal(getBonus().ledger.length, 1);
});

test('Số dư qua chuỗi: nhận → nhận → trao thưởng → nhận', () => {
  reset();
  creditBonus(mk({ level: 1 }), on); // 1.000
  creditBonus(mk({ total: 20, correct: 19, level: 2 }), on); // 4.000
  assert.equal(getBonusSummary().balance, 5000);
  const tx = payout('Mua bộ Lego');
  assert.equal(tx.amount, 5000);
  assert.equal(tx.note, 'Mua bộ Lego');
  let s = getBonusSummary();
  assert.equal(s.balance, 0);
  assert.equal(s.lifetimePaid, 5000);
  assert.equal(s.recentEarns.length, 0);
  assert.equal(payout(), null, 'không trao thưởng khi số dư = 0');
  creditBonus(mk({ level: 3 }), on); // 3.000
  s = getBonusSummary();
  assert.equal(s.balance, 3000);
  assert.equal(s.lifetimePaid, 5000);
  assert.equal(s.recentEarns.length, 1);
  assert.equal(s.payouts.length, 1);
});

test('payout: ghi chú bị cắt còn 50 ký tự', () => {
  reset();
  creditBonus(mk(), on);
  assert.equal(payout('x'.repeat(80)).note.length, 50);
});

test('summarize: số dư chỉ tính các khoản sau lần trao thưởng mới nhất', () => {
  const s = summarize([
    { id: 'earn-a', type: 'earn', at: 1, amount: 1000 },
    { id: 'payout-2', type: 'payout', at: 2, amount: 1000 },
    { id: 'earn-b', type: 'earn', at: 3, amount: 2000 },
    { id: 'earn-c', type: 'earn', at: 4, amount: 3000 },
  ]);
  assert.equal(s.balance, 5000);
  assert.equal(s.lifetimePaid, 1000);
  assert.deepEqual(s.recentEarns.map((t) => t.id), ['earn-c', 'earn-b']);
});

test('Sao lưu / khôi phục: gộp sổ giao dịch giao nhau không trùng, số dư đúng', () => {
  assert.equal(DATA_VERSION, 2);
  reset();
  const a = mk({ level: 1 });
  const b = mk({ level: 2 });
  creditBonus(a, on);
  creditBonus(b, on);
  const backup = exportData();
  assert.equal(backup.version, 2);
  assert.equal(backup.bonus.ledger.length, 2);

  // Máy hiện tại: còn khoản b, có thêm khoản c
  reset();
  creditBonus(b, on);
  creditBonus(mk({ level: 3 }), on);
  const r = importData(JSON.parse(JSON.stringify(backup)));
  assert.equal(r.bonusAdded, 1, 'chỉ thêm khoản a');
  const ledger = getBonus().ledger;
  assert.equal(ledger.length, 3);
  assert.equal(new Set(ledger.map((t) => t.id)).size, 3);
  assert.equal(getBonusSummary().balance, 1000 + 2000 + 3000);

  // Khôi phục lại cùng file → không thêm gì
  assert.equal(importData(JSON.parse(JSON.stringify(backup))).bonusAdded, 0);
  assert.equal(getBonus().ledger.length, 3);
});

test('Khôi phục: bỏ qua giao dịch không hợp lệ, gộp cả lần trao thưởng', () => {
  reset();
  const r = importData({
    app: 'toan-lop-2',
    version: 2,
    history: [],
    bonus: {
      ledger: [
        { id: 'earn-x', type: 'earn', at: 10, amount: 2000 },
        { id: 'earn-big', type: 'earn', at: 11, amount: 50000 },
        { id: 'earn-frac', type: 'earn', at: 12, amount: 1500.5 },
        { id: 'earn-neg', type: 'earn', at: 13, amount: -1000 },
        { id: 'earn-noat', type: 'earn', amount: 1000 },
        { id: 'weird', type: 'gift', at: 14, amount: 1000 },
        { id: 'payout-20', type: 'payout', at: 20, amount: 2000, note: 'Kem' },
        { id: 'earn-y', type: 'earn', at: 30, amount: 4000 },
      ],
    },
  });
  assert.equal(r.bonusAdded, 2);
  const s = getBonusSummary();
  assert.equal(s.balance, 4000);
  assert.equal(s.lifetimePaid, 2000);
  assert.equal(s.payouts[0].note, 'Kem');
});

test('Khôi phục file v1 (không có bonus) vẫn thành công', () => {
  reset();
  creditBonus(mk(), on);
  const r = importData({ app: 'toan-lop-2', version: 1, history: [mk({ id: 'old1' })], badges: [], stats: { totalStars: 0 } });
  assert.equal(r.bonusAdded, 0);
  assert.equal(getBonusSummary().balance, 2000, 'số dư cũ giữ nguyên');
  assert.throws(() => importData({ app: 'toan-lop-2', version: 3, history: [] }), /phiên bản mới hơn/);
});

test('Xoá toàn bộ lịch sử không làm mất ống heo', () => {
  reset();
  creditBonus(mk({ level: 3 }), on);
  clearHistory();
  assert.equal(getBonusSummary().balance, 3000);
});

test('Tắt tính năng trong Cài đặt → không cộng; bật lại số dư còn nguyên', () => {
  reset();
  creditBonus(mk(), on);
  saveSettings({ bonusEnabled: false });
  assert.equal(creditBonus(mk()), 0);
  saveSettings({ bonusEnabled: true });
  assert.equal(getBonusSummary().balance, 2000);
  assert.equal(creditBonus(mk()), 2000);
});

test('formatVnd', () => {
  assert.equal(formatVnd(12000), '12.000đ');
  assert.equal(formatVnd(0), '0đ');
  assert.equal(formatVnd(500), '500đ');
  assert.equal(formatVnd(1234567), '1.234.567đ');
});
