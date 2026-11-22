/**
 * Chủ đề 1 – Ôn tập số đến 100
 * Đọc/viết số, chục – đơn vị, so sánh, số liền trước/liền sau, sắp xếp, tia số.
 */
import {
  randInt, pick, chance, shuffle, sample, pickForm, q, numberChoices, textChoices,
  numberToWords, wrongReadings, compareSign, COMPARE_CHOICES, TF_CHOICES, OBJECTS,
} from './utils.js';

/* ---------- Các dạng bài ---------- */

function neighbor(max) {
  const after = chance(0.5);
  const n = after ? randInt(1, max - 1) : randInt(2, max);
  const ans = after ? n + 1 : n - 1;
  const word = after ? 'liền sau' : 'liền trước';
  return q({
    type: 'input',
    text: `Số ${word} của ${n} là số nào?`,
    answer: ans,
    explain: `Số ${word} của ${n} là ${ans}.`,
  });
}

function tensUnits(max) {
  const t = randInt(1, Math.floor((max - 1) / 10));
  const u = randInt(0, 9);
  const n = t * 10 + u;
  return q({
    type: 'input',
    text: `Số gồm ${t} chục và ${u} đơn vị là số nào?`,
    answer: n,
    explain: `${t} chục và ${u} đơn vị là ${n}.`,
  });
}

function splitTensUnits() {
  const t = randInt(1, 9);
  let u = randInt(0, 9);
  if (u === t) u = (u + 1) % 10;
  const n = t * 10 + u;
  const fmt = (a, b) => `${a} chục và ${b} đơn vị`;
  const wrongs = [fmt(u, t), fmt(t, (u + 1) % 10), fmt(Math.min(9, t + 1), u), fmt(Math.max(0, t - 1), u)];
  return q({
    type: 'choice',
    text: `Số ${n} gồm mấy chục và mấy đơn vị?`,
    choices: textChoices(fmt(t, u), wrongs),
    answer: fmt(t, u),
    explain: `Số ${n} gồm ${t} chục và ${u} đơn vị.`,
  });
}

function compareNumbers(min, max) {
  const a = randInt(min, max);
  let b;
  if (chance(0.2)) b = a;
  else if (chance(0.5)) {
    // cùng chữ số hàng chục hoặc đảo chữ số → dễ nhầm hơn
    b = chance(0.5) ? Math.floor(a / 10) * 10 + randInt(0, 9) : (a % 10) * 10 + Math.floor(a / 10);
    if (b < min || b > max) b = randInt(min, max);
  } else b = randInt(min, max);
  const s = compareSign(a, b);
  return q({
    type: 'compare',
    text: 'Chọn dấu >, <, = thích hợp:',
    big: `${a} □ ${b}`,
    speak: `So sánh ${a} và ${b}.`,
    choices: COMPARE_CHOICES,
    answer: s,
    explain: `${a} ${s} ${b}`,
  });
}

function countObjects(min, max) {
  const obj = pick(OBJECTS);
  const n = randInt(min, max);
  return q({
    type: 'input',
    text: `Có bao nhiêu ${obj.noun}?`,
    visual: { kind: 'objects', emoji: obj.emoji, count: n },
    answer: n,
    explain: `Có ${n} ${obj.noun}. Đếm theo từng hàng 5 cho nhanh nhé!`,
  });
}

function readNumber(min, max) {
  const n = randInt(min, max);
  const right = numberToWords(n);
  return q({
    type: 'choice',
    text: 'Số dưới đây đọc là:',
    speak: 'Số này đọc là gì?',
    big: String(n),
    choices: textChoices(right, wrongReadings(n)),
    answer: right,
    explain: `${n} đọc là “${right}”.`,
  });
}

function writeNumber(min, max) {
  const n = randInt(min, max);
  const w = numberToWords(n);
  return q({
    type: 'input',
    text: `Số “${w}” viết là:`,
    answer: n,
    explain: `“${w}” viết là ${n}.`,
  });
}

function numberLine(steps) {
  const step = pick(steps);
  const count = 6;
  const maxStart = 100 - step * (count - 1);
  let start = randInt(0, Math.floor(maxStart / step)) * step;
  if (step === 1) start = randInt(0, maxStart);
  const hide = randInt(1, count - 1);
  const ans = start + hide * step;
  return q({
    type: 'input',
    text: 'Số nào còn thiếu trên tia số?',
    visual: { kind: 'numberline', start, step, count, hide: [hide] },
    answer: ans,
    explain: `Các số cách đều nhau ${step} đơn vị, nên số còn thiếu là ${ans}.`,
  });
}

function maxMin() {
  const findMax = chance(0.5);
  // các số gần nhau, có số đảo chữ số để dễ nhầm
  const base = randInt(12, 89);
  const pool = new Set([base]);
  const rev = (base % 10) * 10 + Math.floor(base / 10);
  if (rev >= 10 && rev <= 99) pool.add(rev);
  while (pool.size < 4) pool.add(Math.max(10, Math.min(99, base + randInt(-15, 15))));
  const nums = shuffle([...pool]);
  const ans = findMax ? Math.max(...nums) : Math.min(...nums);
  return q({
    type: 'choice',
    text: `Số ${findMax ? 'lớn nhất' : 'bé nhất'} trong các số sau là:`,
    choices: nums.map(String),
    answer: ans,
    explain: `Số ${findMax ? 'lớn nhất' : 'bé nhất'} là ${ans}.`,
  });
}

