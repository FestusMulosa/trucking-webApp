/**
 * Utility functions for role-based access control
 */

// Role hierarchy (higher number = more permissions)
const ROLE_HIERARCHY = {
  'user': 1,
  'manager': 2,
  'admin': 3, // Legacy role, treated as company_admin
  'company_admin': 3,
  'super_admin': 4
};

/**
 * Check if user has super admin role
 * @param {Object} user - User object with role property
 * @returns {boolean}
 */
export const isSuperAdmin = (user) => {
  return user?.role === 'super_admin';
};

/**
 * Check if user has company admin role or higher
 * @param {Object} user - User object with role property
 * @returns {boolean}
 */
export const isCompanyAdmin = (user) => {
  return user?.role === 'company_admin' || user?.role === 'admin' || isSuperAdmin(user);
};

/**
 * Check if user has admin role (legacy or company_admin)
 * @param {Object} user - User object with role property
 * @returns {boolean}
 */
export const isAdmin = (user) => {
  return user?.role === 'admin' || isCompanyAdmin(user);
};

/**
 * Check if user has manager role or higher
 * @param {Object} user - User object with role property
 * @returns {boolean}
 */
export const isManager = (user) => {
  return user?.role === 'manager' || isAdmin(user);
};

/**
 * Check if user has at least the specified role level
 * @param {Object} user - User object with role property
 * @param {string} requiredRole - Required role level
 * @returns {boolean}
 */
export const hasRole = (user, requiredRole) => {
  const userLevel = ROLE_HIERARCHY[user?.role] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
};

/**
 * Get user role display name
 * @param {string} role - User role
 * @returns {string}
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    'user': 'User',
    'manager': 'Manager',
    'admin': 'Company Admin', // Legacy role
    'company_admin': 'Company Admin',
    'super_admin': 'Super Admin'
  };
  return roleNames[role] || 'Unknown';
};

/**
 * Check if user can access cross-company data
 * @param {Object} user - User object with role property
 * @returns {boolean}
 */
export const canAccessAllCompanies = (user) => {
  return isSuperAdmin(user);
};

/**
 * Check if user can manage users
 * @param {Object} user - User object with role property
 * @returns {boolean}
 */
export const canManageUsers = (user) => {
  return isCompanyAdmin(user);
};

/**
 * Check if user can manage company settings
 * @param {Object} user - User object with role property
 * @returns {boolean}
 */
export const canManageCompanySettings = (user) => {
  return isCompanyAdmin(user);
};

/**
 * Check if user can view reports
 * @param {Object} user - User object with role property
 * @returns {boolean}
 */
export const canViewReports = (user) => {
  return isManager(user);
};

/**
 * Get available navigation items based on user role
 * @param {Object} user - User object with role property
 * @returns {Array}
 */
export const getAvailableNavItems = (user) => {
  const baseItems = [
    { path: '/', label: 'Dashboard', icon: 'dashboard' },
    { path: '/trucks', label: 'Trucks', icon: 'truck' },
    { path: '/drivers', label: 'Drivers', icon: 'users' },
    { path: '/maintenance', label: 'Maintenance', icon: 'wrench' }
  ];

  const managerItems = [
    { path: '/reports', label: 'Reports', icon: 'chart' }
  ];

  const adminItems = [
    { path: '/settings', label: 'Settings', icon: 'settings' }
  ];

  let items = [...baseItems];

  if (isManager(user)) {
    items = [...items, ...managerItems];
  }

  if (isCompanyAdmin(user)) {
    items = [...items, ...adminItems];
  }

  return items;
};

/**
 * Check if user should see admin features
 * @param {Object} user - User object with role property
 * @returns {boolean}
 */
export const shouldShowAdminFeatures = (user) => {
  return isCompanyAdmin(user);
};

/**
 * Check if user should see super admin features
 * @param {Object} user - User object with role property
 * @returns {boolean}
 */
export const shouldShowSuperAdminFeatures = (user) => {
  return isSuperAdmin(user);
};
