"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { updateCookieSettings } from "@/app/actions/settings";

const cookieSettingsSchema = z.object({
  cookie_banner_enabled: z.boolean().default(false),
  cookie_title: z.string().optional().nullable(),
  cookie_description: z.string().optional().nullable(),
  cookie_contact_url: z.string().url({ message: "Please enter a valid URL." }).optional().nullable(),
  cookie_strict_mode_default: z.boolean().default(false),
});

type CookieSettingsFormValues = z.infer<typeof cookieSettingsSchema>;

interface CookieSettingsFormProps {
  initialData: Record<string, any>;
}

export function CookieSettingsForm({ initialData }: CookieSettingsFormProps) {
  const form = useForm<CookieSettingsFormValues>({
    resolver: zodResolver(cookieSettingsSchema),
    defaultValues: {
      cookie_banner_enabled: initialData.cookie_banner_enabled === 'true',
      cookie_title: initialData.cookie_title || "We use cookies",
      cookie_description: initialData.cookie_description || "We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking 'Accept All', you consent to our use of cookies.",
      cookie_contact_url: initialData.cookie_contact_url || "",
      cookie_strict_mode_default: initialData.cookie_strict_mode_default === 'true',
    },
  });

  const onSubmit = async (data: CookieSettingsFormValues) => {
    const result = await updateCookieSettings(data);
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
          name="cookie_banner_enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Enable Cookie Consent Banner</FormLabel>
                <FormDescription>Show the cookie consent banner to new visitors.</FormDescription>
              </div>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cookie_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cookie Title</FormLabel>
              <FormControl><Input placeholder="We use cookies" {...field} value={field.value ?? ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cookie_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cookie Description</FormLabel>
              <FormControl><Textarea placeholder="Describe how you use cookies..." {...field} value={field.value ?? ''} rows={4} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cookie_contact_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Details Link</FormLabel>
              <FormControl><Input placeholder="https://example.com/privacy" {...field} value={field.value ?? ''} /></FormControl>
              <FormDescription>Link to your privacy policy or contact page.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cookie_strict_mode_default"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Enable 'Strictly Necessary' Mode by Default</FormLabel>
                <FormDescription>If enabled, only essential cookies are active by default.</FormDescription>
              </div>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save Cookie Settings"}
          </Button>
        </div>
      </form>
    </Form>
  );
}