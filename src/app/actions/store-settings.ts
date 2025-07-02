"use server";

import { createServerClient } from "@/integrations/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Helper to get the current user's profile ID
async function getProfileId() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile) return { error: "Profile not found." };
  return { profileId: profile.id };
}

// --- Identity Settings ---
const identitySettingsSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters."),
  logo_url: z.string().url("Invalid URL format.").optional().nullable(),
});

export async function updateIdentitySettings(formData: FormData) {
  const profileRes = await getProfileId();
  if (profileRes.error) return { error: profileRes.error };
  const profileId = profileRes.profileId;

  const name = formData.get('name') as string;
  const logoFile = formData.get('logo_file') as File | null;
  const existingLogoUrl = formData.get('logo_url') as string | null;

  const supabase = createServerClient();
  let newLogoUrl: string | null = existingLogoUrl;

  if (logoFile && logoFile.size > 0) {
    const filePath = `store_logos/${profileId}/${Date.now()}_${logoFile.name}`;
    const { data, error: uploadError } = await supabase.storage.from('brand_assets').upload(filePath, logoFile, { upsert: true });
    if (uploadError) {
      console.error("Error uploading logo:", uploadError);
      return { error: "Failed to upload logo." };
    }
    const { data: { publicUrl } } = supabase.storage.from('brand_assets').getPublicUrl(filePath);
    newLogoUrl = publicUrl;
  } else if (logoFile && logoFile.size === 0 && existingLogoUrl) {
    // If an empty file is submitted but there was an existing URL, keep the existing URL
    newLogoUrl = existingLogoUrl;
  } else if (logoFile && logoFile.size === 0 && !existingLogoUrl) {
    // If an empty file is submitted and no existing URL, clear the URL
    newLogoUrl = null;
  }

  const { error } = await supabase
    .from("profiles")
    .update({ name: name, logo_url: newLogoUrl })
    .eq("id", profileId);

  if (error) {
    console.error("Error updating identity settings:", error);
    return { error: "Database error: Could not update identity settings." };
  }

  revalidatePath("/dashboard/settings/identity");
  revalidatePath("/dashboard"); // Revalidate dashboard to reflect name/logo changes
  return { success: true, message: "Identity settings updated successfully!" };
}

// --- SEO Settings ---
const seoSettingsSchema = z.object({
  seo_google_analytics_id: z.string().optional().nullable(),
  seo_facebook_pixel_id: z.string().optional().nullable(),
  seo_meta_keywords: z.string().optional().nullable(),
  seo_meta_description: z.string().optional().nullable(),
  seo_meta_image_url: z.string().url("Invalid URL format.").optional().nullable(),
});

export async function updateSeoSettings(formData: FormData) {
  const profileRes = await getProfileId();
  if (profileRes.error) return { error: profileRes.error };
  const profileId = profileRes.profileId;

  const seo_google_analytics_id = formData.get('seo_google_analytics_id') as string | null;
  const seo_facebook_pixel_id = formData.get('seo_facebook_pixel_id') as string | null;
  const seo_meta_keywords = formData.get('seo_meta_keywords') as string | null;
  const seo_meta_description = formData.get('seo_meta_description') as string | null;
  const seoMetaImageFile = formData.get('seo_meta_image_file') as File | null;
  const existingMetaImageUrl = formData.get('seo_meta_image_url') as string | null;

  const supabase = createServerClient();
  let newMetaImageUrl: string | null = existingMetaImageUrl;

  if (seoMetaImageFile && seoMetaImageFile.size > 0) {
    const filePath = `seo_meta_images/${profileId}/${Date.now()}_${seoMetaImageFile.name}`;
    const { data, error: uploadError } = await supabase.storage.from('brand_assets').upload(filePath, seoMetaImageFile, { upsert: true });
    if (uploadError) {
      console.error("Error uploading meta image:", uploadError);
      return { error: "Failed to upload meta image." };
    }
    const { data: { publicUrl } } = supabase.storage.from('brand_assets').getPublicUrl(filePath);
    newMetaImageUrl = publicUrl;
  } else if (seoMetaImageFile && seoMetaImageFile.size === 0 && existingMetaImageUrl) {
    newMetaImageUrl = existingMetaImageUrl;
  } else if (seoMetaImageFile && seoMetaImageFile.size === 0 && !existingMetaImageUrl) {
    newMetaImageUrl = null;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      seo_google_analytics_id: seo_google_analytics_id,
      seo_facebook_pixel_id: seo_facebook_pixel_id,
      seo_meta_keywords: seo_meta_keywords,
      seo_meta_description: seo_meta_description,
      seo_meta_image_url: newMetaImageUrl,
    })
    .eq("id", profileId);

  if (error) {
    console.error("Error updating SEO settings:", error);
    return { error: "Database error: Could not update SEO settings." };
  }

  revalidatePath("/dashboard/settings/seo");
  return { success: true, message: "SEO settings updated successfully!" };
}

