import React, { useState } from 'react';
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

const AddDriverForm = ({ isOpen, onClose, onAddDriver }) => {
  const { toast } = useToast();
  
  const [newDriver, setNewDriver] = useState({
    name: '',
    licenseNumber: '',
    phone: '',
    email: '',
    assignedTruck: null,
    truckId: null,
    status: 'inactive',
    experience: '',
    address: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDriver({
      ...newDriver,
      [name]: value
    });
  };

  const handleAddDriver = () => {
    // Validate form
    if (!newDriver.name || !newDriver.licenseNumber) {
      toast.error('Validation Error', 'Driver Name and License Number are required');
      return;
    }

    // Call the parent component's onAddDriver function
    onAddDriver(newDriver);

    // Reset form and close
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setNewDriver({
      name: '',
      licenseNumber: '',
      phone: '',
      email: '',
      assignedTruck: null,
      truckId: null,
      status: 'inactive',
      experience: '',
      address: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Driver</DialogTitle>
          <DialogDescription>
            Fill in the driver details below. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Driver Name*</Label>
              <Input
                id="name"
                name="name"
                value={newDriver.name}
                onChange={handleInputChange}
                placeholder="e.g. John Smith"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number*</Label>
              <Input
                id="licenseNumber"
                name="licenseNumber"
                value={newDriver.licenseNumber}
                onChange={handleInputChange}
                placeholder="e.g. DL12345678"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={newDriver.phone}
                onChange={handleInputChange}
                placeholder="e.g. +260 97 1234567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={newDriver.email}
                onChange={handleInputChange}
                placeholder="e.g. driver@example.com"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                name="status"
                value={newDriver.status}
                onChange={handleInputChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Experience</Label>
              <Input
                id="experience"
                name="experience"
                value={newDriver.experience}
                onChange={handleInputChange}
                placeholder="e.g. 5 years"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={newDriver.address}
              onChange={handleInputChange}
              placeholder="e.g. 123 Main St, Lusaka"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddDriver}>Add Driver</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddDriverForm;
