<template>
  <div class="project-detail">
    <div class="project-header small-header">
      <div class="header-title small-title" style="display: flex; align-items: center; gap: 0.7rem;">
        <Button icon="pi pi-arrow-left" severity="secondary" size="small" rounded text @click="goBack" style="margin-right: 0.5rem;" />
        <span>{{ project?.title || 'Project Detail' }}</span>
      </div>
      <div class="project-actions align-actions">
        <Button icon="pi pi-save" severity="primary" size="small" rounded :loading="loading" :disabled="loading" text @click="saveProject" />
      </div>
    </div>

    <div class="editor-container">
      <div class="canvas-center-wrapper">
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
              :projectId="project.id"
              :layers="layers"
              :projectColor="project.color"
              :selectedLayer="selectedLayer"
              @layer-selected="handleLayerSelected"
              @layer-moved="handleLayerMoved"
              @layer-resized="handleLayerResized"
              @layer-updated="handleLayerUpdated"
              @refreshLayers="refreshLayers"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjects } from '../composables/useProjects.js'
import { authenticationService } from '../../iam/services/authentication.service.js'
import cloudinaryService from '../services/cloudinary.service.js'
import designLabService from '../services/design-lab.service.js'
import Button from 'primevue/button'
import DesignCanvas from './DesignCanvas.vue'

const route = useRoute()
const router = useRouter()

// Get project ID from route
const projectId = computed(() => route.params.id)

// Use projects composable
const {
  currentProject: project,
  loadProject
} = useProjects()

// Local loading and error state
const loading = ref(false)
const error = ref('')

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

const goBack = () => {
  router.push('/design-lab')
}

const retryLoad = () => {
  if (projectId.value) {
    loadProject(projectId.value)
  }
}

// --- Layer State Management ---
const selectedLayer = ref(null);
const editableLayers = ref([]);

// Color normalization utility using cloudinary service

function normalizeFontColor(color) {
  if (!color) return '#000000';
  if (typeof color === 'string' && color.startsWith('#')) return color;
  
  // Try to get color by label from cloudinary service
  const found = cloudinaryService.getGarmentColorByLabel(String(color));
  if (found && found.hex) {
    return found.hex;
  }
  
  // Try to get color by value from cloudinary service  
  const foundByValue = cloudinaryService.getGarmentColorByValue(String(color));
  if (foundByValue && foundByValue.hex) {
    return foundByValue.hex;
  }
  
  // Map common color names to hex values as fallback
  const colorNameMap = {
    'black': '#000000',
    'white': '#FFFFFF', 
    'red': '#FF0000',
    'green': '#008000',
    'blue': '#0000FF',
    'yellow': '#FFFF00',
    'gray': '#808080',
    'grey': '#808080',
    'purple': '#800080',
    'pink': '#FFC0CB',
    'orange': '#FFA500',
    'brown': '#A52A2A',
    'cyan': '#00FFFF',
    'magenta': '#FF00FF'
  };
  
  const normalizedName = String(color).toLowerCase();
  if (colorNameMap[normalizedName]) {
    return colorNameMap[normalizedName];
  }
  
  // If no color found, return default black
  console.warn(`Font color "${color}" not found, using default black`);
  return '#000000';
}

// Sincroniza editableLayers con el backend cuando cambia el proyecto
watch(() => project.value?.layers, (newLayers) => {
  if (!newLayers) {
    editableLayers.value = [];
    return;
  }
  editableLayers.value = newLayers.map(layer => {
    const type = (layer.type || layer.layer_type || '').toLowerCase();
    if (type === 'text') {
      const details = layer.details || {};
      return {
        id: layer.id,
        type: 'Text',
        x: layer.x ?? layer.x_pos ?? 50,
        y: layer.y ?? layer.y_pos ?? 50,
        z: layer.z ?? layer.z_index ?? 1,
        details: {
          text: details.text ?? layer.text ?? '',
          fontColor: normalizeFontColor(details.fontColor ?? details.font_color ?? layer.fontColor ?? layer.font_color ?? '#000'),
          fontFamily: details.fontFamily ?? details.font_family ?? layer.fontFamily ?? layer.font_family ?? 'Arial',
          fontSize: details.fontSize ?? details.font_size ?? layer.fontSize ?? layer.font_size ?? 24,
          isBold: details.isBold ?? details.is_bold ?? layer.isBold ?? layer.is_bold ?? false,
          isItalic: details.isItalic ?? details.is_italic ?? layer.isItalic ?? layer.is_italic ?? false,
          isUnderlined: details.isUnderlined ?? details.is_underlined ?? layer.isUnderlined ?? layer.is_underlined ?? false
        }
      }
    }
    if (type === 'image') {
      const details = layer.details || {};
      return {
        id: layer.id,
        type: 'Image',
        x: layer.x ?? layer.x_pos ?? 50,
        y: layer.y ?? layer.y_pos ?? 50,
        z: layer.z ?? layer.z_index ?? 1,
        details: {
          imageUrl: details.imageUrl ?? details.image_url ?? layer.imageUrl ?? layer.image_url ?? '',
          width: details.width ?? layer.width ?? 200,
          height: details.height ?? layer.height ?? 200
        }
      }
    }
    return {
      ...layer,
      x: layer.x ?? layer.x_pos ?? 50,
      y: layer.y ?? layer.y_pos ?? 50,
      z: layer.z ?? layer.z_index ?? 1
    };
  });
}, { immediate: true });

