import Cookies from 'js-cookie';

// Cookie expiration times
const COOKIE_EXPIRES = {
  SESSION: 7, // Session cookies expire in 7 days
  PREFERENCES: 30, // Preferences expire in 30 days
};

// Set a cookie with proper expiration
export const setCookie = (name, value, expires = COOKIE_EXPIRES.SESSION) => {
  Cookies.set(name, value, { expires, sameSite: 'strict' });
};

// Get a cookie value
export const getCookie = (name) => {
  return Cookies.get(name);
};

// Remove a cookie
export const removeCookie = (name) => {
  Cookies.remove(name);
};

// Clear all auth-related cookies
export const clearAuthCookies = () => {
  Cookies.remove('user_id');
  Cookies.remove('session_id');
};

// Set user preferences in cookies
export const setUserPreference = (key, value) => {
  const preferences = getUserPreferences();
  preferences[key] = value;
  setCookie('user_preferences', JSON.stringify(preferences), COOKIE_EXPIRES.PREFERENCES);
};

// Get all user preferences from cookies
export const getUserPreferences = () => {
  try {
    const preferencesStr = getCookie('user_preferences');
    return preferencesStr ? JSON.parse(preferencesStr) : {};
  } catch (error) {
    console.error('Error parsing preferences:', error);
    return {};
  }
};

// Get a specific user preference
export const getUserPreference = (key, defaultValue = null) => {
  const preferences = getUserPreferences();
  return preferences[key] !== undefined ? preferences[key] : defaultValue;
};