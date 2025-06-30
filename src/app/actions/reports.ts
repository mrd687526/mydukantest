"use server";

import { createClient } from "@/integrations/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { CustomerOrderReportData } from "@/lib/types";

const dateRangeSchema = z.object({
  startDate: z.string().datetime({ message: "Invalid start date format." }),
  endDate: z.string().datetime({ message: "Invalid end date format." }),
});

export async function getCustomerOrderReports(values: z.infer<typeof dateRangeSchema>): Promise<{ data: CustomerOrderReportData[] | null; error: string | null }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "You must be logged in to view reports." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { data: null, error: "You must have a profile to view reports." };
  }

  const { data, error } = await supabase.rpc("get_customer_order_analytics", {
    p_profile_id: profile.id,
    p_start_date: values.startDate,
    p_end_date: values.endDate,
  });

  if (error) {
    console.error("Supabase error fetching customer order analytics:", error.message);
    return { data: null, error: "Database error: Could not fetch customer order reports." };
  }

  return { data: data as CustomerOrderReportData[], error: null };
}