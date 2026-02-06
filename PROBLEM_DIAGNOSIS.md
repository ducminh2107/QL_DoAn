# 🔴 VẤNĐỀ: Unauthorized Vẫn Hiển Thị

## 📋 Tình Huống Hiện Tại

1. ✅ Backend database: `teacher2@test.com` có `role: "teacher"`
2. ✅ Seed script chạy thành công
3. ❌ Nhưng frontend vẫn hiển thị Unauthorized

## 🔍 Nguyên Nhân Có Thể

### **Khả Năng 1: Token không được refresh**

- Frontend lưu token cũ (khi role là student)
- Cần clear cache + đăng nhập lại

### **Khả Năng 2: Frontend chưa rebuild**

- Dev server vẫn dùng code cũ
- Cần restart `npm run dev`

### **Khả Năng 3: API /me trả về dữ liệu cũ**

- Token cũ vẫn tham chiếu user cũ
- Clear cache + đăng nhập lại sẽ fix

### **Khả Năng 4: Axios caching**

- Browser cache HTTP response
- Cache headers middleware sẽ fix

## ✅ CÁC BƯỚC FIX (Thứ Tự Ưu Tiên)

### **FIX 1: Clear Cache + Đăng Nhập Lại (PRIORITY 1)**

```javascript
// F12 → Console → Chạy:
localStorage.clear();
sessionStorage.clear();
location.reload();

// Sau đó đăng nhập: teacher2@test.com / teacher123
```

---

### **FIX 2: Restart Frontend Dev Server (PRIORITY 2)**

Terminal frontend:

```bash
# Nhấn Ctrl+C (để dừng)
npm run dev
```

Mở lại browser: `localhost:3000`

---

### **FIX 3: Check Backend Logs (PRIORITY 3)**

Terminal backend sẽ hiển thị:

```
🔍 DEBUG: /api/auth/me endpoint called
   User role: teacher
```

Nếu không thấy, tức là `/api/auth/me` không được gọi.

---

### **FIX 4: Check Token Validity (PRIORITY 4)**

```javascript
// F12 → Console:
token = localStorage.getItem("token");
// Copy token này, decode tại jwt.io
```

Kiểm tra:

- `exp` (expiry time) - có hết hạn không?
- `iat` (issued at) - mới không?

---

## 🎯 NGAY BÂY GIỜ HÃY:

### **Bước 1:**

```javascript
// F12 → Console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### **Bước 2:**

Đăng nhập lại: `teacher2@test.com` / `teacher123`

### **Bước 3:**

Giữ F12 mở và nhìn vào Console, tìm:

```
🔍 User loaded from API: {...}
📍 User role: teacher
```

---

## 📸 Gửi Cho Tôi:

Nếu vẫn thất bại, hãy gửi:

1. **Screenshot Console** (tất cả logs)
2. **Nội dung của localstorage** (chạy: `localStorage`)
3. **URL hiện tại** (cái gì hiển thị trong address bar)

---

## 🚀 QUICK START LẠI TỪ ĐẦU:

```bash
# Terminal 1: MongoDB
mongod

# Terminal 2: Backend
cd backend
npm start

# Terminal 3: Frontend
cd frontend
npm run dev

# Browser:
# 1. Mở http://localhost:3000
# 2. F12 → Console → localStorage.clear()
# 3. Reload: F5
# 4. Đăng nhập: teacher2@test.com / teacher123
```

---

**Làm ngay các bước này và report lại kết quả!** ⏰
