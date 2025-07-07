// Payment Service - Handles payment-related API calls (Stripe integration)
// Endpoints documented in /docs/api-endpoints.md

const API_BASE_URL = '/api/v1';

class PaymentService {
  /**
   * Create Stripe payment intent for checkout
   * Endpoint: POST /api/v1/payments/create-intent
   * Used for: Checkout process
   */
  async createPaymentIntent(paymentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create payment intent');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * Confirm payment and complete order
   * Endpoint: POST /api/v1/payments/confirm
   * Used for: After successful payment on frontend
   */
  async confirmPayment(confirmationData) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(confirmationData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to confirm payment');
      }

      return await response.json();
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  /**
   * Get payment status for an order
   * Endpoint: GET /api/v1/payments/status/{orderId}
   * Used for: Payment status checking
   */
  async getPaymentStatus(orderId) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/status/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get payment status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  /**
   * Refund a payment
   * Endpoint: POST /api/v1/payments/refund
   * Used for: Order cancellations or returns
   */
  async refundPayment(refundData) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(refundData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process refund');
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  /**
   * Calculate tax for an order
   * Endpoint: POST /api/v1/payments/calculate-tax
   * Used for: Tax calculation during checkout
   */
  async calculateTax(taxData) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/calculate-tax`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taxData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to calculate tax');
      }

      return await response.json();
    } catch (error) {
      console.error('Error calculating tax:', error);
      throw error;
    }
  }
}

export default new PaymentService();
