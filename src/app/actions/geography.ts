"use server";

import { createClient } from "@/integrations/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Helper to check if the current user is a super admin
async function isSuperAdmin() {
  if (process.env.NODE_ENV === 'development') return true;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === 'super_admin';
}

const revalidateGeoPath = () => revalidatePath("/superadmin/settings/geography");

// --- Countries Actions ---
const countrySchema = z.object({
  name: z.string().min(1, "Country name is required."),
  iso2: z.string().length(2, "ISO2 code must be 2 characters."),
});

export async function getCountries() {
  const supabase = createClient();
  const { data, error } = await supabase.from("countries").select("*").order("name");
  if (error) return { error: "Failed to fetch countries." };
  return { data };
}

export async function createCountry(values: z.infer<typeof countrySchema>) {
  if (!await isSuperAdmin()) return { error: "Unauthorized" };
  const supabase = createClient();
  const { error } = await supabase.from("countries").insert(values);
  if (error) return { error: "Failed to create country. It may already exist." };
  revalidateGeoPath();
  return { success: "Country created successfully." };
}

export async function updateCountry(id: number, values: z.infer<typeof countrySchema>) {
  if (!await isSuperAdmin()) return { error: "Unauthorized" };
  const supabase = createClient();
  const { error } = await supabase.from("countries").update(values).eq("id", id);
  if (error) return { error: "Failed to update country." };
  revalidateGeoPath();
  return { success: "Country updated successfully." };
}

export async function toggleCountryStatus(id: number, currentStatus: boolean) {
  if (!await isSuperAdmin()) return { error: "Unauthorized" };
  const supabase = createClient();
  const { error } = await supabase.from("countries").update({ is_active: !currentStatus }).eq("id", id);
  if (error) return { error: "Failed to toggle country status." };
  revalidateGeoPath();
  return { success: "Country status updated." };
}

// --- States Actions ---
const stateSchema = z.object({
  name: z.string().min(1, "State name is required."),
  country_id: z.number().int(),
});

export async function getStates(countryId: number) {
  const supabase = createClient();
  const { data, error } = await supabase.from("states").select("*").eq("country_id", countryId).order("name");
  if (error) return { error: "Failed to fetch states." };
  return { data };
}

export async function createState(values: z.infer<typeof stateSchema>) {
  if (!await isSuperAdmin()) return { error: "Unauthorized" };
  const supabase = createClient();
  const { error } = await supabase.from("states").insert(values);
  if (error) return { error: "Failed to create state. It may already exist for this country." };
  revalidateGeoPath();
  return { success: "State created successfully." };
}

export async function updateState(id: number, values: { name: string }) {
  if (!await isSuperAdmin()) return { error: "Unauthorized" };
  const supabase = createClient();
  const { error } = await supabase.from("states").update({ name: values.name }).eq("id", id);
  if (error) return { error: "Failed to update state." };
  revalidateGeoPath();
  return { success: "State updated successfully." };
}

export async function toggleStateStatus(id: number, currentStatus: boolean) {
  if (!await isSuperAdmin()) return { error: "Unauthorized" };
  const supabase = createClient();
  const { error } = await supabase.from("states").update({ is_active: !currentStatus }).eq("id", id);
  if (error) return { error: "Failed to toggle state status." };
  revalidateGeoPath();
  return { success: "State status updated." };
}

// --- Regions Actions ---
const regionSchema = z.object({
  name: z.string().min(1, "Region name is required."),
  state_id: z.number().int(),
});

export async function getRegions(stateId: number) {
  const supabase = createClient();
  const { data, error } = await supabase.from("regions").select("*").eq("state_id", stateId).order("name");
  if (error) return { error: "Failed to fetch regions." };
  return { data };
}

export async function createRegion(values: z.infer<typeof regionSchema>) {
  if (!await isSuperAdmin()) return { error: "Unauthorized" };
  const supabase = createClient();
  const { error } = await supabase.from("regions").insert(values);
  if (error) return { error: "Failed to create region. It may already exist for this state." };
  revalidateGeoPath();
  return { success: "Region created successfully." };
}

export async function updateRegion(id: number, values: { name: string }) {
  if (!await isSuperAdmin()) return { error: "Unauthorized" };
  const supabase = createClient();
  const { error } = await supabase.from("regions").update({ name: values.name }).eq("id", id);
  if (error) return { error: "Failed to update region." };
  revalidateGeoPath();
  return { success: "Region updated successfully." };
}

export async function toggleRegionStatus(id: number, currentStatus: boolean) {
  if (!await isSuperAdmin()) return { error: "Unauthorized" };
  const supabase = createClient();
  const { error } = await supabase.from("regions").update({ is_active: !currentStatus }).eq("id", id);
  if (error) return { error: "Failed to toggle region status." };
  revalidateGeoPath();
  return { success: "Region status updated." };
}