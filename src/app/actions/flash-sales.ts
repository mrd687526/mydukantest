"use server";

import { createClient } from "@/integrations/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { FlashSale } from "@/lib/types";

const flashSaleSchema = z.object({
  name: z.string().min(1, "Flash sale name is required."),
  start_date: z.string().datetime({ message: "Invalid start date format." }),
  end_date: z.string().datetime({ message: "Invalid end date format." }),
  discount_type: z.enum(['percentage', 'fixed_amount']),
  discount_value: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0, "Discount value must be a non-negative number.")
  ),
  target_rules: z.object({
    included_product_ids: z.array(z.string().uuid()).optional().nullable(),
    excluded_product_ids: z.array(z.string().uuid()).optional().nullable(),
    included_category_ids: z.array(z.string()).optional().nullable(),
    excluded_category_ids: z.array(z.string()).optional().nullable(),
    min_purchase_amount: z.number().min(0).optional().nullable(),
  }).optional().nullable(),
  is_active: z.boolean().default(true),
}).refine(data => new Date(data.end_date) > new Date(data.start_date), {
  message: "End date must be after start date.",
  path: ["end_date"],
});

export async function createFlashSale(values: z.infer<typeof flashSaleSchema>) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to create a flash sale." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { error: "Profile not found." };
  }

  const { error } = await supabase.from("flash_sales").insert({
    profile_id: profile.id,
    ...values,
  });

  if (error) {
    console.error("Supabase error creating flash sale:", error.message);
    return { error: "Database error: Could not create flash sale." };
  }

  revalidatePath("/dashboard/marketing/flash-sales");
  return { success: true, message: "Flash sale created successfully!" };
}

export async function updateFlashSale(flashSaleId: string, values: z.infer<typeof flashSaleSchema>) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to update a flash sale." };
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
    .from("flash_sales")
    .update(values)
    .eq("id", flashSaleId)
    .eq("profile_id", profile.id);

  if (error) {
    console.error("Supabase error updating flash sale:", error.message);
    return { error: "Database error: Could not update flash sale." };
  }

  revalidatePath("/dashboard/marketing/flash-sales");
  return { success: true, message: "Flash sale updated successfully!" };
}

export async function deleteFlashSale(flashSaleId: string) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to delete a flash sale." };
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
    .from("flash_sales")
    .delete()
    .eq("id", flashSaleId)
    .eq("profile_id", profile.id);

  if (error) {
    console.error("Supabase error deleting flash sale:", error.message);
    return { error: "Database error: Could not delete flash sale." };
  }

  revalidatePath("/dashboard/marketing/flash-sales");
  return { success: true, message: "Flash sale deleted successfully!" };
}

export async function getFlashSales(): Promise<{ data: FlashSale[] | null; error: string | null }> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "You must be logged in to view flash sales." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { data: null, error: "Profile not found." };
  }

  const { data: flashSales, error } = await supabase
    .from("flash_sales")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error fetching flash sales:", error.message);
    return { data: null, error: "Database error: Could not fetch flash sales." };
  }

  return { data: flashSales, error: null };
}