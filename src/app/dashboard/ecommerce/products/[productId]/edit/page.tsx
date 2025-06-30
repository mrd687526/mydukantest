import { createClient } from "@/integrations/supabase/server";
import { ProductForm }
from "@/components/dashboard/ecommerce/products/product-form";
import { notFound, redirect } from "next/navigation"; // Import redirect
import type PageProps from "next/types";

interface EditProductPageProps extends PageProps<{ productId: string }> {}

export default async function EditProductPage(props: EditProductPageProps) {
  const { params } = props;
  const { productId } = params;
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login"); // Redirect if not logged in
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id) // Fetch profile by user.id
    .single();

  if (!profile) {
    redirect("/dashboard"); // Redirect if no profile
  }

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("profile_id", profile.id) // Ensure user owns the product
    .single();

  if (error || !product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-muted-foreground">
          Update the details for your product.
        </p>
      </div>
      <ProductForm initialData={product} />
    </div>
  );
}