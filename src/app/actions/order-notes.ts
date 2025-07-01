"use server";

import { createClient } from "@/integrations/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { OrderNote } from "@/lib/types";

const createOrderNoteSchema = z.object({
  order_id: z.string().uuid("Invalid order ID."),
  note_text: z.string().min(1, "Note text cannot be empty."),
  is_customer_visible: z.boolean().default(false),
});

export async function createOrderNote(values: z.infer<typeof createOrderNoteSchema>) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Authentication required." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { error: "Profile not found." };
  }

  const { error } = await supabase.from("order_notes").insert({
    profile_id: profile.id,
    order_id: values.order_id,
    note_text: values.note_text,
    is_customer_visible: values.is_customer_visible,
  });

  if (error) {
    console.error("Supabase error creating order note:", error.message);
    return { error: "Database error: Could not create order note." };
  }

  revalidatePath(`/dashboard/ecommerce/orders/${values.order_id}`);
  return { success: true, message: "Order note added successfully!" };
}

export async function getOrderNotes(orderId: string): Promise<{ data: OrderNote[] | null; error: string | null }> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Authentication required." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { data: null, error: "Profile not found." };
  }

  let query = supabase
    .from("order_notes")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  // Apply RLS logic for customers if not an admin
  if (profile.role !== 'super_admin' && profile.role !== 'store_admin') {
    query = query.eq('is_customer_visible', true);
    // Further filter by customer's own orders (handled by RLS policy on table)
  } else {
    // For admins, ensure they only see notes for their store's orders
    query = query.eq('profile_id', profile.id);
  }

  const { data: notes, error } = await query;

  if (error) {
    console.error("Supabase error fetching order notes:", error.message);
    return { data: null, error: "Database error: Could not fetch order notes." };
  }

  return { data: notes as OrderNote[], error: null };
}

export async function deleteOrderNote(noteId: number, orderId: string) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Authentication required." };
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
    .from("order_notes")
    .delete()
    .eq("id", noteId)
    .eq("profile_id", profile.id); // Ensure admin owns the note

  if (error) {
    console.error("Supabase error deleting order note:", error.message);
    return { error: "Database error: Could not delete order note." };
  }

  revalidatePath(`/dashboard/ecommerce/orders/${orderId}`);
  return { success: true, message: "Order note deleted successfully!" };
}