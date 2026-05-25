# Kế hoạch triển khai Website Thiệp Cưới Online Premium (Cập nhật Mới)

Dự án này xây dựng một trang web thiệp cưới online (Wedding Invitation Website) đẳng cấp, sang trọng, phản hồi (responsive) hoàn hảo trên PC và Mobile, tích hợp các tính năng tương tác nâng cao theo phản hồi mới nhất của bạn.

---

## 📋 Cập nhật Tính năng Nâng cao

1.  **Lưu trữ RSVP & Lời chúc qua Google Sheets (Google Sheets API):**
    *   **Giải pháp Serverless Tối ưu:** Thay vì lưu trữ LocalStorage, chúng tôi sẽ tích hợp tính năng gửi RSVP trực tiếp lên Google Sheets của bạn thông qua **Google Apps Script** (Hoàn toàn miễn phí, an toàn và dễ quản lý).
    *   **Tương tác Hai chiều (Đọc/Ghi dữ liệu):**
        *   **Gửi RSVP (POST):** Khi khách nhấn "Xác nhận tham dự", dữ liệu sẽ lập tức được ghi thêm vào Google Sheet (Tên khách, SĐT, Số lượng đi cùng, Trạng thái tham dự, Bên khách mời, Lời chúc).
        *   **Đọc Lời chúc (GET):** Khi trang web tải, nó sẽ tự động gọi API lấy danh sách các lời chúc từ Google Sheet để hiển thị lên "Tường Lời chúc" (Guestbook), giúp lời chúc luôn được đồng bộ và cập nhật thời gian thực!
    *   Chúng tôi sẽ viết sẵn một đoạn mã Google Apps Script cực kỳ ngắn gọn và hướng dẫn bạn cách tạo, cấu hình trên Google Drive trong vòng 2 phút.
2.  **Thiệp Đích Danh (Personalized Greeting) qua URL Parameters:**
    *   Hỗ trợ cá nhân hóa lời mời cho từng khách mời cụ thể.
    *   Khi khách truy cập qua đường dẫn có tham số (ví dụ: `index.html?to=Anh+Nam` hoặc `?to=Chị+Thảo&role=Bạn+Cô+Dâu`), trang web sẽ tự động:
        *   Hiển thị lời chào cá nhân hóa ngay tại **Màn hình bìa (Hero Cover)**: *"Trân trọng kính mời **Anh Nam**..."* hoặc *"Thân gửi **Chị Thảo (Bạn Cô Dâu)**..."*.
        *   Tự động điền sẵn (pre-fill) tên khách mời vào form RSVP để họ không cần nhập lại tên.
3.  **Hệ thống Hiệu ứng Rơi động (Falling Animation) theo Theme:**
    *   Chúng tôi sẽ tạo hiệu ứng rơi động chạy bằng HTML5 Canvas siêu nhẹ (`js/petals.js`). Hiệu ứng này sẽ tự động thay đổi theo tông màu theme được chọn:
        *   **Trắng Hồng (Pink):** Cánh hoa đào / hoa hồng nhạt rơi lãng mạn.
        *   **Trắng Xanh (Blue/Green):** Lá trà xanh / lá xô thơm rơi thanh mát.
        *   **Trắng Đỏ (Red):** Cánh hồng đỏ / trái tim nhỏ rơi ấm áp và may mắn.
        *   **Nâu Be / Kem (Beige/Cream):** Cánh hoa nhài trắng hoặc bụi kim tuyến vàng óng sang trọng.
    *   Có nút bật/tắt hiệu ứng rơi này để khách tùy chọn nếu không muốn màn hình bị che.
4.  **4 Tông màu Lựa chọn (Theme Switcher):**
    *   Bảng điều khiển đổi màu nổi (Floating Widget) đổi ngay tông màu của toàn bộ giao diện (chữ, nền, đường viền, nút bấm) bằng CSS Variables.
5.  **Bỏ phần hòm mừng cưới:**
    *   Bỏ hoàn toàn mục thông tin ngân hàng và mã QR chuyển khoản mừng cưới như bạn yêu cầu.

---

## 📂 Cấu trúc Thư mục Dự án

```
ThiepCuoi/
│
├── index.html              # Trang chủ thiệp cưới & Hộp thông tin cá nhân hóa
├── css/
│   ├── style.css           # CSS hệ thống, các biến CSS variables của 4 theme màu
│   └── reset.css           # Reset CSS cơ bản
├── js/
│   ├── script.js           # Logic chính (Countdown, Audio player, Lightbox, Nhận diện URL, Gọi Google Sheet API)
│   └── petals.js           # Hiệu ứng Canvas hoa/lá rơi tương ứng với từng theme màu
├── CD ANH/                 # Thư mục ảnh cưới có sẵn của bạn (25 ảnh gốc)
├── music/
│   └── beautiful-wedding.mp3 # Nhạc nền acoustic du dương
└── google-apps-script.js   # [MỚI] Đoạn mã để bạn copy-paste vào Google Apps Script của bạn
```

---

## 💻 Đoạn mã Google Apps Script để Lưu RSVP vào Google Sheets

Tôi sẽ tạo file `google-apps-script.js` chứa mã nguồn Google Apps Script. Khi bạn tạo một Google Sheet:
1. Bạn nhấn vào **Tiện ích mở rộng (Extensions)** -> **Apps Script**.
2. Dán đoạn mã này vào, nhấn **Lưu (Save)**.
3. Nhấn **Triển khai (Deploy)** -> **Triển khai mới (New deployment)**.
4. Chọn loại là **Ứng dụng web (Web app)**.
5. Ở mục *Ai có quyền truy cập (Who has access)*, chọn **Bất kỳ ai (Anyone)**.
6. Copy URL của Web App nhận được và dán vào biến `const GOOGLE_SHEET_SCRIPT_URL` trong file `js/script.js` của trang web!

---

## 🚀 Kế hoạch Xác minh (Verification Plan)
1.  **Kiểm tra Tham số URL (Personalized Greeting):**
    *   Truy cập `http://localhost:8000/?to=Anh%20Tuấn` -> Xem màn hình chào có hiển thị *"Trân trọng kính mời Anh Tuấn"* không.
    *   Truy cập `http://localhost:8000/?to=Chị%20Lan&role=Bạn%20Cấp%203` -> Xem màn hình chào có hiển thị *"Thân gửi Chị Lan (Bạn Cấp 3)"* không.
    *   Kiểm tra xem tên trong form RSVP đã được điền sẵn là "Anh Tuấn" hay "Chị Lan" chưa.
2.  **Kiểm tra Hiệu ứng Rơi (Falling Animation):**
    *   Chọn theme Trắng Hồng -> Kiểm tra cánh hoa hồng phấn rơi.
    *   Chọn theme Trắng Xanh -> Kiểm tra lá xanh rơi.
    *   Chọn theme Trắng Đỏ -> Kiểm tra cánh hoa đỏ rơi.
    *   Chọn theme Nâu Be -> Kiểm tra lá vàng/kim tuyến rơi.
    *   Bấm nút Tắt hiệu ứng rơi -> Xác minh canvas biến mất và không chạy ngầm tốn hiệu năng.
3.  **Kiểm tra Google Sheets API:**
    *   Điền form RSVP và gửi -> Kiểm tra dữ liệu có xuất hiện ngay lập tức trên Google Sheet không.
    *   Kiểm tra xem tường lưu bút có tải lại các lời chúc mới nhất từ Google Sheet lên giao diện không.
