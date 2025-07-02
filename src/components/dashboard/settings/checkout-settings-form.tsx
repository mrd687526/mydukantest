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
import { updateCheckoutSettings } from "@/app/actions/store-settings";
import { Profile } from "@/lib/types";

const checkoutSettingsSchema = z.object({
  checkout_enable_notes: z.boolean(),
  checkout_require_login: z.boolean(),
  guest_checkout_enabled: z.boolean(),
});

type CheckoutSettingsFormValues = z.infer<typeof checkoutSettingsSchema>;

interface CheckoutSettingsFormProps {
  initialData: Profile;
}

export function CheckoutSettingsForm({ initialData }: CheckoutSettingsFormProps) {
  const form = useForm<CheckoutSettingsFormValues>({
    resolver: zodResolver(checkoutSettingsSchema),
    defaultValues: {
      checkout_enable_notes: initialData.checkout_enable_notes ?? true,
      checkout_require_login: initialData.checkout_require_login ?? false,
      guest_checkout_enabled: initialData.guest_checkout_enabled ?? true,
    },
  });

  const onSubmit = async (values: CheckoutSettingsFormValues) => {
    const result = await updateCheckoutSettings(values);
    if (result.error) {
      toast.error("Failed to update checkout settings", { description: result.error });
    } else {
      toast.success(result.message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="checkout_enable_notes"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Enable 'Additional Notes' Field on Checkout</FormLabel>
                <FormDescription>Allow customers to add notes to their order during checkout.</FormDescription>
              </div>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="checkout_require_login"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Require Customers to Log In for Checkout</FormLabel>
                <FormDescription>Force customers to log in or create an account before completing a purchase.</FormDescription>
              </div>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="guest_checkout_enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Enable Guest Checkout</FormLabel>
                <FormDescription>Allow customers to checkout without creating an account.</FormDescription>
              </div>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save Checkout Settings"}
          </Button>
        </div>
      </form>
    </Form>
  );
}