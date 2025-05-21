import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';
import MaintenanceService from '../../services/MaintenanceService';
import TruckService from '../../services/TruckService';
import './MaintenanceDetails.css';

const MaintenanceDetails = () => {
  const { truckId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State for truck and maintenance records
  const [truck, setTruck] = useState(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch truck and maintenance data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch truck details
        const truckData = await TruckService.getTruck(truckId);
        setTruck(truckData);

        // Fetch maintenance records for this truck
        const records = await MaintenanceService.getMaintenanceRecords({ truckId });

        // Process the records
        const processedRecords = records.map(record => ({
          id: record.id,
          truckId: record.truck ? record.truck.name : `Truck ${record.truckId}`,
          type: record.maintenanceType === 'other' ? record.description : record.maintenanceType,
          date: record.startDate,
          status: record.status === 'in_progress' ? 'in-progress' : record.status,
          technician: record.performedBy || 'Unassigned',
          notes: record.notes || '',
          cost: record.cost || 0,
          endDate: record.endDate
        }));

        setMaintenanceRecords(processedRecords);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load truck maintenance details. Please try again later.');
        toast({
          title: 'Error',
          description: 'Failed to load maintenance details',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [truckId, toast]);

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
              description: `${r.truckId} maintenance has been marked as completed and truck status set to inactive`,
              variant: 'success'
            });
            return { ...r, status: 'completed' };
          }
          return r;
        });

        setMaintenanceRecords(updatedRecords);

        // Refresh truck data to get the updated status from the server
        try {
          const refreshedTruckData = await TruckService.getTruck(truckId);
          setTruck(refreshedTruckData);

          // Double-check if the status is now inactive
          if (refreshedTruckData.status !== 'inactive') {
            // Force update the truck status if it's not inactive
            await TruckService.updateTruck(truckId, {
              ...refreshedTruckData,
              status: 'inactive'
            });

            toast({
              title: 'Truck Status Updated',
              description: `${refreshedTruckData.name} status has been set to inactive`,
              variant: 'info'
            });

            // Refresh the truck data again
            const finalTruckData = await TruckService.getTruck(truckId);
            setTruck(finalTruckData);
          }
        } catch (refreshError) {
          // Silently handle error - the server-side update should have worked
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
      const maintenanceToCancel = maintenanceRecords.find(item => item.id === id);

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
        const updatedRecords = maintenanceRecords.map(r => {
          if (r.id === id) {
            return { ...r, status: 'cancelled' };
          }
          return r;
        });

        setMaintenanceRecords(updatedRecords);
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

  // Filter records based on active tab
  const filteredRecords = maintenanceRecords.filter(record => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return record.status === 'in-progress';
    if (activeTab === 'completed') return record.status === 'completed';
    if (activeTab === 'scheduled') return record.status === 'scheduled';
    if (activeTab === 'cancelled') return record.status === 'cancelled';
    return true;
  });

  return (
    <div className="maintenance-details-container">
      <div className="maintenance-details-header">
        <button className="back-button" onClick={() => navigate('/trucks')}>
          <i className="fas fa-arrow-left"></i> Back to Trucks
        </button>
        <h1>
          {truck ? `Maintenance History: ${truck.name}` : 'Truck Maintenance History'}
        </h1>
        <button
          className="add-maintenance-button"
          onClick={() => toast({
            title: 'New Maintenance',
            description: 'Creating new maintenance record',
            variant: 'info'
          })}
        >
          <i className="fas fa-plus"></i> Add Maintenance
        </button>
      </div>

      {truck && (
        <div className="truck-summary">
          <div className="truck-info">
            <span className="truck-name">{truck.name}</span>
            <span className="truck-plate">{truck.numberPlate}</span>
            <span className={`truck-status ${truck.status}`}>{truck.status}</span>
          </div>
          <div className="truck-details">
            <div className="detail-item">
              <span className="detail-label">Make/Model:</span>
              <span className="detail-value">{truck.make} {truck.model}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Driver:</span>
              <span className="detail-value">{truck.driver || 'Unassigned'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Last Update:</span>
              <span className="detail-value">{truck.lastUpdate}</span>
            </div>
          </div>
        </div>
      )}

      <div className="maintenance-tabs">
        <button
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Records
        </button>
        <button
          className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active
        </button>
        <button
          className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
        <button
          className={`tab-button ${activeTab === 'scheduled' ? 'active' : ''}`}
          onClick={() => setActiveTab('scheduled')}
        >
          Scheduled
        </button>
        <button
          className={`tab-button ${activeTab === 'cancelled' ? 'active' : ''}`}
          onClick={() => setActiveTab('cancelled')}
        >
          Cancelled
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
            onClick={() => navigate(0)} // Refresh the page
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="maintenance-records">
          {filteredRecords.length === 0 ? (
            <p className="no-records-message">No maintenance records found.</p>
          ) : (
            <table className="maintenance-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Technician</th>
                  <th>Cost</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(record => (
                  <tr key={record.id} className={`status-${record.status}`}>
                    <td>{record.type}</td>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>{record.endDate ? new Date(record.endDate).toLocaleDateString() : '-'}</td>
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
                            description: `Viewing details for ${record.type}`,
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
                        {record.status === 'scheduled' && (
                          <button
                            className="delete-button"
                            onClick={() => handleCancelScheduled(record.id)}
                          >
                            <i className="fas fa-times"></i>
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
    </div>
  );
};

export default MaintenanceDetails;
