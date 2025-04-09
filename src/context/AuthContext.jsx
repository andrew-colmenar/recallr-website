import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        if (authService.isAuthenticated()) {
          const sessionData = await authService.getCurrentSession();
          if (sessionData && sessionData.user) {
            setUser(sessionData.user);
          }
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Function to handle user login
  const login = async (email, password) => {
    try {
      const loginRequest = await authService.requestLogin(email, password);
      return loginRequest; // Return transaction ID for OTP verification
    } catch (error) {
      throw error;
    }
  };

  // Function to complete login after OTP verification
  const completeLogin = async (transactionId) => {
    try {
      const response = await authService.completeLogin(transactionId);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Function to handle signup
  const signup = async (email) => {
    try {
      const signupRequest = await authService.requestSignup(email);
      return signupRequest; // Return transaction ID for OTP verification
    } catch (error) {
      throw error;
    }
  };

  // Function to complete signup
  const completeSignup = async (
    email,
    firstName,
    lastName,
    password,
    transactionId
  ) => {
    try {
      const response = await authService.completeSignup(
        email,
        firstName,
        lastName,
        password,
        transactionId
      );
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Function to handle user logout
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  // Verify OTP code
  const verifyOtp = async (transactionId, code) => {
    try {
      return await authService.verifyOtp(transactionId, code);
    } catch (error) {
      throw error;
    }
  };

  // Resend OTP code
  const resendOtp = async (transactionId) => {
    try {
      return await authService.resendOtp(transactionId);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    completeLogin,
    signup,
    completeSignup,
    logout,
    verifyOtp,
    resendOtp,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
