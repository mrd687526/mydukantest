"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PlanRequestsDataTable } from "./plan-requests-data-table";
import { PlanRequest } from "@/lib/types";

interface PlanRequestsClientProps {
  requests: PlanRequest[];
}

export function PlanRequestsClient({ requests }: PlanRequestsClientProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Plan Requests</CardTitle>
        <CardDescription>
          Review and process pending subscription plan requests from users.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PlanRequestsDataTable data={requests} />
      </CardContent>
    </Card>
  );
}