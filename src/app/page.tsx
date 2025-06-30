import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    // Check user role to redirect to appropriate dashboard
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (error || !profile) {
      // If profile not found or error, redirect to login or a generic dashboard
      console.error("Error fetching profile for redirection:", error);
      redirect("/login"); // Or handle profile creation flow
    }

    if (profile.role === 'super_admin') {
      redirect("/superadmin/dashboard"); // Redirect Super Admins to their combined dashboard
    } else {
      redirect("/dashboard"); // Regular users go to the standard dashboard
    }
  } else {
    redirect("/login");
  }
}