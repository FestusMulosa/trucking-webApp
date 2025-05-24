import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../ui/dialog';
import { Select } from '../ui/select';
import { Badge } from '../ui/badge';
import { User, Truck, AlertCircle } from 'lucide-react';
import DriverService from '../../services/DriverService';

const DriverAssignmentModal = ({
  isOpen,
  onClose,
  truck,
  onAssignmentComplete
}) => {
  const { toast } = useToast();
  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingDrivers, setFetchingDrivers] = useState(false);

  // Fetch available drivers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAvailableDrivers();
    }
  }, [isOpen]);

  const fetchAvailableDrivers = async () => {
    try {
      setFetchingDrivers(true);

      // Fetch all drivers
      const response = await DriverService.getDrivers({
        limit: 200,
        includeCompany: false
      });

      let driversArray = [];
      if (response.drivers && Array.isArray(response.drivers)) {
        driversArray = response.drivers;
      } else if (Array.isArray(response)) {
        driversArray = response;
      }

      // Filter out drivers that already have trucks assigned (except the current truck's driver)
      const availableDrivers = driversArray.filter(driver =>
        !driver.truckId || driver.truckId === truck?.id
      );

      setDrivers(availableDrivers);

      // Pre-select the current driver if truck already has one assigned
      if (truck?.driverId) {
        setSelectedDriverId(truck.driverId.toString());
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch available drivers',
        variant: 'destructive'
      });
    } finally {
      setFetchingDrivers(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedDriverId) {
      toast({
        title: 'Error',
        description: 'Please select a driver to assign',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      // If truck is already assigned to this driver, no need to reassign
      if (truck?.driverId && truck.driverId.toString() === selectedDriverId) {
        toast({
          title: 'Info',
          description: 'Truck is already assigned to this driver',
          variant: 'default'
        });
        onClose();
        return;
      }

      // Assign driver to truck
      await DriverService.assignDriverToTruck(parseInt(selectedDriverId), truck.id);

      toast({
        title: 'Success',
        description: `Driver has been assigned to ${truck.name}`,
        variant: 'default'
      });

      // Notify parent component to refresh data
      if (onAssignmentComplete) {
        onAssignmentComplete();
      }

      onClose();
    } catch (error) {
      console.error('Error assigning driver:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign driver to truck',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async () => {
    if (!truck?.driverId) {
      toast({
        title: 'Info',
        description: 'Truck does not have any driver assigned',
        variant: 'default'
      });
      return;
    }

    try {
      setLoading(true);

      // Unassign driver from truck
      await DriverService.unassignDriverFromTruck(truck.driverId);

      toast({
        title: 'Success',
        description: `Driver has been unassigned from ${truck.name}`,
        variant: 'default'
      });

      // Notify parent component to refresh data
      if (onAssignmentComplete) {
        onAssignmentComplete();
      }

      onClose();
    } catch (error) {
      console.error('Error unassigning driver:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to unassign driver from truck',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const availableDrivers = drivers.filter(driver =>
    !driver.truckId || driver.truckId === truck?.id
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Assign Driver to {truck?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Assignment Status */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="h-4 w-4" />
              <span className="font-medium">Current Assignment</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {truck?.driver && truck.driver !== 'Unassigned' ? (
                <span>Assigned to: <strong>{truck.driver}</strong></span>
              ) : (
                <span>No driver assigned</span>
              )}
            </div>
          </div>

          {/* Driver Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Driver</label>
            {fetchingDrivers ? (
              <div className="text-sm text-muted-foreground">Loading drivers...</div>
            ) : (
              <Select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
              >
                <option value="">Choose a driver...</option>
                {availableDrivers.map(driver => (
                  <option key={driver.id} value={driver.id.toString()}>
                    {driver.name} ({driver.licenseNumber}) - {driver.status}
                  </option>
                ))}
              </Select>
            )}

            {availableDrivers.length === 0 && !fetchingDrivers && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                No available drivers found
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          {truck?.driverId && (
            <Button
              variant="outline"
              onClick={handleUnassign}
              disabled={loading}
            >
              Unassign Current
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={loading || !selectedDriverId}
          >
            {loading ? 'Assigning...' : 'Assign Driver'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DriverAssignmentModal;
