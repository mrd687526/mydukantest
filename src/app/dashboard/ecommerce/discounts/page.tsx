import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import { DiscountsClient } from "@/components/dashboard/ecommerce/discounts/discounts-client";
import { getDiscounts } from "@/app/actions/discounts";

export default async function DiscountsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return <CompleteProfilePrompt user={user} />;
  }

  const { data: discounts, error } = await getDiscounts();

  if (error) {
    console.error("Error fetching discounts:", error);
    return <div>Error loading discounts. Please try again later.</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Discounts</h1>
        <p className="text-muted-foreground">
          Create and manage discount codes and automatic promotions.
        </p>
      </div>
      <DiscountsClient discounts={discounts || []} />
    </div>
  );
}