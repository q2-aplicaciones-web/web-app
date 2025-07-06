/**
 * Project Entity - Maps to API response structure
 * Based on DesignLabEndpoints.md API responses
 */

export class Project {
    constructor(data = {}) {
        // Required fields from API response
        this.id = data.id || null;
        this.title = data.title || '';
        this.userId = data.userId || '';
        this.previewUrl = data.previewUrl || '';
        this.status = data.status || '';
        this.color = data.color || '';       // Maps to garmentColor in requests
        this.size = data.size || '';         // Maps to garmentSize in requests
        this.gender = data.gender || '';     // Maps to garmentGender in requests
        this.layers = data.layers ? data.layers.map(layer => new Layer(layer)) : [];
        this.createdAt = data.createdAt || '';
        this.updatedAt = data.updatedAt || '';
    }

    /**
     * Convert to create project request format
     */
    toCreateRequest() {
        return {
            title: this.title,
            userId: this.userId,
            garmentColor: this.color,
            garmentSize: this.size,
            garmentGender: this.gender
        };
    }

    /**
     * Convert to update project details request format
     */
    toUpdateDetailsRequest() {
        return {
            previewUrl: this.previewUrl,
            status: this.status,
            garmentColor: this.color,
            garmentSize: this.size,
            garmentGender: this.gender
        };
    }

    /**
     * Add a layer to the project
     */
    addLayer(layer) {
        this.layers.push(layer);
    }

    /**
     * Remove a layer from the project
     */
    removeLayer(layerId) {
        this.layers = this.layers.filter(layer => layer.id !== layerId);
    }

    /**
     * Get layer by ID
     */
    getLayer(layerId) {
        return this.layers.find(layer => layer.id === layerId);
    }

    /**
     * Get layers sorted by z-index
     */
    getLayersSortedByZ() {
        return [...this.layers].sort((a, b) => a.z - b.z);
    }
}

/**
 * Layer Entity - Maps to API layer structure
 */
export class Layer {
    constructor(data = {}) {
        this.id = data.id || null;
        this.x = data.x || 0;
        this.y = data.y || 0;
        this.z = data.z || 0;
        this.opacity = data.opacity || 1;
        this.isVisible = data.isVisible !== false; // Default to true
        this.type = data.type || '';
        this.createdAt = data.createdAt || '';
        this.updatedAt = data.updatedAt || '';
        this.details = data.details || {};
    }

    /**
     * Update layer coordinates
     */
    updateCoordinates(x, y, z = null) {
        this.x = x;
        this.y = y;
        if (z !== null) {
            this.z = z;
        }
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Update layer opacity
     */
    updateOpacity(opacity) {
        this.opacity = Math.max(0, Math.min(1, opacity)); // Clamp between 0 and 1
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Toggle layer visibility
     */
    toggleVisibility() {
        this.isVisible = !this.isVisible;
        this.updatedAt = new Date().toISOString();
    }
}

/**
 * Text Layer Entity - Extends Layer for text-specific functionality
 */
export class TextLayer extends Layer {
    constructor(data = {}) {
        super(data);
        this.type = 'TEXT';
        
        // Text-specific details
        this.details = {
            text: data.text || data.details?.text || '',
            fontColor: data.fontColor || data.details?.fontColor || '#000000',
            fontFamily: data.fontFamily || data.details?.fontFamily || 'Arial',
            fontSize: data.fontSize || data.details?.fontSize || 24,
            isBold: data.isBold || data.details?.isBold || false,
            isItalic: data.isItalic || data.details?.isItalic || false,
            isUnderlined: data.isUnderlined || data.details?.isUnderlined || false
        };
    }

    /**
     * Convert to create text layer request
     */
    toCreateRequest() {
        return {
            text: this.details.text,
            fontColor: this.details.fontColor,
            fontFamily: this.details.fontFamily,
            fontSize: this.details.fontSize,
            isBold: this.details.isBold,
            isItalic: this.details.isItalic,
            isUnderlined: this.details.isUnderlined
        };
    }

    /**
     * Convert to update text details request
     */
    toUpdateDetailsRequest() {
        return {
            text: this.details.text,
            fontColor: this.details.fontColor,
            fontFamily: this.details.fontFamily,
            fontSize: this.details.fontSize,
            isBold: this.details.isBold,
            isItalic: this.details.isItalic,
            isUnderlined: this.details.isUnderlined
        };
    }

    /**
     * Update text content
     */
    updateText(text) {
        this.details.text = text;
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Update font properties
     */
    updateFont(fontFamily, fontSize, fontColor) {
        if (fontFamily) this.details.fontFamily = fontFamily;
        if (fontSize) this.details.fontSize = fontSize;
        if (fontColor) this.details.fontColor = fontColor;
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Update text styles
     */
    updateStyles(isBold, isItalic, isUnderlined) {
        if (isBold !== undefined) this.details.isBold = isBold;
        if (isItalic !== undefined) this.details.isItalic = isItalic;
        if (isUnderlined !== undefined) this.details.isUnderlined = isUnderlined;
        this.updatedAt = new Date().toISOString();
    }
}

/**
 * Image Layer Entity - Extends Layer for image-specific functionality
 */
export class ImageLayer extends Layer {
    constructor(data = {}) {
        super(data);
        this.type = 'IMAGE';
        
        // Image-specific details
        this.details = {
            imageUrl: data.imageUrl || data.details?.imageUrl || '',
            width: data.width || data.details?.width || '100',
            height: data.height || data.details?.height || '100'
        };
    }

    /**
     * Convert to create image layer request
     */
    toCreateRequest() {
        return {
            imageUrl: this.details.imageUrl,
            width: this.details.width,
            height: this.details.height
        };
    }

    /**
     * Convert to update image details request
     */
    toUpdateDetailsRequest() {
        return {
            imageUrl: this.details.imageUrl,
            width: this.details.width,
            height: this.details.height
        };
    }

    /**
     * Update image URL
     */
    updateImageUrl(imageUrl) {
        this.details.imageUrl = imageUrl;
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Update image dimensions
     */
    updateDimensions(width, height) {
        this.details.width = width.toString();
        this.details.height = height.toString();
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Scale image proportionally
     */
    scaleProportionally(newWidth) {
        const currentWidth = parseInt(this.details.width);
        const currentHeight = parseInt(this.details.height);
        const aspectRatio = currentHeight / currentWidth;
        
        this.details.width = newWidth.toString();
        this.details.height = Math.round(newWidth * aspectRatio).toString();
        this.updatedAt = new Date().toISOString();
    }
}

/**
 * API Error Entity - For consistent error handling
 */
export class ApiError {
    constructor(data = {}) {
        this.message = data.message || 'An error occurred';
        this.error = data.error || 'UNKNOWN_ERROR';
        this.status = data.status || 0;
        this.timestamp = data.timestamp || new Date().toISOString();
    }

    /**
     * Check if error is authentication related
     */
    isAuthError() {
        return this.status === 401 || this.status === 403;
    }

    /**
     * Check if error is validation related
     */
    isValidationError() {
        return this.status === 400;
    }

    /**
     * Check if error is not found
     */
    isNotFoundError() {
        return this.status === 404;
    }

    /**
     * Check if error is server error
     */
    isServerError() {
        return this.status >= 500;
    }
}
