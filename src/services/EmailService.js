import nodemailer from 'nodemailer';

// Load environment variables
const SMTP_HOST = process.env.REACT_APP_SMTP_HOST;
const SMTP_PORT = process.env.REACT_APP_SMTP_PORT;
const SMTP_USER = process.env.REACT_APP_SMTP_USER;
const SMTP_PASS = process.env.REACT_APP_SMTP_PASS;
const SMTP_FROM = process.env.REACT_APP_SMTP_FROM;
const DEFAULT_RECIPIENT = process.env.REACT_APP_DEFAULT_RECIPIENT;

// Email settings from environment variables
const EMAIL_ENABLED = process.env.REACT_APP_EMAIL_ENABLED === 'true';
const EMAIL_MAINTENANCE_ALERTS = process.env.REACT_APP_EMAIL_MAINTENANCE_ALERTS === 'true';
const EMAIL_STATUS_CHANGES = process.env.REACT_APP_EMAIL_STATUS_CHANGES === 'true';
const EMAIL_DAILY_REPORTS = process.env.REACT_APP_EMAIL_DAILY_REPORTS === 'true';

// Create a transporter object
let transporter = null;

// Initialize the transporter
const initTransporter = () => {
  if (!EMAIL_ENABLED) {
    console.log('Email notifications are disabled');
    return;
  }

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.error('SMTP configuration is incomplete');
    return;
  }

  try {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    console.log('Email transporter initialized');
  } catch (error) {
    console.error('Failed to initialize email transporter:', error);
  }
};

// Initialize the transporter when the service is imported
initTransporter();

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text email body
 * @param {string} options.html - HTML email body (optional)
 * @returns {Promise} - Promise that resolves when the email is sent
 */
const sendEmail = async (options) => {
  if (!EMAIL_ENABLED || !transporter) {
    console.log('Email service is not available');
    return { success: false, message: 'Email service is not available' };
  }

  try {
    const mailOptions = {
      from: SMTP_FROM,
      to: options.to || DEFAULT_RECIPIENT,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
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
  const title = `Status Change for ${truckId}`;
  const message = `The status of ${truckId} has changed from ${oldStatus} to ${newStatus}.`;

  // Determine notification type based on new status
  let type = 'info';
  if (newStatus === 'active') {
    type = 'success';
  } else if (newStatus === 'maintenance') {
    type = 'warning';
  } else if (newStatus === 'inactive') {
    type = 'error';
  }

  return sendNotificationEmail({
    to,
    title,
    message,
    type,
  });
};

// Export the service functions
const EmailService = {
  sendEmail,
  sendNotificationEmail,
  sendMaintenanceAlertEmail,
  sendStatusChangeEmail,
  isEnabled: EMAIL_ENABLED,
  settings: {
    maintenanceAlerts: EMAIL_MAINTENANCE_ALERTS,
    statusChanges: EMAIL_STATUS_CHANGES,
    dailyReports: EMAIL_DAILY_REPORTS,
  },
};

export default EmailService;
