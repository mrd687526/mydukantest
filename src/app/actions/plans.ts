"use server";

import { createServerClient as createServerSupabaseClient } from "@/integrations/supabase/server";
import { createClient as createAdminSupabaseClient } from '@supabase/supabase-js';
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Plan } from "@/lib/types";

// Helper to check if the current user is a super admin
async function isSuperAdmin() {
  if (process.env.NODE_ENV === 'development') {
    return true; // Bypass for local development
  }

  const supabase = createServerSupabaseClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  if (!currentUser) return false;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .single();

  if (error || !profile) {
    console.error("Error fetching profile for role check:", error);
    return false;
  }
  return profile.role === 'super_admin';
}

const planSchema = z.object({
  name: z.string().min(1, "Plan name is required."),
  description: z.string().optional().nullable(),
  price: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0, "Price must be a non-negative number.")
  ),
  currency: z.string().min(1, "Currency is required.").default('USD'),
  interval: z.enum(['month', 'year', 'lifetime'], { message: "Invalid interval type." }),
  stripe_price_id: z.string().optional().nullable(),
  features: z.string().optional().nullable(), // Comma-separated string
  is_active: z.boolean().default(true),
});

type PlanFormValues = z.infer<typeof planSchema>;

export async function createPlan(values: PlanFormValues) {
  if (!await isSuperAdmin()) {
    return { error: "Unauthorized: Only super admins can create plans." };
  }

  const supabaseAdmin = createAdminSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const featuresArray = values.features ? values.features.split(',').map(f => f.trim()) : null;

  const { error } = await supabaseAdmin.from("plans").insert({
    name: values.name,
    description: values.description,
    price: values.price,
    currency: values.currency,
    interval: values.interval,
    stripe_price_id: values.stripe_price_id,
    features: featuresArray,
    is_active: values.is_active,
  });

  if (error) {
    console.error("Supabase error creating plan:", error.message);
    if (error.code === '23505') { // Unique violation code
      return { error: "A plan with this name or Stripe Price ID already exists." };
    }
    return { error: "Database error: Could not create plan." };
  }

  revalidatePath("/superadmin/plans");
  return { success: true, message: "Plan created successfully!" };
}

export async function updatePlan(planId: string, values: PlanFormValues) {
  if (!await isSuperAdmin()) {
    return { error: "Unauthorized: Only super admins can update plans." };
  }

  const supabaseAdmin = createAdminSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const featuresArray = values.features ? values.features.split(',').map(f => f.trim()) : null;

  const { error } = await supabaseAdmin
    .from("plans")
    .update({
      name: values.name,
      description: values.description,
      price: values.price,
      currency: values.currency,
      interval: values.interval,
      stripe_price_id: values.stripe_price_id,
      features: featuresArray,
      is_active: values.is_active,
    })
    .eq("id", planId);

  if (error) {
    console.error("Supabase error updating plan:", error.message);
    if (error.code === '23505') { // Unique violation code
      return { error: "A plan with this name or Stripe Price ID already exists." };
    }
    return { error: "Database error: Could not update plan." };
  }

  revalidatePath("/superadmin/plans");
  return { success: true, message: "Plan updated successfully!" };
}

export async function deletePlan(planId: string) {
  if (!await isSuperAdmin()) {
    return { error: "Unauthorized: Only super admins can delete plans." };
  }

  const supabaseAdmin = createAdminSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin.from("plans").delete().eq("id", planId);

  if (error) {
    console.error("Supabase error deleting plan:", error.message);
    return { error: "Database error: Could not delete plan." };
  }

  revalidatePath("/superadmin/plans");
  return { success: true, message: "Plan deleted successfully!" };
}

export async function getPlans(): Promise<{ data: Plan[] | null; error: string | null }> {
  if (!await isSuperAdmin()) {
    return { data: null, error: "Unauthorized: Only super admins can view plans." };
  }

  const supabaseAdmin = createAdminSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabaseAdmin
    .from("plans")
    .select("*")
    .order("price", { ascending: true });

  if (error) {
    console.error("Supabase error fetching plans:", error.message);
    return { data: null, error: "Database error: Could not fetch plans." };
  }

  // Ensure features are parsed as arrays if they are stored as JSONB
  const plansWithParsedFeatures = data.map(plan => ({
    ...plan,
    features: Array.isArray(plan.features) ? plan.features : (plan.features ? JSON.parse(plan.features) : null)
  }));

  return { data: plansWithParsedFeatures as Plan[], error: null };
}

export async function getPublicPlans(): Promise<{ data: Plan[] | null; error: string | null }> {
  const supabase = createServerSupabaseClient(); // Use regular client

  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("is_active", true) // Only fetch active plans
    .order("price", { ascending: true });

  if (error) {
    console.error("Supabase error fetching public plans:", error.message);
    return { data: null, error: "Database error: Could not fetch plans." };
  }

  // Ensure features are parsed as arrays if they are stored as JSONB
  const plansWithParsedFeatures = data.map(plan => ({
    ...plan,
    features: Array.isArray(plan.features) ? plan.features : (plan.features ? JSON.parse(plan.features) : null)
  }));

  return { data: plansWithParsedFeatures as Plan[], error: null };
}