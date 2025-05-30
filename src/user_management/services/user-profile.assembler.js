import { UserEntity } from '../model/user.entity.js';

export class UserProfileAssembler {
  /**
   * Convert raw user data to UserEntity
   * @param {Object} userData - Raw user data from API or database
   * @returns {UserEntity} - UserEntity instance
   */
  static toEntity(userData) {
    if (!userData) {
      throw new Error('User data is required');
    }

    return new UserEntity(
      userData.id,
      userData.email,
      userData.name,
      userData.created_at || new Date().toISOString()
    );
  }

  /**
   * Convert UserEntity to plain object for API requests
   * @param {UserEntity} userEntity - UserEntity instance
   * @returns {Object} - Plain object representation
   */
  
  static toDTO(userEntity) {
    if (!userEntity) {
      throw new Error('User entity is required');
    }

    return {
      id: userEntity.id,
      email: userEntity.email,
      name: userEntity.name,
      created_at: userEntity.created_at
    };
  }

  /**
   * Convert array of raw user data to array of UserEntity
   * @param {Array} usersData - Array of raw user data
   * @returns {Array<UserEntity>} - Array of UserEntity instances
   */
  static toEntityArray(usersData) {
    if (!Array.isArray(usersData)) {
      throw new Error('Users data must be an array');
    }

    return usersData.map(userData => this.toEntity(userData));
  }

  /**
   * Convert array of UserEntity to array of plain objects
   * @param {Array<UserEntity>} userEntities - Array of UserEntity instances
   * @returns {Array<Object>} - Array of plain objects
   */
  static toDTOArray(userEntities) {
    if (!Array.isArray(userEntities)) {
      throw new Error('User entities must be an array');
    }

    return userEntities.map(userEntity => this.toDTO(userEntity));
  }
}
