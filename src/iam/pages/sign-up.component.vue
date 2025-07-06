<template>
  <div class="signup-container">
    <div class="signup-card">
      <!-- Header -->
      <div class="signup-header">
        <h1 class="signup-title">Create Account</h1>
        <p class="signup-subtitle">Join Q2</p>
      </div>

      <!-- Sign Up Form -->
      <form @submit.prevent="handleSignUp" class="signup-form">
        <!-- Username Field -->
        <div class="form-field">
          <label for="username" class="form-label">Username</label>
          <div class="input-container">
            <input
              id="username"
              v-model="formData.username"
              type="text"
              class="form-input"
              :class="{ 'error': errors.username }"
              placeholder="Choose a username"
              autocomplete="username"
              :disabled="isLoading"
              required
            />
          </div>
          <div v-if="errors.username" class="error-message">Username is required</div>
        </div>

        <!-- Password Field -->
        <div class="form-field">
          <label for="password" class="form-label">Password</label>
          <div class="input-container">
            <input
              id="password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              :class="{ 'error': errors.password }"
              placeholder="Create a password"
              autocomplete="new-password"
              :disabled="isLoading"
              required
            />
            <button
              type="button"
              @click="togglePasswordVisibility"
              class="password-toggle"
              :disabled="isLoading"
              aria-label="Toggle password visibility"
            >
              Show
            </button>
          </div>
          <div v-if="errors.password" class="error-message">Password is required</div>
        </div>

        <!-- Confirm Password Field -->
        <div class="form-field">
          <label for="confirmPassword" class="form-label">Confirm Password</label>
          <div class="input-container">
            <input
              id="confirmPassword"
              v-model="formData.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="form-input"
              :class="{ 'error': errors.confirmPassword }"
              placeholder="Confirm your password"
              autocomplete="new-password"
              :disabled="isLoading"
              required
            />
            <button
              type="button"
              @click="toggleConfirmPasswordVisibility"
              class="password-toggle"
              :disabled="isLoading"
              aria-label="Toggle confirm password visibility"
            >
              Show
            </button>
          </div>
          <div v-if="errors.confirmPassword" class="error-message">Passwords do not match</div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="alert alert-error">
          Registration failed. Please try again.
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="alert alert-success">
          Account created successfully!
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="signup-button"
          :disabled="isLoading || !isFormValid"
        >
          <span v-if="isLoading" class="loading-spinner">Creating Account...</span>
          <span v-else>Create Account</span>
        </button>
      </form>

      <!-- Footer -->
      <div class="signup-footer">
        <p class="signin-prompt">
          Already have an account?
          <router-link to="/sign-in" class="signin-link">Sign in here</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { authenticationService } from '../services/authentication.service.js';
import { SignUpRequest } from '../model/sign-up.request.js';

// Router composable
const router = useRouter();

// Reactive data
const formData = ref({
  username: '',
  password: '',
  confirmPassword: ''
});

const errors = ref({
  username: '',
  password: '',
  confirmPassword: ''
});

const isLoading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Computed properties
const isFormValid = computed(() => {
  return formData.value.username.trim().length >= 3 &&
         formData.value.password.length >= 6 &&
         formData.value.password === formData.value.confirmPassword &&
         !errors.value.username &&
         !errors.value.password &&
         !errors.value.confirmPassword;
});

// Methods
const validateForm = () => {
  errors.value = {};
  
  // Username validation
  if (!formData.value.username.trim()) {
    errors.value.username = 'Username is required';
  } else if (formData.value.username.trim().length < 3) {
    errors.value.username = 'Username must be at least 3 characters';
  }

  // Password validation
  if (!formData.value.password) {
    errors.value.password = 'Password is required';
  } else if (formData.value.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters';
  }

  // Confirm password validation
  if (!formData.value.confirmPassword) {
    errors.value.confirmPassword = 'Please confirm your password';
  } else if (formData.value.password !== formData.value.confirmPassword) {
    errors.value.confirmPassword = 'Passwords do not match';
  }

  return Object.keys(errors.value).length === 0;
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

const handleSignUp = async () => {
  // Clear previous messages
  errorMessage.value = '';
  successMessage.value = '';

  // Validate form
  if (!validateForm()) {
    return;
  }

  try {
    isLoading.value = true;

    // Create sign-up request (default role is USER)
    const signUpRequest = new SignUpRequest(
      formData.value.username,
      formData.value.password
    );

    // Attempt sign up
    const response = await authenticationService.signUp(signUpRequest);
    
    // Show success message
    successMessage.value = response.getSuccessMessage();
    
    // Clear form
    formData.value = {
      username: '',
      password: '',
      confirmPassword: ''
    };
    
    // Navigate to sign-in after delay
    setTimeout(() => {
      router.push({
        path: '/sign-in',
        query: { message: 'Registration successful! Please sign in.' }
      });
    }, 2000);

  } catch (error) {
    errorMessage.value = error.message || 'Registration failed. Please try again.';
    console.error('Sign up error:', error);
  } finally {
    isLoading.value = false;
  }
};

// Real-time validation
watch(formData, () => {
  if (errorMessage.value) {
    errorMessage.value = '';
  }
  
  // Clear specific field errors when user starts typing
  if (formData.value.username && errors.value.username) {
    errors.value.username = '';
  }
  if (formData.value.password && errors.value.password) {
    errors.value.password = '';
  }
  if (formData.value.confirmPassword && errors.value.confirmPassword) {
    errors.value.confirmPassword = '';
  }
}, { deep: true });

// Check if user is already authenticated
if (authenticationService.isSignedIn.value) {
  router.push('/home');
}
</script>

<style scoped>
.signup-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.signup-card {
  background: rgb(39, 39, 39);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 480px;
  overflow: hidden;
}

.signup-header {
  padding: 30px 30px 20px;
  text-align: center;
  background: rgb(39, 39, 39);
}

.signup-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px;
  color: #ffffff;
}

.signup-subtitle {
  font-size: 14px;
  color: #ffffff;
  margin: 0;
}

.signup-form {
  padding: 30px;
}

.form-field {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-weight: 500;
  color: #ffffff;
  font-size: 14px;
  margin-bottom: 6px;
}

.input-container {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
}

.form-input.error {
  border-color: #dc3545;
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  padding: 4px;
}

.password-toggle:hover:not(:disabled) {
  color: #007bff;
}

.password-toggle:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  font-size: 13px;
  margin-top: 4px;
}

.info-message {
  padding: 12px 16px;
  border-radius: 6px;
  background-color: #e3f2fd;
  border: 1px solid #bbdefb;
  color: #1565c0;
  font-size: 14px;
  margin-bottom: 20px;
}

.info-message p {
  margin: 0;
}

.alert {
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 20px;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.signup-button {
  width: 100%;
  background-color: #28a745;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.signup-button:hover:not(:disabled) {
  background-color: #218838;
}

.signup-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.signup-footer {
  padding: 20px 30px 30px;
  text-align: center;
  background: rgb(39, 39, 39);
}

.signin-prompt {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.signin-link {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.signin-link:hover {
  text-decoration: underline;
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .signup-container {
    padding: 16px;
  }
  
  .signup-header {
    padding: 24px 20px 16px;
  }
  
  .signup-form {
    padding: 24px 20px;
  }
  
  .signup-footer {
    padding: 16px 20px 24px;
  }
  
  .signup-title {
    font-size: 20px;
  }
}
</style>
