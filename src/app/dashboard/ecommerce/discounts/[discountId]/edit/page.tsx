import { createClient } from "@/integrations/supabase/server";
import { notFound, redirect } from "next/navigation";
import { DiscountForm } from "@/components/dashboard/ecommerce/discounts/discount-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: { discountId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function EditDiscountPage({ params }: PageProps) {
  const { discountId } = params;
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id) // Fetch profile by user.id
    .single();

  if (!profile) {
    // User needs a profile to manage discounts
    redirect("/dashboard");
  }

  const { data: discount, error } = await supabase
    .from("discounts")
    .select("*")
    .eq("id", discountId)
    .eq("profile_id", profile.id) // Ensure user owns the discount
    .single();

  if (error || !discount) {
    console.error("Error fetching discount:", error);
    notFound(); // Or show an error message
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/ecommerce/discounts"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Discounts
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Edit Discount: {discount.code}
        </h1>
        <p className="text-muted-foreground">
          Update the details for this discount code.
        </p>
      </div>
      <DiscountForm initialData={discount} />
    </div>
  );
}