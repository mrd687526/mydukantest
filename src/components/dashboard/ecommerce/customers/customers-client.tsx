"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CustomersDataTable } from "./customers-data-table";
import { Customer } from "@/lib/types";

interface CustomersClientProps {
  customers: Customer[];
}

export function CustomersClient({ customers }: CustomersClientProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Customers</CardTitle>
            <CardDescription>
              View and manage your customer list. Customers are automatically added when an order is created.
            </CardDescription>
          </div>
          {/* Future: Add button for manual customer creation if needed */}
        </div>
      </CardHeader>
      <CardContent>
        <CustomersDataTable data={customers} />
      </CardContent>
    </Card>
  );
}