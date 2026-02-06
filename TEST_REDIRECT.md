# ⚡ QUICK REFERENCE - Test Auto-Redirect

## 🎯 3 Bước Test

### **Step 1: Clear Cache**

```javascript
F12 → Console → Run:
localStorage.clear()
sessionStorage.clear()
```

### **Step 2: Login**

```
URL: localhost:3000/login
Email: teacher2@test.com
Password: teacher123
Click: Đăng Nhập
```

### **Step 3: Check Result**

```
✅ URL changes to: localhost:3000/teacher
✅ Teacher dashboard displays
✅ No Unauthorized page
✅ No error messages
```

---

## 📊 Expected Console Output

```
Login successful, user role: teacher
Redirecting based on role: teacher
```

Then page changes automatically.

---

## ✅ Success Indicators

- [ ] Logged in successfully
- [ ] URL shows `/teacher`
- [ ] Dashboard displays
- [ ] Sidebar shows teacher menu items
- [ ] Can create/edit/delete topics
- [ ] No Unauthorized page

---

## ❌ If Failed

If still seeing Unauthorized:

1. Hard refresh: `Ctrl+Shift+R`
2. Clear localStorage again: `localStorage.clear()`
3. Check console for errors: `F12`
4. Restart dev server: `npm run dev`

---

## 🚀 How It Works

```
Login Form
    ↓
Check Email/Password
    ↓
Return user with role
    ↓
Check role: teacher?
    ↓
Redirect to /teacher
    ↓
Dashboard Displays ✅
```

---

**That's it!** 🎉
