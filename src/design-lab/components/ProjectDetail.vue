<template>
  <div class="project-detail">
    <div class="project-header">
      <h1>{{ project?.title || 'Loading Project...' }}</h1>
      <div class="project-actions">
        <Button label="Back to Projects" icon="pi pi-arrow-left" severity="secondary" size="small" @click="goBack" />
        <Button :label="loading ? 'Saving...' : 'Save Project'" icon="pi pi-save" severity="primary" size="small" :loading="loading" :disabled="loading" @click="saveProject" />
      </div>
    </div>

    <div class="editor-container">
      <!-- Left Panel - Tools -->

      <!-- Center - Canvas Area -->
      <div class="canvas-container">
        <div v-if="error" class="error-state">
          <p>{{ error }}</p>
          <Button label="Retry" severity="secondary" @click="retryLoad" />
        </div>
        <div v-else-if="loading" class="loading-state">
          <p>Loading project...</p>
        </div>
        <div v-else-if="project" class="canvas-area">
          <!-- Garment Display replaced with DesignCanvas -->
          <DesignCanvas
            :project="project"
            :layers="layers"
            :selectedLayer="selectedLayer"
            @layer-selected="handleLayerSelected"
            @layer-moved="handleLayerMoved"
            @layer-resized="handleLayerResized"
            @layer-updated="handleLayerUpdated"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjects } from '../composables/useProjects.js'
import { authenticationService } from '../../iam/services/authentication.service.js'
import cloudinaryService from '../services/cloudinary.service.js'
import Button from 'primevue/button';
import DesignCanvas from './DesignCanvas.vue';

const route = useRoute()
const router = useRouter()

// Get project ID from route
const projectId = computed(() => route.params.id)

// Use projects composable
const {
  currentProject: project,
  loading,
  error,
  loadProject
} = useProjects()

// Computed garment style
const garmentStyle = computed(() => {
  if (!project.value?.color) {
    return cloudinaryService.getDefaultGarmentStyle(500);
  }
  
  return cloudinaryService.getGarmentColorStyle(project.value.color, 500);
})

// Load project on mount
onMounted(async () => {
  if (!authenticationService.isSignedIn.value) {
    router.push('/sign-in');
    return;
  }
  
  if (projectId.value) {
    await loadProject(projectId.value);
  }
})

const saveProject = async () => {
  if (!project.value) return
  // TODO: Implement save functionality
}

const goBack = () => {
  router.push('/design-lab')
}

const retryLoad = () => {
  if (projectId.value) {
    loadProject(projectId.value)
  }
}

const selectedLayer = ref(null);
const layers = computed(() => project.value?.layers || []);

const handleLayerSelected = (layer) => {
  selectedLayer.value = layer;
};

const handleLayerMoved = (layerId, pos) => {
  const layer = layers.value.find(l => l.id === layerId);
  if (layer) {
    layer.x = pos.x;
    layer.y = pos.y;
  }
};

const handleLayerResized = (layerId, size) => {
  const layer = layers.value.find(l => l.id === layerId);
  if (layer) {
    layer.x = size.x;
    layer.y = size.y;
    layer.width = size.width;
    layer.height = size.height;
  }
};

const handleLayerUpdated = (layerId, data) => {
  const layer = layers.value.find(l => l.id === layerId);
  if (layer) {
    Object.assign(layer, data);
  }
};
</script>

<style scoped>
.project-detail {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid #ddd;
}

.project-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.project-actions {
  display: flex;
  gap: 1rem;
}

.editor-container {
  flex: 1;
  display: grid;
  grid-template-columns: 300px 1fr;
  height: calc(100vh - 80px);
}

.tools-panel {
  padding: 1rem;
  border-right: 1px solid #ddd;
  overflow-y: auto;
}

.canvas-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.canvas-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  max-width: 800px;
}

.garment-canvas {
  border: 3px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
  position: relative;
  transition: all 0.3s ease;
  background-color: white;
  display: block;
}

.garment-canvas:hover {
  box-shadow: 0 12px 24px rgba(0,0,0,0.2);
  transform: translateY(-2px);
}

.project-info {
  text-align: center;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 500px;
}

.project-info h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.5rem;
}

.project-meta {
  display: flex;
  justify-content: center;
  gap: 2rem;
  font-size: 1rem;
  color: #666;
}

.project-meta span {
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 3rem;
  font-size: 1.1rem;
}

.error-state {
  color: #dc3545;
}

.canvas-placeholder {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>
