import { authApi } from '../api/axios';
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

// Get cookie settings from environment variables
const getCookieSettings = () => {
  return {
    expirationDays: parseInt(import.meta.env.VITE_COOKIE_EXPIRATION_DAYS || '7'),
    sameSite: 'strict',
    secure: true,
    path: '/'
  };
};

const setSessionCookies = (session) => {
  const cookieSettings = getCookieSettings();
  
  Cookies.set('user_id', session.user_id, { 
    expires: cookieSettings.expirationDays,
    sameSite: cookieSettings.sameSite,
    secure: cookieSettings.secure,
    path: cookieSettings.path
  });
  
  Cookies.set('session_id', session.session_id, { 
    expires: cookieSettings.expirationDays,
    sameSite: cookieSettings.sameSite,
    secure: cookieSettings.secure,
    path: cookieSettings.path
  });
};

const clearSessionCookies = () => {
  const cookieSettings = getCookieSettings();
  
  Cookies.remove('user_id', {
    path: cookieSettings.path,
    sameSite: cookieSettings.sameSite,
    secure: cookieSettings.secure
  });
  
  Cookies.remove('session_id', {
    path: cookieSettings.path,
    sameSite: cookieSettings.sameSite,
    secure: cookieSettings.secure
  });
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
    const response = await authApi.post('signup/request', {
      email,
      device_info: getDeviceInfo(),
    });
    return response.data;
  },

  // Verify OTP code
  verifyOtp: async (transactionId, code) => {
    const response = await authApi.post('otp/verify', {
      transaction_id: transactionId,
      code:code,
    });
    return response.data;
  },

  // Resend OTP code
  resendOtp: async (transactionId) => {
    const response = await authApi.post('otp/resend', {
      transaction_id: transactionId,
    });
    return response.data;
  },

  // Complete signup with user details
  completeSignup: async (email, firstName, lastName, password, transactionId) => {
    const response = await authApi.post('signup/complete', {
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
    const response = await authApi.post('login/request', {
      email,
      password,
      device_info: getDeviceInfo(),
    });
    return response.data;
  },

  // Complete login after OTP verification
  completeLogin: async (transactionId) => {
    const response = await authApi.post('login/complete', {
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
    
    const response = await authApi.post('logout', {
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
      const response = await authApi.post('sessions/current', {
        user_id,
        session_id,
      });
      return response.data;
    } catch (error) {
      // Only clear cookies for authentication errors (401/403)
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        clearSessionCookies();
      }
      return null;
    }
  },

  // Get all active sessions
  getAllSessions: async () => {
    const { user_id, session_id } = getSessionFromCookies();
    
    if (!user_id || !session_id) {
      return null;
    }
    
    const response = await authApi.post('sessions/all', {
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
    
    const response = await authApi.post(`sessions/${targetUserId}/${targetSessionId}/revoke`, {});
    return response.data;
  },

  // Validate the current session
  validateSession: async () => {
    const { user_id, session_id } = getSessionFromCookies();
    
    if (!user_id || !session_id) {
      return false;
    }
    
    try {
      const response = await authApi.post('sessions/validate-session', {
        user_id,
        session_id,
      });
      
      // If server returns a refreshed session, update cookies
      if (response.data?.session?.session_id) {
        setSessionCookies(response.data.session);
      }
      
      return true;
    } catch (error) {
      // Only clear cookies for authentication errors
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        clearSessionCookies();
      }
      
      return false;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!Cookies.get('session_id') && !!Cookies.get('user_id');
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    const response = await authApi.post('reset-password/request', {
      email
    });
    return response.data;
  },

  // Complete password reset
  completePasswordReset: async (email, password, transactionId) => {
    const response = await authApi.post('reset-password/complete', {
      email,
      password,
      transaction_id: transactionId
    });
    return response.data;
  }
};

export default authService;