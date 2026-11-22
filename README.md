# 🦉 Bé học Toán lớp 2

Web học toán dạng **bài kiểm tra ngắn** cho học sinh lớp 2 (chương trình GDPT 2018, bộ sách *Chân trời sáng tạo*), tối ưu cho **Safari/Chrome trên iPad**.
Không cần đăng nhập, không máy chủ, không quảng cáo, không thu thập dữ liệu, **chạy được khi không có mạng** (PWA).

- Yêu cầu chi tiết: [`requirement.md`](requirement.md)
- Hướng dẫn đưa lên GitHub Pages và cài lên iPad: [`DEPLOY.md`](DEPLOY.md)

## Tính năng

| Nhóm | Nội dung |
|---|---|
| 7 chủ đề × 3 mức độ | Số đến 100 · Tên gọi thành phần phép tính · Cộng, trừ phạm vi 20 · Cộng, trừ phạm vi 100 · Hình học · Thống kê – xác suất · Toán có lời văn · chế độ **Tổng hợp** |
| Dạng câu hỏi | Trắc nghiệm 3–4 lựa chọn, điền số (bàn phím số tự vẽ), so sánh `>` `<` `=`, Đúng/Sai; hình minh hoạ SVG (tia số, đặt tính, đường gấp khúc, biểu đồ tranh, kiểm đếm, hộp bi, hình học) |
| Hình thức | **Luyện tập** (biết đúng/sai ngay, có giải thích) · **Kiểm tra** (lưới câu, sửa câu trước, nộp bài) · 10 hoặc 20 câu |
| Hiệu ứng | Âm "ting"/"boing", sao bay, huy hiệu chuỗi 5 câu đúng, pháo hoa + cúp vàng (≥ 90%), "Hoàn thành tốt" (60–<90%), "Thử thách thất bại" vui nhộn (< 60%) |
| Kết quả & lịch sử | Điểm thang 10 và %, xem lại bài, làm lại đề / câu sai / đề mới · lọc lịch sử, biểu đồ 10 lần gần nhất, chủ đề mạnh/yếu, bộ sưu tập huy hiệu |
| Phụ huynh | Cổng câu hỏi người lớn, tên bé, âm thanh, giọng đọc, đồng hồ, bật/tắt chủ đề, sao lưu/khôi phục JSON, xoá lịch sử (xác nhận 2 lần) |
| Khác | Nghe đọc đề tiếng Việt (Web Speech API), lưu bài dở để làm tiếp, nhắc sao lưu mỗi tháng |

## Chạy thử trên máy

Cần một máy chủ tĩnh bất kỳ (ES modules không chạy được khi mở file trực tiếp):

```bash
npm run serve          # = python3 -m http.server 8080
# mở http://localhost:8080
```

Trên `localhost`, service worker được **tắt** để luôn thấy mã mới. Thêm `?sw` vào địa chỉ (`http://localhost:8080/?sw`) để thử chế độ ngoại tuyến.

## Kiểm thử

```bash
npm test               # Node 18+, không cần cài thêm gói
```

- Sinh ~1.500 câu cho **mỗi** chủ đề × mức độ và tính lại đáp án một cách độc lập (biểu thức, so sánh, đúng/sai, đặt tính, lời giải toán có lời văn, tia số, đường gấp khúc).
- Kiểm tra mọi số trong câu hỏi/đáp án nằm trong 0..100, đáp án có trong lựa chọn, lựa chọn không trùng.
- Kiểm tra `service-worker.js` liệt kê đủ file, chỉ dùng đường dẫn tương đối, không có liên kết ra ngoài.

## Cấu trúc thư mục

