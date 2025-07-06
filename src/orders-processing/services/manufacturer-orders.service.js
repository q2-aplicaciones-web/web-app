import { authenticationService } from '../../iam/services/authentication.service.js';
import { useFulfillmentService } from './fulfillment.service.js';
import { env } from '../../env.js';

export function useManufacturerOrders() {
  const fulfillmentService = useFulfillmentService();

  async function getManufacturerOrders() {
    // 1. Obtener el usuario de sesión
    const userId = authenticationService.currentUserId.value;
    if (!userId) {
      throw new Error('User must be authenticated to access manufacturer orders');
    }
    // 2. Buscar manufacturer por user_id
    const res = await fetch(`${env.apiBaseUrl}/manufacturers?user_id=${userId}`);
    const manufacturers = await res.json();
    if (!manufacturers || manufacturers.length === 0) return [];
    const manufacturerId = manufacturers[0].id;
    // 3. Buscar fulfillments para ese manufacturer
    const fulfillments = await fulfillmentService.getFulfillmentsByManufacturer(manufacturerId);
    if (!fulfillments || fulfillments.length === 0) return [];
    // 4. Para cada fulfillment, obtener la orden y el usuario cliente
    const orders = await Promise.all(
      fulfillments.map(async (f) => {
        try {
          const orderRes = await fetch(`${env.apiBaseUrl}/orders/${f.order_id}`);
          if (!orderRes.ok) return null;
          const order = await orderRes.json();
          if (!order) return null;
          const customer = {
            id: order.user_id,
            username: `User ${order.user_id}`,
            // Mock customer data - replace with actual user service when available
          };
          return {
            id: f.id,
            orderId: order.id,
            status: f.status,
            receivedDate: f.received_date,
            shippedDate: f.shipped_date,
            customerName: customer?.profile?.getFullName?.() || '',
            customerAddress: order.shipping_address
              ? `${order.shipping_address.address}, ${order.shipping_address.city}, ${order.shipping_address.state}`
              : '',
            items: order.items.map(item => ({
              id: item.id,
              projectId: item.project_id,
              projectName: item.projectName || '',
              previewImageUrl: '',
              quantity: item.quantity,
              unitPrice: item.unit_price,
            })),
            totalAmount: order.total_amount,
          };
        } catch (e) {
          console.error('Error processing order:', e);
          return null;
        }
      })
    );
    return orders.filter(order => !!order);
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