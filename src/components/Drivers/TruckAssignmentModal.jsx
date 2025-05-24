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
import { Truck, User, AlertCircle } from 'lucide-react';
import TruckService from '../../services/TruckService';
import DriverService from '../../services/DriverService';

const TruckAssignmentModal = ({
  isOpen,
  onClose,
  driver,
  onAssignmentComplete
}) => {
  const { toast } = useToast();
  const [trucks, setTrucks] = useState([]);
  const [selectedTruckId, setSelectedTruckId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingTrucks, setFetchingTrucks] = useState(false);

  // Fetch available trucks when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAvailableTrucks();
    }
  }, [isOpen]);

  const fetchAvailableTrucks = async () => {
    try {
      setFetchingTrucks(true);

      // Fetch all trucks
      const response = await TruckService.getTrucks({
        limit: 200,
        includeCompany: false
      });

      let trucksArray = [];
      if (response.trucks && Array.isArray(response.trucks)) {
        trucksArray = response.trucks;
      } else if (Array.isArray(response)) {
        trucksArray = response;
      }

      // Filter out trucks that already have drivers assigned (except the current driver's truck)
      const availableTrucks = trucksArray.filter(truck =>
        !truck.currentDriverId || truck.currentDriverId === driver?.id
      );

      setTrucks(availableTrucks);

      // Pre-select the current truck if driver is already assigned
      if (driver?.truckId) {
        setSelectedTruckId(driver.truckId.toString());
      }
    } catch (error) {
      console.error('Error fetching trucks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch available trucks',
        variant: 'destructive'
      });
    } finally {
      setFetchingTrucks(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedTruckId) {
      toast({
        title: 'Error',
        description: 'Please select a truck to assign',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      // If driver is already assigned to this truck, no need to reassign
      if (driver?.truckId && driver.truckId.toString() === selectedTruckId) {
        toast({
          title: 'Info',
          description: 'Driver is already assigned to this truck',
          variant: 'default'
        });
        onClose();
        return;
      }

      // Assign driver to truck
      await DriverService.assignDriverToTruck(driver.id, parseInt(selectedTruckId));

      toast({
        title: 'Success',
        description: `${driver.name} has been assigned to the selected truck`,
        variant: 'default'
      });

      // Notify parent component to refresh data
      if (onAssignmentComplete) {
        onAssignmentComplete();
      }

      onClose();
    } catch (error) {
      console.error('Error assigning truck:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign truck to driver',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async () => {
    if (!driver?.truckId) {
      toast({
        title: 'Info',
        description: 'Driver is not assigned to any truck',
        variant: 'default'
      });
      return;
    }

    try {
      setLoading(true);

      // Unassign driver from truck
      await DriverService.unassignDriverFromTruck(driver.id);

      toast({
        title: 'Success',
        description: `${driver.name} has been unassigned from their truck`,
        variant: 'default'
      });

      // Notify parent component to refresh data
      if (onAssignmentComplete) {
        onAssignmentComplete();
      }

      onClose();
    } catch (error) {
      console.error('Error unassigning truck:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to unassign truck from driver',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const availableTrucks = trucks.filter(truck =>
    !truck.currentDriverId || truck.currentDriverId === driver?.id
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Assign Truck to {driver?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Assignment Status */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4" />
              <span className="font-medium">Current Assignment</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {driver?.assignedTruck ? (
                <span>Assigned to: <strong>{driver.assignedTruck}</strong></span>
              ) : (
                <span>Not assigned to any truck</span>
              )}
            </div>
          </div>

          {/* Truck Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Truck</label>
            {fetchingTrucks ? (
              <div className="text-sm text-muted-foreground">Loading trucks...</div>
            ) : (
              <Select
                value={selectedTruckId}
                onChange={(e) => setSelectedTruckId(e.target.value)}
              >
                <option value="">Choose a truck...</option>
                {availableTrucks.map(truck => (
                  <option key={truck.id} value={truck.id.toString()}>
                    {truck.name} ({truck.numberPlate}) - {truck.status}
                  </option>
                ))}
              </Select>
            )}

            {availableTrucks.length === 0 && !fetchingTrucks && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                No available trucks found
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          {driver?.truckId && (
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
            disabled={loading || !selectedTruckId}
          >
            {loading ? 'Assigning...' : 'Assign Truck'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TruckAssignmentModal;
