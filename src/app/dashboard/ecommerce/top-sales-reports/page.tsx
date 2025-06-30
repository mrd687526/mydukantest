import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import { TopSalesReportsClient } from "@/components/dashboard/ecommerce/top-sales-reports/top-sales-reports-client";
import { getTopSalesReports } from "@/app/actions/reports";
import { format, subMonths, endOfDay } from "date-fns";

export default async function TopSalesReportsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return <CompleteProfilePrompt user={user} />;
  }

  // Default date range for initial load: Last month
  const defaultStartDate = format(subMonths(new Date(), 1), 'yyyy-MM-dd');
  const defaultEndDate = format(endOfDay(new Date()), 'yyyy-MM-dd'); // End of today

  const { topPaymentMethods, error } = await getTopSalesReports({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
  });

  if (error) {
    console.error("Error fetching initial top sales reports:", error);
    return <div>Error loading top sales reports. Please try again later.</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Top Sales Reports</h1>
        <p className="text-muted-foreground">
          Analyze your top-performing products, categories, brands, and payment methods.
        </p>
      </div>
      <TopSalesReportsClient initialTopPaymentMethods={topPaymentMethods || []} />
    </div>
  );
}