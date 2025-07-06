<template>
  <div class="signin-container">
    <div class="signin-card">
      <!-- Header -->
      <div class="signin-header">
        <h1 class="signin-title">Welcome to Q2</h1>
        <p class="signin-subtitle">Sign in to your account</p>
      </div>

      <!-- Sign In Form -->
      <form @submit.prevent="handleSignIn" class="signin-form">
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
              placeholder="Enter your username"
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
              placeholder="Enter your password"
              autocomplete="current-password"
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

        <!-- Error Message -->
        <div v-if="errorMessage" class="alert alert-error">
          Sign in failed. Please try again.
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="alert alert-success">
          Welcome back! Signing you in...
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="signin-button"
          :disabled="isLoading || !isFormValid"
        >
          <span v-if="isLoading" class="loading-spinner">Signing In...</span>
          <span v-else>Sign In</span>
        </button>
      </form>

      <!-- Footer -->
      <div class="signin-footer">
        <p class="signup-prompt">
          Don't have an account?
          <router-link to="/sign-up" class="signup-link">Sign up here</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { authenticationService } from '../services/authentication.service.js';
import { SignInRequest } from '../model/sign-in.request.js';

// Router composables
const router = useRouter();
const route = useRoute();

// Reactive data
const formData = ref({
  username: '',
  password: ''
});

const errors = ref({
  username: '',
  password: ''
});

const isLoading = ref(false);
const showPassword = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Computed properties
const isFormValid = computed(() => {
  return formData.value.username.trim().length > 0 &&
         formData.value.password.length > 0 &&
         !errors.value.username &&
         !errors.value.password;
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

  return Object.keys(errors.value).length === 0;
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const handleSignIn = async () => {
  // Clear previous messages
  errorMessage.value = '';
  successMessage.value = '';

  // Validate form
  if (!validateForm()) {
    return;
  }

  try {
    isLoading.value = true;

    // Create sign-in request
    const signInRequest = new SignInRequest(
      formData.value.username,
      formData.value.password
    );

    // Attempt sign in
    const response = await authenticationService.signIn(signInRequest);
    
    // Show success message
    successMessage.value = `Welcome back, ${response.username}!`;
    
    // Get redirect URL from query params or default to home
    const redirectTo = route.query.redirect || '/home';
    
    // Navigate after short delay to show success message
    setTimeout(() => {
      router.push(redirectTo);
    }, 1000);

  } catch (error) {
    errorMessage.value = error.message || 'Sign in failed. Please try again.';
    console.error('Sign in error:', error);
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
}, { deep: true });

// Check if user is already authenticated
if (authenticationService.isSignedIn.value) {
  router.push('/home');
}
</script>

<style scoped>
.signin-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.signin-card {
  background: rgb(39, 39, 39);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  overflow: hidden;
}

.signin-header {
  padding: 30px 30px 20px;
  text-align: center;
  background: rgb(39, 39, 39);
}

.signin-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px;
  color: #ffffff;
}

.signin-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.signin-form {
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

.alert {
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 20px;
}

.alert-error {
  background: rgb(39, 39, 39);
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.signin-button {
  width: 100%;
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.signin-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.signin-button:disabled {
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

.signin-footer {
  padding: 20px 30px 30px;
  text-align: center;
  background: rgb(39, 39, 39);
}

.signup-prompt {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.signup-link {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.signup-link:hover {
  text-decoration: underline;
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .signin-container {
    padding: 16px;
  }
  
  .signin-header {
    padding: 24px 20px 16px;
  }
  
  .signin-form {
    padding: 24px 20px;
  }
  
  .signin-footer {
    padding: 16px 20px 24px;
  }
  
  .signin-title {
    font-size: 20px;
  }
}
</style>
