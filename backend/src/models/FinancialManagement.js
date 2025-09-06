const mongoose = require('mongoose');

const financialManagementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tiêu đề là bắt buộc'],
    trim: true,
    maxlength: [200, 'Tiêu đề không được vượt quá 200 ký tự']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Mô tả không được vượt quá 1000 ký tự']
  },
  amount: {
    type: Number,
    required: [true, 'Số tiền là bắt buộc'],
    min: [0, 'Số tiền không được âm']
  },
  type: {
    type: String,
    enum: ['income', 'expense', 'transfer'],
    required: [true, 'Loại giao dịch là bắt buộc']
  },
  category: {
    type: String,
    required: [true, 'Danh mục là bắt buộc'],
    trim: true,
    maxlength: [100, 'Danh mục không được vượt quá 100 ký tự']
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: [100, 'Danh mục con không được vượt quá 100 ký tự']
  },
  date: {
    type: Date,
    required: [true, 'Ngày giao dịch là bắt buộc'],
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID là bắt buộc'],
    index: true
  },
  currency: {
    type: String,
    enum: ['VND', 'USD', 'EUR'],
    default: 'VND'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'e_wallet', 'other'],
    default: 'cash'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag không được vượt quá 50 ký tự']
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Ghi chú không được vượt quá 500 ký tự']
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      required: function() { return this.isRecurring; }
    },
    interval: {
      type: Number,
      min: 1,
      default: 1,
      required: function() { return this.isRecurring; }
    },
    endDate: {
      type: Date,
      required: function() { return this.isRecurring; }
    }
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true, // Tự động thêm createdAt và updatedAt
  collection: 'financial_management' // Đặt tên collection cụ thể
});

// Compound indexes for better query performance
financialManagementSchema.index({ userId: 1, date: -1 });
financialManagementSchema.index({ userId: 1, type: 1, date: -1 });
financialManagementSchema.index({ userId: 1, category: 1, date: -1 });
financialManagementSchema.index({ userId: 1, status: 1, date: -1 });

// Text index for search functionality
financialManagementSchema.index({
  title: 'text',
  description: 'text',
  category: 'text',
  subcategory: 'text',
  notes: 'text'
});

// Virtual for formatted amount
financialManagementSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: this.currency
  }).format(this.amount);
});

// Static method để lấy transactions theo user
financialManagementSchema.statics.getByUser = function(userId, options = {}) {
  const {
    startDate,
    endDate,
    type,
    category,
    status = 'completed',
    limit = 50,
    skip = 0,
    sort = { date: -1 }
  } = options;

  const query = { userId, status, isActive: true };

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  if (type) query.type = type;
  if (category) query.category = category;

  return this.find(query)
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .populate('userId', 'fullName email');
};

// Static method để tính tổng theo loại
financialManagementSchema.statics.getSummaryByUser = function(userId, startDate, endDate) {
  const matchStage = {
    userId: new mongoose.Types.ObjectId(userId),
    status: 'completed',
    isActive: true
  };

  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = new Date(startDate);
    if (endDate) matchStage.date.$lte = new Date(endDate);
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    },
    {
      $group: {
        _id: null,
        summary: {
          $push: {
            type: '$_id',
            total: '$total',
            count: '$count',
            avgAmount: '$avgAmount'
          }
        },
        totalTransactions: { $sum: '$count' }
      }
    }
  ]);
};

// Static method để lấy top categories
financialManagementSchema.statics.getTopCategories = function(userId, type, limit = 10) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        type: type,
        status: 'completed',
        isActive: true
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { total: -1 } },
    { $limit: limit }
  ]);
};

// Method để soft delete
financialManagementSchema.methods.softDelete = function() {
  this.isActive = false;
  return this.save();
};

// Method để duplicate transaction
financialManagementSchema.methods.duplicate = function() {
  const duplicated = new this.constructor(this.toObject());
  duplicated._id = undefined;
  duplicated.isNew = true;
  duplicated.date = new Date();
  return duplicated;
};

module.exports = mongoose.model('FinancialManagement', financialManagementSchema);
