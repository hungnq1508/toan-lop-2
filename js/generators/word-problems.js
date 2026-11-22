/**
 * Chủ đề 7 – Toán có lời văn
 * Bài toán một bước về phép cộng, phép trừ: thêm, bớt, gộp, nhiều hơn, ít hơn, hơn kém.
 * Dễ: số ≤ 20 không nhớ (có dạng chọn phép tính) · Vừa: thêm/bớt/gộp ≤ 100 · Khó: nhiều hơn/ít hơn/hơn kém.
 */
import { randInt, pick, chance, pickForm, q, shuffle, twoNames, textChoices, MINUS } from './utils.js';

// Đồ vật: danh từ đầy đủ + loại từ (để viết đáp số gọn).
const THINGS = [
  { noun: 'quả táo', unit: 'quả' },
  { noun: 'bông hoa', unit: 'bông' },
  { noun: 'viên bi', unit: 'viên' },
  { noun: 'quyển vở', unit: 'quyển' },
  { noun: 'cái kẹo', unit: 'cái' },
  { noun: 'chiếc bút chì', unit: 'chiếc' },
  { noun: 'nhãn vở', unit: 'nhãn' },
  { noun: 'con tem', unit: 'con' },
  { noun: 'quả bóng bay', unit: 'quả' },
  { noun: 'ngôi sao giấy', unit: 'ngôi' },
];
const GIVERS = ['Mẹ', 'Bố', 'Bà', 'Ông', 'Cô giáo', 'Chị'];

/* ---------- Sinh cặp số theo mức độ ---------- */
function addPair(level) {
  for (;;) {
    if (level === 1) {
      const a = randInt(2, 15);
      const b = randInt(1, 9);
      if (a + b <= 20 && (a % 10) + b < 10) return [a, b];
    } else {
      const a = randInt(10, 80);
      const b = randInt(3, 50);
      if (a + b <= 100) return [a, b];
    }
  }
}

function subPair(level) {
  if (level === 1) {
    // ≤ 20, không nhớ: 9 − 4, 17 − 5
    if (chance(0.4)) {
      const a = randInt(4, 10);
      return [a, randInt(1, a - 1)];
    }
    const a = randInt(11, 19);
    return [a, randInt(1, a % 10)];
  }
  const a = randInt(20, 100);
  return [a, randInt(3, a - 5)];
}

/* ---------- Mẫu bài toán ---------- */
// Mỗi mẫu trả về { text, op, a, b } với op '+' hoặc '−'.

function tplAddMore(level) {
  const [a, b] = addPair(level);
  const [A] = twoNames();
  const t = pick(THINGS);
  const g = pick(GIVERS);
  return { text: `${A} có ${a} ${t.noun}. ${g} cho ${A} thêm ${b} ${t.noun}. Hỏi ${A} có tất cả bao nhiêu ${t.noun}?`, op: '+', a, b, unit: t.noun };
}

function tplCombine(level) {
  const [a, b] = addPair(level);
  const scenes = [
    () => {
      const [A, B] = twoNames();
      const t = pick(THINGS);
      return { text: `${A} có ${a} ${t.noun}, ${B} có ${b} ${t.noun}. Hỏi cả hai bạn có bao nhiêu ${t.noun}?`, unit: t.noun };
    },
    () => ({ text: `Lớp 2A có ${a} bạn nam và ${b} bạn nữ. Hỏi lớp 2A có tất cả bao nhiêu bạn?`, unit: 'bạn' }),
    () => ({ text: `Trong vườn có ${a} cây cam và ${b} cây bưởi. Hỏi trong vườn có tất cả bao nhiêu cây?`, unit: 'cây' }),
    () => ({ text: `Trong chuồng có ${a} con gà. Mẹ mua thêm ${b} con gà. Hỏi trong chuồng có tất cả bao nhiêu con gà?`, unit: 'con gà' }),
    () => ({ text: `Dưới ao có ${a} con vịt. Có thêm ${b} con vịt nữa xuống ao. Hỏi dưới ao có tất cả bao nhiêu con vịt?`, unit: 'con vịt' }),
  ];
  return { ...pick(scenes)(), op: '+', a, b };
}

function tplTakeAway(level) {
  const [a, b] = subPair(level);
  const scenes = [
    () => {
      const [A, B] = twoNames();
      const t = pick(THINGS);
      return { text: `${A} có ${a} ${t.noun}. ${A} cho ${B} ${b} ${t.noun}. Hỏi ${A} còn lại bao nhiêu ${t.noun}?`, unit: t.noun };
    },
    () => ({ text: `Trên cành có ${a} con chim, sau đó ${b} con chim bay đi. Hỏi trên cành còn lại bao nhiêu con chim?`, unit: 'con chim' }),
    () => ({ text: `Đĩa có ${a} cái bánh. Cả nhà đã ăn ${b} cái bánh. Hỏi đĩa còn lại bao nhiêu cái bánh?`, unit: 'cái bánh' }),
    () => ({ text: `Thư viện có ${a} quyển truyện. Các bạn mượn đi ${b} quyển truyện. Hỏi thư viện còn lại bao nhiêu quyển truyện?`, unit: 'quyển truyện' }),
    () => ({ text: `Cửa hàng có ${a} quả bóng, đã bán ${b} quả bóng. Hỏi cửa hàng còn lại bao nhiêu quả bóng?`, unit: 'quả bóng' }),
  ];
  return { ...pick(scenes)(), op: MINUS, a, b };
}

