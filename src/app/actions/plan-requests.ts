src/app/actions/plan-requests.ts
"use server";

import { createServerClient } from "@/integrations/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { PlanRequest } from "@/lib/types";

const createRequestSchema = z.object({
  planId: z.string().uuid(),
  notes: z.string().optional().nullable(),
});

export async function createPlanRequest(values: z.infer<typeof createRequestSchema>) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();
  if (!profile) return { error: "Profile not found." };

  const { error } = await supabase.from("plan_requests").insert({
    profile_id: profile.id,
    plan_id: values.planId,
    notes: values.notes,
  });

  if (error) {
    console.error("Error creating plan request:", error);
    return { error: "Failed to submit plan request." };
  }

  revalidatePath("/dashboard/pricing");
  return { success: true, message: "Plan request submitted successfully." };
}

export async function getPlanRequestsForProfile() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  const { data, error } = await supabase
    .from("plan_requests")
    .select("*, plans(name)")
    .eq("profile_id", user.id)
    .order("requested_at", { ascending: false });

  if (error) {
    console.error("Error fetching user's plan requests:", error);
    return { error: "Could not load your plan requests." };
  }
  return { data: data as PlanRequest[] };
}

export async function getPendingPlanRequests() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("plan_requests")
    .select("*, profiles(name, email), plans(name)")
    .eq("status", "pending")
    .order("requested_at", { ascending: true });

  if (error) {
    console.error("Error fetching pending plan requests:", error);
    return { error: "Could not load pending requests." };
  }
  return { data: data as PlanRequest[] };
}

async function processPlanRequest(requestId: string, newStatus: 'approved' | 'rejected') {
  const supabase = createServerClient();
  const { data: { user: reviewer } } = await supabase.auth.getUser();
  if (!reviewer) return { error: "Authentication required." };

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: request, error: requestError } = await supabaseAdmin
    .from("plan_requests")
    .select("profile_id, plan_id, plans(stripe_price_id)")
    .eq("id", requestId)
    .single();

  if (requestError || !request) {
    return { error: "Plan request not found." };
  }

  if (newStatus === 'approved') {
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", request.profile_id)
      .single();

    if (profileError || !profile) {
      return { error: "Could not find the user's profile." };
    }

    const { error: subError } = await supabaseAdmin.from("subscriptions").upsert({
      profile_id: request.profile_id,
      stripe_price_id: request.plans?.stripe_price_id,
      status: 'active',
      stripe_customer_id: profile.stripe_customer_id || `cus_manual_${request.profile_id.substring(0, 8)}`,
      stripe_subscription_id: `sub_manual_${requestId.substring(0, 8)}`,
    }, { onConflict: 'profile_id' });

    if (subError) {
      console.error("Error updating subscription:", subError);
      return { error: "Failed to update user subscription." };
    }
  }

  const { error: updateError } = await supabaseAdmin
    .from("plan_requests")
    .update({
      status: newStatus,
      reviewed_by: reviewer.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (updateError) {
    console.error("Error updating plan request status:", updateError);
    return { error: "Failed to update request status." };
  }

  revalidatePath("/superadmin/plan-requests");
  return { success: true, message: `Request ${newStatus}.` };
}

export async function approvePlanRequest(requestId: string) {
  return processPlanRequest(requestId, 'approved');
}

export async function rejectPlanRequest(requestId: string) {
  return processPlanRequest(requestId, 'rejected');
}