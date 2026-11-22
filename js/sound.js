/**
 * Âm thanh hiệu ứng.
 *
 * Mặc định các âm được TỔNG HỢP bằng Web Audio API (không cần file, không lo bản quyền,
 * dung lượng 0 KB, chạy ngoại tuyến). Muốn dùng file .mp3 riêng (ví dụ tải từ Pixabay/Mixkit):
 *   1. Chép file vào assets/sounds/ (ví dụ assets/sounds/correct.mp3)
 *   2. Khai báo trong SOUND_FILES bên dưới: correct: './assets/sounds/correct.mp3'
 *   3. Thêm đường dẫn file vào PRECACHE trong service-worker.js
 *
 * iOS chỉ cho phát âm thanh sau lần chạm đầu tiên → gọi unlock() trong sự kiện chạm.
 */
import { getSettings } from './storage.js';

/** Tên âm → đường dẫn file (để trống = dùng âm tổng hợp). */
const SOUND_FILES = {
  // correct: './assets/sounds/correct.mp3',
};

const MASTER_VOLUME = 0.32; // âm lượng vừa phải

let ctx = null;
let master = null;
const buffers = {};

function ensureContext() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = MASTER_VOLUME;
  master.connect(ctx.destination);
  return ctx;
}

/** Mở khoá âm thanh (phải gọi trong sự kiện chạm/bấm của người dùng). */
export function unlock() {
  const c = ensureContext();
  if (!c) return;
  if (c.state === 'suspended') c.resume();
  // Phát 1 mẫu im lặng – mẹo mở khoá cho WebKit/iOS
  const b = c.createBuffer(1, 1, 22050);
  const s = c.createBufferSource();
  s.buffer = b;
  s.connect(c.destination);
  s.start(0);
  preloadFiles();
}

let preloaded = false;
function preloadFiles() {
  if (preloaded) return;
  preloaded = true;
  for (const [name, url] of Object.entries(SOUND_FILES)) {
    fetch(url)
      .then((r) => r.arrayBuffer())
      .then((ab) => new Promise((ok, fail) => ctx.decodeAudioData(ab, ok, fail)))
      .then((buf) => (buffers[name] = buf))
      .catch(() => {});
  }
}

/* ---------- Bộ tạo âm cơ bản ---------- */
function tone(freq, start, dur, { type = 'sine', vol = 0.6, slideTo = null, attack = 0.01, vibrato = 0 } = {}) {
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  if (vibrato) {
    const lfo = ctx.createOscillator();
    const lg = ctx.createGain();
    lfo.frequency.value = 6;
    lg.gain.value = vibrato;
    lfo.connect(lg).connect(osc.frequency);
    lfo.start(t0);
    lfo.stop(t0 + dur + 0.05);
  }
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/** Tiếng vỗ tay ngắn bằng nhiễu trắng. */
function claps(start, n = 6) {
  const len = Math.floor(ctx.sampleRate * 0.05);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  for (let k = 0; k < n; k++) {
    const src = ctx.createBufferSource();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    src.buffer = buf;
    f.type = 'bandpass';
    f.frequency.value = 1200 + Math.random() * 800;
    g.gain.value = 0.5;
    src.connect(f).connect(g).connect(master);
    src.start(ctx.currentTime + start + k * 0.09 + Math.random() * 0.03);
  }
}

const NOTE = { C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, B5: 987.77, C6: 1046.5, E6: 1318.5, G6: 1568, A6: 1760, C4: 261.63, E4: 329.63, G4: 392, A4: 440 };

const SYNTH = {
  /** Đúng: "ting ting" + vài tiếng vỗ tay */
  correct() {
    tone(NOTE.E6, 0, 0.25, { vol: 0.5 });
    tone(NOTE.A6, 0.09, 0.4, { vol: 0.45 });
    claps(0.15, 4);
  },
  /** Sai: "boing" nhẹ, trầm, không chói */
  wrong() {
    tone(330, 0, 0.45, { type: 'sine', vol: 0.45, slideTo: 160, vibrato: 12 });
  },
  /** Chạm nút */
  tap() {
    tone(880, 0, 0.06, { vol: 0.15 });
  },
  /** Chuỗi 5 câu đúng / nhận huy hiệu */
  streak() {
    [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6, NOTE.E6].forEach((f, i) => tone(f, i * 0.08, 0.3, { type: 'triangle', vol: 0.4 }));
    tone(NOTE.G6, 0.42, 0.5, { vol: 0.3 });
  },
  /** Chiến thắng ≥ 90%: kèn chiến thắng */
  win() {
    const seq = [[NOTE.G4, 0, 0.15], [NOTE.C5, 0.15, 0.15], [NOTE.E5, 0.3, 0.15], [NOTE.G5, 0.45, 0.3], [NOTE.E5, 0.78, 0.15], [NOTE.G5, 0.93, 0.7]];
    seq.forEach(([f, s, d]) => {
      tone(f, s, d + 0.1, { type: 'square', vol: 0.18 });
      tone(f * 2, s, d + 0.1, { type: 'triangle', vol: 0.22 });
    });
    [NOTE.C5, NOTE.E5, NOTE.G5].forEach((f) => tone(f, 1.65, 1.0, { type: 'triangle', vol: 0.2 }));
    claps(1.0, 10);
  },
  /** Hoàn thành tốt: giai điệu nhẹ */
  good() {
    [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.E5, NOTE.C6].forEach((f, i) => tone(f, i * 0.16, 0.35, { type: 'triangle', vol: 0.3 }));
  },
  /** Thử thách thất bại: "ôi không" kiểu kèn trombone vui nhộn */
  fail() {
    const seq = [[392, 0, 0.35], [370, 0.4, 0.35], [349, 0.8, 0.35], [330, 1.2, 0.9]];
    seq.forEach(([f, s, d], i) => tone(f, s, d, { type: 'sawtooth', vol: 0.12, slideTo: i === 3 ? 290 : null, vibrato: i === 3 ? 8 : 3, attack: 0.04 }));
    seq.forEach(([f, s, d]) => tone(f / 2, s, d, { type: 'sine', vol: 0.25, attack: 0.04 }));
  },
  /** Ngôi sao bay */
  star() {
    tone(NOTE.C6, 0, 0.12, { vol: 0.2 });
    tone(NOTE.G6, 0.06, 0.2, { vol: 0.2 });
  },
};

/** Phát âm theo tên: correct | wrong | tap | streak | win | good | fail | star */
export function play(name) {
  if (!getSettings().sound) return;
  if (!ensureContext()) return;
  if (ctx.state === 'suspended') ctx.resume();
  try {
    if (buffers[name]) {
      const src = ctx.createBufferSource();
      src.buffer = buffers[name];
      src.connect(master);
      src.start();
    } else SYNTH[name]?.();
  } catch (e) {
    console.warn('Không phát được âm thanh', e);
  }
}
