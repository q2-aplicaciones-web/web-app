<script setup>
import { computed } from 'vue';
import Button from 'primevue/button';

const props = defineProps({
  user: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['edit-profile']);

function handleEditProfile() {
  emit('edit-profile');
}
</script>

<template>
  <div v-if="user" class="user-info-bar">
    <!-- Blank Space (Profile Picture Placeholder) -->
    <div class="profile-placeholder"></div>
    
    <!-- User Name -->
    <div class="user-name">
      {{ user.name }}
    </div>
    
    <!-- Edit Profile Button (Three Dots) -->
    <Button 
      @click="handleEditProfile"
      icon="pi pi-ellipsis-h"
      text
      rounded
      size="small"
      aria-label="Edit Profile"
    />
  </div>
  
  <!-- No user state -->
  <div v-else class="user-info-bar">
    <div class="profile-placeholder"></div>
    <div class="user-name">No user</div>
  </div>
</template>

<style scoped>
.user-info-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
}

.profile-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #f0f0f0;
  border: 2px solid #e0e0e0;
}

.user-name {
  font-weight: 500;
  color: white;
  flex: 1;
  font-size: 1rem;
}
</style>
