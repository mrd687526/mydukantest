"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createBrowserClient } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface LoginFormProps {
  redirectTo?: string;
}

const superAdminLoginSchema = z.object({
  email: z.string().email("Invalid email format."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type SuperAdminLoginValues = z.infer<typeof superAdminLoginSchema>;

export default function LoginForm({ redirectTo = '/dashboard' }: LoginFormProps) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("user");

  const superAdminForm = useForm<SuperAdminLoginValues>({
    resolver: zodResolver(superAdminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (profile?.role === 'super_admin') {
          router.push('/superadmin/dashboard');
        } else {
          router.push(redirectTo);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router, redirectTo]);

  const handleSuperAdminLogin = async (data: SuperAdminLoginValues) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error("Super Admin login failed", { description: error.message });
    }
  };

  const handleSuperAdminQuickAccess = async () => {
    setIsDemoLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: 'superadmin@example.com',
      password: 'password',
    });

    if (error) {
      toast.error("Super Admin Demo login failed", {
        description: "Please ensure the super admin demo user is set up.",
      });
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user">User Login</TabsTrigger>
            <TabsTrigger value="superadmin">Super Admin</TabsTrigger>
          </TabsList>
          <TabsContent value="user" className="mt-6">
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={["google", "facebook"]}
              theme="light"
              redirectTo={
                typeof window !== "undefined"
                  ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
                  : ""
              }
            />
          </TabsContent>
          <TabsContent value="superadmin" className="mt-6">
            <Form {...superAdminForm}>
              <form onSubmit={superAdminForm.handleSubmit(handleSuperAdminLogin)} className="space-y-4">
                <FormField
                  control={superAdminForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="superadmin@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={superAdminForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={superAdminForm.formState.isSubmitting}>
                  {superAdminForm.formState.isSubmitting ? "Logging in..." : "Sign In as Super Admin"}
                </Button>
              </form>
            </Form>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={handleSuperAdminQuickAccess}
              disabled={isDemoLoading}
            >
              {isDemoLoading ? "Logging in..." : "Quick Access (Super Admin Demo)"}
            </Button>
            <div className="text-center text-sm text-gray-600 mt-4">
              Don't have a Super Admin account?{" "}
              <Link href="/superadmin/signup" className="font-medium text-primary hover:underline">
                Sign up here
              </Link>
            </div>
          </TabsContent>
        </Tabs>
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