function tplMoreThan() {
  const [a, b] = addPair(2);
  const [A, B] = twoNames();
  const t = pick(THINGS);
  return { text: `${A} có ${a} ${t.noun}. ${B} có nhiều hơn ${A} ${b} ${t.noun}. Hỏi ${B} có bao nhiêu ${t.noun}?`, op: '+', a, b, unit: t.noun };
}

function tplLessThan() {
  const [a, b] = subPair(2);
  const scenes = [
    () => {
      const [A, B] = twoNames();
      const t = pick(THINGS);
      return { text: `${A} có ${a} ${t.noun}. ${B} có ít hơn ${A} ${b} ${t.noun}. Hỏi ${B} có bao nhiêu ${t.noun}?`, unit: t.noun };
    },
    () => ({ text: `Tổ Một trồng được ${a} cây. Tổ Hai trồng được ít hơn tổ Một ${b} cây. Hỏi tổ Hai trồng được bao nhiêu cây?`, unit: 'cây' }),
  ];
  return { ...pick(scenes)(), op: MINUS, a, b };
}

function tplDifference() {
  const [x, y] = subPair(2); // x > y
  const b = x - y;
  const more = chance(0.5);
  const scenes = [
    () => {
      const [A, B] = twoNames();
      const t = pick(THINGS);
      return more
        ? { text: `${A} có ${x} ${t.noun}, ${B} có ${b} ${t.noun}. Hỏi ${A} có nhiều hơn ${B} bao nhiêu ${t.noun}?`, unit: t.noun }
        : { text: `${A} có ${x} ${t.noun}, ${B} có ${b} ${t.noun}. Hỏi ${B} có ít hơn ${A} bao nhiêu ${t.noun}?`, unit: t.noun };
    },
    () => ({
      text: more
        ? `Lớp 2A có ${x} bạn, lớp 2B có ${b} bạn. Hỏi lớp 2A nhiều hơn lớp 2B bao nhiêu bạn?`
        : `Lớp 2A có ${x} bạn, lớp 2B có ${b} bạn. Hỏi lớp 2B ít hơn lớp 2A bao nhiêu bạn?`,
      unit: 'bạn',
    }),
  ];
  return { ...pick(scenes)(), op: MINUS, a: x, b };
}

/* ---------- Chuyển mẫu → câu hỏi ---------- */

function toQuestion(p) {
  const ans = p.op === '+' ? p.a + p.b : p.a - p.b;
  return q({
    type: 'input',
    text: p.text,
    answer: ans,
    explain: `Bài giải: ${p.a} ${p.op} ${p.b} = ${ans} (${p.unit}). Đáp số: ${ans} ${p.unit}.`,
  });
}

/** Dạng trắc nghiệm: chọn phép tính đúng. */
function chooseOperation(p) {
  const ans = p.op === '+' ? p.a + p.b : p.a - p.b;
  const right = `${p.a} ${p.op} ${p.b} = ${ans}`;
  const wrongs = [];
  // Ưu tiên nhầm phép tính (cộng ↔ trừ), sau đó là tính sai lệch 1 hoặc 10
  if (p.op === '+' && p.a > p.b) wrongs.push(`${p.a} ${MINUS} ${p.b} = ${p.a - p.b}`);
  if (p.op !== '+' && p.a + p.b <= 100) wrongs.push(`${p.a} + ${p.b} = ${p.a + p.b}`);
  const near = [ans + 1, ans - 1, ans + 10, ans - 10].filter((v) => v >= 0 && v <= 100);
  for (const v of shuffle(near)) wrongs.push(`${p.a} ${p.op} ${p.b} = ${v}`);
  return q({
    type: 'choice',
    text: `${p.text} Chọn phép tính đúng:`,
    choices: textChoices(right, wrongs, 3),
    answer: right,
    explain: `Phép tính đúng: ${right} (${p.unit}).`,
  });
}

const LEVELS = {
  1: [
    () => toQuestion(tplAddMore(1)),
    () => toQuestion(tplCombine(1)),
    () => toQuestion(tplTakeAway(1)),
    () => chooseOperation(pick([tplAddMore, tplTakeAway, tplCombine])(1)),
  ],
  2: [
    () => toQuestion(tplAddMore(2)),
    () => toQuestion(tplCombine(2)),
    [1.5, () => toQuestion(tplTakeAway(2))],
    () => chooseOperation(pick([tplAddMore, tplTakeAway, tplCombine])(2)),
  ],
  3: [
    () => toQuestion(tplMoreThan()),
    () => toQuestion(tplLessThan()),
    () => toQuestion(tplDifference()),
    () => chooseOperation(pick([tplMoreThan, tplLessThan, tplDifference])()),
  ],
};

export default {
  id: 'loi-van',
  order: 7,
  name: 'Toán có lời văn',
  icon: '📖',
  color: '#db2777',
  generate(level) {
    return pickForm(LEVELS[level])();
  },
};
