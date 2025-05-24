import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Info, Truck } from 'lucide-react';

const DriverList = ({ drivers, onDriverClick, onAssignTruck }) => {
  return (
    <Card className="mb-8">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>License Number</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead className="hidden lg:table-cell">Assigned Truck</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Last Update</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.map(driver => (
              <TableRow
                key={driver.id}
                className="cursor-pointer"
                onClick={() => onDriverClick(driver)}
              >
                <TableCell className="font-medium">{driver.name}</TableCell>
                <TableCell className="font-mono text-primary">{driver.licenseNumber}</TableCell>
                <TableCell className="hidden md:table-cell">{driver.phone}</TableCell>
                <TableCell className="hidden lg:table-cell">{driver.assignedTruck || 'None'}</TableCell>
                <TableCell>
                  <Badge variant={driver.status}>{driver.status}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{driver.lastUpdate}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAssignTruck && onAssignTruck(driver);
                      }}
                      title="Assign Truck"
                    >
                      <Truck className="h-4 w-4" />
                      <span className="sr-only">Assign Truck</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDriverClick(driver);
                      }}
                      title="View Details"
                    >
                      <Info className="h-4 w-4" />
                      <span className="sr-only">Details</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DriverList;
