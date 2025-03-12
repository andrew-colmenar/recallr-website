import axios from "axios";
import { useEffect } from "react";
import { setCookie } from "../utils/cookieUtils";

// Get device information for authentication
function getDeviceInfo() {
  const userAgent = navigator.userAgent;

  // Detect device type
  const deviceType = /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent)
    ? "mobile"
    : "desktop";

  // Detect operating system
  let operatingSystem = "unknown";
  if (/Android/i.test(userAgent)) operatingSystem = "android";
  else if (/iPhone|iPad|iPod/i.test(userAgent)) operatingSystem = "ios";
  else if (/Win/i.test(userAgent)) operatingSystem = "windows";
  else if (/Mac/i.test(userAgent)) operatingSystem = "macos";
  else if (/Linux/i.test(userAgent)) operatingSystem = "linux";

  // Detect browser name and version
  let browserName = "unknown";
  let browserVersion = "unknown";

  if (/Chrome/i.test(userAgent)) {
    browserName = "chrome";
    browserVersion = userAgent.match(/Chrome\/(\d+)/)[1];
  } else if (/Firefox/i.test(userAgent)) {
    browserName = "firefox";
    browserVersion = userAgent.match(/Firefox\/(\d+)/)[1];
  } else if (/Safari/i.test(userAgent)) {
    browserName = "safari";
    browserVersion = userAgent.match(/Version\/(\d+)/)[1];
  } else if (/Edge/i.test(userAgent)) {
    browserName = "edge";
    browserVersion = userAgent.match(/Edge\/(\d+)/)[1];
  }

  return {
    deviceType,
    operatingSystem,
    browserName,
    browserVersion,
  };
}

// Function to initiate Google sign in
export const signInWithGoogle = async () => {
  const deviceInfo = getDeviceInfo();

  const params = new URLSearchParams({
    referal_url: "http://localhost:5173/dashboard",
    device_type: deviceInfo.deviceType,
    operating_system: deviceInfo.operatingSystem,
    browser_version: deviceInfo.browserVersion,
    browser_name: deviceInfo.browserName,
  });

  const redirectUrl = `https://auth.recallrai.com/api/v1/sso/google/redirect?${params.toString()}`;

  // Before redirecting, set up a handler for when we return
  localStorage.setItem('pendingGoogleAuth', 'true');
  
  window.location.href = redirectUrl;
};

// Function to handle the redirection from auth service
export const handleGoogleAuthRedirect = () => {  
  // Check if we're on the dashboard with auth parameters
  if (window.location.pathname.includes('/dashboard')) {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user_id');
    const sessionId = urlParams.get('session_id');
    
    // If we have the auth parameters, save them to cookies
    if (userId && sessionId) {
      setCookie('user_id', userId);
      setCookie('session_id', sessionId);
      
      // Clean up the URL by removing the query parameters
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      
      // Clear the pending auth flag
      localStorage.removeItem('pendingGoogleAuth');
      
      return true; // Authentication completed successfully
    }
  }
  
  return false; // Authentication not completed
};

// Configure global event listener for page loads to handle auth redirects
if (typeof window !== 'undefined') {
  // Only run in browser environment
  window.addEventListener('DOMContentLoaded', function() {
    // Check if there's a pending Google auth (set before redirect)
    if (localStorage.getItem('pendingGoogleAuth') === 'true') {
      handleGoogleAuthRedirect();
    }
  });
}

// Component that can be used in the dashboard page to handle auth redirects
export const GoogleAuthHandler = () => {
  useEffect(() => {
    handleGoogleAuthRedirect();
  }, []);
  
  return null; // This component doesn't render anything
};