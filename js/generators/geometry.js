/**
 * Chủ đề 5 – Hình học
 * - Ngân hàng câu hỏi tĩnh kèm hình SVG: data/questions/geometry.json
 *   (điểm, đoạn thẳng, đường thẳng, đường cong, ba điểm thẳng hàng, tứ giác, đếm hình).
 * - Dạng sinh theo mẫu: độ dài đường gấp khúc, số đoạn thẳng của đường gấp khúc.
 */
import { randInt, pick, chance, pickForm, q, shuffle, numberChoices } from './utils.js';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'G'];
let bank = { items: [] };

/** Nạp ngân hàng câu hỏi (trình duyệt). */
export async function load() {
  const res = await fetch(new URL('../../data/questions/geometry.json', import.meta.url));
  useBank(await res.json());
}

/** Gán ngân hàng trực tiếp (dùng cho kiểm thử Node). */
export function useBank(data) {
  bank = data;
}

/** Lấy hình SVG theo id (để vẽ lại khi xem lịch sử). */
export function bankSvg(id) {
  return bank.items.find((it) => it.id === id)?.svg || '';
}

function fromBank(level) {
  const list = bank.items.filter((it) => it.level === level);
  if (!list.length) return polylineLength(level);
  const it = pick(list);
  return q({
    type: it.type,
    text: it.text,
    // Giữ thứ tự "Hình 1, Hình 2…" cho dễ nhìn; các lựa chọn khác thì trộn.
    choices: it.choices && !it.choices.every((c) => /^Hình \d+$/.test(c)) ? shuffle(it.choices) : it.choices,
    answer: it.answer,
    explain: it.explain,
    visual: { kind: 'bank', bank: 'geometry', id: it.id },
  });
}

/** Độ dài đường gấp khúc = tổng độ dài các đoạn thẳng. */
function polylineLength(level) {
  const n = level === 1 ? 2 : level === 2 ? 3 : pick([3, 4]);
  const maxLen = level === 1 ? 9 : 20;
  const lengths = Array.from({ length: n }, () => randInt(2, maxLen));
  const total = lengths.reduce((s, v) => s + v, 0);
  const name = LETTERS.slice(0, n + 1).join('');
  const segs = LETTERS.slice(0, n).map((l, i) => l + LETTERS[i + 1]);
  const asChoice = chance(0.3);
  return q({
    type: asChoice ? 'choice' : 'input',
    text: `Độ dài đường gấp khúc ${name} là bao nhiêu xăng-ti-mét?`,
    visual: { kind: 'polyline', lengths, unit: 'cm' },
    ...(asChoice ? { choices: numberChoices(total, [total - lengths[n - 1]]).map((c) => `${c} cm`) } : {}),
    answer: asChoice ? `${total} cm` : total,
    unit: asChoice ? undefined : 'cm',
    explain: `${lengths.join(' + ')} = ${total} (cm). Cộng độ dài các đoạn ${segs.join(', ')}.`,
  });
}

/** Biết độ dài cả đường gấp khúc, tìm độ dài một đoạn. */
function polylineMissing() {
  const n = 3;
  const lengths = Array.from({ length: n }, () => randInt(3, 25));
  const total = lengths.reduce((s, v) => s + v, 0);
  const hide = randInt(0, n - 1);
  const seg = LETTERS[hide] + LETTERS[hide + 1];
  const known = lengths.filter((_, i) => i !== hide);
  return q({
    type: 'input',
    text: `Đường gấp khúc ABCD dài ${total} cm. Đoạn thẳng ${seg} dài bao nhiêu xăng-ti-mét?`,
    visual: { kind: 'polyline', lengths, hide: [hide], unit: 'cm' },
    answer: lengths[hide],
    unit: 'cm',
    explain: `${total} − ${known[0]} − ${known[1]} = ${lengths[hide]} (cm).`,
  });
}

function polylineSegments() {
  const n = randInt(2, 5);
  const name = LETTERS.slice(0, n + 1).join('');
  return q({
    type: 'input',
    text: `Đường gấp khúc ${name} gồm mấy đoạn thẳng?`,
    visual: { kind: 'polyline', lengths: Array(n).fill(0), unit: '' },
    answer: n,
    explain: `${n + 1} điểm nối liền nhau tạo thành ${n} đoạn thẳng.`,
  });
}

const LEVELS = {
  1: [[3, () => fromBank(1)], () => polylineLength(1), polylineSegments],
  2: [[3, () => fromBank(2)], [1.5, () => polylineLength(2)], polylineSegments],
  3: [[3, () => fromBank(3)], () => polylineLength(3), [1.5, polylineMissing]],
};

export default {
  id: 'hinh-hoc',
  order: 5,
  name: 'Hình học',
  icon: '📐',
  color: '#0891b2',
  load,
  generate(level) {
    return pickForm(LEVELS[level])();
  },
};
