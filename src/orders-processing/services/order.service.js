// Order Service - Handles order-related API calls  
// Endpoints documented in /docs/api-endpoints.md

const API_BASE_URL = '/api/v1';

class OrderService {
  /**
   * Create a new order from cart items
   * Endpoint: POST /api/v1/orders
   * Used for: Checkout process
   */
  async createOrder(orderData) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create order');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Get user's order history
   * Endpoint: GET /api/v1/orders
   * Used for: Order history page, user dashboard
   */
  async getUserOrders(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const url = `${API_BASE_URL}/orders${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch orders');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  /**
   * Legacy function for backward compatibility
   * Will be removed once all components are updated
   */
  async getOrdersByUser(userId) {
    return this.getUserOrders({ userId });
  }
}

// Export both class instance and legacy function for backward compatibility
export default new OrderService();
