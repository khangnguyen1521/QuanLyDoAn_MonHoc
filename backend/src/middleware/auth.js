const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');

// Middleware xác thực JWT token
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Lấy token từ header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Kiểm tra token có tồn tại không
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không có quyền truy cập. Token không được cung cấp'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Kiểm tra session nếu có sessionId trong token
      if (decoded.sessionId) {
        const session = await Session.findValidSession(decoded.sessionId);
        
        if (!session || !session.isValid()) {
          return res.status(401).json({
            success: false,
            message: 'Session không hợp lệ hoặc đã hết hạn'
          });
        }
        
        // Cập nhật last used time
        await session.updateLastUsed();
      }
      
      // Tìm user từ token
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token không hợp lệ. User không tồn tại'
        });
      }

      // Kiểm tra user có active không
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Tài khoản đã bị vô hiệu hóa'
        });
      }

      // Thêm user info vào request
      req.user = {
        _id: user._id,
        userId: user._id,
        sessionId: decoded.sessionId,
        email: user.email,
        role: user.role
      };

      next();

    } catch (tokenError) {
      console.error('Token verification error:', tokenError);
      
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token đã hết hạn'
        });
      }
      
      if (tokenError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token không hợp lệ'
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Lỗi xác thực token'
      });
    }

  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server trong quá trình xác thực'
    });
  }
};

// Middleware phân quyền (chỉ admin)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Chưa được xác thực'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Vai trò ${req.user.role} không có quyền truy cập tài nguyên này`
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
