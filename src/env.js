/**
 * Environment configuration
 * Centralizes access to environment variables
 */

export const env = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5297',
  
  // Cloudinary Configuration
  garmentColorImageUrl: import.meta.env.VITE_GARMENT_COLOR_IMAGE_URL || ''
}

// Legacy default export for compatibility
export default env
