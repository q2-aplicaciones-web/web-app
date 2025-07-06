<template>
  <div class="role-switcher-container">
    <div class="role-switcher-card p-card custom-card-bg">
      <h2 class="p-card-title">Change Role</h2>
      <div class="info-row">
        <span>Current user:</span>
        <b>{{ currentUserDisplay }}</b>
      </div>
      <div class="info-row">
        <span>Current role:</span>
        <b>{{ currentRoleDisplay }}</b>
      </div>
      
      <div class="access-row">
        <span v-if="isCustomer"><b>Access:</b> Design Lab, Shopping Cart</span>
        <span v-else-if="isManufacturer"><b>Access:</b> Manufacturing Dashboard, Orders</span>
        <span v-else>Select a role to view access</span>
      </div>
      
      <div class="button-row">
        <Button
          label="Customer"
          :class="['role-btn', { active: isCustomer }]"
          :disabled="isCustomer || loading"
          @click="switchToCustomer"
        >
          <template #icon>
            <i class="pi pi-user mr-2"></i>
          </template>
        </Button>
        <Button
          label="Manufacturer"
          :class="['role-btn', { active: isManufacturer }]"
          :disabled="isManufacturer || loading"
          @click="switchToManufacturer"
        >
          <template #icon>
            <i class="pi pi-cog mr-2"></i>
          </template>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue';
import { useUserDomain } from '../services/user-domain.service.js';
import { useRoleDomain } from '../services/role-domain.service.js';
import { UserService } from '../../user_management/services/user.service';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';

const { currentUser, setUser } = useUserDomain();
const { currentRole, setRole } = useRoleDomain();
const router = useRouter();

// Define available roles
const ROLES = {
  CUSTOMER: 'customer',
  MANUFACTURER: 'manufacturer'
};

// Import environment variables
import { env } from '../../env';

// Define users with proper role mapping - use environment variables when available
const users = [
  { id: env.customerUserId || 'user-1', name: 'Alice', role: ROLES.CUSTOMER },
  { id: env.manufacturerUserId || 'user-2', name: 'Bob', role: ROLES.MANUFACTURER },
];

const loading = ref(false);

/**
 * Switch to a different user with a specific role
 * @param {Object} user - User object with id and role
 */
async function switchUser(user) {
  loading.value = true;
  
  try {
    // Get user entity from backend
    const userEntity = await UserService.getUserById(user.id);
    
    // Ensure the role is set correctly
    const normalizedRole = user.role.toLowerCase();
    
    // Update both user domain and role domain states
    setUser(userEntity);
    setRole(normalizedRole);
    
    // Force a route refresh to update the UI based on new role
    const currentRoute = router.currentRoute.value;
    
    // If we're on a protected route and switching to a role that can't access it,
    // navigate to home
    if (currentRoute.meta.requiresManufacturer && 
        normalizedRole !== ROLES.MANUFACTURER && 
        normalizedRole !== 'admin') {
      await router.push(env.defaultRedirectPath || '/home');
    } else {
      // Otherwise refresh the current route to update UI
      await router.replace({ path: currentRoute.path, query: { ...currentRoute.query, _: Date.now() } });
    }
  } catch (error) {
    console.error('Error switching user:', error);
  } finally {
    loading.value = false;
  }
}

function switchToCustomer() {
  switchUser(users[0]);
}

function switchToManufacturer() {
  switchUser(users[1]);
}

// Computed properties for UI state
const isCustomer = computed(() => 
  currentUser.value && currentUser.value.rol?.toLowerCase() === ROLES.CUSTOMER
);

const isManufacturer = computed(() => 
  currentUser.value && currentUser.value.rol?.toLowerCase() === ROLES.MANUFACTURER
);

const currentUserDisplay = computed(() => {
  if (!currentUser.value) return '';
  
  const name = currentUser.value.profile?.getFullName?.() || 
               currentUser.value.profile?.firstName || 
               'Unknown';
               
  return name;
});

const currentRoleDisplay = computed(() => {
  const role = currentUser.value?.rol || currentRole.value || '';
  return role.charAt(0).toUpperCase() + role.slice(1); // Capitalize first letter
});

// Load default user if not set
watchEffect(async () => {
  if (!currentUser.value) {
    await switchUser(users[0]);
  }
});
</script>

<style scoped>
.role-switcher-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin-top: 20px;
}
.role-switcher-card {
  width: 300px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.custom-card-bg {
  background: #1e1e1e;
  border: 1px solid #2e2e2e;
}
.info-row {
  margin: 10px 0;
  display: flex;
  gap: 8px;
  align-items: center;
}
.access-row {
  margin: 15px 0;
  font-size: 0.9em;
  color: #9c9c9c;
}
.button-row {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}
.role-btn {
  flex: 1;
}
.role-btn.active {
  background-color: #4caf50;
  border-color: #4caf50;
}
</style>
