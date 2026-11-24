/**
 * Cổng phụ huynh + Cài đặt.
 * Cổng: một phép nhân dành cho người lớn (bé lớp 2 chưa học bảng nhân 6–9).
 */
import { getSettings, saveSettings, exportData, importData, clearHistory, getHistory, storageAvailable } from '../storage.js';
import { TOPICS } from '../topics.js';
import { createKeypad } from './keypad.js';
import { topBar, confirmDialog, alertDialog, promptDialog, esc, fmtDate } from './dom.js';
import { getBonusSummary, payout, formatVnd } from '../bonus.js';
import { bonusTableHtml, payoutListHtml } from './piggy.js';
import { shake } from '../effects.js';
import { play } from '../sound.js';
import { speechSupported, hasVietnameseVoice } from '../speech.js';

export const APP_VERSION = '1.1.0';

/* ---------------- Cổng phụ huynh ---------------- */
export function renderGate(root, { go }) {
  const a = 6 + Math.floor(Math.random() * 4);
  const b = 6 + Math.floor(Math.random() * 4);
  root.innerHTML = `
  <div class="screen gate">
    ${topBar({ back: 'home', title: 'Dành cho bố mẹ' })}
    <main class="gate-main">
      <div class="gate-q">
        <div class="gate-ico">👨‍👩‍👧</div>
        <p>Để vào Cài đặt, bố mẹ hãy trả lời:</p>
        <div class="q-big">${a} × ${b} = <span class="slot">?</span></div>
      </div>
      <div class="answer-area type-input gate-pad"></div>
    </main>
  </div>`;
  const kp = createKeypad(root.querySelector('.gate-pad'), {
    onSubmit: (v) => {
      kp.destroy();
      if (+v === a * b) go('settings');
      else {
        shake(root.querySelector('.kp-display'));
        play('wrong');
        setTimeout(() => go('gate'), 600);
      }
    },
  });
  root.querySelector('.gate').addEventListener('click', (e) => {
    if (e.target.closest('[data-act="home"]')) go('home');
  });
  return () => kp.destroy();
}

