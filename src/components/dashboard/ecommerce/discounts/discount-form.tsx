"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { formatISO } from "date-fns";
import { useRouter } from "next/navigation";

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
import { createDiscount, updateDiscount } from "@/app/actions/discounts";
import { Discount } from "@/lib/types";

const discountFormSchema = z.object({
  code: z.string().min(1, "Discount code is required."),
  type: z.enum(['percentage', 'fixed_amount', 'free_shipping']),
  value: z.coerce.number().min(0, "Value must be a non-negative number."),
  min_purchase_amount: z.preprocess(
    (val) => val && String(val).trim() !== '' ? parseFloat(String(val)) : null,
    z.number().min(0).optional().nullable()
  ),
  usage_limit: z.preprocess(
    (val) => val && String(val).trim() !== '' ? parseInt(String(val), 10) : null,
    z.number().int().min(0).optional().nullable()
  ),
  start_date: z.string().datetime({ message: "Invalid start date format." }),
  end_date: z.string().datetime({ message: "Invalid end date format." }).optional().nullable(),
  is_active: z.boolean(), // Removed .default(true)
});

type DiscountFormValues = z.infer<typeof discountFormSchema>;

interface DiscountFormProps {
  initialData?: Discount | null;
  onSuccess?: () => void; // Optional callback for dialogs
}

export function DiscountForm({ initialData, onSuccess }: DiscountFormProps) {
  const router = useRouter();

  const defaultFormValues: DiscountFormValues = {
    code: initialData?.code || "",
    type: initialData?.type || "percentage",
    value: initialData?.value || 0,
    min_purchase_amount: initialData?.min_purchase_amount || null,
    usage_limit: initialData?.usage_limit || null,
    start_date: initialData?.start_date ? formatISO(new Date(initialData.start_date), { representation: 'complete' }) : formatISO(new Date(), { representation: 'complete' }),
    end_date: initialData?.end_date ? formatISO(new Date(initialData.end_date), { representation: 'complete' }) : null,
    is_active: initialData?.is_active ?? true, // Still ensure a boolean value here
  };

  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountFormSchema),
    defaultValues: defaultFormValues,
  });

  const onSubmit = async (data: DiscountFormValues) => {
    try {
      let result;
      if (initialData) {
        result = await updateDiscount(initialData.id, data);
      } else {
        result = await createDiscount(data);
      }

      if (result?.error) {
        toast.error(initialData ? "Failed to update discount" : "Failed to create discount", {
          description: typeof result.error === 'string' ? result.error : "An unknown error occurred.",
        });
      } else {
        toast.success(initialData ? "Discount updated successfully!" : "Discount created successfully!");
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/dashboard/ecommerce/discounts');
          router.refresh();
        }
      }
    } catch (error) {
      // Catch potential errors from router.push/refresh if they throw
      console.error("Form submission caught an error:", error);
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
              <FormLabel>Discount Code</FormLabel>
              <FormControl>
                <Input placeholder="e.g., SUMMER20" {...field} />
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
                    <SelectItem value="free_shipping">Free Shipping</SelectItem>
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
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="min_purchase_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Purchase Amount</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormDescription>Leave blank for no minimum.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="usage_limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usage Limit</Label>
                <FormControl>
                  <Input type="number" step="1" placeholder="100" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormDescription>Leave blank for unlimited uses.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date (Optional)</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
                <FormDescription>
                  Enable or disable this discount code.
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
          <Button type="button" variant="ghost" onClick={() => {
            if (onSuccess) onSuccess(); // Close dialog
            else router.push('/dashboard/ecommerce/discounts'); // Navigate back
          }}>Cancel</Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : (initialData ? "Save Changes" : "Create Discount")}
          </Button>
        </div>
      </form>
    </Form>
  );
}