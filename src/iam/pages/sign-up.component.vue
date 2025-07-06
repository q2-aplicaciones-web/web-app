<template>
  <div class="signup-container">
    <Card class="signup-card" contentClass="signup-card-content">
      <template #content>
        <div class="signup-header">
          <h1 class="signup-title">Create Account</h1>
          <p class="signup-subtitle">Join Q2</p>
        </div>
        <form @submit.prevent="handleSignUp" class="signup-form">
          <div class="p-fluid">
            <div class="p-field" style="margin-bottom: 1.5rem;">
              <label for="username">Username</label>
              <InputText
                id="username"
                v-model="formData.username"
                :class="{ 'p-invalid': errors.username }"
                placeholder="Choose a username"
                autocomplete="username"
                :disabled="isLoading"
                required
              />
              <small v-if="errors.username" class="p-error">Username is required</small>
            </div>
            <div class="p-field" style="margin-bottom: 1.5rem;">
              <label for="password">Password</label>
              <Password
                id="password"
                v-model="formData.password"
                :feedback="false"
                :toggleMask="true"
                :inputStyle="{ width: '100%' }"
                :class="{ 'p-invalid': errors.password }"
                placeholder="Create a password"
                autocomplete="new-password"
                :disabled="isLoading"
                required
              />
              <small v-if="errors.password" class="p-error">Password is required</small>
            </div>
            <div class="p-field" style="margin-bottom: 1.5rem;">
              <label for="confirmPassword">Confirm Password</label>
              <Password
                id="confirmPassword"
                v-model="formData.confirmPassword"
                :feedback="false"
                :toggleMask="true"
                :inputStyle="{ width: '100%' }"
                :class="{ 'p-invalid': errors.confirmPassword }"
                placeholder="Confirm your password"
                autocomplete="new-password"
                :disabled="isLoading"
                required
              />
              <small v-if="errors.confirmPassword" class="p-error">Passwords do not match</small>
            </div>
            <Message v-if="errorMessage" severity="error">Registration failed. Please try again.</Message>
            <Message v-if="successMessage" severity="success">Account created successfully!</Message>
            <Button
              type="submit"
              :label="isLoading ? 'Creating Account...' : 'Create Account'"
              :loading="isLoading"
              :disabled="isLoading || !isFormValid"
              icon="pi pi-user-plus"
              class="w-full mt-3"
            />
          </div>
        </form>
        <div class="signup-footer mt-4" style="text-align:center;">
          <span>
            Already have an account?
            <router-link to="/sign-in" class="signin-link">Sign in here</router-link>
          </span>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { authenticationService } from '../services/authentication.service.js';
import { SignUpRequest } from '../model/sign-up.request.js';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';
import Card from 'primevue/card';

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
}
.signup-card {
  width: 100%;
  max-width: 420px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  border: none;
}
.signup-card-content {
  padding: 2.5rem 2rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.signup-header {
  margin-bottom: 2rem;
}
.signup-title {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.5rem;
}
.signup-subtitle {
  font-size: 1.1rem;
  color: #b0b0b0;
}
.signup-form {
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.p-fluid > .p-field {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.p-field label {
  margin-bottom: 0.5rem;
}
.p-field input,
.p-field .p-inputtext,
.p-field .p-password {
  width: 100% !important;
  box-sizing: border-box;
}
.signin-link {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}
.signin-link:hover {
  text-decoration: underline;
}
</style>
