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
