"use server";

import { createClient } from "@/integrations/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Allow app secret to be optional. It will only be updated if a new value is provided.
const credentialsSchema = z.object({
  fb_app_id: z.string().trim().min(1, "Facebook App ID is required."),
  fb_app_secret: z.string().trim().optional(),
});

export async function saveCredentials(values: z.infer<typeof credentialsSchema>) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "You must have a profile." };
  }

  // Prepare the data for upsert.
  const dataToUpsert: { profile_id: string; fb_app_id: string; fb_app_secret?: string } = {
    profile_id: profile.id,
    fb_app_id: values.fb_app_id,
  };

  // Only include the app secret in the payload if the user entered a new one.
  // This prevents overwriting the existing secret with an empty string.
  if (values.fb_app_secret && values.fb_app_secret.length > 0) {
    dataToUpsert.fb_app_secret = values.fb_app_secret;
  }

  const { error } = await supabase
    .from("profile_credentials")
    .upsert(dataToUpsert, { onConflict: 'profile_id' });

  if (error) {
    console.error("Supabase error saving credentials:", error.message);
    return { error: "Database error: Could not save credentials." };
  }

  revalidatePath("/dashboard/settings");
  return { success: true, message: "Credentials saved successfully!" };
}