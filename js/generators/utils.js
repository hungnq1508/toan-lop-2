/**
 * Tiện ích dùng chung cho các module sinh câu hỏi.
 *
 * QUY ƯỚC MỘT CÂU HỎI (object thuần, lưu được vào localStorage):
 * {
 *   topic:   'add-sub-20'            // id chủ đề (engine tự gán)
 *   level:   1 | 2 | 3               // Dễ / Vừa / Khó (engine tự gán)
 *   type:    'choice' | 'input' | 'compare' | 'truefalse'
 *   text:    'Tính:'                 // câu dẫn (chữ thường, ≥ 32px)
 *   big:     '8 + 7 = ?'             // (tuỳ chọn) biểu thức chữ to. '?' = ô cần điền, '□' = ô điền dấu
 *   visual:  { kind: 'objects', ... } // (tuỳ chọn) mô tả hình minh hoạ, xem js/visuals.js
 *   choices: ['13', '15', ...]       // với choice / compare / truefalse
 *   answer:  '15'                    // luôn là chuỗi
 *   unit:    'cm'                    // (tuỳ chọn) đơn vị hiện cạnh ô điền số
 *   explain: '8 + 7 = 15'            // giải thích ngắn khi bé làm sai
 *   speak:   '...'                   // (tuỳ chọn) câu đọc thay cho text + big
 * }
 *
 * Các hàm ở đây KHÔNG dùng DOM để có thể chạy kiểm thử bằng Node.
 */

export const MAX = 100;
export const MINUS = '−'; // dấu trừ chuẩn (U+2212) cho dễ đọc

