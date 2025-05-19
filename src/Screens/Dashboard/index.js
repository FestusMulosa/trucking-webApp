import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';
import EmailClient from '../../services/EmailClient';
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
import { BellIcon } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  const handleTruckClick = (truck) => {
    setSelectedTruck(truck);
    setIsModalOpen(true);
  };

  // Mock data for trucks - in a real app, this would come from an API
  const trucks = [
    {
      id: 1,
      name: 'Truck 001',
      numberPlate: 'ABC 123 ZM',
      status: 'active',
      route: 'Lusaka-Solwezi',
      cargoType: 'Fuel',
      lastUpdate: '10 min ago',
      fitnessDate: '2023-11-30',
      comesaExpiryDate: '2023-12-10'
    },
    {
      id: 2,
      name: 'Truck 002',
      numberPlate: 'DEF 456 ZM',
      status: 'maintenance',
      route: 'Service Center',
      cargoType: 'Construction',
      lastUpdate: '2 hours ago',
      fitnessDate: '2023-09-20',
      comesaExpiryDate: '2023-10-15'
    },
    {
      id: 3,
      name: 'Truck 003',
      numberPlate: 'GHI 789 ZM',
      status: 'inactive',
      route: 'Warehouse',
      cargoType: 'Agricultural',
      lastUpdate: '1 day ago',
      fitnessDate: '2024-01-10',
      comesaExpiryDate: '2024-02-20'
    },
    {
      id: 4,
      name: 'Truck 004',
      numberPlate: 'JKL 012 ZM',
      status: 'active',
      route: 'Ndola-Kitwe',
      cargoType: 'Mining',
      lastUpdate: '5 min ago',
      fitnessDate: '2023-10-25',
      comesaExpiryDate: '2023-11-05'
    },
    {
      id: 5,
      name: 'Truck 005',
      numberPlate: 'MNO 345 ZM',
      status: 'active',
      route: 'Lusaka-Livingstone',
      cargoType: 'Consumer Goods',
      lastUpdate: '15 min ago',
      fitnessDate: '2023-11-15',
      comesaExpiryDate: '2023-12-25'
    },
  ];

  // Function to send fitness expiry notifications
  const sendFitnessExpiryNotifications = async () => {
    setIsSendingNotification(true);
    toast({
      title: 'Sending Notifications',
      description: 'Checking for trucks with fitness about to expire...',
      variant: 'info'
    });

    try {
      // Get the current date
      const today = new Date();

      // Get trucks with fitness expiring within 30 days or already expired
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      const trucksWithExpiringFitness = trucks.filter(truck => {
        const fitnessDate = new Date(truck.fitnessDate);
        const isExpiring = fitnessDate <= thirtyDaysFromNow;
        console.log(`Truck ${truck.name} fitness date: ${fitnessDate.toLocaleDateString()}, is expiring: ${isExpiring}`);
        return isExpiring;
      });

      console.log('Trucks with expiring fitness:', trucksWithExpiringFitness);

      if (trucksWithExpiringFitness.length === 0) {
        toast({
          title: 'No Expiring Fitness',
          description: 'No trucks with fitness certificates about to expire were found.',
          variant: 'info'
        });
        setIsSendingNotification(false);
        return;
      }

      // Send email notification
      const defaultRecipient = process.env.REACT_APP_DEFAULT_RECIPIENT || 'admin@example.com';
      console.log('Sending notification to:', defaultRecipient);

      // Use the dedicated server endpoint for fitness expiry notifications
      const result = await EmailClient.sendFitnessExpiryEmail({
        to: defaultRecipient,
        trucks: trucksWithExpiringFitness
      });

      if (result.success) {
        toast({
          title: 'Notifications Sent',
          description: `Fitness expiry notifications sent for ${trucksWithExpiringFitness.length} trucks.`,
          variant: 'success'
        });
      } else {
        toast({
          title: 'Notification Failed',
          description: `Failed to send fitness expiry notifications: ${result.error || result.message || 'Unknown error'}`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Notification Error',
        description: `Error sending notifications: ${error.message}`,
        variant: 'destructive'
      });
      console.error('Error sending fitness expiry notifications:', error);
    } finally {
      setIsSendingNotification(false);
    }
  };

  // Calculate summary statistics
  const activeTrucks = trucks.filter(truck => truck.status === 'active').length;
  const maintenanceTrucks = trucks.filter(truck => truck.status === 'maintenance').length;
  const inactiveTrucks = trucks.filter(truck => truck.status === 'inactive').length;

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Fleet Dashboard</h1>
        <Button
          onClick={sendFitnessExpiryNotifications}
          disabled={isSendingNotification}
          className="flex items-center gap-2"
        >
          <BellIcon className="h-4 w-4" />
          {isSendingNotification ? 'Sending...' : 'Demo Notifications'}
        </Button>
      </div>

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
                <p className="text-sm font-medium text-muted-foreground">Number Plate</p>
                <p>{selectedTruck.numberPlate || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Route</p>
                <p>{selectedTruck.route}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Last Update</p>
                <p>{selectedTruck.lastUpdate}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Cargo Type</p>
                <p>{selectedTruck.cargoType || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Fitness Date</p>
                <p>{selectedTruck.fitnessDate || 'N/A'}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
              <Button onClick={() => navigate(`/trucks/details/${selectedTruck.id}`)}>View Details</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default Dashboard;
