import { StorefrontRenderEngine } from "@/components/storefront/StorefrontRenderEngine";
import { createServerClient } from "@/integrations/supabase/server";
import { ProductCard } from "@/components/storefront/product-card";
import { Product } from "@/lib/types";
import HeroSection from "@/components/storefront/HeroSection";
import HighlightsSection from "@/components/storefront/HighlightsSection";
import StorefrontHomeClient from "@/components/storefront/StorefrontHomeClient";

export default async function StoreHomePage() {
  const supabase = createServerClient();

  // For multi-tenancy in the public storefront, we need to determine which store's data to show.
  // In a real application, this would typically be derived from a subdomain (e.g., storename.myapp.com)
  // or a path parameter (e.g., myapp.com/store/storename).
  // For this demo, we'll fetch the profile_id of the first 'store_admin' to act as the default demo store.
  const { data: storeProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "store_admin")
    .limit(1)
    .maybeSingle();

  if (profileError || !storeProfile) {
    console.error("Error fetching store profile for public storefront:", profileError?.message);
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-2">Store Not Found</h2>
        <p className="text-muted-foreground">
          It looks like there are no active stores configured.
        </p>
      </div>
    );
  }

  const storeProfileId = storeProfile.id;

  // Fetch dynamic page content from the database for the specific store
  const { data: pageData, error: pageError } = await supabase
    .from("store_pages")
    .select("data")
    .eq("slug", "home")
    .eq("profile_id", storeProfileId) // Filter by profile_id
    .maybeSingle();

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

  // Fetch all products for the specific store
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .eq("profile_id", storeProfileId)
    .order("created_at", { ascending: false });

  // Fetch distinct categories for the specific store
  const { data: categoryRows, error: categoriesError } = await supabase
    .from("products")
    .select("category")
    .eq("profile_id", storeProfileId)
    .not("category", "is", null)
    .order("category", { ascending: true });

  const categories = Array.from(
    new Set((categoryRows || []).map((row) => row.category))
  );

  // Highlights logic
  const bestSellers = (products || []).filter((p) => p.is_trending).slice(0, 8);
  const newArrivals = (products || []).slice(0, 8);
  const deals = (products || []).filter((p) => p.sale_price && p.sale_price < p.price).slice(0, 8);

  return (
    <div className="container mx-auto py-8">
      <HeroSection />
      <HighlightsSection bestSellers={bestSellers} newArrivals={newArrivals} deals={deals} />
      <StorefrontHomeClient
        contentTree={contentTree}
        products={products || []}
        categories={categories}
      />

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