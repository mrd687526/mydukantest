import { createServerClient } from "@/integrations/supabase/server";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/storefront/add-to-cart-button";
import ProductGallery from "@/components/storefront/ProductGallery";
import ProductReviews from "@/components/storefront/ProductReviews";
import RelatedProducts from "@/components/storefront/RelatedProducts";

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
    .maybeSingle();

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
    .maybeSingle();

  if (!product) return notFound();

  // Support for multiple images in the future
  const images: string[] = product.images || (product.image_url ? [product.image_url] : []);

  // TODO: Replace with real reviews from database
  const reviews = [
    { id: "1", name: "Alice", rating: 5, comment: "Great product!", date: "2024-05-01" },
    { id: "2", name: "Bob", rating: 4, comment: "Very good, but could be improved.", date: "2024-05-03" },
  ];

  // Fetch related products (same category, not this product)
  let relatedProducts: any[] = [];
  if (product.category) {
    const { data: related } = await supabase
      .from("products")
      .select("*")
      .eq("profile_id", storeProfileId)
      .eq("category", product.category)
      .neq("id", product.id)
      .limit(8);
    relatedProducts = related || [];
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      {images.length > 0 && (
        <ProductGallery images={images} alt={product.name} />
      )}
      <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
      <div className="text-primary font-bold text-xl mb-2">
        ${product.price}
      </div>
      <div className="mb-4 text-gray-700">{product.description}</div>
      <AddToCartButton product={product} />
      <ProductReviews reviews={reviews} />
      <RelatedProducts products={relatedProducts} />
    </div>
  );
}