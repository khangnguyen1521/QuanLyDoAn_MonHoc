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

// Invite API functions
export const inviteAPI = {
  // Tạo lời mời
  createInvite: async (inviteData) => {
    const response = await fetch(`${API_BASE_URL}/invites`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(inviteData),
    });
    
    return await handleResponse(response);
  },

  // Lấy lời mời của nhóm
  getGroupInvites: async (groupId) => {
    const response = await fetch(`${API_BASE_URL}/invites/group/${groupId}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    
    return await handleResponse(response);
  },

  // Lấy lời mời của user hiện tại
  getMyInvites: async () => {
    const response = await fetch(`${API_BASE_URL}/invites/my-invites`, {
      method: 'GET',
      headers: createHeaders(),
    });
    
    return await handleResponse(response);
  },

  // Chấp nhận lời mời
  acceptInvite: async (inviteId) => {
    const response = await fetch(`${API_BASE_URL}/invites/${inviteId}/accept`, {
      method: 'POST',
      headers: createHeaders(),
    });
    
    return await handleResponse(response);
  },

  // Từ chối lời mời
  declineInvite: async (inviteId) => {
    const response = await fetch(`${API_BASE_URL}/invites/${inviteId}/decline`, {
      method: 'POST',
      headers: createHeaders(),
    });
    
    return await handleResponse(response);
  },

  // Hủy lời mời
  cancelInvite: async (inviteId) => {
    const response = await fetch(`${API_BASE_URL}/invites/${inviteId}`, {
      method: 'DELETE',
      headers: createHeaders(),
    });
    
    return await handleResponse(response);
  }
};

// Invite helper functions
export const inviteHelpers = {
  // Format thời gian hết hạn
  formatExpiryTime: (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffMs = expiry - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return 'Đã hết hạn';
    } else if (diffDays === 1) {
      return 'Hết hạn trong 1 ngày';
    } else {
      return `Hết hạn trong ${diffDays} ngày`;
    }
  },

  // Kiểm tra lời mời có hết hạn không
  isExpired: (expiryDate) => {
    return new Date() > new Date(expiryDate);
  },

  // Get status color for UI
  getStatusColor: (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'declined':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  },

  // Get status text
  getStatusText: (status) => {
    switch (status) {
      case 'pending':
        return 'Đang chờ';
      case 'accepted':
        return 'Đã chấp nhận';
      case 'declined':
        return 'Đã từ chối';
      case 'expired':
        return 'Đã hết hạn';
      default:
        return status;
    }
  },

  // Validate email
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Format invite for display
  formatInvite: (invite) => {
    return {
      ...invite,
      thoi_gian_gui_formatted: new Date(invite.thoi_gian_gui).toLocaleDateString('vi-VN'),
      thoi_gian_het_han_formatted: new Date(invite.thoi_gian_het_han).toLocaleDateString('vi-VN'),
      expiry_status: inviteHelpers.formatExpiryTime(invite.thoi_gian_het_han),
      is_expired: inviteHelpers.isExpired(invite.thoi_gian_het_han),
      status_color: inviteHelpers.getStatusColor(invite.trang_thai),
      status_text: inviteHelpers.getStatusText(invite.trang_thai)
    };
  }
};

export default {
  inviteAPI,
  inviteHelpers
};
