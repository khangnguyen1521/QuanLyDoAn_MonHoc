const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const groupExpenseSchema = new mongoose.Schema({
  id_chi_tieu: {
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
  nguoi_tao: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Người tạo chi tiêu là bắt buộc']
  },
  tieu_de: {
    type: String,
    required: [true, 'Tiêu đề chi tiêu là bắt buộc'],
    trim: true,
    maxlength: [200, 'Tiêu đề không được vượt quá 200 ký tự']
  },
  mo_ta: {
    type: String,
    trim: true,
    maxlength: [1000, 'Mô tả không được vượt quá 1000 ký tự'],
    default: ''
  },
  tong_tien: {
    type: Number,
    required: [true, 'Tổng tiền là bắt buộc'],
    min: [0, 'Tổng tiền phải lớn hơn 0']
  },
  tien_te: {
    type: String,
    required: [true, 'Tiền tệ là bắt buộc'],
    enum: ['VND', 'USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK'],
    default: 'VND'
  },
  danh_muc: {
    type: String,
    enum: ['an_uong', 'di_chuyen', 'giai_tri', 'mua_sam', 'o_tro', 'y_te', 'khac'],
    default: 'khac'
  },
  kieu_chia: {
    type: String,
    enum: ['deu', 'phan_tram', 'co_phan', 'tuy_chinh'],
    required: [true, 'Kiểu chia là bắt buộc']
  },
  nguoi_tra: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Người trả tiền là bắt buộc']
  },
  phan_chia: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    so_tien: {
      type: Number,
      required: true,
      min: 0
    },
    phan_tram: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    co_phan: {
      type: Number,
      min: 0,
      default: 1
    },
    trang_thai_thanh_toan: {
      type: String,
      enum: ['chua_tra', 'da_tra', 'da_xac_nhan'],
      default: 'chua_tra'
    },
    ngay_thanh_toan: {
      type: Date
    },
    ghi_chu: {
      type: String,
      maxlength: [200, 'Ghi chú không được vượt quá 200 ký tự'],
      default: ''
    }
  }],
  hinh_anh: [{
    url: String,
    mo_ta: String,
    kich_thuoc: Number,
    loai_file: String
  }],
  trang_thai: {
    type: String,
    enum: ['draft', 'active', 'settled', 'cancelled'],
    default: 'active'
  },
  ngay_chi_tieu: {
    type: Date,
    required: [true, 'Ngày chi tiêu là bắt buộc'],
    default: Date.now
  },
  dia_diem: {
    type: String,
    maxlength: [200, 'Địa điểm không được vượt quá 200 ký tự'],
    default: ''
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
groupExpenseSchema.index({ nhom_id: 1 });
groupExpenseSchema.index({ nguoi_tao: 1 });
groupExpenseSchema.index({ nguoi_tra: 1 });
groupExpenseSchema.index({ 'phan_chia.user_id': 1 });
groupExpenseSchema.index({ ngay_chi_tieu: -1 });
groupExpenseSchema.index({ trang_thai: 1 });

// Virtual để tính tổng đã thanh toán
groupExpenseSchema.virtual('tong_da_thanh_toan').get(function() {
  return this.phan_chia.reduce((total, item) => {
    return total + (item.trang_thai_thanh_toan !== 'chua_tra' ? item.so_tien : 0);
  }, 0);
});

// Virtual để tính tổng chưa thanh toán
groupExpenseSchema.virtual('tong_chua_thanh_toan').get(function() {
  return this.phan_chia.reduce((total, item) => {
    return total + (item.trang_thai_thanh_toan === 'chua_tra' ? item.so_tien : 0);
  }, 0);
});

// Method để tính phân chia tự động
groupExpenseSchema.methods.calculateSplit = function(splitType = null) {
  const type = splitType || this.kieu_chia;
  const memberCount = this.phan_chia.length;
  
  if (memberCount === 0) return;
  
  switch (type) {
    case 'deu':
      const equalAmount = Math.round(this.tong_tien / memberCount);
      this.phan_chia.forEach(item => {
        item.so_tien = equalAmount;
        item.phan_tram = (equalAmount / this.tong_tien * 100).toFixed(2);
      });
      break;
      
    case 'phan_tram':
      this.phan_chia.forEach(item => {
        item.so_tien = Math.round(this.tong_tien * item.phan_tram / 100);
      });
      break;
      
    case 'co_phan':
      const totalShares = this.phan_chia.reduce((total, item) => total + item.co_phan, 0);
      this.phan_chia.forEach(item => {
        const shareRatio = item.co_phan / totalShares;
        item.so_tien = Math.round(this.tong_tien * shareRatio);
        item.phan_tram = (shareRatio * 100).toFixed(2);
      });
      break;
  }
  
  return this;
};

// Method để cập nhật trạng thái thanh toán
groupExpenseSchema.methods.updatePaymentStatus = function(userId, status, paymentDate = null) {
  const member = this.phan_chia.find(item => 
    item.user_id.toString() === userId.toString()
  );
  
  if (member) {
    member.trang_thai_thanh_toan = status;
    if (paymentDate) {
      member.ngay_thanh_toan = paymentDate;
    }
  }
  
  return this;
};

// Static method để tìm chi tiêu theo nhóm
groupExpenseSchema.statics.findByGroup = function(groupId, options = {}) {
  const query = this.find({ nhom_id: groupId });
  
  if (options.status) {
    query.where({ trang_thai: options.status });
  }
  
  if (options.dateFrom) {
    query.where({ ngay_chi_tieu: { $gte: options.dateFrom } });
  }
  
  if (options.dateTo) {
    query.where({ ngay_chi_tieu: { $lte: options.dateTo } });
  }
  
  return query
    .populate('nguoi_tao', 'fullName email avatar')
    .populate('nguoi_tra', 'fullName email avatar')
    .populate('phan_chia.user_id', 'fullName email avatar')
    .sort({ ngay_chi_tieu: -1 });
};

// Static method để tìm chi tiêu của user trong nhóm
groupExpenseSchema.statics.findByUserInGroup = function(userId, groupId) {
  return this.find({
    nhom_id: groupId,
    $or: [
      { nguoi_tao: userId },
      { nguoi_tra: userId },
      { 'phan_chia.user_id': userId }
    ]
  }).populate('nguoi_tao', 'fullName email avatar')
    .populate('nguoi_tra', 'fullName email avatar')
    .populate('phan_chia.user_id', 'fullName email avatar')
    .sort({ ngay_chi_tieu: -1 });
};

// Virtual fields cho JSON
groupExpenseSchema.set('toJSON', { virtuals: true });
groupExpenseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('GroupExpense', groupExpenseSchema);
