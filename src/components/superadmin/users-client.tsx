"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { UsersDataTable } from "./users-data-table";
import { CreateUserDialog } from "./create-user-dialog";
import { Profile, Subscription } from "@/lib/types";

// Define a type for the data passed to the table, combining Profile and Subscription info
interface UserProfileWithSubscription extends Profile {
  subscriptions: Pick<Subscription, 'status' | 'current_period_end'>[] | null;
}

interface UsersClientProps {
  users: UserProfileWithSubscription[];
}

export function UsersClient({ users }: UsersClientProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              Manage all user accounts and their associated profiles.
            </CardDescription>
          </div>
          <CreateUserDialog />
        </div>
      </CardHeader>
      <CardContent>
        <UsersDataTable data={users} />
      </CardContent>
    </Card>
  );
}