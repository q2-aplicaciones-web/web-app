import { Fulfillment } from '../models/fulfillment.entiy';

export const FulfillmentAssembler = {
  toResourceFromEntity(entity) {
    return {
      id: entity.id,
      order_id: entity.order_id,
      status: entity.status,
      received_date: entity.received_date,
      shipped_date: entity.shipped_date,
      manufacturer_id: entity.manufacturer_id,
    };
  },

  toEntityFromResource(resource) {
    return new Fulfillment(resource);
  }
};