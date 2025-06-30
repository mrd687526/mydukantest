import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { type PropsWithChildren } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function SuperAdminLayout({ children }: PropsWithChildren) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if the user is a super_admin
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (error || !profile || profile.role !== 'super_admin') {
    // Redirect to dashboard or a permission denied page if not super admin
    redirect("/dashboard?error=Permission denied. Not a super admin.");
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar /> {/* Re-use existing sidebar, will add super admin links */}
      <div className="flex flex-col">
        <DashboardHeader user={user} />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-gray-100/40 dark:bg-gray-800/40">
          {children}
        </main>
      </div>
    </div>
  );
}