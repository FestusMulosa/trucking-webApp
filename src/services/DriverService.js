/**
 * Client-side service for managing drivers through the server API
 */

import apiCache from '../utils/apiCache';

// API base URL - pointing to the dedicated server
const API_BASE_URL = (process.env.REACT_APP_API_URL || 'https://trucking-server.onrender.com') + '/api';

// Log the API URL for debugging
console.log('DriverService API URL:', API_BASE_URL);

/**
 * Get the authentication token from local storage
 * @returns {string|null} The authentication token or null if not found
 */
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('No authentication token found in localStorage');
  }
  return token;
};

/**
 * Get all drivers for the current company with pagination and filtering
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 50)
 * @param {string} options.status - Filter by status
 * @param {boolean} options.includeCompany - Include company data (default: false)
 * @returns {Promise} Promise that resolves with the drivers and pagination info
 */
const getDrivers = async (options = {}) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (options.page) queryParams.append('page', options.page);
    if (options.limit) queryParams.append('limit', options.limit);
    if (options.status) queryParams.append('status', options.status);
    if (options.includeCompany !== undefined) queryParams.append('includeCompany', options.includeCompany);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const url = `${API_BASE_URL}/drivers${queryString}`;

    // Check cache first (only for GET requests without status filter for better cache hit rate)
    if (!options.status) {
      const cacheKey = apiCache.generateKey(url);
      const cachedData = apiCache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    console.log('Fetching drivers with token:', token ? 'Token exists' : 'No token');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Drivers API response status:', response.status);

    const data = await response.json();

    if (!response.ok) {
      // Handle specific authentication errors
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid token');
      }
      throw new Error(data.message || 'Failed to fetch drivers');
    }

    // Handle paginated response
    let driversArray = [];
    let paginationInfo = null;

    if (data.drivers && data.pagination) {
      driversArray = data.drivers;
      paginationInfo = data.pagination;
    } else if (Array.isArray(data)) {
      driversArray = data;
    } else {
      driversArray = [];
    }

    // Format driver data for frontend use
    const formattedDrivers = driversArray.map(driver => ({
      id: driver.id,
      name: `${driver.firstName} ${driver.lastName}`,
      firstName: driver.firstName,
      lastName: driver.lastName,
      licenseNumber: driver.licenseNumber,
      phone: driver.phone || 'N/A',
      email: driver.email || 'N/A',
      assignedTruck: driver.assignedTruck || null,
      truckId: driver.truckId || null,
      status: driver.status || 'inactive',
      experience: 'N/A', // This field might not be in the database
      address: [driver.address, driver.city, driver.state, driver.country]
        .filter(Boolean)
        .join(', ') || 'N/A',
      lastUpdate: formatLastUpdate(driver.updatedAt),
      licenseExpiry: driver.licenseExpiry,
      dateOfBirth: driver.dateOfBirth,
      emergencyContactName: driver.emergencyContactName,
      emergencyContactPhone: driver.emergencyContactPhone,
      notes: driver.notes,
      companyId: driver.companyId
    }));

    let result;
    // Return with pagination info if available
    if (paginationInfo) {
      result = {
        drivers: formattedDrivers,
        pagination: paginationInfo
      };
    } else {
      result = formattedDrivers;
    }

    // Cache the result (only if no status filter for better cache hit rate)
    if (!options.status) {
      const cacheKey = apiCache.generateKey(url);
      apiCache.set(cacheKey, result, 2 * 60 * 1000); // Cache for 2 minutes
    }

    return result;
  } catch (error) {
    console.error('Failed to fetch drivers:', error);
    throw error;
  }
};

/**
 * Get a single driver by ID
 * @param {number} id - The ID of the driver to fetch
 * @returns {Promise} Promise that resolves with the driver
 */
const getDriver = async (id) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/drivers/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific authentication errors
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid token');
      }
      throw new Error(data.message || 'Failed to fetch driver');
    }

    // Format driver data for frontend use
    const formattedDriver = {
      id: data.id,
      name: `${data.firstName} ${data.lastName}`,
      firstName: data.firstName,
      lastName: data.lastName,
      licenseNumber: data.licenseNumber,
      phone: data.phone || 'N/A',
      email: data.email || 'N/A',
      assignedTruck: data.assignedTruck || null,
      truckId: data.truckId || null,
      status: data.status || 'inactive',
      experience: 'N/A', // This field might not be in the database
      address: [data.address, data.city, data.state, data.country]
        .filter(Boolean)
        .join(', ') || 'N/A',
      lastUpdate: formatLastUpdate(data.updatedAt),
      licenseExpiry: data.licenseExpiry,
      dateOfBirth: data.dateOfBirth,
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
      notes: data.notes,
      companyId: data.companyId
    };

    return formattedDriver;
  } catch (error) {
    console.error('Failed to fetch driver:', error);
    throw error;
  }
};

/**
 * Format the last update timestamp into a human-readable string
 * @param {string} timestamp - The timestamp to format
 * @returns {string} A human-readable string representing the time elapsed
 */
const formatLastUpdate = (timestamp) => {
  if (!timestamp) return 'Unknown';

  const now = new Date();
  const updateTime = new Date(timestamp);
  const diffMs = now - updateTime;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 30) return `${diffDays} days ago`;

  return updateTime.toLocaleDateString();
};

/**
 * Create a new driver
 * @param {Object} driver - The driver to create
 * @returns {Promise} Promise that resolves when the driver is created
 */
