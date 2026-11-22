/**
 * Chủ đề 2 – Tên gọi thành phần phép tính
 * Số hạng – tổng; số bị trừ – số trừ – hiệu; nhiều hơn / ít hơn bao nhiêu.
 */
import { randInt, pick, chance, pickForm, q, shuffle, numberChoices, MINUS, TF_CHOICES } from './utils.js';

const ADD_NAMES = ['Số hạng', 'Tổng'];
const SUB_NAMES = ['Số bị trừ', 'Số trừ', 'Hiệu'];

/** Phép cộng a + b = s với a, b, s đôi một khác nhau. */
function addFact(maxSum) {
  let a, b;
  do {
    a = randInt(2, maxSum - 2);
    b = randInt(1, maxSum - a);
  } while (a === b);
  return [a, b, a + b];
}

/** Phép trừ m − n = d với m, n, d đôi một khác nhau. */
function subFact(maxM) {
  let m, n;
  do {
    m = randInt(5, maxM);
    n = randInt(1, m - 1);
  } while (n === m - n);
  return [m, n, m - n];
}

function nameInAddition(maxSum) {
  const [a, b, s] = addFact(maxSum);
  const role = pick([0, 1, 2]);
  const value = [a, b, s][role];
  const answer = role === 2 ? 'Tổng' : 'Số hạng';
  return q({
    type: 'choice',
    text: `Trong phép cộng ${a} + ${b} = ${s}, số ${value} gọi là gì?`,
    choices: shuffle([...ADD_NAMES, 'Số bị trừ', 'Hiệu']),
    answer,
    explain: `${a} + ${b} = ${s}: ${a} và ${b} là số hạng, ${s} là tổng.`,
  });
}

function nameInSubtraction(maxM) {
  const [m, n, d] = subFact(maxM);
  const role = pick([0, 1, 2]);
  const value = [m, n, d][role];
  return q({
    type: 'choice',
    text: `Trong phép trừ ${m} ${MINUS} ${n} = ${d}, số ${value} gọi là gì?`,
    choices: shuffle([...SUB_NAMES, 'Tổng']),
    answer: SUB_NAMES[role],
    explain: `${m} ${MINUS} ${n} = ${d}: ${m} là số bị trừ, ${n} là số trừ, ${d} là hiệu.`,
  });
}

function trueFalseName() {
  const isAdd = chance(0.5);
  const isTrue = chance(0.5);
  if (isAdd) {
    const [a, b, s] = addFact(20);
    const role = pick([0, 2]);
    const value = [a, b, s][role];
    const realName = role === 2 ? 'tổng' : 'số hạng';
    const said = isTrue ? realName : realName === 'tổng' ? 'số hạng' : 'tổng';
    return q({
      type: 'truefalse',
      text: `Trong phép cộng ${a} + ${b} = ${s}, ${value} là ${said}.`,
      choices: TF_CHOICES,
      answer: isTrue ? 'Đúng' : 'Sai',
      explain: `${value} là ${realName}.`,
    });
  }
  const [m, n, d] = subFact(20);
  const role = pick([0, 1, 2]);
  const names = ['số bị trừ', 'số trừ', 'hiệu'];
  const said = isTrue ? names[role] : pick(names.filter((_, i) => i !== role));
  return q({
    type: 'truefalse',
    text: `Trong phép trừ ${m} ${MINUS} ${n} = ${d}, ${[m, n, d][role]} là ${said}.`,
    choices: TF_CHOICES,
    answer: isTrue ? 'Đúng' : 'Sai',
    explain: `${[m, n, d][role]} là ${names[role]}.`,
  });
}

function sumOf() {
  const a = randInt(10, 70);
  const b = randInt(2, 100 - a);
  const s = a + b;
  return q({
    type: 'input',
    text: pick([`Tổng của ${a} và ${b} là bao nhiêu?`, `Hai số hạng là ${a} và ${b}. Tổng là bao nhiêu?`]),
    answer: s,
    explain: `${a} + ${b} = ${s}`,
  });
}

function differenceOf() {
  const m = randInt(15, 99);
  const n = randInt(2, m - 1);
  const d = m - n;
  return q({
    type: 'input',
    text: pick([
      `Hiệu của ${m} và ${n} là bao nhiêu?`,
      `Số bị trừ là ${m}, số trừ là ${n}. Hiệu là bao nhiêu?`,
    ]),
    answer: d,
    explain: `${m} ${MINUS} ${n} = ${d}`,
  });
}

function moreLessBy() {
  const big = randInt(8, 99);
  const small = randInt(1, big - 1);
  const d = big - small;
  const more = chance(0.5);
  return q({
    type: more ? 'input' : 'choice',
    text: more
      ? `Số ${big} nhiều hơn số ${small} bao nhiêu đơn vị?`
      : `Số ${small} ít hơn số ${big} bao nhiêu đơn vị?`,
    ...(more ? {} : { choices: numberChoices(d, [big + small]) }),
    answer: d,
    explain: `${big} ${MINUS} ${small} = ${d}`,
  });
}

function findAddend() {
  const s = randInt(20, 100);
  const a = randInt(5, s - 5);
  const b = s - a;
  return q({
    type: 'input',
    text: `Tổng là ${s}, một số hạng là ${a}. Số hạng còn lại là bao nhiêu?`,
    answer: b,
    explain: `Lấy tổng trừ số hạng đã biết: ${s} ${MINUS} ${a} = ${b}`,
  });
}

function findMinuend() {
  const n = randInt(5, 50);
  const d = randInt(3, 100 - n);
  const m = n + d;
  return q({
    type: 'input',
    text: `Hiệu là ${d}, số trừ là ${n}. Số bị trừ là bao nhiêu?`,
    answer: m,
    explain: `Lấy hiệu cộng số trừ: ${d} + ${n} = ${m}`,
  });
}

function findSubtrahend() {
  const m = randInt(20, 100);
  const n = randInt(3, m - 3);
  const d = m - n;
  return q({
    type: 'input',
    text: `Số bị trừ là ${m}, hiệu là ${d}. Số trừ là bao nhiêu?`,
    answer: n,
    explain: `Lấy số bị trừ trừ hiệu: ${m} ${MINUS} ${d} = ${n}`,
  });
}

function numberMoreLess() {
  const more = chance(0.5);
  if (more) {
    const a = randInt(10, 80);
    const k = randInt(2, 100 - a);
    return q({
      type: 'input',
      text: `Số nào nhiều hơn ${a} là ${k} đơn vị?`,
      answer: a + k,
      explain: `${a} + ${k} = ${a + k}`,
    });
  }
  const a = randInt(15, 100);
  const k = randInt(2, a - 1);
  return q({
    type: 'input',
    text: `Số nào ít hơn ${a} là ${k} đơn vị?`,
    answer: a - k,
    explain: `${a} ${MINUS} ${k} = ${a - k}`,
  });
}

const LEVELS = {
  1: [() => nameInAddition(20), () => nameInSubtraction(20), trueFalseName],
  2: [() => nameInAddition(100), () => nameInSubtraction(100), sumOf, differenceOf, [1.5, moreLessBy]],
  3: [findAddend, findMinuend, findSubtrahend, numberMoreLess],
};

export default {
  id: 'thanh-phan',
  order: 2,
  name: 'Tên gọi thành phần phép tính',
  icon: '🏷️',
  color: '#7c3aed',
  generate(level) {
    return pickForm(LEVELS[level])();
  },
};
