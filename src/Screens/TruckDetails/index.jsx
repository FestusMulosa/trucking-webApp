import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import EmailClient from '../../services/EmailClient';
import {
  Edit,
  ArrowLeft,
  User,
  MapPin,
  Package,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';

const TruckDetails = () => {
  const { truckId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [truck, setTruck] = useState(null);
  // isEditOpen state is used for the Edit Truck button but the EditTruckForm component is not implemented yet
  const [loading, setLoading] = useState(true);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Mock data for trucks - in a real app, this would come from an API
  // Using useMemo to prevent recreation of the array on each render
  const trucksData = useMemo(() => [
    {
      id: 1,
      name: 'Truck 001',
      numberPlate: 'ABC 123 ZM',
      status: 'active',
      route: 'Lusaka-Solwezi',
      cargoType: 'Fuel',
      lastUpdate: '10 min ago',
      driver: 'John Smith',
      driverId: 1,
      roadTaxDate: '2023-12-15',
      insuranceDate: '2024-01-20',
      fitnessDate: '2023-11-30',
      comesaExpiryDate: '2023-12-10',
      nextMaintenance: '2023-06-15'
    },
    {
      id: 2,
      name: 'Truck 002',
      numberPlate: 'DEF 456 ZM',
      status: 'maintenance',
      route: 'Service Center',
      cargoType: 'Construction',
      lastUpdate: '2 hours ago',
      driver: 'Emily Johnson',
      driverId: 2,
      roadTaxDate: '2023-10-05',
      insuranceDate: '2023-11-15',
      fitnessDate: '2023-09-20',
      comesaExpiryDate: '2023-10-15',
      nextMaintenance: '2023-05-20'
    },
    {
      id: 3,
      name: 'Truck 003',
      numberPlate: 'GHI 789 ZM',
      status: 'inactive',
      route: 'Warehouse',
      cargoType: 'Agricultural',
      lastUpdate: '1 day ago',
      driver: 'Unassigned',
      driverId: null,
      roadTaxDate: '2024-02-28',
      insuranceDate: '2024-03-15',
      fitnessDate: '2024-01-10',
      comesaExpiryDate: '2024-02-20',
      nextMaintenance: '2023-07-10'
    },
    {
      id: 4,
      name: 'Truck 004',
      numberPlate: 'JKL 012 ZM',
      status: 'active',
      route: 'Ndola-Kitwe',
      cargoType: 'Mining',
      lastUpdate: '5 min ago',
      driver: 'Michael Brown',
      driverId: 3,
      roadTaxDate: '2023-11-10',
      insuranceDate: '2023-12-05',
      fitnessDate: '2023-10-25',
      comesaExpiryDate: '2023-11-05',
      nextMaintenance: '2023-06-30'
    },
    {
      id: 5,
      name: 'Truck 005',
      numberPlate: 'MNO 345 ZM',
      status: 'active',
      route: 'Lusaka-Livingstone',
      cargoType: 'Consumer Goods',
      lastUpdate: '15 min ago',
      driver: 'Sarah Davis',
      driverId: 4,
      roadTaxDate: '2024-01-05',
      insuranceDate: '2023-12-20',
      fitnessDate: '2023-11-15',
      comesaExpiryDate: '2023-12-25',
      nextMaintenance: '2023-06-05'
    },
  ], []);

  // Fetch truck data
  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      const foundTruck = trucksData.find(t => t.id === parseInt(truckId));
      if (foundTruck) {
        setTruck(foundTruck);
      } else {
        toast({
          title: 'Truck Not Found',
          description: 'The requested truck could not be found',
          variant: 'destructive'
        });
        navigate('/trucks');
      }
      setLoading(false);
    }, 500);
  }, [truckId, navigate, toast, trucksData]);

  const handleStatusChange = async (newStatus) => {
    if (!truck) return;

    // Store the old status before updating
    const oldStatus = truck.status;

    // Don't update if the status is the same
    if (oldStatus === newStatus) return;

    setTruck(prev => {
      const updated = { ...prev, status: newStatus, lastUpdate: 'Just now' };

      // Show notification based on status change
      if (newStatus === 'active') {
        toast({
          title: 'Status Updated',
          description: `${truck.name} is now active`,
          variant: 'success'
        });
      } else if (newStatus === 'maintenance') {
        toast({
          title: 'Status Updated',
          description: `${truck.name} is now in maintenance`,
          variant: 'warning'
        });
      } else if (newStatus === 'inactive') {
        toast({
          title: 'Status Updated',
          description: `${truck.name} is now inactive`,
          variant: 'info'
        });
      }

      return updated;
    });

    // Send email notification about status change
    try {
      setIsSendingEmail(true);

      // Show toast notification that email is being sent
      toast({
        title: 'Sending Email Notification',
        description: 'Notifying team about status change...',
        variant: 'default'
      });

      const defaultRecipient = process.env.REACT_APP_DEFAULT_RECIPIENT || 'admin@example.com';

      console.log(`Sending status change email notification: ${truck.name} status changed from ${oldStatus} to ${newStatus}`);

      const result = await EmailClient.sendStatusChangeEmail({
        to: defaultRecipient,
        truckId: truck.name,
        oldStatus,
        newStatus
      });

      if (result.success) {
        console.log('Status change email sent successfully');
        toast({
          title: 'Email Notification Sent',
          description: `Team notified about ${truck.name} status change`,
          variant: 'success'
        });
      } else {
        console.warn('Failed to send status change email:', result.message || result.error);
        toast({
          title: 'Email Notification Failed',
          description: result.message || result.error || 'Unknown error',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error sending status change email:', error);
      toast({
        title: 'Email Notification Failed',
        description: error.message || 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleViewDriver = () => {
    if (truck && truck.driverId) {
      navigate(`/drivers/${truck.driverId}`);
    }
  };

  // Format date with color based on expiry
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    let colorClass = '';
    if (date < today) {
      colorClass = 'text-destructive font-medium';
    } else if (date < thirtyDaysFromNow) {
      colorClass = 'text-amber-500 font-medium';
    } else {
      colorClass = 'text-green-600';
    }

    return (
      <span className={colorClass}>
        {date.toLocaleDateString()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading truck details...</p>
        </div>
      </div>
    );
  }

  if (!truck) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Truck Not Found</h2>
          <p className="mb-6">The requested truck could not be found.</p>
          <Button onClick={() => navigate('/trucks')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Trucks
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/trucks')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Truck Details</h1>
        </div>
        <Button
          onClick={() => {
            // Edit functionality will be implemented in the future
            toast({
              title: 'Feature Coming Soon',
              description: 'Truck editing functionality is not yet implemented',
              variant: 'info'
            });
          }}
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" /> Edit Truck
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{truck.name}</CardTitle>
                <CardDescription className="font-mono text-primary mt-1">
                  {truck.numberPlate}
                </CardDescription>
              </div>
              <Badge variant={truck.status} className="text-sm px-3 py-1">
                {truck.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Driver</h3>
                    {truck.driverId ? (
                      <Button
                        variant="link"
                        className="p-0 h-auto font-normal text-base text-primary"
                        onClick={handleViewDriver}
                      >
                        {truck.driver}
                      </Button>
                    ) : (
                      <p>Unassigned</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Route</h3>
                    <p>{truck.route}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Cargo Type</h3>
                    <p>{truck.cargoType}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Last Update</h3>
                    <p>{truck.lastUpdate}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Road Tax Expiry</h3>
                    <p>{formatDate(truck.roadTaxDate)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Insurance Expiry</h3>
                    <p>{formatDate(truck.insuranceDate)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Fitness Expiry</h3>
                    <p>{formatDate(truck.fitnessDate)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">COMESA Expiry</h3>
                    <p>{formatDate(truck.comesaExpiryDate)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Next Maintenance</h3>
                    <p>{formatDate(truck.nextMaintenance)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Truck Status</CardTitle>
            <CardDescription>Change the truck's current status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant={truck.status === 'active' ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => handleStatusChange('active')}
              disabled={isSendingEmail}
            >
              {isSendingEmail ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Active
            </Button>
            <Button
              variant={truck.status === 'maintenance' ? 'warning' : 'outline'}
              className={`w-full justify-start ${truck.status === 'maintenance' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
              onClick={() => handleStatusChange('maintenance')}
              disabled={isSendingEmail}
            >
              {isSendingEmail ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              ) : (
                <AlertTriangle className="h-4 w-4 mr-2" />
              )}
              Maintenance
            </Button>
            <Button
              variant={truck.status === 'inactive' ? 'destructive' : 'outline'}
              className="w-full justify-start"
              onClick={() => handleStatusChange('inactive')}
              disabled={isSendingEmail}
            >
              {isSendingEmail ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Inactive
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TruckDetails;
