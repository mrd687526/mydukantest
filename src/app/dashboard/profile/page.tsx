import { createServerClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { AdminProfileForm } from "@/components/dashboard/profile/admin-profile-form";

export default async function ProfilePage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch the profile row for the user
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <AdminProfileForm user={user} profile={profile} />
    </div>
  );
} 