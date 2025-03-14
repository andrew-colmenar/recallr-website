import axios from 'axios';

// Create two separate API instances for different endpoints
const authApi = axios.create({
  baseURL: '/auth',  // This will be proxied correctly
  timeout: 15000
});

const appApi = axios.create({
  baseURL: '/app',  // This will be proxied correctly
  timeout: 15000
});

// Default export for backward compatibility
const api = axios.create({
  baseURL: '',  // Empty base URL to be explicit about paths
  timeout: 15000
});

// Export all API instances
export { authApi, appApi };
export default api;