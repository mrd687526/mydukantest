import { createClient } from "@/integrations/supabase/server";
import { ProductForm } from "@/components/dashboard/ecommerce/products/product-form";
import { notFound, redirect } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: { productId: string };
}) {
  const { productId } = params;
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/dashboard");
  }

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("profile_id", profile.id)
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