const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const inviteSchema = new mongoose.Schema({
  id_loi_moi: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true
  },
  nhom_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: [true, 'ID nhóm là bắt buộc']
  },
  nguoi_moi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Người mời là bắt buộc']
  },
  email_duoc_moi: {
    type: String,
    required: [true, 'Email được mời là bắt buộc'],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Email không hợp lệ'
    ]
  },
  vai_tro: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member'
  },
  trang_thai: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'expired'],
    default: 'pending'
  },
  token_loi_moi: {
    type: String,
    default: uuidv4,
    unique: true
  },
  thoi_gian_het_han: {
    type: Date,
    default: function() {
      // Lời mời có hiệu lực trong 7 ngày
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
  },
  thoi_gian_gui: {
    type: Date,
    default: Date.now
  },
  thoi_gian_phan_hoi: {
    type: Date
  },
  ghi_chu: {
    type: String,
    maxlength: [200, 'Ghi chú không được vượt quá 200 ký tự'],
    default: ''
  }
}, {
  timestamps: { 
    createdAt: 'thoi_gian_gui', 
    updatedAt: 'thoi_gian_cap_nhat' 
  }
});

// Index cho tìm kiếm nhanh
inviteSchema.index({ email_duoc_moi: 1 });
inviteSchema.index({ nhom_id: 1 });
inviteSchema.index({ nguoi_moi: 1 });
inviteSchema.index({ trang_thai: 1 });
inviteSchema.index({ thoi_gian_het_han: 1 });

// Method để kiểm tra lời mời có hết hạn không
inviteSchema.methods.isExpired = function() {
  return new Date() > this.thoi_gian_het_han;
};

// Method để chấp nhận lời mời
inviteSchema.methods.accept = function() {
  this.trang_thai = 'accepted';
  this.thoi_gian_phan_hoi = new Date();
  return this.save();
};

// Method để từ chối lời mời
inviteSchema.methods.decline = function() {
  this.trang_thai = 'declined';
  this.thoi_gian_phan_hoi = new Date();
  return this.save();
};

// Method để đánh dấu hết hạn
inviteSchema.methods.expire = function() {
  this.trang_thai = 'expired';
  return this.save();
};

// Static method để tìm lời mời pending theo email
inviteSchema.statics.findPendingByEmail = function(email) {
  return this.find({
    email_duoc_moi: email.toLowerCase(),
    trang_thai: 'pending',
    thoi_gian_het_han: { $gt: new Date() }
  }).populate('nhom_id', 'ten_nhom mo_ta')
    .populate('nguoi_moi', 'fullName email');
};

// Static method để tìm lời mời theo nhóm
inviteSchema.statics.findByGroup = function(groupId) {
  return this.find({
    nhom_id: groupId
  }).populate('nguoi_moi', 'fullName email')
    .sort({ thoi_gian_gui: -1 });
};

// Static method để tìm lời mời theo token
inviteSchema.statics.findByToken = function(token) {
  return this.findOne({
    token_loi_moi: token,
    trang_thai: 'pending',
    thoi_gian_het_han: { $gt: new Date() }
  }).populate('nhom_id')
    .populate('nguoi_moi', 'fullName email');
};

// Removed problematic pre('find') middleware that might cause transaction issues

// Virtual để kiểm tra có thể chấp nhận không
inviteSchema.virtual('co_the_chap_nhan').get(function() {
  return this.trang_thai === 'pending' && !this.isExpired();
});

// Đảm bảo virtual fields được include khi convert to JSON
inviteSchema.set('toJSON', { virtuals: true });
inviteSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Invite', inviteSchema, 'invites');
