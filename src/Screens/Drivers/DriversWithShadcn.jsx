import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../../components/ui/button';
import { UserPlus, RefreshCw } from 'lucide-react';
import AddDriverForm from '../../components/Drivers/AddDriverForm';
import EditDriverForm from '../../components/Drivers/EditDriverForm';
import DriverDetails from '../../components/Drivers/DriverDetails';
import DriverList from '../../components/Drivers/DriverList';
import DriverService from '../../services/DriverService';

const DriversWithShadcn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State for drivers data
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch drivers from the API
  useEffect(() => {
    fetchDrivers();
  }, []);

  // Function to fetch drivers
  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch drivers with optimized parameters
      const data = await DriverService.getDrivers({
        limit: 100, // Fetch more drivers at once to reduce API calls
        includeCompany: false // Don't include company data unless needed
      });

      // Handle both paginated and non-paginated responses
      if (data.drivers && Array.isArray(data.drivers)) {
        setDrivers(data.drivers);
      } else if (Array.isArray(data)) {
        setDrivers(data);
      } else {
        setDrivers([]);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setError(error.message || 'Failed to fetch drivers');
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch drivers',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddDriver = async (newDriver) => {
    try {
      // Set loading state
      setLoading(true);

      // Split the name into firstName and lastName
      const nameParts = newDriver.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      // Calculate a default license expiry date (1 year from now)
      const today = new Date();
      const nextYear = new Date(today.setFullYear(today.getFullYear() + 1));
      const defaultLicenseExpiry = nextYear.toISOString().split('T')[0];

      // Prepare driver data for API
      const driverData = {
        firstName: firstName,
        lastName: lastName,
        email: newDriver.email || '',
        phone: newDriver.phone || '',
        licenseNumber: newDriver.licenseNumber,
        licenseExpiry: newDriver.licenseExpiry || defaultLicenseExpiry,
        status: newDriver.status || 'inactive',
        address: newDriver.address || '',
        companyId: newDriver.companyId || 1
      };

      // Call API to create driver
      const createdDriver = await DriverService.createDriver(driverData);

      // Add the new driver to the list
      setDrivers([...drivers, createdDriver]);

      // Show success notification
      toast({
        title: 'Driver Added',
        description: `${createdDriver.name} has been added to the system`,
        variant: 'success'
      });

      // Close the add form
      setIsAddOpen(false);
    } catch (error) {
      console.error('Error adding driver:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add driver',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDriver = async (updatedDriver) => {
    try {
      // Set loading state
      setLoading(true);

      // Split the name into firstName and lastName if needed
      const nameParts = updatedDriver.name.split(' ');
      const firstName = updatedDriver.firstName || nameParts[0];
      const lastName = updatedDriver.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');

      // Calculate a default license expiry date (1 year from now) if not provided
      const today = new Date();
      const nextYear = new Date(today.setFullYear(today.getFullYear() + 1));
      const defaultLicenseExpiry = nextYear.toISOString().split('T')[0];

      // Format license expiry date if it's in ISO format
      let licenseExpiry = updatedDriver.licenseExpiry;
      if (licenseExpiry && licenseExpiry.includes('T')) {
        licenseExpiry = licenseExpiry.split('T')[0];
      }

      // Prepare driver data for API
      const driverData = {
        firstName: firstName,
        lastName: lastName,
        email: updatedDriver.email || '',
        phone: updatedDriver.phone || '',
        licenseNumber: updatedDriver.licenseNumber,
        licenseExpiry: licenseExpiry || defaultLicenseExpiry,
        status: updatedDriver.status || 'inactive',
        address: updatedDriver.address || '',
        companyId: updatedDriver.companyId || 1
      };

      // Call API to update driver
      const result = await DriverService.updateDriver(updatedDriver.id, driverData);

      // Update the drivers state
      const updatedDrivers = drivers.map(driver => {
        if (driver.id === updatedDriver.id) {
          return result;
        }
        return driver;
      });

      setDrivers(updatedDrivers);

      // Show success notification
      toast({
        title: 'Driver Updated',
        description: `${result.name} has been updated`,
        variant: 'success'
      });

      // Close the edit form
      setIsEditOpen(false);
    } catch (error) {
      console.error('Error updating driver:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update driver',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Find the driver to update
      const driverToUpdate = drivers.find(driver => driver.id === id);
      if (!driverToUpdate) {
        console.error(`Driver with ID ${id} not found`);
        return;
      }

      // We could set a loading state for this specific operation if needed
      // But for now we'll just use the global loading state

      // Split the name into firstName and lastName if needed
      const nameParts = driverToUpdate.name.split(' ');
      const firstName = driverToUpdate.firstName || nameParts[0];
      const lastName = driverToUpdate.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');

      // Format license expiry date if it's in ISO format
      let licenseExpiry = driverToUpdate.licenseExpiry;
      if (!licenseExpiry) {
        // Calculate a default license expiry date (1 year from now) if not provided
        const today = new Date();
        const nextYear = new Date(today.setFullYear(today.getFullYear() + 1));
        licenseExpiry = nextYear.toISOString().split('T')[0];
      } else if (licenseExpiry.includes('T')) {
        licenseExpiry = licenseExpiry.split('T')[0];
      }

      // Prepare the update data
      const driverData = {
        firstName: firstName,
        lastName: lastName,
        email: driverToUpdate.email || '',
        phone: driverToUpdate.phone || '',
        licenseNumber: driverToUpdate.licenseNumber,
        licenseExpiry: licenseExpiry,
        status: newStatus,
        address: driverToUpdate.address || '',
        companyId: driverToUpdate.companyId || 1
      };

      // Call API to update driver
      const result = await DriverService.updateDriver(id, driverData);

      // Update the drivers state
      const updatedDrivers = drivers.map(driver => {
        if (driver.id === id) {
          return result;
        }
        return driver;
      });

      setDrivers(updatedDrivers);

      // Show notification based on status change
      if (newStatus === 'active') {
        toast({
          title: 'Status Updated',
          description: `${driverToUpdate.name} is now active`,
          variant: 'success'
        });
      } else if (newStatus === 'inactive') {
        toast({
          title: 'Status Updated',
          description: `${driverToUpdate.name} is now inactive`,
          variant: 'info'
        });
      } else if (newStatus === 'on_leave') {
        toast({
          title: 'Status Updated',
          description: `${driverToUpdate.name} is now on leave`,
          variant: 'warning'
        });
      }

      // If the modal is open and we're changing the selected driver's status
      if (selectedDriver && selectedDriver.id === id) {
        setSelectedDriver({ ...selectedDriver, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating driver status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update driver status',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Drivers</h1>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchDrivers}
            disabled={loading}
            title="Refresh drivers list"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" /> Add New Driver
        </Button>
      </div>

      {loading && <div className="text-center py-8">Loading drivers...</div>}

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-6">
          <p className="font-semibold">Error loading drivers</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && drivers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No drivers found</p>
        </div>
      )}

      {!loading && drivers.length > 0 && (
        <DriverList
          drivers={drivers}
          onDriverClick={handleDriverClick}
        />
      )}

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
