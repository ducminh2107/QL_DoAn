# 🎓 Hệ Thống Quản Lý Đồ Án Tốt Nghiệp (Thesis Management System)

Một ứng dụng web toàn diện được xây dựng bằng **MERN Stack** (MongoDB, Express.js, React.js, Node.js) nhằm hỗ trợ các trường Đại học/Cao đẳng quản lý toàn bộ vòng đời của đồ án tốt nghiệp, từ khâu đề xuất đề tài đến khâu chấm điểm cuối cùng.

---

## ✨ Tính năng nổi bật

Hệ thống cung cấp trải nghiệm chuyên biệt cho 3 nhóm người dùng:

### 👨‍🎓 1. Sinh viên (Student)
- **Khám phá đề tài**: Xem danh sách các đề tài đã được phê duyệt từ nhiều giảng viên.
- **Đăng ký đồ án**: Gửi yêu cầu đăng ký đề tài (hoặc tự đề xuất đề tài mới).
- **Quản lý tiến độ**: Theo dõi lộ trình làm đồ án, lịch nhắc nhở nộp báo cáo (cảnh báo deadline "Gấp").
- **Giao tiếp**: Nhận phản hồi định kỳ từ giảng viên hướng dẫn.
- **Xem kết quả**: Xem điểm số và đánh giá chi tiết theo từng tiêu chí (rubric).

### 👨‍🏫 2. Giảng viên (Teacher)
- **Đề xuất đề tài**: Tạo mới đề tài gửi lên bộ môn/khoa chờ duyệt.
- **Duyệt sinh viên**: Tiếp nhận và phê duyệt/từ chối yêu cầu đăng ký đồ án của sinh viên.
- **Theo dõi tiến độ**: Quản lý nhóm sinh viên hướng dẫn, nhận báo cáo tiến độ.
- **Chấm điểm**: Đánh giá kết quả đồ án dựa trên bộ tiêu chí (Rubric) được nhà trường quy định.

### 👑 3. Quản trị viên (Admin)
- **Quản lý hệ thống**: Quản lý tài khoản (Sinh viên, Giảng viên), Khoa, Chuyên ngành.
- **Quản lý thời gian**: Thiết lập Học kỳ và các Đợt đăng ký đồ án.
- **Kiểm duyệt**: Phê duyệt các đề tài do giảng viên đề xuất trước khi công bố cho sinh viên.
- **Thiết lập Rubric**: Tạo và quản lý các thang điểm/tiêu chí đánh giá chuẩn.
- **Quản lý Hội đồng**: Thành lập hội đồng bảo vệ, phân công giảng viên chấm thi.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

### 🎨 Frontend
- **React 18** (Vite)
- **Material-UI (MUI)**: Xây dựng giao diện hiện đại, responsive.
- **React Router DOM v6**: Quản lý điều hướng (Routing).
- **Axios**: Kết nối API với backend.
- **Context API**: Quản lý State toàn cục (Authentication).

### ⚙️ Backend
- **Node.js & Express.js**: Xây dựng RESTful API chuẩn.
- **MongoDB & Mongoose**: Cơ sở dữ liệu NoSQL lưu trữ linh hoạt.
- **JWT (JSON Web Token)**: Xác thực, trao đổi cấp quyền truy cập.
- **Bcrypt.js**: Mã hóa mật khẩu bảo mật an toàn.

---

## 🚀 Hướng dẫn cài đặt chạy cục bộ (Local Setup)

### Yêu cầu hệ thống
- **Node.js** (v16 trở lên)
- **MongoDB** (Cài đặt cục bộ hoặc sử dụng MongoDB Atlas)
- **Git**

### Các bước cài đặt

**1. Clone kho lưu trữ**
```bash
git clone https://github.com/your-username/QL_DoAn.git
cd QL_DoAn
```

**2. Cài đặt biến môi trường**
Trong thư mục `backend/`, copy file `.env.example` thành `.env` (hoặc tạo file mới) và điền các thông tin:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/thesis-management
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
NODE_ENV=development
```

**3. Khởi chạy Backend**
```bash
cd backend
npm install
npm run dev
# Server sẽ chạy tại http://localhost:5000
```

**4. Khởi chạy Frontend**
```bash
# Mở một terminal mới
cd frontend
npm install
npm run dev
# Vite server sẽ chạy tại http://localhost:5173 (hoặc port tương tự)
```

---

## 📂 Kiến trúc thư mục (Folder Structure)
Dự án được cấu trúc theo mô hình phân tách thư mục chuẩn cho MERN stack nhằm tối ưu hoá khả năng mở rộng. Chi tiết xem tại file [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 📝 Giấy phép (License)
Dự án được phân phối dưới giấy phép MIT. Phù hợp cho mục đích giáo dục, nghiên cứu mở và ứng dụng thực tiễn tại các tổ chức.
