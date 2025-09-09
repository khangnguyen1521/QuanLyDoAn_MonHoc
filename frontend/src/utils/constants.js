// API endpoints
import { API_CONFIG } from '../config/api';
export const API_BASE_URL = API_CONFIG.BASE_URL.replace('/api', ''); // Remove /api suffix for constants

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh'
  },
  TRANSACTIONS: {
    LIST: '/api/transactions',
    CREATE: '/api/transactions',
    UPDATE: (id) => `/api/transactions/${id}`,
    DELETE: (id) => `/api/transactions/${id}`
  },
  CATEGORIES: {
    LIST: '/api/categories',
    CREATE: '/api/categories'
  },
  REPORTS: {
    SUMMARY: '/api/reports/summary',
    MONTHLY: '/api/reports/monthly',
    CATEGORY: '/api/reports/category'
  },
  GOALS: {
    LIST: '/api/goals',
    CREATE: '/api/goals',
    UPDATE: (id) => `/api/goals/${id}`,
    DELETE: (id) => `/api/goals/${id}`
  }
};

// Transaction types
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense'
};

// Transaction categories
export const CATEGORIES = {
  INCOME: [
    { value: 'salary', label: 'Lương' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'investment', label: 'Đầu tư' },
    { value: 'gift', label: 'Quà tặng' },
    { value: 'other_income', label: 'Thu nhập khác' }
  ],
  EXPENSE: [
    { value: 'food', label: 'Ăn uống' },
    { value: 'transport', label: 'Di chuyển' },
    { value: 'shopping', label: 'Mua sắm' },
    { value: 'entertainment', label: 'Giải trí' },
    { value: 'bills', label: 'Hóa đơn' },
    { value: 'healthcare', label: 'Y tế' },
    { value: 'education', label: 'Giáo dục' },
    { value: 'other_expense', label: 'Chi tiêu khác' }
  ]
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  INPUT: 'yyyy-MM-dd',
  API: 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx'
};

// Currency settings
export const CURRENCY = {
  CODE: 'VND',
  SYMBOL: '₫',
  LOCALE: 'vi-VN'
};

// App settings
export const APP_SETTINGS = {
  NAME: 'Quản Lý Tài Chính',
  VERSION: '1.0.0',
  ITEMS_PER_PAGE: 10
};
