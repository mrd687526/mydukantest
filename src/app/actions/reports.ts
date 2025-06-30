"use server";

import { createClient } from "@/integrations/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  CustomerOrderReportData,
  TopPaymentMethodReportData,
  TopSellingProductReportData,
  TopSellingCategoryReportData,
  TopSellingBrandReportData,
} from "@/lib/types";

const dateRangeSchema = z.object({
  startDate: z.string().datetime({ message: "Invalid start date format." }),
  endDate: z.string().datetime({ message: "Invalid end date format." }),
});

export async function getCustomerOrderReports(values: z.infer<typeof dateRangeSchema>): Promise<{ data: CustomerOrderReportData[] | null; error: string | null }> {
  const supabase = createClient();

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

export async function getTopSalesReports(values: z.infer<typeof dateRangeSchema>): Promise<{
  topPaymentMethods: TopPaymentMethodReportData[] | null;
  topSellingProducts: TopSellingProductReportData[] | null;
  topSellingCategories: TopSellingCategoryReportData[] | null;
  topSellingBrands: TopSellingBrandReportData[] | null;
  error: string | null;
}> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      topPaymentMethods: null,
      topSellingProducts: null,
      topSellingCategories: null,
      topSellingBrands: null,
      error: "You must be logged in to view reports."
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return {
      topPaymentMethods: null,
      topSellingProducts: null,
      topSellingCategories: null,
      topSellingBrands: null,
      error: "You must have a profile to view reports."
    };
  }

  const [
    topPaymentMethodsRes,
    topSellingProductsRes,
    topSellingCategoriesRes,
    topSellingBrandsRes,
  ] = await Promise.all([
    supabase.rpc("get_top_payment_methods", {
      p_profile_id: profile.id,
      p_start_date: values.startDate,
      p_end_date: values.endDate,
    }),
    supabase.rpc("get_top_selling_products", {
      p_profile_id: profile.id,
      p_start_date: values.startDate,
      p_end_date: values.endDate,
    }),
    supabase.rpc("get_top_selling_categories", {
      p_profile_id: profile.id,
      p_start_date: values.startDate,
      p_end_date: values.endDate,
    }),
    supabase.rpc("get_top_selling_brands", {
      p_profile_id: profile.id,
      p_start_date: values.startDate,
      p_end_date: values.endDate,
    }),
  ]);

  if (topPaymentMethodsRes.error) {
    console.error("Supabase error fetching top payment methods:", topPaymentMethodsRes.error.message);
    return {
      topPaymentMethods: null,
      topSellingProducts: null,
      topSellingCategories: null,
      topSellingBrands: null,
      error: "Database error: Could not fetch top payment methods."
    };
  }
  if (topSellingProductsRes.error) {
    console.error("Supabase error fetching top selling products:", topSellingProductsRes.error.message);
    return {
      topPaymentMethods: null,
      topSellingProducts: null,
      topSellingCategories: null,
      topSellingBrands: null,
      error: "Database error: Could not fetch top selling products."
    };
  }
  if (topSellingCategoriesRes.error) {
    console.error("Supabase error fetching top selling categories:", topSellingCategoriesRes.error.message);
    return {
      topPaymentMethods: null,
      topSellingProducts: null,
      topSellingCategories: null,
      topSellingBrands: null,
      error: "Database error: Could not fetch top selling categories."
    };
  }
  if (topSellingBrandsRes.error) {
    console.error("Supabase error fetching top selling brands:", topSellingBrandsRes.error.message);
    return {
      topPaymentMethods: null,
      topSellingProducts: null,
      topSellingCategories: null,
      topSellingBrands: null,
      error: "Database error: Could not fetch top selling brands."
    };
  }

  return {
    topPaymentMethods: topPaymentMethodsRes.data as TopPaymentMethodReportData[],
    topSellingProducts: topSellingProductsRes.data as TopSellingProductReportData[],
    topSellingCategories: topSellingCategoriesRes.data as TopSellingCategoryReportData[],
    topSellingBrands: topSellingBrandsRes.data as TopSellingBrandReportData[],
    error: null
  };
}