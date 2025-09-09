const express = require('express');
const {
  createInvite,
  getGroupInvites,
  getMyInvites,
  acceptInvite,
  declineInvite,
  cancelInvite
} = require('../controllers/inviteController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Áp dụng middleware xác thực cho tất cả routes
router.use(authenticate);

// Routes cho invite
router.route('/')
  .post(createInvite);        // POST /api/invites - Tạo lời mời

router.route('/my-invites')
  .get(getMyInvites);         // GET /api/invites/my-invites - Lấy lời mời của user


router.route('/group/:groupId')
  .get(getGroupInvites);      // GET /api/invites/group/:groupId - Lấy lời mời của nhóm

router.route('/:inviteId')
  .delete(cancelInvite);      // DELETE /api/invites/:inviteId - Hủy lời mời

router.route('/:inviteId/accept')
  .post(acceptInvite);        // POST /api/invites/:inviteId/accept - Chấp nhận lời mời

router.route('/:inviteId/decline')
  .post(declineInvite);       // POST /api/invites/:inviteId/decline - Từ chối lời mời

module.exports = router;
