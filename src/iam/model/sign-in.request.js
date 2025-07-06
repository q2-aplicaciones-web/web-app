/**
 * Sign-in request model
 * Represents the data required for user authentication
 */
export class SignInRequest {
  /**
   * Creates a new SignInRequest instance
   * @param {string} username - The user's username
   * @param {string} password - The user's password
   */
  constructor(username = '', password = '') {
    this.username = username;
    this.password = password;
  }

  /**
   * Validates the sign-in request data
   * @returns {object} Validation result with isValid flag and errors array
   */
  validate() {
    const errors = [];

    if (!this.username || this.username.trim().length === 0) {
      errors.push('Username is required');
    }

    if (!this.password || this.password.trim().length === 0) {
      errors.push('Password is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Converts the request to a plain object for API calls
   * @returns {object} Plain object representation
   */
  toPlainObject() {
    return {
      username: this.username.trim(),
      password: this.password
    };
  }
}
