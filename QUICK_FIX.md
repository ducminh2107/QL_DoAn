# 🔨 Giải Quyết Nhanh: Unauthorized Error

## ⏱️ 3 Bước (2 phút)

### **Bước 1:** Mở PowerShell

```
Nhấn: Windows + R
Gõ: powershell
Nhấn: Enter
```

### **Bước 2:** Chạy seed script

```powershell
cd C:\Users\minh\OneDrive\Desktop\QL_DoAn\backend
node scripts/seed-teacher-test-data.js
```

**Kết quả mong đợi:**

```
📦 Connected to database for seeding teacher test data...
✅ Tài khoản giáo viên test sẽ được tạo hoặc reuse
```

### **Bước 3:** Đăng nhập lại bằng tài khoản này

```
Email: teacher2@test.com
Password: teacher123
```

---

## ✅ Nếu Thành Công

Sau khi đăng nhập:

- ✅ Sẽ redirect đến `/teacher` dashboard
- ✅ Có thể tạo/sửa/xóa đề tài
- ✅ Giao diện teacher sẽ hiển thị bình thường

---

## 🆘 Nếu Vẫn Lỗi

1. **Clear cache browser:**

   - Nhấn `Ctrl+Shift+R` (full hard refresh)
   - Hoặc: F12 → Application → Clear all

2. **Đăng xuất hoàn toàn:**

   - F12 → Application → Local Storage → Delete all
   - F12 → Application → Cookies → Delete all
   - Reload trang

3. **Đăng nhập lại** bằng `teacher2@test.com`

---

## 💾 Dữ Liệu Seed

Seed script sẽ tạo:

- ✅ Teacher account (`teacher2@test.com`)
- ✅ Test topics
- ✅ Test categories
- ✅ Registration periods
- ✅ Majors

Tất cả dữ liệu test sẽ sẵn sàng để sử dụng!

---

**Xong! Bạn sẽ có tài khoản giáo viên hoàn chỉnh để test.** ✅
