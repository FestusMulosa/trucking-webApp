import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../hooks/use-toast';
import CompanyEmailService from '../../services/CompanyEmailService';
import './EmailManagement.css';

const EmailManagement = () => {
  const { toast } = useToast();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmail, setEditingEmail] = useState(null);
  const [testingEmailId, setTestingEmailId] = useState(null);
  const [formData, setFormData] = useState({
    emailAddress: '',
    emailType: 'notifications',
    isActive: true
  });

  const emailTypes = CompanyEmailService.getEmailTypes();

  const loadEmails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await CompanyEmailService.getCompanyEmails();
      if (response.success) {
        setEmails(response.emails);
      } else {
        throw new Error(response.message || 'Failed to load emails');
      }
    } catch (error) {
      console.error('Error loading emails:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load email addresses',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load emails on component mount
  useEffect(() => {
    loadEmails();
  }, [loadEmails]);

  const handleAddEmail = async (e) => {
    e.preventDefault();

    if (!CompanyEmailService.validateEmail(formData.emailAddress)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await CompanyEmailService.addCompanyEmail(formData);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Email address added successfully',
          variant: 'success'
        });
        setFormData({ emailAddress: '', emailType: 'notifications', isActive: true });
        setShowAddForm(false);
        loadEmails();
      } else {
        throw new Error(response.message || 'Failed to add email');
      }
    } catch (error) {
      console.error('Error adding email:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add email address',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();

    if (!CompanyEmailService.validateEmail(formData.emailAddress)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await CompanyEmailService.updateCompanyEmail(editingEmail.id, formData);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Email address updated successfully',
          variant: 'success'
        });
        setEditingEmail(null);
        setFormData({ emailAddress: '', emailType: 'notifications', isActive: true });
        loadEmails();
      } else {
        throw new Error(response.message || 'Failed to update email');
      }
    } catch (error) {
      console.error('Error updating email:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update email address',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteEmail = async (emailId) => {
    if (!window.confirm('Are you sure you want to delete this email address?')) {
      return;
    }

    try {
      const response = await CompanyEmailService.deleteCompanyEmail(emailId);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Email address deleted successfully',
          variant: 'success'
        });
        loadEmails();
      } else {
        throw new Error(response.message || 'Failed to delete email');
      }
    } catch (error) {
      console.error('Error deleting email:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete email address',
        variant: 'destructive'
      });
    }
  };

  const startEdit = (email) => {
    setEditingEmail(email);
    setFormData({
      emailAddress: email.emailAddress,
      emailType: email.emailType,
      isActive: email.isActive
    });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingEmail(null);
    setFormData({ emailAddress: '', emailType: 'notifications', isActive: true });
  };

  const cancelAdd = () => {
    setShowAddForm(false);
    setFormData({ emailAddress: '', emailType: 'notifications', isActive: true });
  };

  const handleTestEmail = async (email) => {
    if (!email.isActive) {
      toast({
        title: 'Cannot Test Inactive Email',
        description: 'Please activate the email address before testing',
        variant: 'destructive'
      });
      return;
    }

    setTestingEmailId(email.id);

    toast({
      title: 'Sending Test Email',
      description: `Sending test email to ${email.emailAddress}...`,
      variant: 'info'
    });

    try {
      // Use the existing EmailClient to send test email to the specific address
      const result = await fetch(`${process.env.REACT_APP_API_URL || 'https://trucking-server.onrender.com'}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          to: email.emailAddress,
          subject: 'Test Email from Truck Fleet Tracker',
          text: `This is a test email sent to your ${email.emailType} email address (${email.emailAddress}) from the Truck Fleet Tracker system. If you received this email, your email configuration is working correctly.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1f2937;">Test Email from Truck Fleet Tracker</h2>
              <p>This is a test email sent to your <strong>${email.emailType}</strong> email address (<strong>${email.emailAddress}</strong>) from the Truck Fleet Tracker system.</p>
              <p>If you received this email, your email configuration is working correctly.</p>
              <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <h3 style="margin: 0 0 8px 0; color: #374151;">Email Details:</h3>
                <p style="margin: 4px 0;"><strong>Email Address:</strong> ${email.emailAddress}</p>
                <p style="margin: 4px 0;"><strong>Email Type:</strong> ${email.emailType}</p>
                <p style="margin: 4px 0;"><strong>Status:</strong> ${email.isActive ? 'Active' : 'Inactive'}</p>
                <p style="margin: 4px 0;"><strong>Test Date:</strong> ${new Date().toLocaleString()}</p>
              </div>
              <p style="color: #6b7280; font-size: 14px;">This is an automated test message from the Truck Fleet Tracker system. Please do not reply to this email.</p>
            </div>
          `
        })
      });

      const data = await result.json();

      if (data.success) {
        toast({
          title: 'Test Email Sent',
          description: `Test email sent successfully to ${email.emailAddress} (ID: ${data.messageId})`,
          variant: 'success'
        });
      } else {
        throw new Error(data.message || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: 'Test Email Failed',
        description: `Failed to send test email to ${email.emailAddress}: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setTestingEmailId(null);
    }
  };

  const handleTestAllEmails = async () => {
    const activeEmails = emails.filter(email => email.isActive);

    if (activeEmails.length === 0) {
      toast({
        title: 'No Active Emails',
        description: 'There are no active email addresses to test',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Testing All Active Emails',
      description: `Sending test emails to ${activeEmails.length} active email address${activeEmails.length > 1 ? 'es' : ''}...`,
      variant: 'info'
    });

    let successCount = 0;
    let failureCount = 0;

    for (const email of activeEmails) {
      try {
        setTestingEmailId(email.id);

        const result = await fetch(`${process.env.REACT_APP_API_URL || 'https://trucking-server.onrender.com'}/api/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            to: email.emailAddress,
            subject: 'Test Email from Truck Fleet Tracker - Bulk Test',
            text: `This is a bulk test email sent to your ${email.emailType} email address (${email.emailAddress}) from the Truck Fleet Tracker system. If you received this email, your email configuration is working correctly.`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1f2937;">Bulk Test Email from Truck Fleet Tracker</h2>
                <p>This is a bulk test email sent to your <strong>${email.emailType}</strong> email address (<strong>${email.emailAddress}</strong>) from the Truck Fleet Tracker system.</p>
                <p>If you received this email, your email configuration is working correctly.</p>
                <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                  <h3 style="margin: 0 0 8px 0; color: #374151;">Email Details:</h3>
                  <p style="margin: 4px 0;"><strong>Email Address:</strong> ${email.emailAddress}</p>
                  <p style="margin: 4px 0;"><strong>Email Type:</strong> ${email.emailType}</p>
                  <p style="margin: 4px 0;"><strong>Status:</strong> ${email.isActive ? 'Active' : 'Inactive'}</p>
                  <p style="margin: 4px 0;"><strong>Test Date:</strong> ${new Date().toLocaleString()}</p>
                </div>
                <p style="color: #6b7280; font-size: 14px;">This is an automated bulk test message from the Truck Fleet Tracker system. Please do not reply to this email.</p>
              </div>
            `
          })
        });

        const data = await result.json();

        if (data.success) {
          successCount++;
        } else {
          failureCount++;
          console.error(`Failed to send test email to ${email.emailAddress}:`, data.message);
        }
      } catch (error) {
        failureCount++;
        console.error(`Error sending test email to ${email.emailAddress}:`, error);
      }

      // Small delay between emails to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setTestingEmailId(null);

    if (successCount > 0 && failureCount === 0) {
      toast({
        title: 'All Test Emails Sent',
        description: `Successfully sent test emails to all ${successCount} active email address${successCount > 1 ? 'es' : ''}`,
        variant: 'success'
      });
    } else if (successCount > 0 && failureCount > 0) {
      toast({
        title: 'Partial Success',
        description: `Sent ${successCount} test emails successfully, ${failureCount} failed`,
        variant: 'info'
      });
    } else {
      toast({
        title: 'All Test Emails Failed',
        description: `Failed to send test emails to all ${failureCount} email address${failureCount > 1 ? 'es' : ''}`,
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="email-management">
        <h2>Email Management</h2>
        <div className="loading">Loading email addresses...</div>
      </div>
    );
  }

  return (
    <div className="email-management">
      <div className="email-management-header">
        <h2>Email Management</h2>
        <p>Manage up to 5 email addresses for your company</p>
      </div>

      {/* Current Emails List */}
      <div className="emails-list">
        <div className="emails-list-header">
          <h3>Current Email Addresses ({emails.length}/5)</h3>
          {emails.filter(email => email.isActive).length > 0 && (
            <button
              onClick={handleTestAllEmails}
              className="test-all-button"
              disabled={testingEmailId !== null}
            >
              {testingEmailId !== null ? 'Testing...' : 'Test All Active Emails'}
            </button>
          )}
        </div>
        {emails.length === 0 ? (
          <div className="no-emails">
            <p>No email addresses configured yet.</p>
          </div>
        ) : (
          <div className="emails-grid">
            {emails.map((email) => (
              <div key={email.id} className={`email-card ${!email.isActive ? 'inactive' : ''}`}>
                <div className="email-info">
                  <div className="email-address">{email.emailAddress}</div>
                  <div className="email-type">
                    {emailTypes.find(type => type.value === email.emailType)?.label || email.emailType}
                  </div>
                  <div className="email-status">
                    {email.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div className="email-actions">
                  <button
                    onClick={() => handleTestEmail(email)}
                    className="test-button"
                    disabled={testingEmailId === email.id || !email.isActive}
                    title={!email.isActive ? 'Email must be active to test' : 'Send test email'}
                  >
                    {testingEmailId === email.id ? 'Testing...' : 'Test'}
                  </button>
                  <button
                    onClick={() => startEdit(email)}
                    className="edit-button"
                    disabled={editingEmail !== null}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEmail(email.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Email Button */}
      {!showAddForm && !editingEmail && emails.length < 5 && (
        <div className="add-email-section">
          <button
            onClick={() => setShowAddForm(true)}
            className="add-email-button"
          >
            Add New Email Address
          </button>
        </div>
      )}

      {/* Add Email Form */}
      {showAddForm && (
        <div className="email-form">
          <h3>Add New Email Address</h3>
          <form onSubmit={handleAddEmail}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={formData.emailAddress}
                onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                placeholder="Enter email address"
                required
              />
            </div>
            <div className="form-group">
              <label>Email Type</label>
              <select
                value={formData.emailType}
                onChange={(e) => setFormData({ ...formData, emailType: e.target.value })}
              >
                {emailTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                Active
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="save-button">
                Add Email
              </button>
              <button type="button" onClick={cancelAdd} className="cancel-button">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Email Form */}
      {editingEmail && (
        <div className="email-form">
          <h3>Edit Email Address</h3>
          <form onSubmit={handleUpdateEmail}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={formData.emailAddress}
                onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                placeholder="Enter email address"
                required
              />
            </div>
            <div className="form-group">
              <label>Email Type</label>
              <select
                value={formData.emailType}
                onChange={(e) => setFormData({ ...formData, emailType: e.target.value })}
              >
                {emailTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                Active
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="save-button">
                Update Email
              </button>
              <button type="button" onClick={cancelEdit} className="cancel-button">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EmailManagement;
