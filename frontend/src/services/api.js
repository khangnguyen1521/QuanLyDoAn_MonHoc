// Base API URL
import { API_CONFIG } from '../config/api';
const API_BASE_URL = API_CONFIG.BASE_URL;

// Utility function để handle response
const handleResponse = async (response) => {
  console.log('📡 Response status:', response.status, response.statusText);
  console.log('📡 Response URL:', response.url);
  
  let data;
  try {
    data = await response.json();
  } catch (error) {
    console.error('❌ Failed to parse response as JSON:', error);
    throw new Error(`HTTP ${response.status}: ${response.statusText} - Invalid JSON response`);
  }
  
  if (!response.ok) {
    console.error('❌ API Error:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      data: data
    });
    throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  console.log('✅ API Success:', response.status);
  return data;
};

// Utility function để tạo request headers
const createHeaders = (includeAuth = false) => {
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

// Auth API functions
export const authAPI = {
  // Đăng ký
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(userData),
    });
    
    const data = await handleResponse(response);
    
    // Lưu token vào localStorage
    if (data.accessToken) {
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },

  // Đăng nhập
  login: async (credentials) => {
    console.log('🔐 Attempting login to:', `${API_BASE_URL}/auth/login`);
    console.log('🔐 Credentials:', { email: credentials.email, password: '[HIDDEN]' });
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(credentials),
      });
      
      const data = await handleResponse(response);
    
      // Lưu token vào localStorage
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      throw error;
    }
  },

  // Lấy thông tin user hiện tại
  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: createHeaders(true),
    });
    
    return await handleResponse(response);
  },

  // Đăng xuất
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: createHeaders(true),
    });
    
    const data = await handleResponse(response);
    
    // Xóa token khỏi localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    return data;
  },

  // Cập nhật profile
  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify(profileData),
    });
    
    const data = await handleResponse(response);
    
    // Cập nhật user trong localStorage
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  }
};

// Auth helper functions
export const authHelpers = {
  // Kiểm tra user đã đăng nhập chưa
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Lấy token hiện tại
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Xóa auth data
  clearAuthData: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export default {
  authAPI,
  authHelpers
};
