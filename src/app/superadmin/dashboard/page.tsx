import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import { UsersClient } from "@/components/superadmin/users-client";
import { Profile, Subscription } from "@/lib/types";

// Define a type for the data passed to the UsersClient, combining Profile and Subscription info
interface UserProfileWithSubscription extends Profile {
  subscriptions: Pick<Subscription, 'status' | 'current_period_end'>[] | null;
}

export default async function SuperAdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return <CompleteProfilePrompt user={user} />;
  }

  // In development, the middleware bypasses this role check.
  // In production, this ensures only super admins can access this page.
  if (process.env.NODE_ENV !== 'development' && profile.role !== 'super_admin') {
    redirect("/dashboard?error=Permission denied. Not a super admin.");
  }

  // --- Fetch data for User Management ---
  const { data: users, error: usersError } = await supabase
    .from("profiles")
    .select(`
      id,
      user_id,
      name,
      auth_users:user_id ( email ),
      role,
      created_at,
      subscriptions ( status, current_period_end )
    `)
    .order("created_at", { ascending: false });

  if (usersError) {
    console.error("Supabase error fetching all profiles for super admin dashboard:", usersError.message);
    return <div>Error loading user data. Please try again later.</div>;
  }

  const profilesWithEmail = users?.map(userProfile => ({
    ...userProfile,
    email: userProfile.auth_users?.email || null,
  })) as UserProfileWithSubscription[] || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
      <p className="text-muted-foreground">
        Manage all user accounts and their profiles across the application.
      </p>

      <div className="mt-8">
        <UsersClient users={profilesWithEmail} />
      </div>
    </div>
  );
}