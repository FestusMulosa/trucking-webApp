/**
 * Client-side service for sending emails through the server API
 */

// API base URL - pointing to the dedicated server
const API_BASE_URL = (process.env.REACT_APP_API_URL || 'https://trucking-server.onrender.com') + '/api';

// Email settings from environment variables
const EMAIL_ENABLED = process.env.REACT_APP_EMAIL_ENABLED !== 'false'; // Enabled by default
const EMAIL_MAINTENANCE_ALERTS = process.env.REACT_APP_EMAIL_MAINTENANCE_ALERTS !== 'false'; // Enabled by default
const EMAIL_STATUS_CHANGES = process.env.REACT_APP_EMAIL_STATUS_CHANGES !== 'false'; // Enabled by default
const EMAIL_DAILY_REPORTS = process.env.REACT_APP_EMAIL_DAILY_REPORTS === 'true';
const DEFAULT_RECIPIENT = process.env.REACT_APP_DEFAULT_RECIPIENT;

// Log email configuration
console.log('Email configuration:', {
  API_BASE_URL,
  EMAIL_ENABLED,
  EMAIL_MAINTENANCE_ALERTS,
  EMAIL_STATUS_CHANGES,
  EMAIL_DAILY_REPORTS,
  DEFAULT_RECIPIENT,
  REACT_APP_EMAIL_ENABLED: process.env.REACT_APP_EMAIL_ENABLED,
});

/**
 * Send an email through the server API
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text email body
 * @param {string} options.html - HTML email body (optional)
 * @returns {Promise} - Promise that resolves when the email is sent
 */
const sendEmail = async (options) => {
  console.log('sendEmail called with options:', { ...options, html: options.html ? '(HTML content)' : undefined });

  if (!EMAIL_ENABLED) {
    console.log('Email service is disabled');
    return { success: false, message: 'Email service is disabled' };
  }

  try {
    console.log(`Sending email to API at ${API_BASE_URL}/send-email`);

    const emailData = {
      to: options.to || DEFAULT_RECIPIENT,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    console.log('Email data:', { ...emailData, html: emailData.html ? '(HTML content)' : undefined });

    const response = await fetch(`${API_BASE_URL}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email');
    }

    return data;
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send a notification email
 * @param {Object} options - Notification options
 * @param {string} options.to - Recipient email address
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {string} options.type - Notification type (success, warning, error, info)
 * @returns {Promise} - Promise that resolves when the email is sent
 */
const sendNotificationEmail = async (options) => {
  const { to, title, message, type } = options;

  // Create HTML content with styling based on notification type
  const getTypeColor = () => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'error': return '#F44336';
      case 'info':
      default: return '#2196F3';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info':
      default: return 'ℹ️';
    }
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <div style="background-color: ${getTypeColor()}; color: white; padding: 10px 15px; border-radius: 4px; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 18px;">${getTypeIcon()} ${title}</h2>
      </div>
      <div style="color: #333; line-height: 1.5;">
        <p>${message}</p>
      </div>
      <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; color: #777; font-size: 12px;">
        <p>This is an automated message from the Truck Fleet Tracker system. Please do not reply to this email.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Truck Fleet Tracker: ${title}`,
    text: `${title}\n\n${message}\n\nThis is an automated message from the Truck Fleet Tracker system. Please do not reply to this email.`,
    html,
  });
};

/**
 * Send a maintenance alert email
 * @param {Object} options - Alert options
 * @param {string} options.to - Recipient email address
 * @param {string} options.truckId - Truck ID
 * @param {string} options.maintenanceType - Type of maintenance
 * @param {string} options.date - Maintenance date
 * @returns {Promise} - Promise that resolves when the email is sent
 */
const sendMaintenanceAlertEmail = async (options) => {
  if (!EMAIL_MAINTENANCE_ALERTS) {
    console.log('Maintenance alert emails are disabled');
    return { success: false, message: 'Maintenance alert emails are disabled' };
  }

  const { to, truckId, maintenanceType, date } = options;
  const title = `Maintenance Alert for ${truckId}`;
  const message = `A ${maintenanceType} maintenance is scheduled for ${truckId} on ${date}. Please ensure the truck is available for service.`;

  return sendNotificationEmail({
    to,
    title,
    message,
    type: 'warning',
  });
};

/**
 * Send a status change email
 * @param {Object} options - Status change options
 * @param {string} options.to - Recipient email address
 * @param {string} options.truckId - Truck ID
 * @param {string} options.oldStatus - Previous status
 * @param {string} options.newStatus - New status
 * @returns {Promise} - Promise that resolves when the email is sent
 */
const sendStatusChangeEmail = async (options) => {
  if (!EMAIL_STATUS_CHANGES) {
    console.log('Status change emails are disabled');
    return { success: false, message: 'Status change emails are disabled' };
  }

  const { to, truckId, oldStatus, newStatus } = options;

  console.log(`Preparing to send status change email: ${truckId} from ${oldStatus} to ${newStatus}`);

  // Use the dedicated status change endpoint
  try {
    console.log(`Sending status change notification to ${to}`);

    const response = await fetch(`${API_BASE_URL}/send-status-change`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        truckId,
        oldStatus,
        newStatus
      }),
    });

    const data = await response.json();
    console.log('Status change API response:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send status change notification');
    }

    return data;
  } catch (error) {
    console.error('Failed to send status change notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send a fitness expiry notification email
 * @param {Object} options - Notification options
 * @param {string} options.to - Recipient email address
 * @param {Array} options.trucks - Array of trucks with fitness about to expire
 * @returns {Promise} - Promise that resolves when the email is sent
 */
const sendFitnessExpiryEmail = async (options) => {
  console.log('sendFitnessExpiryEmail called with options:', options);
  const { to, trucks } = options;

  if (!trucks || trucks.length === 0) {
    console.log('No trucks with fitness about to expire');
    return { success: false, message: 'No trucks with fitness about to expire' };
  }

  console.log(`Preparing to send fitness expiry email to ${to} for ${trucks.length} trucks`);

  // Use the dedicated fitness expiry endpoint
  try {
    console.log(`Sending fitness expiry notification to ${to}`);

    const response = await fetch(`${API_BASE_URL}/send-fitness-expiry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        trucks
      }),
    });

    const data = await response.json();
    console.log('Fitness expiry API response:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send fitness expiry notification');
    }

    return data;
  } catch (error) {
    console.error('Failed to send fitness expiry notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Test the email service
 * @returns {Promise} - Promise that resolves when the test email is sent
 */
const testEmailService = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/test-email`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send test email');
    }

    return data;
  } catch (error) {
    console.error('Failed to send test email:', error);
    return { success: false, error: error.message };
  }
};

// Export the service functions
const EmailClient = {
  sendEmail,
  sendNotificationEmail,
  sendMaintenanceAlertEmail,
  sendStatusChangeEmail,
  sendFitnessExpiryEmail,
  testEmailService,
  isEnabled: EMAIL_ENABLED,
  settings: {
    maintenanceAlerts: EMAIL_MAINTENANCE_ALERTS,
    statusChanges: EMAIL_STATUS_CHANGES,
    dailyReports: EMAIL_DAILY_REPORTS,
  },
};

export default EmailClient;
