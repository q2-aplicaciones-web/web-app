/**
 * Cloudinary Service - Handle image operations and garment color sprites
 * Uses the existing VITE_GARMENT_COLOR_IMAGE_URL for the 4x4 color grid
 */

export class CloudinaryService {
    constructor() {
        // Cloudinary configuration
        this.cloudName = 'dkkfv72vo';
        this.uploadPreset = 'teelab'; // For unsigned uploads
        this.baseUrl = 'https://res.cloudinary.com';
        
        // Garment color sprite configuration
        this.garmentSpriteUrl = import.meta.env.VITE_GARMENT_COLOR_IMAGE_URL;
        this.spriteGridSize = 4; // 4x4 grid
        this.segmentSize = 600; // Default segment size
        
        // Color mapping (matches the 4x4 grid in the sprite AND backend enum values)
        this.garmentColors = [
            { label: "Black", value: "Black", hex: "#161615", position: [0, 0] },
            { label: "Gray", value: "Gray", hex: "#403D3B", position: [1, 0] },
            { label: "Light Gray", value: "LightGray", hex: "#B3B1AF", position: [2, 0] },
            { label: "White", value: "White", hex: "#EDEDED", position: [3, 0] },
            { label: "Red", value: "Red", hex: "#B51B14", position: [0, 1] },
            { label: "Pink", value: "Pink", hex: "#F459B0", position: [1, 1] },
            { label: "Light Purple", value: "LightPurple", hex: "#D890E4", position: [2, 1] },
            { label: "Purple", value: "Purple", hex: "#693FA0", position: [3, 1] },
            { label: "Light Blue", value: "LightBlue", hex: "#00A5BC", position: [0, 2] },
            { label: "Cyan", value: "Cyan", hex: "#31B7C9", position: [1, 2] },
            { label: "Sky Blue", value: "SkyBlue", hex: "#3F9BDC", position: [2, 2] },
            { label: "Blue", value: "Blue", hex: "#1B3D92", position: [3, 2] },
            { label: "Green", value: "Green", hex: "#1B8937", position: [0, 3] },
            { label: "Light Green", value: "LightGreen", hex: "#5BBE65", position: [1, 3] },
            { label: "Yellow", value: "Yellow", hex: "#FECD08", position: [2, 3] },
            { label: "Dark Yellow", value: "DarkYellow", hex: "#F2AB00", position: [3, 3] }
        ];
    }

    // ==================== GARMENT COLOR SPRITE METHODS ====================

    /**
     * Get all available garment colors
     * @returns {Array} Array of color objects
     */
    getGarmentColors() {
        return this.garmentColors;
    }

    /**
     * Get garment color by value
     * @param {string} colorValue - Color value to search for
     * @returns {Object|null} Color object or null if not found
     */
    getGarmentColorByValue(colorValue) {
        return this.garmentColors.find(color => color.value === colorValue);
    }

    /**
     * Get garment color by label
     * @param {string} label - Color label
     * @returns {Object|null} Color object or null if not found
     */
    getGarmentColorByLabel(label) {
        return this.garmentColors.find(color => color.label === label);
    }

    /**
     * Generate CSS background style for garment color sprite
     * @param {string} colorValue - Hex color value
     * @param {number} size - Size of the segment (default: 600px)
     * @returns {Object} CSS style object
     */
    getGarmentColorStyle(colorValue, size = 600) {
        const color = this.getGarmentColorByValue(colorValue);
        if (!color) {
            console.warn(`Color ${colorValue} not found in garment colors`);
            return this.getDefaultGarmentStyle(size);
        }

        const [col, row] = color.position;
        const spriteSize = size * this.spriteGridSize;

        return {
            backgroundImage: `url(${this.garmentSpriteUrl})`,
            backgroundPosition: `-${col * size}px -${row * size}px`,
            backgroundSize: `${spriteSize}px ${spriteSize}px`,
            backgroundRepeat: 'no-repeat',
            width: `${size}px`,
            height: `${size}px`
        };
    }

    /**
     * Get responsive garment color styles for different screen sizes
     * @param {string} colorValue - Hex color value
     * @returns {Object} Object with styles for different sizes
     */
    getResponsiveGarmentColorStyles(colorValue) {
        return {
            desktop: this.getGarmentColorStyle(colorValue, 600),
            tablet: this.getGarmentColorStyle(colorValue, 450),
            mobile: this.getGarmentColorStyle(colorValue, 320)
        };
    }

    /**
     * Get default garment style (first color)
     * @param {number} size - Size of the segment
     * @returns {Object} CSS style object
     */
    getDefaultGarmentStyle(size = 600) {
        return this.getGarmentColorStyle(this.garmentColors[0].value, size);
    }

    /**
     * Get background position for a color (legacy method for compatibility)
     * @param {string} colorValue - Hex color value
     * @param {number} segmentSize - Size of each segment
     * @returns {string} CSS background-position value
     */
    getGarmentColorPosition(colorValue, segmentSize = 600) {
        const color = this.getGarmentColorByValue(colorValue);
        if (!color) {
            return '0px 0px'; // Default position
        }

        const [col, row] = color.position;
        return `-${col * segmentSize}px -${row * segmentSize}px`;
    }

    // ==================== IMAGE UPLOAD METHODS ====================

    /**
     * Upload image to Cloudinary
     * @param {File} file - Image file to upload
     * @param {Object} options - Upload options
     * @returns {Promise<Object>} Upload result with URL and metadata
     */
    async uploadImage(file, options = {}) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', this.uploadPreset);
            formData.append('folder', 'design-lab');
            
