"use server";

import { createClient } from "@/integrations/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters."),
  description: z.string().optional().nullable(),
  price: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0.01, "Price must be greater than 0.")
  ),
  sku: z.string().optional().nullable(),
  inventory_quantity: z.preprocess(
    (val) => parseInt(String(val), 10),
    z.number().int().min(0, "Inventory must be a non-negative integer.")
  ),
  image_url: z.string().url("Invalid URL format.").optional().nullable(),
});

export async function createProduct(values: z.infer<typeof productSchema>) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to create a product." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "You must have a profile to create a product." };
  }

  const { error } = await supabase.from("products").insert({
    profile_id: profile.id,
    name: values.name,
    description: values.description,
    price: values.price,
    sku: values.sku,
    inventory_quantity: values.inventory_quantity,
    image_url: values.image_url,
  });

  if (error) {
    console.error("Supabase error creating product:", error.message);
    return { error: "Database error: Could not create product." };
  }

  revalidatePath("/dashboard/ecommerce/products");
  return { success: true };
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", productId);

  if (error) {
    console.error("Supabase error deleting product:", error.message);
    return { error: "Database error: Could not delete product." };
  }

  revalidatePath("/dashboard/ecommerce/products");
  return { success: true };
}