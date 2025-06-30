"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClient } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SuperAdminLoginFormProps {
  redirectTo?: string;
}

export default function SuperAdminLoginForm({ redirectTo = '/superadmin/users' }: SuperAdminLoginFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if the logged-in user is a super_admin before redirecting
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        if (profile?.role === 'super_admin') {
          router.push(redirectTo);
        } else {
          // If a non-super-admin tries to access superadmin login, redirect them to their dashboard
          router.push('/dashboard?error=Access denied. Not a super admin.');
        }
      }
    };

    checkUserAndRedirect();
  }, [supabase, router, redirectTo]);

  const handleQuickAccess = async () => {
    setIsDemoLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: 'superadmin@example.com', // Specific demo user for super admin
      password: 'password', // Default password for superadmin demo
    });

    if (error) {
      toast.error("Super Admin Demo login failed", {
        description: "Please ensure the super admin demo user is set up in your Supabase project.",
      });
      console.error("Super Admin Demo login error:", error.message);
    } else {
      // Redirection handled by useEffect after successful login
    }
    setIsDemoLoading(false);
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign in as Super Admin
        </h2>
      </div>
      {error && <p className="text-center font-medium text-red-500">{error}</p>}
      <div className="rounded-lg bg-white p-8 shadow-lg space-y-6">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]} // No social providers for super admin login
          theme="light"
          redirectTo={
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
              : ""
          }
        />
        <Button
          variant="outline"
          className="w-full"
          onClick={handleQuickAccess}
          disabled={isDemoLoading}
        >
          {isDemoLoading ? "Logging in..." : "Quick Access (Super Admin Demo)"}
        </Button>
      </div>
      <div className="text-center text-sm text-gray-600">
        <p>
          By signing in, you agree to our{" "}
          <Link href="/privacy-policy" className="font-medium text-primary hover:underline">
            Privacy Policy
          </Link>
          . You can also review our{" "}
          <Link href="/data-deletion" className="font-medium text-primary hover:underline">
            Data Deletion Instructions
          </Link>
          .
        </p>
      </div>
    </div>
  );
}