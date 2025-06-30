import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import { StockReportsClient } from "@/components/dashboard/ecommerce/stock-reports/stock-reports-client";
import { getProductsForStockReport } from "@/app/actions/products";

export default async function StockReportsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
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

  // Fetch all products initially
  const { data: initialProducts, error } = await getProductsForStockReport('all');

  if (error) {
    console.error("Error fetching initial stock reports:", error);
    return <div>Error loading stock reports. Please try again later.</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Stock Reports</h1>
        <p className="text-muted-foreground">
          Monitor your product inventory and identify stock levels.
        </p>
      </div>
      <StockReportsClient initialProducts={initialProducts || []} />
    </div>
  );
}