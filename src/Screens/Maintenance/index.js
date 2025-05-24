import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../context/AuthContext';
import MaintenanceService from '../../services/MaintenanceService';
import TruckService from '../../services/TruckService';
import { getCurrentUser } from '../../utils/companyUtils';
import ScheduleMaintenanceForm from './ScheduleMaintenanceForm';
import './Maintenance.css';

const Maintenance = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout, currentUser } = useAuth();

  // State for maintenance records
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [scheduledMaintenance, setScheduledMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the schedule maintenance modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Helper function to extract truck ID from a maintenance record
  const extractTruckId = (record) => {
    const truckIdMatch = record.truckId.match(/Truck (\d+)/);
    return record.truck ? record.truck.id : (truckIdMatch ? truckIdMatch[1] : null);
  };

  // Fetch maintenance records from the API
  useEffect(() => {
    const fetchMaintenanceRecords = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user is logged in and has company information
        const user = currentUser || getCurrentUser();
        if (!user) {
          console.log('No user logged in, redirecting to login page');
          navigate('/login');
          return;
        }

        if (!user.companyId) {
          console.error('User has no company ID, redirecting to login');
          toast({
            title: 'Account Error',
            description: 'Your account is not associated with a company. Please contact support.',
            variant: 'destructive'
          });
          logout();
          navigate('/login');
          return;
        }

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
        // Extract the truck ID from the record
        const truckId = extractTruckId(record);

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
              description: `${r.truckId} maintenance has been marked as completed and truck status set to inactive`,
              variant: 'success'
            });
            return { ...r, status: 'completed' };
          }
          return r;
        });

        setMaintenanceRecords(updatedRecords);

        // If we have a truck ID, ensure its status is set to inactive
        if (truckId) {
          try {
            // Get the current truck data
            const truckData = await TruckService.getTruck(truckId);

            // If the truck is not already inactive, update it
            if (truckData.status !== 'inactive') {
              await TruckService.updateTruck(truckId, {
                ...truckData,
                status: 'inactive'
              });
            }
          } catch (truckError) {
            // Silently handle error - the server-side update should have worked
          }
        }
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

  const handleStartMaintenance = async (id) => {
    try {
      const maintenanceToStart = scheduledMaintenance.find(item => item.id === id);

      if (maintenanceToStart) {
        // Extract the truck ID from the record
        const truckId = extractTruckId(maintenanceToStart);

        // Update the record in the database
        await MaintenanceService.updateMaintenanceRecord(id, {
          status: 'in_progress',
          startDate: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
        });

        toast({
          title: 'Maintenance Started',
          description: `Scheduled maintenance for ${maintenanceToStart.truckId} has been started`,
          variant: 'success'
        });

        // Update the local state
        setScheduledMaintenance(scheduledMaintenance.filter(item => item.id !== id));

        // If we have a truck ID, update its status to maintenance
        if (truckId) {
          try {
            // Get the current truck data
            const truckData = await TruckService.getTruck(truckId);

            // Update the truck status to maintenance
            await TruckService.updateTruck(truckId, {
              ...truckData,
              status: 'maintenance'
            });
          } catch (truckError) {
            console.error('Error updating truck status:', truckError);
            // Continue anyway - the maintenance record has been updated
          }
        }

        // Refresh the maintenance records to show the new in-progress record
        setLoading(true);
        MaintenanceService.getMaintenanceRecords()
          .then(records => {
            // Process the records (same logic as in useEffect)
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
            console.error('Error fetching maintenance records:', err);
            setError('Failed to load maintenance records. Please try again later.');
            setLoading(false);
          });
      }
    } catch (err) {
      console.error('Error starting maintenance record:', err);
      toast({
        title: 'Error',
        description: 'Failed to start maintenance record',
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
                          onClick={() => {
                            // Extract the truck ID from the record
                            const truckId = extractTruckId(record);

                            if (truckId) {
                              navigate(`/maintenance/truck/${truckId}`);
                            } else {
                              toast({
                                title: 'Error',
                                description: 'Could not determine truck ID',
                                variant: 'destructive'
                              });
                            }
                          }}
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
                          className="view-button"
                          onClick={() => {
                            // Extract the truck ID from the record
                            const truckId = extractTruckId(item);

                            if (truckId) {
                              navigate(`/maintenance/truck/${truckId}`);
                            } else {
                              toast({
                                title: 'Error',
                                description: 'Could not determine truck ID',
                                variant: 'destructive'
                              });
                            }
                          }}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="edit-button"
                          onClick={() => handleStartMaintenance(item.id)}
                          title="Start Maintenance"
                        >
                          <i className="fas fa-play"></i>
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleCancelScheduled(item.id)}
                          title="Cancel Maintenance"
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
            onClick={() => setShowScheduleModal(true)}
          >
            <i className="fas fa-plus"></i> Schedule New Maintenance
          </button>
        </div>
      )}

      {/* Schedule Maintenance Modal */}
      {showScheduleModal && (
        <div className="modal-overlay">
          <ScheduleMaintenanceForm
            onClose={() => setShowScheduleModal(false)}
            onSuccess={() => {
              // Refresh the maintenance records
              setLoading(true);
              MaintenanceService.getMaintenanceRecords()
                .then(records => {
                  // Process the records (same logic as in useEffect)
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
                  console.error('Error fetching maintenance records:', err);
                  setError('Failed to load maintenance records. Please try again later.');
                  setLoading(false);
                });
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Maintenance;
