"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { updateAnalyticsSettings } from "@/app/actions/settings";

const analyticsSettingsSchema = z.object({
  ANALYTICS_URL: z.string().url("Please enter a valid URL.").optional().nullable(),
  ANALYTICS_WEBSITE_ID: z.string().optional().nullable(),
});

type AnalyticsSettingsFormValues = z.infer<typeof analyticsSettingsSchema>;

interface AnalyticsSettingsFormProps {
  initialData: Record<string, any>;
}

export function AnalyticsSettingsForm({ initialData }: AnalyticsSettingsFormProps) {
  const form = useForm<AnalyticsSettingsFormValues>({
    resolver: zodResolver(analyticsSettingsSchema),
    defaultValues: initialData || {},
  });

  const onSubmit = async (data: AnalyticsSettingsFormValues) => {
    const result = await updateAnalyticsSettings(data);
    if (result.error) {
      toast.error("Failed to update settings", { description: result.error });
    } else {
      toast.success(result.message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="ANALYTICS_URL"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Analytics Service URL</FormLabel>
              <FormControl>
                <Input placeholder="e.g., https://umami.yourdomain.com" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormDescription>The base URL of your analytics service (e.g., Umami).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ANALYTICS_WEBSITE_ID"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Analytics Website ID</FormLabel>
              <FormControl>
                <Input placeholder="e.g., your-website-id-from-umami" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormDescription>The unique ID for your website in the analytics service.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sensitive Credentials</AlertTitle>
          <AlertDescription>
            The Analytics API Key (e.g., `ANALYTICS_API_KEY`) must be set as a server-side environment variable. It will not be exposed or managed here.
          </AlertDescription>
        </Alert>

        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </Form>
  );
}