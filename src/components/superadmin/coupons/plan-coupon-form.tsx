"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { formatISO } from "date-fns";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createPlanCoupon, updatePlanCoupon } from "@/app/actions/superadmin-coupons";
import { PlanCoupon } from "@/lib/types";

const planCouponFormSchema = z.object({
  code: z.string().min(1, "Coupon code is required."),
  type: z.enum(['percentage', 'fixed_amount'], { message: "Invalid coupon type." }),
  value: z.coerce.number().min(0, "Value must be a non-negative number."),
  expires_at: z.string().datetime({ message: "Invalid expiration date format." }).optional().nullable(),
  is_active: z.boolean(),
});

type PlanCouponFormValues = z.infer<typeof planCouponFormSchema>;

interface PlanCouponFormProps {
  initialData?: PlanCoupon | null;
  onSuccess?: () => void;
}

export function PlanCouponForm({ initialData, onSuccess }: PlanCouponFormProps) {
  const defaultFormValues: PlanCouponFormValues = {
    code: initialData?.code || "",
    type: initialData?.type || "percentage",
    value: initialData?.value || 0,
    expires_at: initialData?.expires_at ? formatISO(new Date(initialData.expires_at), { representation: 'complete' }) : null,
    is_active: initialData?.is_active ?? true,
  };

  const form = useForm<PlanCouponFormValues>({
    resolver: zodResolver(planCouponFormSchema),
    defaultValues: defaultFormValues,
  });

  const onSubmit = async (data: PlanCouponFormValues) => {
    let result;
    if (initialData) {
      result = await updatePlanCoupon(initialData.id, data);
    } else {
      result = await createPlanCoupon(data);
    }

    if (result?.error) {
      toast.error(initialData ? "Failed to update coupon" : "Failed to create coupon", {
        description: typeof result.error === 'string' ? result.error : "An unknown error occurred.",
      });
    } else {
      toast.success(result.message);
      onSuccess?.();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coupon Code</FormLabel>
              <FormControl>
                <Input placeholder="e.g., NEWUSER10" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage Off</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount Off</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="10.00" {...field} />
                </FormControl>
                <FormDescription>
                  {form.watch('type') === 'percentage' ? 'e.g., 10 for 10%' : 'e.g., 5.00 for $5 off'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="expires_at"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expires At (Optional)</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormDescription>
                Leave blank for no expiration.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
                <FormDescription>
                  Enable or disable this coupon code.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onSuccess}>Cancel</Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : (initialData ? "Save Changes" : "Create Coupon")}
          </Button>
        </div>
      </form>
    </Form>
  );
}