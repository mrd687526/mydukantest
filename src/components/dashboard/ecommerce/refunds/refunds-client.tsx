"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { RefundsDataTable } from "./refunds-data-table";
import { OrderRefundRequest } from "@/lib/types";

interface RefundsClientProps {
  refundRequests: OrderRefundRequest[];
}

export function RefundsClient({ refundRequests }: RefundsClientProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Order Refund Requests</CardTitle>
            <CardDescription>
              Manage and track refund requests from your customers.
            </CardDescription>
          </div>
          {/* Future: Add button for manual refund request creation if needed */}
        </div>
      </CardHeader>
      <CardContent>
        <RefundsDataTable data={refundRequests} />
      </CardContent>
    </Card>
  );
}