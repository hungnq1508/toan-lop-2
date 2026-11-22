/**
 * Kiểm tra service-worker.js liệt kê đủ (và không thừa) các file cần cho chạy ngoại tuyến,
 * và mã nguồn chỉ dùng đường dẫn tương đối (GitHub Pages chạy ở thư mục con /toan-lop-2/).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const sw = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');
const listed = [...sw.matchAll(/'\.\/([^']*)'/g)].map((m) => m[1]).filter((p) => p && p !== 'service-worker.js');

function walk(dir) {
  return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((e) => {
    const rel = path.posix.join(dir, e.name);
    return e.isDirectory() ? walk(rel) : [rel];
  });
}

const runtimeFiles = ['index.html', 'manifest.json', ...['css', 'js', 'data', 'assets'].flatMap(walk)]
  .filter((f) => !/\.(txt|md)$|\.DS_Store$/.test(f));

test('PRECACHE có đủ mọi file chạy ứng dụng', () => {
  const missing = runtimeFiles.filter((f) => !listed.includes(f));
  assert.deepEqual(missing, [], `Thiếu trong PRECACHE: ${missing.join(', ')}`);
});

test('PRECACHE không chứa file không tồn tại', () => {
  const ghost = listed.filter((f) => f && !fs.existsSync(path.join(root, f)));
  assert.deepEqual(ghost, [], `File không tồn tại: ${ghost.join(', ')}`);
});

test('Chỉ dùng đường dẫn tương đối', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'css/style.css'), 'utf8');
  const manifest = fs.readFileSync(path.join(root, 'manifest.json'), 'utf8');
  for (const [name, src] of [['index.html', html], ['style.css', css], ['manifest.json', manifest]]) {
    const abs = [...src.matchAll(/(?:href|src|url)\s*[=(:]\s*["']?(\/[^/"')][^"')]*)/g)].map((m) => m[1]);
    assert.deepEqual(abs, [], `${name} có đường dẫn tuyệt đối: ${abs}`);
  }
});

test('Không có liên kết/tài nguyên bên ngoài trong mã chạy', () => {
  for (const f of runtimeFiles.filter((f) => /\.(js|css|html|json)$/.test(f) && !f.includes('/lib/'))) {
    const src = fs.readFileSync(path.join(root, f), 'utf8');
    assert.ok(!/https?:\/\/(?!www\.w3\.org)/.test(src), `${f} chứa liên kết ngoài`);
  }
});

test('Có CACHE_VERSION và file .nojekyll', () => {
  assert.match(sw, /const CACHE_VERSION = '[^']+'/);
  assert.ok(fs.existsSync(path.join(root, '.nojekyll')));
});
