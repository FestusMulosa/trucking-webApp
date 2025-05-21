import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/use-toast';
import TruckService from '../../services/TruckService';
import MaintenanceService from '../../services/MaintenanceService';
import './ScheduleMaintenanceForm.css';

const ScheduleMaintenanceForm = ({ onClose, onSuccess }) => {
  const { toast } = useToast();
  const [trucks, setTrucks] = useState([]);
  const [filteredTrucks, setFilteredTrucks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    truckId: '',
    maintenanceType: 'scheduled',
    description: '',
    startDate: new Date().toISOString().split('T')[0], // Today's date as default
    performedBy: '',
    notes: ''
  });

  // Fetch trucks for the dropdown
  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        setLoading(true);
        const response = await TruckService.getTrucks();
        // Check the structure of the response and extract trucks
        console.log('Trucks response:', response);
        if (response && Array.isArray(response)) {
          setTrucks(response);
        } else if (response && Array.isArray(response.trucks)) {
          setTrucks(response.trucks);
        } else if (response && typeof response === 'object') {
          // Try to find an array in the response
          const possibleTrucksArray = Object.values(response).find(val => Array.isArray(val));
          setTrucks(possibleTrucksArray || []);
        } else {
          setTrucks([]);
        }
      } catch (err) {
        console.error('Error fetching trucks:', err);
        setError('Failed to load trucks. Please try again later.');
        toast({
          title: 'Error',
          description: 'Failed to load trucks',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTrucks();
  }, [toast]);

  // Effect to filter trucks based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTrucks(trucks);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = trucks.filter(truck =>
        truck.name?.toLowerCase().includes(query) ||
        truck.numberPlate?.toLowerCase().includes(query) ||
        truck.make?.toLowerCase().includes(query) ||
        truck.model?.toLowerCase().includes(query)
      );
      setFilteredTrucks(filtered);
    }
  }, [trucks, searchQuery]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.truckId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a truck',
        variant: 'destructive'
      });
      return;
    }

    if (formData.maintenanceType === 'other' && !formData.description) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a description for the maintenance',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.startDate) {
      toast({
        title: 'Validation Error',
        description: 'Please select a start date',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);

      // Prepare the maintenance record
      const maintenanceRecord = {
        ...formData,
        status: 'scheduled'
      };

      // Submit to the API
      await MaintenanceService.createMaintenanceRecord(maintenanceRecord);

      toast({
        title: 'Success',
        description: 'Maintenance has been scheduled successfully',
        variant: 'success'
      });

      // Call the success callback to refresh the list
      if (onSuccess) {
        onSuccess();
      }

      // Close the form
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error('Error scheduling maintenance:', err);
      toast({
        title: 'Error',
        description: 'Failed to schedule maintenance',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="schedule-maintenance-form">
      <h2>Schedule New Maintenance</h2>

      {loading ? (
        <div className="form-loading">Loading trucks...</div>
      ) : error ? (
        <div className="form-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="truckSearch">Search Trucks</label>
            <input
              type="text"
              id="truckSearch"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by name, plate, make or model"
              className="search-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="truckId">Truck</label>
            <select
              id="truckId"
              name="truckId"
              value={formData.truckId}
              onChange={handleChange}
              required
              className="searchable-select"
            >
              <option value="">Select a truck</option>
              {filteredTrucks.map(truck => (
                <option key={truck.id} value={truck.id}>
                  {truck.name} ({truck.numberPlate}) - {truck.make} {truck.model}
                </option>
              ))}
            </select>
            {filteredTrucks.length === 0 && trucks.length > 0 && (
              <p className="no-results">No trucks match your search. Try different keywords.</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="maintenanceType">Maintenance Type</label>
            <select
              id="maintenanceType"
              name="maintenanceType"
              value={formData.maintenanceType}
              onChange={handleChange}
              required
            >
              <option value="scheduled">Scheduled Maintenance</option>
              <option value="repair">Repair</option>
              <option value="inspection">Inspection</option>
              <option value="other">Other</option>
            </select>
          </div>

          {formData.maintenanceType === 'other' && (
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the maintenance"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="startDate">Scheduled Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]} // Can't schedule in the past
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="performedBy">Technician</label>
            <input
              type="text"
              id="performedBy"
              name="performedBy"
              value={formData.performedBy}
              onChange={handleChange}
              placeholder="Who will perform the maintenance"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes or instructions"
              rows="3"
            ></textarea>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={submitting}
            >
              {submitting ? 'Scheduling...' : 'Schedule Maintenance'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ScheduleMaintenanceForm;
