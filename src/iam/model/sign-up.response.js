/**
 * Sign-up response model
 * Represents the response from the user registration API
 */
export class SignUpResponse {
  /**
   * Creates a new SignUpResponse instance
   * @param {string} message - Response message from the server
   * @param {string} userId - The newly created user's ID (if provided)
   */
  constructor(message = '', userId = '') {
    this.message = message;
    this.userId = userId;
  }

  /**
   * Creates a SignUpResponse from API response data
   * @param {object|string} responseData - Raw response data from API
   * @returns {SignUpResponse} New SignUpResponse instance
   */
  static fromApiResponse(responseData) {
    if (typeof responseData === 'string') {
      return new SignUpResponse(responseData);
    }
    
    return new SignUpResponse(
      responseData.message || responseData,
      responseData.userId || responseData.id || ''
    );
  }

  /**
   * Checks if the registration was successful
   * @returns {boolean} True if registration appears successful
   */
  isSuccessful() {
    return !!(this.message && !this.message.toLowerCase().includes('error'));
  }

  /**
   * Gets a user-friendly success message
   * @returns {string} Formatted success message
   */
  getSuccessMessage() {
    return this.message || 'Registration successful! You can now sign in.';
  }
}
