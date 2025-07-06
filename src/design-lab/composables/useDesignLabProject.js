import { ref, readonly, computed } from 'vue'
import designLabService from '../services/design-lab.service.js'

/**
 * Composable for managing single project state and operations
 * API-first approach with reactive state management
 */
export function useDesignLabProject(initialProjectId = null) {
  // Reactive state
  const currentProject = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const selectedLayerId = ref(null)

  // Service instance
  // const designLabService = new DesignLabService() // Already imported as singleton

  // Computed properties
  const hasProject = computed(() => !!currentProject.value)
  const projectId = computed(() => currentProject.value?.id || null)
  const projectTitle = computed(() => currentProject.value?.title || '')
  const projectLayers = computed(() => currentProject.value?.layers || [])
  const selectedLayer = computed(() => 
    projectLayers.value.find(layer => layer.id === selectedLayerId.value) || null
  )
  const hasLayers = computed(() => projectLayers.value.length > 0)
  const layersByZIndex = computed(() => 
    [...projectLayers.value].sort((a, b) => a.z - b.z)
  )

  /**
   * Load a project by ID
   * @param {string} projectId - Project ID
   */
  async function loadProject(projectId) {
    if (!projectId) {
      error.value = 'Project ID is required'
      return
    }

    loading.value = true
    error.value = null

    try {
      const project = await designLabService.getProject(projectId)
      currentProject.value = project
      selectedLayerId.value = null // Clear selection when loading new project
    } catch (err) {
      error.value = err.message || 'Failed to load project'
      currentProject.value = null
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new project
   * @param {Object} projectData - Project creation data
   */
  async function createProject(projectData) {
    if (!projectData) {
      error.value = 'Project data is required'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const newProject = await designLabService.createProject(projectData)
      currentProject.value = newProject
      selectedLayerId.value = null
      return newProject
    } catch (err) {
      error.value = err.message || 'Failed to create project'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Update project details
   * @param {Object} updateData - Update data
   */
  async function updateProjectDetails(updateData) {
    if (!currentProject.value || !updateData) {
      error.value = 'Project and update data are required'
      return false
    }

    loading.value = true
    error.value = null

    try {
      await designLabService.updateProjectDetails(currentProject.value.id, updateData)
      
      // Refresh the project to get updated data
      await loadProject(currentProject.value.id)
      
      return true
    } catch (err) {
      error.value = err.message || 'Failed to update project details'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete the current project
   */
  async function deleteProject() {
    if (!currentProject.value) {
      error.value = 'No project to delete'
      return false
    }

    loading.value = true
    error.value = null

    try {
      await designLabService.deleteProject(currentProject.value.id)
      currentProject.value = null
      selectedLayerId.value = null
      return true
    } catch (err) {
      error.value = err.message || 'Failed to delete project'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new text layer
   * @param {Object} textData - Text layer data
   */
  async function createTextLayer(textData) {
    if (!currentProject.value || !textData) {
      error.value = 'Project and text data are required'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const newLayer = await designLabService.createTextLayer(currentProject.value.id, textData)
      
      // Add to current project layers
      currentProject.value.layers.push(newLayer)
      
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
   * @param {Object} imageData - Image layer data
   */
  async function createImageLayer(imageData) {
    if (!currentProject.value || !imageData) {
      error.value = 'Project and image data are required'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const newLayer = await designLabService.createImageLayer(currentProject.value.id, imageData)
      
      // Add to current project layers
      currentProject.value.layers.push(newLayer)
      
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
   * @param {string} layerId - Layer ID to delete
   */
  async function deleteLayer(layerId) {
    if (!currentProject.value || !layerId) {
      error.value = 'Project and layer ID are required'
      return false
    }

    loading.value = true
    error.value = null

    try {
      await designLabService.deleteLayer(currentProject.value.id, layerId)
      
      // Remove from current project layers
      currentProject.value.layers = currentProject.value.layers.filter(layer => layer.id !== layerId)
      
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
   * @param {string} layerId - Layer ID
   * @param {Object} textData - Updated text data
   */
  async function updateTextLayer(layerId, textData) {
    if (!currentProject.value || !layerId || !textData) {
      error.value = 'Project, layer ID, and text data are required'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const updatedLayer = await designLabService.updateTextLayerDetails(currentProject.value.id, layerId, textData)
      
      // Update in current project layers
      const index = currentProject.value.layers.findIndex(layer => layer.id === layerId)
      if (index !== -1) {
        currentProject.value.layers[index] = updatedLayer
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
   * @param {string} layerId - Layer ID
   * @param {Object} imageData - Updated image data
   */
  async function updateImageLayer(layerId, imageData) {
    if (!currentProject.value || !layerId || !imageData) {
      error.value = 'Project, layer ID, and image data are required'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const updatedLayer = await designLabService.updateImageLayerDetails(currentProject.value.id, layerId, imageData)
      
      // Update in current project layers
      const index = currentProject.value.layers.findIndex(layer => layer.id === layerId)
      if (index !== -1) {
        currentProject.value.layers[index] = updatedLayer
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
   * Update layer position (local state only - no API endpoint available)
   * @param {string} layerId - Layer ID
   * @param {Object} position - Position data {x, y, z?, opacity?}
   */
  function updateLayerPosition(layerId, position) {
    if (!currentProject.value) return

    const index = currentProject.value.layers.findIndex(layer => layer.id === layerId)
    if (index !== -1) {
      const layer = currentProject.value.layers[index]
      currentProject.value.layers[index] = {
        ...layer,
        x: position.x !== undefined ? position.x : layer.x,
        y: position.y !== undefined ? position.y : layer.y,
        z: position.z !== undefined ? position.z : layer.z,
        opacity: position.opacity !== undefined ? position.opacity : layer.opacity
      }
    }
  }

  /**
   * Clear current project
   */
  function clearProject() {
    currentProject.value = null
    selectedLayerId.value = null
    error.value = null
  }

  /**
   * Clear error state
   */
  function clearError() {
    error.value = null
  }

  // Initialize if projectId provided
  if (initialProjectId) {
    loadProject(initialProjectId)
  }

  return {
    // Readonly state
    currentProject: readonly(currentProject),
    loading: readonly(loading),
    error: readonly(error),
    selectedLayerId: readonly(selectedLayerId),
    
    // Computed properties
    hasProject,
    projectId,
    projectTitle,
    projectLayers,
    selectedLayer,
    hasLayers,
    layersByZIndex,
    
    // Actions
    loadProject,
    createProject,
    updateProjectDetails,
    deleteProject,
    createTextLayer,
    createImageLayer,
    deleteLayer,
    updateTextLayer,
    updateImageLayer,
    selectLayer,
    clearSelection,
    updateLayerPosition,
    clearProject,
    clearError
  }
}
