import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { getAllUsersAndProfiles, createNewUserAndProfile } from "@/app/actions/superadmin"; // Import createNewUserAndProfile
import { UsersClient } from "@/components/superadmin/users-client";
import { Profile, Subscription } from "@/lib/types";

// Define a type for the data passed to the table, combining Profile and Subscription info
interface UserProfileWithSubscription extends Profile {
  subscriptions: Pick<Subscription, 'status' | 'current_period_end'>[] | null;
}

export default async function SuperAdminUsersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // The layout already checks for super_admin role, but we'll re-check for safety
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.role !== 'super_admin') {
    redirect("/dashboard?error=Permission denied.");
  }

  // Attempt to create a default super admin user if none exists (for initial setup)
  // This is a simplified approach for demo/initial setup. In production, you'd have a dedicated setup flow.
  const { data: existingSuperAdminProfiles } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "super_admin");

  if (!existingSuperAdminProfiles || existingSuperAdminProfiles.length === 0) {
    console.log("No super admin found, attempting to create default super admin...");
    const result = await createNewUserAndProfile({
      email: 'superadmin@example.com',
      password: 'password', // Use a strong password in production!
      name: 'Super Admin',
      role: 'super_admin',
    });
    if (result.error) {
      console.error("Failed to create default super admin:", result.error);
      // Optionally, display an error to the user if this is critical
    } else {
      console.log("Default super admin created successfully.");
      // Revalidate path to show the new user
      redirect('/superadmin/users'); // Redirect to refresh data
    }
  }

  const { data: users, error } = await getAllUsersAndProfiles();

  if (error) {
    console.error("Error fetching users for super admin:", error);
    return <div>Error loading users. Please try again later.</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          View and manage all user accounts and their profiles.
        </p>
      </div>
      <UsersClient users={users as UserProfileWithSubscription[] || []} />
    </div>
  );
}