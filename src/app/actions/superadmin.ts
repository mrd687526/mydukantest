"use server";

import { createClient as createServerSupabaseClient } from "@/integrations/supabase/server";
import { createClient as createAdminSupabaseClient } from '@supabase/supabase-js'; // Import directly for admin client
import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  UserProfileWithSubscription,
  MonthlyOrderTrendData,
  MostUsedCouponData,
  PopularPlanData,
  TopCustomerData,
} from "@/lib/types"; // Import the new interface

// Helper to check if the current user is a super admin (uses regular client as it checks current user's session)
async function isSuperAdmin() {
  // In development, bypass the super admin role check for convenience.
  // This allows any logged-in user to access super admin features locally.
  if (process.env.NODE_ENV === 'development') { // Using NODE_ENV as a proxy for development environment
    return true;
  }

  const supabase = createServerSupabaseClient(); // Use regular client for current user check
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

const createUserSchema = z.object({
  email: z.string().email("Invalid email format."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  name: z.string().min(2, "Name must be at least 2 characters."),
  role: z.enum(['super_admin', 'store_admin']).default('store_admin'),
});

export async function createNewUserAndProfile(values: z.infer<typeof createUserSchema>) {
  // In a real application, this check would be more robust,
  // e.g., only allowing creation if no super_admin exists, or by an existing super_admin.
  // For initial setup, we'll allow it if no user is logged in or if a super admin is logged in.
  const supabase = createServerSupabaseClient(); // Use regular client for current user check
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  
  let canCreate = false;
  if (!currentUser) {
    // Allow creation if no one is logged in (first super admin setup)
    canCreate = true;
  } else {
    // Allow creation if the current user is already a super admin
    const { data: currentProfile } = await supabase.from("profiles").select("role").eq("id", currentUser.id).single(); // Use 'id'
    if (currentProfile?.role === 'super_admin') {
      canCreate = true;
    }
  }

  if (!canCreate) {
    return { error: "Unauthorized: You do not have permission to create new users with this role." };
  }

  // Initialize an admin client with the service role key for privileged operations
  const supabaseAdmin = createAdminSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Create user in Supabase Auth
    // Pass name and role in user_metadata so the trigger can pick them up
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: values.email,
      password: values.password,
      email_confirm: true, // Automatically confirm email for admin-created users
      user_metadata: { name: values.name, role: values.role }, // Pass name and role here
    });

    if (authError) {
      console.error("Supabase Auth error creating user:", authError.message);
      return { error: authError.message };
    }

    if (!authUser?.user) {
      return { error: "Failed to create user in authentication system." };
    }

    // The profile will be automatically created by the 'handle_new_user' trigger
    // which now reads 'name' and 'role' from user_metadata.
    // No need for explicit profile insertion here.

    revalidatePath("/superadmin/users");
    return { success: true, message: "User and profile created successfully!" };
  } catch (error: any) {
    console.error("Unexpected error creating user:", error.message);
    return { error: "An unexpected error occurred." };
  }
}

export async function getAllUsersAndProfiles(): Promise<{ data: UserProfileWithSubscription[] | null; error: string | null }> {
  if (!await isSuperAdmin()) {
    return { data: null, error: "Unauthorized: Only super admins can view all users." };
  }

  // Initialize an admin client for privileged data fetching
  const supabaseAdmin = createAdminSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Call the RPC function instead of direct select with embedding
  const { data, error } = await supabaseAdmin.rpc("get_all_profiles_with_auth_info");

  if (error) {
    console.error("Supabase error fetching all profiles:", error.message);
    return { data: null, error: "Database error: Could not fetch user data." };
  }

  // The data returned by the RPC already matches UserProfileWithSubscription structure
  return { data: data as UserProfileWithSubscription[], error: null };
}

const updateUserRoleSchema = z.object({
  profileId: z.string().uuid("Invalid profile ID."),
  role: z.enum(['super_admin', 'store_admin']),
});

export async function updateUserRole(values: z.infer<typeof updateUserRoleSchema>) {
  if (!await isSuperAdmin()) {
    return { error: "Unauthorized: Only super admins can update user roles." };
  }

  // Initialize an admin client for privileged updates
  const supabaseAdmin = createAdminSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ role: values.role })
    .eq("id", values.profileId); // Use 'id' for the update

  if (error) {
    console.error("Supabase error updating user role:", error.message);
    return { error: "Database error: Could not update user role." };
  }

  revalidatePath("/superadmin/users");
  return { success: true, message: "User role updated successfully!" };
}

