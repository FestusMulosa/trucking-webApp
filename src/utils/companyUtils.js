/**
 * Utility functions for handling company-related operations
 */

/**
 * Get the current user's company ID from local storage
 * @returns {number|null} The company ID or null if not found
 */
export const getCurrentUserCompanyId = () => {
  try {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.companyId || null;
    }
    return null;
  } catch (error) {
    console.error('Error parsing user data for company ID:', error);
    return null;
  }
};

/**
 * Get the current user's role from local storage
 * @returns {string|null} The user role or null if not found
 */
export const getCurrentUserRole = () => {
  try {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.role || null;
    }
    return null;
  } catch (error) {
    console.error('Error parsing user data for role:', error);
    return null;
  }
};

/**
 * Get the current user's full information from local storage
 * @returns {Object|null} The user object or null if not found
 */
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user);
    }
    return null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Check if the current user is an admin
 * @returns {boolean} True if the user is an admin, false otherwise
 */
export const isCurrentUserAdmin = () => {
  const role = getCurrentUserRole();
  return role === 'admin';
};
