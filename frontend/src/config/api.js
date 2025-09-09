// API Configuration
const getApiBaseUrl = () => {
  // Ưu tiên environment variable
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Fallback cho production (OnRender)
  if (process.env.NODE_ENV === 'production') {
    // Hardcode backend URL cho OnRender - THAY ĐỔI URL NÀY
    return 'https://quanlydoan-monhoc-backend.onrender.com/api';
  }
  
  // Development fallback
  return 'http://localhost:5000/api';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 10000, // 10 seconds
  HEADERS: {
    'Content-Type': 'application/json',
  }
};

// Log API URL để debug
console.log('🌐 API Base URL:', API_CONFIG.BASE_URL);

export default API_CONFIG;
