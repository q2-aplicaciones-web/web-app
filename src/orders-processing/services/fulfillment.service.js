// Fulfillment Service - Handles fulfillment-related API calls
// Endpoints documented in /docs/api-endpoints.md

const API_BASE_URL = '/api/v1';

class FulfillmentService {
  /**
   * Create fulfillment when manufacturer is selected
   * Endpoint: POST /api/v1/fulfillments
   * Used for: When user selects manufacturer in cart
   */
  async createFulfillment(fulfillmentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/fulfillments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fulfillmentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create fulfillment');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating fulfillment:', error);
      throw error;
    }
  }

  /**
   * Get fulfillments (for manufacturer dashboard)
   * Endpoint: GET /api/v1/fulfillments
   * Used for: Manufacturer orders dashboard
   */
  async getAllFulfillments(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const url = `${API_BASE_URL}/fulfillments${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch fulfillments');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching fulfillments:', error);
      throw error;
    }
  }

  /**
   * Get items for a specific fulfillment
   * Endpoint: GET /api/v1/fulfillment-items/{fulfillmentId}
   * Used for: Fulfillment detail view
   */
  async getFulfillmentItems(fulfillmentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/fulfillment-items/${fulfillmentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch fulfillment items');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching fulfillment items:', error);
      throw error;
    }
  }
}

// Legacy composable for backward compatibility
import { FulfillmentAssembler } from './fulfillment.assembler.js';
import { env } from '../../env.js';

export function useFulfillmentService() {
  const API_BASE_URL = env.apiBaseUrl || 'http://localhost:3000';

  async function getAllFulfillments() {
    const res = await fetch(`${API_BASE_URL}/fulfillments`);
    const data = await res.json();
    return data.map(FulfillmentAssembler.toEntityFromResource);
  }

  async function getFulfillmentsByManufacturer(manufacturerId) {
    const res = await fetch(`${API_BASE_URL}/fulfillments?manufacturer_id=${manufacturerId}`);
    const data = await res.json();
    return data.map(FulfillmentAssembler.toEntityFromResource);
  }

  return {
    getAllFulfillments,
    getFulfillmentsByManufacturer
  };
}

export default new FulfillmentService();