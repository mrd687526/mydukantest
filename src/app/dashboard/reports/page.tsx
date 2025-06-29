import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import { ReportsClient } from "@/components/dashboard/reports/reports-client";
import { CampaignReport } from "@/lib/types";

export default async function ReportsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
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

  const { data: campaigns, error: campaignsError } = await supabase
    .from("automation_campaigns")
    .select("id")
    .eq("profile_id", profile.id);

  if (campaignsError || !campaigns) {
    console.error("Error fetching campaigns for reports:", campaignsError);
    return <div>Error loading data. Please try again later.</div>;
  }

  const campaignIds = campaigns.map((c) => c.id);
  let reports: CampaignReport[] = [];

  if (campaignIds.length > 0) {
    const { data: fetchedReports, error: reportsError } = await supabase
      .from("campaign_reports")
      .select(
        `
        id,
        action_taken,
        associated_keyword,
        reply_text,
        sent_at,
        automation_campaigns ( name )
      `
      )
      .in("campaign_id", campaignIds)
      .order("sent_at", { ascending: false })
      .limit(100);

    if (reportsError) {
      console.error("Error fetching reports:", reportsError);
      return <div>Error loading reports. Please try again later.</div>;
    }

    if (fetchedReports) {
      // Explicitly transform the data to match the CampaignReport type
      const transformedReports: CampaignReport[] = (fetchedReports as any[]).map((report) => {
        const campaignData = report.automation_campaigns?.[0] || null;
        return {
          id: report.id,
          action_taken: report.action_taken,
          associated_keyword: report.associated_keyword,
          reply_text: report.reply_text,
          sent_at: report.sent_at,
          automation_campaigns: campaignData,
        };
      });
      reports = transformedReports;
    }
  }

  return <ReportsClient reports={reports} />;
}