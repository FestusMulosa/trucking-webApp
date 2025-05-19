import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "./table";
import { Badge } from "./badge";

export function TruckList({ trucks, onTruckClick }) {
  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Truck Status</h2>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Truck ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Route</TableHead>
            <TableHead className="hidden md:table-cell">Last Update</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trucks.map((truck) => (
            <TableRow
              key={truck.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onTruckClick(truck)}
            >
              <TableCell className="font-medium">{truck.name}</TableCell>
              <TableCell>
                <Badge variant={truck.status}>{truck.status}</Badge>
              </TableCell>
              <TableCell>{truck.route}</TableCell>
              <TableCell className="hidden md:table-cell">{truck.lastUpdate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
