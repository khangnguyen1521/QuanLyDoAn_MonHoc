// Goals API functions
import { API_CONFIG } from '../config/api';
const API_BASE_URL = API_CONFIG.BASE_URL;

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

// Goals API functions
export const goalsAPI = {
  // Lấy tất cả goals
  getGoals: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/goals${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(true),
    });
    
    return await handleResponse(response);
  },

  // Tạo goal mới
  createGoal: async (goalData) => {
    const response = await fetch(`${API_BASE_URL}/goals`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(goalData),
    });
    
    return await handleResponse(response);
  },

  // Lấy goal theo ID
  getGoal: async (id) => {
    const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
      method: 'GET',
      headers: createHeaders(true),
    });
    
    return await handleResponse(response);
  },

  // Cập nhật goal
  updateGoal: async (id, goalData) => {
    const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify(goalData),
    });
    
    return await handleResponse(response);
  },

  // Cập nhật tiến độ goal
  updateGoalProgress: async (id, currentAmount) => {
    const response = await fetch(`${API_BASE_URL}/goals/${id}/progress`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify({ currentAmount }),
    });
    
    return await handleResponse(response);
  },

  // Xóa goal (soft delete)
  deleteGoal: async (id) => {
    const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
      method: 'DELETE',
      headers: createHeaders(true),
    });
    
    return await handleResponse(response);
  },

  // Lấy tóm tắt goals
  getGoalsSummary: async () => {
    const response = await fetch(`${API_BASE_URL}/goals/summary`, {
      method: 'GET',
      headers: createHeaders(true),
    });
    
    return await handleResponse(response);
  }
};

export default goalsAPI;
