// Financial API functions
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Utility function để handle response
const handleResponse = async (response) => {
  let data;
  
  try {
    data = await response.json();
  } catch (error) {
    // If response is not JSON, create a generic error
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  if (!response.ok) {
    console.error('API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      data: data
    });
    
    // Provide more specific error messages
    let errorMessage = data.message || 'Có lỗi xảy ra';
    
    if (response.status === 401) {
      errorMessage = 'Unauthorized - Token không hợp lệ hoặc đã hết hạn';
    } else if (response.status === 400) {
      errorMessage = data.message || 'Dữ liệu không hợp lệ';
      if (data.errors && Array.isArray(data.errors)) {
        errorMessage += ': ' + data.errors.join(', ');
      }
    } else if (response.status === 500) {
      errorMessage = 'Lỗi server nội bộ';
    }
    
    throw new Error(errorMessage);
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

// Financial API functions
export const financialAPI = {
  // Lấy tất cả transactions
  getTransactions: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/financial${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(true),
    });
    
    return await handleResponse(response);
  },

  // Tạo transaction mới
  createTransaction: async (transactionData) => {
    const response = await fetch(`${API_BASE_URL}/financial`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(transactionData),
    });
    
    return await handleResponse(response);
  },

  // Lấy transaction theo ID
  getTransaction: async (id) => {
    const response = await fetch(`${API_BASE_URL}/financial/${id}`, {
      method: 'GET',
      headers: createHeaders(true),
    });
    
    return await handleResponse(response);
  },

  // Cập nhật transaction
  updateTransaction: async (id, transactionData) => {
    const response = await fetch(`${API_BASE_URL}/financial/${id}`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify(transactionData),
    });
    
    return await handleResponse(response);
  },

  // Xóa transaction
  deleteTransaction: async (id, permanent = true) => {
    const url = permanent 
      ? `${API_BASE_URL}/financial/${id}?permanent=true`
      : `${API_BASE_URL}/financial/${id}`;
      
    const response = await fetch(url, {
      method: 'DELETE',
      headers: createHeaders(true),
    });
    
    return await handleResponse(response);
  },

  // Lấy tóm tắt tài chính
  getSummary: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/financial/summary${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(true),
    });
    
    return await handleResponse(response);
  },

  // Lấy top categories
  getTopCategories: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/financial/categories/top${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(true),
    });
    
    return await handleResponse(response);
  },

  // Duplicate transaction
  duplicateTransaction: async (id) => {
    const response = await fetch(`${API_BASE_URL}/financial/${id}/duplicate`, {
      method: 'POST',
      headers: createHeaders(true),
    });
    
    return await handleResponse(response);
  }
};

export default financialAPI;