export async function deleteUserAndProfile(userId: string) {
  if (!await isSuperAdmin()) {
    return { error: "Unauthorized: Only super admins can delete users." };
  }

  // Initialize an admin client for privileged deletion
  const supabaseAdmin = createAdminSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Delete the user from auth.users, which should cascade delete the profile due to RLS policy
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("Supabase Auth error deleting user:", authError.message);
      return { error: authError.message };
    }

    revalidatePath("/superadmin/users");
    return { success: true, message: "User and associated profile deleted successfully!" };
  } catch (error: any) {
    console.error("Unexpected error deleting user:", error.message);
    return { error: "An unexpected error occurred." };
  }
}

// New action to fetch daily new user counts
export async function getDailyNewUserCounts(startDate: string, endDate: string): Promise<{ data: { day: string; count: number }[] | null; error: string | null }> {
  if (!await isSuperAdmin()) {
    return { data: null, error: "Unauthorized: Only super admins can view this report." };
  }

  const supabaseAdmin = createAdminSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabaseAdmin.rpc("get_daily_new_user_counts", {
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error) {
    console.error("Supabase error fetching daily new user counts:", error.message);
    return { data: null, error: "Database error: Could not fetch new user counts." };
  }

  return { data: data as { day: string; count: number }[], error: null };
}

// New actions for Super Admin Dashboard metrics
export async function getSuperAdminDashboardMetrics(): Promise<{
  totalStores: number | null;
  totalOrders: number | null;
  totalActivePlans: number | null;
  monthlyOrderTrend: MonthlyOrderTrendData[] | null;
  mostUsedCoupons: MostUsedCouponData[] | null;
  popularPlans: PopularPlanData[] | null;
  topCustomers: TopCustomerData[] | null;
  error: string | null;
}> {
  if (!await isSuperAdmin()) {
    return {
      totalStores: null,
      totalOrders: null,
      totalActivePlans: null,
      monthlyOrderTrend: null,
      mostUsedCoupons: null,
      popularPlans: null,
      topCustomers: null,
      error: "Unauthorized: Only super admins can view these metrics."
    };
  }

  const supabaseAdmin = createAdminSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Define date range for monthly order trend (e.g., last 12 months)
  const today = new Date();
  const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 11, 1);
  const startDate = `${twelveMonthsAgo.getFullYear()}-${(twelveMonthsAgo.getMonth() + 1).toString().padStart(2, '0')}-01`;
  const endDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()}`;


  const [
    totalStoresRes,
    totalOrdersRes,
    totalActivePlansRes,
    monthlyOrderTrendRes,
    mostUsedCouponsRes,
    popularPlansRes,
    topCustomersRes,
  ] = await Promise.all([
    supabaseAdmin.rpc("get_total_stores_count"),
    supabaseAdmin.rpc("get_total_orders_count"),
    supabaseAdmin.rpc("get_total_active_plans_count"),
    supabaseAdmin.rpc("get_monthly_all_orders_trend", { p_start_date: startDate, p_end_date: endDate }),
    supabaseAdmin.rpc("get_most_used_coupons_overall"),
    supabaseAdmin.rpc("get_popular_plans_by_subscriptions"),
    supabaseAdmin.rpc("get_top_customers_overall"),
  ]);

  if (totalStoresRes.error) console.error("Error fetching total stores:", totalStoresRes.error.message);
  if (totalOrdersRes.error) console.error("Error fetching total orders:", totalOrdersRes.error.message);
  if (totalActivePlansRes.error) console.error("Error fetching total active plans:", totalActivePlansRes.error.message);
  if (monthlyOrderTrendRes.error) console.error("Error fetching monthly order trend:", monthlyOrderTrendRes.error.message);
  if (mostUsedCouponsRes.error) console.error("Error fetching most used coupons:", mostUsedCouponsRes.error.message);
  if (popularPlansRes.error) console.error("Error fetching popular plans:", popularPlansRes.error.message);
  if (topCustomersRes.error) console.error("Error fetching top customers:", topCustomersRes.error.message);

  return {
    totalStores: totalStoresRes.data as number || null,
    totalOrders: totalOrdersRes.data as number || null,
    totalActivePlans: totalActivePlansRes.data as number || null,
    monthlyOrderTrend: monthlyOrderTrendRes.data as MonthlyOrderTrendData[] || null,
    mostUsedCoupons: mostUsedCouponsRes.data as MostUsedCouponData[] || null,
    popularPlans: popularPlansRes.data as PopularPlanData[] || null,
    topCustomers: topCustomersRes.data as TopCustomerData[] || null,
    error: null // Individual errors are logged, but we return partial data if possible
  };
}