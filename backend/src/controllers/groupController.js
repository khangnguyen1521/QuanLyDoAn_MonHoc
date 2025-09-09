const Group = require('../models/Group');
const User = require('../models/User');
const Invite = require('../models/Invite');
const mongoose = require('mongoose');

// @desc    Lấy tất cả nhóm của user
// @route   GET /api/groups
// @access  Private
const getGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const groups = await Group.findByUser(userId)
      .sort({ thoi_gian_cap_nhat: -1 });

    res.status(200).json({
      success: true,
      count: groups.length,
      data: groups
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhóm:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách nhóm'
    });
  }
};

// @desc    Lấy chi tiết một nhóm
// @route   GET /api/groups/:id
// @access  Private
const getGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Tìm nhóm theo ID hoặc id_nhom
    let group;
    if (mongoose.Types.ObjectId.isValid(id)) {
      group = await Group.findById(id)
        .populate('nguoi_tao', 'fullName email avatar')
        .populate('thanh_vien.user_id', 'fullName email avatar');
    } else {
      group = await Group.findOne({ id_nhom: id })
        .populate('nguoi_tao', 'fullName email avatar')
        .populate('thanh_vien.user_id', 'fullName email avatar');
    }

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhóm'
      });
    }

    // Kiểm tra quyền truy cập
    const isCreator = group.nguoi_tao._id.toString() === userId.toString();
    const isMember = group.thanh_vien.some(member => 
      member.user_id._id.toString() === userId.toString()
    );
    const hasAccess = isCreator || isMember;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập nhóm này'
      });
    }

    res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết nhóm:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy chi tiết nhóm'
    });
  }
};

// @desc    Tạo nhóm mới
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
  try {
    const { ten_nhom, mo_ta, tien_te_mac_dinh, kieu_chia_mac_dinh } = req.body;
    const userId = req.user._id;

    // Validate dữ liệu đầu vào
    if (!ten_nhom || ten_nhom.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tên nhóm là bắt buộc'
      });
    }

    // Tạo nhóm mới
    const group = new Group({
      nguoi_tao: userId,
      ten_nhom: ten_nhom.trim(),
      mo_ta: mo_ta?.trim() || '',
      tien_te_mac_dinh: tien_te_mac_dinh || 'VND',
      kieu_chia_mac_dinh: kieu_chia_mac_dinh || 'deu'
    });

    const savedGroup = await group.save();
    
    // Populate thông tin người tạo và thành viên
    await savedGroup.populate('nguoi_tao', 'fullName email avatar');
    await savedGroup.populate('thanh_vien.user_id', 'fullName email avatar');

    res.status(201).json({
      success: true,
      message: 'Tạo nhóm thành công',
      data: savedGroup
    });
  } catch (error) {
    console.error('Lỗi khi tạo nhóm:', error);
    
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
      message: 'Lỗi server khi tạo nhóm'
    });
  }
};

// @desc    Cập nhật thông tin nhóm
// @route   PUT /api/groups/:id
// @access  Private
const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { ten_nhom, mo_ta, tien_te_mac_dinh, kieu_chia_mac_dinh, trang_thai } = req.body;
    const userId = req.user._id;

    // Tìm nhóm
    let group;
    if (mongoose.Types.ObjectId.isValid(id)) {
      group = await Group.findById(id);
    } else {
      group = await Group.findOne({ id_nhom: id });
    }

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhóm'
      });
    }

    // Kiểm tra quyền admin
    const isAdmin = group.nguoi_tao.toString() === userId ||
                    group.thanh_vien.some(member => 
                      member.user_id.toString() === userId && member.vai_tro === 'admin'
                    );

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có thể cập nhật thông tin nhóm'
      });
    }

    // Cập nhật thông tin
    if (ten_nhom !== undefined) group.ten_nhom = ten_nhom.trim();
    if (mo_ta !== undefined) group.mo_ta = mo_ta.trim();
    if (tien_te_mac_dinh !== undefined) group.tien_te_mac_dinh = tien_te_mac_dinh;
    if (kieu_chia_mac_dinh !== undefined) group.kieu_chia_mac_dinh = kieu_chia_mac_dinh;
    if (trang_thai !== undefined) group.trang_thai = trang_thai;

    const updatedGroup = await group.save();
    
    // Populate thông tin
    await updatedGroup.populate('nguoi_tao', 'fullName email avatar');
    await updatedGroup.populate('thanh_vien.user_id', 'fullName email avatar');

    res.status(200).json({
      success: true,
      message: 'Cập nhật nhóm thành công',
      data: updatedGroup
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật nhóm:', error);
    
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
      message: 'Lỗi server khi cập nhật nhóm'
    });
  }
};

