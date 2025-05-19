import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { UserCheck, UserX, Edit, ArrowLeft, Phone, Mail, MapPin, Truck, Clock } from 'lucide-react';
import EditDriverForm from '../../components/Drivers/EditDriverForm';

const DriverDetails = () => {
  const { driverId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [driver, setDriver] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data for drivers - in a real app, this would come from an API
  const driversData = [
    {
      id: 1,
      name: 'John Smith',
      licenseNumber: 'DL12345678',
      phone: '+260 97 1234567',
      email: 'john.smith@example.com',
      assignedTruck: 'Truck 001',
      truckId: 1,
      status: 'active',
      experience: '5 years',
      address: '123 Main St, Lusaka',
      lastUpdate: '10 min ago'
    },
    {
      id: 2,
      name: 'Emily Johnson',
      licenseNumber: 'DL87654321',
      phone: '+260 97 7654321',
      email: 'emily.johnson@example.com',
      assignedTruck: 'Truck 002',
      truckId: 2,
      status: 'active',
      experience: '3 years',
      address: '456 Park Ave, Ndola',
      lastUpdate: '2 hours ago'
    },
    {
      id: 3,
      name: 'Michael Brown',
      licenseNumber: 'DL23456789',
      phone: '+260 97 2345678',
      email: 'michael.brown@example.com',
      assignedTruck: 'Truck 004',
      truckId: 4,
      status: 'active',
      experience: '7 years',
      address: '789 Oak Rd, Kitwe',
      lastUpdate: '5 min ago'
    },
    {
      id: 4,
      name: 'Sarah Davis',
      licenseNumber: 'DL34567890',
      phone: '+260 97 3456789',
      email: 'sarah.davis@example.com',
      assignedTruck: 'Truck 005',
      truckId: 5,
      status: 'active',
      experience: '4 years',
      address: '101 Pine St, Livingstone',
      lastUpdate: '15 min ago'
    },
    {
      id: 5,
      name: 'David Wilson',
      licenseNumber: 'DL45678901',
      phone: '+260 97 4567890',
      email: 'david.wilson@example.com',
      assignedTruck: null,
      truckId: null,
      status: 'inactive',
      experience: '2 years',
      address: '202 Cedar Ave, Kabwe',
      lastUpdate: '1 day ago'
    }
  ];

  // Fetch driver data
  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      const foundDriver = driversData.find(d => d.id === parseInt(driverId));
      if (foundDriver) {
        setDriver(foundDriver);
      } else {
        toast({
          title: 'Driver Not Found',
          description: 'The requested driver could not be found',
          variant: 'destructive'
        });
        navigate('/drivers');
      }
      setLoading(false);
    }, 500);
  }, [driverId, navigate, toast]);

  const handleStatusChange = (newStatus) => {
    if (!driver) return;

    setDriver(prev => {
      const updated = { ...prev, status: newStatus, lastUpdate: 'Just now' };

      // Show notification based on status change
      if (newStatus === 'active') {
        toast({
          title: 'Status Updated',
          description: `${driver.name} is now active`,
          variant: 'success'
        });
      } else if (newStatus === 'inactive') {
        toast({
          title: 'Status Updated',
          description: `${driver.name} is now inactive`,
          variant: 'info'
        });
      }

      return updated;
    });
  };

  const handleUpdateDriver = (updatedDriver) => {
    setDriver({
      ...updatedDriver,
      lastUpdate: 'Just now'
    });

    toast({
      title: 'Driver Updated',
      description: `${updatedDriver.name} has been updated`,
      variant: 'success'
    });
    setIsEditOpen(false);
  };

  const handleViewTruck = () => {
    if (driver && driver.truckId) {
      navigate(`/trucks/${driver.truckId}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading driver details...</p>
        </div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Driver Not Found</h2>
          <p className="mb-6">The requested driver could not be found.</p>
          <Button onClick={() => navigate('/drivers')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Drivers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/drivers')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Driver Details</h1>
        </div>
        <Button onClick={() => setIsEditOpen(true)} className="flex items-center gap-2">
          <Edit className="h-4 w-4" /> Edit Driver
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{driver.name}</CardTitle>
                <CardDescription className="font-mono text-primary mt-1">
                  License: {driver.licenseNumber}
                </CardDescription>
              </div>
              <Badge variant={driver.status} className="text-sm px-3 py-1">
                {driver.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p>{driver.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p>{driver.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Address</h3>
                    <p>{driver.address}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Assigned Truck</h3>
                    {driver.assignedTruck ? (
                      <Button
                        variant="link"
                        className="p-0 h-auto font-normal text-base text-primary"
                        onClick={handleViewTruck}
                      >
                        {driver.assignedTruck}
                      </Button>
                    ) : (
                      <p>None</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Experience</h3>
                    <p>{driver.experience}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Last Update</h3>
                    <p>{driver.lastUpdate}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Driver Status</CardTitle>
            <CardDescription>Change the driver's current status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant={driver.status === 'active' ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => handleStatusChange('active')}
            >
              <UserCheck className="h-4 w-4 mr-2" /> Active
            </Button>
            <Button
              variant={driver.status === 'inactive' ? 'destructive' : 'outline'}
              className="w-full justify-start"
              onClick={() => handleStatusChange('inactive')}
            >
              <UserX className="h-4 w-4 mr-2" /> Inactive
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Edit Driver Form */}
      <EditDriverForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onUpdateDriver={handleUpdateDriver}
        driver={driver}
      />
    </div>
  );
};

export default DriverDetails;
