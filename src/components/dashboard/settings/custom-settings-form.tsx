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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { updateCustomSettings } from "@/app/actions/store-settings";
import { Profile } from "@/lib/types";

const customSettingsSchema = z.object({
  subdomain: z.string().optional().nullable(),
  custom_domain: z.string().optional().nullable(),
  custom_css: z.string().optional().nullable(),
  custom_js: z.string().optional().nullable(),
});

type CustomSettingsFormValues = z.infer<typeof customSettingsSchema>;

interface CustomSettingsFormProps {
  initialData: Profile;
}

export function CustomSettingsForm({ initialData }: CustomSettingsFormProps) {
  const form = useForm<CustomSettingsFormValues>({
    resolver: zodResolver(customSettingsSchema),
    defaultValues: {
      subdomain: initialData.subdomain || "",
      custom_domain: initialData.custom_domain || "",
      custom_css: initialData.custom_css || "",
      custom_js: initialData.custom_js || "",
    },
  });

  const onSubmit = async (values: CustomSettingsFormValues) => {
    const result = await updateCustomSettings(values);
    if (result.error) {
      toast.error("Failed to update custom settings", { description: result.error });
    } else {
      toast.success(result.message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <h3 className="text-lg font-semibold">Domain & URL</h3>
        <FormField
          control={form.control}
          name="subdomain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subdomain</FormLabel>
              <FormControl>
                <Input placeholder="yourstore" {...field} />
              </FormControl>
              <FormDescription>
                Your store will be accessible at `yourstore.appdomain.com`.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="custom_domain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Domain</FormLabel>
              <FormControl>
                <Input placeholder="www.yourstore.com" {...field} />
              </FormControl>
              <FormDescription>
                To use a custom domain, you must configure your DNS records (CNAME/A) to point to our application server.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <h3 className="text-lg font-semibold mt-8">Custom Code</h3>
        <FormField
          control={form.control}
          name="custom_css"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom CSS</FormLabel>
              <FormControl>
                <Textarea placeholder="/* Add your custom CSS here */" rows={8} {...field} />
              </FormControl>
              <FormDescription>Apply custom styles to your storefront.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Security Warning</AlertTitle>
          <AlertDescription>
            Adding custom JavaScript allows for powerful integrations but also introduces significant security risks. Malicious scripts can be used to steal customer payment information. Only use scripts from trusted sources and understand the code you are adding. The platform owner is not responsible for data breaches caused by custom scripts.
          </AlertDescription>
        </Alert>
        <FormField
          control={form.control}
          name="custom_js"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom JavaScript</FormLabel>
              <FormControl>
                <Textarea placeholder="// Add your custom JavaScript here" rows={8} {...field} />
              </FormControl>
              <FormDescription>Add custom scripts for advanced functionality.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save Customizations"}
          </Button>
        </div>
      </form>
    </Form>
  );
}