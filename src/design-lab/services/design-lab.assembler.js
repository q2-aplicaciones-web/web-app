/**
 * Design Lab Data Assembler
 * Handles data transformation between API responses and frontend entities
 */

import { Project, Layer, TextLayer, ImageLayer, ApiError } from '../model/project.entity.js';

export class DesignLabAssembler {
    
    // ==================== PROJECT ASSEMBLERS ====================

    /**
     * Transform API project response to Project entity
     * @param {Object} apiResponse - Raw API response
     * @returns {Project} Project entity
     */
    static toProjectEntity(apiResponse) {
        if (!apiResponse) return null;

        return new Project({
            id: apiResponse.id,
            title: apiResponse.title,
            userId: apiResponse.userId,
            previewUrl: apiResponse.previewUrl,
            status: apiResponse.status,
            color: apiResponse.color,
            size: apiResponse.size,
            gender: apiResponse.gender,
            layers: apiResponse.layers ? apiResponse.layers.map(layer => this.toLayerEntity(layer)) : [],
            createdAt: apiResponse.createdAt,
            updatedAt: apiResponse.updatedAt
        });
    }

    /**
     * Transform array of API project responses to Project entities
     * @param {Array} apiResponseArray - Array of API responses
     * @returns {Array<Project>} Array of Project entities
     */
    static toProjectEntitiesArray(apiResponseArray) {
        if (!Array.isArray(apiResponseArray)) return [];
        return apiResponseArray.map(apiResponse => this.toProjectEntity(apiResponse));
    }

    /**
     * Transform Project entity to create project request
     * @param {Project} project - Project entity
     * @returns {Object} API request object
     */
    static toCreateProjectRequest(project) {
        return {
            title: project.title,
            userId: project.userId,
            garmentColor: project.color,
            garmentSize: project.size,
            garmentGender: project.gender
        };
    }

    /**
     * Transform project data to update details request
     * @param {Object} updateData - Update data
     * @returns {Object} API request object
     */
    static toUpdateProjectDetailsRequest(updateData) {
        const request = {};
        
        if (updateData.previewUrl !== undefined) request.previewUrl = updateData.previewUrl;
        if (updateData.status !== undefined) request.status = updateData.status;
        if (updateData.color !== undefined) request.garmentColor = updateData.color;
        if (updateData.size !== undefined) request.garmentSize = updateData.size;
        if (updateData.gender !== undefined) request.garmentGender = updateData.gender;
        
        return request;
    }

    // ==================== LAYER ASSEMBLERS ====================

    /**
     * Transform API layer response to Layer entity
     * @param {Object} apiResponse - Raw API layer response
     * @returns {Layer} Layer entity (TextLayer or ImageLayer)
     */
    static toLayerEntity(apiResponse) {
        if (!apiResponse) return null;

        const baseData = {
            id: apiResponse.id,
            x: apiResponse.x || 0,
            y: apiResponse.y || 0,
            z: apiResponse.z || 0,
            opacity: apiResponse.opacity !== undefined ? apiResponse.opacity : 1,
            isVisible: apiResponse.isVisible !== false,
            type: apiResponse.type,
            createdAt: apiResponse.createdAt,
            updatedAt: apiResponse.updatedAt,
            details: apiResponse.details || {}
        };

        // Create specific layer type based on type field
        switch (apiResponse.type?.toUpperCase()) {
            case 'TEXT':
                return new TextLayer({
                    ...baseData,
                    text: apiResponse.details?.text || '',
                    fontColor: apiResponse.details?.fontColor || '#000000',
                    fontFamily: apiResponse.details?.fontFamily || 'Arial',
                    fontSize: apiResponse.details?.fontSize || 24,
                    isBold: apiResponse.details?.isBold || false,
                    isItalic: apiResponse.details?.isItalic || false,
                    isUnderlined: apiResponse.details?.isUnderlined || false
                });

            case 'IMAGE':
                return new ImageLayer({
                    ...baseData,
                    imageUrl: apiResponse.details?.imageUrl || '',
                    width: apiResponse.details?.width || '100',
                    height: apiResponse.details?.height || '100'
                });

            default:
                console.warn(`Unknown layer type: ${apiResponse.type}`);
                return new Layer(baseData);
        }
    }

