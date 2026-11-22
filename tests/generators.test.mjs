/**
 * Kiểm thử các module sinh câu hỏi (chạy: npm test  hoặc  node --test tests/).
 * Với mỗi chủ đề × mức độ sinh nhiều câu và kiểm tra:
 *  - cấu trúc hợp lệ, đáp án nằm trong các lựa chọn, lựa chọn không trùng;
 *  - mọi số xuất hiện nằm trong 0..100;
 *  - tính lại độc lập các biểu thức (a + b = ?, a + ? = s, so sánh, đúng/sai, đặt tính, lời văn).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { TOPICS } from '../js/topics.js';
import { useBank as useGeo } from '../js/generators/geometry.js';
import { useBank as useStat } from '../js/generators/statistics.js';
import { generateQuestions, isCorrect, grade } from '../js/quiz-engine.js';
import { numberToWords } from '../js/generators/utils.js';

useGeo(JSON.parse(fs.readFileSync(new URL('../data/questions/geometry.json', import.meta.url))));
useStat(JSON.parse(fs.readFileSync(new URL('../data/questions/statistics.json', import.meta.url))));

const N = 1500; // số câu mỗi chủ đề × mức độ

/** Tính giá trị biểu thức chỉ gồm số, +, − (trái sang phải). */
function evalExpr(s) {
  const tokens = s.trim().split(/\s+/);
  let v = Number(tokens[0]);
  for (let i = 1; i < tokens.length; i += 2) {
    const n = Number(tokens[i + 1]);
    if (tokens[i] === '+') v += n;
    else if (tokens[i] === '−') v -= n;
    else return NaN;
    if (v < 0 || v > 100) throw new Error(`Kết quả trung gian ngoài phạm vi: ${s}`);
  }
  return v;
}
const isExpr = (s) => /^\d+( [+−] \d+)*$/.test(s.trim());

function verifyBig(qn) {
  const big = qn.big;
  if (!big) return;
  if (qn.type === 'compare') {
    const [l, r] = big.split('□');
    if (!isExpr(l) || !isExpr(r)) return;
    const a = evalExpr(l), b = evalExpr(r);
    assert.equal(qn.answer, a > b ? '>' : a < b ? '<' : '=', `So sánh sai: ${big}`);
    return;
  }
  const sides = big.split('=');
  if (sides.length !== 2) return;
  const [l, r] = sides.map((s) => s.trim());
  if (qn.type === 'truefalse') {
    if (!isExpr(l) || !isExpr(r)) return;
    assert.equal(qn.answer, evalExpr(l) === evalExpr(r) ? 'Đúng' : 'Sai', `Đúng/sai sai: ${big}`);
    return;
  }
  if (!big.includes('?')) return;
  // Tìm giá trị duy nhất của ? làm đẳng thức đúng (xử lý cả dạng tách số)
  const sols = [];
  for (let x = 0; x <= 100; x++) {
    try {
      const L = l.replace('?', x), R = r.replace('?', x);
      if (isExpr(L) && isExpr(R) && evalExpr(L) === evalExpr(R)) sols.push(x);
    } catch { /* trung gian ngoài phạm vi */ }
  }
  if (!sols.length && !isExpr(l.replace('?', 0))) return; // không phải biểu thức số thuần
  assert.equal(sols.length, 1, `Không có nghiệm duy nhất: ${big} → ${sols}`);
  assert.equal(qn.answer, String(sols[0]), `Đáp án sai: ${big}`);
}

function verifyVisual(qn) {
  const v = qn.visual;
  if (!v) return;
  if (v.kind === 'column') {
    const expect = v.op === '+' ? v.a + v.b : v.a - v.b;
    assert.equal(qn.answer, String(expect), `Đặt tính sai ${v.a} ${v.op} ${v.b}`);
  }
  if (v.kind === 'objects') assert.equal(qn.answer, String(v.count));
  if (v.kind === 'numberline') {
    assert.equal(qn.answer, String(v.start + v.hide[0] * v.step));
    assert.ok(v.start + (v.count - 1) * v.step <= 100, 'Tia số vượt 100');
  }
  if (v.kind === 'polyline' && v.unit === 'cm') {
    const total = v.lengths.reduce((s, x) => s + x, 0);
    const ans = parseInt(qn.answer, 10);
    if (v.hide) assert.equal(ans, v.lengths[v.hide[0]]);
    else assert.equal(ans, total);
  }
  if (v.kind === 'pictograph' || v.kind === 'tally') {
    for (const r of v.rows) assert.ok(r.count >= 0 && r.count <= 20);
  }
}

/** Lời văn: kiểm tra phép tính trong lời giải khớp đáp án. */
function verifyExplainEquation(qn) {
  const m = qn.explain.match(/Bài giải: (\d+) ([+−]) (\d+) = (\d+)/);
  if (!m) return;
  const [, a, op, b, r] = m;
  const v = op === '+' ? +a + +b : +a - +b;
  assert.equal(String(v), r, `Lời giải sai: ${qn.explain}`);
  assert.equal(qn.answer, r);
}

