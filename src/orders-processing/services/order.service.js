import { env } from '../../env.js';

export async function getOrdersByUser(userId) {
  // Si no se pasa userId, usar el de entorno por defecto
  const effectiveUserId = userId || env.defaultUserId;

  const res = await fetch(`${env.apiBaseUrl}/orders?user_id=${effectiveUserId}`);
  if (!res.ok) throw new Error('Error fetching orders');
  const orders = await res.json();

  const projectsRes = await fetch(`${env.apiBaseUrl}/projects`);
  const projects = projectsRes.ok ? await projectsRes.json() : [];

  const items = orders.flatMap(order =>
    order.items.map(item => {
      const project = projects.find(p => p.id === item.project_id);
      return {
        id: item.id,
        projectName: project ? project.name : 'Producto',
        quantity: item.quantity,
        price: item.unit_price,
        orderId: order.id,
        applied_discounts: order.applied_discounts
      };
    })
  );
  return items;
}
