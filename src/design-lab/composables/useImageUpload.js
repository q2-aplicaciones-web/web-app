import { ref, readonly } from 'vue'
import cloudinaryService from '../services/cloudinary.service.js'

/**
 * Composable for handling image uploads and management
 * API-first approach with Cloudinary integration
 */
export function useImageUpload() {
  // Reactive state
  const loading = ref(false)
  const error = ref(null)
  const uploadProgress = ref(0)

  // Service instance
  // const cloudinaryService = new CloudinaryService() // Already imported as singleton

  /**
   * Upload a single image file
   * @param {File} file - Image file to upload
   * @param {Object} options - Upload options
   * @returns {Object|null} Upload result or null if failed
   */
  async function uploadImage(file, options = {}) {
    if (!file) {
      error.value = 'File is required'
      return null
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      error.value = 'File must be an image'
      return null
    }

    // Validate file size (e.g., max 10MB)
    const maxSize = options.maxSize || 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      error.value = `File size must be less than ${maxSize / 1024 / 1024}MB`
      return null
    }

    loading.value = true
    error.value = null
    uploadProgress.value = 0

    try {
      const result = await cloudinaryService.uploadImage(file, {
        ...options,
        onProgress: (progress) => {
          uploadProgress.value = progress
        }
      })

      uploadProgress.value = 100
      return result
    } catch (err) {
      error.value = err.message || 'Failed to upload image'
      return null
    } finally {
      loading.value = false
      // Reset progress after a delay
      setTimeout(() => {
        uploadProgress.value = 0
      }, 1000)
    }
  }

  /**
   * Upload multiple image files
   * @param {FileList|Array} files - Image files to upload
   * @param {Object} options - Upload options
   * @returns {Array} Array of upload results
   */
  async function uploadMultipleImages(files, options = {}) {
    if (!files || files.length === 0) {
      error.value = 'Files are required'
      return []
    }

    loading.value = true
    error.value = null
    const results = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Update progress based on file index
        const fileProgress = Math.round((i / files.length) * 100)
        uploadProgress.value = fileProgress
        
        // Validate each file before upload
        if (!file.type.startsWith('image/')) {
          console.warn(`Skipping non-image file: ${file.name}`)
          continue
        }

        const maxSize = options.maxSize || 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
          console.warn(`Skipping oversized file: ${file.name}`)
          continue
        }

        try {
          // Upload individual file using cloudinary service directly
          const result = await cloudinaryService.uploadImage(file, {
            ...options,
            onProgress: (progress) => {
              // Calculate overall progress: file progress + individual file progress
              const overallProgress = fileProgress + (progress / files.length)
              uploadProgress.value = Math.min(Math.round(overallProgress), 100)
            }
          })

          if (result) {
            results.push(result)
          }
        } catch (fileError) {
          console.error(`Failed to upload file ${file.name}:`, fileError)
          // Continue with other files instead of failing completely
        }
      }

      uploadProgress.value = 100
      return results
    } catch (err) {
      error.value = err.message || 'Failed to upload images'
      return results
    } finally {
      loading.value = false
      // Reset progress after a delay
      setTimeout(() => {
        uploadProgress.value = 0
      }, 1000)
    }
  }

  /**
   * Handle file input change event
   * @param {Event} event - File input change event
   * @param {Object} options - Upload options
   * @returns {Object|Array|null} Upload result(s) or null
   */
  async function handleFileUpload(event, options = {}) {
    const files = event.target.files
    if (!files || files.length === 0) {
      return null
    }

    if (files.length === 1) {
      return await uploadImage(files[0], options)
    } else {
      return await uploadMultipleImages(files, options)
    }
  }

  /**
   * Handle drag and drop file upload
   * @param {DragEvent} event - Drag event
   * @param {Object} options - Upload options
   * @returns {Object|Array|null} Upload result(s) or null
   */
  async function handleDropUpload(event, options = {}) {
    event.preventDefault()
    
    const files = Array.from(event.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )

    if (files.length === 0) {
      error.value = 'No valid image files found'
      return null
    }

    if (files.length === 1) {
      return await uploadImage(files[0], options)
    } else {
      return await uploadMultipleImages(files, options)
    }
  }

  /**
   * Validate image file
   * @param {File} file - File to validate
   * @param {Object} options - Validation options
   * @returns {boolean} True if valid
   */
  function validateImageFile(file, options = {}) {
    if (!file) {
      error.value = 'File is required'
      return false
    }

    if (!file.type.startsWith('image/')) {
      error.value = 'File must be an image'
      return false
    }

    const maxSize = options.maxSize || 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      error.value = `File size must be less than ${maxSize / 1024 / 1024}MB`
      return false
    }

    const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      error.value = `File type ${file.type} is not allowed`
      return false
    }

    return true
  }

  /**
   * Get file size in human readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Create preview URL for image file
   * @param {File} file - Image file
   * @returns {string} Preview URL
   */
  function createPreviewUrl(file) {
    return URL.createObjectURL(file)
  }

  /**
   * Revoke preview URL to free memory
   * @param {string} url - Preview URL to revoke
   */
  function revokePreviewUrl(url) {
    URL.revokeObjectURL(url)
  }

  /**
   * Clear error state
   */
  function clearError() {
    error.value = null
  }

  /**
   * Reset upload state
   */
  function resetUpload() {
    loading.value = false
    error.value = null
    uploadProgress.value = 0
  }

  return {
    // Readonly state
    loading: readonly(loading),
    error: readonly(error),
    uploadProgress: readonly(uploadProgress),
    
    // Actions
    uploadImage,
    uploadMultipleImages,
    handleFileUpload,
    handleDropUpload,
    validateImageFile,
    formatFileSize,
    createPreviewUrl,
    revokePreviewUrl,
    clearError,
    resetUpload
  }
}