function checkQuestion(qn, ctx) {
  assert.ok(['choice', 'input', 'compare', 'truefalse'].includes(qn.type), `type lạ ${ctx}`);
  assert.equal(typeof qn.text, 'string');
  assert.ok(qn.text.length > 3, `text rỗng ${ctx}`);
  assert.equal(typeof qn.answer, 'string');
  assert.ok(qn.explain && qn.explain.length > 2, `thiếu giải thích ${ctx}: ${qn.text}`);
  assert.ok(!/undefined|NaN|null/.test(qn.text + (qn.big || '') + qn.explain + qn.answer), `có undefined/NaN: ${qn.text} | ${qn.explain}`);
  if (qn.type === 'input') {
    assert.match(qn.answer, /^\d{1,3}$/, `Đáp án điền số phải là số: ${qn.text}`);
  } else {
    assert.ok(Array.isArray(qn.choices) && qn.choices.length >= 2, `thiếu lựa chọn: ${qn.text}`);
    assert.equal(new Set(qn.choices).size, qn.choices.length, `lựa chọn trùng: ${qn.choices}`);
    assert.ok(qn.choices.includes(qn.answer), `đáp án không có trong lựa chọn: ${qn.text} ${qn.answer} [${qn.choices}]`);
    if (qn.type === 'choice') assert.ok(qn.choices.length >= 3, `trắc nghiệm cần 3–4 lựa chọn: ${qn.text} [${qn.choices}]`);
    assert.ok(qn.choices.length <= 4);
  }
  // Mọi số nằm trong 0..100 (bỏ qua "2A" tên lớp)
  const all = [qn.text, qn.big || '', qn.answer, ...(qn.choices || [])].join(' ').replace(/\d+[A-Z]/g, '');
  for (const n of all.match(/\d+/g) || []) {
    assert.ok(+n >= 0 && +n <= 100, `Số ngoài phạm vi (${n}): ${qn.text} ${qn.big || ''}`);
  }
  verifyBig(qn);
  verifyVisual(qn);
  verifyExplainEquation(qn);
}

for (const topic of TOPICS) {
  for (const level of [1, 2, 3]) {
    test(`${topic.name} – mức ${level}`, () => {
      const keys = new Set();
      for (let i = 0; i < N; i++) {
        const qn = topic.generate(level);
        checkQuestion(qn, `${topic.id}/${level}`);
        keys.add(qn.text + (qn.big || '') + JSON.stringify(qn.visual || ''));
      }
      assert.ok(keys.size >= 15, `Quá ít câu khác nhau (${keys.size}) ở ${topic.id}/${level}`);
    });
  }
}

test('Có đủ 7 chủ đề', () => {
  assert.equal(TOPICS.length, 7);
  assert.equal(new Set(TOPICS.map((t) => t.id)).size, 7);
});

test('Đọc số tiếng Việt', () => {
  assert.equal(numberToWords(5), 'năm');
  assert.equal(numberToWords(10), 'mười');
  assert.equal(numberToWords(11), 'mười một');
  assert.equal(numberToWords(15), 'mười lăm');
  assert.equal(numberToWords(21), 'hai mươi mốt');
  assert.equal(numberToWords(35), 'ba mươi lăm');
  assert.equal(numberToWords(70), 'bảy mươi');
  assert.equal(numberToWords(94), 'chín mươi bốn');
  assert.equal(numberToWords(100), 'một trăm');
});

test('Tạo đề 10/20 câu, Tổng hợp, không trùng', () => {
  for (const count of [10, 20]) {
    for (const level of [1, 2, 3]) {
      const one = generateQuestions(['cong-tru-20'], count, level);
      assert.equal(one.length, count);
      const mixed = generateQuestions(TOPICS.map((t) => t.id), count, level);
      assert.equal(mixed.length, count);
      const topicsUsed = new Set(mixed.map((q) => q.topic));
      assert.ok(topicsUsed.size >= Math.min(7, count) - 0, 'Tổng hợp phải trộn nhiều chủ đề');
      const keys = new Set(mixed.map((q) => q.text + (q.big || '') + JSON.stringify(q.visual || '')));
      assert.ok(keys.size >= count - 1, 'Đề có câu trùng');
    }
  }
});

test('Chấm điểm', () => {
  const qs = [{ answer: '15' }, { answer: '>' }, { answer: 'Đúng' }, { answer: '7' }];
  const r = grade(qs, ['15', '>', 'Sai', null]);
  assert.equal(r.correct, 2);
  assert.equal(r.scorePct, 50);
  assert.equal(r.score10, 5);
  assert.ok(isCorrect({ answer: '7' }, '07'));
  assert.ok(!isCorrect({ answer: '7' }, ''));
});
