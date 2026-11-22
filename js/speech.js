/**
 * Đọc đề bằng giọng tiếng Việt của trình duyệt (Web Speech API).
 * Nếu thiết bị chưa có giọng vi-VN, trình duyệt sẽ dùng giọng mặc định.
 * (iPad: Cài đặt → Trợ năng → Nội dung được đọc → Giọng nói → Tiếng Việt)
 */
import { getSettings } from './storage.js';

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let viVoice = null;

function pickVoice() {
  if (!synth) return;
  const voices = synth.getVoices();
  viVoice = voices.find((v) => v.lang === 'vi-VN') || voices.find((v) => v.lang?.toLowerCase().startsWith('vi')) || null;
}
if (synth) {
  pickVoice();
  synth.addEventListener?.('voiceschanged', pickVoice);
}

export const speechSupported = () => !!synth;
export const hasVietnameseVoice = () => !!viVoice;

/**
 * Chuyển ký hiệu toán sang lời đọc.
 * @param {boolean} math  true với biểu thức chữ to (dấu "?" là ô cần điền → đọc "mấy")
 */
export function toSpeech(text, math = false) {
  let s = text
    .replace(/(\d+)\s*cm\b/g, '$1 xăng-ti-mét')
    .replace(/\+/g, ' cộng ')
    .replace(/−/g, ' trừ ')
    .replace(/=/g, ' bằng ')
    .replace(/□/g, ' ... ')
    .replace(/>/g, ' lớn hơn ')
    .replace(/</g, ' bé hơn ')
    .replace(/[“”"]/g, '');
  if (math) s = s.replace(/\?/g, ' mấy ');
  return s.replace(/\s+/g, ' ').trim();
}

/** Câu đọc cho một câu hỏi. */
export function questionSpeech(q) {
  if (q.speak) return toSpeech(q.speak);
  return `${toSpeech(q.text)} ${q.big ? toSpeech(q.big, true) : ''}`.trim();
}

export function speak(text) {
  if (!synth || !getSettings().voice) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'vi-VN';
  if (viVoice) u.voice = viVoice;
  u.rate = 0.88; // chậm một chút cho bé dễ nghe
  u.pitch = 1.05;
  synth.speak(u);
}

export function stopSpeaking() {
  synth?.cancel();
}
