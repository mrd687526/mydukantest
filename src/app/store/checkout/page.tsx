"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import { useCart } from "@/components/storefront/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CheckoutForm } from "@/components/storefront/checkout-form";
import { createOrder } from "@/app/actions/orders";
import { v4 as uuidv4 } from 'uuid'; // For generating unique order numbers
import { createBrowserClient } from "@/integrations/supabase/client"; // Import client for fetching profile_id
import { CheckoutWizard } from "@/components/storefront/checkout-wizard";
import { createServerClient } from "@/integrations/supabase/server";

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const checkoutFormSchema = z.object({
  customer_name: z.string().min(1, "Name is required."),
  customer_email: z.string().email("Invalid email address."),
  shipping_address_line1: z.string().min(1, "Address Line 1 is required."),
  shipping_address_line2: z.string().optional().nullable(),
  shipping_city: z.string().min(1, "City is required."),
  shipping_state: z.string().min(1, "State is required."),
  shipping_postal_code: z.string().min(1, "Postal Code is required."),
  shipping_country: z.string().min(1, "Country is required."),
  shipping_phone: z.string().optional().nullable(),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default async function CheckoutPage() {
  // Fetch the store's profile (assuming only one store_admin profile)
  const supabase = createBrowserClient();
  const { data: profile } = await supabase
        .from("profiles")
    .select("guest_checkout_enabled")
        .eq("role", "store_admin")
        .limit(1)
        .maybeSingle();
  const allowGuest = profile?.guest_checkout_enabled ?? true;
  return <CheckoutWizard allowGuest={allowGuest} />;
}