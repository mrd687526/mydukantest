"use server";

import { createClient } from "@/integrations/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const productFormSchema = z.object({
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
  category: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  label: z.string().optional().nullable(),
  variant: z.string().optional().nullable(),
  subcategory: z.string().optional().nullable(),
  sale_price: z.preprocess(
    (val) => val ? parseFloat(String(val)) : null,
    z.number().min(0).optional().nullable()
  ),
  weight_kg: z.preprocess(
    (val) => val ? parseFloat(String(val)) : null,
    z.number().min(0).optional().nullable()
  ),
  tags: z.string().optional().nullable(), // Will be processed into an array
  stock_status: z.enum(['in_stock', 'out_of_stock', 'on_backorder']).optional().nullable(),
  product_specification: z.string().optional().nullable(),
  product_details: z.string().optional().nullable(),
  is_trending: z.boolean().optional().nullable(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export async function createProduct(values: ProductFormValues) {
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

  const tagsArray = values.tags ? values.tags.split(',').map(tag => tag.trim()) : null;

  const { error } = await supabase.from("products").insert({
    profile_id: profile.id,
    ...values,
    tags: tagsArray,
  });

  if (error) {
    console.error("Supabase error creating product:", error.message);
    return { error: "Database error: Could not create product." };
  }

  revalidatePath("/dashboard/ecommerce/products");
  redirect("/dashboard/ecommerce/products");
}

export async function updateProduct(
  productId: string,
  values: ProductFormValues
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to update a product." };
  }

  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("profile_id")
    .eq("id", productId)
    .single();

  if (fetchError || !product) {
    return { error: "Product not found." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile || product.profile_id !== profile.id) {
    return { error: "You are not authorized to update this product." };
  }

  const tagsArray = values.tags ? values.tags.split(',').map(tag => tag.trim()) : null;

  const { error } = await supabase
    .from("products")
    .update({
      ...values,
      tags: tagsArray,
    })
    .eq("id", productId);

  if (error) {
    console.error("Supabase error updating product:", error.message);
    return { error: "Database error: Could not update product." };
  }

  revalidatePath("/dashboard/ecommerce/products");
  revalidatePath(`/dashboard/ecommerce/products/${productId}/edit`);
  redirect("/dashboard/ecommerce/products");
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