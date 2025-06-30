import { createClient } from "@/integrations/supabase/server";
import { ProductCard } from "@/components/storefront/product-card";
import { Product } from "@/lib/types";

export default async function StoreHomePage() {
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-2">Error loading products</h2>
        <p className="text-muted-foreground">
          Please try again later or contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Our Products</h1>
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-2">No products found</h2>
          <p className="text-muted-foreground">
            It looks like there are no products in your store yet.
          </p>
        </div>
      )}
    </div>
  );
}