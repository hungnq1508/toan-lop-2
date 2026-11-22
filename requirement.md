# YÊU CẦU PHẦN MỀM: "BÉ HỌC TOÁN LỚP 2"

> Phiên bản: 1.1 · Ngày: 22/11/2026 · Người đặt hàng: Phụ huynh (chủ sản phẩm)

## 1. Tổng quan
- **Mục tiêu:** Web học toán bằng hình thức làm bài kiểm tra ngắn, giúp bé lớp 2 (7 tuổi) tự ôn luyện tại nhà.
- **Người dùng chính:** 1 học sinh lớp 2 dùng **Safari hoặc Chrome trên iPad**. Người dùng phụ: phụ huynh xem lịch sử, chỉnh cài đặt.
- **Nguyên tắc:** Đơn giản, vui, khuyến khích. Không cần đăng nhập, không có máy chủ hay cơ sở dữ liệu, không quảng cáo, không thu thập dữ liệu.

## 2. Nội dung kiến thức (CT GDPT 2018 – Toán 2, bộ sách **Chân trời sáng tạo**)
Phiên bản 1 chỉ gồm các nội dung bé đã/đang học. **Phạm vi số tối đa: 100.**

| # | Chủ đề | Dạng bài cần sinh |
|---|--------|-------------------|
| 1 | Ôn tập số đến 100 | Đọc/viết số, chục – đơn vị, so sánh (>, <, =), số liền trước/liền sau, sắp xếp, tia số |
| 2 | Tên gọi thành phần phép tính | Số hạng – tổng; số bị trừ – số trừ – hiệu; nhiều hơn/ít hơn bao nhiêu |
| 3 | Cộng, trừ trong phạm vi 20 | Có nhớ (qua 10), bảng cộng/trừ, tìm số còn thiếu (`8 + ? = 15`) |
| 4 | Cộng, trừ trong phạm vi 100 | Có nhớ và không nhớ, tính nhẩm số tròn chục, đặt tính, tính có 2 dấu phép tính |
| 5 | Hình học | Điểm, đoạn thẳng, đường thẳng, đường cong, ba điểm thẳng hàng, đường gấp khúc (cộng độ dài các đoạn), hình tứ giác, đếm hình |
| 6 | Thống kê – xác suất | Biểu đồ tranh, kiểm đếm số liệu; *chắc chắn / có thể / không thể* |
| 7 | Toán có lời văn | Bài toán một bước về phép cộng, trừ: thêm, bớt, nhiều hơn, ít hơn |

**Ngoài phạm vi phiên bản 1:** số đến 1000, phép nhân/chia, đo lường (độ dài, khối lượng, dung tích, thời gian, tiền Việt Nam). Kiến trúc phải cho phép bổ sung các chủ đề này sau mà không sửa phần lõi.

**Yêu cầu nội dung:**
- Câu hỏi **sinh ngẫu nhiên theo mẫu** (template + tham số) để không trùng lặp; dạng hình học và biểu đồ tranh dùng ngân hàng câu hỏi tĩnh trong file JSON kèm hình.
- Mỗi chủ đề có **3 mức độ**: Dễ / Vừa / Khó (ví dụ: không nhớ → có nhớ → tìm thành phần chưa biết).
- Có chế độ **"Tổng hợp"** trộn nhiều chủ đề (ôn tập cuối kỳ).
- Ngôn ngữ: tiếng Việt chuẩn, câu ngắn, cách diễn đạt giống sách Chân trời sáng tạo, từ ngữ quen thuộc với trẻ (quả táo, viên bi, bông hoa…).
- Kết quả không âm, không vượt quá 100; đáp án nhiễu (trắc nghiệm) phải hợp lý (lệch ±1, ±10, quên nhớ).

## 3. Chức năng nghiệp vụ

### 3.1 Màn hình chính
- Lời chào kèm tên bé (cài đặt được), linh vật hoạt hình.
- 3 nút lớn: **Bắt đầu học** · **Lịch sử** · **Cài đặt** (cài đặt dành cho phụ huynh).

