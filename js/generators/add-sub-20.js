/**
 * Chủ đề 3 – Phép cộng, phép trừ trong phạm vi 20
 * Dễ: không nhớ · Vừa: có nhớ (qua 10), tách số · Khó: tìm số còn thiếu, so sánh, 3 số.
 */
import { randInt, pick, chance, pickForm, q, numberChoices, compareSign, COMPARE_CHOICES, TF_CHOICES, MINUS } from './utils.js';

/** Hiển thị câu tính dạng nhập số hoặc trắc nghiệm. */
function calc(a, op, b, ans, traps = []) {
  const big = `${a} ${op} ${b} = ?`;
  const asChoice = chance(0.35);
  return q({
    type: asChoice ? 'choice' : 'input',
    text: 'Tính:',
    big,
    ...(asChoice ? { choices: numberChoices(ans, traps, { max: 20 }) } : {}),
    answer: ans,
    explain: `${a} ${op} ${b} = ${ans}`,
  });
}

/* --- Dễ: không nhớ --- */
function addNoCarry() {
  if (chance(0.5)) {
    const a = randInt(1, 9);
    const b = randInt(1, 10 - a);
    return calc(a, '+', b, a + b);
  }
  const a = randInt(10, 18);
  const b = randInt(1, 9 - (a % 10));
  return calc(a, '+', b, a + b);
}

function subNoBorrow() {
  if (chance(0.5)) {
    const a = randInt(2, 10);
    const b = randInt(1, a - 1);
    return calc(a, MINUS, b, a - b);
  }
  const a = randInt(11, 19);
  const b = randInt(1, a % 10 || 1);
  return calc(a, MINUS, b, a - b);
}

/* --- Vừa: có nhớ qua 10 --- */
function carryPair() {
  const a = randInt(2, 9);
  const b = randInt(11 - a, 9);
  return [a, b];
}

function addCarry() {
  const [a, b] = carryPair();
  const s = a + b;
  return calc(a, '+', b, s, [s - 10, s + 1, s - 1]);
}

function subBorrow() {
  const [a, b] = carryPair();
  const m = a + b; // 11..18
  const d = m - b;
  // Lỗi hay gặp: lấy số lớn trừ số bé ở hàng đơn vị (13 − 5 → 12)
  return calc(m, MINUS, b, d, [10 + b - (m % 10), d + 1, d - 1]);
}

/** Tách số để làm tròn 10: 9 + 5 = 9 + 1 + ?  /  13 − 5 = 13 − 3 − ? */
function splitToTen() {
  if (chance(0.5)) {
    const [a, b] = carryPair();
    const first = 10 - a;
    return q({
      type: 'input',
      text: 'Tách số để tính cho nhanh:',
      big: `${a} + ${b} = ${a} + ${first} + ?`,
      answer: b - first,
      explain: `${b} = ${first} + ${b - first}, nên ${a} + ${b} = ${a} + ${first} + ${b - first} = ${a + b}`,
    });
  }
  const [a, b] = carryPair();
  const m = a + b;
  const first = m - 10;
  return q({
    type: 'input',
    text: 'Tách số để tính cho nhanh:',
    big: `${m} ${MINUS} ${b} = ${m} ${MINUS} ${first} ${MINUS} ?`,
    answer: b - first,
    explain: `${b} = ${first} + ${b - first}, nên ${m} ${MINUS} ${b} = ${m} ${MINUS} ${first} ${MINUS} ${b - first} = ${m - b}`,
  });
}

/* --- Khó --- */
function missingNumber() {
  const [a, b] = carryPair();
  const s = a + b;
  const form = pick(['a+?', '?+b', 's-?', '?-b']);
  let big, ans, explain;
  switch (form) {
    case 'a+?':
      big = `${a} + ? = ${s}`; ans = b; explain = `${s} ${MINUS} ${a} = ${b}, nên ${a} + ${b} = ${s}`; break;
    case '?+b':
      big = `? + ${b} = ${s}`; ans = a; explain = `${s} ${MINUS} ${b} = ${a}, nên ${a} + ${b} = ${s}`; break;
    case 's-?':
      big = `${s} ${MINUS} ? = ${a}`; ans = b; explain = `${s} ${MINUS} ${a} = ${b}, nên ${s} ${MINUS} ${b} = ${a}`; break;
    default:
      big = `? ${MINUS} ${b} = ${a}`; ans = s; explain = `${a} + ${b} = ${s}, nên ${s} ${MINUS} ${b} = ${a}`;
  }
  return q({ type: 'input', text: 'Tìm số thích hợp:', big, answer: ans, explain });
}

function randomExpr() {
  if (chance(0.5)) {
    const a = randInt(2, 9);
    const b = randInt(2, 20 - a);
    return [`${a} + ${b}`, a + b];
  }
  const m = randInt(11, 20);
  const n = randInt(2, 9);
  return [`${m} ${MINUS} ${n}`, m - n];
}

function compareExpressions() {
  const [left, lv] = randomExpr();
  let right, rv;
  if (chance(0.5)) {
    [right, rv] = randomExpr();
  } else {
    rv = Math.max(0, Math.min(20, lv + pick([-1, 0, 0, 1, 2, -2])));
    right = String(rv);
  }
  const s = compareSign(lv, rv);
  return q({
    type: 'compare',
    text: 'Chọn dấu >, <, = thích hợp:',
    big: `${left} □ ${right}`,
    choices: COMPARE_CHOICES,
    answer: s,
    explain: `${left} = ${lv}; ${right.includes(' ') ? `${right} = ${rv}; ` : ''}${lv} ${s} ${rv}`,
  });
}

function threeNumbers() {
  // a op1 b op2 c, mọi kết quả trung gian trong 0..20
  for (;;) {
    const a = randInt(2, 15);
    const op1 = pick(['+', MINUS]);
    const b = randInt(1, 9);
    const mid = op1 === '+' ? a + b : a - b;
    if (mid < 0 || mid > 20) continue;
    const op2 = pick(['+', MINUS]);
    const c = randInt(1, 9);
    const res = op2 === '+' ? mid + c : mid - c;
    if (res < 0 || res > 20) continue;
    return q({
      type: 'input',
      text: 'Tính:',
      big: `${a} ${op1} ${b} ${op2} ${c} = ?`,
      answer: res,
      explain: `${a} ${op1} ${b} = ${mid}; ${mid} ${op2} ${c} = ${res}`,
    });
  }
}

function trueFalseFact() {
  const [a, b] = carryPair();
  const isAdd = chance(0.5);
  const right = isAdd ? a + b : a + b - b;
  const shown = chance(0.5) ? right : right + pick([1, -1, 10, -10].filter((d) => right + d >= 0 && right + d <= 20));
  const expr = isAdd ? `${a} + ${b}` : `${a + b} ${MINUS} ${b}`;
  return q({
    type: 'truefalse',
    text: 'Phép tính sau đúng hay sai?',
    big: `${expr} = ${shown}`,
    choices: TF_CHOICES,
    answer: shown === right ? 'Đúng' : 'Sai',
    explain: `${expr} = ${right}`,
  });
}

const LEVELS = {
  1: [addNoCarry, subNoBorrow],
  2: [[2, addCarry], [2, subBorrow], splitToTen],
  3: [[2, missingNumber], compareExpressions, threeNumbers, trueFalseFact],
};

export default {
  id: 'cong-tru-20',
  order: 3,
  name: 'Cộng, trừ trong phạm vi 20',
  icon: '➕',
  color: '#16a34a',
  generate(level) {
    return pickForm(LEVELS[level])();
  },
};
