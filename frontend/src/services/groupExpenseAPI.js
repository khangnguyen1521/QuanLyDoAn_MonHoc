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

// Group Expense API functions
export const groupExpenseAPI = {
  // Lấy danh sách chi tiêu của nhóm
  getGroupExpenses: async (groupId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    
    const queryString = params.toString();
    const url = `${API_BASE_URL}/groups/${groupId}/expenses${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(),
    });
    
    return await handleResponse(response);
  },

  // Tạo chi tiêu mới
  createGroupExpense: async (groupId, expenseData) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/expenses`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(expenseData),
    });
    
    return await handleResponse(response);
  },

  // Cập nhật trạng thái thanh toán
  updatePaymentStatus: async (groupId, expenseId, paymentData) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/expenses/${expenseId}/payment`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(paymentData),
    });
    
    return await handleResponse(response);
  },

  // Lấy tổng kết tài chính nhóm
  getGroupExpenseSummary: async (groupId) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/expenses/summary`, {
      method: 'GET',
      headers: createHeaders(),
    });
    
    return await handleResponse(response);
  }
};

// Helper functions
export const groupExpenseHelpers = {
  // Format tiền tệ
  formatCurrency: (amount, currency = 'VND') => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  // Tính phân chia đều
  calculateEqualSplit: (totalAmount, memberCount) => {
    return Math.round(totalAmount / memberCount);
  },

  // Tính phân chia theo phần trăm
  calculatePercentageSplit: (totalAmount, percentage) => {
    return Math.round(totalAmount * percentage / 100);
  },

  // Tính phân chia theo cổ phần
  calculateShareSplit: (totalAmount, userShares, totalShares) => {
    return Math.round(totalAmount * userShares / totalShares);
  },

  // Get payment status color
  getPaymentStatusColor: (status) => {
    switch (status) {
      case 'da_tra':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'da_xac_nhan':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'chua_tra':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  },

  // Get payment status text
  getPaymentStatusText: (status) => {
    switch (status) {
      case 'da_tra':
        return 'Đã trả';
      case 'da_xac_nhan':
        return 'Đã xác nhận';
      case 'chua_tra':
        return 'Chưa trả';
      default:
        return status;
    }
  },

  // Get category text
  getCategoryText: (category) => {
    const categories = {
      'an_uong': 'Ăn uống',
      'di_chuyen': 'Di chuyển',
      'giai_tri': 'Giải trí',
      'mua_sam': 'Mua sắm',
      'o_tro': 'Ở trọ',
      'y_te': 'Y tế',
      'khac': 'Khác'
    };
    return categories[category] || category;
  },

  // Get split type text
  getSplitTypeText: (splitType) => {
    const types = {
      'deu': 'Chia đều',
      'phan_tram': 'Theo phần trăm',
      'co_phan': 'Theo cổ phần',
      'tuy_chinh': 'Tùy chỉnh'
    };
    return types[splitType] || splitType;
  },

  // Validate expense data
  validateExpenseData: (expenseData) => {
    const errors = [];
    
    if (!expenseData.tieu_de || expenseData.tieu_de.trim().length === 0) {
      errors.push('Tiêu đề chi tiêu là bắt buộc');
    }
    
    if (!expenseData.tong_tien || expenseData.tong_tien <= 0) {
      errors.push('Tổng tiền phải lớn hơn 0');
    }
    
    if (!expenseData.nguoi_tra) {
      errors.push('Người trả tiền là bắt buộc');
    }
    
    if (!expenseData.phan_chia || expenseData.phan_chia.length === 0) {
      errors.push('Phải có ít nhất một người tham gia chia tiền');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Constants
  CATEGORIES: [
    { value: 'an_uong', label: 'Ăn uống' },
    { value: 'di_chuyen', label: 'Di chuyển' },
    { value: 'giai_tri', label: 'Giải trí' },
    { value: 'mua_sam', label: 'Mua sắm' },
    { value: 'o_tro', label: 'Ở trọ' },
    { value: 'y_te', label: 'Y tế' },
    { value: 'khac', label: 'Khác' }
  ],

  SPLIT_TYPES: [
    { value: 'deu', label: 'Chia đều' },
    { value: 'phan_tram', label: 'Theo phần trăm' },
    { value: 'co_phan', label: 'Theo cổ phần' },
    { value: 'tuy_chinh', label: 'Tùy chỉnh' }
  ],

  PAYMENT_STATUS: [
    { value: 'chua_tra', label: 'Chưa trả' },
    { value: 'da_tra', label: 'Đã trả' },
    { value: 'da_xac_nhan', label: 'Đã xác nhận' }
  ]
};

export default {
  groupExpenseAPI,
  groupExpenseHelpers
};
