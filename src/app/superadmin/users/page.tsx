import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { getAllUsersAndProfiles, createNewUserAndProfile } from "@/app/actions/superadmin";
import { UsersClient } from "@/components/superadmin/users-client";
import { UserProfileWithSubscription } from "@/lib/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function SuperAdminUsersPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id) // Fetch profile by user.id
    .single();

  // In development, the middleware bypasses this role check.
  // In production, this ensures only super admins can access this page.
  if (process.env.NODE_ENV !== 'development' && (!profile || profile.role !== 'super_admin')) {
    redirect("/dashboard?error=Permission denied.");
  }

  const { count: superAdminCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "super_admin");

  if (superAdminCount === 0) {
    console.log("No super admin found, creating default super admin...");
    await createNewUserAndProfile({
      email: 'superadmin@example.com',
      password: 'password',
      name: 'Super Admin',
      role: 'super_admin',
    });
  }

  const { data: users, error } = await getAllUsersAndProfiles();

  if (error) {
    console.error("Error fetching users for super admin:", error);
    return <div>Error loading users. Please try again later.</div>;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/superadmin/dashboard"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Super Admin Dashboard
      </Link>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          View and manage all user accounts and their profiles.
        </p>
      </div>
      <UsersClient users={users || []} />
    </div>
  );
}