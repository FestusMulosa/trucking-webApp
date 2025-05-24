import React, { useState } from 'react';
import { useToast } from '../../hooks/use-toast';
import EmailManagement from '../../components/EmailManagement/EmailManagement';
import './Settings.css';

const Settings = () => {
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    account: {
      name: 'Admin User',
      email: process.env.REACT_APP_DEFAULT_RECIPIENT || 'admin@trucktracker.com',
      role: 'Administrator',
      company: 'TruckTracker Inc.'
    }
  });

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
        {/* Email Management Section */}
        <EmailManagement />

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
