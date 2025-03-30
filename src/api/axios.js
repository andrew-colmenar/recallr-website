import axios from 'axios';

// Create separate API instances for different endpoints
const authApi = axios.create({
  baseURL: '/auth',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const appApi = axios.create({
  baseURL: '/app',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Default export for backward compatibility
const api = axios.create({
  baseURL: '',  // Empty base URL to be explicit about paths
  timeout: 15000
});

// Export all API instances
export { authApi, appApi};
export default api;