const Invite = require('../models/Invite');
const Group = require('../models/Group');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Tạo lời mời thành viên
// @route   POST /api/invites
// @access  Private
const createInvite = async (req, res) => {
  try {
    const { nhom_id, email_duoc_moi, vai_tro = 'member', ghi_chu = '' } = req.body;
    const nguoi_moi = req.user._id;

    // Validate dữ liệu đầu vào
    if (!nhom_id || !email_duoc_moi) {
      return res.status(400).json({
        success: false,
        message: 'ID nhóm và email là bắt buộc'
      });
    }

    // Tìm nhóm
    const group = await Group.findById(nhom_id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhóm'
      });
    }

    // Kiểm tra quyền mời (chỉ creator)
    const isCreator = group.nguoi_tao.toString() === nguoi_moi.toString();

    if (!isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ người tạo nhóm mới có thể mời thành viên'
      });
    }

    // Kiểm tra email đã là thành viên chưa
    const isAlreadyMember = await group.isMemberByEmail(email_duoc_moi);
    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'Email này đã là thành viên của nhóm'
      });
    }

    // Kiểm tra đã có lời mời pending chưa
    const existingInvite = await Invite.findOne({
      nhom_id: nhom_id,
      email_duoc_moi: email_duoc_moi.toLowerCase(),
      trang_thai: 'pending',
      thoi_gian_het_han: { $gt: new Date() }
    });

    if (existingInvite) {
      return res.status(400).json({
        success: false,
        message: 'Đã có lời mời pending cho email này'
      });
    }

    // Tạo lời mời mới
    const invite = new Invite({
      nhom_id,
      nguoi_moi,
      email_duoc_moi: email_duoc_moi.toLowerCase(),
      vai_tro,
      ghi_chu
    });

    const savedInvite = await invite.save();
    
    // Populate thông tin
    await savedInvite.populate('nhom_id', 'ten_nhom mo_ta');
    await savedInvite.populate('nguoi_moi', 'fullName email');

    res.status(201).json({
      success: true,
      message: 'Tạo lời mời thành công',
      data: savedInvite
    });
  } catch (error) {
    console.error('Lỗi khi tạo lời mời:', error);
    
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
      message: 'Lỗi server khi tạo lời mời'
    });
  }
};

// @desc    Lấy danh sách lời mời của nhóm
// @route   GET /api/invites/group/:groupId
// @access  Private
const getGroupInvites = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    // Tìm nhóm và kiểm tra quyền
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhóm'
      });
    }

    // Kiểm tra quyền xem (chỉ creator)
    const isCreator = group.nguoi_tao.toString() === userId.toString();

    if (!isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ người tạo nhóm mới có thể xem lời mời'
      });
    }

    const invites = await Invite.findByGroup(groupId);

    res.status(200).json({
      success: true,
      count: invites.length,
      data: invites
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách lời mời:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách lời mời'
    });
  }
};

// @desc    Lấy lời mời của user hiện tại
// @route   GET /api/invites/my-invites
// @access  Private
const getMyInvites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    const invites = await Invite.findPendingByEmail(user.email);

    res.status(200).json({
      success: true,
      count: invites.length,
      data: invites
    });
  } catch (error) {
    console.error('Lỗi khi lấy lời mời của user:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy lời mời'
    });
  }
};

// @desc    Chấp nhận lời mời
// @route   POST /api/invites/:inviteId/accept
// @access  Private
const acceptInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    // Tìm lời mời
    const invite = await Invite.findById(inviteId)
      .populate('nhom_id')
      .populate('nguoi_moi', 'fullName email');

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lời mời'
      });
    }

    // Kiểm tra quyền (chỉ người được mời mới có thể chấp nhận)
    if (invite.email_duoc_moi !== user.email.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chấp nhận lời mời này'
      });
    }

    // Kiểm tra lời mời có hợp lệ không
    if (invite.trang_thai !== 'pending' || invite.isExpired()) {
      return res.status(400).json({
        success: false,
        message: 'Lời mời đã hết hạn hoặc không hợp lệ'
      });
    }

    // Kiểm tra đã là thành viên chưa
    const group = invite.nhom_id;
    const isAlreadyMember = group.isMemberByUserId(userId);
    if (isAlreadyMember) {
      // Cập nhật trạng thái lời mời thành accepted
      await invite.accept();
      return res.status(400).json({
        success: false,
        message: 'Bạn đã là thành viên của nhóm này'
      });
    }

    // Thêm vào nhóm
    group.addMember(userId, invite.vai_tro);
    await group.save();

    // Cập nhật trạng thái lời mời
    await invite.accept();

    // Populate lại group để trả về
    await group.populate('nguoi_tao', 'fullName email avatar');
    await group.populate('thanh_vien.user_id', 'fullName email avatar');

    res.status(200).json({
      success: true,
      message: 'Chấp nhận lời mời thành công',
      data: {
        group: group,
        invite: invite
      }
    });
  } catch (error) {
    console.error('Lỗi khi chấp nhận lời mời:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi chấp nhận lời mời'
    });
  }
};

// @desc    Từ chối lời mời
// @route   POST /api/invites/:inviteId/decline
// @access  Private
const declineInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    // Tìm lời mời
    const invite = await Invite.findById(inviteId)
      .populate('nhom_id', 'ten_nhom')
      .populate('nguoi_moi', 'fullName email');

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lời mời'
      });
    }

    // Kiểm tra quyền
    if (invite.email_duoc_moi !== user.email.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền từ chối lời mời này'
      });
    }

    // Cập nhật trạng thái
    await invite.decline();

    res.status(200).json({
      success: true,
      message: 'Từ chối lời mời thành công',
      data: invite
    });
  } catch (error) {
    console.error('Lỗi khi từ chối lời mời:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi từ chối lời mời'
    });
  }
};

// @desc    Hủy lời mời (chỉ người mời hoặc admin)
// @route   DELETE /api/invites/:inviteId
// @access  Private
const cancelInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const userId = req.user._id;

    // Tìm lời mời
    const invite = await Invite.findById(inviteId)
      .populate('nhom_id');

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lời mời'
      });
    }

    const group = invite.nhom_id;

    // Kiểm tra quyền (chỉ creator nhóm)
    const isCreator = group.nguoi_tao.toString() === userId.toString();

    if (!isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ người tạo nhóm mới có thể hủy lời mời'
      });
    }

    await Invite.findByIdAndDelete(inviteId);

    res.status(200).json({
      success: true,
      message: 'Hủy lời mời thành công'
    });
  } catch (error) {
    console.error('Lỗi khi hủy lời mời:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi hủy lời mời'
    });
  }
};


module.exports = {
  createInvite,
  getGroupInvites,
  getMyInvites,
  acceptInvite,
  declineInvite,
  cancelInvite
};
