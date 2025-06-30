import { createClient } from "@/integrations/supabase/client";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/storefront/add-to-cart-button";

export default async function ProductPage({ params }: { params: { productId: string } }) {
  const supabase = createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.productId)
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