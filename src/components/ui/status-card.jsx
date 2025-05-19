import React from "react";
import { Card, CardContent } from "./card";
import { cn } from "../../lib/utils";

const statusVariants = {
  active: "border-l-4 border-l-green-500 bg-green-50/50",
  maintenance: "border-l-4 border-l-amber-500 bg-amber-50/50",
  inactive: "border-l-4 border-l-red-500 bg-red-50/50",
  total: "border-l-4 border-l-blue-500 bg-blue-50/50",
};

export function StatusCard({ title, count, status = "default", className, onClick }) {
  return (
    <Card
      className={cn(
        "transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-md",
        statusVariants[status],
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <p className="text-3xl font-bold mt-2">{count}</p>
      </CardContent>
    </Card>
  );
}
