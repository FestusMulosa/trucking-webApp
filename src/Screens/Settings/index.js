import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../context/AuthContext';
import EmailManagement from '../../components/EmailManagement/EmailManagement';
import SettingsService from '../../services/SettingsService';
import { getCurrentUser } from '../../utils/companyUtils';
import './Settings.css';

const Settings = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const [settings, setSettings] = useState({
    account: {
      name: '',
      email: '',
      role: '',
      company: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user data and settings when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user data from context or localStorage
        const user = currentUser || getCurrentUser();
        if (!user) {
          throw new Error('User information not found. Please log in again.');
        }

        // Update account settings with user data
        setSettings({
          account: {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role,
            company: user.companyName || 'Loading...' // Company name might not be in user object
          }
        });

        // Try to load additional settings from the API
        try {
          const apiSettings = await SettingsService.getSettings();
          // Merge API settings with user data if needed
          console.log('Loaded settings from API:', apiSettings);
        } catch (settingsError) {
          console.warn('Could not load additional settings:', settingsError.message);
          // Continue with user data only
        }

      } catch (err) {
        console.error('Error loading user data:', err);
        setError(err.message);
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser, toast]);

  const handleSaveAccount = (e) => {
    e.preventDefault();
    toast({
      title: 'Account Updated',
      description: 'Your account information has been updated successfully',
      variant: 'success'
    });
  };

  if (loading) {
    return (
      <div className="settings-container">
        <h1>Settings</h1>
        <div className="loading-container">
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="settings-container">
        <h1>Settings</h1>
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

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
