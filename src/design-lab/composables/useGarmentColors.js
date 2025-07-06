import { ref, readonly, computed } from 'vue'
import cloudinaryService from '../services/cloudinary.service.js'

/**
 * Composable for managing garment colors using Cloudinary sprites
 * Based on the Cloudinary service color mapping
 */
export function useGarmentColors() {
  // Reactive state
  const selectedColor = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Colors from Cloudinary service
  const colors = ref([])

  // Computed properties
  const selectedColorData = computed(() => 
    colors.value.find(color => color.value === selectedColor.value) || colors.value[0]
  )

  // Methods
  /**
   * Load colors from Cloudinary service
   */
  function loadColors() {
    try {
      loading.value = true
      error.value = null
      colors.value = cloudinaryService.getGarmentColors()
    } catch (err) {
      error.value = 'Failed to load garment colors'
      console.error('Error loading garment colors:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Get color by value
   * @param {string} colorValue - Hex color value
   * @returns {Object|null} Color object or null if not found
   */
  function getColorByValue(colorValue) {
    return cloudinaryService.getGarmentColorByValue(colorValue)
  }

  /**
   * Get CSS style for a color
   * @param {string} colorValue - Hex color value
   * @param {number} size - Size of the color preview
   * @returns {Object} CSS style object
   */
  function getColorStyle(colorValue, size = 80) {
    return cloudinaryService.getGarmentColorStyle(colorValue, size)
  }

  /**
   * Select a color
   * @param {string} colorValue - Color value to select
   */
  function selectColor(colorValue) {
    const color = getColorByValue(colorValue)
    if (color) {
      selectedColor.value = colorValue
      error.value = null
    } else {
      error.value = `Color "${colorValue}" is not available`
    }
  }

  /**
   * Check if a color is available
   * @param {string} colorValue - Color value to check
   * @returns {boolean} True if color is available
   */
  function isColorAvailable(colorValue) {
    return colors.value.some(c => c.value === colorValue)
  }

  /**
   * Reset to default color
   */
  function resetToDefault() {
    if (colors.value.length > 0) {
      selectedColor.value = colors.value[0].value
    }
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
    selectedColor: readonly(selectedColor),
    loading: readonly(loading),
    error: readonly(error),
    colors: readonly(colors),
    
    // Computed properties
    selectedColorData,
    
    // Actions
    loadColors,
    selectColor,
    getColorByValue,
    getColorStyle,
    isColorAvailable,
    resetToDefault,
    clearError
  }
}