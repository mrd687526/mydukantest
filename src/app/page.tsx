import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    // TEMPORARY: For testing, redirect all logged-in users to superadmin dashboard
    // In production, you would revert this to check user role:
    // const { data: profile, error } = await supabase
    //   .from("profiles")
    //   .select("role")
    //   .eq("user_id", session.user.id)
    //   .single();
    // if (error || !profile) {
    //   console.error("Error fetching profile for redirection:", error);
    //   redirect("/login");
    // }
    // if (profile.role === 'super_admin') {
    //   redirect("/superadmin/dashboard");
    // } else {
    //   redirect("/dashboard");
    // }
    redirect("/superadmin/dashboard"); // Direct to superadmin dashboard for testing
  } else {
    redirect("/login");
  }
}