### 3.2 Tạo bài kiểm tra (tối đa 3 bước, mỗi bước 1 màn hình)
1. **Chọn chủ đề** (thẻ có biểu tượng, có thể chọn nhiều) hoặc "Tổng hợp".
2. **Chọn số câu:** 10 hoặc 20 câu. **Chọn mức độ:** Dễ / Vừa / Khó.
3. **Chọn hình thức:**
   - **Luyện tập** (chấm từng câu): trả lời xong biết đúng/sai ngay, hiện đáp án đúng và giải thích ngắn nếu sai, rồi sang câu tiếp.
   - **Kiểm tra** (nộp bài): làm hết đề, được quay lại sửa câu trước, bấm **Nộp bài** mới biết điểm. Có hộp xác nhận nếu còn câu chưa làm.

### 3.3 Màn hình làm bài
- Thanh tiến độ (ví dụ "Câu 3/10") dạng hình ngôi sao/đường đi.
- Dạng câu trả lời:
  - **Trắc nghiệm** 3–4 lựa chọn (nút lớn).
  - **Điền số**: bàn phím số tự vẽ trên màn hình (0–9, Xóa, OK), **không dùng bàn phím iPad**.
  - **So sánh**: 3 nút `>` `<` `=`.
  - **Đúng/Sai**.
- Câu hỏi có hình minh họa khi phù hợp (đồ vật để đếm, hình học, biểu đồ tranh).
- Nút **Nghe đọc đề** (dùng giọng đọc tiếng Việt của trình duyệt – Web Speech API) – hữu ích khi bé chưa đọc nhanh.
- Chế độ Kiểm tra: lưới số câu để chuyển nhanh, đánh dấu câu đã làm/chưa làm.
- Tùy chọn hiển thị đồng hồ bấm giờ (mặc định ẩn, chỉ ghi nhận thời gian, không gây áp lực).
- Thoát giữa chừng: hỏi xác nhận; bài dở được lưu để làm tiếp.

### 3.4 Phản hồi & hiệu ứng
| Tình huống | Hiệu ứng |
|-----------|----------|
| Trả lời đúng (Luyện tập) | Âm "ting/vỗ tay" vui, nút chuyển xanh, ngôi sao bay lên, lời khen ngẫu nhiên ("Giỏi quá!", "Tuyệt vời!") |
| Trả lời sai (Luyện tập) | Âm "boing" nhẹ nhàng (không chói, không gây sợ), nút rung nhẹ, hiện đáp án đúng + lời động viên ("Cố lên nào!") |
| Đúng liên tiếp 5 câu | Huy hiệu "Chuỗi 5 câu đúng" + âm thanh đặc biệt |
| Kết quả **≥ 90%** | **Pháo hoa toàn màn hình** + nhạc chiến thắng + cúp vàng + 3 sao |
| Kết quả **60% – < 90%** | Màn hình "Hoàn thành tốt!" + 1–2 sao, nhạc nhẹ, động viên cố gắng hơn |
| Kết quả **< 60%** | Hiệu ứng **"Thử thách thất bại"**: linh vật buồn/ngã, âm thanh "ôi không" vui nhộn, kèm lời động viên và nút **Thử lại** (thân thiện, không chê trách) |

- Có nút bật/tắt âm thanh ở mọi màn hình; âm lượng vừa phải.
- Hiệu ứng ngắn (≤ 4 giây), bấm bất kỳ đâu để bỏ qua.

### 3.5 Màn hình kết quả
- Điểm theo thang 10 và %, số câu đúng/sai, thời gian làm bài.
- **Xem lại bài:** danh sách từng câu, đáp án bé chọn, đáp án đúng (xanh/đỏ).
- Nút: **Làm lại đề này** · **Làm lại các câu sai** · **Làm đề mới** · **Về trang chủ**.

### 3.6 Lịch sử làm bài
- Danh sách các lần làm: ngày giờ, chủ đề, mức độ, hình thức, điểm, thời gian. Lọc theo chủ đề / khoảng thời gian.
- Bấm vào để xem lại chi tiết từng câu.
- **Thống kê đơn giản:** tổng số bài, điểm trung bình, biểu đồ cột điểm 10 lần gần nhất, chủ đề mạnh/yếu (tỷ lệ đúng theo chủ đề).
- Bộ sưu tập **sao/huy hiệu** đã đạt (tạo động lực).

