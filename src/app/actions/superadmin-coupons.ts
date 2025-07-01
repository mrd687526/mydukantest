"use server";

import { createServerClient as createServerSupabaseClient } from "@/integrations/supabase/server";
import { createClient as createAdminSupabaseClient } from '@supabase/supabase-js';
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { PlanCoupon } from "@/lib/types";

// Helper to check if the current user is a super admin
async function isSuperAdmin() {
  if (process.env.NODE_ENV === 'development') {
    return true;
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

const planCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required."),
  type: z.enum(['percentage', 'fixed_amount'], { message: "Invalid coupon type." }),
  value: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0, "Value must be a non-negative number.")
  ),
  expires_at: z.string().datetime({ message: "Invalid expiration date format." }).optional().nullable(),
  is_active: z.boolean().default(true),
});

type PlanCouponFormValues = z.infer<typeof planCouponSchema>;

export async function createPlanCoupon(values: PlanCouponFormValues) {
  if (!await isSuperAdmin()) {
    return { error: "Unauthorized: Only super admins can create plan coupons." };
  }

  const supabaseAdmin = createAdminSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin.from("plan_coupons").insert(values);

  if (error) {
    console.error("Supabase error creating plan coupon:", error.message);
    if (error.code === '23505') { // Unique violation code
      return { error: "A coupon with this code already exists." };
    }
    return { error: "Database error: Could not create plan coupon." };
  }

  revalidatePath("/superadmin/coupons");
  return { success: true, message: "Plan coupon created successfully!" };
}

export async function updatePlanCoupon(couponId: string, values: PlanCouponFormValues) {
  if (!await isSuperAdmin()) {
    return { error: "Unauthorized: Only super admins can update plan coupons." };
  }

  const supabaseAdmin = createAdminSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from("plan_coupons")
    .update(values)
    .eq("id", couponId);

  if (error) {
    console.error("Supabase error updating plan coupon:", error.message);
    if (error.code === '23505') { // Unique violation code
      return { error: "A coupon with this code already exists." };
    }
    return { error: "Database error: Could not update plan coupon." };
  }

  revalidatePath("/superadmin/coupons");
  return { success: true, message: "Plan coupon updated successfully!" };
}

export async function deletePlanCoupon(couponId: string) {
  if (!await isSuperAdmin()) {
    return { error: "Unauthorized: Only super admins can delete plan coupons." };
  }

  const supabaseAdmin = createAdminSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin.from("plan_coupons").delete().eq("id", couponId);

  if (error) {
    console.error("Supabase error deleting plan coupon:", error.message);
    return { error: "Database error: Could not delete plan coupon." };
  }

  revalidatePath("/superadmin/coupons");
  return { success: true, message: "Plan coupon deleted successfully!" };
}

export async function getPlanCoupons(): Promise<{ data: PlanCoupon[] | null; error: string | null }> {
  if (!await isSuperAdmin()) {
    return { data: null, error: "Unauthorized: Only super admins can view plan coupons." };
  }

  const supabaseAdmin = createAdminSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabaseAdmin
    .from("plan_coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error fetching plan coupons:", error.message);
    return { data: null, error: "Database error: Could not fetch plan coupons." };
  }

  return { data: data as PlanCoupon[], error: null };
}