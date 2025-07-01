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
import { updateEmailSettings } from "@/app/actions/settings";

const emailSettingsSchema = z.object({
  MAIL_DRIVER: z.string().optional().nullable(),
  MAIL_HOST: z.string().optional().nullable(),
  MAIL_PORT: z.string().optional().nullable(),
  MAIL_ENCRYPTION: z.string().optional().nullable(),
  MAIL_FROM_ADDRESS: z.string().optional().nullable(),
  MAIL_FROM_NAME: z.string().optional().nullable(),
});

type EmailSettingsFormValues = z.infer<typeof emailSettingsSchema>;

interface EmailSettingsFormProps {
  initialData: EmailSettingsFormValues;
}

export function EmailSettingsForm({ initialData }: EmailSettingsFormProps) {
  const form = useForm<EmailSettingsFormValues>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: initialData || {},
  });

  const onSubmit = async (data: EmailSettingsFormValues) => {
    const result = await updateEmailSettings(data);
    if (result.error) {
      toast.error("Failed to update settings", { description: result.error });
    } else {
      toast.success(result.message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="MAIL_DRIVER"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mail Driver</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., smtp" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="MAIL_HOST"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mail Host</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., smtp.mailtrap.io" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="MAIL_PORT"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mail Port</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 2525" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="MAIL_ENCRYPTION"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mail Encryption</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., tls" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="MAIL_FROM_ADDRESS"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mail From Address</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., no-reply@example.com" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="MAIL_FROM_NAME"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mail From Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Your App Name" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sensitive Credentials</AlertTitle>
          <AlertDescription>
            For security reasons, Mail Username and Mail Password must be set as environment variables (MAIL_USERNAME, MAIL_PASSWORD) on the server. Changes to these values require a server restart to take effect.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="mail-username">Mail Username</Label>
            <Input id="mail-username" placeholder="Set in environment variables" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mail-password">Mail Password</Label>
            <Input id="mail-password" type="password" placeholder="********" disabled />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </Form>
  );
}