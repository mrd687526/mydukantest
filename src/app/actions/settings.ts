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
  const supabase = createClient();

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

// --- Email Settings Actions ---

const emailSettingsSchema = z.object({
  MAIL_DRIVER: z.string().optional().nullable(),
  MAIL_HOST: z.string().optional().nullable(),
  MAIL_PORT: z.string().optional().nullable(),
  MAIL_ENCRYPTION: z.string().optional().nullable(),
  MAIL_FROM_ADDRESS: z.string().optional().nullable(),
  MAIL_FROM_NAME: z.string().optional().nullable(),
});

export async function getEmailSettings() {
  const supabase = createClient();
  const { data, error } = await supabase.from("settings").select("*");

  if (error) {
    console.error("Error fetching email settings:", error);
    return { error: "Failed to fetch settings." };
  }

  const settingsObject = data.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, string | null>);

  return { data: settingsObject };
}

export async function updateEmailSettings(values: z.infer<typeof emailSettingsSchema>) {
  const supabase = createClient();

  const settingsToUpsert = Object.entries(values).map(([key, value]) => ({
    key,
    value: value || null,
  }));

  const { error } = await supabase.from("settings").upsert(settingsToUpsert);

  if (error) {
    console.error("Error updating email settings:", error);
    return { error: "Failed to update settings." };
  }

  revalidatePath("/superadmin/settings/email");
  return { success: true, message: "Email settings updated successfully!" };
}