const layers = computed(() => editableLayers.value);

function handleLayerSelected(layer) {
  // Solo selecciona la capa si existe en el array, nunca modifica el array
  if (!layer || !layer.id) return;
  const found = editableLayers.value.find(l => l.id === layer.id);
  if (found) {
    selectedLayer.value = found;
  } else {
    selectedLayer.value = null;
  }
}

function handleLayerMoved(layerId, pos) {
  const idx = editableLayers.value.findIndex(l => l.id === layerId);
  if (idx !== -1) {
    editableLayers.value[idx].x = pos.x;
    editableLayers.value[idx].y = pos.y;
  }
}

function handleLayerResized(layerId, size) {
  const idx = editableLayers.value.findIndex(l => l.id === layerId);
  if (idx !== -1) {
    editableLayers.value[idx].x = size.x;
    editableLayers.value[idx].y = size.y;
    if (editableLayers.value[idx].details) {
      editableLayers.value[idx].details.width = size.width;
      editableLayers.value[idx].details.height = size.height;
    }
  }
}

function handleLayerUpdated(layerId, data) {
  const idx = editableLayers.value.findIndex(l => l.id === layerId);
  if (idx !== -1) {
    Object.assign(editableLayers.value[idx], data);
  }
}

// Refresca capas tras añadir/editar/eliminar (sin recargar la página)
async function refreshLayers() {
  if (projectId.value) {
    await loadProject(projectId.value);
  }
}

// Guardar cambios de layers (posición, z, etc) en el backend
async function saveProject() {
  if (!project.value) return;
  loading.value = true;
  error.value = '';
  try {
    // Guardar cada layer según su tipo
    const promises = editableLayers.value.map(async layer => {
      if (layer.type === 'Text') {
        // 1. Update text details (only details fields)
        const textDetails = { ...layer.details };
        await designLabService.updateTextLayerDetails(
          project.value.id,
          layer.id,
          textDetails
        );
      } else if (layer.type === 'Image') {
        // 1. Update image details (only details fields)
        // Backend expects imageUrl, width, height (all as string)
        const imageDetails = {
          imageUrl: String(layer.details.imageUrl || ''),
          width: String(layer.details.width || ''),
          height: String(layer.details.height || '')
        };
        await designLabService.updateImageLayerDetails(
          project.value.id,
          layer.id,
          imageDetails
        );
      }
      // 2. Update coordinates for all layers
      const coords = { x: layer.x, y: layer.y, z: layer.z };
      await designLabService.updateLayerCoordinates(
        project.value.id,
        layer.id,
        coords
      );
    });
    await Promise.all(promises);
    
    await refreshLayers();
  } catch (e) {
    console.error('Save error:', e?.response?.data || e);
    error.value = 'Error al guardar los cambios.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.project-detail {
  min-height: 100vh;
  height: auto;
  display: flex;
  flex-direction: column;
  background: #19191a;
}


.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem 2.5rem 0.5rem 2.5rem;
  border-bottom: 1px solid #222;
  background: #19191a;
}

.project-header.small-header {
  padding: 0.5rem 1.2rem 0.5rem 1.2rem;
  min-height: 44px;
  border-bottom: 1px solid #222;
  background: #19191a;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.01em;
  margin-bottom: 0.2em;
  margin-top: 0.2em;
}

.header-title.small-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
  padding: 0;
  letter-spacing: 0.01em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.back-btn {
  margin-right: 0.5rem;
  padding: 0;
}

.project-actions {
  display: flex;
  gap: 1rem;
}

.project-actions.align-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
}


.editor-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 80px);
  background: #181818;
}

.canvas-center-wrapper {
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.canvas-container {
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
  padding: 32px 32px 24px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 420px;
  min-height: 600px;
  max-width: 900px;
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
