"use server";

import { createClient } from "@/integrations/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Product } from "@/lib/types";

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
  is_downloadable: z.boolean().optional().nullable(), // New
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export async function createProduct(values: ProductFormValues) {
  const supabase = createClient();

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
  const supabase = createClient();

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
  const supabase = createClient();
  const { error } = await supabase.from("products").delete().eq("id", productId);

  if (error) {
    console.error("Supabase error deleting product:", error.message);
    return { error: "Database error: Could not delete product." };
  }

  revalidatePath("/dashboard/ecommerce/products");
  return { success: true };
}

type StockStatusFilter = 'all' | 'low_stock' | 'out_of_stock' | 'most_stocked';

export async function getProductsForStockReport(filter: StockStatusFilter): Promise<{ data: Product[] | null; error: string | null }> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "You must be logged in to view stock reports." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { data: null, error: "You must have a profile to view stock reports." };
  }

  let query = supabase
    .from("products")
    .select("*")
    .eq("profile_id", profile.id);

  switch (filter) {
    case 'low_stock':
      query = query.lte("inventory_quantity", 10).gt("inventory_quantity", 0).order("inventory_quantity", { ascending: true });
      break;
    case 'out_of_stock':
      query = query.eq("inventory_quantity", 0).order("name", { ascending: true });
      break;
    case 'most_stocked':
      query = query.order("inventory_quantity", { ascending: false });
      break;
    case 'all':
    default:
      query = query.order("name", { ascending: true });
      break;
  }

  const { data: products, error } = await query;

  if (error) {
    console.error("Supabase error fetching products for stock report:", error.message);
    return { data: null, error: "Database error: Could not fetch stock report." };
  }

  return { data: products as Product[], error: null };
}

export async function getProductsForSelection(): Promise<{ data: { id: string; name: string; image_url: string | null; category: string | null; }[] | null; error: string | null }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Authentication required." };

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();
  if (!profile) return { data: null, error: "Profile not found." };

  const { data, error } = await supabase
    .from("products")
    .select("id, name, image_url, category")
    .eq("profile_id", profile.id)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching products for selection:", error.message);
    return { data: null, error: "Failed to fetch products." };
  }
  return { data, error: null };
}

export async function getCategoriesForSelection(): Promise<{ data: string[] | null; error: string | null }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Authentication required." };

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();
  if (!profile) return { data: null, error: "Profile not found." };

  // Fetch distinct categories for the current profile
  const { data, error } = await supabase
    .from("products")
    .select("category")
    .eq("profile_id", profile.id)
    .not("category", "is", null)
    .order("category", { ascending: true });

  if (error) {
    console.error("Error fetching categories for selection:", error.message);
    return { data: null, error: "Failed to fetch categories." };
  }

  const categories = Array.from(new Set(data.map(item => item.category as string)));
  return { data: categories, error: null };
}

export async function getProductsForPOS(searchTerm: string): Promise<{ data: Product[] | null; error: string | null }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Authentication required." };

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();
  if (!profile) return { data: null, error: "Profile not found." };

  let query = supabase
    .from("products")
    .select("*")
    .eq("profile_id", profile.id)
    .gt("inventory_quantity", 0); // Only show in-stock items

  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`);
  }

  const { data, error } = await query.limit(20); // Limit results for performance

  if (error) {
    console.error("Error fetching products for POS:", error.message);
    return { data: null, error: "Failed to fetch products for POS." };
  }
  return { data: data as Product[], error: null };
}