"use client";

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
import { DashboardChartContainer } from "@/components/dashboard/dashboard-chart-container";
import { BotMessageSquare, FileCog, BookUser } from "lucide-react";

interface MarketingOverviewClientProps {
  actionCount: number | null;
  campaignCount: number | null;
  accountCount: number | null;
  recentActions: {
    action_taken: string | null;
    associated_keyword: string | null;
    sent_at: string;
  }[] | null;
  dailyCountsData: { day: string; count: number }[] | null;
}

export function MarketingOverviewClient({
  actionCount,
  campaignCount,
  accountCount,
  recentActions,
  dailyCountsData,
}: MarketingOverviewClientProps) {
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