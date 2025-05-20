/**
 * Client-side service for managing trucks through the server API
 */

// API base URL - pointing to the dedicated server
const API_BASE_URL = (process.env.REACT_APP_API_URL || 'https://trucking-server.onrender.com') + '/api';

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
 * Get all trucks for the current company
 * @returns {Promise} Promise that resolves with the trucks
 */
const getTrucks = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log('Fetching trucks with token:', token ? 'Token exists' : 'No token');
    const response = await fetch(`${API_BASE_URL}/trucks`, {
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

    return data;
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

    const response = await fetch(`${API_BASE_URL}/trucks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(truck),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific authentication errors
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid token');
      }
      throw new Error(data.message || 'Failed to create truck');
    }

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

    const response = await fetch(`${API_BASE_URL}/trucks/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific authentication errors
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid token');
      }
      throw new Error(data.message || 'Failed to update truck');
    }

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
