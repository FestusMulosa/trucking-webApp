# Email Functionality for Truck Fleet Tracker

This document provides instructions on how to set up and use the email functionality in the Truck Fleet Tracker application.

## Overview

The Truck Fleet Tracker application now includes email notification capabilities using an SMTP server. This allows the application to send email notifications for various events, such as:

- Status changes for trucks
- Maintenance alerts
- Daily reports

## Setup Instructions

### 1. Environment Variables

The email functionality uses environment variables to configure the SMTP server. These are defined in the `.env` file at the root of the project. You need to update these variables with your SMTP server details:

```
# SMTP Server Configuration
REACT_APP_SMTP_HOST=smtp.example.com
REACT_APP_SMTP_PORT=587
REACT_APP_SMTP_USER=your-email@example.com
REACT_APP_SMTP_PASS=your-password
REACT_APP_SMTP_FROM=Truck Fleet Tracker <noreply@example.com>

# Email Notification Settings
REACT_APP_EMAIL_ENABLED=true
REACT_APP_EMAIL_MAINTENANCE_ALERTS=true
REACT_APP_EMAIL_STATUS_CHANGES=true
REACT_APP_EMAIL_DAILY_REPORTS=false

# Default recipient for system notifications
REACT_APP_DEFAULT_RECIPIENT=admin@example.com
```

Replace the placeholder values with your actual SMTP server details.

### 2. Starting the Server

The email functionality requires a server component to handle sending emails. To start both the React application and the email server, use the following command:

```
npm run dev
```

This will start both the React application and the email server concurrently.

If you want to start only the email server, you can use:

```
npm run server
```

### 3. Configuring Email Settings in the Application

You can configure email settings directly in the application through the Settings screen:

1. Navigate to the Settings screen
2. Scroll down to the "Email Configuration" section
3. Enter your SMTP server details
4. Click "Save Configuration" to save the settings
5. Use the "Test Email" button to verify that the email functionality is working correctly

## Email Notification Types

### Status Change Notifications

When a truck's status changes (e.g., from "active" to "maintenance"), an email notification will be sent if status change notifications are enabled. The email will include:

- The truck ID
- The old status
- The new status

### Maintenance Alert Notifications

When a maintenance event is scheduled for a truck, an email notification can be sent if maintenance alert notifications are enabled. The email will include:

- The truck ID
- The type of maintenance
- The scheduled date

### Daily Report Notifications

If enabled, the application can send daily summary reports via email. These reports include:

- A summary of all trucks and their current status
- Any maintenance events scheduled for the next 7 days
- Any trucks with expiring documents (road tax, insurance, fitness)

## Troubleshooting

If you encounter issues with the email functionality, check the following:

1. Verify that your SMTP server details are correct in the `.env` file
2. Make sure the email server is running (`npm run server`)
3. Check the console for any error messages
4. Try sending a test email from the Settings screen
5. Verify that your SMTP server allows the application to send emails (some providers may block automated emails)

## Security Considerations

- The SMTP password is stored in the `.env` file, which should not be committed to version control
- For production use, consider using environment variables on your hosting platform instead of a `.env` file
- The email server does not implement authentication, so it should only be used in a secure environment

## Technical Details

The email functionality is implemented using the following components:

- `nodemailer` for sending emails
- Express server for handling email requests
- React client for the user interface
- Environment variables for configuration

The code is organized as follows:

- `server.js` - Express server for handling email requests
- `src/services/EmailClient.js` - Client-side service for sending emails
- `src/Screens/Settings/index.js` - Settings screen with email configuration
- `.env` - Environment variables for SMTP configuration
