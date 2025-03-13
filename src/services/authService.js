import api from '../api/axios';
import Cookies from 'js-cookie';

// Helper to get device information
const getDeviceInfo = () => {
  return {
    device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    operating_system: navigator.platform,
    browser_version: navigator.appVersion,
    browser_name: navigator.userAgent,
  };
};

// Update your setSessionCookies function
const setSessionCookies = (session) => {
  const isProduction = 0; // Change to 1 when deploying to production
  Cookies.set('user_id', session.user_id, { 
    expires: 7,
    sameSite: 'strict',
    secure: isProduction // Will be false on localhost, allowing cookies to work
  });
  Cookies.set('session_id', session.session_id, { 
    expires: 7,
    sameSite: 'strict',
    secure: isProduction
  });
};

const clearSessionCookies = () => {
  Cookies.remove('user_id');
  Cookies.remove('session_id');
};

const getSessionFromCookies = () => {
  return {
    user_id: Cookies.get('user_id'),
    session_id: Cookies.get('session_id'),
  };
};

// Authentication service methods
const authService = {
  // Request signup with email (first step)
  requestSignup: async (email) => {
    console.log('email', email);
    console.log('device_info', getDeviceInfo());
    const response = await api.post('auth/signup/request', {
      email,
      device_info: getDeviceInfo(),
    });
    console.log(response);
    return response.data;
  },

  // Verify OTP code
  verifyOtp: async (transactionId, code) => {
    const response = await api.post('auth/otp/verify', {
      transaction_id: transactionId,
      code:code,
    });
    return response.data;
  },

  // Resend OTP code
  resendOtp: async (transactionId) => {
    const response = await api.post('auth/otp/resend', {
      transaction_id: transactionId,
    });
    return response.data;
  },

  // Complete signup with user details
  completeSignup: async (email, firstName, lastName, password, transactionId) => {
    const response = await api.post('auth/signup/complete', {
      user: {
        email,
        first_name: firstName,
        last_name: lastName,
      },
      password,
      transaction_id: transactionId,
    });
    
    // Set cookies with session data
    if (response.data.session) {
      setSessionCookies(response.data.session);
    }
    
    return response.data;
  },

  // Request login (first step)
  requestLogin: async (email, password) => {
    const response = await api.post('auth/login/request', {
      email,
      password,
      device_info: getDeviceInfo(),
    });
    return response.data;
  },

  // Complete login after OTP verification
  completeLogin: async (transactionId) => {
    const response = await api.post('auth/login/complete', {
      transaction_id: transactionId,
    });
    
    // Set cookies with session data
    if (response.data.session) {
      setSessionCookies(response.data.session);
    }
    
    return response.data;
  },

  // Logout the user
  logout: async () => {
    const { user_id, session_id } = getSessionFromCookies();
    
    if (!user_id || !session_id) {
      return { detail: 'No active session' };
    }
    
    const response = await api.post('auth/logout', {
      user_id,
      session_id,
    });
    
    clearSessionCookies();
    return response.data;
  },

  // Get current session information
  getCurrentSession: async () => {
    const { user_id, session_id } = getSessionFromCookies();
    
    if (!user_id || !session_id) {
      return null;
    }
    
    try {
      const response = await api.post('auth/sessions/current', {
        user_id,
        session_id,
      });
      return response.data;
    } catch (error) {
      clearSessionCookies();
      return null;
    }
  },

  // Get all active sessions
  getAllSessions: async () => {
    const { user_id, session_id } = getSessionFromCookies();
    
    if (!user_id || !session_id) {
      return null;
    }
    
    const response = await api.post('auth/sessions/all', {
      user_id,
      session_id,
      device_info: getDeviceInfo(),
    });
    return response.data;
  },

  // Revoke a specific session
  revokeSession: async (targetUserId, targetSessionId) => {
    const { user_id, session_id } = getSessionFromCookies();
    
    if (!user_id || !session_id) {
      return null;
    }
    
    const response = await api.post(`auth/sessions/${targetUserId}/${targetSessionId}/revoke`, {});
    return response.data;
  },

  // Validate the current session
  validateSession: async () => {
    const { user_id, session_id } = getSessionFromCookies();
    
    if (!user_id || !session_id) {
      return false;
    }
    
    try {
      await api.post('auth/sessions/validate-session', {
        user_id,
        session_id,
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!Cookies.get('session_id') && !!Cookies.get('user_id');
  }
};

export default authService;