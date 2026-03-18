# 🎓 Hệ Thống Quản Lý Đồ Án Tốt Nghiệp (Thesis Management System)

![MERN Stack](https://img.shields.io/badge/MERN-Stack-blue?style=for-the-badge&logo=mongodb)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Nodejs](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)
![MUI](https://img.shields.io/badge/Material--UI-v5-007FFF?style=for-the-badge&logo=mui)

Một ứng dụng web toàn diện được xây dựng bằng **MERN Stack** (MongoDB, Express.js, React.js, Node.js) nhằm hỗ trợ các trường Đại học/Cao đẳng quản lý toàn bộ vòng đời của Đồ án tốt nghiệp / Khóa luận tốt nghiệp một cách số hóa, chuyên nghiệp và bảo mật.

---

## ✨ Tính năng nổi bật

Hệ thống cung cấp trải nghiệm chuyên biệt và luồng nghiệp vụ chặt chẽ cho 3 nhóm người dùng:

### 👨‍🎓 1. Phân hệ Sinh viên (Student)
- **Khám phá & Tìm kiếm đề tài**: Xem danh sách các đề tài đã được phê duyệt từ giảng viên.
- **Đăng ký & Đề xuất đồ án**: Gửi yêu cầu đăng ký đề tài có sẵn hoặc tự đề xuất đề tài mới lên Hội đồng.
- **Quản lý tiến độ (Milestones)**: Theo dõi lộ trình làm đồ án, lịch nhắc nhở nộp báo cáo tiến độ tuần/tháng.
- **Tương tác**: Nhận phản hồi định kỳ và hướng dẫn từ Giảng viên hướng dẫn trực tiếp.
- **Xem kết quả & Rubric**: Xem điểm số chi tiết được đánh giá theo từng tiêu chí (Rubric) minh bạch.

### 👨‍🏫 2. Phân hệ Giảng viên (Teacher)
- **Đề xuất đề tài**: Khởi tạo và gửi đề tài mới lên bộ môn/khoa chờ duyệt trước mỗi đợt đăng ký.
- **Kiểm duyệt Sinh viên**: Tiếp nhận, xem xét thông tin và phê duyệt/từ chối yêu cầu đăng ký đồ án của sinh viên.
- **Theo dõi tiến độ**: Quản lý nhóm sinh viên mình hướng dẫn, theo dõi % hoàn thành báo cáo tiến độ.
- **Chấm điểm**: Đánh giá kết quả đồ án dựa trên bộ tiêu chí (Rubric) chuẩn hóa của nhà trường.

### 👑 3. Phân hệ Quản trị viên (Admin)
- **Quản lý Hệ thống & Tài khoản**: Import/Export hàng loạt tài khoản (Sinh viên, Giảng viên) qua Excel. Quản lý Khoa, Chuyên ngành.
- **Quản lý Mốc thời gian (Registration Periods)**: Cấu hình Thiết lập Học kỳ và các Đợt đăng ký đồ án tự động đóng/mở.
- **Kiểm duyệt Đề tài**: Phê duyệt các đề tài do giảng viên đề xuất trước khi công bố rộng rãi cho sinh viên.
- **Thiết lập Rubric**: Tạo và quản lý các thang điểm/tiêu chí đánh giá chuẩn.
- **Quản lý Hội đồng**: Thành lập hội đồng bảo vệ, phân công Giảng viên phản biện & Chủ tịch hội đồng.

---

## 🔐 Tài khoản Demo (Seeded Data)

Hệ thống đi kèm dữ liệu mẫu giúp bạn trải nghiệm ngay lập tức. Mật khẩu mặc định tuân theo quy tắc: `{USER_ID}@2026`.

| Vai trò | Định dạng Email | Dữ liệu Mẫu (Demo) | Mật khẩu Demo |
|---------|----------------|--------------------|--------------|
| **Admin** | `@qtv.tdmu.vn` | `admin001@qtv.tdmu.vn` | `ADMIN001@2026` |
| **Giảng viên**| `@gv.tdmu.vn` | `teach001@gv.tdmu.vn` | `TEACH001@2026` |
| **Sinh viên** | `@student.tdmu.edu.vn` | `stu001@student.tdmu.edu.vn` | `STU001@2026` |

> *Có sẵn khoảng 40 tài khoản test khác từ `stu002` đến `stu021`.*

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

### 🎨 Frontend (UI/UX)
- **React 18** (đóng gói bằng Vite cho tốc độ build siêu tốc)
- **Material-UI (MUI v5)**: Thư viện Component hiện đại, thiết kế Responsive chuẩn Material Design.
- **Font chữ**: Sử dụng **Be Vietnam Pro** tối ưu sắc nét cho tiếng Việt.
- **Axios & React Router DOM v6**: Xử lý gọi API và quản lý điều hướng.
- **Context API**: Quản lý State toàn cục (Authentication, Theme).

### ⚙️ Backend (API & Logic)
- **Node.js & Express.js**: Xây dựng kiến trúc RESTful API chặt chẽ.
- **MongoDB & Mongoose**: Cơ sở dữ liệu NoSQL với các Schema ràng buộc dữ liệu nghiêm ngặt.
- **Cookie & JWT Authentication**: Bảo mật đăng nhập với HTTP-only Cookie để chống XSS.
- **Helmet & CORS & Express Rate Limit**: Các lớp khiên bảo vệ hệ thống khỏi các đợt tấn công phổ biến.
- **Bcrypt.js**: Mã hóa hash mật khẩu một chiều an toàn 100%.
- **Jest & Supertest**: Bao phủ Unit Test và Integration Test cho toàn bộ luồng nghiệp vụ API quan trọng.

---

## 🚀 Hướng dẫn Cài đặt & Chạy cục bộ (Local Setup)

### Yêu cầu hệ thống môi trường
- **Node.js** (v18 trở lên)
- **MongoDB** (Local `localhost:27017` hoặc MongoDB Atlas)

### Các bước cài đặt chi tiết

**1. Clone kho lưu trữ**
```bash
git clone https://github.com/your-username/QL_DoAn.git
cd QL_DoAn
```

**2. Cài đặt và cấu hình Backend**
```bash
cd backend
npm install
```
Tạo file `.env` trong thư mục `backend/` dựa trên `.env.example`:
```env
PORT=5000
MONGODB_CONNECTIONSTRING=mongodb://localhost:27017/thesis_management # Hoặc URL Atlas
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```
**Nạp dữ liệu mẫu (Seed Database):** (Tạo danh sách khoa, ngành, admin, và 40 tài khoản test)
```bash
npm run seed
```
**Khởi chạy Backend:**
```bash
npm run dev
# Server sẽ chạy tại http://localhost:5000
```

**3. Khởi chạy Frontend**
Mở một terminal mới:
```bash
cd frontend
npm install
npm run dev
# Vite server sẽ chạy tại http://localhost:3000
```

---

## 🧪 Hệ thống Kiểm thử (Testing)

Dự án bao gồm hàng loạt bài test tự động cho cả 3 phân hệ, đảm bảo không có Regex Injection, Race Condition hay N+1 Query.

Để chạy bộ Test API ở Backend:
```bash
cd backend
npm run test:all -- --runInBand
```

---

## 📂 Kiến trúc Thư mục

Mô hình thiết kế tập trung vào sự rõ ràng và dễ dàng bảo trì quy mô vừa & nhỏ:

```text
QL_DoAn/
├── backend/
│   ├── scripts/     # Các script setup DB / Database Seeder
│   ├── src/
│   │   ├── config/  # Kết nối MongoDB, các hằng số
│   │   ├── controllers/ # Chứa logic xử lý của từng chức năng Role
│   │   ├── middleware/# Xác thực JWT, Xử lý lỗi, Phân quyền
│   │   ├── models/  # Mongoose Schemas (User, Topic, Scoreboard...)
│   │   ├── routes/  # Khai báo các Endpoint API
│   │   └── server.js# Điểm khởi chạy Express Server
│   └── tests/       # Unit & Integration tests bằng Jest
└── frontend/
    └── src/
        ├── assets/  # Hình ảnh tĩnh, CSS toàn cục
        ├── components/# Các UI component dùng lại chung
        ├── contexts/ # React Context (AuthContext)
        ├── pages/   # Giao diện chính phân theo Role (admin, student, teacher)
        └── App.jsx  # Root Router Layout
```

---

## 📝 Giấy phép (License)
Dự án được phân phối dưới giấy phép MIT. Phù hợp cho mục đích giáo dục, bảo vệ đồ án và ứng dụng thực tiễn tại nhà trường.
