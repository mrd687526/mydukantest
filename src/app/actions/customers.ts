"use server";

import { createClient } from "@/integrations/supabase/server";
import { revalidatePath } from "next/cache";
import { Customer } from "@/lib/types"; // Import Customer type

export async function getCustomers(): Promise<{ data: Customer[] | null; error: string | null }> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "You must be logged in to view customers." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id) // Fetch profile by user.id
    .single();

  if (!profile) {
    return { data: null, error: "You must have a profile to view customers." };
  }

  // Use the new RPC function to get customers with aggregated data
  const { data: customers, error } = await supabase.rpc("get_customer_analytics", {
    p_profile_id: profile.id,
  });

  if (error) {
    console.error("Supabase error fetching customers:", error.message);
    return { data: null, error: "Database error: Could not fetch customers." };
  }

  return { data: customers as Customer[], error: null };
}

export async function deleteCustomer(customerId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("customers").delete().eq("id", customerId);

  if (error) {
    console.error("Supabase error deleting customer:", error.message);
    return { error: "Database error: Could not delete customer." };
  }

  revalidatePath("/dashboard/ecommerce/customers");
  revalidatePath("/dashboard/ecommerce/orders"); // Orders might be affected
  revalidatePath("/dashboard/ecommerce/analytics"); // Analytics might be affected
  revalidatePath("/dashboard/ecommerce/top-sales-reports"); // Top sales reports will be affected
  return { success: true };
}

export async function updateCustomerLastActive(customerId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('customers')
    .update({ last_active: new Date().toISOString() })
    .eq('id', customerId);

  if (error) {
    console.error("Error updating customer last_active:", error.message);
    return { error: "Failed to update customer last active time." };
  }
  return { success: true };
}

export async function exportCustomersToCsv(): Promise<{ data: string | null; error: string | null }> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "You must be logged in to export data." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { data: null, error: "You must have a profile to export data." };
  }

  const { data: customers, error } = await supabase.rpc("get_customer_analytics", {
    p_profile_id: profile.id,
  });

  if (error) {
    console.error("Supabase error fetching customers for export:", error.message);
    return { data: null, error: "Database error: Could not fetch customers for export." };
  }

  if (!customers || customers.length === 0) {
    return { data: null, error: "No customer data to export." };
  }

  // Define CSV headers
  const headers = [
    "ID", "Name", "Email", "Created At", "Updated At", "Last Active", "Status",
    "Orders Count", "Total Spend", "AOV"
  ];

  // Map data to CSV rows
  const csvRows = customers.map((customer: Customer) => [
    customer.id,
    customer.name,
    customer.email,
    customer.created_at,
    customer.updated_at,
    customer.last_active || "",
    customer.status,
    customer.orders_count,
    customer.total_spend,
    customer.aov,
  ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')); // Enclose fields in quotes and escape existing quotes

  const csvContent = [
    headers.join(','),
    ...csvRows
  ].join('\n');

  return { data: csvContent, error: null };
}