/* ---------------- Cài đặt ---------------- */
export function renderSettings(root, { go }) {
  function paint() {
    const s = getSettings();
    const count = getHistory().length;
    const toggle = (key, label, hint = '') => `
      <label class="row toggle-row"><span><b>${label}</b>${hint ? `<small>${hint}</small>` : ''}</span>
        <input type="checkbox" class="switch" data-key="${key}" ${s[key] ? 'checked' : ''}></label>`;
    const bonus = getBonusSummary();
    const daysSinceBackup = s.lastBackupAt ? Math.floor((Date.now() - s.lastBackupAt) / 86400000) : null;

    root.innerHTML = `
    <div class="screen settings">
      ${topBar({ back: 'home', title: 'Cài đặt (phụ huynh)' })}
      <main class="settings-main">
        ${storageAvailable() ? '' : '<p class="warn">⚠️ Trình duyệt đang chặn lưu dữ liệu (chế độ riêng tư?). Lịch sử sẽ mất khi đóng trang.</p>'}
        <section class="panel">
          <h2>👧 Tên bé</h2>
          <div class="row"><input type="text" class="text-input" id="child-name" maxlength="20" placeholder="Ví dụ: Bông" value="${esc(s.childName)}" autocomplete="off">
          <button class="btn btn-green" data-act="save-name">Lưu</button></div>
          <p class="hint">Chỉ lưu trên máy này, không gửi đi đâu.</p>
        </section>

        <section class="panel">
          <h2>🔧 Tuỳ chọn</h2>
          ${toggle('sound', 'Âm thanh hiệu ứng')}
          ${toggle('voice', 'Nút nghe đọc đề', speechSupported() ? (hasVietnameseVoice() ? 'Đã có giọng tiếng Việt' : 'Chưa thấy giọng tiếng Việt – xem hướng dẫn trong DEPLOY.md') : 'Trình duyệt không hỗ trợ')}
          ${toggle('timer', 'Hiện đồng hồ bấm giờ', 'Luôn ghi nhận thời gian; chỉ ẩn/hiện khi làm bài')}
        </section>

        <section class="panel bonus-panel">
          <h2>🐷 Tiền thưởng</h2>
          ${toggle('bonusEnabled', 'Bật tiền thưởng', 'Bài Kiểm tra đề mới đạt từ 9 điểm được cộng tiền vào ống heo. Tắt thì không cộng thêm và ẩn với bé; số dư vẫn được giữ.')}
          <div class="bonus-stats">
            <div class="tile tile-bonus"><b>${formatVnd(bonus.balance)}</b><span>trong ống heo</span></div>
            <div class="tile"><b>${formatVnd(bonus.lifetimePaid)}</b><span>tổng đã trao</span></div>
          </div>
          <div class="row wrap"><button class="btn btn-orange" data-act="payout" ${bonus.balance > 0 ? '' : 'disabled'}>🎁 Đã trao thưởng – đặt lại ống heo</button></div>
          <p class="hint">Ứng dụng không xử lý tiền thật. Sau khi trao thưởng cho bé, bấm nút trên để đưa ống heo về 0.</p>
          <h3>Mức thưởng (đạt từ 9 điểm)</h3>
          ${bonusTableHtml()}
          <h3>Các lần đã trao thưởng</h3>
          ${payoutListHtml(bonus.payouts)}
        </section>

        <section class="panel">
          <h2>📚 Chủ đề hiển thị cho bé</h2>
          <p class="hint">Tắt các chủ đề bé chưa học tới trên lớp.</p>
          ${TOPICS.map((t) => `
            <label class="row toggle-row"><span><b>${t.icon} ${esc(t.name)}</b></span>
              <input type="checkbox" class="switch" data-topic="${t.id}" ${s.enabledTopics.includes(t.id) ? 'checked' : ''}></label>`).join('')}
        </section>

        <section class="panel">
          <h2>💾 Sao lưu & khôi phục</h2>
          <p class="hint">Có ${count} bài trong lịch sử. ${s.lastBackupAt ? `Lần sao lưu gần nhất: ${fmtDate(s.lastBackupAt)}${daysSinceBackup >= 30 ? ' – <b>đã quá 1 tháng, nên sao lưu ngay</b>' : ''}.` : '<b>Chưa sao lưu lần nào.</b>'}
          Nên sao lưu mỗi tháng vì trình duyệt có thể tự xoá dữ liệu.</p>
          <div class="row wrap">
            <button class="btn btn-blue" data-act="backup">⬇️ Sao lưu (tải file)</button>
            ${navigator.canShare ? '<button class="btn btn-teal" data-act="share">📤 Lưu vào Tệp / Chia sẻ</button>' : ''}
            <button class="btn btn-purple" data-act="restore">⬆️ Khôi phục từ file</button>
            <input type="file" id="restore-file" accept="application/json,.json" hidden>
          </div>
          <p class="hint">Lưu ý: Safari, Chrome và biểu tượng trên Màn hình chính lưu lịch sử riêng. Hãy để bé luôn mở từ một biểu tượng duy nhất.</p>
        </section>

        <section class="panel danger">
          <h2>🗑️ Xoá dữ liệu</h2>
          <button class="btn btn-red" data-act="clear">Xoá toàn bộ lịch sử</button>
        </section>

        <p class="version">Bé học Toán lớp 2 · phiên bản ${APP_VERSION} · Không quảng cáo, không thu thập dữ liệu.</p>
      </main>
    </div>`;
  }

  function backupFile() {
    const data = exportData();
    const d = new Date();
    const name = `toan-lop-2-sao-luu-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}.json`;
    return new File([JSON.stringify(data)], name, { type: 'application/json' });
  }

  function markBackedUp() {
    saveSettings({ lastBackupAt: Date.now() });
    paint();
  }

  async function onClick(e) {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act;
    if (act === 'home') return go('home');
    if (act === 'save-name') {
      const v = root.querySelector('#child-name').value.trim().slice(0, 20);
      saveSettings({ childName: v });
      await alertDialog('Đã lưu tên bé', v ? `Xin chào ${v}!` : '', '✅');
      return paint();
    }
    if (act === 'backup') {
      const file = backupFile();
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      markBackedUp();
      return alertDialog('Đã tạo file sao lưu', `File “${file.name}” đã được tải về (iPad: ứng dụng Tệp → Tải về). Nên chuyển vào iCloud Drive.`, '💾');
    }
    if (act === 'share') {
      const file = backupFile();
      try {
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Sao lưu Bé học Toán' });
          markBackedUp();
        } else await alertDialog('Thiết bị không hỗ trợ chia sẻ file', 'Hãy dùng nút “Sao lưu (tải file)”.');
      } catch (err) {
        if (err?.name !== 'AbortError') alertDialog('Không chia sẻ được', String(err?.message || err));
      }
      return;
    }
    if (act === 'restore') return root.querySelector('#restore-file').click();
    if (act === 'payout') {
      const { balance } = getBonusSummary();
      if (balance <= 0) return;
      const ok1 = await confirmDialog({
        title: `Bố mẹ đã trao cho bé ${formatVnd(balance)}?`,
        text: 'Ống heo sẽ được đặt lại về 0.',
        ok: 'Đã trao thưởng',
        cancel: 'Huỷ',
        icon: '🎁',
      });
      if (!ok1) return;
      const note = await promptDialog({ title: 'Ghi chú (không bắt buộc)', placeholder: 'Ví dụ: Mua bộ Lego', maxLength: 50, icon: '📝' });
      if (note === null) return;
      const tx = payout(note);
      paint();
      if (tx) await alertDialog('Đã đặt lại ống heo', `Đã ghi nhận trao thưởng ${formatVnd(tx.amount)}.`, '✅');
      return;
    }
    if (act === 'clear') {
      const ok1 = await confirmDialog({ title: 'Xoá toàn bộ lịch sử?', text: 'Mọi bài làm, sao và huy hiệu sẽ bị xoá. Tiền thưởng trong ống heo được giữ nguyên.', ok: 'Xoá', cancel: 'Không', danger: true, icon: '⚠️' });
      if (!ok1) return;
      const ok2 = await confirmDialog({ title: 'Bố mẹ chắc chắn chứ?', text: 'Không thể hoàn tác. Nên sao lưu trước khi xoá.', ok: 'Chắc chắn xoá', cancel: 'Huỷ', danger: true, icon: '🗑️' });
      if (!ok2) return;
      clearHistory();
      await alertDialog('Đã xoá toàn bộ lịch sử', '', '✅');
      paint();
    }
  }

  function onChange(e) {
    const el = e.target;
    if (el.dataset.key) {
      saveSettings({ [el.dataset.key]: el.checked });
      paint();
    } else if (el.dataset.topic) {
      const s = getSettings();
      const set = new Set(s.enabledTopics);
      el.checked ? set.add(el.dataset.topic) : set.delete(el.dataset.topic);
      saveSettings({ enabledTopics: TOPICS.map((t) => t.id).filter((id) => set.has(id)) });
    } else if (el.id === 'restore-file' && el.files[0]) {
      const f = el.files[0];
      f.text()
        .then((txt) => {
          const r = importData(JSON.parse(txt));
          paint();
          return alertDialog('Khôi phục thành công', `Đã thêm ${r.added} bài. Lịch sử hiện có ${r.total} bài. Đã thêm ${r.bonusAdded} lần thưởng.`, '✅');
        })
        .catch((err) => alertDialog('Không khôi phục được', err instanceof SyntaxError ? 'File bị hỏng hoặc không phải file JSON.' : err.message, '⚠️'));
    }
  }

  root.onclick = onClick;
  root.onchange = onChange;
  paint();
  return () => {
    root.onclick = null;
    root.onchange = null;
  };
}
