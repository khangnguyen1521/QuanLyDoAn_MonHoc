const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID là bắt buộc'],
    index: true
  },
  refreshTokenHash: {
    type: String,
    required: [true, 'Refresh token hash là bắt buộc'],
    select: false // Không trả về khi query
  },
  userAgent: {
    type: String,
    required: [true, 'User agent là bắt buộc'],
    maxlength: [500, 'User agent không được vượt quá 500 ký tự']
  },
  ip: {
    type: String,
    required: [true, 'IP address là bắt buộc'],
    validate: {
      validator: function(v) {
        // Allow common values and validate IPv4/IPv6
        if (v === 'Unknown' || v === '::1' || v === '127.0.0.1') {
          return true;
        }
        
        // Validate IPv4
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (ipv4Regex.test(v)) return true;
        
        // Validate IPv6 (more flexible pattern)
        const ipv6Regex = /^([0-9a-fA-F]{1,4}:){1,7}:?([0-9a-fA-F]{1,4})?$|^::1$|^::$/;
        if (ipv6Regex.test(v)) return true;
        
        // Allow private network ranges
        const privateIpRegex = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/;
        if (privateIpRegex.test(v)) return true;
        
        return false;
      },
      message: 'IP address không hợp lệ'
    }
  },
  lastUsedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    required: [true, 'Thời gian hết hạn là bắt buộc'],
    index: { expireAfterSeconds: 0 } // MongoDB TTL index
  },
  revoked: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true // Tự động thêm createdAt và updatedAt
});

// Compound indexes for better query performance
sessionSchema.index({ userId: 1, revoked: 1 });
sessionSchema.index({ expiresAt: 1, revoked: 1 });

// Middleware để hash refresh token trước khi save
sessionSchema.pre('save', async function(next) {
  // Chỉ hash refresh token nếu nó được modify và chưa được hash
  if (!this.isModified('refreshTokenHash') || this.refreshTokenHash.startsWith('$2b$')) {
    return next();
  }

  try {
    // Hash refresh token với salt rounds
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    this.refreshTokenHash = await bcrypt.hash(this.refreshTokenHash, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Method để so sánh refresh token
sessionSchema.methods.compareRefreshToken = async function(candidateToken) {
  try {
    return await bcrypt.compare(candidateToken, this.refreshTokenHash);
  } catch (error) {
    throw error;
  }
};

// Method để kiểm tra session có hợp lệ không
sessionSchema.methods.isValid = function() {
  return !this.revoked && this.expiresAt > new Date();
};

// Method để revoke session
sessionSchema.methods.revoke = async function() {
  this.revoked = true;
  return await this.save();
};

// Method để cập nhật last used time
sessionSchema.methods.updateLastUsed = async function() {
  this.lastUsedAt = new Date();
  return await this.save();
};

// Static method để tìm session hợp lệ
sessionSchema.statics.findValidSession = function(sessionId) {
  return this.findOne({
    _id: sessionId,
    revoked: false,
    expiresAt: { $gt: new Date() }
  }).select('+refreshTokenHash');
};

// Static method để revoke tất cả sessions của user
sessionSchema.statics.revokeAllUserSessions = async function(userId) {
  return await this.updateMany(
    { userId: userId, revoked: false },
    { revoked: true }
  );
};

// Static method để cleanup expired sessions
sessionSchema.statics.cleanupExpiredSessions = async function() {
  return await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { revoked: true, updatedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } // Xóa revoked sessions sau 7 ngày
    ]
  });
};

// Static method để lấy active sessions của user
sessionSchema.statics.getUserActiveSessions = function(userId) {
  return this.find({
    userId: userId,
    revoked: false,
    expiresAt: { $gt: new Date() }
  }).sort({ lastUsedAt: -1 });
};

// Static method để cleanup old sessions khi vượt quá limit
sessionSchema.statics.cleanupOldUserSessions = async function(userId, maxSessions = 10) {
  try {
    // Get all active sessions for user, sorted by lastUsedAt (newest first)
    const activeSessions = await this.find({
      userId: userId,
      revoked: false,
      expiresAt: { $gt: new Date() }
    }).sort({ lastUsedAt: -1 });

    console.log(`👤 User ${userId} has ${activeSessions.length} active sessions`);

    if (activeSessions.length > maxSessions) {
      // Keep the newest maxSessions, revoke the rest
      const sessionsToRevoke = activeSessions.slice(maxSessions);
      
      const revokePromises = sessionsToRevoke.map(session => {
        console.log(`🗑️ Revoking old session: ${session._id} (last used: ${session.lastUsedAt})`);
        return this.updateOne(
          { _id: session._id },
          { revoked: true, updatedAt: new Date() }
        );
      });

      await Promise.all(revokePromises);
      
      console.log(`🧹 Revoked ${sessionsToRevoke.length} old sessions for user ${userId}`);
      return { revokedCount: sessionsToRevoke.length, remainingCount: maxSessions };
    }

    return { revokedCount: 0, remainingCount: activeSessions.length };
  } catch (error) {
    console.error('❌ Error cleaning up old user sessions:', error);
    throw error;
  }
};

module.exports = mongoose.model('Session', sessionSchema);
