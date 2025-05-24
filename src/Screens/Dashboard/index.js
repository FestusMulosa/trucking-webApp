import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../context/AuthContext';
import EmailClient from '../../services/EmailClient';
import TruckService from '../../services/TruckService';
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
import { BellIcon, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, logout } = useAuth();
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [trucks, setTrucks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch trucks from the API when the component mounts
  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        setIsLoading(true);

        // Check if user is logged in
        if (!currentUser) {
          // Check localStorage as a fallback
          const storedUser = localStorage.getItem('user');
          if (!storedUser) {
            console.log('No user logged in, redirecting to login page');
            navigate('/login');
            return;
          }
        }

        const data = await TruckService.getTrucks();

        // Handle both paginated and non-paginated responses
        let trucksArray = [];
        if (data.trucks && Array.isArray(data.trucks)) {
          trucksArray = data.trucks;
        } else if (Array.isArray(data)) {
          trucksArray = data;
        }

        // Format the lastUpdate field for display
        const formattedTrucks = trucksArray.map(truck => {
          // Calculate a human-readable lastUpdate string
          let lastUpdateStr = 'Unknown';
          if (truck.lastUpdate) {
            const lastUpdateDate = new Date(truck.lastUpdate);
            const now = new Date();
            const diffMs = now - lastUpdateDate;
            const diffMins = Math.floor(diffMs / 60000);

            if (diffMins < 60) {
              lastUpdateStr = `${diffMins} min ago`;
            } else if (diffMins < 1440) {
              const hours = Math.floor(diffMins / 60);
              lastUpdateStr = `${hours} hour${hours > 1 ? 's' : ''} ago`;
            } else {
              const days = Math.floor(diffMins / 1440);
              lastUpdateStr = `${days} day${days > 1 ? 's' : ''} ago`;
            }
          }

          return {
            ...truck,
            lastUpdate: lastUpdateStr
          };
        });

        setTrucks(formattedTrucks);
        setError(null);
      } catch (err) {
        console.error('Error fetching trucks:', err);

        // Handle authentication errors
        if (err.message === 'Invalid token' ||
            err.message === 'Authentication required' ||
            err.message === 'Token expired') {

          console.error('Authentication error details:', err);

          toast({
            title: 'Authentication Error',
            description: 'Your session has expired. Please log in again.',
            variant: 'destructive'
          });

          // Log the user out and redirect to login
          logout();
          navigate('/login');
          return;
        }

        setError('Failed to load trucks. Please try again later.');
        toast({
          title: 'Error',
          description: 'Failed to load trucks. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrucks();
  }, [toast, navigate, currentUser, logout]);

  const handleTruckClick = (truck) => {
    setSelectedTruck(truck);
    setIsModalOpen(true);
  };

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
        // Skip trucks without fitness date
        if (!truck.fitnessDate) return false;

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
          disabled={isSendingNotification || isLoading}
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

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading trucks...</p>
        </div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      ) : (
        /* Truck List */
        <TruckList trucks={trucks} onTruckClick={handleTruckClick} />
      )}

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
                <p>{selectedTruck.route || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Last Update</p>
                <p>{selectedTruck.lastUpdate || 'N/A'}</p>
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
