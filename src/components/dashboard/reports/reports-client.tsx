"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ReportsDataTable } from "./reports-data-table";
import { CampaignReport } from "@/lib/types";

interface ReportsClientProps {
  reports: CampaignReport[];
}

export function ReportsClient({ reports }: ReportsClientProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Reports</CardTitle>
        <CardDescription>
          A detailed log of all automated actions performed by your campaigns.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ReportsDataTable data={reports} />
      </CardContent>
    </Card>
  );
}