/**
 * Client-side service for managing settings through the server API
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
 * Get all settings for the current company
 * @returns {Promise} Promise that resolves with the settings
 */
const getSettings = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch settings');
    }

    return data.settings;
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    throw error;
  }
};

/**
 * Update settings for the current company
 * @param {Object} settings - The settings to update
 * @returns {Promise} Promise that resolves when the settings are updated
 */
const updateSettings = async (settings) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ settings }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update settings');
    }

    return data;
  } catch (error) {
    console.error('Failed to update settings:', error);
    throw error;
  }
};

/**
 * Get all email recipients for the current company
 * @returns {Promise} Promise that resolves with the email recipients
 */
const getEmailRecipients = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/email-recipients`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch email recipients');
    }

    return data.recipients;
  } catch (error) {
    console.error('Failed to fetch email recipients:', error);
    throw error;
  }
};

/**
 * Add a new email recipient
 * @param {Object} recipient - The recipient to add
 * @param {string} recipient.email - The recipient's email address
 * @param {string} recipient.name - The recipient's name
 * @param {Object} recipient.notificationTypes - The notification types the recipient should receive
 * @returns {Promise} Promise that resolves when the recipient is added
 */
const addEmailRecipient = async (recipient) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/email-recipients`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipient),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add email recipient');
    }

    return data.recipient;
  } catch (error) {
    console.error('Failed to add email recipient:', error);
    throw error;
  }
};

/**
 * Update an email recipient
 * @param {number} id - The ID of the recipient to update
 * @param {Object} updates - The updates to apply
 * @returns {Promise} Promise that resolves when the recipient is updated
 */
const updateEmailRecipient = async (id, updates) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/email-recipients/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update email recipient');
    }

    return data.recipient;
  } catch (error) {
    console.error('Failed to update email recipient:', error);
    throw error;
  }
};

/**
 * Delete an email recipient
 * @param {number} id - The ID of the recipient to delete
 * @returns {Promise} Promise that resolves when the recipient is deleted
 */
const deleteEmailRecipient = async (id) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/email-recipients/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete email recipient');
    }

    return data;
  } catch (error) {
    console.error('Failed to delete email recipient:', error);
    throw error;
  }
};

/**
 * Test the email service
 * @returns {Promise} Promise that resolves when the test email is sent
 */
const testEmailService = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/test-email`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send test email');
    }

    return data;
  } catch (error) {
    console.error('Failed to send test email:', error);
    throw error;
  }
};

// Export the service functions
const SettingsService = {
  getSettings,
  updateSettings,
  getEmailRecipients,
  addEmailRecipient,
  updateEmailRecipient,
  deleteEmailRecipient,
  testEmailService
};

export default SettingsService;
