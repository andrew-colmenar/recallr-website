import { useEffect } from 'react';
import authService from '../services/authService';

const SESSION_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes

const SessionRefresher = () => {
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      return;
    }
    
    // Check session immediately on mount
    const validateCurrentSession = async () => {
      try {
        await authService.validateSession();
      } catch (error) {
      }
    };
    
    validateCurrentSession();
    
    // Set up interval to check periodically
    const interval = setInterval(validateCurrentSession, SESSION_REFRESH_INTERVAL);
    
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  return null; // This component doesn't render anything
};

export default SessionRefresher;