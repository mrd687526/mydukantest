import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { type PropsWithChildren } from "react";
import { SuperAdminHeader } from "@/components/superadmin/super-admin-header"; // Import new header
import { SuperAdminSidebar } from "@/components/superadmin/super-admin-sidebar"; // Import new sidebar

export default async function SuperAdminLayout({ children }: PropsWithChildren) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // TEMPORARY DEVELOPMENT BYPASS: Allow access to superadmin routes for any logged-in user in development
  // REMOVE THIS BLOCK FOR PRODUCTION!
  if (process.env.NODE_ENV === 'development') {
    // In development, we bypass the role check for convenience.
    // We still need a profile to exist for some components, but not necessarily super_admin role.
    // If a profile doesn't exist, the CompleteProfilePrompt will handle it.
    return (
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <SuperAdminSidebar /> {/* Use new SuperAdminSidebar */}
        <div className="flex flex-col">
          <SuperAdminHeader user={user} /> {/* Use new SuperAdminHeader */}
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-gray-100/40 dark:bg-gray-800/40">
            {children}
          </main>
        </div>
      </div>
    );
  }
  // END TEMPORARY DEVELOPMENT BYPASS

  // Check if the user is a super_admin (original logic for production)
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id) // Fetch profile by user.id
    .single();

  if (error || !profile || profile.role !== 'super_admin') {
    // Redirect to dashboard or a permission denied page if not super admin
    redirect("/dashboard?error=Permission denied. Not a super admin.");
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <SuperAdminSidebar /> {/* Use new SuperAdminSidebar */}
      <div className="flex flex-col">
        <SuperAdminHeader user={user} /> {/* Use new SuperAdminHeader */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-gray-100/40 dark:bg-gray-800/40">
          {children}
        </main>
      </div>
    </div>
  );
}