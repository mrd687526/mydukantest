"use server";

import { createClient } from "@/integrations/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { CustomerEvent } from "@/lib/types";

const customerEventSchema = z.object({
  customer_id: z.string().uuid("Invalid customer ID."),
  event_type: z.enum(['registered', 'last_login', 'added_to_wishlist', 'added_to_cart', 'placed_order']),
  event_details: z.record(z.any()).optional().nullable(),
});

export async function logCustomerEvent(values: z.infer<typeof customerEventSchema>) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // For customer-facing events, we might not always have a logged-in admin user.
    // We need to determine the profile_id from the customer_id or the context.
    // For simplicity, we'll assume the customer_id is linked to a profile.
    // In a real multi-tenant app, this might be more complex.
  }

  // Fetch the profile_id associated with the customer_id
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('profile_id')
    .eq('id', values.customer_id)
    .single();

  if (customerError || !customer) {
    console.error("Error fetching profile_id for customer event:", customerError?.message);
    return { error: "Could not determine associated store profile for event." };
  }

  const { error } = await supabase.from("customer_events").insert({
    profile_id: customer.profile_id,
    customer_id: values.customer_id,
    event_type: values.event_type,
    event_details: values.event_details,
  });

  if (error) {
    console.error("Supabase error logging customer event:", error.message);
    return { error: "Database error: Could not log customer event." };
  }

  // Revalidate paths that might display customer events or last active status
  revalidatePath(`/dashboard/ecommerce/customers/${values.customer_id}`);
  revalidatePath("/dashboard/ecommerce/customers");
  return { success: true };
}

export async function getCustomerEvents(customerId: string): Promise<{ data: CustomerEvent[] | null; error: string | null }> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Authentication required." };
  }

  // Verify that the current user is an admin for the associated profile
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('profile_id')
    .eq('id', customerId)
    .single();

  if (customerError || !customer) {
    return { data: null, error: "Customer not found." };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'store_admin') { // Only store_admin can view
    return { data: null, error: "Unauthorized: You do not have permission to view these events." };
  }

  const { data: events, error } = await supabase
    .from("customer_events")
    .select("*")
    .eq("customer_id", customerId)
    .eq("profile_id", customer.profile_id) // Ensure events belong to the same store
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error fetching customer events:", error.message);
    return { data: null, error: "Database error: Could not fetch customer events." };
  }

  return { data: events as CustomerEvent[], error: null };
}