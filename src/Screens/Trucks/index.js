import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';
import EmailClient from '../../services/EmailClient';
import './Trucks.css';

const Trucks = () => {
  const { statusFilter } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock data for trucks - in a real app, this would come from an API
  const [trucks, setTrucks] = useState([
    {
      id: 1,
      name: 'Truck 001',
      numberPlate: 'ABC 123 ZM',
      status: 'active',
      route: 'Lusaka-Solwezi',
      cargoType: 'Fuel',
      lastUpdate: '10 min ago',
      driver: 'John Smith',
      driverId: 1,
      roadTaxDate: '2023-12-15',
      insuranceDate: '2024-01-20',
      fitnessDate: '2023-11-30',
      comesaExpiryDate: '2023-12-10',
      nextMaintenance: '2023-06-15'
    },
    {
      id: 2,
      name: 'Truck 002',
      numberPlate: 'DEF 456 ZM',
      status: 'maintenance',
      route: 'Service Center',
      cargoType: 'Construction',
      lastUpdate: '2 hours ago',
      driver: 'Emily Johnson',
      driverId: 2,
      roadTaxDate: '2023-10-05',
      insuranceDate: '2023-11-15',
      fitnessDate: '2023-09-20',
      comesaExpiryDate: '2023-10-15',
      nextMaintenance: '2023-05-20'
    },
    {
      id: 3,
      name: 'Truck 003',
      numberPlate: 'GHI 789 ZM',
      status: 'inactive',
      route: 'Warehouse',
      cargoType: 'Agricultural',
      lastUpdate: '1 day ago',
      driver: 'Unassigned',
      driverId: null,
      roadTaxDate: '2024-02-28',
      insuranceDate: '2024-03-15',
      fitnessDate: '2024-01-10',
      comesaExpiryDate: '2024-02-20',
      nextMaintenance: '2023-07-10'
    },
    {
      id: 4,
      name: 'Truck 004',
      numberPlate: 'JKL 012 ZM',
      status: 'active',
      route: 'Ndola-Kitwe',
      cargoType: 'Mining',
      lastUpdate: '5 min ago',
      driver: 'Michael Brown',
      driverId: 3,
      roadTaxDate: '2023-11-10',
      insuranceDate: '2023-12-05',
      fitnessDate: '2023-10-25',
      comesaExpiryDate: '2023-11-05',
      nextMaintenance: '2023-06-30'
    },
    {
      id: 5,
      name: 'Truck 005',
      numberPlate: 'MNO 345 ZM',
      status: 'active',
      route: 'Lusaka-Livingstone',
      cargoType: 'Consumer Goods',
      lastUpdate: '15 min ago',
      driver: 'Sarah Davis',
      driverId: 4,
      roadTaxDate: '2024-01-05',
      insuranceDate: '2023-12-20',
      fitnessDate: '2023-11-15',
      comesaExpiryDate: '2023-12-25',
      nextMaintenance: '2023-06-05'
    },
  ]);

  const [selectedTruck, setSelectedTruck] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
    nextMaintenance: ''
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
      nextMaintenance: ''
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

  const handleAddTruck = () => {
    // Validate form
    if (!newTruck.name || !newTruck.route || !newTruck.numberPlate) {
      toast({
        title: 'Validation Error',
        description: 'Truck ID, Number Plate, and Route are required',
        variant: 'destructive'
      });
      return;
    }

    // Create new truck with ID and lastUpdate
    const newTruckWithId = {
      ...newTruck,
      id: trucks.length + 1,
      lastUpdate: 'Just now'
    };

    // Add the new truck to the list
    setTrucks([...trucks, newTruckWithId]);

    // Show success notification
    toast({
      title: 'Truck Added',
      description: `${newTruck.name} has been added to the fleet`,
      variant: 'success'
    });

    // Close the modal
    closeAddModal();
  };

  const handleUpdateTruck = () => {
    // Validate form
    if (!editTruck.name || !editTruck.route || !editTruck.numberPlate) {
      toast({
        title: 'Validation Error',
        description: 'Truck ID, Number Plate, and Route are required',
        variant: 'destructive'
      });
      return;
    }

    // Update the truck in the list
    const updatedTrucks = trucks.map(truck => {
      if (truck.id === editTruck.id) {
        return {
          ...editTruck,
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
  };

  const handleStatusChange = (id, newStatus) => {
    const updatedTrucks = trucks.map(truck => {
      if (truck.id === id) {
        const oldStatus = truck.status;
        const updatedTruck = { ...truck, status: newStatus };

        // Show notification based on status change
        if (newStatus === 'active') {
          toast({
            title: 'Status Updated',
            description: `${truck.name} is now active`,
            variant: 'success'
          });
        } else if (newStatus === 'maintenance') {
          toast({
            title: 'Status Updated',
            description: `${truck.name} is now in maintenance`,
            variant: 'warning'
          });
        } else if (newStatus === 'inactive') {
          toast({
            title: 'Status Updated',
            description: `${truck.name} is now inactive`,
            variant: 'info'
          });
        }

        // Send email notification if email notifications are enabled
        if (EmailClient.isEnabled && EmailClient.settings.statusChanges) {
          EmailClient.sendStatusChangeEmail({
            to: process.env.REACT_APP_DEFAULT_RECIPIENT,
            truckId: truck.name,
            oldStatus,
            newStatus
          }).then(result => {
            if (result.success) {
              console.log(`Status change email sent for ${truck.name}`);
            } else {
              console.error(`Failed to send status change email for ${truck.name}:`, result.error || result.message);
            }
          }).catch(error => {
            console.error(`Error sending status change email for ${truck.name}:`, error);
          });
        }

        return updatedTruck;
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
          <button className="add-truck-btn" onClick={() => setIsAddModalOpen(true)}>
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

      {(activeFilter && filteredTrucks.length === 0) ? (
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
            <span className="truck-actions">Actions</span>
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
              <span className="truck-driver">{truck.driver}</span>
              <span className="truck-route">{truck.route}</span>
              <span className="truck-cargo">{truck.cargoType}</span>
              <span className="truck-date">{new Date(truck.roadTaxDate).toLocaleDateString()}</span>
              <span className="truck-date">{new Date(truck.insuranceDate).toLocaleDateString()}</span>
              <span className="truck-date">{new Date(truck.fitnessDate).toLocaleDateString()}</span>
              <span className="truck-date">{new Date(truck.comesaExpiryDate).toLocaleDateString()}</span>
              <span className="truck-update">{truck.lastUpdate}</span>
              <span className="truck-actions">
                {/* <button
                  className="view-details-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTruckClick(truck);
                  }}
                >
                  <i className="fas fa-info-circle"></i> Details
                </button> */}
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
    </div>
  );
};

export default Trucks;
