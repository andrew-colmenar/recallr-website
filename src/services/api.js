const BASE_URL = 'your-api-endpoint';

export const api = {
  async get(endpoint) {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    return response.json();
  },
  // Add other methods as needed
};