### 3.7 Cài đặt (phụ huynh)
- Vào bằng **cổng phụ huynh**: một câu hỏi dành cho người lớn (ví dụ `47 + 38 = ?` hoặc phép nhân).
- Tên bé, bật/tắt âm thanh, bật/tắt giọng đọc, bật/tắt đồng hồ bấm giờ.
- Bật/tắt từng chủ đề (ẩn chủ đề chưa học tới trên lớp).
- **Sao lưu/Khôi phục**: xuất lịch sử ra file JSON, nhập lại từ file (phòng khi xóa dữ liệu trình duyệt hoặc đổi máy).
- Xóa toàn bộ lịch sử (có xác nhận 2 lần).

## 4. Yêu cầu giao diện (UI/UX cho trẻ 7 tuổi)
- **Chữ to:** câu hỏi ≥ 32px, đáp án/nút ≥ 28px, chữ phụ ≥ 20px. Font tròn, dễ đọc, hỗ trợ đầy đủ dấu tiếng Việt (gợi ý: *Nunito* hoặc *Baloo 2*, nhúng sẵn trong dự án).
- **Nút bấm lớn:** vùng chạm tối thiểu 64×64px, cách nhau ≥ 16px để tránh bấm nhầm.
- Màu sắc tươi sáng, tương phản cao (đạt WCAG AA); không chỉ dùng màu để báo đúng/sai (thêm biểu tượng ✓ ✗).
- Mỗi màn hình **một nhiệm vụ**, ít chữ, nhiều biểu tượng; không có menu phức tạp.
- Tối ưu cho **iPad ngang và dọc** (768–1366px); vẫn dùng được trên điện thoại/laptop.
- Không cần cuộn trang khi làm bài; tắt phóng to bằng chụm ngón và tắt chọn văn bản khi chạm lâu.
- Không có liên kết ra ngoài, không quảng cáo, không yêu cầu mạng sau lần tải đầu.

## 5. Lưu trữ dữ liệu (cục bộ)
- Dùng **localStorage** của trình duyệt (dữ liệu nhỏ, ước tính < 1MB/năm).
- Cấu trúc gợi ý:
  - `settings`: `{ childName, sound, voice, timer, enabledTopics[] }`
  - `history[]`: `{ id, startedAt, finishedAt, topics[], level, mode, total, correct, scorePct, questions[{text, choices, answer, userAnswer, isCorrect}] }`
  - `inProgress`: bài đang làm dở (nếu có)
  - `badges[]`: huy hiệu đã đạt
- Có trường `version` để nâng cấp cấu trúc sau này. Giới hạn lưu chi tiết 500 bài gần nhất.
- **Lưu ý quan trọng:**
  - Dữ liệu **Safari và Chrome lưu riêng**, không dùng chung lịch sử. Bản cài ở Màn hình chính cũng có thể lưu riêng với bản mở trong trình duyệt → khuyến nghị bé luôn mở từ **một biểu tượng duy nhất** trên Màn hình chính.
  - Dữ liệu có thể mất khi xóa lịch sử duyệt web hoặc không mở web trong thời gian dài (cơ chế của iOS) → bắt buộc có chức năng Sao lưu (mục 3.7) và nhắc phụ huynh sao lưu mỗi tháng.

## 6. Tech-stack (đơn giản nhất)
| Thành phần | Lựa chọn |
|-----------|----------|
| Ngôn ngữ | **HTML5 + CSS3 + JavaScript thuần (ES6 modules)** – không framework, không cần build |
| Âm thanh | File `.mp3` ngắn (lấy từ nguồn miễn phí bản quyền, ví dụ Pixabay/Mixkit) + Web Audio API |
| Pháo hoa | Thư viện **canvas-confetti** (tải về đặt trong thư mục dự án, không dùng CDN) |
| Hình ảnh | SVG (hình học, đồ vật để đếm, biểu đồ tranh) – nét, nhẹ |
| Giọng đọc | Web Speech API (`speechSynthesis`, giọng `vi-VN`) |
| Lưu trữ | localStorage |
| Ngoại tuyến | **PWA**: `manifest.json` + `service-worker.js` để thêm vào Màn hình chính iPad và chạy không cần mạng |
| Hosting | **GitHub Pages** (miễn phí) – xem hướng dẫn trong `DEPLOY.md` |

**Cấu trúc thư mục gợi ý:**
```
index.html  manifest.json  service-worker.js  .nojekyll
css/style.css
js/app.js  js/generators/*.js  js/storage.js  js/sound.js  js/effects.js
data/questions/*.json     assets/sounds/  assets/images/  assets/fonts/  assets/icons/
```

