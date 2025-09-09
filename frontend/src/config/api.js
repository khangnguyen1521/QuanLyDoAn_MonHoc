// API Configuration
const getApiBaseUrl = () => {
  // Debug logs
  console.log('🔍 Debug Environment:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
  
  // Ưu tiên environment variable
  if (process.env.REACT_APP_API_URL) {
    console.log('✅ Using REACT_APP_API_URL');
    return process.env.REACT_APP_API_URL;
  }
  
  // Fallback cho production (OnRender)
  if (process.env.NODE_ENV === 'production') {
    console.log('✅ Using production fallback');
    // THAY ĐỔI URL NÀY BẰNG URL BACKEND THỰC TẾ CỦA BẠN
    return 'https://quanlydoan-monhoc-backend.onrender.com/api';
  }
  
  // Development fallback
  console.log('✅ Using development fallback');
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
console.log('🌐 Final API Base URL:', API_CONFIG.BASE_URL);
console.log('🌐 Testing URL:', API_CONFIG.BASE_URL.replace('/api', '/health'));

export default API_CONFIG;
