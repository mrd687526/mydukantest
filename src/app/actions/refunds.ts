"use server";

import { createServerClient } from "@/integrations/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const createRefundRequestSchema = z.object({
  order_id: z.string().uuid("Invalid order ID."),
  reason: z.string().optional().nullable(),
  customer_attachment_url: z.string().url("Invalid URL format.").optional().nullable(), // Added for customer attachments
});

const updateRefundRequestStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
});

export async function createRefundRequest(values: z.infer<typeof createRefundRequestSchema>) {
  const supabase = createServerClient();

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
    profile_id: profile.id, // Link to the store's profile
    reason: values.reason,
    customer_attachment_url: values.customer_attachment_url, // Save attachment URL
    status: 'pending', // Default status
  });

  if (error) {
    console.error("Supabase error creating refund request:", error.message);
    return { error: "Database error: Could not create refund request." };
  }

  revalidatePath("/dashboard/ecommerce/refunds");
  revalidatePath("/dashboard/ecommerce/orders"); // Potentially update order status
  revalidatePath("/store/account"); // Revalidate customer's account page
  return { success: true, message: "Refund request created successfully!" };
}

export async function createCustomerRefundRequest(formData: FormData) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  const orderId = formData.get('order_id') as string;
  const reason = formData.get('reason') as string;
  const attachmentFile = formData.get('attachment') as File | null;

  if (!orderId) return { error: "Order ID is required." };

  // Determine the store's profile_id for this order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('profile_id, customer_id, status')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    console.error("Error fetching order for refund request:", orderError?.message);
    return { error: "Order not found or you don't have permission." };
  }

  // Verify that the current user is the customer who placed this order
  const { data: customerProfile, error: customerProfileError } = await supabase
    .from('customers')
    .select('id')
    .eq('email', user.email!)
    .eq('profile_id', order.profile_id) // Ensure customer belongs to this store
    .single();

  if (customerProfileError || !customerProfile || customerProfile.id !== order.customer_id) {
    return { error: "You are not authorized to request a refund for this order." };
  }

  if (order.status !== 'delivered') {
    return { error: "Refunds can only be requested for delivered orders." };
  }

  let attachmentUrl: string | null = null;
  if (attachmentFile && attachmentFile.size > 0) {
    const filePath = `refund_attachments/${order.profile_id}/${orderId}/${Date.now()}_${attachmentFile.name}`;
    const { data, error: uploadError } = await supabase.storage.from('refund_attachments').upload(filePath, attachmentFile, { upsert: true });
    if (uploadError) {
      console.error("Error uploading attachment:", uploadError);
      return { error: "Failed to upload attachment." };
    }
    const { data: { publicUrl } } = supabase.storage.from('refund_attachments').getPublicUrl(filePath);
    attachmentUrl = publicUrl;
  }

  const { error } = await supabase.from("order_refund_requests").insert({
    order_id: orderId,
    profile_id: order.profile_id, // Link to the store's profile
    reason: reason,
    customer_attachment_url: attachmentUrl,
    status: 'pending',
  });

  if (error) {
    console.error("Supabase error creating customer refund request:", error.message);
    if (error.code === '23505') { // Unique violation, e.g., if a request already exists for this order
      return { error: "A refund request for this order already exists." };
    }
    return { error: "Database error: Could not create refund request." };
  }

  revalidatePath("/store/account");
  revalidatePath("/dashboard/ecommerce/refunds");
  return { success: true, message: "Refund request submitted successfully!" };
}

export async function updateRefundRequestStatus(refundId: string, newStatus: z.infer<typeof updateRefundRequestStatusSchema>['status']) {
  const supabase = createServerClient();

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
  revalidatePath("/store/account"); // Revalidate customer's account page
  return { success: true, message: "Refund request status updated successfully!" };
}

export async function deleteRefundRequest(refundId: string) {
  const supabase = createServerClient();

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
  revalidatePath("/store/account"); // Revalidate customer's account page
  return { success: true, message: "Refund request deleted successfully!" };
}

export async function getRefundRequests() {
  const supabase = createServerClient();

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
        total_amount,
        status
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