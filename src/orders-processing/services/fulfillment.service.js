// Fulfillment Service - Handles fulfillment-related API calls
// Endpoints documented in /docs/COMPREHENSIVE_ORDER_PROCESSING_GUIDE.md
//
// API ENDPOINTS USED:
// 
// 1. POST /api/v1/fulfillments
//    - Description: Create fulfillment when manufacturer is selected
//    - Headers: Authorization: Bearer {token}, Content-Type: application/json
//    - Body: { orderId, manufacturerId, items, priority, requestedDeliveryDate }
//    - Response: Created fulfillment object with id, status, totalAmount, estimatedCompletionDate
// 
// 2. GET /api/v1/fulfillments
//    - Description: Get fulfillments (for manufacturer dashboard)
//    - Query params: manufacturerId (optional), status (optional), orderId (optional)
//    - Headers: Authorization: Bearer {token}
//    - Response: Array of fulfillment objects
// 
// 3. GET /api/v1/fulfillment-items/{fulfillmentId}
//    - Description: Get items for a specific fulfillment
//    - Path params: fulfillmentId (required) - Fulfillment UUID
//    - Headers: Authorization: Bearer {token}
//    - Response: Array of fulfillment item objects
//
// 4. PATCH /api/v1/fulfillments/{fulfillmentId}
//    - Description: Update fulfillment status
//    - Path params: fulfillmentId (required) - Fulfillment UUID
//    - Headers: Authorization: Bearer {token}, Content-Type: application/json
//    - Body: { status, notes, estimatedCompletionDate }
//    - Response: Updated fulfillment object

const API_BASE_URL = '/api/v1';