```
index.html  manifest.json  service-worker.js  .nojekyll
css/style.css                 giao diện (font Nunito nhúng sẵn)
js/app.js                     khởi động, điều hướng màn hình, đăng ký service worker
js/topics.js                  DANH MỤC CHỦ ĐỀ (thêm chủ đề mới ở đây)
js/quiz-engine.js             tạo đề, chấm điểm
js/generators/*.js            mỗi chủ đề là một module sinh câu hỏi độc lập
js/storage.js                 localStorage, sao lưu/khôi phục
js/sound.js  js/speech.js     âm thanh, giọng đọc
js/effects.js  js/badges.js   hiệu ứng, huy hiệu
js/visuals.js  js/mascot.js   hình minh hoạ SVG, linh vật
js/ui/*.js                    các màn hình
js/lib/confetti.module.js     canvas-confetti 1.9.3 (ISC)
data/questions/*.json         ngân hàng câu hỏi hình học (kèm SVG) và thống kê
assets/fonts  assets/icons    font Nunito (OFL), biểu tượng ứng dụng
tests/                        kiểm thử (Node test runner)
tools/                        script tạo lại ngân hàng hình học và biểu tượng
```

## Thêm chủ đề mới (ví dụ: Phép nhân)

1. Tạo `js/generators/multiplication.js`:
   ```js
   import { randInt, pickForm, q } from './utils.js';
   const LEVELS = { 1: [/* hàm sinh câu */], 2: [...], 3: [...] };
   export default {
     id: 'phep-nhan', order: 8, name: 'Phép nhân', icon: '✖️', color: '#9333ea',
     generate(level) { return pickForm(LEVELS[level])(); },
   };
   ```
   Mỗi hàm sinh trả về một câu hỏi theo quy ước ở đầu `js/generators/utils.js`.
2. Thêm 1 dòng `import` và tên module vào mảng `TOPICS` trong `js/topics.js`.
3. Thêm đường dẫn file vào `PRECACHE` và **tăng `CACHE_VERSION`** trong `service-worker.js`.
4. Chạy `npm test` (test tự động kiểm tra chủ đề mới).

Chủ đề mới sẽ tự động được bật cho bé ở máy đã cài bản cũ (xem `knownTopics` trong `js/storage.js`). Khi tạo chủ đề vượt phạm vi 100 (ví dụ số đến 1000), cập nhật giới hạn `MAX` trong `utils.js` và bài test phạm vi số.

## Cập nhật phiên bản

1. Sửa mã → `npm test`.
2. Tăng `CACHE_VERSION` trong `service-worker.js` (và `APP_VERSION` trong `js/ui/settings.js`).
3. Đưa lên GitHub (xem `DEPLOY.md`). Trên iPad: đóng hẳn ứng dụng rồi mở lại.

## Ghi chú kỹ thuật

- **Âm thanh** được tổng hợp bằng Web Audio API (không cần file, không vướng bản quyền, 0 KB). Muốn dùng file `.mp3` (ví dụ từ Pixabay/Mixkit): chép vào `assets/sounds/` và khai báo trong `SOUND_FILES` ở `js/sound.js` (hướng dẫn trong file).
- **Đồ vật để đếm và biểu đồ tranh** dùng emoji (hiển thị rất đẹp trên iPad); hình học, tia số, đặt tính, kiểm đếm, hộp bi, biểu đồ cột dùng SVG.
- Lịch sử chỉ lưu **mô tả** hình (không lưu cả hình) nên rất nhẹ; giữ chi tiết 500 bài gần nhất.
- Dữ liệu Safari, Chrome và biểu tượng trên Màn hình chính **lưu riêng** – hãy để bé luôn mở từ một biểu tượng.
- Không đưa tên thật/ảnh của bé vào mã nguồn (kho GitHub Pages miễn phí là công khai). Tên bé chỉ nhập trong Cài đặt và lưu trên iPad.

## Giấy phép

Mã nguồn: chưa kèm file LICENSE (chủ sản phẩm tự chọn trước khi công khai). Font Nunito: SIL Open Font License (`assets/fonts/OFL.txt`). canvas-confetti: ISC (`js/lib/confetti.LICENSE.txt`).
