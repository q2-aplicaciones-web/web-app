import { ref, computed, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { env } from '../../env';

// Available roles in the system
export const ROLES = {
  CUSTOMER: 'customer',
  MANUFACTURER: 'manufacturer',
  ADMIN: 'admin'
};

// Protected routes that require specific roles
export const PROTECTED_ROUTES = {
  '/manufacturer-orders': [ROLES.MANUFACTURER, ROLES.ADMIN],
  '/manufacturer-dashboard': [ROLES.MANUFACTURER, ROLES.ADMIN],
  '/orders': [ROLES.MANUFACTURER, ROLES.ADMIN],
  '/inventory': [ROLES.MANUFACTURER, ROLES.ADMIN]
};

// Role permissions mapping (features available to each role)
export const ROLE_PERMISSIONS = {
  [ROLES.CUSTOMER]: ['design-lab', 'shopping-cart', 'explore', 'profile'],
  [ROLES.MANUFACTURER]: ['manufacturing-dashboard', 'orders', 'production', 'inventory', 'order-management'],
  [ROLES.ADMIN]: ['all'] // Admin has access to everything
};

// Event bus for role changes
const roleChangeCallbacks = [];

// Common role names for conditional checks
export const ROLE_NAMES = {
  CUSTOMER: 'customer',
  MANUFACTURER: 'manufacturer',
  ADMIN: 'admin'
};

// Global reactive state for current role
const currentRole = ref(null);

export function useRoleDomain() {
  /**
   * Returns the current role as a computed value
   */
  const role = computed(() => currentRole.value);
  
  /**
   * Set the current role with validation
   * @param {string} newRole - The new role to set
   * @returns {boolean} - Whether the role was successfully set
   */
  function setRole(newRole) {
    // Normalize role to lowercase for consistency
    const normalizedRole = newRole?.toLowerCase();
    
    // Validate role exists in our predefined ROLES
    if (!normalizedRole || !Object.values(ROLES).includes(normalizedRole)) {
      console.warn(`Attempted to set invalid role: ${newRole}`);
      return false;
    }
    
    // Only update if role is actually changing
    if (currentRole.value !== normalizedRole) {
      const oldRole = currentRole.value;
      
      // Set the role
      currentRole.value = normalizedRole;
      
      // Save to localStorage for persistence across page refreshes
      try {
        localStorage.setItem('userRole', normalizedRole);
      } catch (e) {
        console.error('Could not save role to localStorage:', e);
      }
      
      // Notify all registered callbacks about the role change
      roleChangeCallbacks.forEach(callback => {
        try {
          callback(normalizedRole, oldRole);
        } catch (e) {
          console.error('Error in role change callback:', e);
        }
      });
    }
    
    return true;
  }
  
  /**
   * Get the current role value
   * @returns {string|null} - Current role
   */
  function getCurrentRole() {
    return currentRole.value;
  }
  
  /**
   * Check if the current role has a specific permission
   * @param {string} permission - The permission to check
   * @returns {boolean} - Whether the current role has the permission
   */
  function hasPermission(permission) {
    if (!currentRole.value) return false;
    
    const rolePerms = ROLE_PERMISSIONS[currentRole.value];
    
    // Admin has access to everything
    if (currentRole.value === ROLES.ADMIN || rolePerms?.includes('all')) {
      return true;
    }
    
    return rolePerms?.includes(permission) || false;
  }
  
  /**
   * Check if the current role can access a specific route
   * @param {string} routePath - The route path to check
   * @returns {boolean} - Whether the current role can access the route
   */
  function canAccessRoute(routePath) {
    // If route is not protected, allow access
    if (!PROTECTED_ROUTES[routePath]) {
      return true;
    }
    
    // If no role is set, deny access to protected routes
    if (!currentRole.value) {
      return false;
    }
    
    // Check if current role is allowed
    return PROTECTED_ROUTES[routePath].includes(currentRole.value);
  }
  
  /**
   * Register a callback to be called when the role changes
   * @param {Function} callback - Function to call when the role changes
   * @returns {Function} - Function to unregister the callback
   */
  function onRoleChange(callback) {
    roleChangeCallbacks.push(callback);
    return () => {
      const index = roleChangeCallbacks.indexOf(callback);
      if (index !== -1) {
        roleChangeCallbacks.splice(index, 1);
      }
    };
  }
  
  /**
   * Initialize role from localStorage if available
   */
  function init() {
    try {
      const savedRole = localStorage.getItem('userRole');
      if (savedRole && Object.values(ROLES).includes(savedRole)) {
        currentRole.value = savedRole;
      }
    } catch (e) {
      console.error('Could not retrieve role from localStorage:', e);
    }
  }
  
  // Initialize on service creation
  init();

  return {
    currentRole: role,
    setRole,
    getCurrentRole,
    hasPermission,
    canAccessRoute,
    onRoleChange,
    ROLES
  };
}