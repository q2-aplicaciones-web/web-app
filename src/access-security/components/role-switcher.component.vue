<template>
  <div class="role-switcher-container">
    <div class="role-switcher-card p-card custom-card-bg">
      <h2 class="p-card-title">Change Role <span class="subtitle">(For testing only)</span></h2>
      <div class="info-row">
        <span>Current user:</span>
        <b>{{ currentUserDisplay }}</b>
      </div>
      <div class="info-row">
        <span>Current role:</span>
        <b>{{ currentRoleDisplay }}</b>
      </div>
      <div class="access-row p-message p-message-info">
        <span>You have access to: <b>Design Lab, Analytics</b>, etc.</span>
      </div>
      <div class="button-row">
        <Button
          :label="'Customer (Alice)'"
          :class="['custom-btn-customer', { 'p-button-outlined': !isCustomer, 'p-button-success': isCustomer }]"
          :disabled="isCustomer || loading"
          @click="switchToCustomer"
          style="min-width: 150px"
        />
        <Button
          :label="'Manufacturer (Bob)'"
          :class="['custom-btn-manufacturer', { 'p-button-outlined': !isManufacturer, 'p-button-success': isManufacturer }]"
          :disabled="isManufacturer || loading"
          @click="switchToManufacturer"
          style="min-width: 150px"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue';
import { useUserDomain } from '../services/user-domain.service.js';
import { useRoleDomain } from '../services/role-domain.service.js';
import { UserService } from '../../user_management/services/user.service';
import Button from 'primevue/button';

const { currentUser, setUser, setRole: setUserRole } = useUserDomain();
const { currentRole, setRole } = useRoleDomain();

const users = [
  { id: 'user-1', name: 'Alice', role: 'Customer' },
  { id: 'user-2', name: 'Bob', role: 'Manufacturer' },
];

const loading = ref(false);

async function switchUser(user) {
  loading.value = true;
  try {
    const userEntity = await UserService.getUserById(user.id);
    setUser(userEntity);
    setUserRole(user.role);
    setRole(user.role);
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

const isCustomer = computed(() => currentUser.value && currentUser.value.rol === 'Customer');
const isManufacturer = computed(() => currentUser.value && currentUser.value.rol === 'Manufacturer');

const currentUserDisplay = computed(() => {
  if (!currentUser.value) return '';
  // Usar getters de la clase User y Profile
  const name = currentUser.value.profile?.getFullName?.() || currentUser.value.profile?.firstName || '';
  return `${currentUser.value.id || currentUser.value._id || 'undefined'} (${name})`;
});
const currentRoleDisplay = computed(() => currentUser.value?.rol || currentRole.value || '');

// On mount, load default user if not set
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
  margin-top: 60px;
}
.role-switcher-card {
  min-width: 380px;
  max-width: 420px;
  padding: 32px 32px 16px 32px;
}
.custom-card-bg {
  background: #1e1e1e !important;
  border: 1px solid #2e2e2e;
}
.subtitle {
  font-size: 0.8em;
  color: var(--text-color-secondary, #888);
}
.info-row {
  margin: 16px 0 0 0;
  font-size: 1.1em;
  display: flex;
  gap: 8px;
}
.access-row {
  margin: 18px 0 0 0;
  border-radius: 6px;
  font-size: 1em;
  color: var(--text-color, #9c9c9c);
  padding: 8px 12px;
}
.access-list b {
  font-weight: 700;
}
.button-row {
  display: flex;
  gap: 16px;
  margin-top: 28px;
  padding-bottom: 8px;
}
.custom-btn-customer.p-button {
  background: #009688;
  border-color: #009688;
  color: #fff;
}
.custom-btn-customer.p-button.p-button-outlined {
  background: transparent;
  color: #009688;
  border-color: #009688;
}
.custom-btn-manufacturer.p-button {
  background: #388e3c;
  border-color: #388e3c;
  color: #fff;
}
.custom-btn-manufacturer.p-button.p-button-outlined {
  background: transparent;
  color: #388e3c;
  border-color: #388e3c;
}
</style>
