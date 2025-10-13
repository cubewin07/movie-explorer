import axios from 'axios';
import Cookies from 'js-cookie';

const instance = axios.create({
  baseURL:'http://localhost:8080', // Adjust as needed
  headers: {
    'Content-Type': 'application/json',
  },
});

// CRITICAL: Use interceptor to read token on EVERY request
instance.interceptors.request.use(
  (config) => {
    // Read token fresh from cookie on every request
    const token = Cookies.get('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Request with token:', token.slice(0, 20) + '...');
    } else {
      // Remove authorization header if no token
      delete config.headers.Authorization;
      console.log('🚫 Request without token');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Handle token expiration responses
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('❌ Unauthorized response - token may be expired');
    }
    return Promise.reject(error);
  }
);

export default instance;