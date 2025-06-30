"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CampaignTagsDataTable } from "./campaign-tags-data-table";
import { CreateTagDialog } from "./create-tag-dialog";
import { CampaignTag } from "@/lib/types";

interface CampaignTagsClientProps {
  campaignTags: CampaignTag[];
}

export function CampaignTagsClient({ campaignTags }: CampaignTagsClientProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Campaign Tags</CardTitle>
            <CardDescription>
              Create, manage, and search your custom tags for organizing campaigns.
            </CardDescription>
          </div>
          <CreateTagDialog />
        </div>
      </CardHeader>
      <CardContent>
        <CampaignTagsDataTable data={campaignTags} />
      </CardContent>
    </Card>
  );
}