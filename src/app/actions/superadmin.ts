"use server";

import { createClient as createServerSupabaseClient } from "@/integrations/supabase/server";
import { createClient as createAdminSupabaseClient } from '@supabase/supabase-js'; // Import directly for admin client
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { UserProfileWithSubscription } from "@/lib/types"; // Import the new interface

// Helper to check if the current user is a super admin (uses regular client as it checks current user's session)
async function isSuperAdmin() {
  // In development, bypass the super admin role check for convenience.
  // This allows any logged-in user to access super admin features locally.
  if (process.env.NODE_ENV === 'development') { // Using NODE_ENV as a proxy for development environment
    return true;
  }

  const supabase = await createServerSupabaseClient(); // Use regular client for current user check
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
  const supabase = await createServerSupabaseClient(); // Use regular client for current user check
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