function sortNumbers() {
  const asc = chance(0.5);
  const nums = [];
  while (nums.length < 4) {
    const n = randInt(10, 99);
    if (!nums.includes(n)) nums.push(n);
  }
  const sorted = [...nums].sort((a, b) => (asc ? a - b : b - a));
  const fmt = (arr) => arr.join(', ');
  const right = fmt(sorted);
  const wrongs = [fmt([...sorted].reverse())];
  for (let i = 0; i < 10 && wrongs.length < 5; i++) wrongs.push(fmt(shuffle(sorted)));
  return q({
    type: 'choice',
    text: `Các số ${fmt(shuffle(nums))} xếp theo thứ tự từ ${asc ? 'bé đến lớn' : 'lớn đến bé'} là:`,
    choices: textChoices(right, wrongs),
    answer: right,
    explain: `Từ ${asc ? 'bé đến lớn' : 'lớn đến bé'}: ${right}.`,
  });
}

function compareExpression() {
  const t = randInt(1, 9);
  const u = randInt(1, 9);
  const val = t * 10 + u;
  let other = chance(0.25) ? val : pick([u * 10 + t, val + 1, val - 1, val + 10, val - 10]);
  other = Math.max(10, Math.min(99, other));
  const s = compareSign(val, other);
  return q({
    type: 'compare',
    text: 'Chọn dấu >, <, = thích hợp:',
    big: `${t * 10} + ${u} □ ${other}`,
    speak: `So sánh ${t * 10} cộng ${u} và ${other}.`,
    choices: COMPARE_CHOICES,
    answer: s,
    explain: `${t * 10} + ${u} = ${val}, mà ${val} ${s} ${other}.`,
  });
}

function roundTenAfter() {
  let n = randInt(11, 98);
  if (n % 10 === 0) n += 1;
  const after = chance(0.6);
  const ans = after ? Math.ceil(n / 10) * 10 : Math.floor(n / 10) * 10;
  return q({
    type: 'input',
    text: after
      ? `Số tròn chục liền sau của ${n} là số nào?`
      : `Số tròn chục liền trước của ${n} là số nào?`,
    answer: ans,
    explain: `Số tròn chục liền ${after ? 'sau' : 'trước'} của ${n} là ${ans}.`,
  });
}

function specialNumbers() {
  const list = [
    ['Số lớn nhất có hai chữ số là số nào?', 99],
    ['Số bé nhất có hai chữ số là số nào?', 10],
    ['Số tròn chục lớn nhất có hai chữ số là số nào?', 90],
    ['Số lớn nhất có một chữ số là số nào?', 9],
    ['Số liền sau của số lớn nhất có hai chữ số là số nào?', 100],
  ];
  const [text, ans] = pick(list);
  if (chance(0.4)) {
    // Ghép hai chữ số
    const [a, b] = sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 2);
    const big = Math.max(a, b) * 10 + Math.min(a, b);
    const small = Math.min(a, b) * 10 + Math.max(a, b);
    const wantBig = chance(0.5);
    return q({
      type: 'input',
      text: `Từ hai chữ số ${a} và ${b}, số có hai chữ số khác nhau ${wantBig ? 'lớn nhất' : 'bé nhất'} viết được là số nào?`,
      answer: wantBig ? big : small,
      explain: `Viết được hai số: ${small} và ${big}. Số ${wantBig ? 'lớn nhất' : 'bé nhất'} là ${wantBig ? big : small}.`,
    });
  }
  return q({ type: 'input', text, answer: ans, explain: `Đáp án là ${ans}.` });
}

function trueFalseStructure() {
  const t = randInt(1, 9);
  const u = randInt(0, 9);
  const n = t * 10 + u;
  const isTrue = chance(0.5);
  let st = t, su = u;
  if (!isTrue) {
    if (u !== 0 && u !== t) [st, su] = [u, t];
    else st = t === 9 ? 8 : t + 1;
  }
  return q({
    type: 'truefalse',
    text: `Số ${n} gồm ${st} chục và ${su} đơn vị.`,
    choices: TF_CHOICES,
    answer: isTrue ? 'Đúng' : 'Sai',
    explain: `Số ${n} gồm ${t} chục và ${u} đơn vị.`,
  });
}

/* ---------- Khai báo chủ đề ---------- */

const LEVELS = {
  1: [
    () => neighbor(50),
    () => tensUnits(50),
    () => compareNumbers(10, 50),
    [1.5, () => countObjects(6, 20)],
    () => readNumber(11, 50),
  ],
  2: [
    () => neighbor(100),
    () => writeNumber(20, 99),
    () => compareNumbers(10, 99),
    splitTensUnits,
    () => numberLine([1, 10]),
    maxMin,
    () => readNumber(21, 99),
  ],
  3: [
    sortNumbers,
    compareExpression,
    () => numberLine([2, 5, 10]),
    roundTenAfter,
    specialNumbers,
    trueFalseStructure,
  ],
};

export default {
  id: 'so-den-100',
  order: 1,
  name: 'Ôn tập số đến 100',
  icon: '🔢',
  color: '#2563eb',
  generate(level) {
    return pickForm(LEVELS[level])();
  },
};
