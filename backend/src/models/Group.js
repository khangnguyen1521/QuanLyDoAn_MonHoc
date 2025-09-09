const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const groupSchema = new mongoose.Schema({
  id_nhom: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true
  },
  nguoi_tao: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Người tạo nhóm là bắt buộc']
  },
  ten_nhom: {
    type: String,
    required: [true, 'Tên nhóm là bắt buộc'],
    trim: true,
    maxlength: [100, 'Tên nhóm không được vượt quá 100 ký tự']
  },
  mo_ta: {
    type: String,
    trim: true,
    maxlength: [500, 'Mô tả không được vượt quá 500 ký tự'],
    default: ''
  },
  tien_te_mac_dinh: {
    type: String,
    enum: ['VND', 'USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK'],
    default: 'VND',
    validate: {
      validator: function(v) {
        return /^[A-Z]{3}$/.test(v);
      },
      message: 'Tiền tệ phải là mã ISO-4217 3 ký tự'
    }
  },
  kieu_chia_mac_dinh: {
    type: String,
    enum: ['deu', 'phan_tram', 'co_phan'],
    default: 'deu'
  },
  thanh_vien: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    vai_tro: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    ngay_tham_gia: {
      type: Date,
      default: Date.now
    },
    trang_thai: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active'
    }
  }],
  trang_thai: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  thoi_gian_tao: {
    type: Date,
    default: Date.now
  },
  thoi_gian_cap_nhat: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { 
    createdAt: 'thoi_gian_tao', 
    updatedAt: 'thoi_gian_cap_nhat' 
  }
});

// Index cho tìm kiếm nhanh
groupSchema.index({ nguoi_tao: 1 });
groupSchema.index({ 'thanh_vien.user_id': 1 });
groupSchema.index({ ten_nhom: 'text', mo_ta: 'text' });

// Middleware để tự động thêm người tạo vào danh sách thành viên
groupSchema.pre('save', function(next) {
  if (this.isNew) {
    // Thêm người tạo vào danh sách thành viên với vai trò admin
    const creatorExists = this.thanh_vien.some(member => 
      member.user_id.toString() === this.nguoi_tao.toString()
    );
    
    if (!creatorExists) {
      this.thanh_vien.push({
        user_id: this.nguoi_tao,
        vai_tro: 'admin',
        ngay_tham_gia: new Date(),
        trang_thai: 'active'
      });
    }
  }
  next();
});

// Method để thêm thành viên
groupSchema.methods.addMember = function(userId, role = 'member') {
  const memberExists = this.thanh_vien.some(member => 
    member.user_id.toString() === userId.toString()
  );
  
  if (!memberExists) {
    this.thanh_vien.push({
      user_id: userId,
      vai_tro: role,
      ngay_tham_gia: new Date(),
      trang_thai: 'active'
    });
  }
  
  return this;
};

// Method để kiểm tra email đã là thành viên chưa
groupSchema.methods.isMemberByEmail = async function(email) {
  await this.populate('thanh_vien.user_id', 'email');
  return this.thanh_vien.some(member => 
    member.user_id.email.toLowerCase() === email.toLowerCase()
  );
};

// Method để kiểm tra user đã là thành viên chưa
groupSchema.methods.isMemberByUserId = function(userId) {
  return this.thanh_vien.some(member => 
    member.user_id.toString() === userId.toString()
  );
};

// Method để xóa thành viên
groupSchema.methods.removeMember = function(userId) {
  this.thanh_vien = this.thanh_vien.filter(member => 
    member.user_id.toString() !== userId.toString()
  );
  return this;
};

// Method để cập nhật vai trò thành viên
groupSchema.methods.updateMemberRole = function(userId, newRole) {
  const member = this.thanh_vien.find(member => 
    member.user_id.toString() === userId.toString()
  );
  
  if (member) {
    member.vai_tro = newRole;
  }
  
  return this;
};

// Static method để tìm nhóm theo user
groupSchema.statics.findByUser = function(userId) {
  return this.find({
    $or: [
      { nguoi_tao: userId },
      { 'thanh_vien.user_id': userId }
    ]
  }).populate('nguoi_tao', 'fullName email')
    .populate('thanh_vien.user_id', 'fullName email avatar');
};

// Static method để tìm nhóm mà user là admin
groupSchema.statics.findByAdmin = function(userId) {
  return this.find({
    $or: [
      { nguoi_tao: userId },
      { 
        'thanh_vien': {
          $elemMatch: {
            user_id: userId,
            vai_tro: 'admin'
          }
        }
      }
    ]
  }).populate('nguoi_tao', 'fullName email')
    .populate('thanh_vien.user_id', 'fullName email avatar');
};

// Virtual để lấy số lượng thành viên
groupSchema.virtual('so_luong_thanh_vien').get(function() {
  return this.thanh_vien ? this.thanh_vien.length : 0;
});

// Đảm bảo virtual fields được include khi convert to JSON
groupSchema.set('toJSON', { virtuals: true });
groupSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Group', groupSchema);
