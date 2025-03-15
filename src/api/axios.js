import axios from 'axios';

// Create separate API instances for different endpoints
const authApi = axios.create({
  baseURL: '/auth',  // This will be proxied correctly
  timeout: 15000
});

const appApi = axios.create({
  baseURL: '/app',  // This will be proxied correctly
  timeout: 15000
});

// New instance for api.recallrai.com
const recallApi = axios.create({
  baseURL: '/api',  // This will be proxied to https://api.recallrai.com
  timeout: 15000
});

// Default export for backward compatibility
const api = axios.create({
  baseURL: '',  // Empty base URL to be explicit about paths
  timeout: 15000
});

// Export all API instances
export { authApi, appApi, recallApi };
export default api;