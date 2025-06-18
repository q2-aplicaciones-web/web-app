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

  async function getFulfillmentsByOrder(orderId) {
    const res = await fetch(`${API_BASE_URL}/fulfillments?order_id=${orderId}`);
    const data = await res.json();
    return data.map(FulfillmentAssembler.toEntityFromResource);
  }

  async function getFulfillmentById(id) {
    const res = await fetch(`${API_BASE_URL}/fulfillments/${id}`);
    const data = await res.json();
    return FulfillmentAssembler.toEntityFromResource(data);
  }

  async function createFulfillment(fulfillment) {
    const body = FulfillmentAssembler.toResourceFromEntity(fulfillment);
    const res = await fetch(`${API_BASE_URL}/fulfillments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return FulfillmentAssembler.toEntityFromResource(data);
  }

  async function updateFulfillment(id, fulfillment) {
    const body = FulfillmentAssembler.toResourceFromEntity(fulfillment);
    const res = await fetch(`${API_BASE_URL}/fulfillments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return FulfillmentAssembler.toEntityFromResource(data);
  }

  return {
    getAllFulfillments,
    getFulfillmentsByManufacturer,
    getFulfillmentsByOrder,
    getFulfillmentById,
    createFulfillment,
    updateFulfillment
  };
}