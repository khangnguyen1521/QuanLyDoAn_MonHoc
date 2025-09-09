const GroupExpense = require('../models/GroupExpense');
const Group = require('../models/Group');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Lấy tất cả chi tiêu của nhóm
// @route   GET /api/groups/:groupId/expenses
// @access  Private
const getGroupExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { status, dateFrom, dateTo } = req.query;
    const userId = req.user._id;

    // Kiểm tra quyền truy cập nhóm
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhóm'
      });
    }

    // Kiểm tra user có phải thành viên không
    const isMember = group.nguoi_tao.toString() === userId.toString() ||
                     group.thanh_vien.some(member => 
                       member.user_id.toString() === userId.toString()
                     );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem chi tiêu của nhóm này'
      });
    }

    const options = {};
    if (status) options.status = status;
    if (dateFrom) options.dateFrom = new Date(dateFrom);
    if (dateTo) options.dateTo = new Date(dateTo);

    const expenses = await GroupExpense.findByGroup(groupId, options);

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiêu nhóm:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy chi tiêu nhóm'
    });
  }
};

// @desc    Tạo chi tiêu mới cho nhóm
// @route   POST /api/groups/:groupId/expenses
// @access  Private
const createGroupExpense = async (req, res) => {
  try {
    const { groupId } = req.params;
    const {
      tieu_de,
      mo_ta,
      tong_tien,
      tien_te,
      danh_muc,
      kieu_chia,
      nguoi_tra,
      phan_chia,
      ngay_chi_tieu,
      dia_diem
    } = req.body;
    const userId = req.user._id;

    // Kiểm tra nhóm tồn tại và quyền
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhóm'
      });
    }

    const isMember = group.nguoi_tao.toString() === userId.toString() ||
                     group.thanh_vien.some(member => 
                       member.user_id.toString() === userId.toString()
                     );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ thành viên nhóm mới có thể tạo chi tiêu'
      });
    }

    // Validate phan_chia
    if (!phan_chia || phan_chia.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Phải có ít nhất một người tham gia chia tiền'
      });
    }

    // Kiểm tra tất cả user trong phan_chia đều là thành viên nhóm
    const groupMemberIds = [
      group.nguoi_tao.toString(),
      ...group.thanh_vien.map(member => member.user_id.toString())
    ];

    const invalidUsers = phan_chia.filter(item => 
      !groupMemberIds.includes(item.user_id.toString())
    );

    if (invalidUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Có người trong danh sách chia tiền không phải thành viên nhóm'
      });
    }

    // Tạo chi tiêu mới
    const expense = new GroupExpense({
      nhom_id: groupId,
      nguoi_tao: userId,
      tieu_de: tieu_de.trim(),
      mo_ta: mo_ta?.trim() || '',
      tong_tien,
      tien_te: tien_te || group.tien_te_mac_dinh,
      danh_muc: danh_muc || 'khac',
      kieu_chia: kieu_chia || group.kieu_chia_mac_dinh,
      nguoi_tra: nguoi_tra || userId,
      phan_chia,
      ngay_chi_tieu: ngay_chi_tieu || new Date(),
      dia_diem: dia_diem?.trim() || ''
    });

    // Tính toán phân chia tự động nếu cần
    if (kieu_chia === 'deu' || kieu_chia === 'phan_tram' || kieu_chia === 'co_phan') {
      expense.calculateSplit();
    }

    const savedExpense = await expense.save();
    
    // Populate thông tin
    await savedExpense.populate('nguoi_tao', 'fullName email avatar');
    await savedExpense.populate('nguoi_tra', 'fullName email avatar');
    await savedExpense.populate('phan_chia.user_id', 'fullName email avatar');

    res.status(201).json({
      success: true,
      message: 'Tạo chi tiêu nhóm thành công',
      data: savedExpense
    });
  } catch (error) {
    console.error('Lỗi khi tạo chi tiêu nhóm:', error);
    
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
      message: 'Lỗi server khi tạo chi tiêu nhóm'
    });
  }
};

