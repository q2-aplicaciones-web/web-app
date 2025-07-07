

import { env } from '../../env.js';

// Simulación de llamada a la fake API para obtener descuento del usuario
export async function getDiscountForUser(appliedDiscounts) {
  if (!appliedDiscounts || appliedDiscounts.length === 0) return null;
  const res = await fetch(`${env.apiBaseUrl}/discounts_policies`);
  if (!res.ok) return null;
  const policies = await res.json();
  // Tomamos el primer descuento aplicado (puedes ajustar para múltiples)
  const discountId = appliedDiscounts[0]?.id;
  const policy = policies.find(p => p.id === discountId);
  if (!policy) return null;
  return {
    description: policy.name,
    value: policy.discount_percentage
  };
}
