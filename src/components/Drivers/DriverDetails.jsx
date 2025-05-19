import React from 'react';
import { Button } from '../../components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '../../components/ui/dialog';
import { UserCheck, UserX, Edit } from 'lucide-react';

const DriverDetails = ({ isOpen, onClose, driver, onEdit, onStatusChange }) => {
  if (!driver) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{driver.name}</DialogTitle>
          <div className="absolute right-4 top-4 flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-2"
              onClick={() => onEdit(driver)}
            >
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
          </div>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
            <div className="flex gap-2">
              <Button 
                variant={driver.status === 'active' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => onStatusChange(driver.id, 'active')}
                className="h-8"
              >
                <UserCheck className="h-4 w-4 mr-1" /> Active
              </Button>
              <Button 
                variant={driver.status === 'inactive' ? 'destructive' : 'outline'} 
                size="sm"
                onClick={() => onStatusChange(driver.id, 'inactive')}
                className="h-8"
              >
                <UserX className="h-4 w-4 mr-1" /> Inactive
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">License Number</h3>
            <p className="font-mono text-primary">{driver.licenseNumber}</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
            <p>{driver.phone}</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
            <p>{driver.email}</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Assigned Truck</h3>
            <p>{driver.assignedTruck || 'None'}</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Experience</h3>
            <p>{driver.experience}</p>
          </div>
          <div className="space-y-1 md:col-span-2">
            <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
            <p>{driver.address}</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Last Update</h3>
            <p>{driver.lastUpdate}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DriverDetails;
