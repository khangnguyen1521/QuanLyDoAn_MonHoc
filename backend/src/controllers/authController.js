const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Session = require('../models/Session');

// Tạo JWT token
const generateToken = (userId, sessionId) => {
  return jwt.sign({ userId, sessionId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m' // Access token ngắn hạn
  });
};

// Tạo refresh token
const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

// Lấy thông tin từ request
const getClientInfo = (req) => {
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  // Lấy IP address với nhiều phương pháp khác nhau
  let ip = req.ip || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress || 
           req.connection?.socket?.remoteAddress ||
           req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           req.headers['x-real-ip'] ||
           'Unknown';
  
  // Xử lý IPv6 mapped IPv4 addresses
  if (ip && ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  
  // Log để debug
  console.log('🔍 Detected IP:', ip, 'User-Agent:', userAgent?.substring(0, 50) + '...');
  
  return { userAgent, ip };
};

// Tạo response với token và session
const createTokenResponse = async (user, statusCode, res, req) => {
  try {
    const { userAgent, ip } = getClientInfo(req);
    
    // Tạo refresh token
    const refreshToken = generateRefreshToken();
    
    // Cleanup old sessions trước khi tạo session mới
    await Session.cleanupOldUserSessions(user._id, 10);
    
    // Tạo session mới
    const session = await Session.create({
      userId: user._id,
      refreshTokenHash: refreshToken, // Sẽ được hash trong pre-save middleware
      userAgent,
      ip,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 ngày
    });

    // Tạo access token với sessionId
    const accessToken = generateToken(user._id, session._id);
    
    // Cập nhật lastLogin
    user.lastLogin = new Date();
    await user.save();

    res.status(statusCode).json({
      success: true,
      message: statusCode === 201 ? 'Đăng ký thành công' : 'Đăng nhập thành công',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        ngon_ngu: user.ngon_ngu,
        tien_te_mac_dinh: user.tien_te_mac_dinh,
        nhan_email_long_hop: user.nhan_email_long_hop,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Lỗi tạo session:', error);
    throw error;
  }
};

// @desc    Đăng ký user mới
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, ngon_ngu, tien_te_mac_dinh, nhan_email_long_hop } = req.body;

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu xác nhận không khớp'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
    }

    // Validation cho các trường mới (optional)
    if (ngon_ngu && !['vi', 'en-US'].includes(ngon_ngu)) {
      return res.status(400).json({
        success: false,
        message: 'Ngôn ngữ không hợp lệ. Chỉ hỗ trợ "vi" hoặc "en-US"'
      });
    }

    if (tien_te_mac_dinh && !['VND', 'USD', 'EUR'].includes(tien_te_mac_dinh)) {
      return res.status(400).json({
        success: false,
        message: 'Tiền tệ không hợp lệ. Chỉ hỗ trợ "VND", "USD" hoặc "EUR"'
      });
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    // Tạo user mới
    const userData = {
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password
    };

    // Thêm các trường optional nếu được cung cấp
    if (ngon_ngu) userData.ngon_ngu = ngon_ngu;
    if (tien_te_mac_dinh) userData.tien_te_mac_dinh = tien_te_mac_dinh;
    if (nhan_email_long_hop !== undefined) userData.nhan_email_long_hop = nhan_email_long_hop;

    const user = await User.create(userData);

    await createTokenResponse(user, 201, res, req);

  } catch (error) {
    console.error('Lỗi register:', error);
    
    // Xử lý lỗi validation của mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0]
      });
    }

    // Xử lý lỗi duplicate key (email đã tồn tại)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server, vui lòng thử lại sau'
    });
  }
};

// @desc    Đăng nhập user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và mật khẩu'
      });
    }

    // Tìm user và bao gồm password để so sánh
    const user = await User.findByEmailWithPassword(email.toLowerCase().trim());
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Kiểm tra tài khoản có active không
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản đã bị vô hiệu hóa'
      });
    }

    // So sánh password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    await createTokenResponse(user, 200, res, req);

  } catch (error) {
    console.error('Lỗi login:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server, vui lòng thử lại sau'
    });
  }
};

