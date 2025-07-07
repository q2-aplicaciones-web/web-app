/**
 * Environment configuration
 * Centralizes access to environment variables
 */

export const env = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5297',
  
  // Currency Configuration
  currencyCode: import.meta.env.VITE_CURRENCY_CODE || 'USD',
  
  // Cloudinary Configuration
  cloudinaryCloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dkkfv72vo',
  cloudinaryUploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'teelab',
  cloudinaryFolder: import.meta.env.VITE_CLOUDINARY_FOLDER || 'design-lab',
  garmentColorImageUrl: import.meta.env.VITE_GARMENT_COLOR_IMAGE_URL || '',
  // Stripe public key for frontend usage
  stripePublicKey: 'pk_test_51RhgXgEI4EuyF4l3A89XvUAwutbDGNtUsFua1yfnm8LoDESZjuNtk0db8sWigC0kJW2YplK5vMd6qq35VTV4B2rn00PqiuRimi',
  // Stripe public key for frontend usage
}

// Legacy default export for compatibility
export default env
