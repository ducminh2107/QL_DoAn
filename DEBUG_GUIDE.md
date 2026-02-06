# 🔍 Debug: Kiểm Tra Vấn Đề Unauthorized

## Hướng Dẫn Debug Bước-By-Bước

### **Bước 1:** Mở DevTools (F12)

### **Bước 2:** Mở Console tab

### **Bước 3:** Đăng xuất hoàn toàn

```javascript
// Chạy lệnh này trong Console:
localStorage.clear();
location.reload();
```

### **Bước 4:** Đăng nhập lại bằng:

```
Email: teacher2@test.com
Password: teacher123
```

### **Bước 5:** Xem Console để kiểm tra logs

Bạn sẽ thấy các dòng như:

```
🔍 User loaded from API: {...}
📍 User role: teacher

🔐 ProtectedRoute Check:
   - Loading: false
   - Authenticated: true
   - User: {...}
   - Required roles: ["teacher"]
   - User role: teacher
```

---

## 🎯 Kiểm Tra Gì?

1. **User role có phải "teacher" không?**

   - Phải là: `"teacher"` (không phải `"student"`)

2. **ProtectedRoute có nhận đúng role không?**

   - Phải có log: `✅ Access granted`

3. **Nếu thấy:** `❌ Role mismatch`
   - Tức là user role không phải "teacher"

---

## ❌ Nếu Vẫn Thấy Unauthorized

Thực hiện các bước này:

### **Step 1:** Hard refresh

```
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)
```

### **Step 2:** Clear tất cả cache

```javascript
// Chạy trong Console:
localStorage.clear();
sessionStorage.clear();

// Sau đó reload:
location.reload();
```

### **Step 3:** Kiểm tra Backend

Xem error logs backend (nếu có):

```
cd c:\Users\minh\OneDrive\Desktop\QL_DoAn\backend
npm start
```

Kiểm tra xem `/api/auth/me` có hoạt động không:

```
Mở browser tab mới:
localhost:5000/api/auth/me

(Nó sẽ 401 vì không có token, nhưng ít nhất server đang chạy)
```

### **Step 4:** Kiểm tra Database

```javascript
// Chạy trong terminal backend:
node scripts/check-user-role.js
```

Kết quả phải là:

```
✅ Role is "teacher" - Should have access!
```

---

## 🚨 Các Lỗi Phổ Biến

| Lỗi                    | Nguyên Nhân                  | Giải Pháp                           |
| ---------------------- | ---------------------------- | ----------------------------------- |
| ❌ "Role is 'student'" | Tài khoản không phải teacher | Chạy `check-user-role.js` để update |
| ❌ "User: null"        | Token invalid/expired        | Clear localStorage + đăng nhập lại  |
| ❌ "Loading: true"     | Đang fetch user data         | Đợi một chút rồi kiểm tra lại       |

---

## 📸 Expected Console Output

Nếu mọi thứ OK, console sẽ hiển thị:

```
🔍 User loaded from API: {
  _id: "...",
  email: "teacher2@test.com",
  user_name: "Dr. Tran Thi B",
  role: "teacher",      ← QUAN TRỌNG!
  ...
}
📍 User role: teacher

🔐 ProtectedRoute Check:
   - Loading: false
   - Authenticated: true
   - User: {...}
   - Required roles: ["teacher"]
   - User role: teacher
✅ Access granted
```

---

## 💡 Ghi Chú

- Debug logs được thêm vào `/api/auth/me` loadUser và ProtectedRoute
- Bạn sẽ thấy tất cả các bước check trong Console
- Nếu có lỗi, logs sẽ giúp xác định vấn đề chính xác

---

**Hãy thực hiện debug steps này và screenshot console để tôi có thể giúp tiếp!**
