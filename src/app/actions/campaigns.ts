"use server";

import { createClient } from "@/integrations/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const campaignFormSchema = z.object({
  name: z.string().min(3, "Campaign name must be at least 3 characters."),
});

export async function createCampaign(values: z.infer<typeof campaignFormSchema>) {
  const supabase = await createClient();

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
    const supabase = await createClient();
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

export async function deleteCampaign(campaignId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("automation_campaigns")
    .delete()
    .eq("id", campaignId);

  if (error) {
    console.error("Error deleting campaign:", error);
    return { error: "Database error: Could not delete campaign." };
  }

  revalidatePath("/dashboard/campaigns");
  return { success: true };
}

export async function assignCampaignToPost(campaignId: string, postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to assign a campaign." };

  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user.id).single();
  if (!profile) return { error: "Profile not found." };

  // Un-assign any other campaign from this post by this user to avoid conflicts.
  const { data: existingCampaigns, error: fetchError } = await supabase
    .from("automation_campaigns")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("post_id", postId);

  if (fetchError) {
    console.error("Error fetching existing campaigns for post:", fetchError);
    return { error: "Database error: Could not verify existing campaigns." };
  }

  if (existingCampaigns) {
    for (const camp of existingCampaigns) {
      await supabase.from("automation_campaigns").update({ post_id: null }).eq("id", camp.id);
    }
  }

  // Assign the new campaign
  const { error } = await supabase
    .from("automation_campaigns")
    .update({ post_id: postId })
    .eq("id", campaignId);

  if (error) {
    console.error("Error assigning campaign to post:", error);
    return { error: "Database error: Could not assign campaign." };
  }

  revalidatePath("/dashboard/facebook-posts");
  return { success: true };
}

export async function unassignCampaignFromPost(campaignId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to unassign a campaign." };

  const { error } = await supabase
    .from("automation_campaigns")
    .update({ post_id: null })
    .eq("id", campaignId);

  if (error) {
    console.error("Error unassigning campaign from post:", error);
    return { error: "Database error: Could not unassign campaign." };
  }

  revalidatePath("/dashboard/facebook-posts");
  return { success: true };
}