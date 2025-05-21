import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/use-toast';
import MaintenanceService from '../../services/MaintenanceService';
import './Maintenance.css';

const Maintenance = () => {
  const { toast } = useToast();

  // State for maintenance records
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [scheduledMaintenance, setScheduledMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch maintenance records from the API
  useEffect(() => {
    const fetchMaintenanceRecords = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all maintenance records
        const records = await MaintenanceService.getMaintenanceRecords();

        // Process the records
        const completedAndInProgress = [];
        const scheduled = [];

        records.forEach(record => {
          // Map database fields to UI fields
          const uiRecord = {
            id: record.id,
            truckId: record.truck ? record.truck.name : `Truck ${record.truckId}`,
            type: record.maintenanceType === 'other' ? record.description : record.maintenanceType,
            date: record.startDate,
            status: record.status === 'in_progress' ? 'in-progress' : record.status,
            technician: record.performedBy || 'Unassigned',
            notes: record.notes || '',
            cost: record.cost || 0
          };

          // Separate records into completed/in-progress and scheduled
          if (record.status === 'scheduled') {
            // Determine priority based on date proximity
            const today = new Date();
            const scheduledDate = new Date(record.startDate);
            const daysDifference = Math.ceil((scheduledDate - today) / (1000 * 60 * 60 * 24));

            let priority = 'medium';
            if (daysDifference <= 7) {
              priority = 'high';
            } else if (daysDifference > 30) {
              priority = 'low';
            }

            scheduled.push({
              ...uiRecord,
              priority
            });
          } else {
            completedAndInProgress.push(uiRecord);
          }
        });

        setMaintenanceRecords(completedAndInProgress);
        setScheduledMaintenance(scheduled);
      } catch (err) {
        console.error('Error fetching maintenance records:', err);
        setError('Failed to load maintenance records. Please try again later.');
        toast({
          title: 'Error',
          description: 'Failed to load maintenance records',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenanceRecords();
  }, [toast]);

  const [activeTab, setActiveTab] = useState('records');

  const handleCompleteRecord = async (id) => {
    try {
      const record = maintenanceRecords.find(r => r.id === id);

      if (record && record.status === 'in-progress') {
        // Update the record in the database
        await MaintenanceService.updateMaintenanceRecord(id, {
          status: 'completed',
          endDate: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
        });

        // Update the local state
        const updatedRecords = maintenanceRecords.map(r => {
          if (r.id === id) {
            toast({
              title: 'Maintenance Completed',
              description: `${r.truckId} maintenance has been marked as completed`,
              variant: 'success'
            });
            return { ...r, status: 'completed' };
          }
          return r;
        });

        setMaintenanceRecords(updatedRecords);
      }
    } catch (err) {
      console.error('Error completing maintenance record:', err);
      toast({
        title: 'Error',
        description: 'Failed to complete maintenance record',
        variant: 'destructive'
      });
    }
  };

  const handleCancelScheduled = async (id) => {
    try {
      const maintenanceToCancel = scheduledMaintenance.find(item => item.id === id);

      if (maintenanceToCancel) {
        // Update the record in the database
        await MaintenanceService.updateMaintenanceRecord(id, {
          status: 'cancelled'
        });

        toast({
          title: 'Maintenance Cancelled',
          description: `Scheduled maintenance for ${maintenanceToCancel.truckId} has been cancelled`,
          variant: 'warning'
        });

        // Update the local state
        setScheduledMaintenance(scheduledMaintenance.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error('Error cancelling maintenance record:', err);
      toast({
        title: 'Error',
        description: 'Failed to cancel maintenance record',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="maintenance-container">
      <h1>Maintenance Management</h1>

      <div className="maintenance-tabs">
        <button
          className={`tab-button ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          Maintenance Records
        </button>
        <button
          className={`tab-button ${activeTab === 'scheduled' ? 'active' : ''}`}
          onClick={() => setActiveTab('scheduled')}
        >
          Scheduled Maintenance
        </button>
      </div>

      {loading && (
        <div className="loading-container">
          <p>Loading maintenance records...</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button
            className="retry-button"
            onClick={() => {
              setLoading(true);
              setError(null);
              MaintenanceService.getMaintenanceRecords()
                .then(records => {
                  // Process records (same logic as in useEffect)
                  const completedAndInProgress = [];
                  const scheduled = [];

                  records.forEach(record => {
                    const uiRecord = {
                      id: record.id,
                      truckId: record.truck ? record.truck.name : `Truck ${record.truckId}`,
                      type: record.maintenanceType === 'other' ? record.description : record.maintenanceType,
                      date: record.startDate,
                      status: record.status === 'in_progress' ? 'in-progress' : record.status,
                      technician: record.performedBy || 'Unassigned',
                      notes: record.notes || '',
                      cost: record.cost || 0
                    };

                    if (record.status === 'scheduled') {
                      const today = new Date();
                      const scheduledDate = new Date(record.startDate);
                      const daysDifference = Math.ceil((scheduledDate - today) / (1000 * 60 * 60 * 24));

                      let priority = 'medium';
                      if (daysDifference <= 7) {
                        priority = 'high';
                      } else if (daysDifference > 30) {
                        priority = 'low';
                      }

                      scheduled.push({
                        ...uiRecord,
                        priority
                      });
                    } else {
                      completedAndInProgress.push(uiRecord);
                    }
                  });

                  setMaintenanceRecords(completedAndInProgress);
                  setScheduledMaintenance(scheduled);
                  setLoading(false);
                })
                .catch(err => {
                  console.error('Error retrying fetch:', err);
                  setError('Failed to load maintenance records. Please try again later.');
                  setLoading(false);
                });
            }}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && activeTab === 'records' && (
        <div className="maintenance-records">
          {maintenanceRecords.length === 0 ? (
            <p className="no-records-message">No maintenance records found.</p>
          ) : (
            <table className="maintenance-table">
              <thead>
                <tr>
                  <th>Truck</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Technician</th>
                  <th>Cost</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceRecords.map(record => (
                  <tr key={record.id} className={`status-${record.status}`}>
                    <td>{record.truckId}</td>
                    <td>{record.type}</td>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${record.status}`}>
                        {record.status}
                      </span>
                    </td>
                    <td>{record.technician}</td>
                    <td>${record.cost.toLocaleString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="view-button"
                          onClick={() => toast({
                            title: 'Maintenance Details',
                            description: `Viewing details for ${record.truckId} ${record.type}`,
                            variant: 'info'
                          })}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        {record.status === 'in-progress' && (
                          <button
                            className="complete-button"
                            onClick={() => handleCompleteRecord(record.id)}
                          >
                            <i className="fas fa-check"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {!loading && !error && activeTab === 'scheduled' && (
        <div className="scheduled-maintenance">
          {scheduledMaintenance.length === 0 ? (
            <p className="no-records-message">No scheduled maintenance found.</p>
          ) : (
            <table className="maintenance-table">
              <thead>
                <tr>
                  <th>Truck</th>
                  <th>Type</th>
                  <th>Scheduled Date</th>
                  <th>Priority</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scheduledMaintenance.map(item => (
                  <tr key={item.id} className={`priority-${item.priority}`}>
                    <td>{item.truckId}</td>
                    <td>{item.type}</td>
                    <td>{new Date(item.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`priority-badge ${item.priority}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-button"
                          onClick={() => toast({
                            title: 'Edit Maintenance',
                            description: `Editing scheduled maintenance for ${item.truckId}`,
                            variant: 'info'
                          })}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleCancelScheduled(item.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <button
            className="add-maintenance-button"
            onClick={() => toast({
              title: 'New Maintenance',
              description: 'Creating new scheduled maintenance',
              variant: 'info'
            })}
          >
            <i className="fas fa-plus"></i> Schedule New Maintenance
          </button>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
