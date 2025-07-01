import { createServerClient } from "@/integrations/supabase/server";
import { ProductForm } from "@/components/dashboard/ecommerce/products/product-form";
import { notFound, redirect } from "next/navigation";

// This interface is designed to explicitly match the erroneous type
// that the Next.js compiler seems to be expecting for `params` and `searchParams`.
interface EditProductPageProps {
  params: Promise<{ productId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EditProductPage(props: EditProductPageProps) {
  // Await the params object, as the compiler seems to treat it as a Promise.
  const actualParams = await props.params;
  const { productId } = actualParams;
  const supabase = createServerClient();

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