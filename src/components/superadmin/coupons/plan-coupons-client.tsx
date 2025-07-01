"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PlanCouponsDataTable } from "./plan-coupons-data-table";
import { CreatePlanCouponDialog } from "./create-plan-coupon-dialog";
import { PlanCoupon } from "@/lib/types";

interface PlanCouponsClientProps {
  coupons: PlanCoupon[];
}

export function PlanCouponsClient({ coupons }: PlanCouponsClientProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Plan Coupon Management</CardTitle>
            <CardDescription>
              Create and manage discount codes for subscription plans.
            </CardDescription>
          </div>
          <CreatePlanCouponDialog />
        </div>
      </CardHeader>
      <CardContent>
        <PlanCouponsDataTable data={coupons} />
      </CardContent>
    </Card>
  );
}