# 🔍 DEBUG "Failed to Fetch" - Hướng dẫn từng bước

## 📋 Tôi đã thêm debug logs - Làm theo các bước sau:

### **Bước 1: Commit và Push code**
```bash
git add .
git commit -m "Add debug logs for API calls"
git push origin master
```

### **Bước 2: Đợi OnRender redeploy**
- Vào OnRender Dashboard → Frontend Service
- Chờ status chuyển thành "Live" (màu xanh)

### **Bước 3: Test và xem logs**
1. Vào https://quanlydoan-monhoc.onrender.com
2. Mở Developer Tools (F12)
3. Vào tab **Console**
4. Thử đăng nhập
5. Xem các logs debug:

```
🔍 Debug Environment:
- NODE_ENV: production
- REACT_APP_API_URL: undefined (hoặc URL nào đó)
✅ Using production fallback (hoặc Using REACT_APP_API_URL)
🌐 Final API Base URL: https://...
🌐 Testing URL: https://...
🔐 Attempting login to: https://...
```

### **Bước 4: Kiểm tra Network Tab**
1. F12 → **Network** tab
2. Thử đăng nhập
3. Tìm request `/auth/login`
4. Xem:
   - **Status**: 200 OK, 404, 500, hoặc Failed?
   - **URL**: Có đúng không?
   - **Response**: Có data gì?

## 🚨 **Các trường hợp có thể xảy ra:**

### **Case 1: Backend URL sai**
```
❌ Failed to parse response as JSON: TypeError: Failed to fetch
```
**Fix**: Thay URL trong `frontend/src/config/api.js` line 18

### **Case 2: Backend chưa deploy**
```
📡 Response status: 404 Not Found
```
**Fix**: Deploy backend trước

### **Case 3: CORS Error**
```
Access to fetch at '...' has been blocked by CORS policy
```
**Fix**: Cấu hình `FRONTEND_URL` trong backend

### **Case 4: Backend sleep (OnRender free tier)**
```
📡 Response status: 503 Service Unavailable
```
**Fix**: Đợi 30-60 giây để backend wake up

## 📝 **Sau khi xem logs, báo cáo cho tôi:**

1. **Console logs** - Copy paste tất cả logs debug
2. **Network tab** - Screenshot hoặc mô tả request/response
3. **URL backend thực tế** - Nếu bạn đã có

## 🔧 **Quick Fix Options:**

### **Option A: Sử dụng Environment Variable**
Vào OnRender → Frontend Service → Environment:
```
REACT_APP_API_URL=https://YOUR_REAL_BACKEND_URL.onrender.com/api
```

### **Option B: Hardcode URL**
Sửa file `frontend/src/config/api.js` line 18:
```javascript
return 'https://YOUR_REAL_BACKEND_URL.onrender.com/api';
```

---

**🎯 Mục tiêu: Tìm ra chính xác URL backend và lý do tại sao fetch bị fail**
