<script setup>
import { ref, onMounted, computed } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Card from 'primevue/card';
import Avatar from 'primevue/avatar';
import Badge from 'primevue/badge';
import Panel from 'primevue/panel';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { UserService } from '../../user_management/services/user.service';
import { DesignLabService } from '../../design-lab/services/design-lab.service';

const toast = useToast();

// User data
const currentUser = ref(null);
const editForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  gender: ''
});

// Gender options - loaded from API
const genderOptions = ref([]);
const loadingGenders = ref(false);
const loadingProfile = ref(false);
const updatingProfile = ref(false);

// Computed properties
const fullName = computed(() => {
  if (!currentUser.value?.profile) return 'User';
  const firstName = currentUser.value.profile.firstName || '';
  const lastName = currentUser.value.profile.lastName || '';
  return `${firstName} ${lastName}`.trim() || currentUser.value.email || 'User';
});

const userInitials = computed(() => {
  if (!currentUser.value?.profile) return 'U';
  const firstName = currentUser.value.profile.firstName || '';
  const lastName = currentUser.value.profile.lastName || '';
  const first = firstName[0] || '';
  const last = lastName[0] || '';
  return (first + last).toUpperCase() || currentUser.value.email?.[0]?.toUpperCase() || 'U';
});

const roleSeverity = computed(() => {
  switch (currentUser.value?.rol) {
    case 'admin': return 'danger';
    case 'customer': return 'success';
    case 'manufacturer': return 'info';
    default: return 'secondary';
  }
});

const formattedAddresses = computed(() => {
  if (!currentUser.value?.profile?.addresses) return [];
  return currentUser.value.profile.addresses.map(addr => ({
    ...addr,
    formatted: `${addr.address}, ${addr.city}, ${addr.state}, ${addr.zip}, ${addr.country}`
  }));
});

// Load user profile on component mount
onMounted(async () => {
  try {
    await Promise.all([
      loadUserProfile(),
      loadGenderOptions()
    ]);
  } catch (error) {
    console.error('Error loading profile data:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load profile data',
      life: 5000
    });
  }
});

async function loadGenderOptions() {
  loadingGenders.value = true;
  try {
    const genders = await DesignLabService.getGenders();
    genderOptions.value = genders;
    console.log('Loaded gender options:', genders);
  } catch (error) {
    console.error('Failed to load gender options:', error);
    // Set empty array and show toast error instead of hardcoded fallback
    genderOptions.value = [];
    toast.add({
      severity: 'warn',
      summary: 'Warning',
      detail: 'Could not load gender options. Please refresh the page.',
      life: 5000
    });
  } finally {
    loadingGenders.value = false;
  }
}

async function loadUserProfile() {
  loadingProfile.value = true;
  try {
    // ✅ Cargar usuario real desde db.json
    const userEntity = await UserService.getUserById('user-1');
    currentUser.value = userEntity;
    
    // Llenar formulario con datos actuales
    if (userEntity.profile) {
      editForm.value = {
        firstName: userEntity.profile.firstName || '',
        lastName: userEntity.profile.lastName || '',
        email: userEntity.email || '',
        gender: userEntity.profile.gender || ''
      };
    }
    
    console.log('Loaded user profile:', userEntity);
  } catch (error) {
    console.error('Failed to load user profile:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load user profile',
      life: 5000
    });
  } finally {
    loadingProfile.value = false;
  }
}

async function updateProfile() {
  if (!currentUser.value) return;
  
  updatingProfile.value = true;
  try {
    console.log('Updating profile with data:', editForm.value);
    
    // ✅ ENVIAR datos al backend (db.json)
    const updatedUserEntity = await UserService.updateUserProfile('user-1', {
      firstName: editForm.value.firstName,
      lastName: editForm.value.lastName,
      gender: editForm.value.gender
    });
    
    // Actualizar datos locales
    currentUser.value = updatedUserEntity;
    
    toast.add({
      severity: 'success',
      summary: 'Profile Updated',
      detail: 'Your profile has been updated successfully',
      life: 3000
    });
    
    console.log('Profile updated successfully:', updatedUserEntity);
    
  } catch (error) {
    console.error('Failed to update profile:', error);
    toast.add({
      severity: 'error',
      summary: 'Update Failed',
      detail: error.message || 'Failed to update profile. Please try again.',
      life: 5000
    });
  } finally {
    updatingProfile.value = false;
  }
}

function cancelEdit() {
  // Reset form to original values
  if (currentUser.value?.profile) {
    editForm.value = {
      firstName: currentUser.value.profile.firstName || '',
      lastName: currentUser.value.profile.lastName || '',
      email: currentUser.value.email || '',
      gender: currentUser.value.profile.gender || ''
    };
  }
}
</script>

