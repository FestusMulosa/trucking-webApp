import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../context/AuthContext';
import EmailClient from '../../services/EmailClient';
import TruckService from '../../services/TruckService';
import DriverAssignmentModal from '../../components/Trucks/DriverAssignmentModal';
import './Trucks.css';

const Trucks = () => {
  const { statusFilter } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout } = useAuth();

  // State for trucks and loading/error status
  const [trucks, setTrucks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch trucks from the API when the component mounts
  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch trucks with optimized parameters
        const data = await TruckService.getTrucks({
          limit: 100, // Fetch more trucks at once to reduce API calls
          includeCompany: false // Don't include company data unless needed
        });

        // Handle both paginated and non-paginated responses
        let trucksArray = [];
        if (data.trucks && Array.isArray(data.trucks)) {
          trucksArray = data.trucks;
        } else if (Array.isArray(data)) {
          trucksArray = data;
        }

        // Format the lastUpdate field for display
        const formattedTrucks = trucksArray.map(truck => {
          // Calculate a human-readable lastUpdate string
          let lastUpdateStr = 'Unknown';
          if (truck.lastUpdate) {
            const lastUpdateDate = new Date(truck.lastUpdate);
            const now = new Date();
            const diffMs = now - lastUpdateDate;
            const diffMins = Math.floor(diffMs / 60000);

            if (diffMins < 60) {
              lastUpdateStr = `${diffMins} min ago`;
            } else if (diffMins < 1440) {
              const hours = Math.floor(diffMins / 60);
              lastUpdateStr = `${hours} hour${hours > 1 ? 's' : ''} ago`;
            } else {
              const days = Math.floor(diffMins / 1440);
              lastUpdateStr = `${days} day${days > 1 ? 's' : ''} ago`;
            }
          }

          // Format driver information
          let driverName = 'Unassigned';
          let driverId = null;
          if (truck.currentDriver) {
            driverName = `${truck.currentDriver.firstName} ${truck.currentDriver.lastName}`;
            driverId = truck.currentDriver.id;
          }

          return {
            ...truck,
            lastUpdate: lastUpdateStr,
            driver: driverName,
            driverId: driverId,
            currentDriverId: truck.currentDriverId
          };
        });

        setTrucks(formattedTrucks);
      } catch (err) {
        console.error('Error fetching trucks:', err);

        // Handle authentication errors
        if (err.message === 'Invalid token' ||
            err.message === 'Authentication required' ||
            err.message === 'Token expired') {

          console.error('Authentication error details:', err);

          toast({
            title: 'Authentication Error',
            description: 'Your session has expired. Please log in again.',
            variant: 'destructive'
          });

          // Log the user out and redirect to login
          logout();
          navigate('/login');
          return;
        }

        setError('Failed to load trucks. Please try again later.');
        toast({
          title: 'Error',
          description: 'Failed to load trucks. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrucks();
  }, []); // Remove dependencies to prevent unnecessary re-fetches

  const [selectedTruck, setSelectedTruck] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDriverAssignmentOpen, setIsDriverAssignmentOpen] = useState(false);
  const [assignmentTruck, setAssignmentTruck] = useState(null);
  const [filteredTrucks, setFilteredTrucks] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [newTruck, setNewTruck] = useState({
    name: '',
    numberPlate: '',
    status: 'inactive',
    route: '',
    cargoType: '',
    driver: '',
    driverId: null,
    roadTaxDate: '',
    insuranceDate: '',
    fitnessDate: '',
    comesaExpiryDate: '',
    nextMaintenance: '',
    companyId: 1 // Set default company ID
  });
  const [editTruck, setEditTruck] = useState(null);

  // Apply filter when statusFilter changes
  useEffect(() => {
    if (statusFilter) {
      // Only show notification if the filter actually changed
      if (activeFilter !== statusFilter) {
        toast({
          title: 'Filter Applied',
          description: `Showing ${statusFilter} trucks only`,
          variant: 'info'
        });
      }

      setActiveFilter(statusFilter);
      const filtered = trucks.filter(truck => truck.status === statusFilter);
      setFilteredTrucks(filtered);
    } else {
      setActiveFilter(null);
      setFilteredTrucks(trucks);
    }
  }, [statusFilter, trucks, toast, activeFilter]);

  const handleTruckClick = (truck) => {
    // Navigate to the truck details page
    navigate(`/trucks/details/${truck.id}`);
  };

  const handleViewMaintenance = (e, truck) => {
    e.stopPropagation(); // Prevent triggering the row click
    // Navigate to the maintenance details page for this truck
    navigate(`/maintenance/truck/${truck.id}`);
  };

  const handleAssignDriver = (e, truck) => {
    e.stopPropagation(); // Prevent triggering the row click
    setAssignmentTruck(truck);
    setIsDriverAssignmentOpen(true);
  };

  const handleDriverAssignmentComplete = () => {
    // Refresh the trucks list after assignment
    const fetchTrucks = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch trucks with optimized parameters
        const data = await TruckService.getTrucks({
          limit: 100, // Fetch more trucks at once to reduce API calls
          includeCompany: false // Don't include company data unless needed
        });

        // Handle both paginated and non-paginated responses
        let trucksArray = [];
        if (data.trucks && Array.isArray(data.trucks)) {
          trucksArray = data.trucks;
        } else if (Array.isArray(data)) {
          trucksArray = data;
        }

        // Format the lastUpdate field for display
        const formattedTrucks = trucksArray.map(truck => {
          // Calculate a human-readable lastUpdate string
          let lastUpdateStr = 'Unknown';
          if (truck.lastUpdate) {
            const lastUpdateDate = new Date(truck.lastUpdate);
            const now = new Date();
            const diffMs = now - lastUpdateDate;
            const diffMins = Math.floor(diffMs / 60000);

            if (diffMins < 60) {
              lastUpdateStr = `${diffMins} min ago`;
            } else if (diffMins < 1440) {
              const hours = Math.floor(diffMins / 60);
              lastUpdateStr = `${hours} hour${hours > 1 ? 's' : ''} ago`;
            } else {
              const days = Math.floor(diffMins / 1440);
              lastUpdateStr = `${days} day${days > 1 ? 's' : ''} ago`;
            }
          }

          // Format driver information
          let driverName = 'Unassigned';
          let driverId = null;
          if (truck.currentDriver) {
            driverName = `${truck.currentDriver.firstName} ${truck.currentDriver.lastName}`;
            driverId = truck.currentDriver.id;
          }

          return {
            ...truck,
            lastUpdate: lastUpdateStr,
            driver: driverName,
            driverId: driverId,
            currentDriverId: truck.currentDriverId
          };
        });

        setTrucks(formattedTrucks);
      } catch (err) {
        console.error('Error fetching trucks:', err);
        setError('Failed to load trucks. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrucks();
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setNewTruck({
      name: '',
      numberPlate: '',
      status: 'inactive',
      route: '',
      cargoType: '',
      driver: '',
      driverId: null,
      roadTaxDate: '',
      insuranceDate: '',
      fitnessDate: '',
      comesaExpiryDate: '',
      nextMaintenance: '',
      companyId: 1 // Set default company ID
    });
  };

  const openEditModal = (truck) => {
    setEditTruck({...truck});
    setIsEditModalOpen(true);
    setIsModalOpen(false);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditTruck(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTruck({
      ...newTruck,
      [name]: value
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditTruck({
      ...editTruck,
      [name]: value
    });
  };

  const handleAddTruck = async () => {
    // Validate form
    if (!newTruck.name || !newTruck.route || !newTruck.numberPlate) {
      toast({
        title: 'Validation Error',
        description: 'Truck ID, Number Plate, and Route are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Set lastUpdate to current date and ensure companyId is set
      const truckToAdd = {
        ...newTruck,
        lastUpdate: new Date().toISOString(),
        companyId: newTruck.companyId || 1
      };

      // Call the API to create the truck
      const createdTruck = await TruckService.createTruck(truckToAdd);

      // Format the lastUpdate for display
      const lastUpdateStr = 'Just now';

      // Add the new truck to the list with formatted lastUpdate
      const truckWithFormattedDate = {
        ...createdTruck,
        lastUpdate: lastUpdateStr
      };

      setTrucks([...trucks, truckWithFormattedDate]);

      // Show success notification
      toast({
        title: 'Truck Added',
        description: `${newTruck.name} has been added to the fleet`,
        variant: 'success'
      });

      // Close the modal
      closeAddModal();
    } catch (error) {
      console.error('Error adding truck:', error);

      // Handle authentication errors
      if (error.message === 'Invalid token' ||
          error.message === 'Authentication required' ||
          error.message === 'Token expired') {

        toast({
          title: 'Authentication Error',
          description: 'Your session has expired. Please log in again.',
          variant: 'destructive'
        });

        // Log the user out and redirect to login
        logout();
        navigate('/login');
        return;
      }

      toast({
        title: 'Error',
        description: `Failed to add truck: ${error.message || 'Unknown error'}`,
        variant: 'destructive'
      });
    }
  };

  const handleUpdateTruck = async () => {
    // Validate form
    if (!editTruck.name || !editTruck.route || !editTruck.numberPlate) {
      toast({
        title: 'Validation Error',
        description: 'Truck ID, Number Plate, and Route are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Set lastUpdate to current date and ensure companyId is set
      const truckToUpdate = {
        ...editTruck,
        lastUpdate: new Date().toISOString(),
        companyId: editTruck.companyId || 1
      };

      // Call the API to update the truck
      await TruckService.updateTruck(editTruck.id, truckToUpdate);

      // Update the truck in the local list
      const updatedTrucks = trucks.map(truck => {
        if (truck.id === editTruck.id) {
          return {
            ...truckToUpdate,
            lastUpdate: 'Just now'
          };
        }
        return truck;
      });

      // Update the trucks state
      setTrucks(updatedTrucks);

      // If we're in a filtered view, update the filtered trucks list
      if (activeFilter) {
        setFilteredTrucks(updatedTrucks.filter(truck => truck.status === activeFilter));
      }

      // Show success notification
      toast({
        title: 'Truck Updated',
        description: `${editTruck.name} has been updated`,
        variant: 'success'
      });

      // Close the modal
      closeEditModal();
    } catch (error) {
      console.error('Error updating truck:', error);

      // Handle authentication errors
      if (error.message === 'Invalid token' ||
          error.message === 'Authentication required' ||
          error.message === 'Token expired') {

        toast({
          title: 'Authentication Error',
          description: 'Your session has expired. Please log in again.',
          variant: 'destructive'
        });

        // Log the user out and redirect to login
        logout();
        navigate('/login');
        return;
      }

      toast({
        title: 'Error',
        description: `Failed to update truck: ${error.message || 'Unknown error'}`,
        variant: 'destructive'
      });
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Find the truck to update
      const truckToUpdate = trucks.find(truck => truck.id === id);
      if (!truckToUpdate) {
        console.error(`Truck with ID ${id} not found`);
        return;
      }

      const oldStatus = truckToUpdate.status;

      // Prepare the update data
      const updateData = {
        ...truckToUpdate,
        status: newStatus,
        lastUpdate: new Date().toISOString(),
        companyId: truckToUpdate.companyId || 1
      };

      // Call the API to update the truck
      await TruckService.updateTruck(id, updateData);

      // Update the local state
      const updatedTrucks = trucks.map(truck => {
        if (truck.id === id) {
          return {
            ...truck,
            status: newStatus,
            lastUpdate: 'Just now'
          };
        }
        return truck;
      });

      setTrucks(updatedTrucks);

      // If the modal is open and we're changing the selected truck's status
      if (selectedTruck && selectedTruck.id === id) {
        setSelectedTruck({ ...selectedTruck, status: newStatus });
      }

      // If we're in a filtered view and the truck's status no longer matches the filter,
      // update the filtered trucks list
      if (activeFilter) {
        setFilteredTrucks(updatedTrucks.filter(truck => truck.status === activeFilter));
      }

      // Show notification based on status change
      if (newStatus === 'active') {
        toast({
          title: 'Status Updated',
          description: `${truckToUpdate.name} is now active`,
          variant: 'success'
        });
      } else if (newStatus === 'maintenance') {
        toast({
          title: 'Status Updated',
          description: `${truckToUpdate.name} is now in maintenance`,
          variant: 'warning'
        });
      } else if (newStatus === 'inactive') {
        toast({
          title: 'Status Updated',
          description: `${truckToUpdate.name} is now inactive`,
          variant: 'info'
        });
      }

      // Send email notification if email notifications are enabled
      if (EmailClient.isEnabled && EmailClient.settings.statusChanges) {
        EmailClient.sendStatusChangeEmail({
          to: process.env.REACT_APP_DEFAULT_RECIPIENT,
          truckId: truckToUpdate.name,
          oldStatus,
          newStatus
        }).then(result => {
          if (result.success) {
            console.log(`Status change email sent for ${truckToUpdate.name}`);
          } else {
            console.error(`Failed to send status change email for ${truckToUpdate.name}:`, result.error || result.message);
          }
        }).catch(error => {
          console.error(`Error sending status change email for ${truckToUpdate.name}:`, error);
        });
      }
    } catch (error) {
      console.error('Error updating truck status:', error);

      // Handle authentication errors
      if (error.message === 'Invalid token' ||
          error.message === 'Authentication required' ||
          error.message === 'Token expired') {

        toast({
          title: 'Authentication Error',
          description: 'Your session has expired. Please log in again.',
          variant: 'destructive'
        });

        // Log the user out and redirect to login
        logout();
        navigate('/login');
        return;
      }

      toast({
        title: 'Error',
        description: `Failed to update truck status: ${error.message || 'Unknown error'}`,
        variant: 'destructive'
      });
    }
  };

  // Function to clear the active filter
  const clearFilter = () => {
    navigate('/trucks');
  };

  return (
    <div className="trucks-container">
      <div className="trucks-header">
        <div className="trucks-title">
          <h1>Truck Fleet</h1>
          <button
            className="add-truck-btn"
            onClick={() => setIsAddModalOpen(true)}
            disabled={isLoading}
          >
            <i className="fas fa-plus"></i> Add New Truck
          </button>
        </div>

        {activeFilter && (
          <div className="active-filter">
            <span className={`filter-badge ${activeFilter}`}>
              {activeFilter} trucks
            </span>
            <button className="clear-filter-btn" onClick={clearFilter}>
              <i className="fas fa-times"></i> Clear Filter
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading trucks...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : (activeFilter && filteredTrucks.length === 0) ? (
        <div className="no-trucks-message">
          <i className="fas fa-truck"></i>
          <p>No {activeFilter} trucks found</p>
          <button className="clear-filter-btn" onClick={clearFilter}>
            View All Trucks
          </button>
        </div>
      ) : (
        <div className="truck-list">
          <div className="truck-list-header">
            <span className="truck-name">Truck ID</span>
            <span className="truck-plate">Number Plate</span>
            <span className="truck-status">Status</span>
            <span className="truck-driver">Driver</span>
            <span className="truck-route">Route</span>
            <span className="truck-cargo">Cargo Type</span>
            <span className="truck-date">Road Tax</span>
            <span className="truck-date">Insurance</span>
            <span className="truck-date">Fitness</span>
            <span className="truck-date">COMESA</span>
            <span className="truck-update">Last Update</span>
          </div>
          {(activeFilter ? filteredTrucks : trucks).map(truck => (
            <div
              key={truck.id}
              className={`truck-list-item ${truck.status}`}
              onClick={() => handleTruckClick(truck)}
            >
              <span className="truck-name">{truck.name}</span>
              <span className="truck-plate">{truck.numberPlate}</span>
              <span className="truck-status">
                <span className={`status-badge ${truck.status}`}>
                  {truck.status}
                </span>
              </span>
              <span className="truck-driver">{truck.driver || 'Unassigned'}</span>
              <span className="truck-route">{truck.route || 'N/A'}</span>
              <span className="truck-cargo">{truck.cargoType || 'N/A'}</span>
              <span className="truck-date">{truck.roadTaxDate ? new Date(truck.roadTaxDate).toLocaleDateString() : 'N/A'}</span>
              <span className="truck-date">{truck.insuranceDate ? new Date(truck.insuranceDate).toLocaleDateString() : 'N/A'}</span>
              <span className="truck-date">{truck.fitnessDate ? new Date(truck.fitnessDate).toLocaleDateString() : 'N/A'}</span>
              <span className="truck-date">{truck.comesaExpiryDate ? new Date(truck.comesaExpiryDate).toLocaleDateString() : 'N/A'}</span>
              <span className="truck-update">{truck.lastUpdate}</span>
              <span className="truck-actions">
                <button
                  className="assign-driver-btn"
                  onClick={(e) => handleAssignDriver(e, truck)}
                  title="Assign Driver"
                >
                  <i className="fas fa-user-plus"></i>
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && selectedTruck && (
        <div className="modal-overlay">
          <div className="truck-modal">
            <div className="modal-header">
              <h2>{selectedTruck.name}</h2>
              <div className="modal-actions">
                <button className="edit-button" onClick={() => openEditModal(selectedTruck)}>
                  <i className="fas fa-edit"></i> Edit
                </button>
                <button className="close-button" onClick={closeModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div className="modal-content">
              <div className="truck-details">
                <div className="detail-group">
                  <h3>Status</h3>
                  <div className="status-controls">
                    <button
                      className={`status-button active ${selectedTruck.status === 'active' ? 'selected' : ''}`}
                      onClick={() => handleStatusChange(selectedTruck.id, 'active')}
                    >
                      Active
                    </button>
                    <button
                      className={`status-button maintenance ${selectedTruck.status === 'maintenance' ? 'selected' : ''}`}
                      onClick={() => handleStatusChange(selectedTruck.id, 'maintenance')}
                    >
                      Maintenance
                    </button>
                    <button
                      className={`status-button inactive ${selectedTruck.status === 'inactive' ? 'selected' : ''}`}
                      onClick={() => handleStatusChange(selectedTruck.id, 'inactive')}
                    >
                      Inactive
                    </button>
                  </div>
                </div>

                <div className="detail-group">
                  <h3>Number Plate</h3>
                  <p>{selectedTruck.numberPlate}</p>
                </div>

                <div className="detail-group">
                  <h3>Driver</h3>
                  <p>{selectedTruck.driver}</p>
                </div>

                <div className="detail-group">
                  <h3>Route</h3>
                  <p>{selectedTruck.route}</p>
                </div>

                <div className="detail-group">
                  <h3>Cargo Type</h3>
                  <p>{selectedTruck.cargoType}</p>
                </div>

                <div className="detail-group">
                  <h3>Road Tax Expiry</h3>
                  <p>{new Date(selectedTruck.roadTaxDate).toLocaleDateString()}</p>
                </div>

                <div className="detail-group">
                  <h3>Insurance Expiry</h3>
                  <p>{new Date(selectedTruck.insuranceDate).toLocaleDateString()}</p>
                </div>

                <div className="detail-group">
                  <h3>Fitness Expiry</h3>
                  <p>{new Date(selectedTruck.fitnessDate).toLocaleDateString()}</p>
                </div>

                <div className="detail-group">
                  <h3>COMESA Expiry</h3>
                  <p>{new Date(selectedTruck.comesaExpiryDate).toLocaleDateString()}</p>
                </div>

                <div className="detail-group">
                  <h3>Next Maintenance</h3>
                  <p>{new Date(selectedTruck.nextMaintenance).toLocaleDateString()}</p>
                </div>

                <div className="detail-group">
                  <h3>Last Update</h3>
                  <p>{selectedTruck.lastUpdate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Truck Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="truck-modal">
            <div className="modal-header">
              <h2>Add New Truck</h2>
              <button className="close-button" onClick={closeAddModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-content">
              <form className="add-truck-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Truck ID*</label>
                    <input
                      type="text"
                      name="name"
                      value={newTruck.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Truck 006"
                    />
                  </div>
                  <div className="form-group">
                    <label>Number Plate*</label>
                    <input
                      type="text"
                      name="numberPlate"
                      value={newTruck.numberPlate}
                      onChange={handleInputChange}
                      placeholder="e.g. ABC 123 ZM"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={newTruck.status}
                      onChange={handleInputChange}
                    >
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Route*</label>
                    <input
                      type="text"
                      name="route"
                      value={newTruck.route}
                      onChange={handleInputChange}
                      placeholder="e.g. Lusaka-Ndola"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Driver</label>
                    <input
                      type="text"
                      name="driver"
                      value={newTruck.driver}
                      onChange={handleInputChange}
                      placeholder="Driver name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Cargo Type</label>
                    <input
                      type="text"
                      name="cargoType"
                      value={newTruck.cargoType}
                      onChange={handleInputChange}
                      placeholder="e.g. Fuel"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Road Tax Expiry</label>
                    <input
                      type="date"
                      name="roadTaxDate"
                      value={newTruck.roadTaxDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Insurance Expiry</label>
                    <input
                      type="date"
                      name="insuranceDate"
                      value={newTruck.insuranceDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Fitness Expiry</label>
                    <input
                      type="date"
                      name="fitnessDate"
                      value={newTruck.fitnessDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>COMESA Expiry</label>
                    <input
                      type="date"
                      name="comesaExpiryDate"
                      value={newTruck.comesaExpiryDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Next Maintenance</label>
                    <input
                      type="date"
                      name="nextMaintenance"
                      value={newTruck.nextMaintenance}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    {/* Empty for layout balance */}
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={closeAddModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="save-button"
                    onClick={handleAddTruck}
                  >
                    Add Truck
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Truck Modal */}
      {isEditModalOpen && editTruck && (
        <div className="modal-overlay">
          <div className="truck-modal">
            <div className="modal-header">
              <h2>Edit Truck: {editTruck.name}</h2>
              <button className="close-button" onClick={closeEditModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-content">
              <form className="add-truck-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Truck ID*</label>
                    <input
                      type="text"
                      name="name"
                      value={editTruck.name}
                      onChange={handleEditInputChange}
                      placeholder="e.g. Truck 006"
                    />
                  </div>
                  <div className="form-group">
                    <label>Number Plate*</label>
                    <input
                      type="text"
                      name="numberPlate"
                      value={editTruck.numberPlate}
                      onChange={handleEditInputChange}
                      placeholder="e.g. ABC 123 ZM"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={editTruck.status}
                      onChange={handleEditInputChange}
                    >
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Route*</label>
                    <input
                      type="text"
                      name="route"
                      value={editTruck.route}
                      onChange={handleEditInputChange}
                      placeholder="e.g. Lusaka-Ndola"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Driver</label>
                    <input
                      type="text"
                      name="driver"
                      value={editTruck.driver}
                      onChange={handleEditInputChange}
                      placeholder="Driver name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Cargo Type</label>
                    <input
                      type="text"
                      name="cargoType"
                      value={editTruck.cargoType}
                      onChange={handleEditInputChange}
                      placeholder="e.g. Fuel"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Road Tax Expiry</label>
                    <input
                      type="date"
                      name="roadTaxDate"
                      value={editTruck.roadTaxDate}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Insurance Expiry</label>
                    <input
                      type="date"
                      name="insuranceDate"
                      value={editTruck.insuranceDate}
                      onChange={handleEditInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Fitness Expiry</label>
                    <input
                      type="date"
                      name="fitnessDate"
                      value={editTruck.fitnessDate}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>COMESA Expiry</label>
                    <input
                      type="date"
                      name="comesaExpiryDate"
                      value={editTruck.comesaExpiryDate}
                      onChange={handleEditInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Next Maintenance</label>
                    <input
                      type="date"
                      name="nextMaintenance"
                      value={editTruck.nextMaintenance}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  <div className="form-group">
                    {/* Empty for layout balance */}
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={closeEditModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="save-button"
                    onClick={handleUpdateTruck}
                  >
                    Update Truck
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Driver Assignment Modal */}
      <DriverAssignmentModal
        isOpen={isDriverAssignmentOpen}
        onClose={() => setIsDriverAssignmentOpen(false)}
        truck={assignmentTruck}
        onAssignmentComplete={handleDriverAssignmentComplete}
      />
    </div>
  );
};

export default Trucks;
