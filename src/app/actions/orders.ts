"use server";

import { createClient } from "@/integrations/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Schema for creating a new order (for future use, e.g., manual order creation or API integration)
const orderSchema = z.object({
  order_number: z.string().min(1, "Order number is required."),
  customer_name: z.string().min(1, "Customer name is required."),
  customer_email: z.string().email("Invalid email format."),
  total_amount: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0.01, "Total amount must be greater than 0.")
  ),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).default('pending'),
});

export async function createOrder(values: z.infer<typeof orderSchema>) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to create an order." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "You must have a profile to create an order." };
  }

  const { error } = await supabase.from("orders").insert({
    profile_id: profile.id,
    order_number: values.order_number,
    customer_name: values.customer_name,
    customer_email: values.customer_email,
    total_amount: values.total_amount,
    status: values.status,
  });

  if (error) {
    console.error("Supabase error creating order:", error.message);
    return { error: "Database error: Could not create order." };
  }

  revalidatePath("/dashboard/ecommerce/orders");
  return { success: true };
}

export async function deleteOrder(orderId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").delete().eq("id", orderId);

  if (error) {
    console.error("Supabase error deleting order:", error.message);
    return { error: "Database error: Could not delete order." };
  }

  revalidatePath("/dashboard/ecommerce/orders");
  return { success: true };
}

export async function updateOrderStatus(orderId: string, newStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled') {
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (error) {
    console.error("Supabase error updating order status:", error.message);
    return { error: "Database error: Could not update order status." };
  }

  revalidatePath("/dashboard/ecommerce/orders");
  return { success: true };
}