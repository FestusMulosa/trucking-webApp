import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select } from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '../../components/ui/dialog';
import { useToast } from '../../hooks/use-toast';

const EditTruckForm = ({ isOpen, onClose, onUpdateTruck, truck }) => {
  const { toast } = useToast();
  const [editTruck, setEditTruck] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update the form when the truck prop changes
  useEffect(() => {
    if (truck) {
      // Format dates for input fields (YYYY-MM-DD)
      const formattedTruck = {
        ...truck,
        roadTaxDate: truck.roadTaxDate ? truck.roadTaxDate.split('T')[0] : '',
        insuranceDate: truck.insuranceDate ? truck.insuranceDate.split('T')[0] : '',
        fitnessDate: truck.fitnessDate ? truck.fitnessDate.split('T')[0] : '',
        comesaExpiryDate: truck.comesaExpiryDate ? truck.comesaExpiryDate.split('T')[0] : '',
        nextMaintenance: truck.nextMaintenance ? truck.nextMaintenance.split('T')[0] : '',
      };
      setEditTruck(formattedTruck);
    }
  }, [truck]);

  // If no truck is provided, don't render anything
  if (!editTruck) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditTruck({
      ...editTruck,
      [name]: value
    });
  };

  const handleUpdateTruck = async () => {
    // Validate form
    if (!editTruck.name || !editTruck.numberPlate || !editTruck.route) {
      toast({
        title: 'Validation Error',
        description: 'Truck ID, Number Plate, and Route are required',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the parent component's onUpdateTruck function
      await onUpdateTruck(editTruck);
      
      // Close the dialog
      onClose();
      
      toast({
        title: 'Truck Updated',
        description: `${editTruck.name} has been updated successfully`,
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update truck',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Truck: {editTruck.name}</DialogTitle>
          <DialogDescription>
            Update the truck details below. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Truck ID*</Label>
              <Input
                id="edit-name"
                name="name"
                value={editTruck.name}
                onChange={handleInputChange}
                placeholder="e.g. Truck 006"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-numberPlate">Number Plate*</Label>
              <Input
                id="edit-numberPlate"
                name="numberPlate"
                value={editTruck.numberPlate}
                onChange={handleInputChange}
                placeholder="e.g. ABC 123 ZM"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-make">Make</Label>
              <Input
                id="edit-make"
                name="make"
                value={editTruck.make || ''}
                onChange={handleInputChange}
                placeholder="e.g. Volvo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-model">Model</Label>
              <Input
                id="edit-model"
                name="model"
                value={editTruck.model || ''}
                onChange={handleInputChange}
                placeholder="e.g. FH16"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-year">Year</Label>
              <Input
                id="edit-year"
                name="year"
                type="number"
                value={editTruck.year || ''}
                onChange={handleInputChange}
                placeholder="e.g. 2022"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-route">Route*</Label>
              <Input
                id="edit-route"
                name="route"
                value={editTruck.route || ''}
                onChange={handleInputChange}
                placeholder="e.g. Lusaka-Ndola"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-cargoType">Cargo Type</Label>
              <Input
                id="edit-cargoType"
                name="cargoType"
                value={editTruck.cargoType || ''}
                onChange={handleInputChange}
                placeholder="e.g. Fuel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                name="status"
                value={editTruck.status}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-roadTaxDate">Road Tax Expiry</Label>
              <Input
                id="edit-roadTaxDate"
                name="roadTaxDate"
                type="date"
                value={editTruck.roadTaxDate || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-insuranceDate">Insurance Expiry</Label>
              <Input
                id="edit-insuranceDate"
                name="insuranceDate"
                type="date"
                value={editTruck.insuranceDate || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-fitnessDate">Fitness Expiry</Label>
              <Input
                id="edit-fitnessDate"
                name="fitnessDate"
                type="date"
                value={editTruck.fitnessDate || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-comesaExpiryDate">COMESA Expiry</Label>
              <Input
                id="edit-comesaExpiryDate"
                name="comesaExpiryDate"
                type="date"
                value={editTruck.comesaExpiryDate || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-nextMaintenance">Next Maintenance</Label>
            <Input
              id="edit-nextMaintenance"
              name="nextMaintenance"
              type="date"
              value={editTruck.nextMaintenance || ''}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleUpdateTruck} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Updating...
              </>
            ) : (
              'Update Truck'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTruckForm;
