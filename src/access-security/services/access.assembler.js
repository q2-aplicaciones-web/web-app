import { Access } from './access.entity.js';

export const AccessAssembler = {
  toEntity(response) {
    return new Access(
      response.id,
      response.user_id,
      response.role,
      response.permissions
    );
  },

  toResponse(entity) {
    return {
      id: entity.id,
      user_id: entity.userId,
      role: entity.role,
      permissions: entity.permissions
    };
  }
};