// --- Custom Settings ---
const customSettingsSchema = z.object({
  subdomain: z.string().optional().nullable(),
  custom_domain: z.string().optional().nullable(),
  custom_css: z.string().optional().nullable(),
  custom_js: z.string().optional().nullable(),
});

export async function updateCustomSettings(values: z.infer<typeof customSettingsSchema>) {
  const profileRes = await getProfileId();
  if (profileRes.error) return { error: profileRes.error };
  const profileId = profileRes.profileId;

  const { error } = await supabase
    .from("profiles")
    .update({
      subdomain: values.subdomain,
      custom_domain: values.custom_domain,
      custom_css: values.custom_css,
      custom_js: values.custom_js,
    })
    .eq("id", profileId);

  if (error) {
    console.error("Error updating custom settings:", error);
    if (error.code === '23505') { // Unique violation for subdomain
      return { error: "This subdomain is already taken. Please choose another." };
    }
    return { error: "Database error: Could not update custom settings." };
  }

  revalidatePath("/dashboard/settings/customizations");
  return { success: true, message: "Custom settings updated successfully!" };
}

// --- Checkout Settings ---
const checkoutSettingsSchema = z.object({
  checkout_enable_notes: z.boolean(),
  checkout_require_login: z.boolean(),
  guest_checkout_enabled: z.boolean().optional(),
});

export async function updateCheckoutSettings(values: z.infer<typeof checkoutSettingsSchema>) {
  const profileRes = await getProfileId();
  if (profileRes.error) return { error: profileRes.error };
  const profileId = profileRes.profileId;

  const updateObj: Record<string, any> = {
    checkout_enable_notes: values.checkout_enable_notes,
    checkout_require_login: values.checkout_require_login,
  };
  if (typeof values.guest_checkout_enabled === 'boolean') {
    updateObj.guest_checkout_enabled = values.guest_checkout_enabled;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updateObj)
    .eq("id", profileId);

  if (error) {
    console.error("Error updating checkout settings:", error);
    return { error: "Database error: Could not update checkout settings." };
  }

  revalidatePath("/dashboard/settings/checkout");
  return { success: true, message: "Checkout settings updated successfully!" };
}

// --- Shipping Settings ---
const shippingSettingsSchema = z.object({
  shipping_address: z.string().optional().nullable(),
  shipping_city: z.string().optional().nullable(),
  shipping_state: z.string().optional().nullable(),
  shipping_zip_code: z.string().optional().nullable(),
  shipping_country: z.string().optional().nullable(),
});

export async function updateShippingSettings(values: z.infer<typeof shippingSettingsSchema>) {
  const profileRes = await getProfileId();
  if (profileRes.error) return { error: profileRes.error };
  const profileId = profileRes.profileId;

  const { error } = await supabase
    .from("profiles")
    .update({
      shipping_address: values.shipping_address,
      shipping_city: values.shipping_city,
      shipping_state: values.shipping_state,
      shipping_zip_code: values.shipping_zip_code,
      shipping_country: values.shipping_country,
    })
    .eq("id", profileId);

  if (error) {
    console.error("Error updating shipping settings:", error);
    return { error: "Database error: Could not update shipping settings." };
  }

  revalidatePath("/dashboard/settings/shipping");
  return { success: true, message: "Shipping settings updated successfully!" };
}