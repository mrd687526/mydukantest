"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NewUsersChartContainer } from "@/components/superadmin/new-users-chart-container";
import { UsersClient } from "@/components/superadmin/users-client";
import { Users } from "lucide-react";
import { Profile, Subscription } from "@/lib/types";

// Define a type for the data passed to the UsersClient, combining Profile and Subscription info
interface UserProfileWithSubscription extends Profile {
  subscriptions: Pick<Subscription, 'status' | 'current_period_end'>[] | null;
}

interface SuperAdminOverviewClientProps {
  dailyNewUserCounts: { day: string; count: number }[];
  users: UserProfileWithSubscription[];
}

export function SuperAdminOverviewClient({ dailyNewUserCounts, users }: SuperAdminOverviewClientProps) {
  const totalNewUsersLast30Days = dailyNewUserCounts?.reduce((sum, item) => sum + Number(item.count), 0) || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
      <p className="text-muted-foreground">
        Manage all user accounts and monitor application-wide metrics.
      </p>

      {/* New User Analytics Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            New Users (Last 30 Days)
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalNewUsersLast30Days}</div>
          <p className="text-xs text-muted-foreground">
            Total new sign-ups
          </p>
          <div className="h-[350px] mt-4">
            <NewUsersChartContainer data={dailyNewUserCounts || []} />
          </div>
        </CardContent>
      </Card>

      {/* Existing User Management Table */}
      <div className="mt-8">
        <UsersClient users={users} />
      </div>
    </div>
  );
}