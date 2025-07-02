"use server";

import { createServerClient } from "@/integrations/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
});

export async function updateProfile(values: z.infer<typeof profileUpdateSchema>) {
  const supabase = createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to update your profile." };
  }

  // The profile ID is now the user's ID
  const profileId = user.id;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ name: values.name })
    .eq("id", profileId); // Use 'id' directly

  if (updateError) {
    console.error("Supabase error updating profile:", updateError.message);
    return { error: "Database error: Could not update profile." };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard"); // Revalidate dashboard to reflect name change in header
  return { success: true, message: "Profile updated successfully!" };
}

export async function updateProfileSettings(formData: FormData) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };
  const profileId = user.id;

  // Handle avatar upload
  let avatarUrl = formData.get('avatar') as string | null;
  const avatarFile = formData.get('avatar_file') as File | null;
  if (avatarFile && avatarFile.size > 0) {
    const filePath = `avatars/${profileId}/${Date.now()}_${avatarFile.name}`;
    const { data, error: uploadError } = await supabase.storage.from('brand_assets').upload(filePath, avatarFile, { upsert: true });
    if (uploadError) {
      console.error("Error uploading avatar:", uploadError);
      return { error: "Failed to upload avatar." };
    }
    const { data: { publicUrl } } = supabase.storage.from('brand_assets').getPublicUrl(filePath);
    avatarUrl = publicUrl;
  }

  // Handle logo upload
  let logoUrl = formData.get('logo_url') as string | null;
  const logoFile = formData.get('logo_file') as File | null;
  if (logoFile && logoFile.size > 0) {
    const filePath = `store_logos/${profileId}/${Date.now()}_${logoFile.name}`;
    const { data, error: uploadError } = await supabase.storage.from('brand_assets').upload(filePath, logoFile, { upsert: true });
    if (uploadError) {
      console.error("Error uploading logo:", uploadError);
      return { error: "Failed to upload logo." };
    }
    const { data: { publicUrl } } = supabase.storage.from('brand_assets').getPublicUrl(filePath);
    logoUrl = publicUrl;
  }

  // Prepare update object
  const updateObj: Record<string, any> = {};
  for (const [key, value] of formData.entries()) {
    if (key.endsWith('_file')) continue; // skip file fields
    if (key === 'avatar' && avatarUrl) updateObj['avatar'] = avatarUrl;
    else if (key === 'logo_url' && logoUrl) updateObj['logo_url'] = logoUrl;
    else if (key !== 'avatar' && key !== 'logo_url') updateObj[key] = value;
  }
  if (avatarUrl) updateObj['avatar'] = avatarUrl;
  if (logoUrl) updateObj['logo_url'] = logoUrl;

  const { error } = await supabase
    .from("profiles")
    .update(updateObj)
    .eq("id", profileId);

  if (error) {
    console.error("Supabase error updating profile settings:", error.message);
    return { error: "Database error: Could not update profile settings." };
  }

  revalidatePath("/dashboard/settings/identity");
  revalidatePath("/dashboard");
  return { success: true, message: "Profile settings updated successfully!" };
}