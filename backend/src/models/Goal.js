const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tên mục tiêu là bắt buộc'],
    trim: true,
    maxlength: [200, 'Tên mục tiêu không được vượt quá 200 ký tự']
  },
  targetAmount: {
    type: Number,
    required: [true, 'Số tiền mục tiêu là bắt buộc'],
    min: [1, 'Số tiền mục tiêu phải lớn hơn 0']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Số tiền hiện tại không được âm']
  },
  deadline: {
    type: Date,
    required: [true, 'Hạn hoàn thành là bắt buộc'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Hạn hoàn thành phải là ngày trong tương lai'
    }
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'paused'],
    default: 'active'
  },
  category: {
    type: String,
    enum: ['transport', 'travel', 'emergency', 'work', 'home', 'education', 'other'],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
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
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Mô tả không được vượt quá 500 ký tự']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'goals'
});

// Indexes for better query performance
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, deadline: 1 });
goalSchema.index({ userId: 1, priority: 1 });
goalSchema.index({ userId: 1, category: 1 });

// Virtual for progress percentage
goalSchema.virtual('progressPercentage').get(function() {
  return Math.min((this.currentAmount / this.targetAmount) * 100, 100);
});

// Virtual for remaining amount
goalSchema.virtual('remainingAmount').get(function() {
  return Math.max(this.targetAmount - this.currentAmount, 0);
});

// Virtual for days remaining
goalSchema.virtual('daysRemaining').get(function() {
  const today = new Date();
  const diffTime = this.deadline - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for formatted target amount
goalSchema.virtual('formattedTargetAmount').get(function() {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: this.currency
  }).format(this.targetAmount);
});

// Virtual for formatted current amount
goalSchema.virtual('formattedCurrentAmount').get(function() {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: this.currency
  }).format(this.currentAmount);
});

// Static method to get goals by user with limit check
goalSchema.statics.getByUser = function(userId, options = {}) {
  const {
    status,
    category,
    priority,
    limit = 50,
    skip = 0,
    sort = { createdAt: -1 }
  } = options;

  const query = { userId, isActive: true };

  if (status) query.status = status;
  if (category) query.category = category;
  if (priority) query.priority = priority;

  return this.find(query)
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .populate('userId', 'fullName email');
};

// Static method to count active goals for a user
goalSchema.statics.countActiveGoalsByUser = function(userId) {
  return this.countDocuments({ 
    userId, 
    status: 'active', 
    isActive: true 
  });
};

// Static method to check if user can add more goals (max 7)
goalSchema.statics.canAddGoal = async function(userId) {
  const activeCount = await this.countActiveGoalsByUser(userId);
  return activeCount < 7;
};

// Static method to get user's goals summary
goalSchema.statics.getSummaryByUser = function(userId) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        isActive: true
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalTarget: { $sum: '$targetAmount' },
        totalCurrent: { $sum: '$currentAmount' }
      }
    },
    {
      $group: {
        _id: null,
        summary: {
          $push: {
            status: '$_id',
            count: '$count',
            totalTarget: '$totalTarget',
            totalCurrent: '$totalCurrent'
          }
        },
        totalGoals: { $sum: '$count' },
        overallTarget: { $sum: '$totalTarget' },
        overallCurrent: { $sum: '$totalCurrent' }
      }
    }
  ]);
};

// Method to update progress
goalSchema.methods.updateProgress = function(amount) {
  this.currentAmount = Math.max(0, amount);
  
  // Auto-complete if target is reached
  if (this.currentAmount >= this.targetAmount && this.status === 'active') {
    this.status = 'completed';
  }
  
  return this.save();
};

// Method to soft delete
goalSchema.methods.softDelete = function() {
  this.isActive = false;
  return this.save();
};

// Pre-save middleware to validate goal limit
goalSchema.pre('save', async function(next) {
  if (this.isNew && this.status === 'active') {
    const canAdd = await this.constructor.canAddGoal(this.userId);
    if (!canAdd) {
      return next(new Error('Bạn chỉ có thể tạo tối đa 7 mục tiêu đang hoạt động'));
    }
  }
  next();
});

// Pre-save middleware to auto-complete goals
goalSchema.pre('save', function(next) {
  if (this.currentAmount >= this.targetAmount && this.status === 'active') {
    this.status = 'completed';
  }
  next();
});

module.exports = mongoose.model('Goal', goalSchema);
