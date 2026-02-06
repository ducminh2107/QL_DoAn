# 🔧 Hướng Dẫn: Sửa Lỗi "Truy Cập Bị Từ Chối" (Unauthorized)

## 🚨 Vấn Đề

Khi bạn đăng nhập với tài khoản giáo viên, nó lại hiển thị trang **"Truy Cập Bị Từ Chối"** (Unauthorized).

## 🔍 Nguyên Nhân

Tài khoản của bạn có `role: 'student'` nhưng frontend yêu cầu `role: 'teacher'`.

Frontend ProtectedRoute kiểm tra:

```javascript
if (roles.length > 0 && !roles.includes(user.role)) {
  return <Navigate to="/unauthorized" replace />;
}
```

---

## ✅ Giải Pháp (Chọn 1 trong 2 cách)

### **Cách 1: Chạy Seed Script (Nhanh nhất - ✅ Recommended)**

Script này sẽ tạo tài khoản giáo viên test tự động:

**Bước 1:** Mở terminal và vào thư mục backend

```bash
cd c:\Users\minh\OneDrive\Desktop\QL_DoAn\backend
```

**Bước 2:** Chạy seed script

```bash
node scripts/seed-teacher-test-data.js
```

**Bước 3:** Nhập thông tin khi được yêu cầu

```
✅ Tài khoản giáo viên test sẽ được tạo:
   Email: teacher2@test.com
   Mật khẩu: teacher123
   Role: teacher ✅
```

**Bước 4:** Quay lại ứng dụng, đăng xuất, đăng nhập lại bằng:

- **Email:** `teacher2@test.com`
- **Mật khẩu:** `teacher123`

---

### **Cách 2: Cập Nhật Role Trong Database (Manual)**

Nếu bạn muốn cập nhật tài khoản hiện tại thành `'teacher'`:

**Bước 1:** Mở MongoDB Compass hoặc terminal MongoDB

**Bước 2:** Chạy lệnh cập nhật

```javascript
// Update user role to teacher
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "teacher" } }
);
```

Ví dụ:

```javascript
db.users.updateOne(
  { email: "teacher@test.com" },
  { $set: { role: "teacher" } }
);
```

**Bước 3:** Đăng xuất và đăng nhập lại

---

## 🧪 Kiểm Tra Xem Role Đã Cập Nhật Chưa

**Cách 1: Qua DevTools (Browser)**

1. Mở DevTools: Press `F12`
2. Vào Console tab
3. Gõ: `localStorage.getItem('token')` (để kiểm tra token)
4. Nếu muốn xem user info: vào Network → gọi lại trang → tìm request `/api/auth/me` → Response sẽ hiển thị role

**Cách 2: Qua MongoDB**

```javascript
// Kiểm tra role của user
db.users.findOne({ email: "teacher2@test.com" })

// Kết quả sẽ hiển thị:
{
  ...
  role: "teacher",  // ← Phải là "teacher" chứ không phải "student"
  ...
}
```

---

## 📋 Test User Accounts (Sau Khi Seed)

```
👨‍🏫 TEACHER ACCOUNTS

1. teacher2@test.com
   Password: teacher123
   Role: teacher ✅

   (Được tạo bởi seed script)

👨‍🎓 STUDENT ACCOUNT (Nếu cần)

2. student@test.com
   Password: student123
   Role: student

📱 ADMIN ACCOUNT (Nếu cần)

3. admin@test.com
   Password: admin123
   Role: admin
```

---

## 🎯 Workflow Sau Khi Fix

1. ✅ Đăng nhập bằng `teacher2@test.com` / `teacher123`
2. ✅ Frontend kiểm tra `role: 'teacher'` → Cho phép ✅
3. ✅ Redirect tới `/teacher` dashboard
4. ✅ Có thể tạo/sửa/xóa đề tài

---

## 🚀 Kiểm Tra Ngay

**Chạy lệnh này trong terminal backend:**

```bash
node scripts/seed-teacher-test-data.js
```

Sau đó đăng nhập bằng:

- **Email:** `teacher2@test.com`
- **Mật khẩu:** `teacher123`

---

## ❓ Nếu Vẫn Thấy "Unauthorized"

1. **Hard refresh:** `Ctrl+Shift+R` (Windows) hoặc `Cmd+Shift+R` (Mac)
2. **Clear localStorage:**
   - F12 → Application → Local Storage → Clear all
   - F12 → Application → Cookies → Delete all cookies
3. **Đăng nhập lại**
4. Kiểm tra DevTools Console xem có lỗi gì không

---

## 💡 Ghi Chú

- Seed script **không xóa dữ liệu cũ**, chỉ thêm mới
- Nếu `teacher2@test.com` đã tồn tại, script sẽ reuse account đó
- Mật khẩu: `teacher123` được hash trước khi lưu vào database

---

## 📞 Troubleshooting

| Vấn đề                   | Giải pháp                               |
| ------------------------ | --------------------------------------- |
| Seed script không chạy   | Kiểm tra MongoDB đang chạy hay chưa     |
| Vẫn thấy Unauthorized    | Hard refresh + Clear cache              |
| Lỗi "Cannot find module" | Chạy `npm install` trong backend folder |
| Forgot password          | Kiểm tra `teacher123` hay `teacher`     |

---

_Sau khi fix xong, bạn sẽ có toàn quyền truy cập vào giao diện teacher!_ ✅