<template>
  <div class="profile-page">
    <Toast />

    <!-- Header Card with Avatar, Name, Email and Role -->
    <Card class="header-card">
      <template #content>
        <div class="header-content">
          <Avatar 
            :label="userInitials"
            size="xlarge"
            shape="circle"
            class="user-avatar"
          />
          <div class="user-details">
            <h2 class="user-name">{{ fullName }}</h2>
            <p class="user-email">{{ currentUser?.email || 'No email' }}</p>
            <Badge 
              :value="currentUser?.rol || 'No role'"
              :severity="roleSeverity"
              class="role-badge"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Personal Information Form -->
    <Card class="form-card">
      <template #header>
        <div class="form-header">
          <i class="pi pi-user form-icon"></i>
          <span class="form-title">Personal Information</span>
        </div>
      </template>
      
      <template #content>
        <div class="p-fluid grid mt-4 gap-3">
          <!-- First Name -->
          <div class="col-12 md:col-6">
            <label for="firstName">First Name</label>
            <div class="p-inputgroup">
              <InputText 
                id="firstName"
                v-model="editForm.firstName"
                placeholder="Enter first name"
              />
              <span class="p-inputgroup-addon">
                <i class="pi pi-user"></i>
              </span>
            </div>
          </div>

          <!-- Last Name -->
          <div class="col-12 md:col-6">
            <label for="lastName">Last Name</label>
            <div class="p-inputgroup">
              <InputText 
                id="lastName"
                v-model="editForm.lastName"
                placeholder="Enter last name"
              />
              <span class="p-inputgroup-addon">
                <i class="pi pi-user"></i>
              </span>
            </div>
          </div>

          <!-- Email -->
          <div class="col-12 md:col-6">
            <label for="email">Email</label>
            <div class="p-inputgroup">
              <InputText 
                id="email"
                v-model="editForm.email"
                placeholder="Enter email"
              />
              <span class="p-inputgroup-addon">
                <i class="pi pi-envelope"></i>
              </span>
            </div>
          </div>

          <!-- Gender -->
          <div class="col-12 md:col-6">
            <label for="gender">Gender</label>
            <div class="p-inputgroup">
              <Select 
                id="gender"
                v-model="editForm.gender"
                :options="genderOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Gender"
                :loading="loadingGenders"
                :disabled="loadingGenders"
              />
              <span class="p-inputgroup-addon">
                <i class="pi pi-users"></i>
              </span>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Registered Addresses -->
    <Panel header="Registered Addresses" class="mt-4" v-if="formattedAddresses.length > 0">
      <div class="addresses-list">
        <div 
          v-for="(address, index) in formattedAddresses" 
          :key="address.id"
          class="address-item"
        >
          <div class="flex align-items-center gap-2">
            <i class="pi pi-home"></i>
            <div>
              <strong>Address {{ index + 1 }}</strong><br />
              {{ address.formatted }}
            </div>
          </div>
        </div>
      </div>
    </Panel>

    <!-- Action Buttons -->
    <div class="flex justify-content-end gap-2 mt-4">
      <Button 
        label="Update Profile" 
        icon="pi pi-save" 
        class="p-button-primary" 
        @click="updateProfile"
        :loading="updatingProfile"
        :disabled="updatingProfile || loadingProfile"
      />
      <Button 
        label="Cancel" 
        icon="pi pi-times" 
        class="p-button-secondary" 
        @click="cancelEdit"
        :disabled="updatingProfile"
      />
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Header Card Styles */
.header-card {
  background: linear-gradient(135deg, #a6ea66 0%, #4ba27e 100%);
  color: white;
  border-radius: 1rem;
  overflow: hidden;
}

.header-card :deep(.p-card-content) {
  padding: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-avatar {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 2rem;
  font-weight: bold;
  width: 100px;
  height: 100px;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 1.75rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
  color: white;
}

.user-email {
  font-size: 1rem;
  margin: 0 0 1rem 0;
  opacity: 0.9;
  color: white;
}

.role-badge {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}

/* Form Card Styles */
.form-card {
  border-radius: 0.75rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.form-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.form-icon {
  font-size: 1.25rem;
}

.form-title {
  font-size: 1.125rem;
  font-weight: 600;
  
}

/* Input Group Styling */
.p-inputgroup {
  display: flex;
  align-items: stretch;
}

.p-inputgroup .p-inputtext,
.p-inputgroup .p-select {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right: none;
}

.p-inputgroup-addon {
  background-color: #f1f5f900;
  border: 1px solid #d1d5db;
  border-left: none;
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  color: #ffffff;
}

/* Addresses Section */
.addresses-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.address-item {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
    gap: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .user-avatar {
    width: 80px;
    height: 80px;
    font-size: 1.5rem;
  }
  
  .user-name {
    font-size: 1.5rem;
  }
  
  .grid {
    gap: 1rem;
  }
  
  .flex.justify-content-end {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .p-button {
    width: 100%;
  }
}
</style>
