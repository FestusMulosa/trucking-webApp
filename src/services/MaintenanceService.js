/**
 * Client-side service for managing maintenance records through the server API
 */

// API base URL - pointing to the dedicated server
const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:3001') + '/api';

/**
 * Get the authentication token from local storage
 * @returns {string|null} The authentication token or null if not found
 */
const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Get all maintenance records for the current company
 * @param {Object} filters - Optional filters for the maintenance records
 * @param {string} filters.status - Filter by status
 * @param {number} filters.truckId - Filter by truck ID
 * @param {string} filters.startDate - Filter by start date (minimum)
 * @param {string} filters.endDate - Filter by start date (maximum)
 * @returns {Promise} Promise that resolves with the maintenance records
 */
const getMaintenanceRecords = async (filters = {}) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Build query string from filters
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.truckId) queryParams.append('truckId', filters.truckId);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    const response = await fetch(`${API_BASE_URL}/maintenance${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch maintenance records');
    }

    return data.maintenanceRecords;
  } catch (error) {
    console.error('Failed to fetch maintenance records:', error);
    throw error;
  }
};

/**
 * Get a single maintenance record by ID
 * @param {number} id - The ID of the maintenance record to fetch
 * @returns {Promise} Promise that resolves with the maintenance record
 */
const getMaintenanceRecord = async (id) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/maintenance/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch maintenance record');
    }

    return data.maintenanceRecord;
  } catch (error) {
    console.error('Failed to fetch maintenance record:', error);
    throw error;
  }
};

/**
 * Create a new maintenance record
 * @param {Object} maintenanceRecord - The maintenance record to create
 * @returns {Promise} Promise that resolves when the maintenance record is created
 */
const createMaintenanceRecord = async (maintenanceRecord) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/maintenance`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(maintenanceRecord),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create maintenance record');
    }

    return data.maintenanceRecord;
  } catch (error) {
    console.error('Failed to create maintenance record:', error);
    throw error;
  }
};

/**
 * Update a maintenance record
 * @param {number} id - The ID of the maintenance record to update
 * @param {Object} updates - The updates to apply
 * @returns {Promise} Promise that resolves when the maintenance record is updated
 */
const updateMaintenanceRecord = async (id, updates) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/maintenance/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update maintenance record');
    }

    return data.maintenanceRecord;
  } catch (error) {
    console.error('Failed to update maintenance record:', error);
    throw error;
  }
};

/**
 * Delete a maintenance record
 * @param {number} id - The ID of the maintenance record to delete
 * @returns {Promise} Promise that resolves when the maintenance record is deleted
 */
const deleteMaintenanceRecord = async (id) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/maintenance/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete maintenance record');
    }

    return data;
  } catch (error) {
    console.error('Failed to delete maintenance record:', error);
    throw error;
  }
};

// Export the service functions
const MaintenanceService = {
  getMaintenanceRecords,
  getMaintenanceRecord,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord
};

export default MaintenanceService;
