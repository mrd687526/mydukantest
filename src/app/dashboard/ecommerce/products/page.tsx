import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import { ProductsClient } from "@/components/dashboard/ecommerce/products/products-client";
import { addDemoProducts } from "@/app/actions/demo-products"; // Import the action
import { Button } from "@/components/ui/button"; // Import Button component
import { toast } from "sonner"; // Import toast for notifications

export default async function ProductsPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id) // Fetch profile by user.id
    .single();

  if (!profile) {
    return <CompleteProfilePrompt user={user} />;
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return <div>Error loading products. Please try again later.</div>;
  }

  // Client-side function to handle adding demo products
  const handleAddDemoProducts = async () => {
    const result = await addDemoProducts();
    if (result.error) {
      toast.error("Failed to add demo products", { description: result.error });
    } else {
      toast.success(result.message);
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center"> {/* Added flex and justify-between */}
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage your products and inventory.
          </p>
        </div>
        {/* Temporary button to add demo products */}
        <Button onClick={handleAddDemoProducts}>Add 10 Demo Products</Button>
      </div>
      <ProductsClient products={products || []} />
    </div>
  );
}