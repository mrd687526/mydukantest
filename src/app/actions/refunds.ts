"use server";

import { createClient } from "@/integrations/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const createRefundRequestSchema = z.object({
  order_id: z.string().uuid("Invalid order ID."),
  reason: z.string().optional().nullable(),
});

const updateRefundRequestStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
});

export async function createRefundRequest(values: z.infer<typeof createRefundRequestSchema>) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to create a refund request." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "You must have a profile to create a refund request." };
  }

  const { error } = await supabase.from("order_refund_requests").insert({
    order_id: values.order_id,
    profile_id: profile.id,
    reason: values.reason,
    status: 'pending', // Default status
  });

  if (error) {
    console.error("Supabase error creating refund request:", error.message);
    return { error: "Database error: Could not create refund request." };
  }

  revalidatePath("/dashboard/ecommerce/refunds");
  revalidatePath("/dashboard/ecommerce/orders"); // Potentially update order status
  return { success: true, message: "Refund request created successfully!" };
}

export async function updateRefundRequestStatus(refundId: string, newStatus: z.infer<typeof updateRefundRequestStatusSchema>['status']) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to update a refund request." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "You must have a profile to update a refund request." };
  }

  const { error } = await supabase
    .from("order_refund_requests")
    .update({ status: newStatus })
    .eq("id", refundId)
    .eq("profile_id", profile.id); // Ensure user owns the request

  if (error) {
    console.error("Supabase error updating refund request status:", error.message);
    return { error: "Database error: Could not update refund request status." };
  }

  revalidatePath("/dashboard/ecommerce/refunds");
  return { success: true, message: "Refund request status updated successfully!" };
}

export async function deleteRefundRequest(refundId: string) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to delete a refund request." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "You must have a profile to delete a refund request." };
  }

  const { error } = await supabase
    .from("order_refund_requests")
    .delete()
    .eq("id", refundId)
    .eq("profile_id", profile.id); // Ensure user owns the request

  if (error) {
    console.error("Supabase error deleting refund request:", error.message);
    return { error: "Database error: Could not delete refund request." };
  }

  revalidatePath("/dashboard/ecommerce/refunds");
  return { success: true, message: "Refund request deleted successfully!" };
}

export async function getRefundRequests() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "You must be logged in to view refund requests." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { data: null, error: "You must have a profile to view refund requests." };
  }

  const { data: refundRequests, error } = await supabase
    .from("order_refund_requests")
    .select(`
      *,
      orders (
        order_number,
        customer_name,
        total_amount
      )
    `)
    .eq("profile_id", profile.id)
    .order("request_date", { ascending: false });

  if (error) {
    console.error("Supabase error fetching refund requests:", error.message);
    return { data: null, error: "Database error: Could not fetch refund requests." };
  }

  return { data: refundRequests, error: null };
}