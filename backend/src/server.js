const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load .env file from backend directory
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import database connection và routes
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const financialRoutes = require('./routes/financial');
const goalsRoutes = require('./routes/goals');
const { startSessionCleanup } = require('./utils/sessionCleanup');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for proper IP detection
app.set('trust proxy', true);

// Kết nối MongoDB
connectDB();

// Middleware bảo mật
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // giới hạn 100 requests mỗi IP trong 15 phút
  trustProxy: true, // Trust proxy for rate limiting
  keyGenerator: (req) => {
    // Use a combination of IP and user agent for better rate limiting
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    return ip;
  }
});
app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/goals', goalsRoutes);

// Routes cơ bản
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Server cho Website Quản Lý Tài Chính đang hoạt động!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      financial: '/api/financial',
      goals: '/api/goals',
      transactions: '/api/financial',
      categories: '/api/financial/categories',
      summary: '/api/financial/summary'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint không tồn tại',
    path: req.originalUrl 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Có lỗi xảy ra trên server!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  
  // Start session cleanup scheduler
  startSessionCleanup(10);
});
