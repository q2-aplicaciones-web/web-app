/**
 * Design Lab Service - High-level service that combines API calls with data transformation
 * This service provides a clean interface for components to interact with the Design Lab API
 */

import designLabApiService from './design-lab-api.service.js';
import cloudinaryService from './cloudinary.service.js';
import DesignLabAssembler from './design-lab.assembler.js';
import { Project, TextLayer, ImageLayer } from '../model/project.entity.js';

export class DesignLabService {
    
    // ==================== PROJECT OPERATIONS ====================

    /**
     * Get all projects for a user
     * @param {string} userId - User UUID
     * @returns {Promise<Array<Project>>} Array of Project entities
     */
    async getUserProjects(userId) {
        try {
            const apiResponse = await designLabApiService.getProjectsByUser(userId);
            return DesignLabAssembler.toProjectEntitiesArray(apiResponse);
        } catch (error) {
            console.error('Error getting user projects:', error);
            throw DesignLabAssembler.toApiErrorEntity(error);
        }
    }

    /**
     * Get a specific project by ID
     * @param {string} projectId - Project UUID
     * @returns {Promise<Project>} Project entity
     */
    async getProject(projectId) {
        try {
            const apiResponse = await designLabApiService.getProjectById(projectId);
            return DesignLabAssembler.toProjectEntity(apiResponse);
        } catch (error) {
            console.error('Error getting project:', error);
            throw DesignLabAssembler.toApiErrorEntity(error);
        }
    }

    /**
     * Create a new project
     * @param {Object} projectData - Project creation data
     * @param {string} projectData.title - Project title
     * @param {string} projectData.userId - User UUID
     * @param {string} projectData.garmentColor - Garment color
     * @param {string} projectData.garmentSize - Garment size
     * @param {string} projectData.garmentGender - Garment gender
     * @returns {Promise<Project>} Created Project entity
     */
    async createProject(projectData) {
        try {
            // Create project entity for validation
            const project = new Project({
                title: projectData.title,
                userId: projectData.userId,
                color: projectData.garmentColor,      // Map garmentColor to internal color field
                size: projectData.garmentSize,        // Map garmentSize to internal size field
                gender: projectData.garmentGender     // Map garmentGender to internal gender field
            });

            // Validate and transform to API request
            const requestData = DesignLabAssembler.toCreateProjectRequest(project);
            DesignLabAssembler.validateCreateProjectData(requestData);

            // Call API
            const apiResponse = await designLabApiService.createProject(requestData);
            return DesignLabAssembler.toProjectEntity(apiResponse);
        } catch (error) {
            console.error('Error creating project:', error);
            throw DesignLabAssembler.toApiErrorEntity(error);
        }
    }

    /**
     * Update project details
     * @param {string} projectId - Project UUID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Update confirmation
     */
    async updateProjectDetails(projectId, updateData) {
        try {
            const requestData = DesignLabAssembler.toUpdateProjectDetailsRequest(updateData);
            return await designLabApiService.updateProjectDetails(projectId, requestData);
        } catch (error) {
            console.error('Error updating project details:', error);
            throw DesignLabAssembler.toApiErrorEntity(error);
        }
    }

