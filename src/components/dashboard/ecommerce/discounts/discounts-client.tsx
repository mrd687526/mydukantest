"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DiscountsDataTable } from "./discounts-data-table";
import { CreateDiscountDialog } from "./create-discount-dialog";
import { Discount } from "@/lib/types";

interface DiscountsClientProps {
  discounts: Discount[];
}

export function DiscountsClient({ discounts }: DiscountsClientProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Discounts</CardTitle>
            <CardDescription>
              Create and manage discount codes and automatic promotions.
            </CardDescription>
          </div>
          <CreateDiscountDialog />
        </div>
      </CardHeader>
      <CardContent>
        <DiscountsDataTable data={discounts} />
      </CardContent>
    </Card>
  );
}