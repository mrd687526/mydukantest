"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toggleCampaignStatus } from "@/app/actions/campaigns";
import type { AutomationCampaign } from "@/lib/types";

interface CampaignStatusToggleProps {
  campaign: AutomationCampaign;
}

export function CampaignStatusToggle({ campaign }: CampaignStatusToggleProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleCampaignStatus(campaign.id, campaign.is_active);
      if (result.error) {
        toast.error("Failed to update status", { description: result.error });
      } else {
        toast.success(`Campaign ${!campaign.is_active ? "activated" : "deactivated"}.`);
      }
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={`status-toggle-${campaign.id}`}
        checked={campaign.is_active}
        onCheckedChange={handleToggle}
        disabled={isPending}
        aria-readonly={isPending}
      />
      <Label htmlFor={`status-toggle-${campaign.id}`}>
        {isPending ? "Updating..." : campaign.is_active ? "Active" : "Inactive"}
      </Label>
    </div>
  );
}