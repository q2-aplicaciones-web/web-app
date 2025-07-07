/**
 * Sign-up request model
 * Represents the data required for user registration
 */
export class SignUpRequest {
  /**
   * Creates a new SignUpRequest instance
   * @param {string} username - The user's desired username
   * @param {string} password - The user's password
   */
  constructor(username = '', password = '') {
    this.username = username;
    this.password = password;
  }

  /**
   * Validates the sign-up request data
   * @returns {object} Validation result with isValid flag and errors array
   */
  validate() {
    const errors = [];

    // Username validation
    if (!this.username || this.username.trim().length === 0) {
      errors.push('Username is required');
    } else if (this.username.trim().length < 3) {
      errors.push('Username must be at least 3 characters long');
    }

    // Password validation
    if (!this.password || this.password.trim().length === 0) {
      errors.push('Password is required');
    } else if (this.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
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