    /**
     * Delete a project and associated product if it exists
     * @param {string} projectId - Project UUID
     * @returns {Promise<Object>} Deletion confirmation
     */
    async deleteProject(projectId) {
        try {
            console.log(`Starting deletion process for project: ${projectId}`);
            
            // First get the project to check if it has been published as a product
            const project = await this.getProject(projectId);
            console.log(`Project status: ${project.status}`);
            
            // If project status is 'Garment', it means it has been published as a product
            // We need to delete the associated product first
            if (project.status === 'Garment') {
                console.log('Project has been published as a product. Deleting associated product(s)...');
                try {
                    // Import the product catalog service dynamically to avoid circular dependencies
                    const { default: productCatalogService } = await import('../../productCatalog/application/productCatalogService.js');
                    
                    // Get all products to find the one associated with this project
                    console.log(`Searching for products associated with project: ${projectId}`);
                    const products = await productCatalogService.getAllProducts(projectId);
                    console.log(`Found ${products.length} product(s) associated with this project`);
                    
                    // Delete each product associated with this project
                    for (const product of products) {
                        if (product.projectId === projectId) {
                            console.log(`Deleting product ${product.id} associated with project ${projectId}`);
                            await productCatalogService.deleteProduct(product.id);
                            console.log(`Successfully deleted product ${product.id}`);
                        }
                    }
                } catch (productDeleteError) {
                    console.warn('Failed to delete associated product:', productDeleteError);
                    // Continue with project deletion even if product deletion fails
                    // This prevents orphaned projects if product service is unavailable
                }
            }
            
            // Delete the project
            console.log(`Deleting project: ${projectId}`);
            const result = await designLabApiService.deleteProject(projectId);
            console.log(`Successfully deleted project: ${projectId}`);
            return result;
        } catch (error) {
            console.error('Error deleting project:', error);
            throw DesignLabAssembler.toApiErrorEntity(error);
        }
    }

    // ==================== TEXT LAYER OPERATIONS ====================

    /**
     * Create a text layer
     * @param {string} projectId - Project UUID
     * @param {Object} textData - Text layer data
     * @returns {Promise<TextLayer>} Created TextLayer entity
     */
    async createTextLayer(projectId, textData) {
        try {
            // Validate text data
            DesignLabAssembler.validateCreateTextLayerData(textData);

            // Call API
            const apiResponse = await designLabApiService.createTextLayer(projectId, textData);
            return DesignLabAssembler.toLayerEntity(apiResponse);
        } catch (error) {
            console.error('Error creating text layer:', error);
            throw DesignLabAssembler.toApiErrorEntity(error);
        }
    }

    /**
     * Update text layer details
     * @param {string} projectId - Project UUID
     * @param {string} layerId - Layer UUID
     * @param {Object} textDetails - Text details to update
     * @returns {Promise<TextLayer>} Updated TextLayer entity
     */
    async updateTextLayerDetails(projectId, layerId, textDetails) {
        try {
            // Validate text data
            DesignLabAssembler.validateCreateTextLayerData(textDetails);

            // Call API
            const apiResponse = await designLabApiService.updateTextLayerDetails(projectId, layerId, textDetails);
            return DesignLabAssembler.toLayerEntity(apiResponse);
        } catch (error) {
            console.error('Error updating text layer details:', error);
            throw DesignLabAssembler.toApiErrorEntity(error);
        }
    }

    // ==================== IMAGE LAYER OPERATIONS ====================

    /**
     * Create an image layer from uploaded file
     * @param {string} projectId - Project UUID
     * @param {File} imageFile - Image file to upload
     * @param {Object} options - Upload options
     * @returns {Promise<ImageLayer>} Created ImageLayer entity
     */
    async createImageLayerFromFile(projectId, imageFile, options = {}) {
        try {
            // Validate image file
            cloudinaryService.validateImageFile(imageFile);

            // Upload image to Cloudinary and get optimized data
            const imageData = await cloudinaryService.processImageForLayer(imageFile, options);

            // Validate image data
            DesignLabAssembler.validateCreateImageLayerData(imageData);

            // Create image layer via API
            const apiResponse = await designLabApiService.createImageLayer(projectId, {
                imageUrl: imageData.imageUrl,
                width: imageData.width,
                height: imageData.height
            });

            const layer = DesignLabAssembler.toLayerEntity(apiResponse);
            
            // Set calculated position
            layer.x = imageData.x;
            layer.y = imageData.y;

            return layer;
        } catch (error) {
            console.error('Error creating image layer from file:', error);
            throw DesignLabAssembler.toApiErrorEntity(error);
        }
    }

