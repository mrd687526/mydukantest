"use server";

import { createClient } from "@/integrations/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { NewsletterSubscriber } from "@/lib/types";

const subscribeSchema = z.object({
  email: z.string().email("Invalid email format."),
});

export async function subscribeToNewsletter(values: z.infer<typeof subscribeSchema>) {
  const supabase = createClient();

  // For public subscription, we need to determine the profile_id of the store.
  // For this demo, we'll fetch the profile_id of the first store_admin.
  const { data: storeProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "store_admin")
    .limit(1)
    .single();

  if (profileError || !storeProfile) {
    console.error("Error fetching store profile for newsletter subscription:", profileError?.message);
    return { error: "Could not determine store for subscription." };
  }

  const { error } = await supabase.from("newsletter_subscribers").insert({
    profile_id: storeProfile.id,
    email: values.email,
  });

  if (error) {
    console.error("Supabase error subscribing to newsletter:", error.message);
    if (error.code === '23505') { // Unique violation code
      return { error: "This email is already subscribed." };
    }
    return { error: "Database error: Could not subscribe to newsletter." };
  }

  revalidatePath("/dashboard/marketing/newsletter");
  return { success: true, message: "Successfully subscribed to the newsletter!" };
}

export async function getNewsletterSubscribers(): Promise<{ data: NewsletterSubscriber[] | null; error: string | null }> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "You must be logged in to view subscribers." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { data: null, error: "Profile not found." };
  }

  const { data: subscribers, error } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .eq("profile_id", profile.id)
    .order("subscribed_at", { ascending: false });

  if (error) {
    console.error("Supabase error fetching newsletter subscribers:", error.message);
    return { data: null, error: "Database error: Could not fetch subscribers." };
  }

  return { data: subscribers, error: null };
}

export async function deleteNewsletterSubscriber(subscriberId: number) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to delete a subscriber." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { error: "Profile not found." };
  }

  const { error } = await supabase
    .from("newsletter_subscribers")
    .delete()
    .eq("id", subscriberId)
    .eq("profile_id", profile.id); // Ensure user owns the subscriber record

  if (error) {
    console.error("Supabase error deleting newsletter subscriber:", error.message);
    return { error: "Database error: Could not delete subscriber." };
  }

  revalidatePath("/dashboard/marketing/newsletter");
  return { success: true, message: "Subscriber deleted successfully!" };
}