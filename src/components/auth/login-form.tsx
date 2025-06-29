"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClient } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function LoginForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };

    checkUserAndRedirect();
  }, [supabase, router]);

  const handleQuickAccess = async () => {
    setIsDemoLoading(true);
    // Note: Ensure this demo user exists in your Supabase auth.users table.
    const { error } = await supabase.auth.signInWithPassword({
      email: 'demo@commentflow.app',
      password: 'demopassword123',
    });

    if (error) {
      toast.error("Demo login failed", {
        description: "Please ensure the demo user is set up in your Supabase project.",
      });
      console.error("Demo login error:", error.message);
    } else {
      router.push('/dashboard');
    }
    setIsDemoLoading(false);
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
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
              ? `${window.location.origin}/auth/callback`
              : ""
          }
        />
        <Button
          variant="outline"
          className="w-full"
          onClick={handleQuickAccess}
          disabled={isDemoLoading}
        >
          {isDemoLoading ? "Logging in..." : "Quick Access (Demo)"}
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