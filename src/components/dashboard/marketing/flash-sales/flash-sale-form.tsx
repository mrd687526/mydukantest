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
import { createFlashSale, updateFlashSale } from "@/app/actions/flash-sales";
import { getProductsForSelection, getCategoriesForSelection } from "@/app/actions/products";
import { FlashSale } from "@/lib/types";
import { MultiSelect } from "@/components/ui/multi-select";

const flashSaleFormSchema = z.object({
  name: z.string().min(1, "Flash sale name is required."),
  start_date: z.string().datetime({ message: "Invalid start date format." }),
  end_date: z.string().datetime({ message: "Invalid end date format." }),
  discount_type: z.enum(['percentage', 'fixed_amount']),
  discount_value: z.coerce.number().min(0, "Discount value must be a non-negative number."),
  target_rules: z.object({
    included_product_ids: z.array(z.string().uuid()).optional().nullable(),
    excluded_product_ids: z.array(z.string().uuid()).optional().nullable(),
    included_category_ids: z.array(z.string()).optional().nullable(),
    excluded_category_ids: z.array(z.string()).optional().nullable(),
    min_purchase_amount: z.coerce.number().min(0).optional().nullable(),
  }).optional().nullable(),
  is_active: z.boolean(),
}).refine(data => new Date(data.end_date) > new Date(data.start_date), {
  message: "End date must be after start date.",
  path: ["end_date"],
});

type FlashSaleFormValues = z.infer<typeof flashSaleFormSchema>;

interface FlashSaleFormProps {
  initialData?: FlashSale | null;
  onSuccess?: () => void;
}

export function FlashSaleForm({ initialData, onSuccess }: FlashSaleFormProps) {
  const router = useRouter();
  const [products, setProducts] = useState<{ value: string; label: string }[]>([]);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);

  const defaultFormValues: FlashSaleFormValues = {
    name: initialData?.name || "",
    start_date: initialData?.start_date ? formatISO(new Date(initialData.start_date), { representation: 'complete' }) : formatISO(new Date(), { representation: 'complete' }),
    end_date: initialData?.end_date ? formatISO(new Date(initialData.end_date), { representation: 'complete' }) : formatISO(new Date(Date.now() + 24 * 60 * 60 * 1000), { representation: 'complete' }), // Default to 24 hours from now
    discount_type: initialData?.discount_type || "percentage",
    discount_value: initialData?.discount_value || 0,
    target_rules: initialData?.target_rules || {
      included_product_ids: [],
      excluded_product_ids: [],
      included_category_ids: [],
      excluded_category_ids: [],
      min_purchase_amount: null,
    },
    is_active: initialData?.is_active ?? true,
  };

  const form = useForm<FlashSaleFormValues>({
    resolver: zodResolver(flashSaleFormSchema),
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

  const onSubmit = async (data: FlashSaleFormValues) => {
    try {
      let result;
      if (initialData) {
        result = await updateFlashSale(initialData.id, data);
      } else {
        result = await createFlashSale(data);
      }

      if (result?.error) {
        toast.error(initialData ? "Failed to update flash sale" : "Failed to create flash sale", {
          description: typeof result.error === 'string' ? result.error : "An unknown error occurred.",
        });
      } else {
        toast.success(initialData ? "Flash sale updated successfully!" : "Flash sale created successfully!");
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/dashboard/marketing/flash-sales');
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sale Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Weekend Mega Sale" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date & Time</FormLabel>
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
                <FormLabel>End Date & Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="discount_type"
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
            name="discount_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Value</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="10.00" {...field} />
                </FormControl>
                <FormDescription>
                  {form.watch('discount_type') === 'percentage' ? 'e.g., 10 for 10%' : 'e.g., 5.00 for $5 off'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <h3 className="text-lg font-semibold mt-8">Targeting Rules (Optional)</h3>
        <p className="text-sm text-muted-foreground mb-4">Apply this flash sale only to specific products or categories.</p>

        <FormField
          control={form.control}
          name="target_rules.included_product_ids"
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
              <FormDescription>Sale applies only to these products.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="target_rules.excluded_product_ids"
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
              <FormDescription>Sale does NOT apply to these products.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="target_rules.included_category_ids"
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
              <FormDescription>Sale applies only to products in these categories.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="target_rules.excluded_category_ids"
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
              <FormDescription>Sale does NOT apply to products in these categories.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="target_rules.min_purchase_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Purchase Amount for Sale Items</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormDescription>Minimum total amount of targeted items required to apply the sale.</FormDescription>
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
                  Enable or disable this flash sale.
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
            if (onSuccess) onSuccess();
            else router.push('/dashboard/marketing/flash-sales');
          }}>Cancel</Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : (initialData ? "Save Changes" : "Create Flash Sale")}
          </Button>
        </div>
      </form>
    </Form>
  );
}