            // Add optional parameters
            if (options.transformation) {
                formData.append('transformation', options.transformation);
            }

            // Create XMLHttpRequest for progress tracking if callback provided
            if (options.onProgress && typeof options.onProgress === 'function') {
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    
                    xhr.upload.addEventListener('progress', (event) => {
                        if (event.lengthComputable) {
                            const progress = Math.round((event.loaded / event.total) * 100);
                            options.onProgress(progress);
                        }
                    });

                    xhr.addEventListener('load', () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                const result = JSON.parse(xhr.responseText);
                                resolve({
                                    url: result.secure_url,
                                    publicId: result.public_id,
                                    width: result.width,
                                    height: result.height,
                                    format: result.format,
                                    bytes: result.bytes,
                                    createdAt: result.created_at
                                });
                            } catch (parseError) {
                                reject(new Error('Failed to parse upload response'));
                            }
                        } else {
                            reject(new Error(`Upload failed: ${xhr.statusText}`));
                        }
                    });

                    xhr.addEventListener('error', () => {
                        reject(new Error('Upload failed: Network error'));
                    });

                    xhr.open('POST', `${this.baseUrl}/${this.cloudName}/image/upload`);
                    xhr.send(formData);
                });
            }

            // Fallback to fetch API without progress tracking
            const response = await fetch(
                `${this.baseUrl}/${this.cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const result = await response.json();
            
            return {
                url: result.secure_url,
                publicId: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
                createdAt: result.created_at
            };
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw new Error(`Image upload failed: ${error.message}`);
        }
    }

    /**
     * Upload image and calculate dimensions for layer creation
     * @param {File} file - Image file to upload
     * @param {number} maxSize - Maximum size for the layer (default: 200px)
     * @returns {Promise<Object>} Upload result with calculated dimensions
     */
    async uploadImageWithDimensions(file, maxSize = 200) {
        try {
            // Upload to Cloudinary
            const uploadResult = await this.uploadImage(file);
            
            // Calculate dimensions for layer
            const { width: originalWidth, height: originalHeight } = uploadResult;
            const aspectRatio = originalHeight / originalWidth;
            
            let layerWidth, layerHeight;
            
            if (originalWidth > originalHeight) {
                // Landscape orientation
                layerWidth = Math.min(maxSize, originalWidth);
                layerHeight = Math.round(layerWidth * aspectRatio);
            } else {
                // Portrait or square orientation
                layerHeight = Math.min(maxSize, originalHeight);
                layerWidth = Math.round(layerHeight / aspectRatio);
            }

            return {
                ...uploadResult,
                layerWidth,
                layerHeight,
                aspectRatio
            };
        } catch (error) {
            console.error('Upload with dimensions error:', error);
            throw error;
        }
    }

    /**
     * Generate optimized image URL with transformations
     * @param {string} publicId - Cloudinary public ID
     * @param {Object} transformations - Transformation options
     * @returns {string} Optimized image URL
     */
    generateOptimizedUrl(publicId, transformations = {}) {
        const {
            width,
            height,
            crop = 'fill',
            quality = 'auto',
            format = 'auto'
        } = transformations;

        let url = `${this.baseUrl}/${this.cloudName}/image/upload`;
        
        const params = [];
        if (width) params.push(`w_${width}`);
        if (height) params.push(`h_${height}`);
        params.push(`c_${crop}`);
        params.push(`q_${quality}`);
        params.push(`f_${format}`);
        
        if (params.length > 0) {
            url += '/' + params.join(',');
        }
        
        url += `/${publicId}`;
        return url;
    }

    /**
     * Process uploaded image for use in design layer
     * @param {File} file - Image file
     * @param {Object} options - Processing options
     * @returns {Promise<Object>} Processed image data ready for layer creation
     */
    async processImageForLayer(file, options = {}) {
        const { maxWidth = 200, maxHeight = 200, centerX = 100, centerY = 100 } = options;
        
        try {
            const uploadResult = await this.uploadImageWithDimensions(file, Math.max(maxWidth, maxHeight));
            
            return {
                imageUrl: uploadResult.url,
                width: uploadResult.layerWidth.toString(),
                height: uploadResult.layerHeight.toString(),
                x: centerX - Math.round(uploadResult.layerWidth / 2),
                y: centerY - Math.round(uploadResult.layerHeight / 2),
                publicId: uploadResult.publicId,
                originalWidth: uploadResult.width,
                originalHeight: uploadResult.height
            };
        } catch (error) {
            console.error('Process image for layer error:', error);
            throw error;
        }
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Validate image file
     * @param {File} file - File to validate
     * @param {Object} constraints - Validation constraints
     * @returns {boolean} True if valid
     */
    validateImageFile(file, constraints = {}) {
        const {
            maxSize = 10 * 1024 * 1024, // 10MB default
            allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        } = constraints;

        if (!file || !file.type) {
            throw new Error('Invalid file');
        }

        if (!allowedTypes.includes(file.type)) {
            throw new Error(`File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`);
        }

        if (file.size > maxSize) {
            throw new Error(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum ${(maxSize / 1024 / 1024).toFixed(2)}MB`);
        }

        return true;
    }

    /**
     * Extract public ID from Cloudinary URL
     * @param {string} url - Cloudinary URL
     * @returns {string|null} Public ID or null if invalid
     */
    extractPublicId(url) {
        const regex = /\/v\d+\/(.+)\.[a-z]+$/i;
        const match = url.match(regex);
        return match ? match[1] : null;
    }
}

// Export singleton instance
export const cloudinaryService = new CloudinaryService();
export default cloudinaryService;
