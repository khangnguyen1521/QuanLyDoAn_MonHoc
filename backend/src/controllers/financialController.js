const FinancialManagement = require('../models/FinancialManagement');
const mongoose = require('mongoose');

// @desc    Lấy tất cả transactions của user
// @route   GET /api/financial
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      type,
      category,
      status,
      limit = 50,
      page = 1,
      search
    } = req.query;

    const skip = (page - 1) * limit;
    let query = { userId: req.user._id, isActive: true };

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Filter by type
    if (type) query.type = type;

    // Filter by category
    if (category) query.category = category;

    // Filter by status
    if (status) query.status = status;

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    const transactions = await FinancialManagement.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('userId', 'fullName email');

    const total = await FinancialManagement.countDocuments(query);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error in getTransactions:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách giao dịch'
    });
  }
};

// @desc    Tạo transaction mới
// @route   POST /api/financial
// @access  Private
const createTransaction = async (req, res) => {
  try {
    const transactionData = {
      ...req.body,
      userId: req.user._id
    };

    const transaction = new FinancialManagement(transactionData);
    await transaction.save();

    await transaction.populate('userId', 'fullName email');

    res.status(201).json({
      success: true,
      message: 'Tạo giao dịch thành công',
      data: transaction
    });
  } catch (error) {
    console.error('Error in createTransaction:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo giao dịch'
    });
  }
};

// @desc    Lấy transaction theo ID
// @route   GET /api/financial/:id
// @access  Private
const getTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID giao dịch không hợp lệ'
      });
    }

    const transaction = await FinancialManagement.findOne({
      _id: id,
      userId: req.user._id,
      isActive: true
    }).populate('userId', 'fullName email');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error in getTransaction:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin giao dịch'
    });
  }
};

// @desc    Cập nhật transaction
// @route   PUT /api/financial/:id
// @access  Private
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID giao dịch không hợp lệ'
      });
    }

    const transaction = await FinancialManagement.findOneAndUpdate(
      { _id: id, userId: req.user._id, isActive: true },
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'fullName email');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật giao dịch thành công',
      data: transaction
    });
  } catch (error) {
    console.error('Error in updateTransaction:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật giao dịch'
    });
  }
};

// @desc    Xóa transaction
// @route   DELETE /api/financial/:id?permanent=true
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query; // Query parameter để chọn hard/soft delete

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID giao dịch không hợp lệ'
      });
    }

    const transaction = await FinancialManagement.findOne({
      _id: id,
      userId: req.user._id,
      isActive: true
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch'
      });
    }

    if (permanent === 'true') {
      // Hard delete - xóa thực sự khỏi database
      await FinancialManagement.findByIdAndDelete(id);
      console.log(`Hard deleted transaction ${id} by user ${req.user._id}`);
    } else {
      // Soft delete - chỉ đánh dấu isActive = false
      await transaction.softDelete();
      console.log(`Soft deleted transaction ${id} by user ${req.user._id}`);
    }

    res.json({
      success: true,
      message: 'Xóa giao dịch thành công',
      deletedPermanently: permanent === 'true'
    });
  } catch (error) {
    console.error('Error in deleteTransaction:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa giao dịch'
    });
  }
};

// @desc    Lấy tóm tắt tài chính
// @route   GET /api/financial/summary
// @access  Private
const getSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const summary = await FinancialManagement.getSummaryByUser(
      req.user._id,
      startDate,
      endDate
    );

    res.json({
      success: true,
      data: summary[0] || { summary: [], totalTransactions: 0 }
    });
  } catch (error) {
    console.error('Error in getSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy tóm tắt tài chính'
    });
  }
};

// @desc    Lấy top categories
// @route   GET /api/financial/categories/top
// @access  Private
const getTopCategories = async (req, res) => {
  try {
    const { type = 'expense', limit = 10 } = req.query;

    const categories = await FinancialManagement.getTopCategories(
      req.user._id,
      type,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error in getTopCategories:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh mục hàng đầu'
    });
  }
};

// @desc    Duplicate transaction
// @route   POST /api/financial/:id/duplicate
// @access  Private
const duplicateTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID giao dịch không hợp lệ'
      });
    }

    const originalTransaction = await FinancialManagement.findOne({
      _id: id,
      userId: req.user._id,
      isActive: true
    });

    if (!originalTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch'
      });
    }

    const duplicatedTransaction = originalTransaction.duplicate();
    await duplicatedTransaction.save();
    await duplicatedTransaction.populate('userId', 'fullName email');

    res.status(201).json({
      success: true,
      message: 'Sao chép giao dịch thành công',
      data: duplicatedTransaction
    });
  } catch (error) {
    console.error('Error in duplicateTransaction:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi sao chép giao dịch'
    });
  }
};

// @desc    Lấy danh sách giao dịch đã xóa (soft deleted)
// @route   GET /api/financial/deleted
// @access  Private
const getDeletedTransactions = async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const deletedTransactions = await FinancialManagement.find({
      userId: req.user._id,
      isActive: false
    })
    .sort({ updatedAt: -1 })
    .limit(parseInt(limit))
    .skip(skip)
    .populate('userId', 'fullName email');

    const total = await FinancialManagement.countDocuments({
      userId: req.user._id,
      isActive: false
    });

    res.json({
      success: true,
      data: deletedTransactions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error in getDeletedTransactions:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách giao dịch đã xóa'
    });
  }
};

// @desc    Khôi phục giao dịch đã soft delete
// @route   PUT /api/financial/:id/restore
// @access  Private
const restoreTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID giao dịch không hợp lệ'
      });
    }

    const transaction = await FinancialManagement.findOne({
      _id: id,
      userId: req.user._id,
      isActive: false
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch đã xóa'
      });
    }

    transaction.isActive = true;
    await transaction.save();
    await transaction.populate('userId', 'fullName email');

    res.json({
      success: true,
      message: 'Khôi phục giao dịch thành công',
      data: transaction
    });
  } catch (error) {
    console.error('Error in restoreTransaction:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi khôi phục giao dịch'
    });
  }
};

module.exports = {
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
};
