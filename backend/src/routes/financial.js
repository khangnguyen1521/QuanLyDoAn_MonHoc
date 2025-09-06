const express = require('express');
const {
  getTransactions,
  createTransaction,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getTopCategories,
  duplicateTransaction,
  getDeletedTransactions,
  restoreTransaction
} = require('../controllers/financialController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Áp dụng middleware auth cho tất cả routes
router.use(authenticate);

// @route   GET /api/financial/summary
// @desc    Lấy tóm tắt tài chính
// @access  Private
router.get('/summary', getSummary);

// @route   GET /api/financial/categories/top
// @desc    Lấy top categories
// @access  Private
router.get('/categories/top', getTopCategories);

// @route   POST /api/financial/:id/duplicate
// @desc    Duplicate transaction
// @access  Private
router.post('/:id/duplicate', duplicateTransaction);

// @route   GET /api/financial/deleted
// @desc    Lấy danh sách giao dịch đã xóa
// @access  Private
router.get('/deleted', getDeletedTransactions);

// @route   PUT /api/financial/:id/restore
// @desc    Khôi phục giao dịch đã soft delete
// @access  Private
router.put('/:id/restore', restoreTransaction);

// @route   GET /api/financial
// @desc    Lấy tất cả transactions của user
// @access  Private
router.get('/', getTransactions);

// @route   POST /api/financial
// @desc    Tạo transaction mới
// @access  Private
router.post('/', createTransaction);

// @route   GET /api/financial/:id
// @desc    Lấy transaction theo ID
// @access  Private
router.get('/:id', getTransaction);

// @route   PUT /api/financial/:id
// @desc    Cập nhật transaction
// @access  Private
router.put('/:id', updateTransaction);

// @route   DELETE /api/financial/:id
// @desc    Xóa transaction (soft delete)
// @access  Private
router.delete('/:id', deleteTransaction);

module.exports = router;
