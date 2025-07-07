<template>
  <div class="project-list">
    <!-- Header -->
    <div class="project-list-header">
      <h1>{{ t('designLab.projectList.title') }}</h1>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <Skeleton width="100%" height="40px" />
      <p>{{ t('designLab.projectList.loading') }}</p>
    </div>

    <!-- Error State -->
    <Message v-else-if="error" severity="error" class="error-state">
      {{ error }}
      <Button :label="t('common.retry')" severity="secondary" @click="loadProjects" size="small" />
    </Message>

    <!-- Empty State Mejorado -->
    <div v-else-if="projects.length === 0" class="empty-state-layout">
      <Card class="empty-project-card">
        <template #content>
          <div class="empty-content">
            <i class="pi pi-folder-open" style="font-size: 3rem; color: #bdbdbd; margin-bottom: 1rem;"></i>
            <h2 style="margin-bottom: 0.5rem;">{{ t('designLab.projectList.noProjects') }}</h2>
            <p style="margin-bottom: 1.5rem;">{{ t('designLab.projectList.createFirstMessage') }}</p>
            <Button 
              :label="t('designLab.projectList.createFirst')" 
              icon="pi pi-plus" 
              severity="primary" 
              @click="createNewProject" 
              style="margin-bottom: 0.5rem;"
            />
            <Divider />
            <div style="margin-top: 1rem; color: #888;">
              <i class="pi pi-lightbulb" style="margin-right: 0.5rem; color: #ffd600;"></i>
              {{ t('designLab.projectList.emptyTip', 'Puedes crear tu primer proyecto para comenzar a diseñar prendas personalizadas.') }}
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Projects Grid -->
    <div v-else class="projects-grid">
      <!-- Create New Project Card -->
      <Card class="project-card create-project-card" @click="createNewProject">
        <template #content>
          <div class="create-project-content">
            <div class="plus-icon">+</div>
          </div>
        </template>
      </Card>

      <!-- Existing Project Cards -->
      <Card
        v-for="project in projects"
        :key="project.id"
        class="project-card"
        @click="openProject(project.id)"
      >
        <template #content>
          <!-- Project Preview -->
          <div class="project-preview">
            <div 
              class="garment-preview"
              :style="getGarmentColorStyle(project.color)"
            ></div>
          </div>

          <!-- Project Info -->
          <div class="project-info">
            <h3 class="project-title">{{ project.title }}</h3>
            <div class="project-meta">
              <span class="project-size">{{ project.size }}</span>
              <span class="project-gender">{{ t(`designLab.genders.${project.gender?.toLowerCase()}`) }}</span>
            </div>
            <div class="project-dates">
              <span class="created-date">{{ t('designLab.projectList.created') }}: {{ formatDate(project.createdAt) }}</span>
              <span v-if="project.updatedAt !== project.createdAt" class="updated-date">
                {{ t('designLab.projectList.updated') }}: {{ formatDate(project.updatedAt) }}
              </span>
            </div>
          </div>

          <!-- Project Actions -->
          <div class="project-actions" @click.stop>
            <Button 
              :label="t('designLab.projectList.createProduct')"
              icon="pi pi-shopping-bag"
              severity="success"
              size="small"
              @click="openProductForm(project)"
              :disabled="productFormLoading || project.status === 'Garment'"
              :title="project.status === 'Garment' ? t('designLab.projectList.alreadyPublished') : t('designLab.projectList.createProductTooltip')"
            />
            <Button 
              v-if="canDeleteProject(project)"
              :label="t('common.delete')"
              severity="danger"
              size="small"
              @click="confirmDelete(project)"
              :disabled="deleteLoading"
            />
          </div>
        </template>
      </Card>
    </div>

    <!-- Delete Confirmation Modal -->
    <Dialog v-model:visible="dialogVisible" modal :header="t('designLab.deleteProject.title')" :closable="false" :style="{ width: '450px' }">
      <div v-if="deleteProject">
        <p>{{ t('designLab.deleteProject.confirmMessage', { title: deleteProject.title }) }}</p>
        
        <!-- Warning for published projects -->
        <Message v-if="deleteProject.status === 'Garment'" severity="warn" :closable="false" class="mb-3">
          <strong>{{ t('designLab.deleteProject.warning') }}:</strong> {{ t('designLab.deleteProjectWithProduct') }}
        </Message>
        
        <p class="warning-text">{{ t('designLab.deleteProject.cannotUndo') }}</p>
        <div class="modal-actions">
          <Button :label="t('common.cancel')" severity="secondary" @click="cancelDelete" :disabled="deleteLoading" />
          <Button 
            :label="deleteProject.status === 'Garment' ? t('designLab.deleteProjectAndProduct') : t('designLab.deleteProject.confirm')" 
            severity="danger" 
            @click="executeDelete" 
            :loading="deleteLoading" 
            :disabled="deleteLoading" 
          />
        </div>
      </div>
    </Dialog>

    <!-- Product Form Modal -->
    <ProductForm 
      v-model:visible="productFormVisible"
      :project="selectedProject"
      @product-created="handleProductCreated"
      @error="handleProductError"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useProjects } from '../composables/useProjects.js';
