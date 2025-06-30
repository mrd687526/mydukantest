"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { saveCredentials } from "@/app/actions/settings";
import { updateProfile } from "@/app/actions/profile"; // Import the new action
import type { ProfileCredentials, Profile } from "@/lib/types";
import { useState } from "react";

// Schema for Facebook credentials
const credentialsSchema = z.object({
  fb_app_id: z.string().trim().min(1, "Facebook App ID is required."),
  fb_app_secret: z.string().trim().optional(),
});

type CredentialsFormValues = z.infer<typeof credentialsSchema>;

// Schema for profile update
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface SettingsFormProps {
  credentials: ProfileCredentials | null;
  userProfile: Profile | null; // Pass the user's profile data
}

export function SettingsForm({ credentials, userProfile }: SettingsFormProps) {
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  // Form for Facebook Credentials
  const credentialsForm = useForm<CredentialsFormValues>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      fb_app_id: credentials?.fb_app_id || "",
      fb_app_secret: "",
    },
  });

  const onCredentialsSubmit = async (data: CredentialsFormValues) => {
    const result = await saveCredentials(data);

    if (result.error) {
      toast.error("Failed to save credentials", { description: result.error });
    } else {
      toast.success(result.message);
      credentialsForm.reset({
        ...data,
        fb_app_secret: "",
      });
    }
  };

  // Form for Profile Information
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: userProfile?.name || "",
    },
  });

  const onProfileSubmit = async (data: ProfileFormValues) => {
    const result = await updateProfile(data);

    if (result.error) {
      toast.error("Failed to update profile", { description: result.error });
    } else {
      toast.success(result.message);
    }
  };

  const handleManageSubscription = async () => {
    setIsPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/create-customer-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create customer portal session.');
      }

      window.location.href = data.url; // Redirect to Stripe Customer Portal
    } catch (error: any) {
      toast.error('Failed to open subscription portal', { description: error.message });
      console.error('Error opening customer portal:', error);
    } finally {
      setIsPortalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your public profile details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                {profileForm.formState.isSubmitting ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Facebook App Credentials</CardTitle>
          <CardDescription>
            Enter your Facebook App ID and App Secret here. This information is stored securely and is required to connect your Facebook pages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...credentialsForm}>
            <form onSubmit={credentialsForm.handleSubmit(onCredentialsSubmit)} className="space-y-6">
              <FormField
                control={credentialsForm.control}
                name="fb_app_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook App ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Facebook App ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={credentialsForm.control}
                name="fb_app_secret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook App Secret</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter new secret to update" {...field} />
                    </FormControl>
                    <FormDescription>
                      Leave blank to keep your existing secret. Enter a new value to update it.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={credentialsForm.formState.isSubmitting}>
                {credentialsForm.formState.isSubmitting ? "Saving..." : "Save Credentials"}
              </Button>
            </form>
          </Form>
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-2">Subscription & Billing</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your subscription, update payment methods, and view billing history.
            </p>
            <Button onClick={handleManageSubscription} disabled={isPortalLoading}>
              {isPortalLoading ? "Loading..." : "Manage Subscription"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}