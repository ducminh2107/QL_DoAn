# 🚀 HƯỚNG DẪN CHẠY ỨNG DỤNG & TEST LẠI

## **BƯỚC 1: Đảm Bảo MongoDB Chạy**

```bash
# Windows - Mở CMD hoặc PowerShell mới:
mongod
```

Bạn sẽ thấy:

```
MongoDB starting...
[initandlisten] waiting for connections on port 27017
```

---

## **BƯỚC 2: Chạy Backend**

Mở **PowerShell/CMD Terminal thứ 2** (mới):

```bash
cd c:\Users\minh\OneDrive\Desktop\QL_DoAn\backend
npm start
```

Bạn sẽ thấy:

```
🚀 Server is running!
📍 Port: 5000
🔗 MongoDB: ✅ Connected
```

---

## **BƯỚC 3: Chạy Frontend**

Mở **PowerShell/CMD Terminal thứ 3** (mới):

```bash
cd c:\Users\minh\OneDrive\Desktop\QL_DoAn\frontend
npm run dev
```

Bạn sẽ thấy:

```
VITE v... ready in ... ms

➜ Local: http://localhost:3000/
```

---

## **BƯỚC 4: Clear Cache Hoàn Toàn**

1. Mở browser `localhost:3000`
2. Nhấn `F12` (mở DevTools)
3. Chạy trong Console:

```javascript
localStorage.clear();
sessionStorage.clear();
// Xóa tất cả data cũ
```

4. Đóng DevTools (Nhấn F12 lại)

---

## **BƯỚC 5: Đăng Nhập**

Điền:

```
Email: teacher2@test.com
Password: teacher123
```

Click "Đăng Nhập"

---

## **BƯỚC 6: Kiểm Tra Console**

1. Mở DevTools: `F12`
2. Vào tab: `Console`
3. Tìm các dòng:

```
🔍 User loaded from API: {...}
📍 User role: teacher
🔐 ProtectedRoute Check:
   - Role: teacher
✅ Access granted
```

---

## ✅ Nếu Thành Công

Sẽ redirect đến `/teacher` dashboard tự động.

---

## ❌ Nếu Thất Bại

Gửi cho tôi:

1. **Screenshot console** (tất cả các dòng từ lúc đăng nhập)
2. **Error messages** (nếu có)
3. **Backend logs** (terminal backend có gì)

---

## 🔧 Nếu Thấy Lỗi Connection

**Backend không chạy:**

- Mở terminal backend: Nhấn `Ctrl+C`
- Chạy lại: `npm start`

**Frontend không kết nối backend:**

- Kiểm tra Vite proxy config
- Default: `http://127.0.0.1:5000`

**MongoDB không chạy:**

- Mở terminal riêng
- Chạy: `mongod`

---

## 📝 Checklist

- [ ] MongoDB đang chạy (`mongod` chạy trong terminal)
- [ ] Backend chạy trên port 5000 (`npm start`)
- [ ] Frontend chạy trên port 3000 (`npm run dev`)
- [ ] Cache browser đã clear
- [ ] localStorage + sessionStorage clear
- [ ] Đăng nhập bằng `teacher2@test.com`
- [ ] DevTools Console mở để xem logs
- [ ] Kiểm tra role là `"teacher"` (không phải `"student"`)

---

**Làm theo tất cả bước trên và report lại!** 🚀
