import Cookies from 'js-cookie';

// Cookie expiration times
const COOKIE_EXPIRES = {
  SESSION: 7, // Session cookies expire in 7 days
  PREFERENCES: 30, // Preferences expire in 30 days
};

// Set a cookie with proper expiration and security settings
export const setCookie = (name, value, expires = COOKIE_EXPIRES.SESSION) => {
  Cookies.set(name, value, {
    expires,
    sameSite: 'strict',
    secure: true
  });
};

// Get a cookie value
export const getCookie = (name) => {
  return Cookies.get(name);
};

// Remove a cookie
export const removeCookie = (name) => {
  Cookies.remove(name, {
    sameSite: 'strict',
    secure: true
  });
};

// Clear all auth-related cookies
export const clearAuthCookies = () => {
  removeCookie('user_id');
  removeCookie('session_id');
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
    return {};
  }
};

// Get a specific user preference
export const getUserPreference = (key, defaultValue = null) => {
  const preferences = getUserPreferences();
  return preferences[key] !== undefined ? preferences[key] : defaultValue;
};