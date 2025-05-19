import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../../components/ui/button';
import { UserPlus } from 'lucide-react';
import AddDriverForm from '../../components/Drivers/AddDriverForm';
import EditDriverForm from '../../components/Drivers/EditDriverForm';
import DriverDetails from '../../components/Drivers/DriverDetails';
import DriverList from '../../components/Drivers/DriverList';

const DriversWithShadcn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock data for drivers - in a real app, this would come from an API
  const [drivers, setDrivers] = useState([
    {
      id: 1,
      name: 'John Smith',
      licenseNumber: 'DL12345678',
      phone: '+260 97 1234567',
      email: 'john.smith@example.com',
      assignedTruck: 'Truck 001',
      truckId: 1,
      status: 'active',
      experience: '5 years',
      address: '123 Main St, Lusaka',
      lastUpdate: '10 min ago'
    },
    {
      id: 2,
      name: 'Emily Johnson',
      licenseNumber: 'DL87654321',
      phone: '+260 97 7654321',
      email: 'emily.johnson@example.com',
      assignedTruck: 'Truck 002',
      truckId: 2,
      status: 'active',
      experience: '3 years',
      address: '456 Park Ave, Ndola',
      lastUpdate: '2 hours ago'
    },
    {
      id: 3,
      name: 'Michael Brown',
      licenseNumber: 'DL23456789',
      phone: '+260 97 2345678',
      email: 'michael.brown@example.com',
      assignedTruck: 'Truck 004',
      truckId: 4,
      status: 'active',
      experience: '7 years',
      address: '789 Oak Rd, Kitwe',
      lastUpdate: '5 min ago'
    },
    {
      id: 4,
      name: 'Sarah Davis',
      licenseNumber: 'DL34567890',
      phone: '+260 97 3456789',
      email: 'sarah.davis@example.com',
      assignedTruck: 'Truck 005',
      truckId: 5,
      status: 'active',
      experience: '4 years',
      address: '101 Pine St, Livingstone',
      lastUpdate: '15 min ago'
    },
    {
      id: 5,
      name: 'David Wilson',
      licenseNumber: 'DL45678901',
      phone: '+260 97 4567890',
      email: 'david.wilson@example.com',
      assignedTruck: null,
      truckId: null,
      status: 'inactive',
      experience: '2 years',
      address: '202 Cedar Ave, Kabwe',
      lastUpdate: '1 day ago'
    }
  ]);

  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editDriver, setEditDriver] = useState(null);
  const handleDriverClick = (driver) => {
    // Navigate to the driver details page
    navigate(`/drivers/${driver.id}`);
  };

  const openEditModal = (driver) => {
    setEditDriver({...driver});
    setIsEditOpen(true);
    setIsDetailsOpen(false);
  };

  const handleAddDriver = (newDriver) => {
    // Create new driver with ID and lastUpdate
    const newDriverWithId = {
      ...newDriver,
      id: drivers.length + 1,
      lastUpdate: 'Just now'
    };

    // Add the new driver to the list
    setDrivers([...drivers, newDriverWithId]);

    // Show success notification
    toast({
      title: 'Driver Added',
      description: `${newDriver.name} has been added to the system`,
      variant: 'success'
    });
  };

  const handleUpdateDriver = (updatedDriver) => {
    // Update the driver in the list
    const updatedDrivers = drivers.map(driver => {
      if (driver.id === updatedDriver.id) {
        return {
          ...updatedDriver,
          lastUpdate: 'Just now'
        };
      }
      return driver;
    });

    // Update the drivers state
    setDrivers(updatedDrivers);

    // Show success notification
    toast({
      title: 'Driver Updated',
      description: `${updatedDriver.name} has been updated`,
      variant: 'success'
    });
  };

  const handleStatusChange = (id, newStatus) => {
    const updatedDrivers = drivers.map(driver => {
      if (driver.id === id) {
        const updatedDriver = { ...driver, status: newStatus };

        // Show notification based on status change
        if (newStatus === 'active') {
          toast.success('Status Updated', `${driver.name} is now active`);
        } else if (newStatus === 'inactive') {
          toast.info('Status Updated', `${driver.name} is now inactive`);
        }

        return updatedDriver;
      }
      return driver;
    });

    setDrivers(updatedDrivers);

    // If the modal is open and we're changing the selected driver's status
    if (selectedDriver && selectedDriver.id === id) {
      setSelectedDriver({ ...selectedDriver, status: newStatus });
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Drivers</h1>
        <Button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" /> Add New Driver
        </Button>
      </div>

      <DriverList
        drivers={drivers}
        onDriverClick={handleDriverClick}
      />

      {/* Driver Details Component */}
      <DriverDetails
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        driver={selectedDriver}
        onEdit={openEditModal}
        onStatusChange={handleStatusChange}
      />

      {/* Add Driver Component */}
      <AddDriverForm
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddDriver={handleAddDriver}
      />

      {/* Edit Driver Component */}
      <EditDriverForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onUpdateDriver={handleUpdateDriver}
        driver={editDriver}
      />
    </div>
  );
};

export default DriversWithShadcn;
