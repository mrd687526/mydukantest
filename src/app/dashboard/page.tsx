import {
  BookUser,
  FileCog,
  MessageSquareReply,
} from "lucide-react";
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
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";

// Helper to format date for the chart
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

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
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-full">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            Welcome to your Dashboard!
          </h3>
          <p className="text-sm text-muted-foreground">
            Please complete your profile to get started.
          </p>
          <Button className="mt-4">Complete Profile</Button>
        </div>
      </div>
    );
  }

  const profileId = profile.id;

  // Fetch all data in parallel for performance
  const [
    { count: replyCount },
    { count: ruleCount },
    { count: accountCount },
    { data: recentReplies },
    { data: dailyCountsData }
  ] = await Promise.all([
    supabase.from("reply_logs").select("*", { count: "exact", head: true }).eq("profile_id", profileId),
    supabase.from("comment_rules").select("*", { count: "exact", head: true }).eq("profile_id", profileId),
    supabase.from("connected_accounts").select("*", { count: "exact", head: true }).eq("profile_id", profileId),
    supabase.from("reply_logs").select("reply_text, reply_type, sent_at").eq("profile_id", profileId).order("sent_at", { ascending: false }).limit(5),
    supabase.rpc('get_daily_reply_counts', { p_profile_id: profileId })
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Replies Sent</CardTitle>
            <MessageSquareReply className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{replyCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">Automated replies and DMs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <FileCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ruleCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">Keywords and actions configured</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
            <BookUser className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accountCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">Facebook Pages connected</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Replies Overview</CardTitle>
            <CardDescription>Total replies sent in the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
             <ResponsiveContainer width="100%" height={350}>
                <BarChart data={dailyCountsData || []}>
                  <XAxis
                    dataKey="day"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatDate(value)}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Bar dataKey="count" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                </BarChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>The latest replies sent to your audience.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentReplies && recentReplies.length > 0 ? (
                  recentReplies.map((reply, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="font-medium capitalize">{reply.reply_type}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {reply.reply_text}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{new Date(reply.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">No recent activity.</TableCell>
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