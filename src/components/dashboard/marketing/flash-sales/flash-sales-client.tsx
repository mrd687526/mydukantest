"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FlashSalesDataTable } from "./flash-sales-data-table";
import { CreateFlashSaleDialog } from "./create-flash-sale-dialog";
import { FlashSale } from "@/lib/types";

interface FlashSalesClientProps {
  flashSales: FlashSale[];
}

export function FlashSalesClient({ flashSales }: FlashSalesClientProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Flash Sales</CardTitle>
            <CardDescription>
              Create and manage your limited-time sales and promotions.
            </CardDescription>
          </div>
          <CreateFlashSaleDialog />
        </div>
      </CardHeader>
      <CardContent>
        <FlashSalesDataTable data={flashSales} />
      </CardContent>
    </Card>
  );
}