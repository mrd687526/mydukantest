"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createBrowserClient } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { logCustomerEvent } from "@/app/actions/customer-events";
import { updateCustomerLastActive } from "@/app/actions/customers";

export default function CustomerAuthForm() {
  const supabase = createBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Determine the store's profile_id for this customer
        const { data: storeProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("role", "store_admin")
          .limit(1)
          .maybeSingle();

        if (storeProfile) {
          // Ensure customer record exists and get its ID
          const { data: customer, error: customerError } = await supabase
            .from("customers")
            .upsert({
              profile_id: storeProfile.id,
              email: session.user.email!,
              name: session.user.user_metadata.full_name || session.user.user_metadata.name || session.user.email!,
              last_active: new Date().toISOString(),
              status: 'active',
            }, { onConflict: 'profile_id,email' })
            .select('id')
            .maybeSingle();

          if (customer && !customerError) {
            if (event === 'SIGNED_IN') {
              await logCustomerEvent({
                customer_id: customer.id,
                event_type: 'last_login',
                event_details: { user_id: session.user.id },
              });
              await updateCustomerLastActive(customer.id);
            } else if (event === 'SIGNED_UP') {
              await logCustomerEvent({
                customer_id: customer.id,
                event_type: 'registered',
                event_details: { user_id: session.user.id },
              });
              await updateCustomerLastActive(customer.id);
            }
          } else {
            console.error("Failed to create/update customer record:", customerError);
          }
        }
        // Redirect to account page if user is logged in
        router.push('/store/account');
      }
    });

    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Also update last_active on initial session load if user is already logged in
        const { data: storeProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("role", "store_admin")
          .limit(1)
          .maybeSingle();

        if (storeProfile) {
          const { data: customer } = await supabase
            .from("customers")
            .select("id")
            .eq("email", session.user.email!)
            .eq("profile_id", storeProfile.id)
            .maybeSingle();
          if (customer) {
            await updateCustomerLastActive(customer.id);
          }
        }
        router.push('/store/account');
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign in or create an account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          to manage your orders and preferences.
        </p>
      </div>
      {error && <p className="text-center font-medium text-red-500">{error}</p>}
      <div className="rounded-lg bg-white p-8 shadow-lg space-y-6">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={["google", "facebook"]}
          theme="light"
          redirectTo={
            typeof window !== "undefined"
              ? `${window.location.origin}/store/auth/callback`
              : ""
          }
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email address',
                password_label: 'Password',
                email_input_placeholder: 'Your email address',
                password_input_placeholder: 'Your password',
                button_label: 'Sign in',
                social_provider_text: 'Sign in with {{provider}}',
                link_text: 'Already have an account? Sign in',
              },
              sign_up: {
                email_label: 'Email address',
                password_label: 'Create a password',
                email_input_placeholder: 'Your email address',
                password_input_placeholder: 'Your password',
                button_label: 'Sign up',
                social_provider_text: 'Sign up with {{provider}}',
                link_text: 'Don\'t have an account? Sign up',
              },
              forgotten_password: {
                link_text: 'Forgot your password?',
                button_label: 'Send reset instructions',
                email_label: 'Email address',
                email_input_placeholder: 'Your email address',
              },
              update_password: {
                password_label: 'New password',
                password_input_placeholder: 'Your new password',
                button_label: 'Update password',
              },
            },
          }}
        />
      </div>
      <div className="text-center text-sm text-gray-600">
        <p>
          By signing in, you agree to our{" "}
          <Link href="/privacy-policy" className="font-medium text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}