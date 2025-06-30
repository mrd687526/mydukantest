import { StorefrontRenderEngine } from "@/components/storefront/StorefrontRenderEngine";
import { createClient } from "@/integrations/supabase/server";
import { ProductCard } from "@/components/storefront/product-card";
import { Product } from "@/lib/types";

export default async function StoreHomePage() {
  const supabase = await createClient();

  // Fetch dynamic page content from the database
  const { data: pageData, error: pageError } = await supabase
    .from("store_pages")
    .select("data")
    .eq("slug", "home")
    .single();

  if (pageError && pageError.code !== "PGRST116") { // PGRST116 means no rows found, which is fine
    console.error("Error fetching store page content:", pageError);
    // Fallback or error message if page data cannot be loaded
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-2">Error loading page content</h2>
        <p className="text-muted-foreground">
          Please try again later or contact support.
        </p>
      </div>
    );
  }

  const contentTree = pageData?.data || null;

  // Fetch products (existing logic)
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (productsError) {
    console.error("Error fetching products:", productsError);
    // Fallback or error message for products
  }

  return (
    <div className="container mx-auto py-8">
      {contentTree ? (
        <StorefrontRenderEngine node={contentTree} />
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-2">Welcome to Your Store!</h2>
          <p className="text-muted-foreground">
            No custom page content found. You can design your home page using the visual editor in the dashboard.
          </p>
        </div>
      )}

      <h1 className="text-3xl font-bold text-center mb-8 mt-12">Our Products</h1>
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