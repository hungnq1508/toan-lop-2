/**
 * Vẽ hình minh hoạ từ mô tả (visual spec) của câu hỏi → chuỗi HTML/SVG.
 * Câu hỏi chỉ lưu mô tả nhỏ gọn (không lưu cả hình) nên lịch sử rất nhẹ.
 *
 * Các loại (kind):
 *   objects    { emoji, count }                    đồ vật để đếm (xếp theo nhóm 10)
 *   numberline { start, step, count, hide[] }      tia số
 *   column     { a, b, op }                        đặt tính theo cột
 *   polyline   { lengths[], hide?[], unit }        đường gấp khúc
 *   pictograph { title, rows[{label,emoji,count}] } biểu đồ tranh
 *   tally      { title, rows[{label,emoji,count}] } bảng kiểm đếm
 *   marbles    { counts{red,blue,yellow} }         hộp bi
 *   bank       { bank:'geometry', id }             hình SVG trong ngân hàng câu hỏi
 */
import { bankSvg } from './generators/geometry.js';

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function renderVisual(v) {
  if (!v) return '';
  const fn = RENDERERS[v.kind];
  return fn ? `<div class="visual visual-${v.kind}">${fn(v)}</div>` : '';
}

const RENDERERS = {
  objects({ emoji, count }) {
    const groups = [];
    for (let i = 0; i < count; i += 10) groups.push(Math.min(10, count - i));
    return `<div class="obj-groups" role="img" aria-label="${count} đồ vật">${groups
      .map((n) => `<div class="obj-group">${Array.from({ length: n }, () => `<span class="obj">${emoji}</span>`).join('')}</div>`)
      .join('')}</div>`;
  },

  numberline({ start, step, count, hide = [] }) {
    const W = 640, x0 = 40, x1 = 600, y = 50;
    const gap = (x1 - x0) / (count - 1);
    let s = `<svg viewBox="0 0 ${W} 120" class="nl" role="img" aria-label="Tia số">`;
    s += `<line x1="20" y1="${y}" x2="${W - 10}" y2="${y}" class="nl-axis"/><polygon points="${W - 10},${y} ${W - 24},${y - 8} ${W - 24},${y + 8}" class="nl-arrow"/>`;
    for (let i = 0; i < count; i++) {
      const x = x0 + i * gap;
      s += `<line x1="${x}" y1="${y - 12}" x2="${x}" y2="${y + 12}" class="nl-tick"/>`;
      if (hide.includes(i)) s += `<rect x="${x - 28}" y="${y + 20}" width="56" height="44" rx="10" class="nl-box"/><text x="${x}" y="${y + 52}" class="nl-q">?</text>`;
      else s += `<text x="${x}" y="${y + 52}" class="nl-num">${start + i * step}</text>`;
    }
    return s + '</svg>';
  },

  column({ a, b, op }) {
    const width = Math.max(String(a).length, String(b).length, 2);
    const cells = (n) => String(n).padStart(width, ' ').split('').map((d) => `<td>${d === ' ' ? '' : d}</td>`).join('');
    const ansCells = Array.from({ length: width }, () => '<td><span class="slot">?</span></td>').join('');
    return `<table class="col-calc" role="img" aria-label="${a} ${op} ${b}">
      <tr><td class="op"></td>${cells(a)}</tr>
      <tr><td class="op">${op}</td>${cells(b)}</tr>
      <tr class="bar"><td></td>${'<td></td>'.repeat(width)}</tr>
      <tr><td></td>${ansCells}</tr></table>`;
  },

  polyline({ lengths, hide = [], unit }) {
    const n = lengths.length;
    const letters = ['A', 'B', 'C', 'D', 'E', 'G'];
    const W = 600, H = 220;
    const pts = Array.from({ length: n + 1 }, (_, i) => [40 + (i * (W - 80)) / n, i % 2 === 0 ? 170 : 60]);
    let s = `<svg viewBox="0 0 ${W} ${H}" class="poly" role="img" aria-label="Đường gấp khúc">`;
    s += `<polyline points="${pts.map((p) => p.join(',')).join(' ')}" class="g-line"/>`;
    pts.forEach(([x, y], i) => {
      s += `<circle cx="${x}" cy="${y}" r="7" class="g-pt"/><text x="${x}" y="${i % 2 === 0 ? y + 38 : y - 18}" class="g-lbl" text-anchor="middle">${letters[i]}</text>`;
    });
    if (unit) {
      for (let i = 0; i < n; i++) {
        const [xa, ya] = pts[i], [xb, yb] = pts[i + 1];
        const mx = (xa + xb) / 2, my = (ya + yb) / 2;
        const label = hide.includes(i) ? `? ${unit}` : `${lengths[i]} ${unit}`;
        s += `<text x="${mx + (i % 2 === 0 ? -34 : 34)}" y="${my + 8}" class="poly-len${hide.includes(i) ? ' hidden-len' : ''}" text-anchor="middle">${label}</text>`;
      }
    }
    return s + '</svg>';
  },

  pictograph({ title, rows }) {
    return `<div class="picto"><div class="picto-title">${esc(title)}</div><table>${rows
      .map((r) => `<tr><th>${esc(r.label)}</th><td>${Array.from({ length: r.count }, () => `<span class="picto-ico">${r.emoji}</span>`).join('')}</td></tr>`)
      .join('')}</table></div>`;
  },

  tally({ title, rows }) {
    return `<div class="picto tally"><div class="picto-title">${esc(title)}</div><table>${rows
      .map((r) => `<tr><th><span class="picto-ico">${r.emoji}</span> ${esc(r.label)}</th><td>${tallyMarks(r.count)}</td></tr>`)
      .join('')}</table></div>`;
  },

  marbles({ counts }) {
    const colors = { red: '#ef4444', blue: '#3b82f6', yellow: '#facc15' };
    const balls = Object.entries(counts).flatMap(([c, n]) => Array(n).fill(colors[c]));
    // Trộn vị trí (cố định theo số lượng để vẽ lại giống nhau)
    const order = balls.map((c, i) => [((i * 7919) % 97) / 97, c]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
    const perRow = 6;
    let s = `<svg viewBox="0 0 320 170" class="marbles" role="img" aria-label="Hộp bi">`;
    s += `<path d="M20 30 L20 160 L300 160 L300 30" class="box"/>`;
    order.forEach((c, i) => {
      const row = Math.floor(i / perRow), col = i % perRow;
      const x = 55 + col * 42 + (row % 2) * 18, y = 138 - row * 38;
      s += `<circle cx="${x}" cy="${y}" r="17" fill="${c}" stroke="#334155" stroke-width="2"/><circle cx="${x - 6}" cy="${y - 6}" r="5" fill="#fff" opacity=".7"/>`;
    });
    return s + '</svg>';
  },

  bank({ id }) {
    return bankSvg(id);
  },
};

/** Vạch kiểm đếm: mỗi nhóm 5 = 4 vạch đứng + 1 vạch chéo. */
function tallyMarks(n) {
  const groups = [];
  for (let i = 0; i < n; i += 5) groups.push(Math.min(5, n - i));
  return groups
    .map((g) => {
      let s = `<svg viewBox="0 0 54 44" class="tally-g">`;
      for (let k = 0; k < Math.min(g, 4); k++) s += `<line x1="${8 + k * 11}" y1="4" x2="${8 + k * 11}" y2="40"/>`;
      if (g === 5) s += `<line x1="2" y1="34" x2="50" y2="10"/>`;
      return s + '</svg>';
    })
    .join('');
}

/** Hiển thị biểu thức chữ to: "?" → ô cần điền, "□" → ô điền dấu. */
export function renderBig(big, filled = null) {
  if (!big) return '';
  const html = esc(big)
    .replace(/\?/g, `<span class="slot">${filled != null ? esc(filled) : '?'}</span>`)
    .replace(/□/g, `<span class="slot sign">${filled != null ? esc(filled) : ''}</span>`);
  return `<div class="q-big">${html}</div>`;
}
