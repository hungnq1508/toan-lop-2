/**
 * Chủ đề 6 – Thống kê và xác suất
 * - Biểu đồ tranh, bảng kiểm đếm: chủ đề & câu hỏi lấy từ data/questions/statistics.json,
 *   số lượng sinh ngẫu nhiên để không trùng lặp.
 * - Khả năng xảy ra: chắc chắn / có thể / không thể (câu tĩnh + hộp bi sinh ngẫu nhiên).
 */
import { randInt, pick, chance, pickForm, q, shuffle, sample, numberChoices, TF_CHOICES } from './utils.js';

let bank = { pictographs: [], tallies: [], possibility: [] };

export async function load() {
  const res = await fetch(new URL('../../data/questions/statistics.json', import.meta.url));
  useBank(await res.json());
}

export function useBank(data) {
  bank = data;
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const fill = (tpl, map) => cap(tpl.replace(/\{(\w+)\}/g, (_, k) => map[k]));
const POSS = ['Chắc chắn', 'Có thể', 'Không thể'];

/** Sinh số lượng khác nhau cho từng hàng (để "nhiều nhất/ít nhất" là duy nhất). */
function distinctCounts(n, min, max) {
  return sample(Array.from({ length: max - min + 1 }, (_, i) => i + min), n);
}

function pictograph() {
  const p = pick(bank.pictographs);
  const counts = distinctCounts(p.labels.length, 1, 9);
  const rows = p.labels.map((label, i) => ({ label, emoji: p.emojis ? p.emojis[i] : p.emoji, count: counts[i] }));
  const visual = {
    kind: 'pictograph',
    title: p.title,
    rows: rows.map((r) => ({ label: cap(r.label), emoji: r.emoji, count: r.count })),
  };
  return { p, rows, visual };
}

/* ---------- Biểu đồ tranh ---------- */

function pictoCount() {
  const { p, rows, visual } = pictograph();
  const r = pick(rows);
  return q({
    type: 'input',
    text: fill(p.ask, { label: r.label }),
    visual,
    answer: r.count,
    explain: `Đếm số hình ở hàng “${cap(r.label)}”: có ${r.count} hình.`,
  });
}

function pictoMostLeast(most) {
  const { p, rows, visual } = pictograph();
  const target = rows.reduce((best, r) => ((most ? r.count > best.count : r.count < best.count) ? r : best));
  return q({
    type: 'choice',
    text: fill(p.most, { nhieu: most ? 'nhiều' : 'ít' }),
    visual,
    choices: shuffle(rows.map((r) => cap(r.label))),
    answer: cap(target.label),
    explain: `Hàng “${cap(target.label)}” có ${most ? 'nhiều' : 'ít'} hình nhất (${target.count}).`,
  });
}

function pictoDiff() {
  const { p, rows, visual } = pictograph();
  const [x, y] = sample(rows, 2);
  const [A, B] = x.count > y.count ? [x, y] : [y, x];
  const d = A.count - B.count;
  return q({
    type: 'input',
    text: fill(p.diff, { A: A.label, B: B.label }),
    visual,
    answer: d,
    explain: `${A.count} − ${B.count} = ${d}`,
  });
}

function pictoTrueFalse() {
  const { rows, visual } = pictograph();
  const [x, y] = sample(rows, 2);
  const isTrue = x.count > y.count;
  return q({
    type: 'truefalse',
    text: `Hàng “${cap(x.label)}” có nhiều hình hơn hàng “${cap(y.label)}”.`,
    visual,
    choices: TF_CHOICES,
    answer: isTrue ? 'Đúng' : 'Sai',
    explain: `“${cap(x.label)}” có ${x.count}, “${cap(y.label)}” có ${y.count}.`,
  });
}

function pictoTotal() {
  const { p, rows, visual } = pictograph();
  const useAll = chance(0.5);
  const chosen = useAll ? rows : sample(rows, 2);
  const total = chosen.reduce((s, r) => s + r.count, 0);
  const text = useAll
    ? `Biểu đồ có tất cả bao nhiêu ${p.unit}?`
    : `Hàng “${cap(chosen[0].label)}” và hàng “${cap(chosen[1].label)}” có tất cả bao nhiêu ${p.unit}?`;
  return q({
    type: 'input',
    text,
    visual,
    answer: total,
    explain: `${chosen.map((r) => r.count).join(' + ')} = ${total}`,
  });
}

/* ---------- Bảng kiểm đếm ---------- */

function tally(level) {
  const t = pick(bank.tallies);
  const counts = distinctCounts(t.labels.length, level === 1 ? 2 : 4, level === 1 ? 9 : 15);
  const rows = t.labels.map((label, i) => ({ label: cap(label), emoji: t.emojis[i], count: counts[i] }));
  const visual = { kind: 'tally', title: t.title, rows };
  const i = randInt(0, rows.length - 1);
  if (level >= 2 && chance(0.5)) {
    const total = counts.reduce((s, v) => s + v, 0);
    return q({
      type: 'choice',
      text: 'Nhìn bảng kiểm đếm. Có tất cả bao nhiêu vạch?',
      speak: 'Nhìn bảng kiểm đếm. Có tất cả bao nhiêu vạch?',
      visual,
      choices: numberChoices(total, [total - 1, total + 5]),
      answer: total,
      explain: `${counts.join(' + ')} = ${total}. Mỗi nhóm có gạch chéo là 5 vạch.`,
    });
  }
  return q({
    type: 'input',
    text: fill(t.ask, { label: t.labels[i] }),
    visual,
    answer: counts[i],
    explain: `Hàng “${rows[i].label}” có ${counts[i]} vạch. Mỗi nhóm có gạch chéo là 5 vạch.`,
  });
}

/* ---------- Khả năng xảy ra ---------- */

function possibilityStatement() {
  const s = pick(bank.possibility);
  return q({
    type: 'choice',
    text: `Sự việc sau đây “chắc chắn”, “có thể” hay “không thể” xảy ra? ${s.text}`,
    choices: POSS,
    answer: s.answer,
    explain: `“${s.text}” – ${s.answer.toLowerCase()} xảy ra.`,
  });
}

const COLORS = [
  { id: 'red', name: 'đỏ' },
  { id: 'blue', name: 'xanh' },
  { id: 'yellow', name: 'vàng' },
];

function marbleBox() {
  const kinds = sample(COLORS, chance(0.35) ? 1 : 2);
  const counts = {};
  kinds.forEach((c) => (counts[c.id] = randInt(2, 6)));
  const desc = kinds.map((c) => `${counts[c.id]} viên bi ${c.name}`).join(' và ');
  return { kinds, counts, desc };
}

function marbles(asTrueFalse) {
  const { kinds, counts, desc } = marbleBox();
  const target = pick(COLORS);
  const inBox = kinds.some((c) => c.id === target.id);
  const answer = !inBox ? 'Không thể' : kinds.length === 1 ? 'Chắc chắn' : 'Có thể';
  const visual = { kind: 'marbles', counts };
  const base = `Trong hộp có ${desc}. Không nhìn vào hộp, lấy ra 1 viên bi.`;
  const why = !inBox
    ? `Trong hộp không có bi ${target.name}.`
    : kinds.length === 1 ? `Trong hộp chỉ có bi ${target.name}.` : `Trong hộp có cả bi ${target.name} và bi màu khác.`;
  if (asTrueFalse) {
    const said = chance(0.5) ? answer : pick(POSS.filter((p) => p !== answer));
    return q({
      type: 'truefalse',
      text: `${base} “${said} lấy được viên bi ${target.name}.” Đúng hay sai?`,
      visual,
      choices: TF_CHOICES,
      answer: said === answer ? 'Đúng' : 'Sai',
      explain: `${why} Vậy ${answer.toLowerCase()} lấy được bi ${target.name}.`,
    });
  }
  return q({
    type: 'choice',
    text: `${base} Khả năng lấy được viên bi ${target.name} là:`,
    visual,
    choices: POSS,
    answer,
    explain: `${why} Vậy ${answer.toLowerCase()} lấy được bi ${target.name}.`,
  });
}

const LEVELS = {
  1: [[2, pictoCount], () => pictoMostLeast(true), () => tally(1), [1.5, possibilityStatement]],
  2: [() => pictoMostLeast(false), [1.5, pictoDiff], pictoTrueFalse, () => tally(2), [1.5, () => marbles(false)]],
  3: [[1.5, pictoTotal], pictoDiff, () => tally(3), () => marbles(true), possibilityStatement],
};

export default {
  id: 'thong-ke',
  order: 6,
  name: 'Thống kê – xác suất',
  icon: '📊',
  color: '#ca8a04',
  load,
  generate(level) {
    return pickForm(LEVELS[level])();
  },
};
