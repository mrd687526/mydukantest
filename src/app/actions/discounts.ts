"use server";

import { createClient } from "@/integrations/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const discountSchema = z.object({
  code: z.string().min(1, "Discount code is required."),
  type: z.enum(['percentage', 'fixed_amount', 'free_shipping']),
  value: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0, "Value must be a non-negative number.")
  ),
  min_purchase_amount: z.preprocess(
    (val) => val ? parseFloat(String(val)) : null,
    z.number().min(0).optional().nullable()
  ),
  usage_limit: z.preprocess(
    (val) => val ? parseInt(String(val), 10) : null,
    z.number().int().min(0).optional().nullable()
  ),
  start_date: z.string().datetime({ message: "Invalid start date format." }),
  end_date: z.string().datetime({ message: "Invalid end date format." }).optional().nullable(),
  is_active: z.boolean().default(true),
});

export async function createDiscount(values: z.infer<typeof discountSchema>) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to create a discount." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "You must have a profile to create a discount." };
  }

  const { error } = await supabase.from("discounts").insert({
    profile_id: profile.id,
    ...values,
  });

  if (error) {
    console.error("Supabase error creating discount:", error.message);
    if (error.code === '23505') { // Unique violation code
      return { error: "A discount with this code already exists for your profile." };
    }
    return { error: "Database error: Could not create discount." };
  }

  revalidatePath("/dashboard/ecommerce/discounts");
  return { success: true, message: "Discount created successfully!" };
}

export async function updateDiscount(discountId: string, values: z.infer<typeof discountSchema>) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to update a discount." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "You must have a profile to update a discount." };
  }

  const { error } = await supabase
    .from("discounts")
    .update(values)
    .eq("id", discountId)
    .eq("profile_id", profile.id); // Ensure user owns the discount

  if (error) {
    console.error("Supabase error updating discount:", error.message);
    if (error.code === '23505') { // Unique violation code
      return { error: "A discount with this code already exists for your profile." };
    }
    return { error: "Database error: Could not update discount." };
  }

  revalidatePath("/dashboard/ecommerce/discounts");
  return { success: true, message: "Discount updated successfully!" };
}

export async function deleteDiscount(discountId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to delete a discount." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "You must have a profile to delete a discount." };
  }

  const { error } = await supabase
    .from("discounts")
    .delete()
    .eq("id", discountId)
    .eq("profile_id", profile.id); // Ensure user owns the discount

  if (error) {
    console.error("Supabase error deleting discount:", error.message);
    return { error: "Database error: Could not delete discount." };
  }

  revalidatePath("/dashboard/ecommerce/discounts");
  return { success: true, message: "Discount deleted successfully!" };
}

export async function getDiscounts() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "You must be logged in to view discounts." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { data: null, error: "You must have a profile to view discounts." };
  }

  const { data: discounts, error } = await supabase
    .from("discounts")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error fetching discounts:", error.message);
    return { data: null, error: "Database error: Could not fetch discounts." };
  }

  return { data: discounts, error: null };
}