"use server";

import { createClient } from "@/integrations/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Helper to check if the current user is a super admin
async function isSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
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
  if (!await isSuperAdmin()) {
    return { error: "Unauthorized: Only super admins can create users." };
  }

  const supabaseAdmin = createClient(); // Use admin client for auth.admin functions

  try {
    // Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: values.email,
      password: values.password,
      email_confirm: true, // Automatically confirm email for admin-created users
      user_metadata: { name: values.name },
    });

    if (authError) {
      console.error("Supabase Auth error creating user:", authError.message);
      return { error: authError.message };
    }

    if (!authUser?.user) {
      return { error: "Failed to create user in authentication system." };
    }

    // Create profile in public.profiles table
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      user_id: authUser.user.id,
      name: values.name,
      email: values.email, // Store email in profile for easier access
      role: values.role,
    });

    if (profileError) {
      console.error("Supabase error creating profile:", profileError.message);
      // Attempt to delete the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      return { error: "Database error: Could not create user profile." };
    }

    revalidatePath("/superadmin/users");
    return { success: true, message: "User and profile created successfully!" };
  } catch (error: any) {
    console.error("Unexpected error creating user:", error.message);
    return { error: "An unexpected error occurred." };
  }
}

export async function getAllUsersAndProfiles() {
  if (!await isSuperAdmin()) {
    return { data: null, error: "Unauthorized: Only super admins can view all users." };
  }

  const supabaseAdmin = createClient(); // Use admin client for direct table access

  const { data: profiles, error } = await supabaseAdmin
    .from("profiles")
    .select(`
      id,
      user_id,
      name,
      email,
      role,
      created_at,
      subscriptions ( status, current_period_end )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error fetching all profiles:", error.message);
    return { data: null, error: "Database error: Could not fetch user data." };
  }

  return { data: profiles, error: null };
}

export async function deleteUserAndProfile(userId: string) {
  if (!await isSuperAdmin()) {
    return { error: "Unauthorized: Only super admins can delete users." };
  }

  const supabaseAdmin = createClient();

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