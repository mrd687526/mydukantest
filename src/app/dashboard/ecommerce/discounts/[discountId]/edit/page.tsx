import { createClient } from "@/integrations/supabase/server";
import { notFound, redirect } from "next/navigation";
import { DiscountForm } from "@/components/dashboard/ecommerce/discounts/discount-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// This interface is designed to explicitly match the erroneous type
// that the Next.js compiler seems to be expecting for `params` and `searchParams`.
interface EditDiscountPageProps {
  params: Promise<{ discountId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EditDiscountPage(props: EditDiscountPageProps) {
  // Await the params object, as the compiler seems to treat it as a Promise.
  const actualParams = await props.params;
  const { discountId } = actualParams;
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
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/dashboard");
  }

  const { data: discount, error } = await supabase
    .from("discounts")
    .select("*")
    .eq("id", discountId)
    .eq("profile_id", profile.id)
    .single();

  if (error || !discount) {
    console.error("Error fetching discount:", error);
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/marketing/coupons"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Coupons
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