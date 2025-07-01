src/app/actions/settings.ts
"use server";

import { createServerClient } from "@/integrations/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Helper to check if the current user is a super admin
async function isSuperAdmin() {
  if (process.env.NODE_ENV === 'development') return true;
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === 'super_admin';
}

// --- User-specific Credentials ---
const credentialsSchema = z.object({
  fb_app_id: z.string().trim().min(1, "Facebook App ID is required."),
  fb_app_secret: z.string().trim().optional(),
});

export async function saveCredentials(values: z.infer<typeof credentialsSchema>) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };
  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user.id).single();
  if (!profile) return { error: "You must have a profile." };

  const dataToUpsert: { profile_id: string; fb_app_id: string; fb_app_secret?: string } = {
    profile_id: profile.id,
    fb_app_id: values.fb_app_id,
  };
  if (values.fb_app_secret && values.fb_app_secret.length > 0) {
    dataToUpsert.fb_app_secret = values.fb_app_secret;
  }

  const { error } = await supabase.from("profile_credentials").upsert(dataToUpsert, { onConflict: 'profile_id' });
  if (error) return { error: "Database error: Could not save credentials." };

  revalidatePath("/dashboard/settings");
  return { success: true, message: "Credentials saved successfully!" };
}

// --- Super Admin Settings ---
export async function getSettings() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  const { data: profile } = await supabase.from("profiles").select("id, role").eq("id", user.id).single();
  if (!profile) return { error: "Profile not found." };

  let query = supabase.from("settings").select("*");

  // If not a super admin, filter settings by profile_id (for store-specific settings)
  if (profile.role !== 'super_admin') {
    query = query.eq('profile_id', profile.id);
  } else {
    // For super admin, fetch all global settings (where profile_id is null or not set)
    // This assumes global settings don't have a profile_id or have a specific global ID.
    // For simplicity, we'll fetch all and let the forms handle which keys they care about.
    // A more robust solution might involve a separate 'global_settings' table or a specific profile_id for global settings.
  }

  const { data, error } = await query;

  if (error) return { error: "Failed to fetch settings." };
  
  const settingsObject = data.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, string | null>);
  
  return { data: settingsObject };
}

// Brand Settings
export async function updateBrandSettings(formData: FormData) {
  if (!await isSuperAdmin()) return { error: "Unauthorized" };
  const supabaseAdmin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const settingsToUpsert: { key: string; value: string }[] = [];

  settingsToUpsert.push({ key: 'enable_landing_page', value: formData.get('enable_landing_page') as string });
  settingsToUpsert.push({ key: 'enable_signup', value: formData.get('enable_signup') as string });

  const uploadAsset = async (file: File, assetKey: string) => {
    const { data, error } = await supabaseAdmin.storage.from('brand_assets').upload(`${assetKey}/${Date.now()}_${file.name}`, file, { upsert: true });
    if (error) throw new Error(`Failed to upload ${assetKey}: ${error.message}`);
    const { data: { publicUrl } } = supabaseAdmin.storage.from('brand_assets').getPublicUrl(data.path);
    settingsToUpsert.push({ key: assetKey, value: publicUrl });
  };

  try {
    const lightLogoFile = formData.get('brand_logo_light') as File | null;
    const darkLogoFile = formData.get('brand_logo_dark') as File | null;
    const faviconFile = formData.get('brand_favicon') as File | null;
    if (lightLogoFile && lightLogoFile.size > 0) await uploadAsset(lightLogoFile, 'brand_logo_light');
    if (darkLogoFile && darkLogoFile.size > 0) await uploadAsset(darkLogoFile, 'brand_logo_dark');
    if (faviconFile && faviconFile.size > 0) await uploadAsset(faviconFile, 'brand_favicon');
  } catch (error: any) {
    return { error: error.message };
  }

  if (settingsToUpsert.length > 0) {
    const { error } = await supabaseAdmin.from('settings').upsert(settingsToUpsert);
    if (error) return { error: "Failed to save brand settings." };
  }

  revalidatePath('/superadmin/settings/brand');
  return { success: true, message: 'Brand settings updated successfully!' };
}

