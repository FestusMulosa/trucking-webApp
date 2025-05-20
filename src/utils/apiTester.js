/**
 * Utility to test API responses in the client
 */

// API base URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://trucking-server.onrender.com';

/**
 * Test an API endpoint and verify it returns JSON
 * @param {string} endpoint - The API endpoint to test (e.g., '/api/health')
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - The response data and metadata
 */
export const testApiEndpoint = async (endpoint, options = {}) => {
  try {
    console.log(`Testing API endpoint: ${endpoint}`);
    
    // Get auth token if available
    const token = localStorage.getItem('token');
    
    // Set up headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // Add auth token if available
    if (token && !headers.Authorization) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    // Make the request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    // Check content type
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    let data = null;
    let parseError = null;
    
    // Try to parse JSON
    if (isJson) {
      try {
        data = await response.json();
      } catch (error) {
        parseError = error;
      }
    } else {
      // If not JSON, get text
      try {
        data = await response.text();
      } catch (error) {
        parseError = error;
      }
    }
    
    return {
      success: response.ok,
      status: response.status,
      isJson,
      contentType,
      data,
      parseError,
      response
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      isJson: false,
      data: null
    };
  }
};

/**
 * Run tests on multiple endpoints
 * @param {Array<Object>} endpoints - Array of endpoint objects with url and options
 * @returns {Promise<Array<Object>>} - Array of test results
 */
export const testMultipleEndpoints = async (endpoints) => {
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testApiEndpoint(endpoint.url, endpoint.options);
    results.push({
      endpoint: endpoint.url,
      ...result
    });
  }
  
  return results;
};

/**
 * Run a standard set of tests on common API endpoints
 * @returns {Promise<Array<Object>>} - Array of test results
 */
export const runStandardTests = async () => {
  const endpoints = [
    { url: '/api/health' },
    { url: '/api/auth/profile' },
    { url: '/api/companies' },
    { url: '/api/trucks' },
    { url: '/api/drivers' },
    { url: '/api/settings' }
  ];
  
  return await testMultipleEndpoints(endpoints);
};

export default {
  testApiEndpoint,
  testMultipleEndpoints,
  runStandardTests
};
