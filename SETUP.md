# Hướng dẫn Setup MongoDB Authentication

## 📋 Các file đã được tạo

### Backend Files:
- `backend/env.example` - Template file môi trường
- `backend/src/config/database.js` - Cấu hình kết nối MongoDB
- `backend/src/models/User.js` - Model User với validation và security
- `backend/src/controllers/authController.js` - Logic xử lý authentication
- `backend/src/middleware/auth.js` - Middleware xác thực JWT
- `backend/src/routes/auth.js` - Routes cho authentication
- `backend/src/server.js` - Đã được cập nhật để tích hợp MongoDB và routes

### Frontend Files:
- `frontend/env.example` - Template file môi trường cho frontend
- `frontend/src/services/api.js` - API service để gọi backend
- `frontend/src/contexts/AuthContext.js` - Context quản lý trạng thái authentication
- `frontend/src/pages/Login.jsx` - Đã được cập nhật để sử dụng API
- `frontend/src/pages/Register.jsx` - Đã được cập nhật để sử dụng API

## 🚀 Cách setup

### 1. Setup Backend

1. **Tạo file .env trong thư mục backend:**
   ```bash
   cd backend
   cp env.example .env
   ```

2. **Cập nhật file .env với thông tin MongoDB của bạn:**
   ```env
   # Cấu hình Server
   PORT=5000
   NODE_ENV=development
   
   # Cấu hình Frontend
   FRONTEND_URL=http://localhost:3000
   
   # Cấu hình MongoDB
   # Sử dụng MongoDB local:
   MONGODB_URI=mongodb://localhost:27017/financial_management
   
   # Hoặc sử dụng MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/financial_management?retryWrites=true&w=majority
   
   # JWT Secret (Thay đổi thành chuỗi bí mật phức tạp)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   
   # Bcrypt Salt Rounds
   BCRYPT_SALT_ROUNDS=12
   ```

3. **Cài đặt dependencies (nếu chưa có):**
   ```bash
   npm install
   ```

4. **Chạy backend:**
   ```bash
   npm run dev
   ```

### 2. Setup Frontend

1. **Tạo file .env trong thư mục frontend:**
   ```bash
   cd frontend
   cp env.example .env
   ```

2. **File .env sẽ có nội dung:**
   ```env
   # API Configuration
   REACT_APP_API_URL=http://localhost:5000/api
   
   # App Configuration
   REACT_APP_APP_NAME=Financial Hub
   REACT_APP_VERSION=1.0.0
   ```

3. **Cập nhật App.js để sử dụng AuthProvider:**
   ```jsx
   import { AuthProvider } from './contexts/AuthContext';
   
   function App() {
     return (
       <AuthProvider>
         {/* Existing app content */}
       </AuthProvider>
     );
   }
   ```

4. **Chạy frontend:**
   ```bash
   npm start
   ```

### 3. Setup MongoDB

#### Cách 1: MongoDB Local
1. Cài đặt MongoDB Community Server
2. Chạy MongoDB service
3. Sử dụng connection string: `mongodb://localhost:27017/financial_management`

#### Cách 2: MongoDB Atlas (Cloud)
1. Tạo tài khoản tại [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Tạo cluster mới
3. Tạo database user
4. Whitelist IP address
5. Lấy connection string và cập nhật vào .env

## 🔧 API Endpoints

### Authentication Routes:
- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại (cần token)
- `POST /api/auth/logout` - Đăng xuất (cần token)
- `PUT /api/auth/profile` - Cập nhật profile (cần token)

## 📝 Cách sử dụng

### Trong React Components:
```jsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (isAuthenticated) {
    return <div>Xin chào, {user.fullName}!</div>;
  }
  
  return <div>Chưa đăng nhập</div>;
}
```

### Gọi API trực tiếp:
```jsx
import { authAPI } from '../services/api';

// Đăng nhập
const handleLogin = async () => {
  try {
    const response = await authAPI.login({
      email: 'user@example.com',
      password: 'password123'
    });
    console.log('Đăng nhập thành công:', response);
  } catch (error) {
    console.error('Lỗi đăng nhập:', error.message);
  }
};
```

## 🔒 Security Features

- ✅ Password hashing với bcrypt
- ✅ JWT token authentication
- ✅ Input validation
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ MongoDB injection protection

## 🐛 Troubleshooting

### Backend không kết nối được MongoDB:
1. Kiểm tra MongoDB service đang chạy
2. Kiểm tra connection string trong .env
3. Kiểm tra firewall/network settings

### Frontend không gọi được API:
1. Kiểm tra backend đang chạy trên port 5000
2. Kiểm tra CORS settings
3. Kiểm tra REACT_APP_API_URL trong .env

### JWT Token errors:
1. Kiểm tra JWT_SECRET trong .env
2. Kiểm tra token có được lưu trong localStorage không
3. Kiểm tra token có hết hạn không

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. Console logs trong browser (F12)
2. Server logs trong terminal
3. MongoDB logs
4. Network tab trong DevTools