export function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function chance(p) {
  return Math.random() < p;
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Lấy k phần tử khác nhau ngẫu nhiên. */
export function sample(arr, k) {
  return shuffle(arr).slice(0, k);
}

/**
 * Chọn ngẫu nhiên một hàm sinh theo trọng số.
 * forms: [[trọng số, hàm], ...] hoặc [hàm, ...]
 */
export function pickForm(forms) {
  const list = forms.map((f) => (Array.isArray(f) ? f : [1, f]));
  const total = list.reduce((s, [w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [w, fn] of list) {
    r -= w;
    if (r < 0) return fn;
  }
  return list[list.length - 1][1];
}

/**
 * Tạo các lựa chọn số cho câu trắc nghiệm.
 * - `traps`: các đáp án nhiễu "có chủ ý" (ví dụ quên nhớ) được ưu tiên.
 * - Sau đó dùng các lỗi hay gặp: lệch ±1, ±10, ±2.
 * - Mọi lựa chọn nằm trong [min, max] (mặc định 0..100).
 */
export function numberChoices(answer, traps = [], { count = 4, min = 0, max = MAX } = {}) {
  const set = new Set([answer]);
  const ok = (v) => Number.isInteger(v) && v >= min && v <= max;
  for (const t of traps) {
    if (set.size >= count) break;
    if (ok(t)) set.add(t);
  }
  const common = shuffle([answer + 1, answer - 1, answer + 10, answer - 10]);
  const more = shuffle([answer + 2, answer - 2, answer + 11, answer - 11, answer + 9, answer - 9]);
  for (const c of [...common, ...more]) {
    if (set.size >= count) break;
    if (ok(c)) set.add(c);
  }
  // Dự phòng khi phạm vi quá hẹp
  for (let tries = 0; set.size < count && tries < 200; tries++) {
    const c = randInt(Math.max(min, answer - 15), Math.min(max, answer + 15));
    set.add(c);
  }
  return shuffle([...set]).map(String);
}

/** Lựa chọn dạng chữ: đáp án đúng + các đáp án nhiễu (loại trùng). */
export function textChoices(answer, wrongs, count = 4) {
  const set = new Set([answer]);
  for (const w of wrongs) {
    if (set.size >= count) break;
    if (w && w !== answer) set.add(w);
  }
  return shuffle([...set]);
}

export const COMPARE_CHOICES = ['>', '<', '='];
export const TF_CHOICES = ['Đúng', 'Sai'];

export function compareSign(a, b) {
  return a > b ? '>' : a < b ? '<' : '=';
}

/* ---------------------------------------------------------------
 * Đọc số tiếng Việt (0..100) theo cách viết trong sách giáo khoa.
 * 21 → "hai mươi mốt", 15 → "mười lăm", 25 → "hai mươi lăm",
 * 10 → "mười", 70 → "bảy mươi", 100 → "một trăm".
 * ------------------------------------------------------------- */
const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

export function numberToWords(n) {
  if (n === 100) return 'một trăm';
  if (n < 10) return DIGITS[n];
  const t = Math.floor(n / 10);
  const u = n % 10;
  const tens = t === 1 ? 'mười' : `${DIGITS[t]} mươi`;
  if (u === 0) return tens;
  if (u === 1) return `${tens} ${t === 1 ? 'một' : 'mốt'}`;
  if (u === 5) return `${tens} lăm`;
  return `${tens} ${DIGITS[u]}`;
}

/** Các cách đọc SAI hay gặp, dùng làm đáp án nhiễu. */
export function wrongReadings(n) {
  const t = Math.floor(n / 10);
  const u = n % 10;
  const out = [];
  if (u !== 0 && u !== t) out.push(numberToWords(u * 10 + t)); // đảo chữ số
  if (t >= 2 && u === 1) out.push(`${DIGITS[t]} mươi một`); // "mốt" → "một"
  if (u === 5) out.push(`${t === 1 ? 'mười' : DIGITS[t] + ' mươi'} năm`); // "lăm" → "năm"
  if (t >= 2) out.push(`${DIGITS[t]} mười${u ? ' ' + (u === 5 ? 'lăm' : u === 1 ? 'một' : DIGITS[u]) : ''}`); // "mươi" → "mười"
  if (t >= 2 && u !== 0) out.push(`${DIGITS[t]} ${DIGITS[u]}`); // thiếu "mươi"
  out.push(numberToWords(Math.min(100, n + 1)), numberToWords(Math.max(0, n - 1)));
  if (n + 10 <= 99) out.push(numberToWords(n + 10));
  return shuffle(out.filter((s) => s !== numberToWords(n)));
}

/* --------------------- Ngữ liệu quen thuộc với trẻ --------------------- */

export const NAMES = ['Lan', 'Mai', 'Nam', 'An', 'Bình', 'Hoa', 'Minh', 'Hà', 'Tú', 'Linh', 'Khôi', 'Ngọc', 'Việt', 'Thư'];

export function twoNames() {
  const [a, b] = sample(NAMES, 2);
  return [a, b];
}

/** Đồ vật để đếm (emoji hiển thị rất đẹp trên iPad). */
export const OBJECTS = [
  { noun: 'quả táo', emoji: '🍎' },
  { noun: 'quả cam', emoji: '🍊' },
  { noun: 'bông hoa', emoji: '🌸' },
  { noun: 'ngôi sao', emoji: '⭐' },
  { noun: 'con cá', emoji: '🐟' },
  { noun: 'quả bóng', emoji: '⚽' },
  { noun: 'cái kẹo', emoji: '🍬' },
  { noun: 'quả bóng bay', emoji: '🎈' },
  { noun: 'con gà con', emoji: '🐥' },
  { noun: 'chiếc lá', emoji: '🍀' },
  { noun: 'quả dâu tây', emoji: '🍓' },
  { noun: 'chiếc ô tô', emoji: '🚗' },
];

/** Tạo câu hỏi, loại bỏ trường hợp quên khai báo. */
export function q(obj) {
  if (!obj.type || obj.answer === undefined) throw new Error('Câu hỏi thiếu type/answer');
  return { ...obj, answer: String(obj.answer) };
}
