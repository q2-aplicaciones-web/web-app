import { ref, readonly, computed } from 'vue'
import designLabService from '../services/design-lab.service.js'

/**
 * Composable for managing layers state and operations
 * API-first approach with reactive state management
 */
export function useLayers() {
  // Reactive state
  const layers = ref([])
  const selectedLayerId = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Service instance
  // const designLabService = new DesignLabService() // Already imported as singleton

  // Computed properties
  const hasLayers = computed(() => layers.value.length > 0)
  const selectedLayer = computed(() => 
    layers.value.find(layer => layer.id === selectedLayerId.value) || null
  )
  const visibleLayers = computed(() => 
    layers.value.filter(layer => layer.isVisible)
  )
  const layersByZIndex = computed(() => 
    [...layers.value].sort((a, b) => a.z - b.z)
  )

  /**
   * Load layers from current project
   * @param {Object} project - Project object with layers
   */
  function loadLayersFromProject(project) {
    if (project && project.layers) {
      layers.value = [...project.layers]
    } else {
      layers.value = []
    }
    selectedLayerId.value = null
    error.value = null
  }

  /**
   * Create a new text layer
   * @param {string} projectId - Project ID
   * @param {Object} textData - Text layer data
   */
  async function createTextLayer(projectId, textData) {
    if (!projectId || !textData) {
      error.value = 'Project ID and text data are required'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const newLayer = await designLabService.createTextLayer(projectId, textData)
      
      // Add to layers list
      layers.value.push(newLayer)
      
      // Select the new layer
      selectedLayerId.value = newLayer.id
      
      return newLayer
    } catch (err) {
      error.value = err.message || 'Failed to create text layer'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new image layer
   * @param {string} projectId - Project ID
   * @param {Object} imageData - Image layer data
   */
  async function createImageLayer(projectId, imageData) {
    if (!projectId || !imageData) {
      error.value = 'Project ID and image data are required'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const newLayer = await designLabService.createImageLayer(projectId, imageData)
      
      // Add to layers list
      layers.value.push(newLayer)
      
      // Select the new layer
      selectedLayerId.value = newLayer.id
      
      return newLayer
    } catch (err) {
      error.value = err.message || 'Failed to create image layer'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a layer
   * @param {string} projectId - Project ID
   * @param {string} layerId - Layer ID to delete
   */
  async function deleteLayer(projectId, layerId) {
    if (!projectId || !layerId) {
      error.value = 'Project ID and layer ID are required'
      return false
    }

    loading.value = true
    error.value = null

    try {
      await designLabService.deleteLayer(projectId, layerId)
      
      // Remove from layers list
      layers.value = layers.value.filter(layer => layer.id !== layerId)
      
      // Clear selection if deleted layer was selected
      if (selectedLayerId.value === layerId) {
        selectedLayerId.value = null
      }
      
      return true
    } catch (err) {
      error.value = err.message || 'Failed to delete layer'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Update text layer details
   * @param {string} projectId - Project ID
   * @param {string} layerId - Layer ID
   * @param {Object} textData - Updated text data
   */
  async function updateTextLayer(projectId, layerId, textData) {
    if (!projectId || !layerId || !textData) {
      error.value = 'Project ID, layer ID, and text data are required'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const updatedLayer = await designLabService.updateTextLayerDetails(projectId, layerId, textData)
      
      // Update in layers list
      const index = layers.value.findIndex(layer => layer.id === layerId)
      if (index !== -1) {
        layers.value[index] = updatedLayer
      }
      
      return updatedLayer
    } catch (err) {
      error.value = err.message || 'Failed to update text layer'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Update image layer details
   * @param {string} projectId - Project ID
   * @param {string} layerId - Layer ID
   * @param {Object} imageData - Updated image data
   */
  async function updateImageLayer(projectId, layerId, imageData) {
    if (!projectId || !layerId || !imageData) {
      error.value = 'Project ID, layer ID, and image data are required'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const updatedLayer = await designLabService.updateImageLayerDetails(projectId, layerId, imageData)
      
      // Update in layers list
      const index = layers.value.findIndex(layer => layer.id === layerId)
      if (index !== -1) {
        layers.value[index] = updatedLayer
      }
      
      return updatedLayer
    } catch (err) {
      error.value = err.message || 'Failed to update image layer'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Update layer position (local state only - no API endpoint available)
   * @param {string} layerId - Layer ID
   * @param {Object} position - Position data {x, y, z?, opacity?}
   */
  function updateLayerPosition(layerId, position) {
    const index = layers.value.findIndex(layer => layer.id === layerId)
    if (index !== -1) {
      const layer = layers.value[index]
      layers.value[index] = {
        ...layer,
        x: position.x !== undefined ? position.x : layer.x,
        y: position.y !== undefined ? position.y : layer.y,
        z: position.z !== undefined ? position.z : layer.z,
        opacity: position.opacity !== undefined ? position.opacity : layer.opacity
      }
    }
  }

  /**
   * Update layer visibility (local state only - no API endpoint available)
   * @param {string} layerId - Layer ID
   * @param {boolean} isVisible - Visibility state
   */
  function updateLayerVisibility(layerId, isVisible) {
    const index = layers.value.findIndex(layer => layer.id === layerId)
    if (index !== -1) {
      layers.value[index] = {
        ...layers.value[index],
        isVisible
      }
    }
  }

  /**
   * Select a layer
   * @param {string} layerId - Layer ID to select
   */
  function selectLayer(layerId) {
    selectedLayerId.value = layerId
  }

  /**
   * Clear layer selection
   */
  function clearSelection() {
    selectedLayerId.value = null
  }

  /**
   * Move layer up in z-index
   * @param {string} layerId - Layer ID
   */
  function moveLayerUp(layerId) {
    const layer = layers.value.find(l => l.id === layerId)
    if (layer) {
      const maxZ = Math.max(...layers.value.map(l => l.z))
      updateLayerPosition(layerId, { z: Math.min(layer.z + 1, maxZ + 1) })
    }
  }

  /**
   * Move layer down in z-index
   * @param {string} layerId - Layer ID
   */
  function moveLayerDown(layerId) {
    const layer = layers.value.find(l => l.id === layerId)
    if (layer) {
      const minZ = Math.min(...layers.value.map(l => l.z))
      updateLayerPosition(layerId, { z: Math.max(layer.z - 1, minZ - 1) })
    }
  }

  /**
   * Clear all layers
   */
  function clearLayers() {
    layers.value = []
    selectedLayerId.value = null
    error.value = null
  }

  /**
   * Clear error state
   */
  function clearError() {
    error.value = null
  }

  return {
    // Readonly state
    layers: readonly(layers),
    selectedLayerId: readonly(selectedLayerId),
    loading: readonly(loading),
    error: readonly(error),
    
    // Computed properties
    hasLayers,
    selectedLayer,
    visibleLayers,
    layersByZIndex,
    
    // Actions
    loadLayersFromProject,
    createTextLayer,
    createImageLayer,
    deleteLayer,
    updateTextLayer,
    updateImageLayer,
    updateLayerPosition,
    updateLayerVisibility,
    selectLayer,
    clearSelection,
    moveLayerUp,
    moveLayerDown,
    clearLayers,
    clearError
  }
}
