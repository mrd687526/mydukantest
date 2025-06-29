"use server";

import { createClient } from "@/integrations/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const campaignFormSchema = z.object({
  name: z.string().min(3, "Campaign name must be at least 3 characters."),
});

export async function createCampaign(values: z.infer<typeof campaignFormSchema>) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to create a campaign." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "You must have a profile to create a campaign." };
  }

  const { error } = await supabase.from("automation_campaigns").insert({
    name: values.name,
    profile_id: profile.id,
    is_active: false, // Default to inactive
  });

  if (error) {
    console.error("Supabase error creating campaign:", error.message);
    return { error: "Database error: Could not create campaign." };
  }

  revalidatePath("/dashboard/campaigns");
  return { error: null };
}

export async function toggleCampaignStatus(campaignId: string, currentState: boolean) {
    const supabase = createClient();
    const { error } = await supabase
        .from("automation_campaigns")
        .update({ is_active: !currentState })
        .eq("id", campaignId);

    if (error) {
        console.error("Error toggling campaign status:", error);
        return { error: "Failed to update campaign status." };
    }

    revalidatePath(`/dashboard/campaigns/${campaignId}`);
    revalidatePath("/dashboard/campaigns");
    return { success: true };
}