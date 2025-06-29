import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { type PropsWithChildren } from "react";

export default async function DashboardLayout({ children }: PropsWithChildren) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}