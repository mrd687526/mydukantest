"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PlansDataTable } from "./plans-data-table";
import { CreatePlanDialog } from "./create-plan-dialog";
import { Plan } from "@/lib/types";

interface PlansClientProps {
  plans: Plan[];
}

export function PlansClient({ plans }: PlansClientProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Subscription Plans</CardTitle>
            <CardDescription>
              Manage the different subscription plans offered to your users.
            </CardDescription>
          </div>
          <CreatePlanDialog />
        </div>
      </CardHeader>
      <CardContent>
        <PlansDataTable data={plans} />
      </CardContent>
    </Card>
  );
}