// @desc    Cập nhật trạng thái thanh toán
// @route   PUT /api/groups/:groupId/expenses/:expenseId/payment
// @access  Private
const updatePaymentStatus = async (req, res) => {
  try {
    const { groupId, expenseId } = req.params;
    const { user_id, trang_thai, ghi_chu } = req.body;
    const currentUserId = req.user._id;

    const expense = await GroupExpense.findOne({
      _id: expenseId,
      nhom_id: groupId
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chi tiêu'
      });
    }

    // Chỉ người trong danh sách chia tiền hoặc người tạo mới có thể cập nhật
    const canUpdate = expense.nguoi_tao.toString() === currentUserId.toString() ||
                      expense.phan_chia.some(item => 
                        item.user_id.toString() === currentUserId.toString()
                      );

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật trạng thái thanh toán'
      });
    }

    // Cập nhật trạng thái
    expense.updatePaymentStatus(user_id, trang_thai, new Date());
    
    // Cập nhật ghi chú nếu có
    if (ghi_chu) {
      const member = expense.phan_chia.find(item => 
        item.user_id.toString() === user_id.toString()
      );
      if (member) {
        member.ghi_chu = ghi_chu;
      }
    }

    await expense.save();

    // Populate và trả về
    await expense.populate('nguoi_tao', 'fullName email avatar');
    await expense.populate('nguoi_tra', 'fullName email avatar');
    await expense.populate('phan_chia.user_id', 'fullName email avatar');

    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái thanh toán thành công',
      data: expense
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái thanh toán:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật trạng thái thanh toán'
    });
  }
};

// @desc    Lấy tổng kết tài chính nhóm
// @route   GET /api/groups/:groupId/expenses/summary
// @access  Private
const getGroupExpenseSummary = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    // Kiểm tra quyền truy cập
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhóm'
      });
    }

    const isMember = group.nguoi_tao.toString() === userId.toString() ||
                     group.thanh_vien.some(member => 
                       member.user_id.toString() === userId.toString()
                     );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xem tổng kết nhóm này'
      });
    }

    const expenses = await GroupExpense.findByGroup(groupId, { status: 'active' });
    
    // Tính toán tổng kết
    const summary = {
      tong_chi_tieu: expenses.reduce((total, exp) => total + exp.tong_tien, 0),
      so_luong_chi_tieu: expenses.length,
      tong_da_thanh_toan: expenses.reduce((total, exp) => total + exp.tong_da_thanh_toan, 0),
      tong_chua_thanh_toan: expenses.reduce((total, exp) => total + exp.tong_chua_thanh_toan, 0),
      theo_thanh_vien: {}
    };

    // Tính toán theo từng thành viên (avoid duplicates)
    const allMemberIds = new Set([group.nguoi_tao.toString()]);
    
    // Add other members (excluding creator if they're in thanh_vien)
    group.thanh_vien.forEach(member => {
      allMemberIds.add(member.user_id.toString());
    });
    
    const uniqueMemberIds = Array.from(allMemberIds);

    for (const memberId of uniqueMemberIds) {
      let memberTotal = 0;
      let memberPaid = 0;
      let memberOwed = 0;

      expenses.forEach(expense => {
        const memberShare = expense.phan_chia.find(item => 
          item.user_id.toString() === memberId
        );
        
        if (memberShare) {
          memberTotal += memberShare.so_tien;
          
          if (memberShare.trang_thai_thanh_toan !== 'chua_tra') {
            memberPaid += memberShare.so_tien;
          } else {
            memberOwed += memberShare.so_tien;
          }
        }
      });

      summary.theo_thanh_vien[memberId] = {
        tong_phai_tra: memberTotal,
        da_thanh_toan: memberPaid,
        con_no: memberOwed
      };
    }

    res.status(200).json({
      success: true,
      data: {
        group_info: {
          id: group._id,
          ten_nhom: group.ten_nhom,
          tien_te: group.tien_te_mac_dinh
        },
        summary
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy tổng kết nhóm:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy tổng kết nhóm'
    });
  }
};

module.exports = {
  getGroupExpenses,
  createGroupExpense,
  updatePaymentStatus,
  getGroupExpenseSummary
};