// @desc    Xóa nhóm
// @route   DELETE /api/groups/:id
// @access  Private
const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirm_text } = req.body;
    const userId = req.user._id;

    // Tìm nhóm
    let group;
    if (mongoose.Types.ObjectId.isValid(id)) {
      group = await Group.findById(id);
    } else {
      group = await Group.findOne({ id_nhom: id });
    }

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhóm'
      });
    }

    // Chỉ người tạo mới có thể xóa nhóm
    if (group.nguoi_tao.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ người tạo nhóm mới có thể xóa nhóm'
      });
    }

    // Yêu cầu xác nhận bằng cách nhập tên nhóm
    if (confirm_text !== group.ten_nhom) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập chính xác tên nhóm để xác nhận xóa'
      });
    }

    // Xóa tất cả invites liên quan đến nhóm này
    await Invite.deleteMany({ nhom_id: group._id });

    // Xóa nhóm
    await Group.findByIdAndDelete(group._id);

    res.status(200).json({
      success: true,
      message: `Xóa nhóm "${group.ten_nhom}" thành công`,
      data: {
        deleted_group: group.ten_nhom,
        deleted_invites: await Invite.countDocuments({ nhom_id: group._id })
      }
    });
  } catch (error) {
    console.error('Lỗi khi xóa nhóm:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa nhóm'
    });
  }
};

// @desc    Thêm thành viên vào nhóm hoặc gửi lời mời
// @route   POST /api/groups/:id/members
// @access  Private
const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, vai_tro = 'member', ghi_chu = '' } = req.body;
    const userId = req.user._id;

    // Validate email
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email là bắt buộc'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Tìm nhóm
    let group;
    if (mongoose.Types.ObjectId.isValid(id)) {
      group = await Group.findById(id);
    } else {
      group = await Group.findOne({ id_nhom: id });
    }

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhóm'
      });
    }

    // Kiểm tra quyền (chỉ creator)
    const isCreator = group.nguoi_tao.toString() === userId.toString();

    if (!isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ người tạo nhóm mới có thể thêm thành viên'
      });
    }

    // Kiểm tra email đã là thành viên chưa
    const isAlreadyMember = await group.isMemberByEmail(normalizedEmail);
    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'Email này đã là thành viên của nhóm'
      });
    }

    // Kiểm tra đã có lời mời pending chưa
    const existingInvite = await Invite.findOne({
      nhom_id: group._id,
      email_duoc_moi: normalizedEmail,
      trang_thai: 'pending',
      thoi_gian_het_han: { $gt: new Date() }
    });

    if (existingInvite) {
      return res.status(400).json({
        success: false,
        message: 'Đã có lời mời pending cho email này'
      });
    }

    // Luôn tạo lời mời thay vì thêm trực tiếp
    const userToAdd = await User.findOne({ email: normalizedEmail });
    
    const invite = new Invite({
      nhom_id: group._id,
      nguoi_moi: userId,
      email_duoc_moi: normalizedEmail,
      vai_tro,
      ghi_chu
    });

    // Save with explicit session to ensure transaction
    const savedInvite = await invite.save();
    
    // Immediate verification
    const verifyInvite = await Invite.findById(savedInvite._id);
    if (!verifyInvite) {
      throw new Error('Invite không được lưu vào database');
    }
    
    // Populate thông tin
    await savedInvite.populate('nhom_id', 'ten_nhom mo_ta');
    await savedInvite.populate('nguoi_moi', 'fullName email');

    const message = userToAdd 
      ? 'Gửi lời mời thành công. Người dùng cần chấp nhận lời mời để tham gia nhóm.'
      : 'Gửi lời mời thành công. Người dùng sẽ nhận được lời mời khi đăng ký tài khoản.';

    res.status(201).json({
      success: true,
      message: message,
      data: savedInvite,
      type: 'invite_sent',
      user_exists: !!userToAdd
    });
  } catch (error) {
    console.error('Lỗi khi thêm thành viên:', error);
    
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
      message: 'Lỗi server khi thêm thành viên'
    });
  }
};

