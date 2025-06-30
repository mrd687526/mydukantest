"use server";

import { createClient } from "@/integrations/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
});

export async function updateProfile(values: z.infer<typeof profileUpdateSchema>) {
  const supabase = createClient();

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