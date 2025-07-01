import { createServerClient } from "@/integrations/supabase/server";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/storefront/add-to-cart-button";

// This interface is designed to explicitly match the erroneous type
// that the Next.js compiler seems to be expecting for `params` and `searchParams`.
interface ProductPageProps {
  params: Promise<{ productId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductPage(props: ProductPageProps) {
  // Await the params object, as the compiler seems to treat it as a Promise.
  const actualParams = await props.params;
  const supabase = createServerClient();
  const { productId } = actualParams;

  const { data: storeProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "store_admin")
    .limit(1)
    .single();

  if (profileError || !storeProfile) {
    console.error(
      "Error fetching store profile for public storefront product page:",
      profileError?.message
    );
    return notFound();
  }

  const storeProfileId = storeProfile.id;

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("profile_id", storeProfileId)
    .single();

  if (!product) return notFound();

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-64 object-cover rounded mb-4"
        />
      )}
      <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
      <div className="text-primary font-bold text-xl mb-2">
        ${product.price}
      </div>
      <div className="mb-4 text-gray-700">{product.description}</div>
      <AddToCartButton product={product} />
    </div>
  );
}