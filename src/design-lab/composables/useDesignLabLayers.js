import { ref, readonly, computed } from 'vue'
import designLabService from '../services/design-lab.service.js'
import cloudinaryService from '../services/cloudinary.service.js'

/**
 * Composable for managing layer operations
 * API-first approach with reactive state management
 */
export function useDesignLabLayers(projectId, onLayerChange = null) {
  // Reactive state
  const loading = ref(false)
  const error = ref(null)

  // Service instances
  // const designLabService = new DesignLabService() // Already imported as singleton
  // const cloudinaryService = new CloudinaryService() // Already imported as singleton

  /**
   * Create a new text layer
   * @param {Object} textData - Text layer data
   */
  async function createTextLayer(textData) {
    if (!projectId.value) {
      error.value = 'Project ID is required'
      return null
    }

    loading.value = true
    error.value = null
    
    try {
      const layer = await designLabService.createTextLayer(projectId.value, textData)
      
      // Notify parent component
      if (onLayerChange) {
        onLayerChange('add', layer)
      }
      
      return layer
    } catch (err) {
      error.value = err.message || 'Failed to create text layer'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Update text layer details
   * @param {string} layerId - Layer ID
   * @param {Object} textDetails - Updated text details
   */
  async function updateTextLayerDetails(layerId, textDetails) {
    if (!projectId.value) {
      error.value = 'Project ID is required'
      return null
    }

    loading.value = true
    error.value = null
    
    try {
      const layer = await designLabService.updateTextLayerDetails(
        projectId.value, 
        layerId, 
        textDetails
      )
      
      // Notify parent component
      if (onLayerChange) {
        onLayerChange('update', layer)
      }
      
      return layer
    } catch (err) {
      error.value = err.message || 'Failed to update text layer'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Create image layer from file upload
   * @param {File} imageFile - Image file to upload
   * @param {Object} options - Additional options
   */
  async function createImageLayerFromFile(imageFile, options = {}) {
    if (!projectId.value) {
      error.value = 'Project ID is required'
      return null
    }

    if (!imageFile) {
      error.value = 'Image file is required'
      return null
    }

    loading.value = true
    error.value = null
    
    try {
      // Upload image to Cloudinary first
      const uploadResult = await cloudinaryService.uploadImage(imageFile)
      
      // Create image layer with uploaded URL
      const imageData = {
        imageUrl: uploadResult.secure_url,
        width: options.width || uploadResult.width?.toString() || '100',
        height: options.height || uploadResult.height?.toString() || '100'
      }
      
      const layer = await designLabService.createImageLayer(projectId.value, imageData)
      
      // Notify parent component
      if (onLayerChange) {
        onLayerChange('add', layer)
      }
      
      return layer
    } catch (err) {
      error.value = err.message || 'Failed to create image layer from file'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Create image layer from URL
   * @param {Object} imageData - Image layer data
   */
  async function createImageLayer(imageData) {
    if (!projectId.value) {
      error.value = 'Project ID is required'
      return null
    }

    loading.value = true
    error.value = null
    
    try {
      const layer = await designLabService.createImageLayer(projectId.value, imageData)
      
      // Notify parent component
      if (onLayerChange) {
        onLayerChange('add', layer)
      }
      
      return layer
    } catch (err) {
      error.value = err.message || 'Failed to create image layer'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Update image layer details
   * @param {string} layerId - Layer ID
   * @param {Object} imageDetails - Updated image details
   */
  async function updateImageLayerDetails(layerId, imageDetails) {
    if (!projectId.value) {
      error.value = 'Project ID is required'
      return null
    }

    loading.value = true
    error.value = null
    
    try {
      const layer = await designLabService.updateImageLayerDetails(
        projectId.value, 
        layerId, 
        imageDetails
      )
      
      // Notify parent component
      if (onLayerChange) {
        onLayerChange('update', layer)
      }
      
      return layer
    } catch (err) {
      error.value = err.message || 'Failed to update image layer'
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
    if (!projectId.value) {
      error.value = 'Project ID is required'
      return false
    }

    loading.value = true
    error.value = null
    
    try {
      await designLabService.deleteLayer(projectId.value, layerId)
      
      // Notify parent component
      if (onLayerChange) {
        onLayerChange('delete', { id: layerId })
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
   * Update layer position (local state only - no API endpoint available)
   * @param {string} layerId - Layer ID
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} z - Z index (optional)
   */
  function updateLayerPosition(layerId, x, y, z = null) {
    try {
      // Notify parent component with coordinate update
      if (onLayerChange) {
        const updates = { id: layerId, x, y }
        if (z !== null) {
          updates.z = z
        }
        onLayerChange('position', updates)
      }
    } catch (err) {
      error.value = err.message || 'Failed to update layer position'
    }
  }

  /**
   * Update layer opacity (local state only - no API endpoint available)
   * @param {string} layerId - Layer ID
   * @param {number} opacity - Opacity value (0-1)
   */
  function updateLayerOpacity(layerId, opacity) {
    try {
      // Notify parent component
      if (onLayerChange) {
        onLayerChange('opacity', { id: layerId, opacity })
      }
    } catch (err) {
      error.value = err.message || 'Failed to update layer opacity'
    }
  }

  /**
   * Update layer visibility (local state only - no API endpoint available)
   * @param {string} layerId - Layer ID
   * @param {boolean} isVisible - Visibility state
   */
  function updateLayerVisibility(layerId, isVisible) {
    try {
      // Notify parent component
      if (onLayerChange) {
        onLayerChange('visibility', { id: layerId, isVisible })
      }
    } catch (err) {
      error.value = err.message || 'Failed to update layer visibility'
    }
  }

  /**
   * Create default text layer data
   * @param {string} text - Initial text
   * @returns {Object} Default text layer data
   */
  function createDefaultTextLayer(text = 'New Text') {
    return {
      text,
      fontColor: '#000000',
      fontFamily: 'Arial',
      fontSize: 24,
      isBold: false,
      isItalic: false,
      isUnderlined: false
    }
  }

  /**
   * Create default image layer data
   * @param {string} imageUrl - Image URL
   * @param {string} width - Width as string
   * @param {string} height - Height as string
   * @returns {Object} Default image layer data
   */
  function createDefaultImageLayer(imageUrl, width = '100', height = '100') {
    return {
      imageUrl,
      width,
      height
    }
  }

  /**
   * Clear error state
   */
  function clearError() {
    error.value = null
  }

  return {
    // Readonly state
    loading: readonly(loading),
    error: readonly(error),
    
    // Text layer methods
    createTextLayer,
    updateTextLayerDetails,
    
    // Image layer methods
    createImageLayerFromFile,
    createImageLayer,
    updateImageLayerDetails,
    
    // General layer methods
    deleteLayer,
    updateLayerPosition,
    updateLayerOpacity,
    updateLayerVisibility,
    
    // Helper methods
    createDefaultTextLayer,
    createDefaultImageLayer,
    clearError
  }
}
