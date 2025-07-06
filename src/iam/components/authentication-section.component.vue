<template>
  <div class="authentication-section">
    <!-- Authenticated User Display -->
    <div v-if="isSignedIn" class="user-info">
      <button @click="handleSignOut" class="signout-button" title="Sign Out">
        <i class="pi pi-sign-out"></i>
      </button>
    </div>

    <!-- Guest User Display -->
    <div v-else class="guest-info">
      <router-link to="/sign-in" class="auth-link signin-link">
        Sign In
      </router-link>
      <router-link to="/sign-up" class="auth-link signup-link">
        Sign Up
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { authenticationService } from '../services/authentication.service.js';

// Router composable
const router = useRouter();

// Computed properties from authentication service
const isSignedIn = computed(() => authenticationService.isSignedIn.value);

// Methods
const handleSignOut = () => {
  if (confirm('Are you sure you want to sign out?')) {
    authenticationService.signOut();
    router.push('/sign-in');
  }
};
</script>

<style scoped>
.authentication-section {
  display: flex;
  align-items: center;
  padding: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: center;
}

.signout-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
}

.signout-button:hover {
  background-color: #e5e7eb;
  color: #374151;
  transform: translateY(-1px);
}

.guest-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.auth-link {
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
}

.signin-link {
  color: #667eea;
  background: transparent;
  border: 1px solid #667eea;
}

.signin-link:hover {
  background: #667eea;
  color: white;
}

.signup-link {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: 1px solid transparent;
}

.signup-link:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .signout-button {
    font-size: 16px;
    padding: 6px;
  }
  
  .auth-link {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .guest-info {
    gap: 8px;
  }
}
</style>
