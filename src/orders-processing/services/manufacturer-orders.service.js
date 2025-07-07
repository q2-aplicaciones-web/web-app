/**
 * Manufacturer Orders Service
 * 
 * This service handles the manufacturer's view of orders assigned to them for fulfillment.
 * It fetches orders and fulfillments specific to the authenticated manufacturer user.
 * 
 * API ENDPOINTS USED:
 * 
 * 1. GET /api/v1/manufacturers
 *    - Description: Fetch all manufacturers, then filter by userId on client side
 *    - Used by: getManufacturerOrders()
 *    - Headers: Authorization: Bearer {token}
 *    - Response: Array of manufacturer objects
 *    - Example:
 *      [
 *        {
 *          "id": "string",
 *          "userId": "string",
 *          "name": "Premium Print Co.",
 *          "address_Street": "123 Main St",
 *          "address_City": "Los Angeles",
 *          "address_Country": "USA",
 *          "address_State": "CA",
 *          "address_Zip": "90210",
 *          "createdAt": "2025-07-07T00:09:58.122Z",
 *          "updatedAt": "2025-07-07T00:09:58.122Z"
 *        }
 *      ]
 * 
 * 2. GET /api/v1/fulfillments?manufacturer_id={manufacturerId}
 *    - Description: Get all fulfillments assigned to a manufacturer
 *    - Used by: getManufacturerOrders() via fulfillmentService
 *    - Query params: manufacturer_id (required) - Manufacturer UUID
 *    - Headers: Authorization: Bearer {token}
 *    - Response: Array of fulfillment objects
 * 
 * 3. GET /api/v1/orders/{orderId}
 *    - Description: Get order details for each fulfillment
 *    - Used by: getManufacturerOrders()
 *    - Path params: orderId (required) - Order UUID
 *    - Headers: Authorization: Bearer {token}
 *    - Response: Order object with items and shipping details
 *    - Example:
 *      {
 *        "id": "order_789",
 *        "user_id": "user_customer",
 *        "items": [
 *          {
 *            "id": "item_001",
 *            "project_id": "proj_456",
 *            "quantity": 2,
 *            "unit_price": 25.99,
 *            "projectName": "Cool Design"
 *          }
 *        ],
 *        "total_amount": 51.98,
 *        "shipping_address": {
 *          "address": "123 Main St",
 *          "city": "Los Angeles",
 *          "state": "CA",
 *          "zip": "90210"
 *        },
 *        "status": "pending",
 *        "createdAt": "2025-07-06T10:30:00.000Z"
 *      }
 * 
 * 4. PUT /api/v1/fulfillments/{fulfillmentId}
 *    - Description: Update fulfillment status and shipping details
 *    - Used by: updateFulfillmentStatus() via fulfillmentService
 *    - Path params: fulfillmentId (required) - Fulfillment UUID
 *    - Headers: Authorization: Bearer {token}, Content-Type: application/json
 *    - Body: Updated fulfillment object
 * 
 * DATA TRANSFORMATION:
 * This service combines data from multiple endpoints to create a manufacturer-friendly
 * view of orders with customer information, item details, and fulfillment status.
 */

import { authenticationService } from '../../iam/services/authentication.service.js';
import fulfillmentService from './fulfillment.service.js';
import { env } from '../../env.js';

export function useManufacturerOrders() {

  async function getManufacturerOrders() {
    try {
      // 1. Get authenticated user ID
      const userId = authenticationService.currentUserId.value;
      if (!userId) {
        throw new Error('User must be authenticated to access manufacturer orders');
      }

      // 2. Find manufacturer by user ID
      const manufacturer = await findManufacturerByUserId(userId);
      if (!manufacturer) {
        console.info('No manufacturer found for user:', userId);
        return [];
      }

      // 3. Get fulfillments assigned to this manufacturer
      const fulfillments = await fulfillmentService.getFulfillmentsByManufacturer(manufacturer.id);
      if (!fulfillments?.length) {
        console.info('No fulfillments found for manufacturer:', manufacturer.id);
        return [];
      }

      // 4. Process each fulfillment to create manufacturer order view
      const orders = await Promise.all(
        fulfillments.map(fulfillment => processFulfillmentOrder(fulfillment))
      );

      return orders.filter(Boolean); // Remove null/undefined entries
    } catch (error) {
      console.error('Failed to fetch manufacturer orders:', error);
      throw error;
    }
  }

  async function findManufacturerByUserId(userId) {
    // Use the new dedicated endpoint for user-specific manufacturers
    const response = await fetch(`${env.apiBaseUrl}/manufacturers/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch manufacturer for user: ${response.status} ${response.statusText}`);
    }

    const manufacturers = await response.json();
    // The new endpoint returns all manufacturers for the user, take the first one
    // If no manufacturers are found, the array will be empty
    return Array.isArray(manufacturers) && manufacturers.length > 0 ? manufacturers[0] : null;
  }

  async function processFulfillmentOrder(fulfillment) {
    try {
      const order = await fetchOrderDetails(fulfillment.order_id);
      if (!order) return null;

      return {
        id: fulfillment.id,
        orderId: order.id,
        status: fulfillment.status,
        receivedDate: fulfillment.received_date,
        shippedDate: fulfillment.shipped_date,
        customerName: buildCustomerName(order),
        customerAddress: buildCustomerAddress(order.shipping_address),
        items: order.items?.map(item => transformOrderItem(item)) || [],
        totalAmount: order.total_amount,
      };
    } catch (error) {
      console.error(`Error processing fulfillment ${fulfillment.id}:`, error);
      return null;
    }
  }

  async function fetchOrderDetails(orderId) {
    const response = await fetch(`${env.apiBaseUrl}/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch order ${orderId}: ${response.status}`);
      return null;
    }

    return response.json();
  }

  function buildCustomerName(order) {
    // TODO: Replace with actual user service call when available
    return `Customer ${order.user_id}`;
  }

  function buildCustomerAddress(shippingAddress) {
    if (!shippingAddress) return '';
    
    const { address, city, state, zip, country } = shippingAddress;
    const parts = [address, city, state, zip, country].filter(Boolean);
    return parts.join(', ');
  }

  function transformOrderItem(item) {
    return {
      id: item.id,
      projectId: item.project_id,
      projectName: item.projectName || 'Unnamed Project',
      previewImageUrl: item.previewImageUrl || '',
      quantity: item.quantity,
      unitPrice: item.unit_price,
    };
  }

  function getAuthToken() {
    return localStorage.getItem('token') || '';
  }

  async function updateFulfillmentStatus(fulfillmentId, newStatus) {
    const fulfillment = await fulfillmentService.getFulfillmentById(fulfillmentId);
    if (!fulfillment) throw new Error('Fulfillment not found');
    fulfillment.status = newStatus;
    if (newStatus === 'shipped' && !fulfillment.shipped_date) {
      fulfillment.shipped_date = new Date().toISOString();
    }
    return fulfillmentService.updateFulfillment(fulfillmentId, fulfillment);
  }

  return {
    getManufacturerOrders,
    updateFulfillmentStatus,
  };
}