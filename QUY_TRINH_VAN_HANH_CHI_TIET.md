# 📖 QUY TRÌNH KỊCH BẢN VẬN HÀNH CHI TIẾT (BẢN ĐẦY ĐỦ NHẤT)
*Dành cho người kiểm thử (Tester) hoặc Giảng viên/Sinh viên tham khảo để hiểu toàn bộ luồng hoạt động của Hệ Thống Quản Lý Đồ Án Tốt Nghiệp.*

Kịch bản này được thiết kế để bao phủ **tất cả các trường hợp** (Đăng ký thành công, bị từ chối, cạnh tranh đề tài, sinh viên tự đề xuất ý tưởng...).

---

## 📅 PHẦN I: THIẾT LẬP NỀN TẢNG (Quyền Admin)
*Chuẩn bị nhà tranh, vườn rau trước khi mời khách (GV & SV) vào sử dụng.*

### 1. Đăng nhập hệ thống
*   **Trình duyệt:** Mở tab ẩn danh hoặc Chrome. Trỏ đến `localhost:5173` (hoặc URL website thực tế).
*   **Tài khoản:** `admin@gmail.com`
*   **Mật khẩu:** `admin123`

### 2. Import Dữ liệu hàng loạt (Giả lập 10 GV & 20 SV)
1.  Bật menu bên trái: Chọn `Quản lý hệ thống` -> Chọn `Nhập/Xuất cấu hình` (Hoặc menu User tuỳ giao diện).
2.  Bấm vào nút **Import/Nhập tài khoản**.
3.  Tải lên file `teachers_import_test.csv` (10 GV). Nhấn OK.
4.  Tải lên file `students_import_test.csv` (20 SV). Nhấn OK.
5.  *Kết quả:* Có ngay 30 tài khoản với mật khẩu mặc định là `default123`.

### 3. Cấu hình Cơ cấu tổ chức
1.  Vào `Quản lý Khoa`. Nhấn **Thêm mới**:
    *   Tên Khoa: "Khoa CNTT"
2.  Vào `Quản lý Chuyên ngành` (Majors). Nhấn **Thêm mới**:
    *   Tên Chuyên ngành: "Kỹ thuật phần mềm"
    *   Thuộc khoa: "Khoa CNTT"
3.  Vào `Quản lý Danh mục` (Categories). Nhấn **Thêm mới**:
    *   Thêm 3 danh mục: `Web`, `AI & Machine Learning`, `Mobile App`.

### 4. Thiết lập Thang điểm Tiêu chuẩn (Rubric)
1.  Vào `Quản lý Rubric`. Nhấn nút **Tạo Rubric mẫu**.
2.  Tên Rubric: "Chấm điểm Đồ án Khóa 2024"
3.  Nhập 3 Hạng mục chấm (Cốt lõi để GV chấm sinh viên ở cuối kỳ):
    *   *Mục 1:* Nội dung quyển báo cáo (30%)
    *   *Mục 2:* Chất lượng mã nguồn Source Code (50%)
    *   *Mục 3:* Kỹ năng thuyết trình & Trả lời phản biện (20%)
4.  Nhấn lưu.

### 5. Khởi tạo Học Kỳ Hoạt Động (Cực kỳ quan trọng)
*Nếu không có bước này, hệ thống đóng băng hoàn toàn.*
1.  Vào `Quản lý Học kỳ`. Nhấn **Thêm mới**.
2.  Năm học: `2024-2025`. Học kỳ số: `1`.
3.  **Hành động bắt buộc:** Bật Switch toggle `[✓] Chọn làm học kỳ hiện tại` (Active). Mọi dữ liệu từ lúc này sẽ được lưu cho Học kỳ 1.

---

## 💡 PHẦN II: GIẢNG VIÊN ĐƯA RA CÁC "ĐỀ BÀI" ĐỒ ÁN (Quyền Teacher)

### 1. Đăng nhập Giảng viên 01
*   **Tài khoản:** `gv001@edu.vn` (TS. Nguyễn Xuân) -> Pass: `default123`
*   Bật tab `Đề tài` -> `Quản lý đề tài`.

### 2. Tạo nhanh 2 đề tài
1.  Nhấn **Thêm đề tài**:
    *    Tên: "Hệ thống quản lý Ký túc xá bằng thẻ từ RFID".
    *    Danh mục: Tích chọn "Web".
    *    Số lượng SV giới hạn: `1`. (Giả sử đề tài này dễ, thầy chỉ cho 1 bạn làm).
    *    Nhấn Lưu. Trạng thái đề tài hiện chữ màu cam: **PENDING** (Chờ duyệt).
2.  Nhấn **Thêm đề tài thứ 2**:
    *    Tên: "Robot dò đường bằng AI siêu việt".
    *    Danh mục: Tích chọn "AI".
    *    Số lượng SV giới hạn: `2`. (Đề tài khó, cần 2 bạn làm).
    *    Nhấn Lưu. Trạng thái cũng là **PENDING**.

