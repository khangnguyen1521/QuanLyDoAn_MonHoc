const Session = require('../models/Session');

// Cleanup expired sessions
const cleanupExpiredSessions = async () => {
  try {
    const result = await Session.cleanupExpiredSessions();
    console.log(`🧹 Cleaned up ${result.deletedCount} expired/revoked sessions`);
    return result;
  } catch (error) {
    console.error('❌ Error cleaning up sessions:', error);
    throw error;
  }
};

// Cleanup old sessions for all users (keep only newest 10 per user)
const cleanupOldSessionsForAllUsers = async (maxSessionsPerUser = 10) => {
  try {
    console.log(`🧹 Starting cleanup of old sessions (max ${maxSessionsPerUser} per user)...`);
    
    // Get all unique user IDs with active sessions
    const userIds = await Session.distinct('userId', {
      revoked: false,
      expiresAt: { $gt: new Date() }
    });

    let totalRevokedCount = 0;

    // Process each user
    for (const userId of userIds) {
      const result = await Session.cleanupOldUserSessions(userId, maxSessionsPerUser);
      totalRevokedCount += result.revokedCount;
    }

    console.log(`🧹 Completed session cleanup: ${totalRevokedCount} old sessions revoked across ${userIds.length} users`);
    return { totalRevokedCount, usersProcessed: userIds.length };
  } catch (error) {
    console.error('❌ Error cleaning up old sessions for all users:', error);
    throw error;
  }
};

// Schedule session cleanup to run every hour
const startSessionCleanup = (maxSessionsPerUser = 10) => {
  // Run immediately
  cleanupExpiredSessions();
  cleanupOldSessionsForAllUsers(maxSessionsPerUser);
  
  // Then run every hour (3600000 ms)
  setInterval(() => {
    cleanupExpiredSessions();
    cleanupOldSessionsForAllUsers(maxSessionsPerUser);
  }, 60 * 60 * 1000);
  
  console.log(`⏰ Session cleanup scheduler started - running every hour (max ${maxSessionsPerUser} sessions per user)`);
};

module.exports = {
  cleanupExpiredSessions,
  cleanupOldSessionsForAllUsers,
  startSessionCleanup
};
