"use client";

import { useEffect, useState } from "react";
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
import { getProductsForSelection, getCategoriesForSelection } from "@/app/actions/products"; // New actions
import { Discount } from "@/lib/types";
import { MultiSelect } from "@/components/ui/multi-select"; // Assuming this component exists or will be created

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
  is_active: z.boolean(),
  included_product_ids: z.array(z.string().uuid()).optional().nullable(),
  excluded_product_ids: z.array(z.string().uuid()).optional().nullable(),
  included_category_ids: z.array(z.string()).optional().nullable(),
  excluded_category_ids: z.array(z.string()).optional().nullable(),
});

type DiscountFormValues = z.infer<typeof discountFormSchema>;

interface DiscountFormProps {
  initialData?: Discount | null;
  onSuccess?: () => void; // Optional callback for dialogs
}

export function DiscountForm({ initialData, onSuccess }: DiscountFormProps) {
  const router = useRouter();
  const [products, setProducts] = useState<{ value: string; label: string }[]>([]);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);

  const defaultFormValues: DiscountFormValues = {
    code: initialData?.code || "",
    type: initialData?.type || "percentage",
    value: initialData?.value || 0,
    min_purchase_amount: initialData?.min_purchase_amount || null,
    usage_limit: initialData?.usage_limit || null,
    start_date: initialData?.start_date ? formatISO(new Date(initialData.start_date), { representation: 'complete' }) : formatISO(new Date(), { representation: 'complete' }),
    end_date: initialData?.end_date ? formatISO(new Date(initialData.end_date), { representation: 'complete' }) : null,
    is_active: initialData?.is_active ?? true,
    included_product_ids: initialData?.included_product_ids || [],
    excluded_product_ids: initialData?.excluded_product_ids || [],
    included_category_ids: initialData?.included_category_ids || [],
    excluded_category_ids: initialData?.excluded_category_ids || [],
  };

  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountFormSchema),
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    const fetchSelectionData = async () => {
      const [productsRes, categoriesRes] = await Promise.all([
        getProductsForSelection(),
        getCategoriesForSelection(),
      ]);

      if (productsRes.data) {
        setProducts(productsRes.data.map(p => ({ value: p.id, label: p.name })));
      } else if (productsRes.error) {
        toast.error("Failed to load products for selection", { description: productsRes.error });
      }

      if (categoriesRes.data) {
        setCategories(categoriesRes.data.map(c => ({ value: c, label: c })));
      } else if (categoriesRes.error) {
        toast.error("Failed to load categories for selection", { description: categoriesRes.error });
      }
    };
    fetchSelectionData();
  }, []);

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
          router.push('/dashboard/marketing/coupons'); // Redirect to new marketing path
          router.refresh();
        }
      }
    } catch (error) {
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

        <h3 className="text-lg font-semibold mt-8">Targeting Rules (Optional)</h3>
        <p className="text-sm text-muted-foreground mb-4">Apply this discount only to specific products or categories.</p>

        <FormField
          control={form.control}
          name="included_product_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Include Products</FormLabel>
              <FormControl>
                <MultiSelect
                  options={products}
                  selected={field.value || []}
                  onSelectedChange={field.onChange}
                  placeholder="Select products to include..."
                />
              </FormControl>
              <FormDescription>Discount applies only to these products.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="excluded_product_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exclude Products</FormLabel>
              <FormControl>
                <MultiSelect
                  options={products}
                  selected={field.value || []}
                  onSelectedChange={field.onChange}
                  placeholder="Select products to exclude..."
                />
              </FormControl>
              <FormDescription>Discount does NOT apply to these products.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="included_category_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Include Categories</FormLabel>
              <FormControl>
                <MultiSelect
                  options={categories}
                  selected={field.value || []}
                  onSelectedChange={field.onChange}
                  placeholder="Select categories to include..."
                />
              </FormControl>
              <FormDescription>Discount applies only to products in these categories.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="excluded_category_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exclude Categories</FormLabel>
              <FormControl>
                <MultiSelect
                  options={categories}
                  selected={field.value || []}
                  onSelectedChange={field.onChange}
                  placeholder="Select categories to exclude..."
                />
              </FormControl>
              <FormDescription>Discount does NOT apply to products in these categories.</FormDescription>
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
            else router.push('/dashboard/marketing/coupons'); // Navigate back
          }}>Cancel</Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : (initialData ? "Save Changes" : "Create Discount")}
          </Button>
        </div>
      </form>
    </Form>
  );
}