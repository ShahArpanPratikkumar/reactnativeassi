// Travel Guardian - Base API & HTTP Client Layer
// Uses Fetch with Expo SecureStore for JWT authentication, error handling, and JSON/FormData support

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// -------------------------------------------------------------
// Base Backend API URL Configuration
import { API_BASE_URL, DEFAULT_REQUEST_TIMEOUT } from '../constants/config';
export { API_BASE_URL };

// -------------------------------------------------------------
// SecureStore Token Helpers
// -------------------------------------------------------------

// Save JWT token securely
export const saveToken = async (token) => {
  try {
    if (Platform.OS !== 'web') {
      await SecureStore.setItemAsync('userToken', token);
    } else {
      await AsyncStorage.setItem('userToken', token);
    }
  } catch (error) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('Error saving token to SecureStore:', error.message);
    }
  }
};

// Retrieve JWT token from SecureStore
export const getToken = async () => {
  try {
    if (Platform.OS !== 'web') {
      return await SecureStore.getItemAsync('userToken');
    } else {
      return await AsyncStorage.getItem('userToken');
    }
  } catch (error) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('Error reading token from SecureStore:', error.message);
    }
    return null;
  }
};

// Remove JWT token on logout
export const deleteToken = async () => {
  try {
    if (Platform.OS !== 'web') {
      await SecureStore.deleteItemAsync('userToken');
    } else {
      await AsyncStorage.removeItem('userToken');
    }
  } catch (error) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('Error deleting token from SecureStore:', error.message);
    }
  }
};

// -------------------------------------------------------------
// Safe Debug Logger (Sanitizes passwords and auth tokens)
// Only active in development mode (__DEV__)
// -------------------------------------------------------------
const devLog = (...args) => {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log(...args);
  }
};

const sanitizeForLog = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  try {
    const clone = Array.isArray(obj) ? [...obj] : { ...obj };
    if (clone.password) clone.password = '***[HIDDEN]***';
    if (clone.token) clone.token = '***[JWT_HIDDEN]***';
    return clone;
  } catch {
    return '[Unserializable Data]';
  }
};

// -------------------------------------------------------------
// Core API Request Handler (GET, POST, PUT, PATCH, DELETE)
// -------------------------------------------------------------
export const apiRequest = async (endpoint, options = {}) => {
  const token = await getToken();
  const isFormData = options.body instanceof FormData;

  // Set default headers
  const defaultHeaders = {
    // Only set Content-Type for JSON; omit for FormData so fetch sets multipart boundary automatically
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const config = {
    method: options.method || 'GET',
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const url = `${API_BASE_URL}${endpoint}`;

  // Log outgoing request details only in development
  devLog('====================================');
  devLog('API Base URL:', API_BASE_URL);
  devLog('Request Method:', config.method);
  devLog('Request Endpoint:', endpoint);
  devLog('Full Request URL:', url);
  devLog('====================================');

  try {
    // AbortController gives us a clean 10-second timeout.
    // Without this, fetch() can hang for 60-120 seconds on mobile
    // when the backend server is unreachable — causing infinite loading.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_REQUEST_TIMEOUT);

    let response;
    try {
      response = await fetch(url, { ...config, signal: controller.signal });
    } finally {
      clearTimeout(timeoutId); // Always clear timer whether success or fail
    }

    // Parse JSON or text response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    // Log response status and safe sanitized data in development
    devLog('------------------------------------');
    devLog('Request Endpoint:', endpoint);
    devLog('Response Status:', response.status);
    devLog('Response Data:', sanitizeForLog(data));
    devLog('------------------------------------');

    // Handle HTTP error status codes (4xx, 5xx) with specific descriptive messages
    if (!response.ok) {
      let customMessage = data && data.message ? data.message : null;

      // Differentiate MongoDB / Database failure
      if (customMessage && (customMessage.toLowerCase().includes('mongo') || customMessage.toLowerCase().includes('database'))) {
        customMessage = 'Database connection failed.';
      }

      if (!customMessage) {
        switch (response.status) {
          case 400:
            customMessage = 'Bad Request: Please check the submitted information.';
            break;
          case 401:
            customMessage = 'Session expired. Please login again.';
            break;
          case 403:
            customMessage = 'You do not have permission.';
            break;
          case 404:
            customMessage = 'API endpoint not found.';
            break;
          case 500:
            customMessage = 'Server error. Please try again.';
            break;
          default:
            customMessage = `Server returned status ${response.status}`;
        }
      }

      const error = new Error(customMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // Handle timeout (AbortError) specifically
    if (error.name === 'AbortError') {
      devLog(`⏱️ [Request Timeout on ${endpoint}]: Request exceeded 10 seconds`);
      const timeoutError = new Error('Request timed out. Please check your connection and try again.');
      timeoutError.isTimeout = true;
      throw timeoutError;
    }

    // Handle Network / Connection Errors (e.g. backend offline, incorrect IP, Wi-Fi disconnected)
    if (!error.status) {
      devLog(`❌ [Network Connection Error on ${endpoint}]:`, error.message);
      const networkError = new Error(
        `Cannot reach backend server at ${API_BASE_URL}.\n\n` +
        `Please check:\n` +
        `1. Your Node.js backend is running (cd backend && npm start).\n` +
        `2. Your phone and PC are connected to the same Wi-Fi network.\n` +
        `3. Check that API_BASE_URL in constants/config.js matches your PC's current local IPv4 address.`
      );
      networkError.isNetworkError = true;
      throw networkError;
    }

    devLog(`⚠️ [API Error ${error.status} on ${endpoint}]:`, error.message);
    throw error;
  }
};

// -------------------------------------------------------------
// Health Check Helper
// -------------------------------------------------------------
export const checkServerHealth = async () => {
  try {
    return await apiRequest('/health');
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// -------------------------------------------------------------
// Shorthand HTTP Helpers
// -------------------------------------------------------------
export const get = (endpoint, headers = {}) => {
  return apiRequest(endpoint, { method: 'GET', headers });
};

export const post = (endpoint, body, headers = {}) => {
  const isFormData = body instanceof FormData;
  return apiRequest(endpoint, {
    method: 'POST',
    body: isFormData ? body : JSON.stringify(body),
    headers,
  });
};

export const put = (endpoint, body, headers = {}) => {
  const isFormData = body instanceof FormData;
  return apiRequest(endpoint, {
    method: 'PUT',
    body: isFormData ? body : JSON.stringify(body),
    headers,
  });
};

export const patch = (endpoint, body, headers = {}) => {
  const isFormData = body instanceof FormData;
  return apiRequest(endpoint, {
    method: 'PATCH',
    body: isFormData ? body : JSON.stringify(body),
    headers,
  });
};

export const del = (endpoint, headers = {}) => {
  return apiRequest(endpoint, { method: 'DELETE', headers });
};

export default {
  API_BASE_URL,
  apiRequest,
  checkServerHealth,
  get,
  post,
  put,
  patch,
  del,
  getToken,
  saveToken,
  deleteToken,
};