    /**
     * Transform TextLayer entity to create text layer request
     * @param {TextLayer} textLayer - TextLayer entity
     * @returns {Object} API request object
     */
    static toCreateTextLayerRequest(textLayer) {
        return {
            text: textLayer.details.text,
            fontColor: textLayer.details.fontColor,
            fontFamily: textLayer.details.fontFamily,
            fontSize: textLayer.details.fontSize,
            isBold: textLayer.details.isBold,
            isItalic: textLayer.details.isItalic,
            isUnderlined: textLayer.details.isUnderlined
        };
    }

    /**
     * Transform ImageLayer entity to create image layer request
     * @param {ImageLayer} imageLayer - ImageLayer entity
     * @returns {Object} API request object
     */
    static toCreateImageLayerRequest(imageLayer) {
        return {
            imageUrl: imageLayer.details.imageUrl,
            width: imageLayer.details.width,
            height: imageLayer.details.height
        };
    }

    // ==================== ERROR ASSEMBLERS ====================

    /**
     * Transform API error response to ApiError entity
     * @param {Object} errorResponse - API error response
     * @returns {ApiError} ApiError entity
     */
    static toApiErrorEntity(errorResponse) {
        return new ApiError({
            message: errorResponse.message || 'An error occurred',
            error: errorResponse.error || 'UNKNOWN_ERROR',
            status: errorResponse.status || 0,
            timestamp: errorResponse.timestamp || new Date().toISOString()
        });
    }

    // ==================== VALIDATION HELPERS ====================

    /**
     * Validate project data before sending to API
     * @param {Object} projectData - Project data to validate
     * @throws {Error} If validation fails
     */
    static validateCreateProjectData(projectData) {
        const required = ['title', 'userId', 'garmentColor', 'garmentSize', 'garmentGender'];
        const missing = required.filter(field => !projectData[field]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }

        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidPattern.test(projectData.userId)) {
            throw new Error('Invalid userId format (must be UUID)');
        }
    }

    /**
     * Validate text layer data before sending to API
     * @param {Object} textData - Text layer data to validate
     * @throws {Error} If validation fails
     */
    static validateCreateTextLayerData(textData) {
        if (!textData.text || textData.text.trim() === '') {
            throw new Error('Text content is required');
        }

        if (textData.fontSize && (textData.fontSize < 1 || textData.fontSize > 200)) {
            throw new Error('Font size must be between 1 and 200');
        }

        if (textData.fontColor && !/^#[0-9A-Fa-f]{6}$/.test(textData.fontColor)) {
            throw new Error('Font color must be a valid hex color (e.g., #000000)');
        }
    }

    /**
     * Validate image layer data before sending to API
     * @param {Object} imageData - Image layer data to validate
     * @throws {Error} If validation fails
     */
    static validateCreateImageLayerData(imageData) {
        if (!imageData.imageUrl || !imageData.imageUrl.trim()) {
            throw new Error('Image URL is required');
        }

        try {
            new URL(imageData.imageUrl);
        } catch {
            throw new Error('Invalid image URL format');
        }

        const width = parseInt(imageData.width);
        const height = parseInt(imageData.height);

        if (isNaN(width) || width < 1 || width > 2000) {
            throw new Error('Width must be a number between 1 and 2000');
        }

        if (isNaN(height) || height < 1 || height > 2000) {
            throw new Error('Height must be a number between 1 and 2000');
        }
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Sanitize string for safe display
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string
     */
    static sanitizeString(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/[<>]/g, '').trim();
    }

    /**
     * Format timestamp for display
     * @param {string} timestamp - ISO timestamp string
     * @returns {string} Formatted date string
     */
    static formatTimestamp(timestamp) {
        if (!timestamp) return '';
        try {
            return new Date(timestamp).toLocaleString();
        } catch {
            return timestamp;
        }
    }

    /**
     * Generate layer display name
     * @param {Layer} layer - Layer entity
     * @returns {string} Display name
     */
    static generateLayerDisplayName(layer) {
        if (!layer) return 'Unknown Layer';

        switch (layer.type?.toUpperCase()) {
            case 'TEXT':
                const text = layer.details?.text || '';
                return text.length > 20 ? `Text: ${text.substring(0, 20)}...` : `Text: ${text}`;
            
            case 'IMAGE':
                return 'Image Layer';
            
            default:
                return `${layer.type || 'Unknown'} Layer`;
        }
    }
}

export default DesignLabAssembler;
