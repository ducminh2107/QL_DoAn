# 🏗️ Kiến trúc dự án (Architecture & Folder Structure)

Dự án **Hệ Thống Quản Lý Đồ Án Tốt Nghiệp** áp dụng mô hình kiến trúc phân tách rõ ràng giữa Frontend và Backend. 

## 1. Môi trường Frontend (`/frontend`)

Được khởi tạo bằng **React (Vite)**, cung cấp hiệu suất cao và giao diện người dùng dựa trên **Material-UI**.

```text
frontend/
├── src/
│   ├── assets/           # Chứa hình ảnh tĩnh, icons hoặc css
│   ├── components/       # Các UI Component dùng chung
│   │   ├── common/       # Button, Table tĩnh, Modal dùng chung
│   │   └── layout/       # MainLayout, AdminLayout, Sidebar, Navbar
│   ├── contexts/         # React Context API (AuthContext...)
│   ├── pages/            # Chứa các màn hình (screens) của ứng dụng
│   │   ├── admin/        # Màn hình riêng cho Quản trị viên
│   │   ├── student/      # Màn hình riêng cho Sinh viên
│   │   ├── teacher/      # Màn hình riêng cho Giảng viên
│   │   ├── auth/         # Login, Quên mật khẩu
│   │   └── Dashboard.jsx # Trang điều hướng trung gian
│   ├── App.jsx           # Root component, cấu hình Theme
│   ├── main.jsx          # Entry point
│   └── routes.jsx        # File cấu hình React Router tổng
├── index.html            # File HTML gốc
└── vite.config.js        # Cấu hình Vite / Proxy kết nối Backend
```

## 2. Môi trường Backend (`/backend`)

Theo mô hình **MVC (Model-View-Controller)** cổ điển nhưng tập trung trả về dữ liệu API (RESTful API).

```text
backend/
├── src/
│   ├── config/           # Cấu hình database, environment
│   ├── controllers/      # Logic xử lý HTTP request / response
│   │   ├── admin/        # Xử lý logic nghiệp vụ cho Admin
│   │   ├── student/      # Xử lý logic nghiệp vụ cho Student
│   │   ├── teacher/      # Xử lý logic nghiệp vụ cho Teacher
│   │   └── auth.controller.js # Xử lý Đăng nhập, JWT Token
│   ├── middleware/       # Lớp chắn trung gian (bảo mật, uỷ quyền)
│   │   ├── auth.js       # Xác thực Token, Role bảo vệ route
│   │   └── error.js      # Global Error Handler cục bộ
│   ├── models/           # Định nghĩa Mongoose Schema (MongoDB)
│   │   ├── User.js
│   │   ├── Topic.js
│   │   ├── Registration.js
│   │   └── ...
│   ├── routes/           # Định tuyến API (Endpoints)
│   │   ├── index.js      # Root router gộp toàn bộ
│   │   ├── admin/...     
│   │   └── ...
│   ├── validations/      # Validate dữ liệu đầu vào sử dụng Joi
│   └── index.js          # File khởi chạy Server Express chính
├── .env.example          # Template biến môi trường
└── package.json
```

## 3. Luồng bảo mật & Xác thực (Auth Flow)
- Client (Frontend) gửi form `/login`.
- Backend kiểm tra tài khoản, trả về: `accessToken` (kèm thông tin user) và lưu `refreshToken` dưới dạng **httpOnly Cookie**.
- Frontend lưu cấu hình `accessToken` vào Context / Localstorage. Mọi request gửi lên Backend đều phải đính kèm Header: `Authorization: Bearer <accessToken>`.
- **Axios Interceptor** phía Frontend sẽ tự động kiểm tra nếu Token hết hạn (401), nó sẽ tự động dùng Cookie gửi request lên `/refresh-token` để cấp mới Token ngầm, giúp UX không bị gián đoạn.

## 4. Phân Quyền (Role-Based Access)
Frontend dùng `<ProtectedRoute>` bọc quanh các `<Route />`.
- Tuỳ vào tham số `roles={['admin', 'teacher']}`, React Router sẽ kiểm tra.
- Tại Backend, middleware `authorize()` chặn mọi request không thoả mãn role ở tầng Endpoint. Mọi thao tác đều được bảo vệ kép.