### 3. Đăng nhập Giảng viên 02 (ThS. Lê Thu)
*   **Tài khoản:** `gv002@edu.vn` -> Pass: `default123`
*   Tạo 1 đề tài: "Ngớ ngẩn và Dễ dãi" (Danh mục Web, Giới hạn: 1 SV). Trạng thái PENDING.

---

## ⚖️ PHẦN III: ADMIN QUÉT RÁC & MỞ CỔNG CHỢ (Quyền Admin)

### 1. Duyệt chất lượng Đề bài
1.  Đăng xuất. Đăng nhập lại Admin.
2.  Vào `Đề tài Hệ thống` -> Bấm sang tab **Chờ duyệt (Pending)**.
3.  Sẽ thấy 3 đề tài của GV01 và GV02 nằm đó.
4.  **Duyệt (Approve):** Click vào 2 đề tài của GV01. Nhấn nút xanh `Approve`. 
5.  **Từ chối (Reject):** Click vào đề tài "Ngớ ngẩn và Dễ dãi" của GV02. Nhấn nút đỏ `Reject`. Khung lý do hiện lên, Admin gõ: *"Tên đề tài thiếu tính học thuật, mời thầy sửa lại"* -> Nhấn Gửi.

*(Trong thực tế, GV02 sẽ nhận được thông báo đỏ chót, phải vào đổi tên thành "Nghiên cứu hành vi người dùng bằng thuật toán", rồi gửi duyệt lại)*. Nhưng ở kịch bản này ta bỏ qua GV02. Vậy danh sách đề tài **Đang khả dụng** giờ chỉ có 2 cái của GV01.

### 2. Mở cửa cho Sinh viên
1.  Admin vào `Đợt đăng ký`.
2.  Nhấn **Mở đợt đăng ký mới**. Chọn Học kỳ 1.
3.  Set Ngày bắt đầu = Hôm nay. Ngày kết thúc = Cuối tháng.
4.  Lưu lại. Cổng đã mở toang.

---

## 🥊 PHẦN IV: CUỘC GIAO TRANH CỦA SINH VIÊN (Quyền Student)
*Mô phỏng 3 sinh viên thi nhau giành 2 đề tài của thầy Xuân.*

### Cảnh 1. SV01 Nhanh tay đoạt cúp
1. Sinh viên `sv001@student.edu.vn` (Nguyễn Văn An) đăng nhập.
2. Vào `Danh sách đề tài` (Chỉ hiện các đề tài có nhãn xanh APPROVED ở trên).
3. Đọc kỹ đề tài "Hệ thống quản lý Ký túc xá" (1 chỗ trống). 
4. SV01 bấm nút **Đăng ký ngay**. Màn hình nhảy Pop-up thành công. Giao diện báo `Đã đăng ký - Chờ thầy Xuân duyệt`.

### Cảnh 2. SV02 Thiếu quan sát, đụng hàng
1. Ngay lúc đó, sinh viên `sv002@student.edu.vn` (Trần Thị Bình) cũng đăng nhập. 
2. Nhìn thấy đề tài "Quản lý KTX" quá thơm, chưa kịp cập nhật nên Bình cũng bấm **Đăng ký ngay** vào đúng cái đề tài đó. 
3. Lập tức hệ thống ghi nhận Bình vào danh sách Pending của đề tài KTX (Cùng mâm với An).

### Cảnh 3. SV03 Không thích thầy Xuân, tự nghĩ ý tưởng
1. `sv003@student.edu.vn` (Lê Hoàng Cường) đăng nhập.
2. Tìm mỏi mắt không thấy thích Robot hay KTX.
3. Cường bấm vào nút ở góc phải **Tự đề xuất đề tài mới**.
4. Cường nhập: 
   * Tên tự chế: "Ứng dụng gọi món bằng vẫy tay". 
   * Chọn người hướng dẫn: Quẹt tìm "TS. Trần Đông" (GV03) -> Bấm Gửi.
5. Việc của Cường là chờ thầy Đông phản hồi.

---

## 🧠 PHẦN V: GIẢNG VIÊN VÀ QUYỀN SINH SÁT (Quyền Teacher)

### Cảnh 1. Thầy Xuân Lọc Hồ Sơ
1. Giảng viên `gv001@edu.vn` (Tiến sĩ Xuân) đăng nhập lại.
2. Có chuông! Thầy vào `Sinh viên` -> `Đăng ký sinh viên`. 
3. Khung màn hình hiển thị: "Đề tài Ký Túc Xá" có 2 ứng viên là *An* (SV01) và *Bình* (SV02). Nhưng Slot chứa chỉ có 1 thôi.
4. Thầy Xuân xem thông tin, thích SV01 An hơn.
5. Thầy Xuân click **Approve (Đồng ý)** cho em Nguyễn Văn An. -> Slot đầy!
6. Lập tức, nút Approve của Bé Bình (SV02) bị mờ/disable hoặc bay màu. Thầy Xuân buột phải click **Reject (Từ chối)** Bé Bình.
7. *Chuyện gì xảy ra cho Bình?:* Tài khoản Bình ting ting thông báo đỏ "Bạn đã trượt". Bình phải mếu máo quay lại `Danh sách đề tài` tìm đề án Robot (còn 2 slot) hoặc đi xin thầy khác.

