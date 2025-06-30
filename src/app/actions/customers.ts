"use server";

import { createClient } from "@/integrations/supabase/server";
import { revalidatePath } from "next/cache";

export async function getCustomers() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "You must be logged in to view customers." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { data: null, error: "You must have a profile to view customers." };
  }

  const { data: customers, error } = await supabase
    .from("customers")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error fetching customers:", error.message);
    return { data: null, error: "Database error: Could not fetch customers." };
  }

  return { data: customers, error: null };
}

export async function deleteCustomer(customerId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("customers").delete().eq("id", customerId);

  if (error) {
    console.error("Supabase error deleting customer:", error.message);
    return { error: "Database error: Could not delete customer." };
  }

  revalidatePath("/dashboard/ecommerce/customers");
  revalidatePath("/dashboard/ecommerce/orders"); // Orders might be affected
  return { success: true };
}