"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createNewUserAndProfile } from "@/app/actions/superadmin";

const superAdminSignupSchema = z.object({
  email: z.string().email("Invalid email format."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  name: z.string().min(2, "Name must be at least 2 characters."),
});

type SuperAdminSignupValues = z.infer<typeof superAdminSignupSchema>;

export function SuperAdminSignupForm() {
  const router = useRouter();
  const form = useForm<SuperAdminSignupValues>({
    resolver: zodResolver(superAdminSignupSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const onSubmit = async (data: SuperAdminSignupValues) => {
    const result = await createNewUserAndProfile({ ...data, role: 'super_admin' });

    if (result.error) {
      toast.error("Failed to create Super Admin account", {
        description: result.error,
      });
    } else {
      toast.success(result.message || "Super Admin account created successfully!");
      router.push('/superadmin/users'); // Redirect to user management page
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Create Super Admin Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          This account will have full administrative privileges.
        </p>
      </div>
      <div className="rounded-lg bg-white p-8 shadow-lg space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Super Admin Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
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
              control={form.control}
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
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating..." : "Create Super Admin"}
            </Button>
          </form>
        </Form>
        <div className="text-center text-sm text-gray-600 mt-4">
          Already have a Super Admin account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}