const createDriver = async (driver) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Log the request details for debugging
    console.log('Creating driver with data:', driver);
    console.log('API URL:', `${API_BASE_URL}/drivers`);

    // Make sure companyId is set (required by the server)
    const driverWithCompany = {
      ...driver,
      companyId: driver.companyId || 1 // Default to company ID 1 if not provided
    };

    const response = await fetch(`${API_BASE_URL}/drivers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(driverWithCompany),
    });

    console.log('Create driver response status:', response.status);

    // Handle 404 errors specifically
    if (response.status === 404) {
      console.error('API endpoint not found (404):', `${API_BASE_URL}/drivers`);
      throw new Error('API endpoint not found. The server might be down or the API endpoint might have changed.');
    }

    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Server returned non-JSON response:', contentType);
      // Try to get the text response for debugging
      const textResponse = await response.text();
      console.error('Response text:', textResponse);
      throw new Error('Server returned non-JSON response. The server might be down or not properly configured.');
    }

    const data = await response.json();

    if (!response.ok) {
      // Handle specific authentication errors
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid token');
      }
      throw new Error(data.message || data.error || 'Failed to create driver');
    }

    // Format the driver data for frontend use
    const formattedDriver = {
      id: data.id,
      name: `${data.firstName} ${data.lastName}`,
      firstName: data.firstName,
      lastName: data.lastName,
      licenseNumber: data.licenseNumber,
      phone: data.phone || 'N/A',
      email: data.email || 'N/A',
      assignedTruck: data.assignedTruck || null,
      truckId: data.truckId || null,
      status: data.status || 'inactive',
      experience: 'N/A', // This field might not be in the database
      address: [data.address, data.city, data.state, data.country]
        .filter(Boolean)
        .join(', ') || 'N/A',
      lastUpdate: formatLastUpdate(data.updatedAt),
      licenseExpiry: data.licenseExpiry,
      dateOfBirth: data.dateOfBirth,
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
      notes: data.notes,
      companyId: data.companyId
    };

    // Clear drivers cache after creating a driver
    apiCache.clearAll(); // Clear all cache to ensure fresh data

    console.log('Driver created successfully:', formattedDriver);
    return formattedDriver;
  } catch (error) {
    console.error('Failed to create driver:', error);
    throw error;
  }
};

/**
 * Update a driver
 * @param {number} id - The ID of the driver to update
 * @param {Object} updates - The updates to apply
 * @returns {Promise} Promise that resolves when the driver is updated
 */
const updateDriver = async (id, updates) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Log the request details for debugging
    console.log(`Updating driver ${id} with data:`, updates);
    console.log('API URL:', `${API_BASE_URL}/drivers/${id}`);

    // Make sure companyId is set (required by the server)
    const updatesWithCompany = {
      ...updates,
      companyId: updates.companyId || 1 // Default to company ID 1 if not provided
    };

    const response = await fetch(`${API_BASE_URL}/drivers/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatesWithCompany),
    });

    console.log('Update driver response status:', response.status);

    // Handle 404 errors specifically
    if (response.status === 404) {
      console.error('API endpoint not found (404):', `${API_BASE_URL}/drivers/${id}`);
      throw new Error('API endpoint not found. The server might be down or the API endpoint might have changed.');
    }

    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Server returned non-JSON response:', contentType);
      // Try to get the text response for debugging
      const textResponse = await response.text();
      console.error('Response text:', textResponse);
      throw new Error('Server returned non-JSON response. The server might be down or not properly configured.');
    }

    const data = await response.json();

    if (!response.ok) {
      // Handle specific authentication errors
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid token');
      }
      throw new Error(data.message || data.error || 'Failed to update driver');
    }

    // Format the driver data for frontend use
    const formattedDriver = {
      id: data.id,
      name: `${data.firstName} ${data.lastName}`,
      firstName: data.firstName,
      lastName: data.lastName,
      licenseNumber: data.licenseNumber,
      phone: data.phone || 'N/A',
      email: data.email || 'N/A',
      assignedTruck: data.assignedTruck || null,
      truckId: data.truckId || null,
      status: data.status || 'inactive',
      experience: 'N/A', // This field might not be in the database
      address: [data.address, data.city, data.state, data.country]
        .filter(Boolean)
        .join(', ') || 'N/A',
      lastUpdate: formatLastUpdate(data.updatedAt),
      licenseExpiry: data.licenseExpiry,
      dateOfBirth: data.dateOfBirth,
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
      notes: data.notes,
      companyId: data.companyId
    };

    // Clear drivers cache after updating a driver
    apiCache.clearAll(); // Clear all cache to ensure fresh data

    console.log('Driver updated successfully:', formattedDriver);
    return formattedDriver;
  } catch (error) {
    console.error('Failed to update driver:', error);
    throw error;
  }
};

/**
 * Delete a driver
 * @param {number} id - The ID of the driver to delete
 * @returns {Promise} Promise that resolves when the driver is deleted
 */
const deleteDriver = async (id) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/drivers/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific authentication errors
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid token');
      }
      throw new Error(data.message || data.error || 'Failed to delete driver');
    }

    // Clear drivers cache after deleting a driver
    apiCache.clearAll(); // Clear all cache to ensure fresh data

    return data;
  } catch (error) {
    console.error('Failed to delete driver:', error);
    throw error;
  }
};

// Export the service functions
const DriverService = {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver
};

export default DriverService;