    /**
     * Create an image layer from URL
     * @param {string} projectId - Project UUID
     * @param {Object} imageData - Image data
     * @returns {Promise<ImageLayer>} Created ImageLayer entity
     */
    async createImageLayer(projectId, imageData) {
        try {
            // Validate image data
            DesignLabAssembler.validateCreateImageLayerData(imageData);

            // Call API
            const apiResponse = await designLabApiService.createImageLayer(projectId, imageData);
            return DesignLabAssembler.toLayerEntity(apiResponse);
        } catch (error) {
            console.error('Error creating image layer:', error);
            throw DesignLabAssembler.toApiErrorEntity(error);
        }
    }

    /**
     * Update image layer details
     * @param {string} projectId - Project UUID
     * @param {string} layerId - Layer UUID
     * @param {Object} imageDetails - Image details to update
     * @returns {Promise<ImageLayer>} Updated ImageLayer entity
     */
    async updateImageLayerDetails(projectId, layerId, imageDetails) {
        try {
            // Validate image data
            DesignLabAssembler.validateCreateImageLayerData(imageDetails);

            // Call API
            const apiResponse = await designLabApiService.updateImageLayerDetails(projectId, layerId, imageDetails);
            return DesignLabAssembler.toLayerEntity(apiResponse);
        } catch (error) {
            console.error('Error updating image layer details:', error);
            throw DesignLabAssembler.toApiErrorEntity(error);
        }
    }

    // ==================== GENERAL LAYER OPERATIONS ====================

    /**
     * Delete a layer
     * @param {string} projectId - Project UUID
     * @param {string} layerId - Layer UUID
     * @returns {Promise<Object>} Deletion confirmation
     */
    async deleteLayer(projectId, layerId) {
        try {
            return await designLabApiService.deleteLayer(projectId, layerId);
        } catch (error) {
            console.error('Error deleting layer:', error);
            throw DesignLabAssembler.toApiErrorEntity(error);
        }
    }

    /**
     * Update layer coordinates (x, y, z)
     * @param {string} projectId - Project UUID
     * @param {string} layerId - Layer UUID
     * @param {Object} coords - Coordinates { x, y, z }
     * @returns {Promise<Object>} Updated layer
     */
    async updateLayerCoordinates(projectId, layerId, coords) {
        try {
            // Only send x, y, z as numbers
            // Some backends require integer coordinates
            const payload = {
                x: Math.round(Number(coords.x)),
                y: Math.round(Number(coords.y)),
                z: Math.round(Number(coords.z))
            };
            const apiResponse = await designLabApiService.updateLayerCoordinates(projectId, layerId, payload);
            return DesignLabAssembler.toLayerEntity(apiResponse);
        } catch (error) {
            console.error('Error updating layer coordinates:', error);
            throw DesignLabAssembler.toApiErrorEntity(error);
        }
    }

    // ==================== GARMENT COLOR OPERATIONS ====================

    /**
     * Get all available garment colors
     * @returns {Array} Array of garment color objects
     */
    getGarmentColors() {
        return cloudinaryService.getGarmentColors();
    }

    /**
     * Get garment color style for CSS
     * @param {string} colorValue - Color hex value
     * @param {number} size - Sprite segment size
     * @returns {Object} CSS style object
     */
    getGarmentColorStyle(colorValue, size = 600) {
        return cloudinaryService.getGarmentColorStyle(colorValue, size);
    }

    /**
     * Get responsive garment color styles
     * @param {string} colorValue - Color hex value
     * @returns {Object} Responsive styles object
     */
    getResponsiveGarmentColorStyles(colorValue) {
        return cloudinaryService.getResponsiveGarmentColorStyles(colorValue);
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Generate layer display name
     * @param {Layer} layer - Layer entity
     * @returns {string} Display name
     */
    generateLayerDisplayName(layer) {
        return DesignLabAssembler.generateLayerDisplayName(layer);
    }

    /**
     * Format timestamp for display
     * @param {string} timestamp - ISO timestamp
     * @returns {string} Formatted timestamp
     */
    formatTimestamp(timestamp) {
        return DesignLabAssembler.formatTimestamp(timestamp);
    }
}

// Export singleton instance
export const designLabService = new DesignLabService();
export default designLabService;
