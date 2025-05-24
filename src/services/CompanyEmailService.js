/**
 * Client-side service for managing company emails through the server API
 */

import apiCache from '../utils/apiCache';

// API base URL - pointing to the dedicated server
const API_BASE_URL = (process.env.REACT_APP_API_URL || 'https://trucking-server.onrender.com') + '/api';

/**
 * Get the authentication token from local storage
 * @returns {string|null} The authentication token or null if not found
 */
const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Get the current user's company ID from local storage
 * @returns {number|null} The company ID or null if not found
 */
const getCompanyId = () => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.companyId;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};

/**
 * Get all email addresses for the current company
 * @returns {Promise<Object>} Promise that resolves to the API response
 */
const getCompanyEmails = async () => {
  const token = getAuthToken();
  const companyId = getCompanyId();

  if (!token || !companyId) {
    throw new Error('Authentication token or company ID not found');
  }

  try {
    const url = `${API_BASE_URL}/companies/${companyId}/emails`;

    // Check cache first
    const cacheKey = apiCache.generateKey(url);
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch company emails');
    }

    const result = await response.json();

    // Cache the result
    apiCache.set(cacheKey, result, 3 * 60 * 1000); // Cache for 3 minutes

    return result;
  } catch (error) {
    console.error('Error fetching company emails:', error);
    throw error;
  }
};

/**
 * Add a new email address for the current company
 * @param {Object} emailData - The email data
 * @param {string} emailData.emailAddress - The email address
 * @param {string} emailData.emailType - The email type (primary, billing, support, notifications, alerts)
 * @param {boolean} emailData.isActive - Whether the email is active
 * @returns {Promise<Object>} Promise that resolves to the API response
 */
const addCompanyEmail = async (emailData) => {
  const token = getAuthToken();
  const companyId = getCompanyId();

  if (!token || !companyId) {
    throw new Error('Authentication token or company ID not found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}/emails`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add email address');
    }

    // Clear company emails cache after adding
    apiCache.clearAll(); // Clear all cache to ensure fresh data

    return await response.json();
  } catch (error) {
    console.error('Error adding company email:', error);
    throw error;
  }
};

/**
 * Update an existing email address
 * @param {number} emailId - The email ID to update
 * @param {Object} emailData - The updated email data
 * @returns {Promise<Object>} Promise that resolves to the API response
 */
const updateCompanyEmail = async (emailId, emailData) => {
  const token = getAuthToken();
  const companyId = getCompanyId();

  if (!token || !companyId) {
    throw new Error('Authentication token or company ID not found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}/emails/${emailId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update email address');
    }

    // Clear company emails cache after updating
    apiCache.clearAll(); // Clear all cache to ensure fresh data

    return await response.json();
  } catch (error) {
    console.error('Error updating company email:', error);
    throw error;
  }
};

/**
 * Delete an email address
 * @param {number} emailId - The email ID to delete
 * @returns {Promise<Object>} Promise that resolves to the API response
 */
const deleteCompanyEmail = async (emailId) => {
  const token = getAuthToken();
  const companyId = getCompanyId();

  if (!token || !companyId) {
    throw new Error('Authentication token or company ID not found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}/emails/${emailId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete email address');
    }

    // Clear company emails cache after deleting
    apiCache.clearAll(); // Clear all cache to ensure fresh data

    return await response.json();
  } catch (error) {
    console.error('Error deleting company email:', error);
    throw error;
  }
};

/**
 * Validate email address format
 * @param {string} email - The email address to validate
 * @returns {boolean} True if valid, false otherwise
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Get available email types
 * @returns {Array} Array of email type objects
 */
const getEmailTypes = () => {
  return [
    { value: 'primary', label: 'Primary' },
    { value: 'billing', label: 'Billing' },
    { value: 'support', label: 'Support' },
    { value: 'notifications', label: 'Notifications' },
    { value: 'alerts', label: 'Alerts' }
  ];
};

const CompanyEmailService = {
  getCompanyEmails,
  addCompanyEmail,
  updateCompanyEmail,
  deleteCompanyEmail,
  validateEmail,
  getEmailTypes
};

export default CompanyEmailService;
