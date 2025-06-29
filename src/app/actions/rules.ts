"use server";

import { createClient } from "@/integrations/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const ruleSchema = z.object({
  campaign_id: z.string().uuid(),
  keyword: z.string().min(1, "Keyword is required."),
  match_type: z.enum(["exact", "contains"]),
  action: z.enum(["reply", "dm", "hide", "delete"]),
  reply_template_id: z.string().uuid().optional().nullable(),
});

export async function createCampaignRule(values: z.infer<typeof ruleSchema>) {
  const supabase = createClient();

  const { error } = await supabase.from("campaign_rules").insert({
    campaign_id: values.campaign_id,
    keyword: values.keyword,
    match_type: values.match_type,
    action: values.action,
    reply_template_id: values.reply_template_id,
  });

  if (error) {
    console.error("Error creating campaign rule:", error);
    return { error: "Database error: Could not create rule." };
  }

  revalidatePath(`/dashboard/campaigns/${values.campaign_id}`);
  return { success: true };
}

export async function deleteCampaignRule(ruleId: string, campaignId: string) {
  const supabase = createClient();

  const { error } = await supabase.from("campaign_rules").delete().eq("id", ruleId);

  if (error) {
    console.error("Error deleting campaign rule:", error);
    return { error: "Database error: Could not delete rule." };
  }

  revalidatePath(`/dashboard/campaigns/${campaignId}`);
  return { success: true };
}