// @desc    Xóa thành viên khỏi nhóm
// @route   DELETE /api/groups/:id/members/:memberId
// @access  Private
const removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    // Tìm nhóm
    let group;
    if (mongoose.Types.ObjectId.isValid(id)) {
      group = await Group.findById(id);
    } else {
      group = await Group.findOne({ id_nhom: id });
    }

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhóm'
      });
    }

    // Tìm thông tin thành viên bị xóa
    const memberToRemove = group.thanh_vien.find(member => 
      member.user_id.toString() === memberId.toString()
    );

    if (!memberToRemove) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thành viên trong nhóm'
      });
    }

    // Populate để lấy tên thành viên
    await group.populate('thanh_vien.user_id', 'fullName email');
    const memberName = memberToRemove.user_id.fullName;

    // Kiểm tra quyền (chỉ creator hoặc chính user đó)
    const isCreator = group.nguoi_tao.toString() === userId.toString();
    const isSelf = memberId.toString() === userId.toString();

    if (!isCreator && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ người tạo nhóm hoặc chính bản thân mới có thể xóa thành viên'
      });
    }

    // Không thể xóa người tạo nhóm
    if (group.nguoi_tao.toString() === memberId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa người tạo nhóm'
      });
    }

    // Kiểm tra nếu đây là admin cuối cùng (ngoài creator)
    const adminCount = group.thanh_vien.filter(member => 
      member.vai_tro === 'admin' && member.user_id._id.toString() !== memberId.toString()
    ).length;
    
    const memberIsNotCreator = group.nguoi_tao.toString() !== memberId.toString();
    
    if (memberToRemove.vai_tro === 'admin' && adminCount === 0 && memberIsNotCreator) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa admin cuối cùng của nhóm'
      });
    }

    // Xóa thành viên
    group.removeMember(memberId);
    await group.save();

    // Populate lại để trả về data đầy đủ
    await group.populate('nguoi_tao', 'fullName email avatar');
    await group.populate('thanh_vien.user_id', 'fullName email avatar');

    const actionMessage = isSelf 
      ? `${memberName} đã rời khỏi nhóm`
      : `Đã xóa ${memberName} khỏi nhóm`;


    res.status(200).json({
      success: true,
      message: actionMessage,
      data: group,
      removed_member: {
        name: memberName,
        reason: reason || (isSelf ? 'Tự rời nhóm' : 'Bị xóa bởi admin'),
        member_id: memberId
      },
      action_type: isSelf ? 'self_leave' : 'admin_remove'
    });
  } catch (error) {
    console.error('Lỗi khi xóa thành viên:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa thành viên'
    });
  }
};

// @desc    Cập nhật vai trò thành viên
// @route   PUT /api/groups/:id/members/:memberId
// @access  Private
const updateMemberRole = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const { vai_tro } = req.body;
    const userId = req.user._id;

    // Tìm nhóm
    let group;
    if (mongoose.Types.ObjectId.isValid(id)) {
      group = await Group.findById(id);
    } else {
      group = await Group.findOne({ id_nhom: id });
    }

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhóm'
      });
    }

    // Chỉ admin mới có thể cập nhật vai trò
    const isAdmin = group.nguoi_tao.toString() === userId ||
                    group.thanh_vien.some(member => 
                      member.user_id.toString() === userId && member.vai_tro === 'admin'
                    );

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có thể cập nhật vai trò thành viên'
      });
    }

    // Không thể thay đổi vai trò người tạo nhóm
    if (group.nguoi_tao.toString() === memberId) {
      return res.status(400).json({
        success: false,
        message: 'Không thể thay đổi vai trò người tạo nhóm'
      });
    }

    // Cập nhật vai trò
    group.updateMemberRole(memberId, vai_tro);
    await group.save();

    // Populate và trả về
    await group.populate('nguoi_tao', 'fullName email avatar');
    await group.populate('thanh_vien.user_id', 'fullName email avatar');

    res.status(200).json({
      success: true,
      message: 'Cập nhật vai trò thành công',
      data: group
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật vai trò:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật vai trò'
    });
  }
};

module.exports = {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  updateMemberRole
};