**Lưu ý kỹ thuật cho iPad (Safari và Chrome):**
- Trên iPad, Chrome dùng chung lõi WebKit với Safari → chỉ cần đảm bảo chạy tốt trên WebKit; phải **kiểm thử trên cả 2 trình duyệt**.
- iOS chỉ cho phát âm thanh sau lần chạm đầu tiên của người dùng → "mở khóa" âm thanh ở nút **Bắt đầu học**.
- Đặt `apple-touch-icon` và `apple-mobile-web-app-capable` để chạy toàn màn hình như ứng dụng.
- Dùng **đường dẫn tương đối** (`./css/style.css`) vì web chạy ở thư mục con `/toan-lop-2/` trên GitHub Pages.
- Service worker có hằng số `CACHE_VERSION`; tăng số này mỗi lần cập nhật để iPad nhận bản mới.
- Hỗ trợ iPadOS 16.4 trở lên (Safari và Chrome).

## 7. Triển khai
- **Chọn GitHub Pages** (miễn phí, có HTTPS, cập nhật bằng cách tải mã mới lên). Hướng dẫn chi tiết từng bước: **`DEPLOY.md`**.
- Trên iPad: mở link → **Chia sẻ** → **Thêm vào Màn hình chính** → bé bấm biểu tượng như một ứng dụng, dùng được cả khi không có mạng.
- Không khuyến nghị mở file HTML trực tiếp trong ứng dụng Tệp vì trình duyệt hạn chế lưu trữ, âm thanh và service worker.

## 8. Yêu cầu phi chức năng
- Tải trang lần đầu < 3 giây với 4G; tổng dung lượng < 10MB.
- Phản hồi khi chạm < 100ms; hiệu ứng mượt (60fps) trên iPad đời 2018 trở lên.
- Không thu thập/gửi dữ liệu ra ngoài; không dùng cookie hay công cụ theo dõi.
- Không ghi thông tin cá nhân (tên thật của bé…) vào mã nguồn, vì kho mã GitHub Pages miễn phí là công khai.
- Mã nguồn có chú thích, dễ thêm chủ đề/dạng câu hỏi mới (mỗi dạng là một module sinh câu hỏi độc lập).

## 9. Tiêu chí nghiệm thu
- [ ] Có đủ 7 chủ đề ở mục 2, mỗi chủ đề có 3 mức độ; phụ huynh kiểm tra ngẫu nhiên 50 câu không có câu sai đáp án hoặc vượt phạm vi 100.
- [ ] Làm được bài 10 và 20 câu ở cả 2 hình thức Luyện tập và Kiểm tra.
- [ ] Hiệu ứng pháo hoa xuất hiện khi ≥ 90%; hiệu ứng "Thử thách thất bại" khi < 60%; âm thanh đúng/sai hoạt động trên iPad.
- [ ] Mọi chức năng chạy đúng trên **cả Safari và Chrome** của iPad.
- [ ] Lịch sử còn nguyên sau khi tắt trình duyệt và khởi động lại iPad; sao lưu/khôi phục hoạt động.
- [ ] Bé 7 tuổi tự thao tác hết một bài mà không cần người lớn hướng dẫn (thử thực tế).
- [ ] Chạy được khi tắt mạng sau khi đã thêm vào Màn hình chính.
- [ ] Đã triển khai lên GitHub Pages theo `DEPLOY.md` và mở được từ iPad.

## 10. Lộ trình gợi ý
- **Phiên bản 1 (bàn giao một lần):** toàn bộ yêu cầu trong tài liệu này – đủ 7 chủ đề (gồm hình minh họa cho hình học, biểu đồ tranh); trắc nghiệm, điền số, so sánh, đúng/sai; 2 hình thức Luyện tập/Kiểm tra; hiệu ứng âm thanh, pháo hoa, "thử thách thất bại"; lịch sử, thống kê, huy hiệu; giọng đọc; PWA ngoại tuyến; sao lưu/khôi phục; triển khai GitHub Pages.
- **Giai đoạn sau (khi bé học tới):** số đến 1000, phép nhân/chia, đo lường (độ dài, khối lượng, dung tích, thời gian, tiền).
- **Ngoài phạm vi:** nhiều tài khoản, đồng bộ nhiều máy, bảng xếp hạng, máy chủ.
