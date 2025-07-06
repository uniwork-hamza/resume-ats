// API Configuration
export const API_CONFIG = {
  // Base URL for the API
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  
  // Timeout for API requests (in milliseconds)
  TIMEOUT: 10000,
  
  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  
  // Token storage key
  TOKEN_KEY: 'resumeats_token',
  
  // File upload settings
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
  
  // Pagination defaults
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

// Environment-specific configuration
export const ENV_CONFIG = {
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
  isTest: import.meta.env.MODE === 'test',
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  RESUMES: {
    BASE: '/resumes',
    UPLOAD: (id: string) => `/resumes/${id}/upload`,
    DOWNLOAD: (id: string) => `/resumes/${id}/download`,
    DUPLICATE: (id: string) => `/resumes/${id}/duplicate`,
  },
  JOBS: {
    BASE: '/jobs',
    DUPLICATE: (id: string) => `/jobs/${id}/duplicate`,
    STATS: '/jobs/stats/overview',
  },
  ANALYSIS: {
    BASE: '/analysis',
    REANALYZE: (id: string) => `/analysis/${id}/reanalyze`,
    OPTIMIZE: '/analysis/optimize',
    STATS: '/analysis/stats/overview',
  },
  USERS: {
    DASHBOARD: '/users/dashboard',
    ACTIVITY: '/users/activity',
    PROFILE: '/users/profile',
    EXPORT: '/users/export',
    ACCOUNT: '/users/account',
  },
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed size.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a supported file format.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  REGISTER_SUCCESS: 'Account created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  RESUME_UPLOADED: 'Resume uploaded successfully!',
  RESUME_SAVED: 'Resume saved successfully!',
  JOB_SAVED: 'Job description saved successfully!',
  ANALYSIS_COMPLETED: 'Analysis completed successfully!',
  DATA_EXPORTED: 'Data exported successfully!',
}; 