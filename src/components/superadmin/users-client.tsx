"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { UsersDataTable } from "./users-data-table";
import { CreateUserDialog } from "./create-user-dialog";
import { UserProfileWithSubscription } from "@/lib/types"; // Import from shared types

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