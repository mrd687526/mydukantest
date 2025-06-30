import { createClient } from "@/integrations/supabase/server";
import { ProductForm } from "@/components/dashboard/ecommerce/products/product-form";
import { notFound } from "next/navigation";

interface EditProductPageProps {
  params: {
    productId: string;
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const supabase = createClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.productId)
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