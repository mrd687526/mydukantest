"use server";

import { createClient } from "@/integrations/supabase/server";
import { revalidatePath } from "next/cache";
import type { FacebookPage } from "@/lib/types";

export async function connectFacebookPage(page: FacebookPage) {
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

  // Upsert ensures we don't create duplicate entries for the same page
  const { error } = await supabase.from("connected_accounts").upsert({
    profile_id: profile.id,
    fb_page_id: page.id,
    access_token: page.access_token,
  }, { onConflict: 'fb_page_id, profile_id' });

  if (error) {
    console.error("Supabase error connecting account:", error.message);
    return { error: "Database error: Could not connect account." };
  }

  revalidatePath("/dashboard/accounts");
  return { success: true };
}