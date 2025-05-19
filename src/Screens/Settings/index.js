import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/use-toast';
import EmailClient from '../../services/EmailClient';
import './Settings.css';

const Settings = () => {
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    notifications: {
      email: EmailClient.isEnabled,
      push: true,
      sms: false,
      maintenanceAlerts: EmailClient.settings.maintenanceAlerts,
      statusChanges: EmailClient.settings.statusChanges,
      dailyReports: EmailClient.settings.dailyReports,
      fuelAlerts: true,
      locationAlerts: false
    },
    email: {
      smtpHost: process.env.REACT_APP_SMTP_HOST || '',
      smtpPort: process.env.REACT_APP_SMTP_PORT || '',
      smtpUser: process.env.REACT_APP_SMTP_USER || '',
      smtpPassword: process.env.REACT_APP_SMTP_PASS || '',
      fromAddress: process.env.REACT_APP_SMTP_FROM || '',
      defaultRecipient: process.env.REACT_APP_DEFAULT_RECIPIENT || ''
    },
    display: {
      darkMode: false,
      compactView: false,
      showMileage: true,
      showFuel: true,
      showDriver: true,
      refreshRate: 5
    },
    account: {
      name: 'Admin User',
      email: process.env.REACT_APP_DEFAULT_RECIPIENT || 'admin@trucktracker.com',
      role: 'Administrator',
      company: 'TruckTracker Inc.'
    }
  });

  // Function to test email service
  const handleTestEmail = async () => {
    toast({
      title: 'Sending Test Email',
      description: 'Attempting to send a test email...',
      variant: 'info'
    });

    try {
      const result = await EmailClient.testEmailService();

      if (result.success) {
        toast({
          title: 'Email Sent',
          description: `Test email sent successfully (ID: ${result.messageId})`,
          variant: 'success'
        });
      } else {
        toast({
          title: 'Email Failed',
          description: `Failed to send test email: ${result.error || 'Unknown error'}`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Email Failed',
        description: `Error sending test email: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const handleNotificationChange = (setting) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [setting]: !settings.notifications[setting]
      }
    });

    const newValue = !settings.notifications[setting];
    toast({
      title: 'Settings Updated',
      description: `${setting} notifications ${newValue ? 'enabled' : 'disabled'}`,
      variant: 'info'
    });
  };

  const handleDisplayChange = (setting) => {
    if (setting === 'refreshRate') return;

    setSettings({
      ...settings,
      display: {
        ...settings.display,
        [setting]: !settings.display[setting]
      }
    });

    const newValue = !settings.display[setting];
    toast({
      title: 'Settings Updated',
      description: `${setting} ${newValue ? 'enabled' : 'disabled'}`,
      variant: 'info'
    });
  };

  const handleRefreshRateChange = (value) => {
    setSettings({
      ...settings,
      display: {
        ...settings.display,
        refreshRate: value
      }
    });

    toast({
      title: 'Settings Updated',
      description: `Refresh rate set to ${value} minutes`,
      variant: 'info'
    });
  };

  const handleEmailSettingChange = (setting, value) => {
    setSettings({
      ...settings,
      email: {
        ...settings.email,
        [setting]: value
      }
    });
  };

  const handleSaveEmailSettings = (e) => {
    e.preventDefault();

    // In a real app, this would update the .env file or save to a database
    // For now, we'll just show a notification
    toast({
      title: 'Email Settings Updated',
      description: 'Email configuration has been updated successfully',
      variant: 'success'
    });

    // Here you would typically restart the email service with the new settings
    // or update environment variables
  };

  const handleSaveAccount = (e) => {
    e.preventDefault();
    toast({
      title: 'Account Updated',
      description: 'Your account information has been updated successfully',
      variant: 'success'
    });
  };

  return (
    <div className="settings-container">
      <h1>Settings</h1>

      <div className="settings-grid">
        <div className="settings-card">
          <h2>Notification Settings</h2>
          <div className="settings-list">
            <div className="settings-item">
              <div className="setting-info">
                <h3>Email Notifications</h3>
                <p>Receive notifications via email</p>
              </div>
              <div className="setting-control">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={() => handleNotificationChange('email')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-item">
              <div className="setting-info">
                <h3>Push Notifications</h3>
                <p>Receive push notifications in browser</p>
              </div>
              <div className="setting-control">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.notifications.push}
                    onChange={() => handleNotificationChange('push')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-item">
              <div className="setting-info">
                <h3>SMS Notifications</h3>
                <p>Receive notifications via SMS</p>
              </div>
              <div className="setting-control">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.notifications.sms}
                    onChange={() => handleNotificationChange('sms')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-item">
              <div className="setting-info">
                <h3>Maintenance Alerts</h3>
                <p>Get alerts for upcoming maintenance</p>
              </div>
              <div className="setting-control">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.notifications.maintenanceAlerts}
                    onChange={() => handleNotificationChange('maintenanceAlerts')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-item">
              <div className="setting-info">
                <h3>Fuel Alerts</h3>
                <p>Get alerts for low fuel levels</p>
              </div>
              <div className="setting-control">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.notifications.fuelAlerts}
                    onChange={() => handleNotificationChange('fuelAlerts')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-item">
              <div className="setting-info">
                <h3>Location Alerts</h3>
                <p>Get alerts when trucks enter/exit geofences</p>
              </div>
              <div className="setting-control">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.notifications.locationAlerts}
                    onChange={() => handleNotificationChange('locationAlerts')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <h2>Display Settings</h2>
          <div className="settings-list">
            <div className="settings-item">
              <div className="setting-info">
                <h3>Dark Mode</h3>
                <p>Use dark theme for the application</p>
              </div>
              <div className="setting-control">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.display.darkMode}
                    onChange={() => handleDisplayChange('darkMode')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-item">
              <div className="setting-info">
                <h3>Compact View</h3>
                <p>Show more items in less space</p>
              </div>
              <div className="setting-control">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.display.compactView}
                    onChange={() => handleDisplayChange('compactView')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-item">
              <div className="setting-info">
                <h3>Show Mileage</h3>
                <p>Display mileage information in truck cards</p>
              </div>
              <div className="setting-control">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.display.showMileage}
                    onChange={() => handleDisplayChange('showMileage')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-item">
              <div className="setting-info">
                <h3>Show Fuel Level</h3>
                <p>Display fuel level information in truck cards</p>
              </div>
              <div className="setting-control">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.display.showFuel}
                    onChange={() => handleDisplayChange('showFuel')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-item">
              <div className="setting-info">
                <h3>Show Driver</h3>
                <p>Display driver information in truck cards</p>
              </div>
              <div className="setting-control">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.display.showDriver}
                    onChange={() => handleDisplayChange('showDriver')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-item">
              <div className="setting-info">
                <h3>Refresh Rate</h3>
                <p>How often to refresh data (in minutes)</p>
              </div>
              <div className="setting-control">
                <select
                  value={settings.display.refreshRate}
                  onChange={(e) => handleRefreshRateChange(parseInt(e.target.value))}
                  className="refresh-select"
                >
                  <option value="1">1 minute</option>
                  <option value="5">5 minutes</option>
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-card email-settings">
          <h2>Email Configuration</h2>
          <form onSubmit={handleSaveEmailSettings}>
            <div className="form-group">
              <label>SMTP Host</label>
              <input
                type="text"
                value={settings.email.smtpHost}
                onChange={(e) => handleEmailSettingChange('smtpHost', e.target.value)}
                placeholder="e.g. smtp.example.com"
              />
            </div>

            <div className="form-group">
              <label>SMTP Port</label>
              <input
                type="text"
                value={settings.email.smtpPort}
                onChange={(e) => handleEmailSettingChange('smtpPort', e.target.value)}
                placeholder="e.g. 587"
              />
            </div>

            <div className="form-group">
              <label>SMTP Username</label>
              <input
                type="text"
                value={settings.email.smtpUser}
                onChange={(e) => handleEmailSettingChange('smtpUser', e.target.value)}
                placeholder="e.g. your-email@example.com"
              />
            </div>

            <div className="form-group">
              <label>SMTP Password</label>
              <input
                type="password"
                value={settings.email.smtpPassword}
                onChange={(e) => handleEmailSettingChange('smtpPassword', e.target.value)}
                placeholder="Your SMTP password"
              />
            </div>

            <div className="form-group">
              <label>From Address</label>
              <input
                type="text"
                value={settings.email.fromAddress}
                onChange={(e) => handleEmailSettingChange('fromAddress', e.target.value)}
                placeholder="e.g. Truck Fleet Tracker <noreply@example.com>"
              />
            </div>

            <div className="form-group">
              <label>Default Recipient</label>
              <input
                type="email"
                value={settings.email.defaultRecipient}
                onChange={(e) => handleEmailSettingChange('defaultRecipient', e.target.value)}
                placeholder="e.g. admin@example.com"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="test-button"
                onClick={handleTestEmail}
              >
                Test Email
              </button>
              <button type="submit" className="save-button">
                Save Configuration
              </button>
            </div>
          </form>

          <div className="email-notification-settings">
            <h3>Email Notification Types</h3>
            <div className="settings-list">
              <div className="settings-item">
                <div className="setting-info">
                  <h4>Status Changes</h4>
                  <p>Send emails when truck status changes</p>
                </div>
                <div className="setting-control">
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.notifications.statusChanges}
                      onChange={() => handleNotificationChange('statusChanges')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="settings-item">
                <div className="setting-info">
                  <h4>Maintenance Alerts</h4>
                  <p>Send emails for upcoming maintenance</p>
                </div>
                <div className="setting-control">
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.notifications.maintenanceAlerts}
                      onChange={() => handleNotificationChange('maintenanceAlerts')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="settings-item">
                <div className="setting-info">
                  <h4>Daily Reports</h4>
                  <p>Send daily summary reports via email</p>
                </div>
                <div className="setting-control">
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.notifications.dailyReports}
                      onChange={() => handleNotificationChange('dailyReports')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-card account-settings">
          <h2>Account Settings</h2>
          <form onSubmit={handleSaveAccount}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={settings.account.name}
                onChange={(e) => setSettings({
                  ...settings,
                  account: { ...settings.account, name: e.target.value }
                })}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={settings.account.email}
                onChange={(e) => setSettings({
                  ...settings,
                  account: { ...settings.account, email: e.target.value }
                })}
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <input
                type="text"
                value={settings.account.role}
                disabled
              />
            </div>

            <div className="form-group">
              <label>Company</label>
              <input
                type="text"
                value={settings.account.company}
                onChange={(e) => setSettings({
                  ...settings,
                  account: { ...settings.account, company: e.target.value }
                })}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="save-button">
                Save Changes
              </button>
              <button
                type="button"
                className="password-button"
                onClick={() => toast.info('Change Password', 'Password change functionality would be implemented here')}
              >
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
