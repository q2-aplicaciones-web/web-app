<script setup>
import { ref, onMounted } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import UserInfo from '../../user_management/components/user-info.component.vue';
import { UserService } from '../../user_management/services/user.service';

const toast = useToast();

// User data
const currentUser = ref(null);
const isEditing = ref(false);
const editForm = ref({
  name: ''
});

// Load user profile on component mount
onMounted(async () => {
  await loadUserProfile();
});

async function loadUserProfile() {
  try {
    const user = await UserService.getCurrentUser();
    console.log('Loaded user profile:', user);
    currentUser.value = user;
  } catch (error) {
    console.error('Failed to load user profile:', error);
  }
}

function startEditing() {
  if (currentUser.value) {
    editForm.value.name = currentUser.value.name;
    isEditing.value = true;
  }
}

function cancelEditing() {
  isEditing.value = false;
  editForm.value.name = '';
}

async function saveProfile() {
  try {
    if (!currentUser.value) return;
    
    // For demo purposes, just update the local data since we don't have a real API
    currentUser.value.name = editForm.value.name;
    
    isEditing.value = false;
    
    console.log('Profile updated:', currentUser.value);
  } catch (error) {
    console.error('Failed to update profile:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update profile',
      life: 2000
    });
  }
}
</script>

<template>
  <div class="profile-page">
    <Toast />

    <!-- Profile Content -->
    <div class="profile-content">
      <!-- User Info Display -->
      <div class="user-info-section">
        
        <!-- Display User Info Component -->
        <UserInfo 
          v-if="currentUser && !isEditing"
          :user="currentUser"
          @edit-profile="startEditing"
        />
        
        <!-- Edit Form -->
        <div v-if="isEditing" class="edit-form">
          <div class="field-group">
            <label for="name" class="field-label">Full Name</label>
            <InputText 
              id="name"
              v-model="editForm.name"
              class="field-input"
              placeholder="Enter your full name"
            />
          </div>
          
          <div class="form-actions">
            <Button 
              @click="saveProfile"
              label="Save"
              icon="pi pi-check"
              :disabled="!editForm.name"
            />
            <Button 
              @click="cancelEditing"
              label="Cancel"
              icon="pi pi-times"
              severity="secondary"
              outlined
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 24px;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.profile-content {
  width: 100%;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-info-section {
  width: 100%;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
}

.edit-form {
  width: 100%;
  margin-top: 24px;
}

.field-group {
  margin-bottom: 16px;
}

.field-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.field-input {
  width: 100%;
}

.form-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .profile-page {
    padding: 16px;
  }
  
  .page-title {
    font-size: 1.75rem;
  }
  
  .profile-content {
    padding: 16px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
