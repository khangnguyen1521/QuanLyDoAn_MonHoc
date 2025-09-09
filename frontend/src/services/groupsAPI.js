// Base API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Utility function để handle response
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Có lỗi xảy ra');
  }
  
  return data;
};

// Utility function để tạo request headers
const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

// Groups API functions
export const groupsAPI = {
  // Lấy danh sách tất cả nhóm của user
  getGroups: async () => {
    const response = await fetch(`${API_BASE_URL}/groups`, {
      method: 'GET',
      headers: createHeaders(),
    });
    
    return await handleResponse(response);
  },

  // Lấy chi tiết một nhóm
  getGroup: async (groupId) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    
    return await handleResponse(response);
  },

  // Tạo nhóm mới
  createGroup: async (groupData) => {
    const response = await fetch(`${API_BASE_URL}/groups`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(groupData),
    });
    
    return await handleResponse(response);
  },

  // Cập nhật thông tin nhóm
  updateGroup: async (groupId, groupData) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(groupData),
    });
    
    return await handleResponse(response);
  },

  // Xóa nhóm
  deleteGroup: async (groupId, confirmText) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
      method: 'DELETE',
      headers: createHeaders(),
      body: JSON.stringify({ confirm_text: confirmText }),
    });
    
    return await handleResponse(response);
  },

  // Thêm thành viên vào nhóm
  addMember: async (groupId, memberData) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(memberData),
    });
    
    return await handleResponse(response);
  },

  // Xóa thành viên khỏi nhóm
  removeMember: async (groupId, memberId, reason = '') => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members/${memberId}`, {
      method: 'DELETE',
      headers: createHeaders(),
      body: JSON.stringify({ reason }),
    });
    
    return await handleResponse(response);
  },

  // Cập nhật vai trò thành viên
  updateMemberRole: async (groupId, memberId, roleData) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members/${memberId}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(roleData),
    });
    
    return await handleResponse(response);
  },

  // Rời khỏi nhóm (thành viên tự rời)
  leaveGroup: async (groupId, userId) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members/${userId}`, {
      method: 'DELETE',
      headers: createHeaders(),
    });
    
    return await handleResponse(response);
  }
};

// Groups helper functions
export const groupsHelpers = {
  // Kiểm tra user có phải admin của nhóm không
  isGroupAdmin: (group, userId) => {
    if (!group || !userId) {
      return false;
    }
    
    // Kiểm tra nếu là người tạo
    const creatorId = group.nguoi_tao?._id || group.nguoi_tao;
    const isCreator = creatorId === userId;
    
    if (isCreator) {
      return true;
    }
    
    // Kiểm tra nếu là admin trong danh sách thành viên
    const member = group.thanh_vien?.find(member => {
      const memberId = member.user_id?._id || member.user_id;
      return memberId === userId;
    });
    
    return member?.vai_tro === 'admin';
  },

  // Kiểm tra user có phải thành viên của nhóm không
  isGroupMember: (group, userId) => {
    if (!group || !userId) return false;
    
    // Kiểm tra nếu là người tạo
    if (group.nguoi_tao?._id === userId || group.nguoi_tao === userId) {
      return true;
    }
    
    // Kiểm tra trong danh sách thành viên
    return group.thanh_vien?.some(member => 
      (member.user_id?._id || member.user_id) === userId
    );
  },

  // Lấy vai trò của user trong nhóm
  getUserRole: (group, userId) => {
    if (!group || !userId) return null;
    
    // Kiểm tra nếu là người tạo
    if (group.nguoi_tao?._id === userId || group.nguoi_tao === userId) {
      return 'creator';
    }
    
    // Tìm trong danh sách thành viên
    const member = group.thanh_vien?.find(member => 
      (member.user_id?._id || member.user_id) === userId
    );
    
    return member?.vai_tro || null;
  },

  // Format thông tin nhóm để hiển thị
  formatGroupInfo: (group) => {
    if (!group) return null;
    
    return {
      ...group,
      so_luong_thanh_vien: group.thanh_vien?.length || 0,
      nguoi_tao_ten: group.nguoi_tao?.fullName || 'Không xác định',
      thoi_gian_tao_formatted: new Date(group.thoi_gian_tao).toLocaleDateString('vi-VN'),
      thoi_gian_cap_nhat_formatted: new Date(group.thoi_gian_cap_nhat).toLocaleDateString('vi-VN')
    };
  },

  // Validate dữ liệu nhóm
  validateGroupData: (groupData) => {
    const errors = [];
    
    if (!groupData.ten_nhom || groupData.ten_nhom.trim().length === 0) {
      errors.push('Tên nhóm là bắt buộc');
    }
    
    if (groupData.ten_nhom && groupData.ten_nhom.length > 100) {
      errors.push('Tên nhóm không được vượt quá 100 ký tự');
    }
    
    if (groupData.mo_ta && groupData.mo_ta.length > 500) {
      errors.push('Mô tả không được vượt quá 500 ký tự');
    }
    
    const validCurrencies = ['VND', 'USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK'];
    if (groupData.tien_te_mac_dinh && !validCurrencies.includes(groupData.tien_te_mac_dinh)) {
      errors.push('Tiền tệ không hợp lệ');
    }
    
    const validSplitTypes = ['deu', 'phan_tram', 'co_phan'];
    if (groupData.kieu_chia_mac_dinh && !validSplitTypes.includes(groupData.kieu_chia_mac_dinh)) {
      errors.push('Kiểu chia không hợp lệ');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Constants cho dropdown options
  CURRENCIES: [
    { value: 'VND', label: 'VND - Việt Nam Đồng' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'JPY', label: 'JPY - Japanese Yen' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'AUD', label: 'AUD - Australian Dollar' },
    { value: 'CAD', label: 'CAD - Canadian Dollar' },
    { value: 'CHF', label: 'CHF - Swiss Franc' },
    { value: 'CNY', label: 'CNY - Chinese Yuan' },
    { value: 'SEK', label: 'SEK - Swedish Krona' }
  ],

  SPLIT_TYPES: [
    { value: 'deu', label: 'Chia đều' },
    { value: 'phan_tram', label: 'Theo phần trăm' },
    { value: 'co_phan', label: 'Theo cổ phần' }
  ],

  MEMBER_ROLES: [
    { value: 'admin', label: 'Quản trị viên' },
    { value: 'member', label: 'Thành viên' }
  ],

  GROUP_STATUS: [
    { value: 'active', label: 'Đang hoạt động' },
    { value: 'inactive', label: 'Tạm dừng' },
    { value: 'archived', label: 'Đã lưu trữ' }
  ]
};

export default {
  groupsAPI,
  groupsHelpers
};
