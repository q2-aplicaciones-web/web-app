import axios from 'axios';
import env from '../../env';

/**
 * Design Lab API Service - Maps directly to API endpoints
 * Based on DesignLabEndpoints.md specification
 */
class DesignLabApiService {
    constructor() {
        // Use environment variables directly - no design lab path needed
        this.baseURL = env.apiBaseUrl
        this.axiosInstance = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Add request interceptor for authentication
        this.axiosInstance.interceptors.request.use(
            (config) => {
                // Only declare 'token' once in this scope
                const token = this.getAuthToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Add response interceptor for error handling
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            (error) => {
                console.error('API Error:', error.response?.data || error.message);
                return Promise.reject(this.handleError(error));
            }
        );
    }

    /**
     * Get authentication token from localStorage
     */
    getAuthToken() {
        // First try 'token' (used by authentication service), then fallback to 'authToken'
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        
        if (!token) {
            return null;
        }
        
        return token;
    }

    /**
     * Handle API errors consistently
     */
    handleError(error) {
        if (error.response) {
            const { status, data } = error.response;
            
            // Special handling for authentication errors
            if (status === 401) {
                console.error('🔒 Authentication Error - Token invalid or expired');
                // Clear invalid token
                localStorage.removeItem('token');
                localStorage.removeItem('authToken');
            } else if (status === 403) {
                console.error('🚫 Authorization Error - User lacks permission');
            }
            
            console.error(`❌ API Error [${status}]:`, {
                url: error.config?.url,
                method: error.config?.method?.toUpperCase(),
                status,
                message: data.message || 'An error occurred',
                data
            });
            
            return {
                status,
                message: data.message || 'An error occurred',
                error: data.error || 'Unknown error',
                timestamp: data.timestamp || new Date().toISOString()
            };
        }
        
        console.error('🌐 Network Error:', error.message);
        return {
            status: 0,
            message: error.message || 'Network error',
            error: 'NETWORK_ERROR',
            timestamp: new Date().toISOString()
        };
    }

    // ==================== PROJECT ENDPOINTS ====================

    /**
     * GET /api/v1/projects
     * Get Projects by User
     * 
     * @param {string} userId - UUID of the user
     * @returns {Promise<Array>} Array of projects
     */
    async getProjectsByUser(userId) {
        try {
            const response = await this.axiosInstance.get('/api/v1/projects', {
                params: { userId }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * POST /api/v1/projects
     * Create Project
     * 
     * @param {Object} projectData - Project creation data
     * @param {string} projectData.title - Project title
     * @param {string} projectData.userId - User UUID
     * @param {string} projectData.garmentColor - Garment color
     * @param {string} projectData.garmentSize - Garment size
     * @param {string} projectData.garmentGender - Garment gender
     * @returns {Promise<Object>} Created project
     */
    async createProject(projectData) {
        try {
            const response = await this.axiosInstance.post('/api/v1/projects', projectData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * GET /api/v1/projects/{projectId}
     * Get Project by ID
     * 
     * @param {string} projectId - Project UUID
     * @returns {Promise<Object>} Project details
     */
    async getProjectById(projectId) {
        try {
            const response = await this.axiosInstance.get(`/api/v1/projects/${projectId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * DELETE /api/v1/projects/{projectId}
     * Delete Project
     * 
     * @param {string} projectId - Project UUID
     * @returns {Promise<Object>} Deletion confirmation
     */
    async deleteProject(projectId) {
        try {
            const response = await this.axiosInstance.delete(`/api/v1/projects/${projectId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * PUT /api/v1/projects/{projectId}/details
     * Update Product Details
     * 
     * @param {string} projectId - Project UUID
     * @param {Object} details - Project details to update
     * @param {string} [details.previewUrl] - Preview URL
     * @param {string} [details.status] - Project status
     * @param {string} [details.garmentColor] - Garment color
     * @param {string} [details.garmentSize] - Garment size
     * @param {string} [details.garmentGender] - Garment gender
     * @returns {Promise<Object>} Update confirmation
     */
    async updateProjectDetails(projectId, details) {
        try {
            const response = await this.axiosInstance.put(`/api/v1/projects/${projectId}/details`, details);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // ==================== LAYER ENDPOINTS ====================

    /**
     * POST /api/v1/projects/{projectId}/texts
     * Create Text Layer
     * 
     * @param {string} projectId - Project UUID
     * @param {Object} textData - Text layer data
     * @param {string} textData.text - Text content
     * @param {string} textData.fontColor - Font color
     * @param {string} textData.fontFamily - Font family
     * @param {number} textData.fontSize - Font size
     * @param {boolean} textData.isBold - Is bold
     * @param {boolean} textData.isItalic - Is italic
     * @param {boolean} textData.isUnderlined - Is underlined
     * @returns {Promise<Object>} Created text layer
     */
    async createTextLayer(projectId, textData) {
        try {
            const response = await this.axiosInstance.post(`/api/v1/projects/${projectId}/texts`, textData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * POST /api/v1/projects/{projectId}/images
     * Create Image Layer
     * 
     * @param {string} projectId - Project UUID
     * @param {Object} imageData - Image layer data
     * @param {string} imageData.imageUrl - Image URL
     * @param {string} imageData.width - Image width
     * @param {string} imageData.height - Image height
     * @returns {Promise<Object>} Created image layer
     */
    async createImageLayer(projectId, imageData) {
        try {
            const response = await this.axiosInstance.post(`/api/v1/projects/${projectId}/images`, imageData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * DELETE /api/v1/projects/{projectId}/layers/{layerId}
     * Delete Layer
     * 
     * @param {string} projectId - Project UUID
     * @param {string} layerId - Layer UUID
     * @returns {Promise<Object>} Deletion confirmation
     */
    async deleteLayer(projectId, layerId) {
        try {
            const response = await this.axiosInstance.delete(`/api/v1/projects/${projectId}/layers/${layerId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * PUT /api/v1/projects/{projectId}/layers/{layerId}/text-details
     * Update Text Layer Details
     * 
     * @param {string} projectId - Project UUID
     * @param {string} layerId - Layer UUID
     * @param {Object} textDetails - Text layer details
     * @param {string} textDetails.text - Text content
     * @param {string} textDetails.fontColor - Font color
     * @param {string} textDetails.fontFamily - Font family
     * @param {number} textDetails.fontSize - Font size
     * @param {boolean} textDetails.isBold - Is bold
     * @param {boolean} textDetails.isItalic - Is italic
     * @param {boolean} textDetails.isUnderlined - Is underlined
     * @returns {Promise<Object>} Updated layer
     */
    async updateTextLayerDetails(projectId, layerId, textDetails) {
        try {
            const response = await this.axiosInstance.put(
                `/api/v1/projects/${projectId}/layers/${layerId}/text-details`, 
                textDetails
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * PUT /api/v1/projects/{projectId}/layers/{layerId}/image-details
     * Update Image Layer Details
     * 
     * @param {string} projectId - Project UUID
     * @param {string} layerId - Layer UUID
     * @param {Object} imageDetails - Image layer details
     * @param {string} imageDetails.imageUrl - Image URL
     * @param {string} imageDetails.width - Image width
     * @param {string} imageDetails.height - Image height
     * @returns {Promise<Object>} Updated layer
     */
    async updateImageLayerDetails(projectId, layerId, imageDetails) {
        try {
            const response = await this.axiosInstance.put(
                `/api/v1/projects/${projectId}/layers/${layerId}/image-details`, 
                imageDetails
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * PUT /api/v1/projects/{projectId}/layers/{layerId}/coordinates
     * Update Layer Coordinates
     *
     * @param {string} projectId - Project UUID
     * @param {string} layerId - Layer UUID
     * @param {Object} coords - Coordinates { x, y, z }
     * @returns {Promise<Object>} Updated layer
     */
    async updateLayerCoordinates(projectId, layerId, coords) {
        try {
            const response = await this.axiosInstance.put(
                `/api/v1/projects/${projectId}/layers/${layerId}/coordinates`,
                coords
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

}

// Export singleton instance
export const designLabApiService = new DesignLabApiService();
export default designLabApiService;
