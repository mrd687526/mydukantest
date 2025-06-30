import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import { CustomersClient } from "@/components/dashboard/ecommerce/customers/customers-client";
import { getCustomers } from "@/app/actions/customers"; // Import the new action

export default async function CustomersPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id) // Fetch profile by user.id
    .single();

  if (!profile) {
    return <CompleteProfilePrompt user={user} />;
  }

  const { data: customers, error } = await getCustomers();

  if (error) {
    console.error("Error fetching customers:", error);
    return <div>Error loading customers. Please try again later.</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
        <p className="text-muted-foreground">
          View and manage your customer list.
        </p>
      </div>
      <CustomersClient customers={customers || []} />
    </div>
  );
}