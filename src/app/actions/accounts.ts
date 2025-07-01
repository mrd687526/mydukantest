"use server";

import { createServerClient } from "@/integrations/supabase/server";
import { revalidatePath } from "next/cache";
import type { FacebookPage } from "@/lib/types";

export async function connectFacebookPage(page: FacebookPage) {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
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

  // Check if this page is already connected for this profile
  const { data: existingAccount, error: selectError } = await supabase
    .from("connected_accounts")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("fb_page_id", page.id)
    .single();

  if (selectError && selectError.code !== "PGRST116") {
    // PGRST116 is the code for "Query returned 0 rows", which is not an error in this case.
    console.error("Supabase select error:", selectError.message);
    return { error: "Database error: Could not check for existing account." };
  }

  let dbError;

  if (existingAccount) {
    // If it exists, update the access token to ensure it's fresh.
    const { error } = await supabase
      .from("connected_accounts")
      .update({ access_token: page.access_token })
      .eq("id", existingAccount.id);
    dbError = error;
  } else {
    // If it doesn't exist, insert a new record.
    const { error } = await supabase.from("connected_accounts").insert({
      profile_id: profile.id,
      fb_page_id: page.id,
      access_token: page.access_token,
    });
    dbError = error;
  }

  if (dbError) {
    console.error("Supabase error connecting account:", dbError.message);
    return { error: "Database error: Could not connect account." };
  }

  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard/bot-manager");
  revalidatePath("/dashboard");
  return { success: true };
}