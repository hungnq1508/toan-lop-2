# HƯỚNG DẪN TRIỂN KHAI LÊN GITHUB PAGES

> Dành cho phụ huynh, không cần biết lập trình. Thời gian: khoảng 15–20 phút cho lần đầu.
> Kết quả: web có địa chỉ dạng `https://<tên-tài-khoản>.github.io/toan-lop-2/`, miễn phí, có HTTPS.

---

## Phần 0. Chuẩn bị
- Máy tính (Mac/Windows) có trình duyệt **Chrome** hoặc **Edge** (kéo thả thư mục ổn định nhất).
- Thư mục mã nguồn do đội phát triển bàn giao, ví dụ `toan-lop-2/`. Kiểm tra bên trong **có file `index.html` nằm ngay ở thư mục gốc** (không nằm trong thư mục con).
- Một địa chỉ email để đăng ký GitHub.

> ⚠️ Với tài khoản miễn phí, kho mã phải để **Public** (ai có link cũng xem được mã nguồn). Không sao, vì lịch sử làm bài của bé chỉ lưu trên iPad, không nằm trong mã nguồn. Chỉ cần **không đưa tên thật, ảnh của bé vào mã nguồn**.

---

## Phần 1. Tạo tài khoản GitHub (bỏ qua nếu đã có)
1. Vào https://github.com → bấm **Sign up**.
2. Nhập email, mật khẩu, **tên tài khoản** (username). Tên này sẽ nằm trong địa chỉ web, nên chọn tên ngắn, viết thường, không dấu, ví dụ `bohoctoan`.
3. Nhập mã xác nhận gửi về email → hoàn tất.
4. (Khuyến nghị) Bật xác thực 2 bước: ảnh đại diện góc phải → **Settings** → **Password and authentication**.

---

## Phần 2. Tạo kho chứa mã (repository)
1. Bấm dấu **+** ở góc trên bên phải → **New repository**.
2. Điền:
   - **Repository name:** `toan-lop-2`
   - **Description:** (tùy chọn) `Web học toán lớp 2`
   - Chọn **Public**
   - **Không** tích các ô "Add a README", ".gitignore", "license".
3. Bấm **Create repository**.

---

## Phần 3. Tải mã nguồn lên
1. Trong trang kho vừa tạo, bấm dòng chữ **uploading an existing file** (hoặc **Add file → Upload files**).
2. Mở thư mục `toan-lop-2` trên máy tính, **chọn tất cả file và thư mục bên trong** (Mac: `Cmd + A`, Windows: `Ctrl + A`), rồi **kéo thả vào trang web**.
   - Kéo **nội dung bên trong**, không kéo cả thư mục `toan-lop-2`, để `index.html` nằm ở gốc kho.
   - Mỗi lần tải tối đa 100 file. Nếu nhiều hơn, tải thành vài đợt (mỗi đợt vài thư mục).
   - File ẩn `.nojekyll` có thể không hiện trên Mac: bấm `Cmd + Shift + .` trong Finder để hiện file ẩn rồi kéo cùng.
   - Khi đã hiện file ẩn, **không kéo** thư mục `.git` và `.playwright-mcp` (nếu có) – đó là dữ liệu của công cụ lập trình, không cần cho web.
3. Đợi thanh tải chạy xong. Ở ô **Commit changes** bên dưới, ghi `Phiên bản đầu tiên` → bấm **Commit changes**.
4. Kiểm tra: trang kho hiện `index.html`, các thư mục `css`, `js`, `assets`…

---

## Phần 4. Bật GitHub Pages
1. Trong kho, bấm tab **Settings** (biểu tượng bánh răng).
2. Menu bên trái → **Pages**.
3. Mục **Build and deployment**:
   - **Source:** chọn `Deploy from a branch`
   - **Branch:** chọn `main`, thư mục `/ (root)` → bấm **Save**.
4. Đợi 1–3 phút, tải lại trang. Phía trên sẽ hiện: **"Your site is live at https://<tên-tài-khoản>.github.io/toan-lop-2/"**.
5. Bấm **Visit site** để mở thử trên máy tính.
6. (Tùy chọn) Xem tiến trình ở tab **Actions**: dấu ✅ xanh là xong, ❌ đỏ là lỗi (xem Phần 8).

---

## Phần 5. Cài lên iPad
**Dùng Safari:**
1. Mở Safari → gõ địa chỉ `https://<tên-tài-khoản>.github.io/toan-lop-2/`.
2. Đợi trang tải xong hoàn toàn (để web lưu bản dùng khi không có mạng).
3. Bấm nút **Chia sẻ** (ô vuông có mũi tên lên) → **Thêm vào Màn hình chính** → đặt tên `Học Toán` → **Thêm**.

**Dùng Chrome (iPadOS 16.4 trở lên):**
1. Mở Chrome → gõ địa chỉ như trên, đợi trang tải xong.
2. Bấm nút **Chia sẻ** (ô vuông có mũi tên lên) ở **bên phải thanh địa chỉ**, phía trên cùng màn hình.
   - Không thấy nút này: bấm nút **⋯** (Thêm) → **Chia sẻ…**
