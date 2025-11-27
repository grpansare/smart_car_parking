// API Configuration
// This file centralizes the backend API URL configuration
// It automatically uses the environment variable in production or localhost in development

export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://smart-car-parking-wa4f.onrender.com";

// Helper function to build full API URLs
export const getApiUrl = (path) => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
};

// Export for backward compatibility
export default API_BASE_URL;
