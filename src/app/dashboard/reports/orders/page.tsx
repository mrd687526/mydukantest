import { createServerClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import { OrderReportsClient } from "@/components/dashboard/reports/orders/order-reports-client";
import { getSalesSummaryReport, getTopSalesReports, getDownloadableProductsSales } from "@/app/actions/reports";
import { format, subMonths, endOfDay } from "date-fns";

export default async function OrderReportsPage() {
  const supabase = createServerClient();

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

  // Default date range for initial load: Last month
  const defaultStartDate = format(subMonths(new Date(), 1), 'yyyy-MM-dd');
  const defaultEndDate = format(endOfDay(new Date()), 'yyyy-MM-dd'); // End of today

  const [
    salesSummaryRes,
    topSalesRes,
    downloadableSalesRes,
  ] = await Promise.all([
    getSalesSummaryReport({ startDate: defaultStartDate, endDate: defaultEndDate }),
    getTopSalesReports({ startDate: defaultStartDate, endDate: defaultEndDate }),
    getDownloadableProductsSales({ startDate: defaultStartDate, endDate: defaultEndDate }),
  ]);

  if (salesSummaryRes.error) {
    console.error("Error fetching initial sales summary:", salesSummaryRes.error);
  }
  if (topSalesRes.error) {
    console.error("Error fetching initial top sales reports:", topSalesRes.error);
  }
  if (downloadableSalesRes.error) {
    console.error("Error fetching initial downloadable sales reports:", downloadableSalesRes.error);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Order Reports</h1>
        <p className="text-muted-foreground">
          Gain insights into your sales performance and product trends.
        </p>
      </div>
      <OrderReportsClient
        initialSalesSummary={salesSummaryRes.data || null}
        initialTopSellingProducts={topSalesRes.topSellingProducts || []}
        initialTopSellingCategories={topSalesRes.topSellingCategories || []}
        initialDownloadableProductsSales={downloadableSalesRes.data || []}
      />
    </div>
  );
}