// @desc    Lấy thông tin user hiện tại
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        ngon_ngu: user.ngon_ngu,
        tien_te_mac_dinh: user.tien_te_mac_dinh,
        nhan_email_long_hop: user.nhan_email_long_hop,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Lỗi getMe:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server, vui lòng thử lại sau'
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token là bắt buộc'
      });
    }

    // Tìm session với refresh token
    const sessions = await Session.find({ revoked: false }).select('+refreshTokenHash');
    let validSession = null;

    // Kiểm tra refresh token với từng session
    for (const session of sessions) {
      if (await session.compareRefreshToken(refreshToken)) {
        validSession = session;
        break;
      }
    }

    if (!validSession || !validSession.isValid()) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token không hợp lệ hoặc đã hết hạn'
      });
    }

    // Tìm user
    const user = await User.findById(validSession.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User không tồn tại hoặc đã bị vô hiệu hóa'
      });
    }

    // Cập nhật last used time
    await validSession.updateLastUsed();

    // Tạo access token mới
    const newAccessToken = generateToken(user._id, validSession._id);

    res.status(200).json({
      success: true,
      message: 'Refresh token thành công',
      accessToken: newAccessToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        ngon_ngu: user.ngon_ngu,
        tien_te_mac_dinh: user.tien_te_mac_dinh,
        nhan_email_long_hop: user.nhan_email_long_hop
      }
    });

  } catch (error) {
    console.error('Lỗi refresh token:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server, vui lòng thử lại sau'
    });
  }
};

// @desc    Đăng xuất
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    const { sessionId } = req.user;

    if (sessionId) {
      // Revoke session hiện tại
      const session = await Session.findById(sessionId);
      if (session) {
        await session.revoke();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công'
    });

  } catch (error) {
    console.error('Lỗi logout:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server, vui lòng thử lại sau'
    });
  }
};

// @desc    Đăng xuất tất cả thiết bị
// @route   POST /api/auth/logout-all
// @access  Private
const logoutAll = async (req, res) => {
  try {
    const { userId } = req.user;

    // Revoke tất cả sessions của user
    await Session.revokeAllUserSessions(userId);

    res.status(200).json({
      success: true,
      message: 'Đăng xuất tất cả thiết bị thành công'
    });

  } catch (error) {
    console.error('Lỗi logout all:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server, vui lòng thử lại sau'
    });
  }
};

// @desc    Lấy danh sách sessions đang hoạt động
// @route   GET /api/auth/sessions
// @access  Private
const getActiveSessions = async (req, res) => {
  try {
    const { userId } = req.user;

    const sessions = await Session.getUserActiveSessions(userId);

    const formattedSessions = sessions.map(session => ({
      id: session._id,
      userAgent: session.userAgent,
      ip: session.ip,
      lastUsedAt: session.lastUsedAt,
      expiresAt: session.expiresAt,
      isCurrent: session._id.toString() === req.user.sessionId
    }));

    res.status(200).json({
      success: true,
      sessions: formattedSessions
    });

  } catch (error) {
    console.error('Lỗi get active sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server, vui lòng thử lại sau'
    });
  }
};

// @desc    Revoke một session cụ thể
// @route   DELETE /api/auth/sessions/:sessionId
// @access  Private
const revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId } = req.user;

    const session = await Session.findOne({ _id: sessionId, userId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session không tồn tại'
      });
    }

    await session.revoke();

    res.status(200).json({
      success: true,
      message: 'Revoke session thành công'
    });

  } catch (error) {
    console.error('Lỗi revoke session:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server, vui lòng thử lại sau'
    });
  }
};

// @desc    Cập nhật thông tin user
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { fullName, ngon_ngu, tien_te_mac_dinh, nhan_email_long_hop } = req.body;
    
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    // Validation cho các trường mới
    if (ngon_ngu && !['vi', 'en-US'].includes(ngon_ngu)) {
      return res.status(400).json({
        success: false,
        message: 'Ngôn ngữ không hợp lệ. Chỉ hỗ trợ "vi" hoặc "en-US"'
      });
    }

    if (tien_te_mac_dinh && !['VND', 'USD', 'EUR'].includes(tien_te_mac_dinh)) {
      return res.status(400).json({
        success: false,
        message: 'Tiền tệ không hợp lệ. Chỉ hỗ trợ "VND", "USD" hoặc "EUR"'
      });
    }

    // Cập nhật thông tin
    if (fullName) user.fullName = fullName.trim();
    if (ngon_ngu) user.ngon_ngu = ngon_ngu;
    if (tien_te_mac_dinh) user.tien_te_mac_dinh = tien_te_mac_dinh;
    if (nhan_email_long_hop !== undefined) user.nhan_email_long_hop = nhan_email_long_hop;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        ngon_ngu: user.ngon_ngu,
        tien_te_mac_dinh: user.tien_te_mac_dinh,
        nhan_email_long_hop: user.nhan_email_long_hop
      }
    });

  } catch (error) {
    console.error('Lỗi updateProfile:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server, vui lòng thử lại sau'
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  getMe,
  logout,
  logoutAll,
  getActiveSessions,
  revokeSession,
  updateProfile
};
