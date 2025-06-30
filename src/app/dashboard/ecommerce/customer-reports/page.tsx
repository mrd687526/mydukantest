import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import { CustomerReportsClient } from "@/components/dashboard/ecommerce/customer-reports/customer-reports-client";
import { getCustomerOrderReports } from "@/app/actions/reports";
import { format, subMonths, endOfDay } from "date-fns";

export default async function CustomerReportsPage() {
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

  // Default date range for initial load: Last month
  const defaultStartDate = format(subMonths(new Date(), 1), 'yyyy-MM-dd');
  const defaultEndDate = format(endOfDay(new Date()), 'yyyy-MM-dd'); // End of today

  const { data: initialReportData, error } = await getCustomerOrderReports({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
  });

  if (error) {
    console.error("Error fetching initial customer reports:", error);
    return <div>Error loading customer reports. Please try again later.</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Customer Reports</h1>
        <p className="text-muted-foreground">
          Analyze customer and guest order trends over time.
        </p>
      </div>
      <CustomerReportsClient initialData={initialReportData || []} />
    </div>
  );
}