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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createPlan, updatePlan } from "@/app/actions/plans";
import { Plan } from "@/lib/types";

const planFormSchema = z.object({
  name: z.string().min(1, "Plan name is required."),
  description: z.string().optional().nullable(),
  price: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0, "Price must be a non-negative number.")
  ),
  currency: z.string().min(1, "Currency is required.").default('USD'),
  interval: z.enum(['month', 'year', 'lifetime'], { message: "Invalid interval type." }),
  stripe_price_id: z.string().optional().nullable(),
  features: z.string().optional().nullable(), // Comma-separated string
  is_active: z.boolean().default(true),
});

type PlanFormValues = z.infer<typeof planFormSchema>;

interface PlanFormProps {
  initialData?: Plan | null;
  onSuccess?: () => void;
}

export function PlanForm({ initialData, onSuccess }: PlanFormProps) {
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      currency: initialData?.currency || "USD",
      interval: initialData?.interval || "month",
      stripe_price_id: initialData?.stripe_price_id || "",
      features: initialData?.features?.join(', ') || "",
      is_active: initialData?.is_active ?? true,
    },
  });

  const onSubmit = async (data: PlanFormValues) => {
    let result;
    if (initialData) {
      result = await updatePlan(initialData.id, data);
    } else {
      result = await createPlan(data);
    }

    if (result?.error) {
      toast.error(initialData ? "Failed to update plan" : "Failed to create plan", {
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Basic Plan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="A short description of the plan" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="9.99" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <Input placeholder="USD" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="interval"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Billing Interval</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="year">Annually</SelectItem>
                  <SelectItem value="lifetime">Lifetime</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stripe_price_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stripe Price ID (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="price_XXXXXXXXXXXXXX" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormDescription>
                Link this plan to a Stripe Price ID for billing.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="features"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Features</FormLabel>
              <FormControl>
                <Textarea placeholder="Feature 1, Feature 2, Feature 3" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormDescription>
                Comma-separated list of features included in this plan.
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
                  Set this plan as active and visible.
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
            {form.formState.isSubmitting ? "Saving..." : (initialData ? "Save Changes" : "Create Plan")}
          </Button>
        </div>
      </form>
    </Form>
  );
}