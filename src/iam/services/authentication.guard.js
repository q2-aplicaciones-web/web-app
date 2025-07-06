import { authenticationService } from './authentication.service.js';

/**
 * Authentication Guard
 * Protects routes by checking if user is authenticated
 * Similar to Angular's CanActivate guard but for Vue Router
 */
export const authenticationGuard = (to, from, next) => {
  // Fast localStorage check for immediate validation
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  if (token && userId && username) {
    // User has valid authentication data
    // Ensure service state is synchronized
    authenticationService.checkStoredAuthentication();
    
    console.log('✅ Authentication guard: Access granted to', to.path);
    next(); // Allow navigation
  } else {
    // User is not authenticated
    console.log('❌ Authentication guard: Access denied to', to.path, '- redirecting to sign-in');
    
    // Clear any partial authentication data
    authenticationService.signOut();
    
    // Redirect to sign-in page
    next('/sign-in');
  }
};

/**
 * Guest Guard
 * Redirects authenticated users away from auth pages (sign-in, sign-up)
 */
export const guestGuard = (to, from, next) => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  if (token && userId && username) {
    // User is already authenticated, redirect to home
    console.log('✅ Guest guard: User already authenticated - redirecting to home');
    next('/home');
  } else {
    // User is not authenticated, allow access to auth pages
    console.log('✅ Guest guard: Access granted to', to.path);
    next();
  }
};

/**
 * Role-based guard factory
 * Creates a guard that checks for specific roles
 * @param {string[]} requiredRoles - Array of required roles
 * @returns {Function} Vue Router guard function
 */
export const createRoleGuard = (requiredRoles) => {
  return (to, from, next) => {
    // First check if user is authenticated
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');

    if (!token || !userId || !username) {
      console.log('❌ Role guard: User not authenticated - redirecting to sign-in');
      next('/sign-in');
      return;
    }

    // Ensure service state is synchronized
    authenticationService.checkStoredAuthentication();

    // Check if user has required roles
    const hasRequiredRole = requiredRoles.some(role => 
      authenticationService.hasRole(role)
    );

    if (hasRequiredRole) {
      console.log('✅ Role guard: Access granted to', to.path);
      next();
    } else {
      console.log('❌ Role guard: Insufficient permissions for', to.path);
      // Redirect to unauthorized page or home
      next('/home');
    }
  };
};

/**
 * Note: Since all users are created with USER role by default,
 * manufacturer functionality would need to be handled differently
 * (e.g., through a separate permission system or admin promotion)
 */
