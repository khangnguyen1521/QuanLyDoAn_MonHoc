# 🔐 Automatic Session Management - Limit 10 Sessions per User

## ✅ Đã triển khai thành công!

### 🎯 **Tổng quan:**
- **Limit**: Tối đa 10 sessions active per user
- **Auto Cleanup**: Tự động xóa sessions cũ khi vượt quá limit
- **Schedule**: Cleanup mỗi giờ + khi login mới
- **Strategy**: Keep newest sessions, revoke oldest ones

---

## 🏗️ **Implementation Details**

### **1. Session Model Enhancement (`Session.js`)**
```javascript
// New static method
cleanupOldUserSessions(userId, maxSessions = 10)
```

**Logic:**
1. Get all active sessions của user (sorted by lastUsedAt DESC)
2. Nếu > 10 sessions → revoke sessions cũ nhất
3. Keep 10 sessions mới nhất
4. Log detailed information

### **2. Auth Controller Integration (`authController.js`)**
```javascript
// Trong createTokenResponse():
await Session.cleanupOldUserSessions(user._id, 10);
// Sau đó tạo session mới
```

**Trigger:** Mỗi khi user login/register → auto cleanup

### **3. Scheduled Cleanup (`sessionCleanup.js`)**
```javascript
startSessionCleanup(10); // Max 10 sessions per user
```

**Schedule:**
- **Immediate**: Chạy ngay khi server start
- **Hourly**: Mỗi giờ cleanup toàn bộ system
- **Per User**: Cleanup khi có login mới

### **4. API Endpoints**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/auth/sessions` | Lấy danh sách sessions |
| `DELETE` | `/api/auth/sessions/:id` | Revoke session cụ thể |
| `POST` | `/api/auth/logout-all` | Revoke tất cả sessions |

---

## 🔄 **Workflow**

### **Scenario 1: User Login (Normal)**
```
1. User có 8 active sessions
2. User login mới → cleanupOldUserSessions(userId, 10)
3. 8 < 10 → No cleanup needed
4. Tạo session mới → Total: 9 sessions
```

### **Scenario 2: User Login (Cleanup Triggered)**
```
1. User có 10 active sessions
2. User login mới → cleanupOldUserSessions(userId, 10)
3. 10 = 10 → No cleanup (at limit)
4. Tạo session mới → Total: 11 sessions
5. Next cleanup cycle → revoke 1 oldest → Back to 10
```

### **Scenario 3: User Login (Multiple Devices)**
```
1. User có 12 active sessions (somehow)
2. User login mới → cleanupOldUserSessions(userId, 10)
3. 12 > 10 → Revoke 2 oldest sessions
4. Remaining: 10 sessions
5. Tạo session mới → Total: 11 sessions
6. Next cleanup → Back to 10
```

---

## 📊 **Monitoring & Logging**

### **Console Logs:**
```
👤 User 507f1f77bcf86cd799439011 has 12 active sessions
🗑️ Revoking old session: 507f1f77bcf86cd799439012 (last used: 2024-01-10T10:30:00.000Z)
🗑️ Revoking old session: 507f1f77bcf86cd799439013 (last used: 2024-01-09T15:20:00.000Z)
🧹 Revoked 2 old sessions for user 507f1f77bcf86cd799439011
⏰ Session cleanup scheduler started - running every hour (max 10 sessions per user)
```

### **Hourly Cleanup:**
```
🧹 Starting cleanup of old sessions (max 10 per user)...
🧹 Completed session cleanup: 15 old sessions revoked across 25 users
```

---

## ⚙️ **Configuration**

### **Customizable Settings:**
```javascript
// In server.js
startSessionCleanup(10); // Change limit here

// In authController.js  
await Session.cleanupOldUserSessions(user._id, 10); // Change limit here
```

### **Environment Variables** (Optional):
```env
# Add to .env if you want configurable limit
MAX_SESSIONS_PER_USER=10
SESSION_CLEANUP_INTERVAL_HOURS=1
```

---

## 🎯 **Benefits**

### **Security:**
- ✅ **Prevent Session Bloat**: Không để user tích lũy quá nhiều sessions
- ✅ **Auto Security**: Tự động revoke sessions cũ không dùng
- ✅ **Attack Prevention**: Hạn chế session hijacking risks

### **Performance:**
- ✅ **Database Efficiency**: Ít session records hơn
- ✅ **Memory Usage**: Reduced server memory usage
- ✅ **Query Performance**: Faster session lookups

### **User Experience:**
- ✅ **Transparent**: User không biết cleanup đang diễn ra
- ✅ **Keep Active**: Giữ lại sessions đang sử dụng
- ✅ **Smart Cleanup**: Xóa theo thứ tự lastUsedAt

---

## 🧪 **Testing**

### **Test Scenario:**
1. **Login 15 lần** từ different devices/browsers
2. **Check logs** → Should see cleanup after 10th login
3. **Verify database** → Only 10 active sessions remain
4. **Test functionality** → All 10 sessions work normally

### **Manual Cleanup Test:**
```javascript
// In MongoDB shell
use financial_management
db.sessions.find({userId: ObjectId("USER_ID"), revoked: false}).count()
// Should be <= 10
```

### **API Test:**
```bash
# Get user sessions
curl -H "Authorization: Bearer TOKEN" http://localhost:5000/api/auth/sessions

# Should return max 10 sessions
```

---

## 🔍 **Monitoring Commands**

### **Check Session Counts:**
```javascript
// MongoDB shell
db.sessions.aggregate([
  { $match: { revoked: false, expiresAt: { $gt: new Date() } } },
  { $group: { _id: "$userId", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

### **Find Users with Too Many Sessions:**
```javascript
db.sessions.aggregate([
  { $match: { revoked: false, expiresAt: { $gt: new Date() } } },
  { $group: { _id: "$userId", count: { $sum: 1 } } },
  { $match: { count: { $gt: 10 } } }
])
```

---

## 🎉 **Result**

**Before**: 
- ❌ Unlimited sessions per user
- ❌ No automatic cleanup
- ❌ Potential security risks

**After**:
- ✅ **Max 10 sessions per user**
- ✅ **Automatic cleanup** khi login và hourly
- ✅ **Smart session management**
- ✅ **Enhanced security**
- ✅ **Better performance**

**Session management giờ đã được tối ưu hóa và bảo mật! 🔒🎊**
