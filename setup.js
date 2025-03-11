// Base API URL configuration
const API_BASE_URL = 'https://auth.recallrai.com'; // Replace with your actual API URL

// Create API service with common configurations
const apiService = {
  // Generic request method with proper error handling
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    const config = {
      ...options,
      headers
    };
    
    console.log(`Making ${options.method || 'GET'} request to: ${url}`);
    
    try {
      const response = await fetch(url, config);
      
      // Log status for debugging
      console.log(`Response status: ${response.status} ${response.statusText}`);
      
      // Handle non-2xx responses
      if (!response.ok) {
        // Try to parse error response as JSON
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = await response.text();
        }
        
        // Create error with details
        const error = new Error(errorData.detail || `Request failed with status: ${response.status}`);
        error.status = response.status;
        error.data = errorData;
        throw error;
      }
      
      // Parse JSON response
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },
  
  // Auth endpoints
  auth: {
    requestSignup(email, deviceInfo) {
      return apiService.request('/signup/request', {
        method: 'POST',
        body: JSON.stringify({ email, device_info: deviceInfo })
      });
    },
    
    verifyOtp(transactionId, otp) {
      return apiService.request('/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ transaction_id: transactionId, otp })
      });
    },
    
    completeSignup(transactionId, password, userData) {
      return apiService.request('/signup/complete', {
        method: 'POST',
        body: JSON.stringify({
          transaction_id: transactionId,
          password,
          user: userData
        })
      });
    },
    
    login(email, password) {
      return apiService.request('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
    }
  }
};

export default apiService;