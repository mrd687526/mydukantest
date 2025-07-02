import { createServerClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import { POSClient } from "@/components/dashboard/pos/pos-client";

export default async function POSPage() {
  const supabase = createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return <CompleteProfilePrompt user={user} />;
  }

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-3xl font-bold mb-4">Point of Sale</h1>
      <POSClient />
    </div>
  );
}