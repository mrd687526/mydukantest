import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import { FlashSalesClient } from "@/components/dashboard/marketing/flash-sales/flash-sales-client";
import { getFlashSales } from "@/app/actions/flash-sales";

export default async function MarketingFlashSalesPage() {
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

  const { data: flashSales, error } = await getFlashSales();

  if (error) {
    console.error("Error fetching flash sales:", error);
    return <div>Error loading flash sales. Please try again later.</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Flash Sales</h1>
        <p className="text-muted-foreground">
          Create and manage limited-time sales and promotions.
        </p>
      </div>
      <FlashSalesClient flashSales={flashSales || []} />
    </div>
  );
}