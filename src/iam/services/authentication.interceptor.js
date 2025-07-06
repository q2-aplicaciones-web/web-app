import { authenticationService } from './authentication.service.js';

/**
 * Authentication Interceptor
 * Automatically adds JWT token to HTTP requests
 * Similar to Angular's HTTP Interceptor but for fetch/axios
 */

/**
 * Fetch wrapper with automatic token injection
 * @param {string} url - Request URL
 * @param {object} options - Fetch options
 * @returns {Promise<Response>} Enhanced fetch promise
 */
export const authenticatedFetch = async (url, options = {}) => {
  // Get current authentication headers
  const authHeaders = authenticationService.getAuthHeaders();
  
  // Merge authentication headers with existing headers
  const enhancedOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...authHeaders
    }
  };

  // Log the request for debugging
  if (authHeaders.Authorization) {
    console.log('🔐 Making authenticated request to:', url);
  }

  try {
    const response = await fetch(url, enhancedOptions);
    
    // Handle 401 responses (token expired/invalid)
    if (response.status === 401) {
      console.log('❌ Authentication failed - token may be expired');
      authenticationService.signOut();
      // Redirect to sign-in page
      window.location.href = '/sign-in';
      throw new Error('Authentication token expired');
    }

    return response;
  } catch (error) {
    console.error('❌ Authenticated fetch error:', error);
    throw error;
  }
};

/**
 * Axios interceptor setup (if using axios)
 * Call this function to set up automatic token injection for axios
 * @param {object} axiosInstance - Axios instance to configure
 */
export const setupAxiosInterceptors = (axiosInstance) => {
  // Request interceptor - adds auth token
  axiosInstance.interceptors.request.use(
    (config) => {
      const authHeaders = authenticationService.getAuthHeaders();
      
      if (authHeaders.Authorization) {
        config.headers.Authorization = authHeaders.Authorization;
        console.log('🔐 Adding auth token to axios request:', config.url);
      }
      
      return config;
    },
    (error) => {
      console.error('❌ Axios request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor - handles 401 responses
  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        console.log('❌ Authentication failed - token may be expired');
        authenticationService.signOut();
        window.location.href = '/sign-in';
      }
      
      return Promise.reject(error);
    }
  );

  console.log('✅ Axios interceptors configured');
};

/**
 * Generic HTTP client with authentication
 * Provides consistent API for making authenticated requests
 */
export class AuthenticatedHttpClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5297';
  }

  /**
   * GET request with authentication
   */
  async get(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    return authenticatedFetch(url, {
      method: 'GET',
      ...options
    });
  }

  /**
   * POST request with authentication
   */
  async post(endpoint, data, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    return authenticatedFetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    });
  }

  /**
   * PUT request with authentication
   */
  async put(endpoint, data, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    return authenticatedFetch(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    });
  }

  /**
   * PATCH request with authentication
   */
  async patch(endpoint, data, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    return authenticatedFetch(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options
    });
  }

  /**
   * DELETE request with authentication
   */
  async delete(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    return authenticatedFetch(url, {
      method: 'DELETE',
      ...options
    });
  }
}

// Export singleton instance
export const httpClient = new AuthenticatedHttpClient();
