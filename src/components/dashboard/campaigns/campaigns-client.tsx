"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CampaignsDataTable } from "./campaigns-data-table";
import { AutomationCampaign } from "@/lib/types";
import { CreateCampaignDialog } from "./create-campaign-dialog";

interface CampaignsClientProps {
  campaigns: AutomationCampaign[];
}

export function CampaignsClient({ campaigns }: CampaignsClientProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Automation Campaigns</CardTitle>
            <CardDescription>
              Create, manage, and monitor your automation campaigns.
            </CardDescription>
          </div>
          <CreateCampaignDialog />
        </div>
      </CardHeader>
      <CardContent>
        <CampaignsDataTable data={campaigns} />
      </CardContent>
    </Card>
  );
}