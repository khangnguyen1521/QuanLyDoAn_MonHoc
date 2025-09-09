const express = require('express');
const {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  updateMemberRole
} = require('../controllers/groupController');
const {
  getGroupExpenses,
  createGroupExpense,
  updatePaymentStatus,
  getGroupExpenseSummary
} = require('../controllers/groupExpenseController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Áp dụng middleware xác thực cho tất cả routes
router.use(authenticate);

// Routes cho group
router.route('/')
  .get(getGroups)        // GET /api/groups - Lấy danh sách nhóm
  .post(createGroup);    // POST /api/groups - Tạo nhóm mới

router.route('/:id')
  .get(getGroup)         // GET /api/groups/:id - Lấy chi tiết nhóm
  .put(updateGroup)      // PUT /api/groups/:id - Cập nhật nhóm
  .delete(deleteGroup);  // DELETE /api/groups/:id - Xóa nhóm

// Routes cho thành viên nhóm
router.route('/:id/members')
  .post(addMember);      // POST /api/groups/:id/members - Thêm thành viên

router.route('/:id/members/:memberId')
  .put(updateMemberRole)   // PUT /api/groups/:id/members/:memberId - Cập nhật vai trò
  .delete(removeMember);   // DELETE /api/groups/:id/members/:memberId - Xóa thành viên

// Routes cho group expenses
router.route('/:groupId/expenses')
  .get(getGroupExpenses)     // GET /api/groups/:groupId/expenses - Lấy chi tiêu nhóm
  .post(createGroupExpense); // POST /api/groups/:groupId/expenses - Tạo chi tiêu mới

router.route('/:groupId/expenses/summary')
  .get(getGroupExpenseSummary); // GET /api/groups/:groupId/expenses/summary - Tổng kết tài chính

router.route('/:groupId/expenses/:expenseId/payment')
  .put(updatePaymentStatus); // PUT /api/groups/:groupId/expenses/:expenseId/payment - Cập nhật thanh toán

module.exports = router;
