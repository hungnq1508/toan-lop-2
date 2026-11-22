/**
 * Chủ đề 4 – Phép cộng, phép trừ trong phạm vi 100
 * Dễ: số tròn chục, không nhớ · Vừa: có nhớ, đặt tính · Khó: 2 dấu phép tính, tìm số thiếu, so sánh.
 */
import { randInt, pick, chance, pickForm, q, numberChoices, compareSign, COMPARE_CHOICES, TF_CHOICES, MINUS } from './utils.js';

const tens = (n) => Math.floor(n / 10);
const units = (n) => n % 10;

/** Câu "Tính" dạng nhập số hoặc trắc nghiệm có đáp án nhiễu hợp lý. */
function calc(a, op, b, ans, traps = [], text = 'Tính:') {
  const asChoice = chance(0.4);
  return q({
    type: asChoice ? 'choice' : 'input',
    text,
    big: `${a} ${op} ${b} = ?`,
    ...(asChoice ? { choices: numberChoices(ans, traps) } : {}),
    answer: ans,
    explain: `${a} ${op} ${b} = ${ans}`,
  });
}

/** Câu đặt tính theo cột. */
function column(a, op, b, ans, carry) {
  const opWord = op === '+' ? 'cộng' : 'trừ';
  const hint = op === '+'
    ? `${units(a)} + ${units(b)} = ${units(a) + units(b)}${carry ? `, viết ${units(ans)} nhớ 1` : ''}; sau đó cộng hàng chục${carry ? ', thêm 1 nhớ' : ''}.`
    : `${carry ? `${units(a)} không trừ được ${units(b)}, lấy ${10 + units(a)} ${MINUS} ${units(b)} = ${10 + units(a) - units(b)}, nhớ 1` : `${units(a)} ${MINUS} ${units(b)} = ${units(a) - units(b)}`}; sau đó trừ hàng chục.`;
  return q({
    type: 'input',
    text: 'Đặt tính rồi tính:',
    speak: `Đặt tính rồi tính: ${a} ${opWord} ${b}.`,
    visual: { kind: 'column', a, b, op },
    answer: ans,
    explain: `${a} ${op} ${b} = ${ans}. Tính từ phải sang trái: ${hint}`,
  });
}

/* --- Số sinh theo điều kiện --- */

function addNoCarryPair() {
  // a + b ≤ 99, đơn vị cộng < 10
  for (;;) {
    const a = randInt(10, 88);
    const b = chance(0.3) ? randInt(1, 9) : randInt(10, 88);
    if (units(a) + units(b) < 10 && a + b <= 99) return [a, b];
  }
}

function addCarryPair() {
  for (;;) {
    const a = randInt(11, 89);
    const b = chance(0.3) ? randInt(2, 9) : randInt(11, 89);
    if (units(a) + units(b) >= 10 && a + b <= 100) return [a, b];
  }
}

function subNoBorrowPair() {
  for (;;) {
    const a = randInt(20, 99);
    const b = chance(0.3) ? randInt(1, 9) : randInt(10, a - 1);
    if (units(a) >= units(b) && b < a) return [a, b];
  }
}

function subBorrowPair() {
  for (;;) {
    const a = randInt(21, 100);
    const b = chance(0.3) ? randInt(2, 9) : randInt(11, a - 1);
    if (units(a) < units(b) && b < a) return [a, b];
  }
}

/* --- Dễ --- */

function roundTens() {
  if (chance(0.5)) {
    const a = randInt(1, 9) * 10;
    const b = randInt(1, (100 - a) / 10) * 10;
    return calc(a, '+', b, a + b, [], 'Tính nhẩm:');
  }
  const a = randInt(2, 10) * 10;
  const b = randInt(1, a / 10 - 1) * 10;
  return calc(a, MINUS, b, a - b, [], 'Tính nhẩm:');
}

function addNoCarry() {
  const [a, b] = addNoCarryPair();
  return calc(a, '+', b, a + b);
}

function subNoBorrow() {
  const [a, b] = subNoBorrowPair();
  return calc(a, MINUS, b, a - b);
}

function columnNoCarry() {
  if (chance(0.5)) {
    const [a, b] = addNoCarryPair();
    return column(a, '+', b, a + b, false);
  }
  const [a, b] = subNoBorrowPair();
  return column(a, MINUS, b, a - b, false);
}

/* --- Vừa --- */

function addCarry() {
  const [a, b] = addCarryPair();
  const s = a + b;
  return calc(a, '+', b, s, [s - 10 /* quên nhớ */, s + 10, s - 1]);
}

function subBorrow() {
  const [a, b] = subBorrowPair();
  const d = a - b;
  // quên nhớ (d + 10); lấy số lớn trừ số bé ở hàng đơn vị
  const swapUnits = (tens(a) - tens(b)) * 10 + (units(b) - units(a));
  return calc(a, MINUS, b, d, [d + 10, swapUnits, d - 1]);
}

