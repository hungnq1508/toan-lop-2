/**
 * Bàn phím số tự vẽ (0–9, Xoá, OK) – không bật bàn phím iPad.
 * Trên máy tính vẫn gõ được bằng bàn phím thật (số, Backspace, Enter).
 */
import { play } from '../sound.js';
import { esc } from './dom.js';

/**
 * @param {HTMLElement} host
 * @param {{maxLen?:number, unit?:string, initial?:string, onSubmit:(v:string)=>void}} opts
 * @returns {{ value:()=>string, setState:(cls:string)=>void, lock:()=>void, destroy:()=>void }}
 */
export function createKeypad(host, { maxLen = 3, unit = '', initial = '', onSubmit }) {
  let value = initial || '';
  let locked = false;
  host.innerHTML = `
    <div class="keypad">
      <div class="kp-display" aria-live="polite"><span class="kp-value"></span>${unit ? `<span class="kp-unit">${esc(unit)}</span>` : ''}</div>
      <div class="kp-keys">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button class="kp-key" data-k="${n}">${n}</button>`).join('')}
        <button class="kp-key kp-del" data-k="del" aria-label="Xoá">⌫</button>
        <button class="kp-key" data-k="0">0</button>
        <button class="kp-key kp-ok" data-k="ok" aria-label="Xong">OK</button>
      </div>
    </div>`;
  const display = host.querySelector('.kp-display');
  const valEl = host.querySelector('.kp-value');
  const okBtn = host.querySelector('.kp-ok');

  function paint() {
    valEl.textContent = value || '?';
    display.classList.toggle('is-blank', !value);
    okBtn.disabled = !value;
  }

  function press(k) {
    if (locked) return;
    if (k === 'del') value = value.slice(0, -1);
    else if (k === 'ok') {
      if (value) onSubmit(value);
      return;
    } else if (value.length < maxLen) value = value === '0' ? k : value + k;
    play('tap');
    paint();
  }

  const onClick = (e) => {
    const b = e.target.closest('[data-k]');
    if (b) press(b.dataset.k);
  };
  const onKey = (e) => {
    if (/^[0-9]$/.test(e.key)) press(e.key);
    else if (e.key === 'Backspace') press('del');
    else if (e.key === 'Enter') press('ok');
  };
  host.addEventListener('click', onClick);
  window.addEventListener('keydown', onKey);
  paint();

  return {
    value: () => value,
    setState(cls) {
      display.classList.remove('correct', 'wrong');
      if (cls) display.classList.add(cls);
    },
    showAnswer(ans) {
      display.insertAdjacentHTML('afterend', `<div class="kp-answer">✓ ${esc(ans)}${unit ? ' ' + esc(unit) : ''}</div>`);
    },
    lock() {
      locked = true;
      host.querySelectorAll('button').forEach((b) => (b.disabled = true));
    },
    destroy() {
      window.removeEventListener('keydown', onKey);
    },
  };
}
