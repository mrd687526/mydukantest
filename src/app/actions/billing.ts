"use server";

import { createClient } from "@/integrations/supabase/server";
import { stripe } from "@/lib/stripe";
import { z } from "zod";
import { absoluteUrl } from "@/lib/utils"; // Assuming you have a utility for absolute URLs

const checkoutSessionSchema = z.object({
  priceId: z.string().min(1, "Stripe Price ID is required."),
});

export async function createCheckoutSession(values: z.infer<typeof checkoutSessionSchema>) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to subscribe." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("Supabase error fetching profile for billing:", profileError?.message);
    return { error: "User profile not found. Please complete your profile first." };
  }

  let stripeCustomerId = profile.stripe_customer_id;

  // If the user doesn't have a Stripe customer ID, create one
  if (!stripeCustomerId) {
    try {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: profile.name || user.email!,
        metadata: {
          supabase_user_id: user.id,
          supabase_profile_id: profile.id,
        },
      });
      stripeCustomerId = customer.id;

      // Update the user's profile with the new Stripe customer ID
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", profile.id);

      if (updateError) {
        console.error("Supabase error updating profile with Stripe customer ID:", updateError.message);
        return { error: "Failed to link Stripe customer to your profile." };
      }
    } catch (stripeError: any) {
      console.error("Stripe customer creation error:", stripeError.message);
      return { error: "Failed to create Stripe customer. Please try again." };
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [
        {
          price: values.priceId,
          quantity: 1,
        },
      ],
      success_url: absoluteUrl("/dashboard?success=true"), // Redirect to dashboard on success
      cancel_url: absoluteUrl("/dashboard/pricing?cancelled=true"), // Redirect back to pricing on cancel
      metadata: {
        supabase_profile_id: profile.id,
        supabase_user_id: user.id,
      },
    });

    return { url: session.url, error: null };
  } catch (stripeError: any) {
    console.error("Stripe checkout session creation error:", stripeError.message);
    return { error: "Failed to create checkout session. Please try again." };
  }
}