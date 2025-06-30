import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();
    if (error || !profile) {
      console.error("Error fetching profile for redirection:", error);
      redirect("/login"); // Or to a profile completion page if that's the flow
    }
    if (profile.role === 'super_admin') {
      redirect("/superadmin/dashboard");
    } else {
      redirect("/dashboard");
    }
  } else {
    redirect("/login");
  }
}