// Storage Settings
const storageSettingsSchema = z.object({
  storage_allowed_file_types: z.array(z.string()),
  storage_max_file_size_mb: z.coerce.number().min(1),
});
export async function updateStorageSettings(values: z.infer<typeof storageSettingsSchema>) {
  if (!await isSuperAdmin()) return { error: "Unauthorized" };
  const supabase = createServerClient();
  const settingsToUpsert = [
    { key: 'storage_allowed_file_types', value: values.storage_allowed_file_types.join(',') },
    { key: 'storage_max_file_size_mb', value: String(values.storage_max_file_size_mb) },
  ];
  const { error } = await supabase.from("settings").upsert(settingsToUpsert);
  if (error) return { error: "Failed to update storage settings." };
  revalidatePath("/superadmin/settings/storage");
  return { success: true, message: "Storage settings updated successfully!" };
}

// Cookie Settings
const cookieSettingsSchema = z.object({
  cookie_banner_enabled: z.boolean(),
  cookie_title: z.string().optional().nullable(),
  cookie_description: z.string().optional().nullable(),
  cookie_contact_url: z.string().url().optional().nullable(),
  cookie_strict_mode_default: z.boolean(),
});
export async function updateCookieSettings(values: z.infer<typeof cookieSettingsSchema>) {
  if (!await isSuperAdmin()) return { error: "Unauthorized" };
  const supabase = createServerClient();
  const settingsToUpsert = Object.entries(values).map(([key, value]) => ({ key, value: String(value) }));
  const { error } = await supabase.from("settings").upsert(settingsToUpsert);
  if (error) return { error: "Failed to update cookie settings." };
  revalidatePath("/superadmin/settings/cookie");
  return { success: true, message: "Cookie settings updated successfully!" };
}

// Email Settings
const emailSettingsSchema = z.object({
  MAIL_DRIVER: z.string().optional().nullable(),
  MAIL_HOST: z.string().optional().nullable(),
  MAIL_PORT: z.string().optional().nullable(),
  MAIL_ENCRYPTION: z.string().optional().nullable(),
  MAIL_FROM_ADDRESS: z.string().optional().nullable(),
  MAIL_FROM_NAME: z.string().optional().nullable(),
});
export async function updateEmailSettings(values: z.infer<typeof emailSettingsSchema>) {
  if (!await isSuperAdmin()) return { error: "Unauthorized" };
  const supabase = createServerClient();
  const settingsToUpsert = Object.entries(values).map(([key, value]) => ({ key, value: value || null }));
  const { error } = await supabase.from("settings").upsert(settingsToUpsert);
  if (error) return { error: "Failed to update email settings." };
  revalidatePath("/superadmin/settings/email");
  return { success: true, message: "Email settings updated successfully!" };
}

// Analytics Settings
const analyticsSettingsSchema = z.object({
  ANALYTICS_URL: z.string().url("Please enter a valid URL.").optional().nullable(),
  ANALYTICS_WEBSITE_ID: z.string().optional().nullable(),
});
export async function updateAnalyticsSettings(values: z.infer<typeof analyticsSettingsSchema>) {
  if (!await isSuperAdmin()) return { error: "Unauthorized" };
  const supabase = createServerClient();
  const settingsToUpsert = Object.entries(values).map(([key, value]) => ({ key, value: value || null }));
  const { error } = await supabase.from("settings").upsert(settingsToUpsert);
  if (error) return { error: "Failed to update analytics settings." };
  revalidatePath("/superadmin/settings/analytics");
  return { success: true, message: "Analytics settings updated successfully!" };
}

// Notifications Settings (for Store Admins)
const notificationsSettingsSchema = z.object({
  enable_wishlist_emails: z.boolean(),
  enable_abandoned_cart_emails: z.boolean(),
});

export async function updateNotificationsSettings(values: z.infer<typeof notificationsSettingsSchema>) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();
  if (!profile) return { error: "Profile not found." };

  const settingsToUpsert = Object.entries(values).map(([key, value]) => ({
    profile_id: profile.id, // Link setting to the specific store profile
    key,
    value: String(value),
  }));

  const { error } = await supabase.from("settings").upsert(settingsToUpsert, { onConflict: 'profile_id,key' });

  if (error) {
    console.error("Error updating notifications settings:", error.message);
    return { error: "Database error: Could not update notification settings." };
  }

  revalidatePath("/dashboard/settings/notifications");
  return { success: true, message: "Notification settings updated successfully!" };
}