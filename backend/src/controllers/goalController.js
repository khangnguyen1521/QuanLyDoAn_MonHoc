const Goal = require('../models/Goal');
const mongoose = require('mongoose');

// @desc    Get all goals for authenticated user
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const options = {
      status,
      category,
      priority,
      limit: parseInt(limit),
      skip: parseInt(skip),
      sort: { createdAt: -1 }
    };

    const goals = await Goal.getByUser(req.user._id, options);
    const total = await Goal.countDocuments({ 
      userId: req.user._id, 
      isActive: true,
      ...(status && { status }),
      ...(category && { category }),
      ...(priority && { priority })
    });

    res.json({
      success: true,
      count: goals.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: goals
    });
  } catch (error) {
    console.error('Error in getGoals:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách mục tiêu'
    });
  }
};

// @desc    Get single goal
// @route   GET /api/goals/:id
// @access  Private
const getGoal = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'ID mục tiêu không hợp lệ'
      });
    }

    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    }).populate('userId', 'fullName email');

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mục tiêu'
      });
    }

    res.json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error('Error in getGoal:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin mục tiêu'
    });
  }
};

// @desc    Create new goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res) => {
  try {
    // Check if user can add more goals (max 7 active)
    const canAdd = await Goal.canAddGoal(req.user._id);
    if (!canAdd) {
      return res.status(400).json({
        success: false,
        message: 'Bạn chỉ có thể tạo tối đa 7 mục tiêu đang hoạt động'
      });
    }

    const goalData = {
      ...req.body,
      userId: req.user._id
    };

    // Validate deadline is in the future
    if (new Date(goalData.deadline) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Hạn hoàn thành phải là ngày trong tương lai'
      });
    }

    const goal = await Goal.create(goalData);

    res.status(201).json({
      success: true,
      message: 'Tạo mục tiêu thành công',
      data: goal
    });
  } catch (error) {
    console.error('Error in createGoal:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo mục tiêu'
    });
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'ID mục tiêu không hợp lệ'
      });
    }

    let goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mục tiêu'
      });
    }

    // Validate deadline if provided
    if (req.body.deadline && new Date(req.body.deadline) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Hạn hoàn thành phải là ngày trong tương lai'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'userId') { // Prevent userId modification
        goal[key] = req.body[key];
      }
    });

    await goal.save();

    res.json({
      success: true,
      message: 'Cập nhật mục tiêu thành công',
      data: goal
    });
  } catch (error) {
    console.error('Error in updateGoal:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật mục tiêu'
    });
  }
};

// @desc    Update goal progress
// @route   PUT /api/goals/:id/progress
// @access  Private
const updateGoalProgress = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'ID mục tiêu không hợp lệ'
      });
    }

    const { currentAmount } = req.body;

    if (currentAmount === undefined || currentAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền hiện tại không hợp lệ'
      });
    }

    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mục tiêu'
      });
    }

    await goal.updateProgress(currentAmount);

    res.json({
      success: true,
      message: 'Cập nhật tiến độ thành công',
      data: goal
    });
  } catch (error) {
    console.error('Error in updateGoalProgress:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật tiến độ'
    });
  }
};

// @desc    Delete goal (soft delete)
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'ID mục tiêu không hợp lệ'
      });
    }

    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mục tiêu'
      });
    }

    await goal.softDelete();

    res.json({
      success: true,
      message: 'Xóa mục tiêu thành công'
    });
  } catch (error) {
    console.error('Error in deleteGoal:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa mục tiêu'
    });
  }
};

// @desc    Get goals summary for authenticated user
// @route   GET /api/goals/summary
// @access  Private
const getGoalsSummary = async (req, res) => {
  try {
    const summary = await Goal.getSummaryByUser(req.user._id);
    
    // Format the summary data
    const formattedSummary = {
      totalGoals: 0,
      activeGoals: 0,
      completedGoals: 0,
      pausedGoals: 0,
      cancelledGoals: 0,
      totalTargetAmount: 0,
      totalCurrentAmount: 0,
      overallProgress: 0
    };

    if (summary.length > 0) {
      const data = summary[0];
      formattedSummary.totalGoals = data.totalGoals || 0;
      formattedSummary.totalTargetAmount = data.overallTarget || 0;
      formattedSummary.totalCurrentAmount = data.overallCurrent || 0;
      formattedSummary.overallProgress = data.overallTarget > 0 
        ? (data.overallCurrent / data.overallTarget) * 100 
        : 0;

      // Count by status
      data.summary.forEach(item => {
        switch (item.status) {
          case 'active':
            formattedSummary.activeGoals = item.count;
            break;
          case 'completed':
            formattedSummary.completedGoals = item.count;
            break;
          case 'paused':
            formattedSummary.pausedGoals = item.count;
            break;
          case 'cancelled':
            formattedSummary.cancelledGoals = item.count;
            break;
        }
      });
    }

    res.json({
      success: true,
      data: formattedSummary
    });
  } catch (error) {
    console.error('Error in getGoalsSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy tổng quan mục tiêu'
    });
  }
};

module.exports = {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  updateGoalProgress,
  deleteGoal,
  getGoalsSummary
};
