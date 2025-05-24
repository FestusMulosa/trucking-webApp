import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusCard } from '../../components/ui/status-card';
import { TruckList } from '../../components/ui/truck-list';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

// This is an example implementation of the Dashboard screen using shadcn components
// You can use this as a reference for converting other screens

const DashboardExample = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null);


  // Calculate counts
  const activeTrucks = trucks.filter(truck => truck.status === 'active').length;
  const maintenanceTrucks = trucks.filter(truck => truck.status === 'maintenance').length;
  const inactiveTrucks = trucks.filter(truck => truck.status === 'inactive').length;

  const handleTruckClick = (truck) => {
    setSelectedTruck(truck);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Fleet Dashboard</h1>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatusCard
          title="Active"
          count={activeTrucks}
          status="active"
          onClick={() => navigate('/trucks/active')}
        />
        <StatusCard
          title="Maintenance"
          count={maintenanceTrucks}
          status="maintenance"
          onClick={() => navigate('/trucks/maintenance')}
        />
        <StatusCard
          title="Inactive"
          count={inactiveTrucks}
          status="inactive"
          onClick={() => navigate('/trucks/inactive')}
        />
        <StatusCard
          title="Total Fleet"
          count={trucks.length}
          status="total"
          onClick={() => navigate('/trucks')}
        />
      </div>

      {/* Truck List */}
      <TruckList trucks={trucks} onTruckClick={handleTruckClick} />

      {/* Truck Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {selectedTruck && (
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedTruck.name}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={selectedTruck.status}>{selectedTruck.status}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Route</p>
                <p>{selectedTruck.route}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Last Update</p>
                <p>{selectedTruck.lastUpdate}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeModal}>Close</Button>
              <Button onClick={() => navigate(`/trucks`)}>View Details</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default DashboardExample;
