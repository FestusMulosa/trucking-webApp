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

const EditDriverForm = ({ isOpen, onClose, onUpdateDriver, driver }) => {
  const { toast } = useToast();
  const [editDriver, setEditDriver] = useState(null);

  // Update the form when the driver prop changes
  useEffect(() => {
    if (driver) {
      setEditDriver({ ...driver });
    }
  }, [driver]);

  // If no driver is provided, don't render anything
  if (!editDriver) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditDriver({
      ...editDriver,
      [name]: value
    });
  };

  const handleUpdateDriver = () => {
    // Validate form
    if (!editDriver.name || !editDriver.licenseNumber || !editDriver.licenseExpiry) {
      toast({
        title: 'Validation Error',
        description: 'Driver Name, License Number, and License Expiry Date are required',
        variant: 'destructive'
      });
      return;
    }

    // Call the parent component's onUpdateDriver function
    onUpdateDriver(editDriver);

    // Close the dialog
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Driver: {editDriver.name}</DialogTitle>
          <DialogDescription>
            Update the driver details below. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Driver Name*</Label>
              <Input
                id="edit-name"
                name="name"
                value={editDriver.name}
                onChange={handleInputChange}
                placeholder="e.g. John Smith"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-licenseNumber">License Number*</Label>
              <Input
                id="edit-licenseNumber"
                name="licenseNumber"
                value={editDriver.licenseNumber}
                onChange={handleInputChange}
                placeholder="e.g. DL12345678"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-licenseExpiry">License Expiry Date*</Label>
              <Input
                id="edit-licenseExpiry"
                name="licenseExpiry"
                type="date"
                value={editDriver.licenseExpiry ? editDriver.licenseExpiry.split('T')[0] : ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                id="edit-status"
                name="status"
                value={editDriver.status}
                onChange={handleInputChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                name="phone"
                value={editDriver.phone}
                onChange={handleInputChange}
                placeholder="e.g. +260 97 1234567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={editDriver.email}
                onChange={handleInputChange}
                placeholder="e.g. driver@example.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-experience">Experience</Label>
            <Input
              id="edit-experience"
              name="experience"
              value={editDriver.experience}
              onChange={handleInputChange}
              placeholder="e.g. 5 years"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-address">Address</Label>
            <Input
              id="edit-address"
              name="address"
              value={editDriver.address}
              onChange={handleInputChange}
              placeholder="e.g. 123 Main St, Lusaka"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleUpdateDriver}>Update Driver</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditDriverForm;