### Cảnh 2. Thầy Đông duyệt đơn tự túc
1. Giảng viên `gv003@edu.vn` (TS. Trần Đông) đăng nhập.
2. Thấy đơn bơ vơ tự đề xuất của SV03 (Cường).
3. Thầy Đông duyệt OK. Trạng thái SV03 thành `APPROVED`.

---

## 🛠️ PHẦN VI: LAO ĐỘNG KHỔ SAI TRONG 4 THÁNG (Quyền SV + GV)

### 1. Giao Task (Mốc Tiến Độ - Milestone)
1. Thầy Xuân (GV01) vào màn chi tiết của học trò mình: Nguyễn Văn An.
2. Cuộn xuống phần `Mốc tiến độ` -> Nhấn **Tạo task mới**.
3. *Tên task:* Cắt HTML/CSS trang chủ. *Deadline:* Chủ nhật tuần này. (Chỉ định riêng cho SV01).

### 2. Sinh viên làm bài và "Nộp mạng"
1. Chủ nhật tới, SV01 (An) đăng nhập. Khung Dashboard đỏ lòm thông báo sát Deadline.
2. An bấm vào tab Menu **Tiến độ đề tài**. Thấy Task "Cắt HTML/CSS" đang mở.
3. An lấy File Zip trên máy tính (hoặc dán Link GitHub) vào ô Textbox -> Bấm **Update / Nộp bài**.
4. Hiện trạng thái báo cáo.

### 3. Thầy giáo thả tim (Nghiệm thu tiến độ)
1. Thầy Xuân (GV01) vào Menu `Theo dõi tiến độ`.
2. Mở file Zip/Link của An lên xem. Chạy giao diện thấy mượt.
3. Thầy thả Comrment: *"Header em căn giữa lại tí nhé, còn lại OK"*. Nhấn **Đánh dấu Hoàn thành (Complete)**. 
4. Lúc này thanh Progress Bar tổng của đồ án nhảy lên `20%`. 

*(Nhiều mốc task cứ lặp đi lặp lại như vậy qua lại giữa thầy và trò cho đến tuần thứ 15 của học kỳ).*

---

## 👨‍⚖️ PHẦN VII: TỔNG KẾT VÀ HẠ MÀN ÁC LIỆT (Quyền Teacher + Sinh Viên)

*Cuối học kỳ, SV in quyển, ra Hội đồng bảo vệ (hoặc thầy hướng dẫn tự chấm nếu quy mô nhỏ).*

### 1. Chấm thi chung kết
1. Thầy Xuân (GV01) đứng ra chấm SV01. 
2. Bạn An (SV01) thuyết trình. 
3. Thầy Xuân dở Laptop, vào Menu: **Chấm điểm (Rubric Grade)**.
4. Chọn tên Em An. Pop-up cái bảng Rubric huyền thoại (Đã tạo ở Phần I - Mục 4) chui ra.
5. Thầy Xuân gõ điểm vào từng ô vuông (Thang 10):
   * Nội dung quyển (30%): Gõ **8**  (-> Có 2.4đ)
   * Source Code (50%): Gõ **9** (-> Có 4.5đ)
   * Thuyết trình (20%): Em An run bần bật, thầy gõ **6** (-> Có 1.2đ)
6. Hệ thống tự cộng con số cuối: **8.1 Điểm Khá**.
7. Thầy Xuân nhập chữ phê bình chung rồi nhấn chuột mạnh vào nút **CHỐT ĐIỂM (FINAL)**.
8. Trạng thái em An: Chuyển sang cờ lê màu xanh rực rỡ **`COMPLETED`**.

### 2. Em An Tốt Nghiệp Vui Vẻ
1. An (`sv001`) nhắm mắt đăng nhập hệ thống lần cuối. 
2. Vào Menu: **Điểm số & Nhận xét**.
3. Tên đồ án đỏ chóe hiện ra: "HT Quản lý KTX...: 8.1 Điểm". Kèm lời chê thuyết trình.
4. An ra trường, xin được việc dev web mảng Vue/React lương 10 củ. Xóa Bookmark trang đồ án nhà trường.

*(Quy trình chính thức đóng băng đối với Học Kỳ 1 2024-2025. Admin chuẩn bị tạo Học Kỳ 2 và lặp lại 1 vòng đời khép kín mới!)*
