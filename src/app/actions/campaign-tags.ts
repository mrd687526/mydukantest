"use server";

import { createClient } from "@/integrations/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const tagSchema = z.object({
  tag_name: z.string().min(1, "Tag name is required."),
});

export async function createCampaignTag(values: z.infer<typeof tagSchema>) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to create a tag." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "You must have a profile to create a tag." };
  }

  const { error } = await supabase.from("campaign_tags").insert({
    profile_id: profile.id,
    tag_name: values.tag_name,
  });

  if (error) {
    console.error("Supabase error creating campaign tag:", error.message);
    return { error: "Database error: Could not create tag. It might already exist." };
  }

  revalidatePath("/dashboard/campaign-tags");
  return { success: true };
}

export async function deleteCampaignTag(tagId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("campaign_tags").delete().eq("id", tagId);

  if (error) {
    console.error("Supabase error deleting campaign tag:", error.message);
    return { error: "Database error: Could not delete tag." };
  }

  revalidatePath("/dashboard/campaign-tags");
  return { success: true };
}