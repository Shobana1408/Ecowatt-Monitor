// API Configuration
export const API_CONFIG = {
  // Default backend URL - can be overridden by environment variables
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8081',
  
  // API endpoints
  ENDPOINTS: {
    // Backed by existing Spring Boot backend
    DATA_ALL: '/api/data',
    UPLOAD_CSV: '/api/upload',
    SUMMARY: '/api/summary',
  },
  
  // Request timeouts
  TIMEOUT: 10000, // 10 seconds
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
