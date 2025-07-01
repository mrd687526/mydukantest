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
import { Switch } from "@/components/ui/switch";
import { updateNotificationsSettings } from "@/app/actions/settings";

const notificationsSettingsSchema = z.object({
  enable_wishlist_emails: z.boolean().default(false),
  enable_abandoned_cart_emails: z.boolean().default(false),
});

type NotificationsSettingsFormValues = z.infer<typeof notificationsSettingsSchema>;

interface NotificationsSettingsFormProps {
  initialData: Record<string, any>;
}

export function NotificationsSettingsForm({ initialData }: NotificationsSettingsFormProps) {
  const form = useForm<NotificationsSettingsFormValues>({
    resolver: zodResolver(notificationsSettingsSchema),
    defaultValues: {
      enable_wishlist_emails: initialData.enable_wishlist_emails === 'true',
      enable_abandoned_cart_emails: initialData.enable_abandoned_cart_emails === 'true',
    },
  });

  const onSubmit = async (values: NotificationsSettingsFormValues) => {
    const result = await updateNotificationsSettings(values);
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
          name="enable_wishlist_emails"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Enable Wishlist Email Notifications</FormLabel>
                <FormDescription>
                  Send emails to customers when items on their wishlist go on sale or are back in stock.
                </FormDescription>
              </div>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="enable_abandoned_cart_emails"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Enable Abandoned Cart Emails</FormLabel>
                <FormDescription>
                  Automatically send reminder emails to customers who leave items in their cart.
                </FormDescription>
              </div>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </Form>
  );
}