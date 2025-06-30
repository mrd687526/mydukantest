"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { OrdersDataTable } from "./orders-data-table";
import { Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { CreateOrderDialog } from "./create-order-dialog"; // Will create this next

interface OrdersClientProps {
  orders: Order[];
}

export function OrdersClient({ orders }: OrdersClientProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Orders</CardTitle>
            <CardDescription>
              Manage your store's customer orders.
            </CardDescription>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Order
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <OrdersDataTable data={orders} />
      </CardContent>
      {isCreateDialogOpen && (
        <CreateOrderDialog onClose={() => setIsCreateDialogOpen(false)} />
      )}
    </Card>
  );
}