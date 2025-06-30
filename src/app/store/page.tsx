import { createClient } from "@/integrations/supabase/server";
import { StorefrontRenderEngine } from "@/components/storefront/StorefrontRenderEngine";

export default async function StoreHomePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("editor_pages")
    .select("content")
    .eq("slug", "home")
    .single();

  const pageContent = data?.content;

  return (
    <div className="container mx-auto py-8">
      {pageContent ? (
        <StorefrontRenderEngine node={pageContent} />
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-2">Welcome to your store!</h2>
          <p className="text-muted-foreground">
            It looks like you haven&apos;t published a page yet.
            <br />
            Go to the editor in your dashboard to design your homepage.
          </p>
        </div>
      )}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Featured Products</h3>
        {/* You can add your product grid logic here later */}
        <div className="text-center text-muted-foreground py-8">
          <p>(Product display will go here)</p>
        </div>
      </div>
    </div>
  );
}