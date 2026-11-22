/**
 * Lưu trữ cục bộ bằng localStorage.
 *
 * Khoá (tiền tố "tl2:"):
 *   version     số phiên bản cấu trúc dữ liệu (để nâng cấp sau này)
 *   settings    { childName, sound, voice, timer, enabledTopics[], knownTopics[], lastBackupAt }
 *   history     [ { id, startedAt, finishedAt, durationMs, topics[], level, mode, total, correct,
 *                   scorePct, stars, questions[ {text, big, visual, choices, answer, userAnswer, isCorrect, ...} ] } ]
 *                 (mới nhất ở đầu; chỉ giữ chi tiết câu hỏi của 500 bài gần nhất)
 *   inProgress  bài đang làm dở (hoặc null)
 *   badges      [ { id, count, firstAt, lastAt } ]
 *   stats       { totalStars }
 */
import { TOPICS } from './topics.js';

const PREFIX = 'tl2:';
export const DATA_VERSION = 1;
export const MAX_DETAILED = 500;

/* ---------- Lớp an toàn quanh localStorage ---------- */
const memory = new Map();
let available = true;
try {
  const k = PREFIX + '__test';
  localStorage.setItem(k, '1');
  localStorage.removeItem(k);
} catch {
  available = false; // chế độ riêng tư hoặc bị chặn → dùng tạm bộ nhớ
}

export const storageAvailable = () => available;

function read(key, fallback) {
  try {
    const raw = available ? localStorage.getItem(PREFIX + key) : memory.get(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  const raw = JSON.stringify(value);
  if (!available) {
    memory.set(key, raw);
    return true;
  }
  try {
    localStorage.setItem(PREFIX + key, raw);
    return true;
  } catch (e) {
    console.warn('Không ghi được dữ liệu', key, e);
    return false;
  }
}

/* ---------- Nâng cấp cấu trúc ---------- */
function migrate() {
  const v = read('version', 0);
  if (v === DATA_VERSION) return;
  // v0 → v1: chưa có dữ liệu cũ, chỉ cần ghi số phiên bản.
  // Các phiên bản sau thêm bước chuyển đổi tại đây: if (v < 2) { ... }
  write('version', DATA_VERSION);
}
migrate();

/* ---------- Cài đặt ---------- */
const allTopicIds = () => TOPICS.map((t) => t.id);

export function defaultSettings() {
  return {
    childName: '',
    sound: true,
    voice: true,
    timer: false,
    enabledTopics: allTopicIds(),
    knownTopics: allTopicIds(),
    lastBackupAt: null,
  };
}

export function getSettings() {
  const s = { ...defaultSettings(), ...read('settings', {}) };
  // Chủ đề mới được thêm ở phiên bản sau → tự bật
  const known = new Set(s.knownTopics || []);
  const fresh = allTopicIds().filter((id) => !known.has(id));
  if (fresh.length) {
    s.enabledTopics = [...new Set([...s.enabledTopics, ...fresh])];
    s.knownTopics = allTopicIds();
    write('settings', s);
  }
  s.enabledTopics = s.enabledTopics.filter((id) => allTopicIds().includes(id));
  return s;
}

export function saveSettings(patch) {
  const s = { ...getSettings(), ...patch };
  write('settings', s);
  return s;
}

/* ---------- Lịch sử ---------- */
export function getHistory() {
  return read('history', []);
}

export function getHistoryItem(id) {
  return getHistory().find((h) => h.id === id);
}

/** Thêm một bài vào đầu lịch sử, cắt bớt chi tiết bài cũ khi cần. */
export function addHistory(entry) {
  const list = [entry, ...getHistory().filter((h) => h.id !== entry.id)];
  saveHistory(list);
}

function saveHistory(list) {
  list.sort((a, b) => b.finishedAt - a.finishedAt);
  list.forEach((h, i) => {
    if (i >= MAX_DETAILED) delete h.questions;
  });
  // Nếu đầy bộ nhớ: bỏ dần chi tiết của các bài cũ nhất rồi thử lại
  let keep = Math.min(list.length, MAX_DETAILED);
  while (!write('history', list) && keep > 10) {
    keep = Math.floor(keep * 0.8);
    list.forEach((h, i) => {
      if (i >= keep) delete h.questions;
    });
  }
}

export function clearHistory() {
  write('history', []);
  write('badges', []);
  write('stats', { totalStars: 0 });
  write('inProgress', null);
}

/* ---------- Bài đang làm dở ---------- */
export const getInProgress = () => read('inProgress', null);
export const saveInProgress = (state) => write('inProgress', state);
export const clearInProgress = () => write('inProgress', null);

/* ---------- Huy hiệu & sao ---------- */
export const getBadges = () => read('badges', []);

/** Ghi nhận huy hiệu; trả về true nếu là lần đầu đạt. */
export function awardBadge(id) {
  const list = getBadges();
  const now = Date.now();
  const found = list.find((b) => b.id === id);
  if (found) {
    found.count += 1;
    found.lastAt = now;
  } else list.push({ id, count: 1, firstAt: now, lastAt: now });
  write('badges', list);
  return !found;
}

export const getStats = () => ({ totalStars: 0, ...read('stats', {}) });

export function addStars(n) {
  const s = getStats();
  s.totalStars += n;
  write('stats', s);
}

/* ---------- Sao lưu / Khôi phục ---------- */
export function exportData() {
  return {
    app: 'toan-lop-2',
    version: DATA_VERSION,
    exportedAt: new Date().toISOString(),
    settings: getSettings(),
    history: getHistory(),
    badges: getBadges(),
    stats: getStats(),
  };
}

/**
 * Khôi phục từ file sao lưu. Lịch sử được GỘP (không mất bài đang có),
 * huy hiệu lấy số lần lớn hơn, cài đặt lấy theo file.
 * @returns {{added:number,total:number}}
 */
export function importData(data) {
  if (!data || data.app !== 'toan-lop-2' || !Array.isArray(data.history)) {
    throw new Error('File không đúng định dạng sao lưu của ứng dụng.');
  }
  if (data.version > DATA_VERSION) {
    throw new Error('File sao lưu được tạo từ phiên bản mới hơn. Hãy cập nhật ứng dụng trước.');
  }
  const current = getHistory();
  const ids = new Set(current.map((h) => h.id));
  const valid = data.history.filter((h) => h && h.id && typeof h.finishedAt === 'number' && typeof h.scorePct === 'number');
  const fresh = valid.filter((h) => !ids.has(h.id));
  saveHistory([...current, ...fresh]);

  const badges = getBadges();
  for (const b of data.badges || []) {
    const mine = badges.find((x) => x.id === b.id);
    if (!mine) badges.push(b);
    else {
      mine.count = Math.max(mine.count, b.count || 1);
      mine.firstAt = Math.min(mine.firstAt, b.firstAt || mine.firstAt);
    }
  }
  write('badges', badges);

  const stats = getStats();
  stats.totalStars = Math.max(stats.totalStars, data.stats?.totalStars || 0);
  write('stats', stats);

  if (data.settings) {
    const { childName, sound, voice, timer, enabledTopics } = data.settings;
    saveSettings({ childName, sound, voice, timer, enabledTopics });
  }
  return { added: fresh.length, total: current.length + fresh.length };
}

/** Xin trình duyệt giữ dữ liệu lâu dài (giảm nguy cơ iOS tự xoá). */
export function requestPersistence() {
  try {
    navigator.storage?.persist?.();
  } catch { /* không hỗ trợ */ }
}