function columnCarry() {
  if (chance(0.5)) {
    const [a, b] = addCarryPair();
    return column(a, '+', b, a + b, true);
  }
  const [a, b] = subBorrowPair();
  return column(a, MINUS, b, a - b, true);
}

function mentalRound() {
  // 45 + 5, 60 − 8, 38 + 2 ...
  if (chance(0.5)) {
    const a = randInt(1, 9) * 10 + randInt(1, 9);
    const b = 10 - units(a);
    return calc(a, '+', b, a + b, [a + b - 10, a + b + 1], 'Tính nhẩm:');
  }
  const a = randInt(2, 10) * 10;
  const b = randInt(1, 9);
  return calc(a, MINUS, b, a - b, [a - b + 10, a - 10 + b], 'Tính nhẩm:');
}

/* --- Khó --- */

function twoOperations() {
  for (;;) {
    const a = randInt(10, 90);
    const op1 = pick(['+', MINUS]);
    const b = randInt(2, 50);
    const mid = op1 === '+' ? a + b : a - b;
    if (mid < 0 || mid > 100) continue;
    const op2 = op1 === '+' ? MINUS : pick(['+', MINUS]);
    const c = chance(0.5) ? randInt(1, 9) * 10 : randInt(2, 40);
    const res = op2 === '+' ? mid + c : mid - c;
    if (res < 0 || res > 100) continue;
    return q({
      type: 'input',
      text: 'Tính:',
      big: `${a} ${op1} ${b} ${op2} ${c} = ?`,
      answer: res,
      explain: `Tính từ trái sang phải: ${a} ${op1} ${b} = ${mid}; ${mid} ${op2} ${c} = ${res}`,
    });
  }
}

function missingNumber() {
  const s = randInt(30, 100);
  const a = randInt(10, s - 10);
  const b = s - a;
  const form = pick(['a+?', '?+b', 's-?', '?-b']);
  const map = {
    'a+?': [`${a} + ? = ${s}`, b, `${s} ${MINUS} ${a} = ${b}`],
    '?+b': [`? + ${b} = ${s}`, a, `${s} ${MINUS} ${b} = ${a}`],
    's-?': [`${s} ${MINUS} ? = ${a}`, b, `${s} ${MINUS} ${a} = ${b}`],
    '?-b': [`? ${MINUS} ${b} = ${a}`, s, `${a} + ${b} = ${s}`],
  };
  const [big, ans, how] = map[form];
  return q({ type: 'input', text: 'Tìm số thích hợp:', big, answer: ans, explain: `${how}, nên ${big.replace('?', ans)}` });
}

function compareExpression() {
  let left, lv;
  if (chance(0.5)) {
    const [a, b] = chance(0.5) ? addCarryPair() : addNoCarryPair();
    left = `${a} + ${b}`; lv = a + b;
  } else {
    const [a, b] = chance(0.5) ? subBorrowPair() : subNoBorrowPair();
    left = `${a} ${MINUS} ${b}`; lv = a - b;
  }
  const rv = chance(0.3) ? lv : Math.max(0, Math.min(100, lv + pick([-10, -1, 1, 10, 2, -2])));
  const s = compareSign(lv, rv);
  return q({
    type: 'compare',
    text: 'Chọn dấu >, <, = thích hợp:',
    big: `${left} □ ${rv}`,
    choices: COMPARE_CHOICES,
    answer: s,
    explain: `${left} = ${lv}, mà ${lv} ${s} ${rv}`,
  });
}

function trueFalseCarry() {
  const isAdd = chance(0.5);
  const [a, b] = isAdd ? addCarryPair() : subBorrowPair();
  const right = isAdd ? a + b : a - b;
  const wrong = isAdd ? right - 10 : right + 10; // lỗi quên nhớ
  const shown = chance(0.5) || wrong < 0 || wrong > 100 ? right : wrong;
  const expr = `${a} ${isAdd ? '+' : MINUS} ${b}`;
  return q({
    type: 'truefalse',
    text: 'Bạn Nam tính như sau. Đúng hay sai?',
    big: `${expr} = ${shown}`,
    choices: TF_CHOICES,
    answer: shown === right ? 'Đúng' : 'Sai',
    explain: `${expr} = ${right}${shown !== right ? '. Bạn Nam quên nhớ 1 rồi.' : ''}`,
  });
}

const LEVELS = {
  1: [roundTens, [1.5, addNoCarry], [1.5, subNoBorrow], columnNoCarry],
  2: [[1.5, addCarry], [1.5, subBorrow], [1.5, columnCarry], mentalRound],
  3: [[1.5, twoOperations], missingNumber, compareExpression, trueFalseCarry, columnCarry],
};

export default {
  id: 'cong-tru-100',
  order: 4,
  name: 'Cộng, trừ trong phạm vi 100',
  icon: '🧮',
  color: '#ea580c',
  generate(level) {
    return pickForm(LEVELS[level])();
  },
};