import { useGarmentColors } from '../composables/useGarmentColors.js';
import { authenticationService } from '../../iam/services/authentication.service.js';
import designLabService from '../services/design-lab.service.js';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import Message from 'primevue/message';
import Skeleton from 'primevue/skeleton';
import ProductForm from './ProductForm.vue';

// Add i18n support
const { t } = useI18n();

// Add defineEmits for event communication
const emit = defineEmits(['project-selected']);

// Use composables for reactive  state management
const {
  projects,
  loading,
  error,
  loadProjects,
  createProject: createProjectComposable,
  deleteProject: deleteProjectComposable,
  clearError
} = useProjects();

const {
  colors,
  loadColors,
  getColorStyle
} = useGarmentColors();

// Component-specific reactive state
const deleteProject = ref(null);
const deleteLoading = ref(false);

// Product form state
const productFormVisible = ref(false);
const selectedProject = ref(null);
const productFormLoading = ref(false);

// Simple permission checks - all authenticated users can delete their own projects
const canDeleteProject = (project) => {
  return authenticationService.isSignedIn.value && 
         project.userId === authenticationService.currentUserId.value;
};

// Methods
const loadUserProjects = async () => {
  await loadProjects();
};

const createNewProject = () => {
  emit('project-selected', 'create');
};

const openProject = (projectId) => {
  emit('project-selected', projectId);
};

const confirmDelete = (project) => {
  deleteProject.value = project;
};

const cancelDelete = () => {
  deleteProject.value = null;
};

const executeDelete = async () => {
  if (!deleteProject.value) return;

  deleteLoading.value = true;
  
  try {
    const success = await deleteProjectComposable(deleteProject.value.id);
    if (success) {
      deleteProject.value = null;
    }
  } catch (err) {
    console.error('Error deleting project:', err);
  } finally {
    deleteLoading.value = false;
  }
};

const getGarmentColorStyle = (colorValue, size = 200) => {
  if (!colorValue) {
    return cloudinaryService.getDefaultGarmentStyle(size);
  }
  return getColorStyle(colorValue, size);
};

const formatDate = (timestamp) => {
  return designLabService.formatTimestamp(timestamp);
};

const retryLoad = () => {
  clearError();
  loadUserProjects();
};

// Product form methods
const openProductForm = async (project) => {
  // Refresh project data to ensure we have the latest status
  await loadUserProjects();
  
  // Find the updated project
  const updatedProject = projects.value.find(p => p.id === project.id);
  const projectToUse = updatedProject || project;
  
  if (projectToUse.status === 'Garment') {
    alert('This project has already been published as a product and cannot be published again.');
    return;
  }
  
  selectedProject.value = projectToUse;
  productFormVisible.value = true;
};

const handleProductCreated = (product) => {
  // Refresh project list to get updated data
  loadUserProjects();
  // Optionally show a success message or redirect to product view
  productFormVisible.value = false;
};

const handleProductError = (error) => {
  console.error('Product creation error:', error);
  // Show error message to user
  alert(`Error creating product: ${error}`);
};

// Lifecycle
onMounted(() => {
  loadColors(); // Load garment colors
  loadUserProjects(); // Load user's projects
});

// Add dialogVisible computed for Dialog
const dialogVisible = computed({
  get: () => !!deleteProject.value,
  set: (val) => { if (!val) deleteProject.value = null; }
});
</script>

<style scoped>
.project-list {
  padding: 20px;
}
.project-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
.empty-state-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}
.empty-project-card {
  width: 100%;
  max-width: 420px;
}
.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}
</style>
