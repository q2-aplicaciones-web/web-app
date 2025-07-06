<template>
  <div class="signin-container">
    <Card class="signin-card" contentClass="signin-card-content">
      <template #content>
        <div class="signin-header">
          <h1 class="signin-title">{{ t('signin.title') }}</h1>
          <p class="signin-subtitle">{{ t('signin.subtitle') }}</p>
        </div>
        <form @submit.prevent="handleSignIn" class="signin-form">
          <div class="p-fluid">
            <div class="p-field" style="margin-bottom: 1.5rem;">
              <label for="username">{{ t('signin.usernameField.label') }}</label>
              <Password
                id="username"
                v-model="formData.username"
                :feedback="false"
                :toggleMask="false"
                :class="{ 'p-invalid': errors.username }"
                :placeholder="t('signin.usernameField.placeholder')"
                autocomplete="username"
                :disabled="isLoading"
                required
                style="width:100%"
                :inputStyle="{ width: '100%' }"
                :inputProps="{ type: 'text' }"
              />
              <small v-if="errors.username" class="p-error">{{ t('signin.validation.required', { field: t('signin.username') }) }}</small>
            </div>
            <div class="p-field" style="margin-bottom: 1.5rem;">
              <label for="password">{{ t('signin.passwordField.label') }}</label>
              <Password
                id="password"
                v-model="formData.password"
                :feedback="false"
                :toggleMask="true"
                :class="{ 'p-invalid': errors.password }"
                :placeholder="t('signin.passwordField.placeholder')"
                autocomplete="current-password"
                :disabled="isLoading"
                required
                style="width:100%"
                :inputStyle="{ width: '100%' }"
              />
              <small v-if="errors.password" class="p-error">{{ t('signin.validation.required', { field: t('signin.password') }) }}</small>
            </div>
            <Message v-if="errorMessage" severity="error">{{ t('common.error') }}</Message>
            <Message v-if="successMessage" severity="success">{{ t('common.loading') }}</Message>
            <Button
              type="submit"
              :label="t('signin.button.signingIn')"
              :loading="isLoading"
              :disabled="isLoading || !isFormValid"
              icon="pi pi-sign-in"
              class="w-full mt-3"
            />
          </div>
        </form>
        <div class="signin-footer mt-4" style="text-align:center;">
          <span>
            {{ t('signin.noAccount') }}
            <router-link to="/sign-up" class="signup-link">{{ t('common.signUp') }}</router-link>
          </span>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { authenticationService } from '../services/authentication.service.js';
import { SignInRequest } from '../model/sign-in.request.js';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';
import Card from 'primevue/card';
import { useI18n } from 'vue-i18n';

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

// i18n
const { t } = useI18n();
</script>

<style scoped>
.signin-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.signin-card {
  width: 100%;
  max-width: 420px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  border: none;
}

.signin-card-content {
  padding: 2.5rem 2rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.signin-header {
  margin-bottom: 2rem;
}

.signin-title {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.5rem;
}

.signin-subtitle {
  font-size: 1.1rem;
  color: #b0b0b0;
}

.signin-form {
  width: 100%;
  margin: 0 auto;
}

.signup-link {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.signup-link:hover {
  text-decoration: underline;
}
</style>
