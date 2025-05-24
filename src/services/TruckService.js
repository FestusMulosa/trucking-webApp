/**
 * Client-side service for managing trucks through the server API
 */

import apiCache from '../utils/apiCache';
import { getCurrentUserCompanyId } from '../utils/companyUtils';

// API base URL - pointing to the dedicated server
const API_BASE_URL = (process.env.REACT_APP_API_URL || 'https://trucking-server.onrender.com') + '/api';

// Log the API URL for debugging
console.log('TruckService API URL:', API_BASE_URL);

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
 * Get all trucks for the current company with pagination and filtering
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 50)
 * @param {string} options.status - Filter by status
 * @param {boolean} options.includeCompany - Include company data (default: false)
 * @returns {Promise} Promise that resolves with the trucks and pagination info
 */
const getTrucks = async (options = {}) => {
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
    const url = `${API_BASE_URL}/trucks${queryString}`;

    // Check cache first (only for GET requests without status filter for better cache hit rate)
    if (!options.status) {
      const cacheKey = apiCache.generateKey(url);
      const cachedData = apiCache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    console.log('Fetching trucks with token:', token ? 'Token exists' : 'No token');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Trucks API response status:', response.status);

    const data = await response.json();

    if (!response.ok) {
      // Handle specific authentication errors
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid token');
      }
      throw new Error(data.message || 'Failed to fetch trucks');
    }

    let result;
    // Return trucks array for backward compatibility if no pagination
    if (data.trucks && data.pagination) {
      result = data;
    } else {
      // Fallback for old API response format
      result = Array.isArray(data) ? data : [];
    }

    // Cache the result (only if no status filter for better cache hit rate)
    if (!options.status) {
      const cacheKey = apiCache.generateKey(url);
      apiCache.set(cacheKey, result, 2 * 60 * 1000); // Cache for 2 minutes
    }

    return result;
  } catch (error) {
    console.error('Failed to fetch trucks:', error);
    throw error;
  }
};

/**
 * Get a single truck by ID
 * @param {number} id - The ID of the truck to fetch
 * @returns {Promise} Promise that resolves with the truck
 */
const getTruck = async (id) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/trucks/${id}`, {
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
      throw new Error(data.message || 'Failed to fetch truck');
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch truck:', error);
    throw error;
  }
};

/**
 * Create a new truck
 * @param {Object} truck - The truck to create
 * @returns {Promise} Promise that resolves when the truck is created
 */
const createTruck = async (truck) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Log the request details for debugging
    console.log('Creating truck with data:', truck);
    console.log('API URL:', `${API_BASE_URL}/trucks`);

    // Get the current user's company ID
    const userCompanyId = getCurrentUserCompanyId();
    if (!userCompanyId) {
      throw new Error('User company information not found. Please log in again.');
    }

    // Make sure companyId is set (required by the server)
    const truckWithCompany = {
      ...truck,
      companyId: truck.companyId || userCompanyId
    };

    const response = await fetch(`${API_BASE_URL}/trucks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(truckWithCompany),
    });

    console.log('Create truck response status:', response.status);

    // Handle 404 errors specifically
    if (response.status === 404) {
      console.error('API endpoint not found (404):', `${API_BASE_URL}/trucks`);
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
      throw new Error(data.message || 'Failed to create truck');
    }

    // Clear trucks cache after creating a new truck
    apiCache.clearAll(); // Clear all cache to ensure fresh data

    console.log('Truck created successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to create truck:', error);
    throw error;
  }
};

/**
 * Update a truck
 * @param {number} id - The ID of the truck to update
 * @param {Object} updates - The updates to apply
 * @returns {Promise} Promise that resolves when the truck is updated
 */
const updateTruck = async (id, updates) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Log the request details for debugging
    console.log(`Updating truck ${id} with data:`, updates);
    console.log('API URL:', `${API_BASE_URL}/trucks/${id}`);

    // Make sure companyId is set (required by the server)
    const updatesWithCompany = {
      ...updates,
      companyId: updates.companyId || 1 // Default to company ID 1 if not provided
    };

    const response = await fetch(`${API_BASE_URL}/trucks/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatesWithCompany),
    });

    console.log('Update truck response status:', response.status);

    // Handle 404 errors specifically
    if (response.status === 404) {
      console.error('API endpoint not found (404):', `${API_BASE_URL}/trucks/${id}`);
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
      throw new Error(data.message || 'Failed to update truck');
    }

    // Clear trucks cache after updating a truck
    apiCache.clearAll(); // Clear all cache to ensure fresh data

    console.log('Truck updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to update truck:', error);
    throw error;
  }
};

/**
 * Delete a truck
 * @param {number} id - The ID of the truck to delete
 * @returns {Promise} Promise that resolves when the truck is deleted
 */
const deleteTruck = async (id) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/trucks/${id}`, {
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
      throw new Error(data.message || 'Failed to delete truck');
    }

    // Clear trucks cache after deleting a truck
    apiCache.clearAll(); // Clear all cache to ensure fresh data

    return data;
  } catch (error) {
    console.error('Failed to delete truck:', error);
    throw error;
  }
};

// Export the service functions
const TruckService = {
  getTrucks,
  getTruck,
  createTruck,
  updateTruck,
  deleteTruck
};

export default TruckService;
