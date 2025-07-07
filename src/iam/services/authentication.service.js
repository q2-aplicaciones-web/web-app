import { ref, reactive, computed } from 'vue';
import { SignInRequest } from '../model/sign-in.request.js';
import { SignInResponse } from '../model/sign-in.response.js';
import { SignUpRequest } from '../model/sign-up.request.js';
import { SignUpResponse } from '../model/sign-up.response.js';
import env from '../../env.js';

/**
 * Authentication Service
 * Manages user authentication state and provides reactive authentication functionality
 * Similar to Angular's BehaviorSubject pattern but using Vue's reactivity system
 */
class AuthenticationService {
  constructor() {
    // Reactive state management
    this.state = reactive({
      isSignedIn: false,
      userId: '',
      username: '',
      token: '',
      roles: []
    });

    // Computed properties for external access
    this.isSignedIn = computed(() => this.state.isSignedIn);
    this.currentUserId = computed(() => this.state.userId);
    this.currentUsername = computed(() => this.state.username);
    this.currentToken = computed(() => this.state.token);
    this.userRoles = computed(() => this.state.roles);

    // API base URL from environment
    this.basePath = env.apiBaseUrl || 'http://localhost:5297';

    // Auto-restore session on service initialization
    this.checkStoredAuthentication();
  }

  /**
   * Checks localStorage for existing authentication data and restores session
   * This provides seamless user experience across page refreshes
   */
  checkStoredAuthentication() {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const username = localStorage.getItem('username');
      const roles = localStorage.getItem('userRoles');

      if (token && userId && username) {
        // Restore authentication state
        this.state.isSignedIn = true;
        this.state.userId = userId;
        this.state.username = username;
        this.state.token = token;
        this.state.roles = roles ? JSON.parse(roles) : ['ROLE_USER'];
        
        console.log('✅ Authentication session restored from localStorage');
      } else {
        // Clear incomplete authentication data
        this.clearStoredAuthentication();
      }
    } catch (error) {
      console.error('❌ Error restoring authentication session:', error);
      this.clearStoredAuthentication();
    }
  }

  /**
   * Clears all authentication data from localStorage and state
   */
  clearStoredAuthentication() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('userRoles');
    
    this.state.isSignedIn = false;
    this.state.userId = '';
    this.state.username = '';
    this.state.token = '';
    this.state.roles = [];
  }

  /**
   * Persists authentication data to localStorage
   * @param {SignInResponse} response - Authentication response
   */
  storeAuthenticationData(response) {
    try {
      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response.id);
      localStorage.setItem('username', response.username);
      localStorage.setItem('userRoles', JSON.stringify(['ROLE_USER'])); // Default role for all users
    } catch (error) {
      console.error('❌ Error storing authentication data:', error);
    }
  }

  /**
   * Sign in a user with username and password
   * @param {SignInRequest} signInRequest - Sign in request data
   * @returns {Promise<SignInResponse>} Promise resolving to sign in response
   */
  async signIn(signInRequest) {
    try {
      // Validate request
      const validation = signInRequest.validate();
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Make API call
      const response = await fetch(`${this.basePath}/api/v1/auth/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signInRequest.toPlainObject())
      });

      if (!response.ok) {
        throw new Error(await this.getErrorMessage(response));
      }

      const responseData = await response.json();
      const signInResponse = SignInResponse.fromApiResponse(responseData);

      if (!signInResponse.isValid()) {
        throw new Error('Invalid response from server');
      }

      // Update reactive state
      this.state.isSignedIn = true;
      this.state.userId = signInResponse.id;
      this.state.username = signInResponse.username;
      this.state.token = signInResponse.token;
      this.state.roles = ['ROLE_USER']; // Default role for all users

      // Persist to localStorage
      this.storeAuthenticationData(signInResponse);

      console.log('✅ User signed in successfully:', signInResponse.username);
      return signInResponse;

    } catch (error) {
      // Clear any partial authentication state
      this.state.isSignedIn = false;
      this.state.userId = '';
      this.state.username = '';
      this.state.token = '';
      this.state.roles = [];

      console.error('❌ Sign in failed:', error.message);
      throw error;
    }
  }

  /**
   * Sign up a new user
   * @param {SignUpRequest} signUpRequest - Sign up request data
   * @returns {Promise<SignUpResponse>} Promise resolving to sign up response
   */
  async signUp(signUpRequest) {
    try {
      // Validate request
      const validation = signUpRequest.validate();
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Make API call
      const response = await fetch(`${this.basePath}/api/v1/auth/sign-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signUpRequest.toPlainObject())
      });

      if (!response.ok) {
        throw new Error(await this.getErrorMessage(response));
      }

      const responseData = await response.json();
      const signUpResponse = SignUpResponse.fromApiResponse(responseData);

      console.log('✅ User registered successfully');
      return signUpResponse;

    } catch (error) {
      console.error('❌ Sign up failed:', error.message);
      throw error;
    }
  }

  /**
   * Sign out the current user
   */
  signOut() {
    // Clear reactive state
    this.state.isSignedIn = false;
    this.state.userId = '';
    this.state.username = '';
    this.state.token = '';
    this.state.roles = [];

    // Clear persistent storage
    this.clearStoredAuthentication();

    console.log('✅ User signed out successfully');
  }

  /**
   * Get authorization header for HTTP requests
   * @returns {object} Headers object with Authorization
   */
  getAuthHeaders() {
    if (!this.state.token) {
      return {};
    }

    return {
      'Authorization': `Bearer ${this.state.token}`
    };
  }

  /**
   * Check if user has a specific role
   * @param {string} role - Role to check
   * @returns {boolean} True if user has the role
   */
  hasRole(role) {
    return this.state.roles.includes(role);
  }

  /**
   * Check if user is a manufacturer
   * @returns {boolean} True if user has manufacturer role
   */
  isManufacturer() {
    return this.hasRole('ROLE_MANUFACTURER');
  }

  /**
   * Get user-friendly error message from HTTP response
   * @param {Response} response - HTTP response object
   * @returns {Promise<string>} Error message
   */
  async getErrorMessage(response) {
    const status = response.status;
    
    try {
      const errorData = await response.json();
      if (errorData.message) {
        return errorData.message;
      }
    } catch (e) {
      // Response is not JSON, use status-based messages
    }

    // Provide specific error messages based on HTTP status codes
    switch (status) {
      case 400:
        return 'Invalid request data. Please check your input.';
      case 401:
        return 'Invalid username or password. Please check your credentials.';
      case 403:
        return 'Access forbidden. Please contact support.';
      case 404:
        return 'Service not found. Please try again later.';
      case 409:
        return 'Username already exists. Please choose a different username.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Request failed with status ${status}. Please try again.`;
    }
  }
}

// Create and export singleton instance
export const authenticationService = new AuthenticationService();

// Export for component usage
export { SignInRequest, SignInResponse, SignUpRequest, SignUpResponse };
