/**
 * Sign-in response model
 * Represents the response from the authentication API
 */
export class SignInResponse {
  /**
   * Creates a new SignInResponse instance
   * @param {string} id - The user's unique identifier (UUID)
   * @param {string} username - The user's username
   * @param {string} token - The JWT authentication token
   */
  constructor(id = '', username = '', token = '') {
    this.id = id;
    this.username = username;
    this.token = token;
  }

  /**
   * Creates a SignInResponse from API response data
   * @param {object} responseData - Raw response data from API
   * @returns {SignInResponse} New SignInResponse instance
   */
  static fromApiResponse(responseData) {
    return new SignInResponse(
      responseData.id || '',
      responseData.username || '',
      responseData.token || ''
    );
  }

  /**
   * Validates the response data
   * @returns {boolean} True if response contains all required fields
   */
  isValid() {
    return !!(this.id && this.username && this.token);
  }

  /**
   * Gets the authorization header value
   * @returns {string} Bearer token for HTTP Authorization header
   */
  getAuthorizationHeader() {
    return `Bearer ${this.token}`;
  }

  /**
   * Converts response to storage format
   * @returns {object} Object suitable for localStorage storage
   */
  toStorageObject() {
    return {
      userId: this.id,
      username: this.username,
      token: this.token,
      timestamp: new Date().toISOString()
    };
  }
}