class FulfillmentService {
  /**
   * Create fulfillment when manufacturer is selected
   * Endpoint: POST /api/v1/fulfillments
   * Used for: When user selects manufacturer in cart/checkout
   * 
   * Request Schema:
   * {
   *   orderId: "uuid-string",
   *   manufacturerId: "uuid-string", 
   *   items: [
   *     {
   *       productId: "uuid-string",
   *       quantity: 2,
   *       unitPrice: 25.99
   *     }
   *   ],
   *   priority: "normal",
   *   requestedDeliveryDate: "2025-07-13T00:00:00.000Z"
   * }
   * 
   * Response Schema:
   * {
   *   id: "uuid-string",
   *   orderId: "uuid-string",
   *   manufacturerId: "uuid-string",
   *   status: "pending",
   *   totalAmount: 51.98,
   *   estimatedCompletionDate: "2025-07-13T00:00:00.000Z",
   *   items: [...],
   *   createdAt: "2025-07-06T20:43:48.662Z",
   *   updatedAt: "2025-07-06T20:43:48.662Z"
   * }
   */
  async createFulfillment(fulfillmentData) {
    try {
      // Validate required fields
      const requiredFields = ['orderId', 'manufacturerId', 'items'];
      for (const field of requiredFields) {
        if (!fulfillmentData[field]) {
          throw new Error(`${field} is required for fulfillment creation`);
        }
      }

      // Validate items array
      if (!Array.isArray(fulfillmentData.items) || fulfillmentData.items.length === 0) {
        throw new Error('Items array is required and must not be empty');
      }

      // Set default values for optional fields
      const requestData = {
        ...fulfillmentData,
        priority: fulfillmentData.priority || 'normal',
        requestedDeliveryDate: fulfillmentData.requestedDeliveryDate || this.calculateDefaultDeliveryDate()
      };

      const response = await fetch(`${API_BASE_URL}/fulfillments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}: Failed to create fulfillment`);
      }

      const fulfillment = await response.json();
      
      // Enhance fulfillment data for UI compatibility
      return {
        ...fulfillment,
        statusDisplay: this.getStatusDisplay(fulfillment.status),
        estimatedDaysLeft: this.calculateDaysLeft(fulfillment.estimatedCompletionDate),
        priorityLevel: this.getPriorityLevel(fulfillment.priority || 'normal')
      };
    } catch (error) {
      console.error('Error creating fulfillment:', error);
      throw new Error(`Failed to create fulfillment: ${error.message}`);
    }
  }

  /**
   * Get fulfillments (for manufacturer dashboard)
   * Endpoint: GET /api/v1/fulfillments
   * Query Parameters: manufacturerId, status, orderId (all optional)
   * Used for: Manufacturer orders dashboard, order tracking
   */
  async getAllFulfillments(filters = {}) {
    try {
      const url = new URL(`${API_BASE_URL}/fulfillments`, window.location.origin);
      
      // Add filters as query parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, value);
        }
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}: Failed to fetch fulfillments`);
      }

      const fulfillments = await response.json();
      
      // Enhance fulfillment data for UI
      return fulfillments.map(fulfillment => ({
        ...fulfillment,
        statusDisplay: this.getStatusDisplay(fulfillment.status),
        estimatedDaysLeft: this.calculateDaysLeft(fulfillment.estimatedCompletionDate),
        priorityLevel: this.getPriorityLevel(fulfillment.priority || 'normal'),
        totalItemCount: fulfillment.items ? fulfillment.items.length : 0
      }));
    } catch (error) {
      console.error('Error fetching fulfillments:', error);
      throw new Error(`Failed to load fulfillments: ${error.message}`);
    }
  }

  /**
   * Get specific fulfillment details
   * Endpoint: GET /api/v1/fulfillments/{fulfillmentId}
   * Used for: Fulfillment detail view, order tracking
   */
  async getFulfillmentById(fulfillmentId) {
    if (!fulfillmentId) {
      throw new Error('Fulfillment ID is required');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/fulfillments/${fulfillmentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}: Failed to fetch fulfillment`);
      }

      const fulfillment = await response.json();
      
      // Enhance fulfillment data
      return {
        ...fulfillment,
        statusDisplay: this.getStatusDisplay(fulfillment.status),
        estimatedDaysLeft: this.calculateDaysLeft(fulfillment.estimatedCompletionDate),
        priorityLevel: this.getPriorityLevel(fulfillment.priority || 'normal'),
        totalItemCount: fulfillment.items ? fulfillment.items.length : 0
      };
    } catch (error) {
      console.error('Error fetching fulfillment:', error);
      throw new Error(`Failed to load fulfillment details: ${error.message}`);
    }
  }

  /**
   * Get items for a specific fulfillment
   * Endpoint: GET /api/v1/fulfillment-items/{fulfillmentId}
   * Used for: Fulfillment detail view, item-level tracking
   */
  async getFulfillmentItems(fulfillmentId) {
    if (!fulfillmentId) {
      throw new Error('Fulfillment ID is required');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/fulfillment-items/${fulfillmentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}: Failed to fetch fulfillment items`);
      }

      const items = await response.json();
      
      // Enhance items with status display
      return items.map(item => ({
        ...item,
        statusDisplay: this.getItemStatusDisplay(item.status)
      }));
    } catch (error) {
      console.error('Error fetching fulfillment items:', error);
      throw new Error(`Failed to load fulfillment items: ${error.message}`);
    }
  }

  /**
   * Update fulfillment status
   * Endpoint: PATCH /api/v1/fulfillments/{fulfillmentId}
   * Used for: Manufacturer status updates, order progress tracking
   */
  async updateFulfillment(fulfillmentId, updateData) {
    if (!fulfillmentId) {
      throw new Error('Fulfillment ID is required');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/fulfillments/${fulfillmentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}: Failed to update fulfillment`);
      }

      const fulfillment = await response.json();
      
      // Enhance updated fulfillment data
      return {
        ...fulfillment,
        statusDisplay: this.getStatusDisplay(fulfillment.status),
        estimatedDaysLeft: this.calculateDaysLeft(fulfillment.estimatedCompletionDate),
        priorityLevel: this.getPriorityLevel(fulfillment.priority || 'normal')
      };
    } catch (error) {
      console.error('Error updating fulfillment:', error);
      throw new Error(`Failed to update fulfillment: ${error.message}`);
    }
  }

  /**
   * Mark fulfillment item as shipped
   * Endpoint: POST /api/v1/fulfillment-items/{fulfillmentItemId}/ship
   * Used for: Item-level shipping updates
   */
  async shipFulfillmentItem(fulfillmentItemId, shippingData = {}) {
    if (!fulfillmentItemId) {
      throw new Error('Fulfillment item ID is required');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/fulfillment-items/${fulfillmentItemId}/ship`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shippingData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}: Failed to ship fulfillment item`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error shipping fulfillment item:', error);
      throw new Error(`Failed to ship fulfillment item: ${error.message}`);
    }
  }

  /**
   * Get fulfillments by manufacturer (for manufacturer dashboard)
   * Convenience method that calls getAllFulfillments with manufacturerId filter
   */
  async getFulfillmentsByManufacturer(manufacturerId) {
    if (!manufacturerId) {
      throw new Error('Manufacturer ID is required');
    }

    return this.getAllFulfillments({ manufacturerId });
  }

  /**
   * Get fulfillments by order ID
   * Convenience method that calls getAllFulfillments with orderId filter
   */
  async getFulfillmentsByOrder(orderId) {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    return this.getAllFulfillments({ orderId });
  }

  /**
   * Helper method to get human-readable status display
   */
  getStatusDisplay(status) {
    const statusMap = {
      'pending': 'Pending Assignment',
      'confirmed': 'Confirmed',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  }

  /**
   * Helper method to get item status display
   */
  getItemStatusDisplay(status) {
    // Assuming status is numeric based on API docs
    const statusMap = {
      0: 'Pending',
      1: 'In Progress',
      2: 'Completed',
      3: 'Shipped',
      4: 'Delivered'
    };
    return statusMap[status] || `Status ${status}`;
  }

  /**
   * Helper method to calculate priority level for UI
   */
  getPriorityLevel(priority) {
    const priorityMap = {
      'low': 1,
      'normal': 2,
      'high': 3,
      'urgent': 4
    };
    return priorityMap[priority] || 2;
  }

  /**
   * Helper method to calculate days left until completion
   */
  calculateDaysLeft(estimatedCompletionDate) {
    if (!estimatedCompletionDate) return null;
    
    const completionDate = new Date(estimatedCompletionDate);
    const today = new Date();
    const diffTime = completionDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  }

  /**
   * Helper method to calculate default delivery date (7 days from now)
   */
  calculateDefaultDeliveryDate() {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString();
  }
}

export default new FulfillmentService();