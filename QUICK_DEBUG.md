# ⚡ Cách Khắc Phục Nhanh Nhất

## 🎯 Làm 5 Bước Này:

### **1. Xóa Tất Cả Cache Browser**

Mở browser:

- Nhấn: `F12` (mở DevTools)
- Nhấn: `Ctrl+Shift+Delete` (mở Clear browsing data)
- Chọn:
  - ☑️ Cookies and other site data
  - ☑️ Cached images and files
- Click: "Clear data"

### **2. Quay Lại App và Đăng Xuất**

Tại trang `/unauthorized`:

- Click: "Quay lại" hoặc vào `localhost:3000`
- Nếu có menu: Click logout (Đăng xuất)

### **3. Mở DevTools Console**

- Nhấn: `F12`
- Vào tab: "Console"
- Chạy lệnh này:

```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### **4. Đăng Nhập Lại**

Dùng tài khoản này:

```
📧 Email: teacher2@test.com
🔐 Password: teacher123
```

### **5. Kiểm Tra Console**

Sau khi đăng nhập, nhìn vào Console và tìm các dòng:

✅ Nếu bạn thấy:

```
🔍 User loaded from API: {...}
📍 User role: teacher
✅ Access granted
```

→ **Tức là thành công!**

❌ Nếu bạn thấy:

```
❌ Role mismatch - required: ["teacher"] but user has: "student"
```

→ Tài khoản không phải teacher

---

## 🆘 Nếu Vẫn Thất Bại

**Hãy chụp ảnh Console và gửi cho tôi!**

Tôi cần thấy:

1. Screenshot của console sau khi đăng nhập
2. Lỗi gì đang hiển thị
3. Role là gì (student hay teacher)

---

## 💾 Lệnh Chạy Lại (Nếu Cần)

Nếu muốn reset toàn bộ:

```bash
# Terminal 1: Backend
cd c:\Users\minh\OneDrive\Desktop\QL_DoAn\backend
npm start

# Terminal 2: Frontend (khác)
cd c:\Users\minh\OneDrive\Desktop\QL_DoAn\frontend
npm run dev
```

Sau đó:

1. Mở: `localhost:3000`
2. Clear cache browser
3. Đăng nhập: `teacher2@test.com` / `teacher123`

---

**Thực hiện 5 bước trên ngay bây giờ!** ⏰
