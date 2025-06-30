"use server";

import { createClient } from "@/integrations/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
});

export async function updateProfile(values: z.infer<typeof profileUpdateSchema>) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to update your profile." };
  }

  const { data: profile, error: fetchProfileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (fetchProfileError || !profile) {
    console.error("Supabase error fetching profile for update:", fetchProfileError?.message);
    return { error: "User profile not found." };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ name: values.name })
    .eq("id", profile.id);

  if (updateError) {
    console.error("Supabase error updating profile:", updateError.message);
    return { error: "Database error: Could not update profile." };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard"); // Revalidate dashboard to reflect name change in header
  return { success: true, message: "Profile updated successfully!" };
}