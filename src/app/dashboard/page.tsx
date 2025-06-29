import { Button } from "@/components/ui/button";
import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signOut = async () => {
    "use server";
    const supabase = createClient();
    await supabase.auth.signOut();
    return redirect("/login");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl rounded-lg bg-white p-8 text-center shadow-md">
        <h1 className="text-4xl font-bold">Welcome to your Dashboard</h1>
        <p className="mt-4 text-lg text-gray-600">
          You are logged in as: <strong>{user?.email}</strong>
        </p>
        <form action={signOut} className="mt-8">
          <Button type="submit" variant="destructive">Sign Out</Button>
        </form>
      </div>
    </div>
  );
}