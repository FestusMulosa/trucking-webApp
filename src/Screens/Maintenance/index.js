import React, { useState } from 'react';
import { useToast } from '../../hooks/use-toast';
import './Maintenance.css';

const Maintenance = () => {
  const { toast } = useToast();

  // Mock data for maintenance records
  const [maintenanceRecords, setMaintenanceRecords] = useState([
    {
      id: 1,
      truckId: 'Truck 001',
      type: 'Routine Check',
      date: '2023-05-10',
      status: 'completed',
      technician: 'Robert Wilson',
      notes: 'Oil change, filter replacement, brake inspection',
      cost: 350
    },
    {
      id: 2,
      truckId: 'Truck 002',
      type: 'Repair',
      date: '2023-05-15',
      status: 'in-progress',
      technician: 'Jennifer Lee',
      notes: 'Transmission issues, needs parts replacement',
      cost: 1200
    },
    {
      id: 3,
      truckId: 'Truck 003',
      type: 'Inspection',
      date: '2023-05-20',
      status: 'scheduled',
      technician: 'Unassigned',
      notes: 'Annual safety inspection',
      cost: 200
    },
    {
      id: 4,
      truckId: 'Truck 004',
      type: 'Tire Replacement',
      date: '2023-05-12',
      status: 'completed',
      technician: 'David Martinez',
      notes: 'Replaced all tires, wheel alignment',
      cost: 800
    },
    {
      id: 5,
      truckId: 'Truck 005',
      type: 'Engine Repair',
      date: '2023-05-25',
      status: 'scheduled',
      technician: 'Unassigned',
      notes: 'Check engine light, diagnostic needed',
      cost: 0
    },
  ]);

  // Scheduled maintenance
  const [scheduledMaintenance, setScheduledMaintenance] = useState([
    {
      id: 101,
      truckId: 'Truck 001',
      type: 'Oil Change',
      date: '2023-06-15',
      priority: 'medium'
    },
    {
      id: 102,
      truckId: 'Truck 003',
      type: 'Full Inspection',
      date: '2023-07-10',
      priority: 'low'
    },
    {
      id: 103,
      truckId: 'Truck 004',
      type: 'Brake Service',
      date: '2023-06-30',
      priority: 'high'
    },
    {
      id: 104,
      truckId: 'Truck 005',
      type: 'Oil Change',
      date: '2023-06-05',
      priority: 'medium'
    },
  ]);

  const [activeTab, setActiveTab] = useState('records');

  const handleCompleteRecord = (id) => {
    const updatedRecords = maintenanceRecords.map(record => {
      if (record.id === id && record.status === 'in-progress') {
        toast({
          title: 'Maintenance Completed',
          description: `${record.truckId} maintenance has been marked as completed`,
          variant: 'success'
        });
        return { ...record, status: 'completed' };
      }
      return record;
    });

    setMaintenanceRecords(updatedRecords);
  };

  const handleCancelScheduled = (id) => {
    const maintenanceToCancel = scheduledMaintenance.find(item => item.id === id);

    if (maintenanceToCancel) {
      toast({
        title: 'Maintenance Cancelled',
        description: `Scheduled maintenance for ${maintenanceToCancel.truckId} has been cancelled`,
        variant: 'warning'
      });
      setScheduledMaintenance(scheduledMaintenance.filter(item => item.id !== id));
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

      {activeTab === 'records' && (
        <div className="maintenance-records">
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
        </div>
      )}

      {activeTab === 'scheduled' && (
        <div className="scheduled-maintenance">
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
