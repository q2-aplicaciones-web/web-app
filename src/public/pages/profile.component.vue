<script setup>
import { ref, onMounted, computed } from 'vue';
import Card from 'primevue/card';
import Avatar from 'primevue/avatar';
import Badge from 'primevue/badge';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { authenticationService } from '../../iam/services/authentication.service.js';
import { getUserById } from '../../iam/services/user.service.js';
import { User } from '../../iam/model/user.entity.js';
import AnalyticsStats from '../../analytics/components/AnalyticsStats.vue';
import { AnalyticsService } from '../../analytics/services/analytics.service.js';

const toast = useToast();
const currentUser = ref(null);
const analytics = ref(null);
const loadingProfile = ref(false);
const loadingAnalytics = ref(false);

const userId = authenticationService.currentUserId.value;
const token = authenticationService.currentToken.value;

const userInitials = computed(() => {
  if (!currentUser.value?.username) return 'U';
  return currentUser.value.username.slice(0, 2).toUpperCase();
});

onMounted(async () => {
  loadingProfile.value = true;
  try {
    const userData = await getUserById(userId, token);
    currentUser.value = new User(userData);
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo cargar el perfil',
      life: 5000
    });
  } finally {
    loadingProfile.value = false;
  }
  loadingAnalytics.value = true;
  try {
    analytics.value = await AnalyticsService.getUserAnalytics(userId);
  } catch (error) {
    // No mostrar toast si no hay analíticas
  } finally {
    loadingAnalytics.value = false;
  }
});
</script>

<template>
  <div class="profile-page">
    <Toast />
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
            <h2 class="user-name">{{ currentUser?.username || 'Usuario' }}</h2>
            <p class="user-email">ID: {{ currentUser?.id }}</p>
            <Badge value="Usuario" severity="info" class="role-badge" />
          </div>
        </div>
      </template>
    </Card>
    <AnalyticsStats v-if="analytics" :analytics="analytics" class="mt-4" />
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
}
</style>