3. Bảng chia sẻ của iPad hiện ra. Từ iPadOS 26, bảng này chỉ hiện vài tác vụ: bấm **Xem thêm** (hoặc **⋯**) trong bảng để mở danh sách đầy đủ, rồi **vuốt lên** tìm **Thêm vào MH chính** (iPad tiếng Việt viết tắt "MH" = Màn hình; tiếng Anh là *Add to Home Screen*).
   - Vẫn không thấy: kéo xuống cuối danh sách → **Sửa tác vụ…** → bật **Thêm vào MH chính** (bấm dấu **+** xanh) → **Xong**.
4. Đặt tên `Học Toán` → bấm **Thêm** (góc trên bên phải).

> Không tìm thấy mục này ở cả hai cách trên: iPad có thể đang chạy iPadOS cũ hơn 16.4 (xem ở Cài đặt → Cài đặt chung → Giới thiệu → Phiên bản phần mềm). Khi đó hãy dùng **Safari** như hướng dẫn ở trên, hoặc cập nhật iPadOS.

**Sau khi cài:**
- Bé luôn mở web từ **biểu tượng trên Màn hình chính**. Safari, Chrome và biểu tượng có thể lưu lịch sử riêng, nên chỉ dùng **một** biểu tượng để lịch sử không bị tách.
- Bật thử chế độ máy bay rồi mở biểu tượng. Nếu web vẫn chạy là chế độ không cần mạng đã hoạt động.
- Gạt **nút tắt tiếng** (nếu iPad có) và tăng âm lượng để nghe hiệu ứng.

---

## Phần 6. Cập nhật phiên bản mới
Khi đội phát triển gửi bản mới:
1. Vào kho trên GitHub → **Add file → Upload files**.
2. Kéo thả các file/thư mục mới vào. File trùng tên sẽ **tự được ghi đè**.
3. Ghi chú, ví dụ `Cập nhật v1.1 – thêm chủ đề hình học` → **Commit changes**.
4. Đợi 1–3 phút để GitHub Pages cập nhật.
5. Trên iPad: **đóng hẳn** ứng dụng Học Toán (vuốt lên từ đáy màn hình, vuốt thẻ ứng dụng đi), rồi mở lại 1–2 lần để nhận bản mới.

**Xóa file cũ không dùng nữa:** mở file trên GitHub → nút **…** góc phải → **Delete file** → **Commit changes**.

> Đề nghị đội phát triển **tăng `CACHE_VERSION`** trong `service-worker.js` ở mỗi bản cập nhật. Nếu không, iPad có thể tiếp tục hiện bản cũ.
> Lịch sử làm bài của bé **không bị mất** khi cập nhật, vì nó lưu trên iPad chứ không nằm trên GitHub.

---

## Phần 7. Sao lưu lịch sử làm bài (mỗi tháng 1 lần)
1. Trong web → **Cài đặt** → trả lời câu hỏi phụ huynh → **Sao lưu**.
2. iPad sẽ tải file `.json` về ứng dụng **Tệp**. Nên lưu vào iCloud Drive.
3. Khi cần khôi phục (đổi máy, lỡ xóa dữ liệu trình duyệt): **Cài đặt → Khôi phục** → chọn file đã lưu.

---

## Phần 8. Xử lý sự cố thường gặp
| Hiện tượng | Nguyên nhân thường gặp | Cách xử lý |
|-----------|------------------------|-----------|
| Mở link báo **404** | Pages chưa bật xong, hoặc `index.html` không nằm ở gốc kho | Đợi thêm vài phút; kiểm tra lại Phần 3 bước 2 và Phần 4 |
| Trang hiện nhưng **mất màu, mất hình** | Mã dùng đường dẫn bắt đầu bằng `/` thay vì `./` | Báo đội phát triển đổi sang đường dẫn tương đối |
| iPad vẫn hiện **bản cũ** | Bộ nhớ đệm của service worker | Đóng hẳn ứng dụng rồi mở lại; nếu vẫn cũ, báo đội phát triển tăng `CACHE_VERSION` |
| **Không có âm thanh** | iPad đang tắt tiếng, hoặc chưa chạm màn hình lần nào | Bật tiếng, tăng âm lượng; bấm nút **Bắt đầu học** để mở khóa âm thanh |
| Giọng đọc không phải tiếng Việt | iPad chưa có giọng tiếng Việt | iPad: Cài đặt → Trợ năng → Nội dung được đọc → Giọng nói → Tiếng Việt → tải giọng |
| **Mất lịch sử** | Đã xóa dữ liệu trình duyệt hoặc mở bằng trình duyệt/biểu tượng khác | Mở đúng biểu tượng cũ; khôi phục từ file sao lưu (Phần 7) |
| Tab **Actions** báo ❌ | Lỗi khi GitHub dựng trang | Kiểm tra kho có file `.nojekyll` ở gốc; bấm vào lần chạy lỗi → **Re-run jobs** |

---

## Phụ lục. Cách nâng cao cho đội phát triển (dùng Git)
```bash
git init
git add .
git commit -m "Phiên bản đầu tiên"
git branch -M main
git remote add origin https://github.com/<tên-tài-khoản>/toan-lop-2.git
git push -u origin main
# Lần cập nhật sau:
git add . && git commit -m "Cập nhật vX.Y" && git push
```
Có thể dùng **GitHub Desktop** (https://desktop.github.com) nếu muốn thao tác bằng giao diện thay vì dòng lệnh.
