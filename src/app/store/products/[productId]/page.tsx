import { createClient } from "@/integrations/supabase/server";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/storefront/add-to-cart-button";
import type { AppPageProps } from "@/lib/types";

interface ProductPageProps extends AppPageProps<{ productId: string }> {}

export default async function ProductPage(props: ProductPageProps) {
  const { params } = props;
  const supabase = createClient();
  const { productId } = params;

  // Determine the profile_id for the public storefront (same logic as /store/page.tsx)
  const { data: storeProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "store_admin")
    .limit(1)
    .single();

  if (profileError || !storeProfile) {
    console.error("Error fetching store profile for public storefront product page:", profileError?.message);
    return notFound(); // Or redirect to a generic error page
  }

  const storeProfileId = storeProfile.id;

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("profile_id", storeProfileId) // Ensure the product belongs to the demo store
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
      <div className="text-primary font-bold text-xl mb-2">${product.price}</div>
      <div className="mb-4 text-gray-700">{product.description}</div>
      <AddToCartButton product={product} />
    </div>
  );
}