import { BookUser, FileCog, BotMessageSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { DashboardChartContainer } from "@/components/dashboard/dashboard-chart-container";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";

export default async function DashboardPage() {
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

  const profileId = profile.id;

  // Fetch campaign IDs first
  const { data: campaigns } = await supabase
    .from("automation_campaigns")
    .select("id")
    .eq("profile_id", profileId);

  const campaignIds = campaigns?.map((c) => c.id) || [];

  // Fetch all data in parallel for performance
  const [
    actionCountRes,
    campaignCountRes,
    accountCountRes,
    recentActionsRes,
    dailyCountsDataRes,
  ] = await Promise.all([
    campaignIds.length > 0
      ? supabase
          .from("campaign_reports")
          .select("id", { count: "exact", head: true })
          .in("campaign_id", campaignIds)
      : Promise.resolve({ count: 0, error: null }),
    supabase
      .from("automation_campaigns")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId),
    supabase
      .from("connected_accounts")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId),
    campaignIds.length > 0
      ? supabase
          .from("campaign_reports")
          .select("action_taken, associated_keyword, sent_at")
          .in("campaign_id", campaignIds)
          .order("sent_at", { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [], error: null }),
    supabase.rpc("get_daily_action_counts", { p_profile_id: profileId }),
  ]);

  const actionCount = actionCountRes.count;
  const campaignCount = campaignCountRes.count;
  const accountCount = accountCountRes.count;
  const recentActions = recentActionsRes.data;
  const dailyCountsData = dailyCountsDataRes.data;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Actions Taken
            </CardTitle>
            <BotMessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actionCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Automated actions this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <FileCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Total automation campaigns
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Connected Accounts
            </CardTitle>
            <BookUser className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accountCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Facebook Pages connected
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Actions Overview</CardTitle>
            <CardDescription>
              Total actions taken in the last 30 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <DashboardChartContainer data={dailyCountsData || []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              The latest automated actions performed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action Details</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActions && recentActions.length > 0 ? (
                  recentActions.map((action, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="font-medium capitalize">
                          {action.action_taken}
                        </div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          Keyword: {action.associated_keyword || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {new Date(action.sent_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                      No recent activity.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}