<template>
  <div class="project-list">
    <!-- Header -->
    <div class="project-list-header">
      <h1>My Projects</h1>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <Skeleton width="100%" height="40px" />
      <p>Loading projects...</p>
    </div>

    <!-- Error State -->
    <Message v-else-if="error" severity="error" class="error-state">
      {{ error }}
      <Button label="Retry" severity="secondary" @click="loadProjects" size="small" />
    </Message>

    <!-- Empty State -->
    <Message v-else-if="projects.length === 0" severity="info" class="empty-state">
      <h2>No projects yet</h2>
      <p>Create your first design project to get started!</p>
      <Button label="Create First Project" icon="pi pi-plus" severity="primary" @click="createNewProject" />
    </Message>

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
              <span class="project-gender">{{ project.gender }}</span>
            </div>
            <div class="project-dates">
              <span class="created-date">Created: {{ formatDate(project.createdAt) }}</span>
              <span v-if="project.updatedAt !== project.createdAt" class="updated-date">
                Updated: {{ formatDate(project.updatedAt) }}
              </span>
            </div>
          </div>

          <!-- Project Actions -->
          <div class="project-actions" @click.stop>
            <Button 
              label="Create Product"
              icon="pi pi-shopping-bag"
              severity="success"
              size="small"
              @click="openProductForm(project)"
              :disabled="productFormLoading || project.status === 'Garment'"
              :title="project.status === 'Garment' ? 'This project has already been published as a product' : 'Create a product from this project'"
            />
            <Button 
              v-if="canDeleteProject(project)"
              label="Delete"
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
    <Dialog v-model:visible="dialogVisible" modal header="Delete Project" :closable="false" :style="{ width: '400px' }">
      <div v-if="deleteProject">
        <p>Are you sure you want to delete "{{ deleteProject.title }}"?</p>
        <p class="warning-text">This action cannot be undone.</p>
        <div class="modal-actions">
          <Button label="Cancel" severity="secondary" @click="cancelDelete" :disabled="deleteLoading" />
          <Button label="Delete Project" severity="danger" @click="executeDelete" :loading="deleteLoading" :disabled="deleteLoading" />
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

.create-form {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.project-card {
  background: transparent;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.project-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.create-project-card {
  border: 2px #07613f;
  background: #088b59;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  transition: all 0.2s;
}

.create-project-card:hover {
  background: #0cc47d;
  box-shadow: 0 4px 12px rgba(0,123,255,0.2);
}

.create-project-content {
  padding: 20px;
}

.plus-icon {
  font-size: 3rem;
  color: #242424;
  margin-bottom: 12px;
  font-weight: bold;
  line-height: 1;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.project-actions {
  display: flex;
  gap: 8px;
}

.project-description {
  color: #666;
  margin-bottom: 12px;
}

.project-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.9em;
  color: #999;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: bold;
}

.form-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
}

.form-actions {
  display: flex;
  gap: 12px;
}

.project-preview {
  position: relative;
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.garment-preview {
  width: 100%;
  height: 120px;
  background-size: cover;
  background-position: center;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.layer-count {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8em;
}

.project-info {
  margin-bottom: 12px;
}

.project-title {
  margin: 0 0 8px 0;
  font-size: 1.1em;
  font-weight: bold;
}

.project-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 0.9em;
  color: #666;
}

.project-dates {
  font-size: 0.8em;
  color: #999;
}

.updated-date {
  margin-left: 8px;
}

.color-selector {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  margin-top: 8px;
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
  background-size: cover;
  background-position: center;
}

.color-option:hover {
  border-color: #007bff;
}

.color-option.active {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.warning-text {
  color: #dc3545;
  font-weight: bold;
}

.loading-state, .error-state {
  text-align: center;
  padding: 40px;
}

.error-state {
  color: #dc3545;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 400px;
  max-width: 90vw;
}
</style>
